import { LayoutGrid, UserCircle, Shirt } from 'lucide-react'

export const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 w-full h-16 z-50 animate-slide-down border-b border-white/40 bg-white/60 backdrop-blur-2xl">
      <div className="w-full h-full flex items-center justify-between px-6">
        
        {/* Logo Section */}
        <div className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground p-2 rounded-xl shadow-sm">
                <Shirt size={20} strokeWidth={2.5} />
            </div>
            <span className="font-bold text-xl tracking-tight text-primary">Wardrobe</span>
        </div>

        {/* Menu Items */}
        <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary hover:bg-black/5 rounded-lg transition-all active:scale-95">
                <LayoutGrid size={18} />
                <span>대쉬보드</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary hover:bg-black/5 rounded-lg transition-all active:scale-95">
                <UserCircle size={18} />
                <span>마이페이지</span>
            </button>
        </div>

      </div>
    </nav>
  )
}
