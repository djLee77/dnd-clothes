import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Navbar } from '../components/ui/Navbar'
import { usePostStore } from '../store/postStore'
import { useAuthStore } from '../store/authStore'
import { ArrowLeft, Heart, MessageSquare, Share2, MoreHorizontal, ExternalLink, X, User as UserIcon } from 'lucide-react'

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
  const [commentText, setCommentText] = useState('')
  const [replyToId, setReplyToId] = useState<number | null>(null)
  const [replyToAuthor, setReplyToAuthor] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const commentInputRef = useRef<HTMLInputElement>(null)
  const { currentPost, currentPostScraps, currentComments, isLiked, isLoading, fetchPost, toggleLike, toggleCommentLike, addComment, error } = usePostStore()
  const { user } = useAuthStore()

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

  const handleLike = () => {
    if (currentPost) {
       toggleLike(currentPost.id)
    }
  }

  const handleCommentSubmit = async () => {
    if (!commentText.trim() || !currentPost || isSubmitting) return
    setIsSubmitting(true)
    try {
      await addComment(currentPost.id, commentText.trim(), replyToId)
      setCommentText('')
      setReplyToId(null)
      setReplyToAuthor(null)
    } catch (e) {
      console.error(e)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return
    if (e.key === 'Enter') {
      e.preventDefault()
      handleCommentSubmit()
    }
  }

  const parentComments = currentComments.filter((c: any) => !c.parent_id)
  const childComments = currentComments.filter((c: any) => c.parent_id)

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
            <div 
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => {
                if (currentPost.author_handle) navigate(`/profile/${currentPost.author_handle.replace('#', '')}`)
              }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-full flex items-center justify-center border border-gray-200 overflow-hidden">
                {currentPost.author_profile_image ? (
                  <img src={currentPost.author_profile_image} alt={currentPost.author} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-black text-violet-500">
                    {currentPost.author?.[0]?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-900 leading-tight">
                  {currentPost.author}
                  {currentPost.author_handle && <span className="ml-1.5 text-xs font-medium text-gray-400">{currentPost.author_handle}</span>}
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
               <button onClick={handleLike} className="transition-colors active:scale-95">
                 <Heart size={26} strokeWidth={isLiked ? 0 : 1.5} fill={isLiked ? '#f43f5e' : 'none'} className={isLiked ? 'text-rose-500' : 'hover:text-rose-500'} />
               </button>
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

        {/* Comments Section */}
        <div className="px-4 py-6">
           <h3 className="text-sm font-bold text-gray-900 mb-4">댓글 {currentPost.comments}개</h3>
           
           {replyToId && (
              <div className="flex items-center justify-between bg-gray-50 px-4 py-2 mb-2 rounded-lg text-sm text-gray-600 border border-gray-100">
                 <span><span className="font-bold text-gray-900">{replyToAuthor}</span>님에게 답글 남기는 중...</span>
                 <button onClick={() => { setReplyToId(null); setReplyToAuthor(null); }} className="p-1 hover:text-gray-900"><X size={14} /></button>
              </div>
           )}
           <div className="flex gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0 border border-gray-200 flex items-center justify-center overflow-hidden">
                {user?.profile_image ? (
                  <img src={user.profile_image} alt="my profile" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon size={14} className="text-gray-400" />
                )}
              </div>
              <div className="flex-1 flex items-center bg-gray-100 rounded-full px-4 border border-transparent focus-within:border-gray-300 transition-colors">
                 <input 
                   ref={commentInputRef}
                   type="text" 
                   value={commentText}
                   onChange={(e) => setCommentText(e.target.value)}
                   onKeyDown={handleKeyDown}
                   placeholder="댓글 달기..." 
                   className="w-full py-2 bg-transparent text-sm focus:outline-none" 
                 />
                 <button 
                   onClick={handleCommentSubmit}
                   disabled={!commentText.trim() || isSubmitting}
                   className="text-sm font-bold text-indigo-500 ml-2 whitespace-nowrap opacity-70 hover:opacity-100 transition-opacity disabled:opacity-50"
                 >
                   {isSubmitting ? '게시 중...' : '게시'}
                 </button>
              </div>
           </div>

           <div className="flex flex-col gap-4">
              {parentComments.map((comment: any) => (
                <div key={comment.id} className="flex flex-col gap-3">
                  <div className="flex gap-3">
                    <div 
                      className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => {
                        if (comment.author_handle) navigate(`/profile/${comment.author_handle.replace('#', '')}`)
                      }}
                    >
                      {comment.author_profile_image ? (
                        <img src={comment.author_profile_image} alt={comment.author} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] font-bold text-gray-400">
                          {comment.author?.[0]?.toUpperCase() || 'U'}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                        <div className="text-sm leading-tight text-gray-900">
                          <span 
                            className="font-bold mr-1 cursor-pointer hover:underline"
                            onClick={() => {
                              if (comment.author_handle) navigate(`/profile/${comment.author_handle.replace('#', '')}`)
                            }}
                          >
                            {comment.author}
                          </span>
                          {comment.author_handle && <span className="text-xs font-medium text-gray-400 mr-2">{comment.author_handle}</span>}
                          {!comment.author_handle && <span className="mr-2"></span>}
                          {comment.content}
                        </div>
                        <div className="flex gap-3 mt-1 text-xs text-gray-500 font-medium">
                          <span>{new Date(comment.created_at).toLocaleDateString('ko-KR')}</span>
                          <button onClick={() => { setReplyToId(comment.id); setReplyToAuthor(comment.author); commentInputRef.current?.focus(); }} className="font-bold text-gray-400 hover:text-gray-600">답글 달기</button>
                        </div>
                    </div>
                    <div className="flex flex-col items-center ml-2 mt-1">
                      <button onClick={() => toggleCommentLike(comment.id)} className="text-gray-300 hover:text-rose-500 active:scale-95 transition-transform">
                         <Heart size={14} fill={comment.isLiked ? '#f43f5e' : 'none'} className={comment.isLiked ? 'text-rose-500' : ''} />
                      </button>
                      {comment.likes > 0 && <span className="text-[10px] text-gray-400 font-bold mt-0.5">{comment.likes}</span>}
                    </div>
                  </div>

                  {/* Replies */}
                  {childComments.filter((c: any) => c.parent_id === comment.id).map((reply: any) => (
                    <div key={reply.id} className="flex gap-3 ml-11">
                      <div 
                        className="w-6 h-6 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => {
                          if (reply.author_handle) navigate(`/profile/${reply.author_handle.replace('#', '')}`)
                        }}
                      >
                        {reply.author_profile_image ? (
                          <img src={reply.author_profile_image} alt={reply.author} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] font-bold text-gray-400">
                            {reply.author?.[0]?.toUpperCase() || 'U'}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                          <div className="text-sm leading-tight text-gray-900">
                            <span 
                              className="font-bold mr-1 cursor-pointer hover:underline"
                              onClick={() => {
                                if (reply.author_handle) navigate(`/profile/${reply.author_handle.replace('#', '')}`)
                              }}
                            >
                              {reply.author}
                            </span>
                            {reply.author_handle && <span className="text-xs font-medium text-gray-400 mr-2">{reply.author_handle}</span>}
                            {!reply.author_handle && <span className="mr-2"></span>}
                            {reply.content}
                          </div>
                          <div className="flex gap-3 mt-1 text-xs text-gray-500 font-medium">
                            <span>{new Date(reply.created_at).toLocaleDateString('ko-KR')}</span>
                            <button onClick={() => { setReplyToId(comment.id); setReplyToAuthor(comment.author); commentInputRef.current?.focus(); }} className="font-bold text-gray-400 hover:text-gray-600">답글 달기</button>
                          </div>
                      </div>
                      <div className="flex flex-col items-center ml-2 mt-1">
                        <button onClick={() => toggleCommentLike(reply.id)} className="text-gray-300 hover:text-rose-500 active:scale-95 transition-transform">
                           <Heart size={14} fill={reply.isLiked ? '#f43f5e' : 'none'} className={reply.isLiked ? 'text-rose-500' : ''} />
                        </button>
                        {reply.likes > 0 && <span className="text-[10px] text-gray-400 font-bold mt-0.5">{reply.likes}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              {currentComments.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-6">가장 먼저 댓글을 남겨보세요!</p>
              )}
           </div>
        </div>
      </main>
    </div>
  )
}
