import { create } from 'zustand'

export type ToolType = 'select' | 'hand' | 'rect' | 'circle' | 'text'

interface UiState {
  activeTool: ToolType
  isSidebarOpen: boolean
  isExpanded: boolean
  assetLocation: 'sidebar' | 'bottom'
  transitionTo: 'sidebar' | 'bottom' | null
  selectedItemId: string | null
  stageRef: any | null
  setActiveTool: (tool: ToolType) => void
  toggleSidebar: () => void
  toggleExpanded: () => void
  setAssetLocation: (location: 'sidebar' | 'bottom') => void
  setTransitionTo: (to: 'sidebar' | 'bottom' | null) => void
  setSidebarOpen: (isOpen: boolean) => void
  setSelectedItemId: (id: string | null) => void
  setStageRef: (ref: any) => void
}

export const useUiStore = create<UiState>((set) => ({
  activeTool: 'select',
  isSidebarOpen: true,
  isExpanded: false,
  assetLocation: 'sidebar',
  transitionTo: null,
  selectedItemId: null,
  stageRef: null,
  setActiveTool: (tool) => set({ activeTool: tool }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  toggleExpanded: () => set((state) => ({ isExpanded: !state.isExpanded })),
  setAssetLocation: (location) => set((state) => ({ 
    assetLocation: location,
    isSidebarOpen: location === 'sidebar' ? true : state.isSidebarOpen
  })),
  setTransitionTo: (to) => set({ transitionTo: to }),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  setSelectedItemId: (id) => set({ selectedItemId: id }),
  setStageRef: (ref) => set({ stageRef: ref }),
}))
