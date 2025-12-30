import React from 'react'

import { BottomToolbar } from '../ui/BottomToolbar'
import { Sidebar } from '../ui/Sidebar'
import { useUiStore } from '../../store/uiStore'
import { PanelRightOpen } from 'lucide-react'
import { Navbar } from '../ui/Navbar'

interface MainLayoutProps {
  children: React.ReactNode
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isSidebarOpen, toggleSidebar } = useUiStore()

  return (
    <div className="w-screen h-screen flex overflow-hidden bg-white transition-colors duration-300">
      <Navbar />
      {/* Main Content Area */}
      <div className="flex-1 relative flex flex-col overflow-hidden">
        {/* Top Header Placeholder (optional) */}
        {/* <div className="h-14 bg-white border-b z-10"></div> */}

        {/* Canvas Area */}
        <div className="flex-1 relative overflow-hidden">
           {children}
        </div>



        {/* Contextual Bottom Toolbar (New) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
           <BottomToolbar />
        </div>
        
        {/* Sidebar Toggle Button (when sidebar is closed) */}
        {!isSidebarOpen && (
            <button 
                onClick={toggleSidebar}
                className="absolute top-4 right-4 bg-white p-2 rounded-lg shadow border border-gray-200 text-gray-600 hover:text-blue-600 z-20"
            >
                <PanelRightOpen size={20} />
            </button>
        )}
      </div>

      {/* Right Sidebar */}
      <Sidebar />
    </div>
  )
}
