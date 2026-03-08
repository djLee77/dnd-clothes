import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar } from '../components/ui/Navbar'
import { useAuthStore } from '../store/authStore'
import { usePostStore } from '../store/postStore'
import { Settings, Heart, MessageSquare, Trash2, LayoutGrid, Camera, X } from 'lucide-react'

export const MyPage = () => {
  const { user, updateUser, token, handleUnauthorized } = useAuthStore()
  const { posts, fetchPosts, deletePost } = usePostStore()
  const navigate = useNavigate()
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editUsername, setEditUsername] = useState('')
  const [editHandle, setEditHandle] = useState('')
  const [editBio, setEditBio] = useState('')
  const [editProfileImage, setEditProfileImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const openEditModal = () => {
    setEditUsername(user?.username || '')
    setEditHandle(user?.handle || '')
    setEditBio(user?.bio || '')
    setEditProfileImage(user?.profile_image || null)
    setIsEditModalOpen(true)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('이미지 파일은 5MB를 초과할 수 없습니다.')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setEditProfileImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = async () => {
    try {
      if (!editHandle.trim()) {
        alert('고유 아이디를 입력해주세요.')
        return
      }

      const API_URL = import.meta.env.VITE_API_URL || '/api'
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          username: editUsername,
          handle: editHandle.trim().startsWith('#') ? editHandle.trim() : `#${editHandle.trim()}`,
          bio: editBio,
          profile_image: editProfileImage
        })
      })

      if (response.status === 401 || response.status === 403) {
        handleUnauthorized()
        return
      }

      const responseData = await response.json()
      
      if (!response.ok) {
        throw new Error(responseData.error || '프로필 수정에 실패했습니다.')
      }

      updateUser(responseData.user)
      setIsEditModalOpen(false)
      alert('프로필이 성공적으로 변경되었습니다.')
    } catch (err: any) {
      alert(err.message)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const myPosts = posts.filter(p => p.user_id === user?.id)

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    if (confirm('이 게시글을 정말로 삭제하시겠습니까?')) {
      try {
        await deletePost(id)
        alert('게시글이 삭제되었습니다.')
      } catch (err) {
        // Error handled in store
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navbar />
      
      <main className="pt-24 pb-12 max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="px-4 sm:px-8 mb-12">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 sm:gap-16">
            <div className="w-24 h-24 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 border border-gray-200 shadow-sm flex items-center justify-center shrink-0 overflow-hidden relative">
               {user?.profile_image ? (
                 <img src={user.profile_image} alt="profile" className="w-full h-full object-cover" />
               ) : (
                 <span className="text-3xl sm:text-5xl font-black text-gray-300">
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                 </span>
               )}
            </div>
            
            <div className="flex-1 w-full text-center sm:text-left">
              <div className="flex justify-center sm:justify-start items-center gap-4 sm:gap-6 mb-4 sm:mb-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-semibold text-gray-900">{user?.username || 'user'}</h1>
                  {user?.handle && (
                     <span className="text-lg font-medium text-gray-400/80">{user.handle}</span>
                  )}
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <button onClick={openEditModal} className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 hover:text-black rounded-lg text-sm font-bold text-gray-900 transition-colors">프로필 편집</button>
                  <button className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 hover:text-black rounded-lg text-sm font-bold text-gray-900 transition-colors">쪽지함</button>
                  <button className="p-1.5 hover:text-gray-500 transition-colors"><Settings size={22} /></button>
                </div>
              </div>
              
              {/* Mobile action buttons */}
              <div className="flex sm:hidden justify-center items-center gap-2 mb-6">
                 <button onClick={openEditModal} className="flex-1 py-1.5 bg-gray-100 hover:bg-gray-200 hover:text-black rounded-lg text-sm font-bold text-gray-900 transition-colors">프로필 편집</button>
                 <button className="flex-1 py-1.5 bg-gray-100 hover:bg-gray-200 hover:text-black rounded-lg text-sm font-bold text-gray-900 transition-colors">쪽지함</button>
                 <button className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-900 transition-colors"><Settings size={18} /></button>
              </div>

              <div className="flex justify-center sm:justify-start items-center gap-8 mb-6">
                <div className="text-sm">
                  게시물 <span className="font-bold text-black">{myPosts.length}</span>
                </div>
                <div className="text-sm">
                  팔로워 <span className="font-bold text-black">0</span>
                </div>
                <div className="text-sm">
                  팔로우 <span className="font-bold text-black">0</span>
                </div>
              </div>
              
              <div className="text-sm text-gray-800 font-medium whitespace-pre-wrap">
                {user?.bio ? user.bio : (
                  <>스타일로 나를 표현하는 공간입니다.<br/>
                  나만의 코디 스크랩을 공유해보세요.</>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Feed Divider */}
        <div className="border-t border-gray-200">
          <div className="flex justify-center">
            <button className="flex items-center gap-2 border-t-[1.5px] border-black pt-4 px-2 -mt-[1px] text-[11px] font-bold tracking-widest text-black">
              <LayoutGrid size={12} strokeWidth={2.5} /> 게시물
            </button>
          </div>
        </div>

        {/* Posts Feed */}
        <div className="mt-8 px-1 sm:px-0">
          {myPosts.length > 0 ? (
            <div className="grid grid-cols-3 gap-1 sm:gap-4 lg:gap-8">
              {myPosts.map(post => (
                <div 
                  key={post.id} 
                  onClick={() => navigate(`/post/${post.id}`)}
                  className="relative group aspect-square bg-[#f8f8f8] cursor-pointer overflow-hidden rounded-sm sm:rounded-xl"
                >
                  {post.thumbnail ? (
                    <img src={post.thumbnail} className="w-full h-full object-cover transition-transform group-hover:scale-[1.03] duration-500 border border-gray-100 sm:border-transparent" alt="post" />
                  ) : (
                     <div className="w-full h-full bg-white flex items-center justify-center text-gray-300">
                        <span className="text-xs font-bold">No Image</span>
                     </div>
                  )}
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:bg-black/40 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                    <div className="flex items-center gap-4 sm:gap-6 text-white text-xs sm:text-base font-bold opacity-0 sm:opacity-100 sm:group-hover:opacity-100">
                       <div className="flex items-center gap-1.5"><Heart size={18} fill="currentColor" className="sm:w-5 sm:h-5 w-4 h-4" /> {post.likes}</div>
                       <div className="flex items-center gap-1.5"><MessageSquare size={18} fill="currentColor" className="sm:w-5 sm:h-5 w-4 h-4" /> {post.comments}</div>
                    </div>
                  </div>

                  {/* Actions (Delete) */}
                  <div className="absolute top-2 right-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 z-10">
                     <button 
                        onClick={(e) => handleDelete(e, post.id)}
                        className="p-1.5 sm:p-2.5 bg-white/90 hover:bg-red-500 hover:text-white text-gray-600 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-colors"
                        title="삭제"
                     >
                       <Trash2 size={16} className="sm:w-4 sm:h-4 w-3.5 h-3.5" />
                     </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center">
               <div className="w-16 h-16 rounded-full border border-black flex items-center justify-center text-black mb-4">
                  <LayoutGrid size={32} strokeWidth={1} />
               </div>
               <h3 className="text-2xl font-black text-gray-900 mb-2">게시물 없음</h3>
               <p className="text-sm text-gray-500">아직 게시물이 없습니다. 첫 번째 코디를 공유해보세요!</p>
            </div>
          )}
        </div>
      </main>

      {/* Profile Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">프로필 편집</h2>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center mb-6">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-violet-400 group overflow-hidden transition-all"
                >
                  {editProfileImage ? (
                    <>
                      <img src={editProfileImage} alt="preview" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <Camera size={24} className="text-gray-900" />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center text-gray-400 group-hover:text-violet-500">
                      <Camera size={24} className="mb-1" />
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleImageUpload} 
                  />
                </div>
                <button onClick={() => setEditProfileImage(null)} className="text-xs text-rose-500 font-bold mt-3 opacity-80 hover:opacity-100">현재 사진 삭제</button>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">이름</label>
                  <input 
                    type="text" 
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all font-medium placeholder-gray-400"
                    placeholder="사용자 이름"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">고유 아이디(Handle)</label>
                  <input 
                    type="text" 
                    value={editHandle.replace(/^#/, '')} // Remove # prefix when showing in input
                    onChange={(e) => setEditHandle(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all font-medium placeholder-gray-400"
                    placeholder="예: DJ77"
                  />
                  <p className="text-[11px] text-gray-400 mt-1 ml-1">영문, 숫자 등을 조합해 나만의 아이디를 만들어보세요.</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">소개</label>
                  <textarea 
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    rows={3}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all font-medium placeholder-gray-400 resize-none"
                    placeholder="자신을 표현할 수 있는 짧은 소개글을 적어주세요."
                  />
                </div>
              </div>

              <button 
                onClick={handleSaveProfile}
                className="w-full mt-8 bg-black hover:bg-gray-800 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98]"
              >
                저장하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
