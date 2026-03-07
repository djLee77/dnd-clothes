import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar } from '../components/ui/Navbar'
import { 
  Search, MessageSquare, Heart, Eye, Clock, TrendingUp, 
  Filter, ChevronDown, User, Sparkles, ArrowRight, Flame,
  BookOpen, Star
} from 'lucide-react'

import { usePostStore } from '../store/postStore'

type SortType = 'latest' | 'popular' | 'trending'

const CATEGORY_FILTERS = [
  { label: '전체', value: 'all', icon: BookOpen },
  { label: '트렌딩', value: 'trending', icon: Flame },
  { label: '인기', value: 'popular', icon: Star },
]

export const CommunityPage = () => {
  const navigate = useNavigate()
  const { posts, fetchPosts } = usePostStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortType>('latest')
  const [activeCategory, setActiveCategory] = useState('all')
  const [showSortDropdown, setShowSortDropdown] = useState(false)

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (hours < 1) return '방금 전'
    if (hours < 24) return `${hours}시간 전`
    if (days < 7) return `${days}일 전`
    return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
  }

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
    return num.toString()
  }

  const filteredPosts = posts
    .filter(post => {
      // Assuming posts with > 100 views are trending, just to have mock logic with real data
      if (activeCategory === 'trending') return post.views > 100
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'popular') return b.likes - a.likes
      if (sortBy === 'trending') return b.views - a.views
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
    .filter(post => {
      if (!searchQuery) return true
      return post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             post.tags.some(tag => tag.includes(searchQuery))
    })

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <Navbar />
      
      <main className="pt-20 sm:pt-24 pb-12 px-4 sm:px-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-10">
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-violet-200">
                <Sparkles size={16} className="text-white sm:hidden" />
                <Sparkles size={20} className="text-white hidden sm:block" />
              </div>
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-violet-500">Community</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-black tracking-tight mb-1 sm:mb-2">스타일 게시판</h1>
            <p className="text-sm sm:text-base text-gray-400 font-medium">다른 사람들의 코디를 구경하고, 나만의 스크랩을 공유해보세요.</p>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative group flex-1 sm:flex-none">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="게시글 검색..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 pr-6 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-black/5 focus:border-gray-200 transition-all w-full sm:w-64 shadow-sm"
              />
            </div>
            <button 
              onClick={() => navigate('/create-post')}
              className="flex items-center gap-2 px-3 sm:px-6 py-3 bg-black text-white rounded-2xl font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-gray-200 shrink-0"
            >
              <Sparkles size={18} />
              <span className="hidden sm:inline">새 글 작성</span>
            </button>
          </div>
        </div>

        {/* Category Tabs & Sort */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
            {CATEGORY_FILTERS.map(cat => {
              const Icon = cat.icon
              return (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold transition-all duration-300 whitespace-nowrap shrink-0 ${
                    activeCategory === cat.value
                      ? 'bg-black text-white shadow-lg shadow-gray-200 scale-105'
                      : 'bg-white text-gray-500 hover:text-black hover:bg-gray-50 border border-gray-100'
                  }`}
                >
                  <Icon size={14} className="sm:hidden" />
                  <Icon size={16} className="hidden sm:block" />
                  {cat.label}
                </button>
              )
            })}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              onBlur={() => setTimeout(() => setShowSortDropdown(false), 150)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-500 hover:text-black transition-all shadow-sm"
            >
              <Filter size={16} />
              {sortBy === 'latest' ? '최신순' : sortBy === 'popular' ? '인기순' : '조회순'}
              <ChevronDown size={14} className={`transition-transform duration-200 ${showSortDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showSortDropdown && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-100 overflow-hidden z-20 min-w-[140px] animate-in fade-in slide-in-from-top-2 duration-200">
                {[
                  { value: 'latest' as SortType, label: '최신순', icon: Clock },
                  { value: 'popular' as SortType, label: '인기순', icon: Heart },
                  { value: 'trending' as SortType, label: '조회순', icon: TrendingUp },
                ].map(option => {
                  const Icon = option.icon
                  return (
                    <button
                      key={option.value}
                      onClick={() => { setSortBy(option.value); setShowSortDropdown(false) }}
                      className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium hover:bg-gray-50 transition-colors ${
                        sortBy === option.value ? 'text-black font-bold bg-gray-50' : 'text-gray-500'
                      }`}
                    >
                      <Icon size={15} />
                      {option.label}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-4 animate-fade-in">
          {filteredPosts.map((post, index) => (
            <article 
              key={post.id}
              className="group relative bg-white rounded-[2rem] border border-gray-100/50 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden cursor-pointer"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              {/* Desktop Layout */}
              <div className="hidden sm:flex flex-row">
                {/* Thumbnail */}
                <div className="w-56 min-h-[180px] bg-gradient-to-br from-gray-50 to-gray-100/50 relative flex items-center justify-center shrink-0 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-50/50 via-transparent to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="relative z-10 w-16 h-16 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex items-center justify-center text-gray-200 group-hover:text-violet-500 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border border-gray-50 overflow-hidden">
                    {post.thumbnail ? (
                      <img src={post.thumbnail} alt="thumbnail" className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen size={28} strokeWidth={1.5} />
                    )}
                  </div>
                  {post.views > 100 && (
                    <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-rose-500 text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-lg">
                      <Flame size={12} />
                      Hot
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 p-8 flex flex-col justify-between">
                  <div>
                    {/* Tags */}
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      {post.tags.map(tag => (
                        <span 
                          key={tag} 
                          className="px-3 py-1 bg-gray-50 text-gray-400 text-[11px] font-bold rounded-full group-hover:bg-violet-50 group-hover:text-violet-500 transition-colors duration-300"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-extrabold text-gray-900 mb-2 group-hover:text-black transition-colors leading-tight">
                      {post.title}
                    </h2>
                    
                    {/* Preview */}
                    <p className="text-sm text-gray-400 leading-relaxed line-clamp-2 font-medium">
                      {post.content.slice(0, 150)}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-5 pt-5 border-t border-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                        <User size={14} className="text-gray-500" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-700">{post.author}</p>
                        <p className="text-[11px] text-gray-300 font-medium">{formatDate(post.created_at)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-gray-300 group-hover:text-rose-400 transition-colors duration-300">
                        <Heart size={15} />
                        <span className="text-xs font-bold">{formatNumber(post.likes)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-300 group-hover:text-blue-400 transition-colors duration-300">
                        <MessageSquare size={15} />
                        <span className="text-xs font-bold">{formatNumber(post.comments)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-300 group-hover:text-emerald-400 transition-colors duration-300">
                        <Eye size={15} />
                        <span className="text-xs font-bold">{formatNumber(post.views)}</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-black group-hover:text-white transition-all duration-500">
                        <ArrowRight size={14} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Feed Layout */}
              <div className="flex flex-col sm:hidden">
                {/* Header (Author) */}
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center overflow-hidden border border-gray-100">
                      <User size={16} className="text-gray-400" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-900 leading-tight">{post.author}</span>
                      <span className="text-[10px] text-gray-400 font-medium mt-0.5">{formatDate(post.created_at)}</span>
                    </div>
                  </div>
                  {post.views > 100 && (
                    <div className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-orange-50 to-rose-50 text-rose-500 rounded-full">
                      <Flame size={10} />
                      <span className="text-[9px] font-black uppercase tracking-wider">Hot</span>
                    </div>
                  )}
                </div>

                {/* Feed Image (Thumbnail) */}
                <div className="w-full aspect-[4/5] bg-gradient-to-br from-gray-50 to-gray-100 relative flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-50/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="relative z-10 w-16 h-16 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex items-center justify-center text-gray-300 group-hover:text-violet-500 group-hover:scale-110 transition-all duration-500 border border-gray-100 overflow-hidden">
                    {post.thumbnail ? (
                      <img src={post.thumbnail} alt="thumbnail" className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen size={28} strokeWidth={1.5} />
                    )}
                  </div>
                </div>

                {/* Feed Actions */}
                <div className="px-5 pt-5 pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-gray-800">
                    <div className="flex items-center gap-1.5 group/btn">
                      <Heart size={22} className="group-hover/btn:text-rose-500 transition-colors duration-300 hover:scale-110 active:scale-90" strokeWidth={1.5} />
                      <span className="text-sm font-extrabold">{formatNumber(post.likes)}</span>
                    </div>
                    <div className="ml-2 flex items-center gap-1.5 group/btn">
                      <MessageSquare size={22} className="group-hover/btn:text-blue-500 transition-colors duration-300 hover:scale-110 active:scale-90" strokeWidth={1.5} />
                      <span className="text-sm font-extrabold">{formatNumber(post.comments)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <Eye size={18} strokeWidth={1.5} />
                    <span className="text-sm font-bold">{formatNumber(post.views)}</span>
                  </div>
                </div>

                {/* Content (Title, Description, Tags) */}
                <div className="px-5 pb-6 flex flex-col gap-2">
                  <h2 className="text-[15px] font-extrabold text-gray-900 leading-tight">
                    {post.title}
                  </h2>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed font-medium">
                    <span className="font-bold text-gray-800 mr-2">{post.author}</span>
                    {post.content.slice(0, 150)}
                  </p>
                  <div className="flex items-center gap-1.5 flex-wrap mt-2">
                    {post.tags.map(tag => (
                      <span 
                        key={tag} 
                        className="text-[11px] font-bold text-violet-500 hover:text-violet-600 transition-colors"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Coming Soon Notice */}
        <div className="mt-10 sm:mt-16 text-center">
          <div className="inline-flex flex-col items-center gap-3 sm:gap-4 px-8 sm:px-12 py-8 sm:py-10 bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-xl sm:rounded-2xl flex items-center justify-center">
              <Sparkles size={22} className="text-violet-500 sm:hidden" />
              <Sparkles size={28} className="text-violet-500 hidden sm:block" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-gray-900 mb-1">더 많은 기능이 준비 중이에요!</h3>
              <p className="text-xs sm:text-sm text-gray-400 font-medium">곧 스크랩을 게시하고 공유할 수 있게 됩니다.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
