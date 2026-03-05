import { Monitor, MessageSquare, ArrowRight, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

/**
 * Shown on mobile when user tries to access desktop-only features
 * (Canvas editor, Dashboard, etc.)
 * Guides them to the Community page instead.
 */
export const MobileDesktopOnly = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm text-center">
        {/* Icon */}
        <div className="relative inline-flex mb-8">
          <div className="w-20 h-20 bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex items-center justify-center border border-gray-100">
            <Monitor size={36} className="text-gray-300" strokeWidth={1.5} />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-200">
            <Sparkles size={14} className="text-white" />
          </div>
        </div>

        {/* Text */}
        <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-3">
          데스크톱에서 이용해주세요
        </h1>
        <p className="text-sm text-gray-400 font-medium leading-relaxed mb-8">
          코디 보드 편집과 스크랩 관리는<br />
          넓은 화면에서 더 편리하게 사용할 수 있어요.
        </p>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">or</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        {/* CTA to Community */}
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-black text-white rounded-2xl font-bold text-base hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-gray-200 group mb-4"
        >
          <MessageSquare size={20} />
          <span>스타일 게시판 둘러보기</span>
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>

        <p className="text-xs text-gray-300 font-medium">
          모바일에서는 게시판을 통해 코디를 공유하고 구경할 수 있어요!
        </p>
      </div>
    </div>
  )
}
