import React from 'react'

import { BottomToolbar } from '../ui/BottomToolbar'
import { Sidebar } from '../ui/Sidebar'
import { useUiStore } from '../../store/uiStore'
import { PanelRightOpen } from 'lucide-react'
import { Navbar } from '../ui/Navbar'
import { BottomAssetBar } from '../ui/BottomAssetBar'

interface MainLayoutProps {
  children: React.ReactNode
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isSidebarOpen, toggleSidebar, assetLocation } = useUiStore()

  return (
    <div className="w-screen h-screen flex overflow-hidden bg-[#f8f9fc] transition-colors duration-300 relative">
      {/* Fun Background Elements (Subtle) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-gray-400/10 rounded-full blur-[80px] animate-float-slow"></div>
          <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-black/5 rounded-full blur-[80px] animate-float-reverse"></div>
          <div className="absolute top-[30%] right-[10%] w-[20%] h-[20%] bg-gray-600/5 rounded-full blur-[60px] animate-pulse"></div>
      </div>

      <Navbar />
      {/* Main Content Area */}
      <div className="flex-1 relative flex flex-col overflow-hidden pt-16">
        {/* Top Header Placeholder (optional) */}
        {/* <div className="h-14 bg-white border-b z-10"></div> */}

        {/* Canvas Area */}
        <div className="flex-1 relative overflow-hidden">
           {children}
        </div>



        {/* Contextual Toolbar (Moves to top when bottom asset bar is active) */}
        <div className={`absolute left-1/2 -translate-x-1/2 z-30 transition-all duration-500 ${assetLocation === 'bottom' ? 'top-20' : 'bottom-6'}`}>
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

      {/* Bottom Asset Bar (Conditionally rendered inside) */}
      <BottomAssetBar />

      {/* Right Sidebar */}
      <Sidebar />
    </div>
  )
}
