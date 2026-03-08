import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Navbar } from '../components/ui/Navbar'
import { usePostStore } from '../store/postStore'
import { Heart, MessageSquare, LayoutGrid } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { FollowListModal } from '../components/ui/FollowListModal'

export const UserProfilePage = () => {
  const { handle } = useParams()
  const navigate = useNavigate()
  const { posts, fetchPosts } = usePostStore()
  const { user: currentUser, token } = useAuthStore()
  const [profileUser, setProfileUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isFollowListOpen, setIsFollowListOpen] = useState(false)
  const [followListType, setFollowListType] = useState<'followers' | 'following'>('followers')

  useEffect(() => {
    fetchPosts()
    if (handle) {
      if (currentUser?.handle === `#${handle}`) {
        navigate('/mypage', { replace: true })
        return
      }

      const fetchProfile = async () => {
        try {
          const API_URL = import.meta.env.VITE_API_URL || '/api'
          const res = await fetch(`${API_URL}/users/${handle}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          })
          if (res.ok) {
            const data = await res.json()
            setProfileUser(data)
          } else {
            setProfileUser(null)
          }
        } catch (e) {
          console.error(e)
          setProfileUser(null)
        } finally {
          setLoading(false)
        }
      }
      fetchProfile()
    }
  }, [handle, fetchPosts, currentUser?.handle, token, navigate])

  const toggleFollow = async () => {
    if (!currentUser || !profileUser) {
      alert('로그인이 필요한 기능입니다.');
      return navigate('/login');
    }
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api';
      const res = await fetch(`${API_URL}/users/${handle}/follow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setProfileUser((prev: any) => ({
          ...prev,
          isFollowing: data.isFollowing,
          followers_count: data.isFollowing ? prev.followers_count + 1 : prev.followers_count - 1
        }));
      }
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa]">
        <Navbar />
        <div className="pt-24 flex justify-center items-center h-40">
          <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-[#fafafa]">
        <Navbar />
        <div className="pt-24 text-center font-bold text-gray-500">
          존재하지 않는 사용자입니다.
        </div>
      </div>
    )
  }

  const userPosts = posts.filter(p => p.user_id === profileUser.id)

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navbar />
      
      <main className="pt-24 pb-12 max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="px-4 sm:px-8 mb-12">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 sm:gap-16">
            <div className="w-24 h-24 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 border border-gray-200 shadow-sm flex items-center justify-center shrink-0 overflow-hidden relative">
               {profileUser.profile_image ? (
                 <img src={profileUser.profile_image} alt="profile" className="w-full h-full object-cover" />
               ) : (
                 <span className="text-3xl sm:text-5xl font-black text-gray-300">
                    {profileUser.username?.[0]?.toUpperCase() || 'U'}
                 </span>
               )}
            </div>
            
            <div className="flex-1 w-full text-center sm:text-left">
              <div className="flex justify-center sm:justify-start items-center gap-4 sm:gap-6 mb-4 sm:mb-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-semibold text-gray-900">{profileUser.username || 'user'}</h1>
                  {profileUser.handle && (
                     <span className="text-lg font-medium text-gray-400/80">{profileUser.handle}</span>
                  )}
                </div>
                {currentUser && currentUser.handle !== profileUser.handle && (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={toggleFollow}
                      className={`px-6 py-1.5 rounded-lg text-sm font-bold transition-all ${
                        profileUser.isFollowing
                          ? 'bg-gray-100 text-gray-900 hover:bg-rose-50 hover:text-rose-500'
                          : 'bg-violet-500 text-white hover:bg-violet-600 shadow-md shadow-violet-200'
                      }`}
                    >
                      {profileUser.isFollowing ? '언팔로우' : '팔로우'}
                    </button>
                    <button className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 hover:text-black rounded-lg text-sm font-bold text-gray-900 transition-colors">쪽지</button>
                  </div>
                )}
              </div>

              <div className="flex justify-center sm:justify-start items-center gap-8 mb-6">
                <div className="text-sm">
                  게시물 <span className="font-bold text-black">{userPosts.length}</span>
                </div>
                <div 
                  className="text-sm cursor-pointer hover:opacity-70 transition-opacity"
                  onClick={() => {
                    setFollowListType('followers')
                    setIsFollowListOpen(true)
                  }}
                >
                  팔로워 <span className="font-bold text-black">{profileUser.followers_count || 0}</span>
                </div>
                <div 
                  className="text-sm cursor-pointer hover:opacity-70 transition-opacity"
                  onClick={() => {
                    setFollowListType('following')
                    setIsFollowListOpen(true)
                  }}
                >
                  팔로우 <span className="font-bold text-black">{profileUser.following_count || 0}</span>
                </div>
              </div>
              
              <div className="text-sm text-gray-800 font-medium whitespace-pre-wrap">
                {profileUser.bio ? profileUser.bio : (
                  <span className="text-gray-400">등록된 소개글이 없습니다.</span>
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
          {userPosts.length > 0 ? (
            <div className="grid grid-cols-3 gap-1 sm:gap-4 lg:gap-8">
              {userPosts.map(post => (
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
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center">
               <div className="w-16 h-16 rounded-full border border-black flex items-center justify-center text-black mb-4">
                  <LayoutGrid size={32} strokeWidth={1} />
               </div>
               <h3 className="text-2xl font-black text-gray-900 mb-2">게시물 없음</h3>
               <p className="text-sm text-gray-500">작성된 게시물이 없습니다.</p>
            </div>
          )}
        </div>
      </main>

      {profileUser?.handle && (
        <FollowListModal
          isOpen={isFollowListOpen}
          onClose={() => setIsFollowListOpen(false)}
          type={followListType}
          handle={profileUser.handle}
        />
      )}
    </div>
  )
}
