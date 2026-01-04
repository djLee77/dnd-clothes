import { LayoutGrid, UserCircle, Shirt } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export const Navbar = () => {
  const navigate = useNavigate()
  return (
    <nav className="fixed top-0 left-0 w-full h-16 z-50 animate-slide-down border-b border-white/20 bg-white/70 backdrop-blur-md">
      <div className="w-full h-full flex items-center justify-between px-6">
        
        {/* Logo Section */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="bg-black text-white p-2 rounded-xl shadow-lg shadow-gray-200 group-hover:scale-105 transition-transform duration-300">
                <Shirt size={20} strokeWidth={2.5} />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-black">Wardrobe</span>
        </div>

        {/* Menu Items */}
        <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-500 hover:text-black hover:bg-gray-100 rounded-xl transition-all active:scale-95 group">
                <LayoutGrid size={18} className="group-hover:text-black transition-colors" />
                <span>대쉬보드</span>
            </button>
            <button 
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-500 hover:text-black hover:bg-gray-100 rounded-xl transition-all active:scale-95 group"
            >
                <UserCircle size={18} className="group-hover:text-black transition-colors" />
                <span>마이페이지</span>
            </button>
        </div>

      </div>
    </nav>
  )
}
