import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Navbar } from '../components/ui/Navbar'
import { usePostStore } from '../store/postStore'
import { ArrowLeft, Heart, MessageSquare, Share2, MoreHorizontal, ExternalLink } from 'lucide-react'

// Helper to extract and format numbers from price strings (e.g. "1,000원", "10000", "가격미정")
const extractPriceSum = (items: any[]) => {
  let sum = 0
  items.forEach(item => {
    if (item.price) {
      const numStr = String(item.price).replace(/[^0-9]/g, '')
      if (numStr) {
        sum += parseInt(numStr, 10)
      }
    }
  })
  return sum
}

export const PostDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentPost, currentPostScraps, isLoading, fetchPost, error } = usePostStore()

  useEffect(() => {
    if (id) {
      fetchPost(parseInt(id, 10))
    }
  }, [id, fetchPost])

  if (isLoading || !currentPost) {
    return (
      <div className="min-h-screen bg-[#fafafa]">
        <Navbar />
        <div className="pt-24 flex justify-center items-center h-40">
          <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#fafafa]">
        <Navbar />
        <div className="pt-24 flex justify-center text-red-500 font-bold">
          {error}
        </div>
      </div>
    )
  }

  // Extract all items from all scraps
  let allItems: any[] = []
  currentPostScraps.forEach(scrap => {
    try {
      const parsedItems = JSON.parse(scrap.data || '[]')
      // Only get items that are images and likely have info
      const clothingItems = parsedItems.filter((item: any) => item.type === 'image' && item.src)
      allItems = [...allItems, ...clothingItems]
    } catch (e) {
      console.error(e)
    }
  })

  // Deduplicate items
  const uniqueItemsMap = new Map()
  allItems.forEach(item => {
    if (item.originalSrc || item.src) {
        // Just use src as unique key to prevent duplicate list
        uniqueItemsMap.set(item.originalSrc || item.src, item)
    }
  })
  const uniqueItems = Array.from(uniqueItemsMap.values())
  const totalPrice = extractPriceSum(uniqueItems)

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navbar />

      <main className="pt-16 sm:pt-24 pb-20 max-w-2xl mx-auto bg-white min-h-screen border-x border-gray-100/50 shadow-sm">
        {/* Header - Instagram/X style */}
        <div className="sticky top-14 sm:top-[72px] bg-white/80 backdrop-blur-lg z-30 border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="p-1 -ml-1 text-gray-800 hover:text-black transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-[17px] font-bold text-gray-900">게시물</h1>
          </div>
        </div>

        {/* Post Author Info */}
        <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-full flex items-center justify-center border border-gray-200 overflow-hidden">
                <span className="text-sm font-black text-violet-500">
                  {currentPost.author?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-900 leading-tight">
                  {currentPost.author}
                </span>
                <span className="text-xs text-gray-500">
                   {new Date(currentPost.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric'})}
                </span>
              </div>
            </div>
            <button className="p-2 text-gray-400 hover:text-black transition-colors">
              <MoreHorizontal size={20} />
            </button>
        </div>

        {/* Post Image (The main scrap thumbnail) */}
        {currentPost.thumbnail ? (
           <div className="w-full bg-gray-50 flex items-center justify-center">
             <img src={currentPost.thumbnail} alt={currentPost.title} className="w-full object-contain max-h-[600px] border-y border-gray-100" />
           </div>
        ) : (
             <div className="w-full aspect-[4/5] bg-gray-50 flex items-center justify-center border-y border-gray-100">
                <span className="text-gray-400 font-bold">No Image</span>
             </div>
        )}

        {/* Action Bar (Like, Comment, Share) */}
        <div className="px-4 py-3 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-gray-800">
               <button className="hover:text-rose-500 transition-colors"><Heart size={26} strokeWidth={1.5} /></button>
               <button className="hover:text-blue-500 transition-colors"><MessageSquare size={26} strokeWidth={1.5} /></button>
               <button className="hover:text-gray-500 transition-colors"><Share2 size={24} strokeWidth={1.5} /></button>
            </div>
            <div className="text-sm font-bold text-gray-900">
              조회 {currentPost.views}회
            </div>
          </div>
          <div className="text-sm font-bold text-gray-900">
             좋아요 {currentPost.likes}개
          </div>
        </div>

        {/* Content Section */}
        <div className="px-4 pb-6 border-b border-gray-100">
            <h2 className="text-[15px] font-extrabold text-gray-900 mb-1 leading-tight">
               <span className="mr-2">{currentPost.author}</span>
               {currentPost.title}
            </h2>
            <div className="text-[14px] text-gray-800 whitespace-pre-wrap leading-relaxed mt-2" dangerouslySetInnerHTML={{ __html: currentPost.content }} />
            
            {/* Tags */}
            {currentPost.tags && currentPost.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mt-3">
                 {currentPost.tags.map(tag => (
                   <span key={tag} className="text-sm text-indigo-500 hover:text-indigo-600 cursor-pointer transition-colors">
                     #{tag}
                   </span>
                 ))}
              </div>
            )}
        </div>

        {/* Item Information Section */}
        {uniqueItems.length > 0 && (
          <div className="py-6 border-b border-gray-100 bg-gray-50/50">
             <div className="px-4 flex items-center justify-between mb-4">
               <div>
                  <h3 className="text-base font-bold text-gray-900">아이템 정보</h3>
                  <p className="text-xs text-gray-500 mt-0.5">이 코디에 사용된 아이템 리스트입니다.</p>
               </div>
               <div className="text-right">
                  <span className="text-xs font-bold text-gray-500 block mb-0.5">총 합계</span>
                  <span className="text-lg font-black text-rose-500">
                     {totalPrice.toLocaleString()}원
                  </span>
               </div>
             </div>

             <div className="flex overflow-x-auto gap-3 px-4 pb-4 scrollbar-hide">
                {uniqueItems.map((item, index) => (
                  <div key={index} className="w-[140px] shrink-0 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col">
                     <div className="aspect-square bg-gray-50 p-3 flex items-center justify-center">
                        <img src={item.src} className="max-w-full max-h-full object-contain mix-blend-multiply" alt="item" />
                     </div>
                     <div className="p-3 flex-1 flex flex-col">
                        <span className="text-xs font-bold text-gray-900 leading-tight mb-1 line-clamp-2">
                           {item.name || '이름 없는 아이템'}
                        </span>
                        <div className="mt-auto pt-2 flex items-end justify-between">
                           <span className="text-[13px] font-black text-black">
                              {item.price ? item.price : '-'}
                           </span>
                           {item.siteUrl && (
                             <a href={item.siteUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors">
                               <ExternalLink size={12} />
                             </a>
                           )}
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* Comments Dummy Section */}
        <div className="px-4 py-6">
           <h3 className="text-sm font-bold text-gray-900 mb-4">댓글 {currentPost.comments}개</h3>
           
           <div className="flex gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
              <div className="flex-1 flex items-center bg-gray-100 rounded-full px-4 border border-transparent focus-within:border-gray-300 transition-colors">
                 <input type="text" placeholder="댓글 달기..." className="w-full py-2 bg-transparent text-sm focus:outline-none" />
                 <button className="text-sm font-bold text-indigo-500 ml-2 whitespace-nowrap opacity-70 hover:opacity-100 transition-opacity">게시</button>
              </div>
           </div>

           <div className="flex flex-col gap-4">
              <div className="flex gap-3">
                 <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-100 to-rose-100 border border-gray-200 flex items-center justify-center shrink-0">
                   <span className="text-[10px] font-bold text-gray-400">P</span>
                 </div>
                 <div className="flex-1">
                    <div className="text-sm leading-tight text-gray-900">
                       <span className="font-bold mr-2">polo_lover</span>
                       코디 너무 멋져요! 아이템 조합이 최고네요 🔥
                    </div>
                    <div className="flex gap-3 mt-1 text-xs text-gray-500 font-medium">
                       <span>1시간 전</span>
                       <button className="font-bold text-gray-400 hover:text-gray-600">답글 달기</button>
                    </div>
                 </div>
                 <button className="text-gray-300 hover:text-rose-500 self-start mt-0.5"><Heart size={14} /></button>
              </div>
           </div>
        </div>
      </main>
    </div>
  )
}
