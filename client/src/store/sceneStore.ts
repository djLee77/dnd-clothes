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
  scaleX?: number
  scaleY?: number
  src?: string
  originalSrc?: string
  name?: string
  price?: string
  siteUrl?: string
}

interface SceneState {
  items: CanvasItem[]
  addItem: (item: Omit<CanvasItem, 'id'>) => void
  updateItem: (id: string, attrs: Partial<CanvasItem>) => void
  removeItem: (id: string) => void
  bringToFront: (id: string) => void
  sendToBack: (id: string) => void
  moveForward: (id: string) => void
  moveBackward: (id: string) => void
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
  bringToFront: (id) =>
    set((state) => {
      const item = state.items.find((i) => i.id === id)
      if (!item) return state
      const otherItems = state.items.filter((i) => i.id !== id)
      return { items: [...otherItems, item] }
    }),
  sendToBack: (id) =>
    set((state) => {
      const item = state.items.find((i) => i.id === id)
      if (!item) return state
      const otherItems = state.items.filter((i) => i.id !== id)
      return { items: [item, ...otherItems] }
    }),
  moveForward: (id) =>
    set((state) => {
      const index = state.items.findIndex((i) => i.id === id)
      if (index === -1 || index === state.items.length - 1) return state
      const newItems = [...state.items]
      ;[newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]]
      return { items: newItems }
    }),
  moveBackward: (id) =>
    set((state) => {
      const index = state.items.findIndex((i) => i.id === id)
      if (index === -1 || index === 0) return state
      const newItems = [...state.items]
      ;[newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]]
      return { items: newItems }
    }),
}))
