import { create } from 'zustand'

export type ToolType = 'select' | 'hand' | 'rect' | 'circle' | 'text'

interface UiState {
  activeTool: ToolType
  isSidebarOpen: boolean
  setActiveTool: (tool: ToolType) => void
  toggleSidebar: () => void
  setSidebarOpen: (isOpen: boolean) => void
}

export const useUiStore = create<UiState>((set) => ({
  activeTool: 'select',
  isSidebarOpen: true,
  setActiveTool: (tool) => set({ activeTool: tool }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
}))
