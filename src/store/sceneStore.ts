import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'

export interface CanvasItem {
  id: string
  type: 'rect' | 'circle' | 'image'
  x: number
  y: number
  width: number
  height: number
  fill: string
  rotation: number
  src?: string
  name?: string
  price?: string
  siteUrl?: string
}

interface SceneState {
  items: CanvasItem[]
  addItem: (item: Omit<CanvasItem, 'id'>) => void
  updateItem: (id: string, attrs: Partial<CanvasItem>) => void
  removeItem: (id: string) => void
}

export const useSceneStore = create<SceneState>((set) => ({
  items: [],
  addItem: (item) =>
    set((state) => ({
      items: [...state.items, { ...item, id: uuidv4() }],
    })),
  updateItem: (id, attrs) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, ...attrs } : item
      ),
    })),
  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),
}))
