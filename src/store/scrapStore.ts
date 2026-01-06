import { create } from 'zustand';
import { useAuthStore } from './authStore';
import { useSceneStore } from './sceneStore';

export interface Scrap {
  id: number;
  name: string;
  created_at: string;
}

interface ScrapState {
  scraps: Scrap[];
  isLoading: boolean;
  error: string | null;
  fetchScraps: () => Promise<void>;
  saveCurrentScrap: (name: string) => Promise<void>;
  loadScrap: (id: number) => Promise<void>;
  deleteScrap: (id: number) => Promise<void>;
}

export const useScrapStore = create<ScrapState>((set, get) => ({
  scraps: [],
  isLoading: false,
  error: null,

  fetchScraps: async () => {
    const { token } = useAuthStore.getState();
    if (!token) return;

    set({ isLoading: true, error: null });
    try {
      const response = await fetch('http://localhost:5000/api/scraps', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('스크랩 목록을 가져오지 못했습니다.');
      const data = await response.json();
      set({ scraps: data });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  saveCurrentScrap: async (name: string) => {
    const { token } = useAuthStore.getState();
    const { items } = useSceneStore.getState();
    if (!token) return;

    set({ isLoading: true, error: null });
    try {
      const response = await fetch('http://localhost:5000/api/scraps', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ name, data: items })
      });
      if (!response.ok) throw new Error('스크랩 저장에 실패했습니다.');
      await get().fetchScraps();
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  loadScrap: async (id: number) => {
    const { token } = useAuthStore.getState();
    if (!token) return;

    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`http://localhost:5000/api/scraps/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('스크랩을 불러오지 못했습니다.');
      const scrap = await response.json();
      
      const parsedData = JSON.parse(scrap.data);
      // Clear current items and load new ones
      useSceneStore.setState({ items: parsedData });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteScrap: async (id: number) => {
    const { token } = useAuthStore.getState();
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:5000/api/scraps/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('스크랩 삭제에 실패했습니다.');
      await get().fetchScraps();
    } catch (err: any) {
      set({ error: err.message });
    }
  }
}));
