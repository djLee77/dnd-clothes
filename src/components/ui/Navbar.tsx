import { Sparkles, LayoutGrid, Users, ShoppingBag, Share2, UserCircle } from 'lucide-react'

export const Navbar = () => {
  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
      <div className="flex items-center gap-1 p-1 bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-white/20 ring-1 ring-black/5 pr-2">
        
        {/* Logo Section */}
        <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full mr-2">
            <Sparkles size={18} className="text-yellow-300" />
            <span className="font-semibold text-sm tracking-wide">Antigravity</span>
        </div>

        {/* Menu Items */}
        <div className="hidden md:flex items-center gap-1">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary hover:bg-black/5 rounded-full transition-all active:scale-95">
                <LayoutGrid size={16} />
                <span>Projects</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary hover:bg-black/5 rounded-full transition-all active:scale-95">
                <Users size={16} />
                <span>Community</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary hover:bg-black/5 rounded-full transition-all active:scale-95">
                <ShoppingBag size={16} />
                <span>Store</span>
            </button>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200 mx-2 hidden md:block" />

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
            <button 
                className="p-2.5 text-gray-600 hover:text-primary hover:bg-black/5 rounded-full transition-all active:scale-95"
                title="Share"
            >
                <Share2 size={18} />
            </button>
            <button 
                className="p-2.5 text-gray-600 hover:text-primary hover:bg-black/5 rounded-full transition-all active:scale-95"
                title="Profile"
            >
                <UserCircle size={18} />
            </button>
        </div>

      </div>
    </nav>
  )
}
