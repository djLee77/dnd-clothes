import { create } from 'zustand'

export type ToolType = 'select' | 'hand' | 'rect' | 'circle' | 'text'

interface UiState {
  activeTool: ToolType
  isSidebarOpen: boolean
  selectedItemId: string | null
  setActiveTool: (tool: ToolType) => void
  toggleSidebar: () => void
  setSidebarOpen: (isOpen: boolean) => void
  setSelectedItemId: (id: string | null) => void
}

export const useUiStore = create<UiState>((set) => ({
  activeTool: 'select',
  isSidebarOpen: true,
  selectedItemId: null,
  setActiveTool: (tool) => set({ activeTool: tool }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  setSelectedItemId: (id) => set({ selectedItemId: id }),
}))
