import { LayoutGrid, UserCircle, Shirt } from 'lucide-react'

export const Navbar = () => {
  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
      <div className="flex items-center gap-1 p-1 bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-white/20 ring-1 ring-black/5 pr-2">
        
        {/* Logo Section */}
        <div className="flex items-center gap-2 pl-3 pr-2 mr-2">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-full shadow-sm">
                <Shirt size={18} strokeWidth={2.5} />
            </div>
            <span className="font-bold text-lg tracking-tight text-primary">Wardrobe</span>
        </div>

        {/* Menu Items */}
        <div className="flex items-center gap-1">
            <button className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-primary hover:bg-black/5 rounded-full transition-all active:scale-95">
                <LayoutGrid size={18} />
                <span>대쉬보드</span>
            </button>
            <button className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-primary hover:bg-black/5 rounded-full transition-all active:scale-95">
                <UserCircle size={18} />
                <span>마이페이지(로그인)</span>
            </button>
        </div>

      </div>
    </nav>
  )
}
