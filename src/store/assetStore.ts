import { create } from 'zustand';
import { useAuthStore } from './authStore';

export interface Category {
  id: number;
  name: string;
}

export interface Asset {
  id: number;
  src: string;
  categoryId: number;
  name: string;
  price: string;
  siteUrl: string;
}

interface AssetState {
  categories: Category[];
  assets: Asset[];
  isLoading: boolean;
  error: string | null;
  fetchData: () => Promise<void>;
  addCategory: (name: string) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  addAsset: (asset: Omit<Asset, 'id'>) => Promise<void>;
  deleteAsset: (id: number) => Promise<void>;
}

export const useAssetStore = create<AssetState>((set, get) => ({
  categories: [],
  assets: [],
  isLoading: false,
  error: null,

  fetchData: async () => {
    const { token } = useAuthStore.getState();
    if (!token) return;

    set({ isLoading: true, error: null });
    try {
      const [catRes, assetRes] = await Promise.all([
        fetch('/api/categories', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/assets', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (!catRes.ok || !assetRes.ok) throw new Error('데이터를 가져오지 못했습니다.');

      const categories = await catRes.json();
      const assets = await assetRes.json();

      set({ categories, assets });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  addCategory: async (name: string) => {
    const { token } = useAuthStore.getState();
    if (!token) return;

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ name })
      });
      if (!response.ok) throw new Error('카테고리 추가에 실패했습니다.');
      await get().fetchData();
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  deleteCategory: async (id: number) => {
    const { token } = useAuthStore.getState();
    if (!token) return;

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('카테고리 삭제에 실패했습니다.');
      await get().fetchData();
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  addAsset: async (asset: Omit<Asset, 'id'>) => {
    const { token } = useAuthStore.getState();
    if (!token) return;

    try {
      const response = await fetch('/api/assets', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(asset)
      });
      if (!response.ok) throw new Error('에셋 추가에 실패했습니다.');
      await get().fetchData();
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  deleteAsset: async (id: number) => {
    const { token } = useAuthStore.getState();
    if (!token) return;

    try {
      const response = await fetch(`/api/assets/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('에셋 삭제에 실패했습니다.');
      await get().fetchData();
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  }
}));
