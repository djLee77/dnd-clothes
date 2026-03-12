import { create } from 'zustand'
import { useAuthStore, checkAuthResponse } from './authStore'

const API_URL = import.meta.env.VITE_API_URL || '/api'

export interface Post {
  id: number
  user_id: number
  author: string
  author_profile_image?: string | null
  author_handle?: string | null
  title: string
  content: string
  tags: string[]
  thumbnail: string | null
  scrap_ids: number[]
  views: number
  likes: number
  comments: number
  created_at: string
}

interface PostState {
  posts: Post[]
  currentPost: Post | null
  currentPostScraps: any[]
  currentComments: any[]
  isLiked: boolean
  isLoading: boolean
  error: string | null
  fetchPosts: () => Promise<void>
  fetchPost: (id: number) => Promise<void>
  createPost: (title: string, content: string, tags: string[], scrapIds: number[], thumbnail: string | null) => Promise<void>
  deletePost: (id: number) => Promise<void>
  toggleLike: (id: number) => Promise<void>
  toggleCommentLike: (id: number) => Promise<void>
  fetchComments: (id: number) => Promise<void>
  addComment: (id: number, content: string, parent_id?: number | null) => Promise<void>
  deleteComment: (postId: number, commentId: number) => Promise<void>
}

export const usePostStore = create<PostState>((set, get) => ({
  posts: [],
  currentPost: null,
  currentPostScraps: [],
  currentComments: [],
  isLiked: false,
  isLoading: false,
  error: null,

  fetchPosts: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`${API_URL}/posts`)
      if (!response.ok) {
        throw new Error('Failed to fetch posts')
      }
      const data = await response.json()
      
      // Parse JSON strings back to arrays
      const formattedData = data.map((post: any) => ({
        ...post,
        tags: JSON.parse(post.tags || '[]'),
        scrap_ids: JSON.parse(post.scrap_ids || '[]')
      }))

      set({ posts: formattedData, isLoading: false })
    } catch (err: any) {
      set({ error: err.message || '게시글을 불러오는데 실패했습니다.', isLoading: false })
    }
  },

  fetchPost: async (id: number) => {
    set({ isLoading: true, error: null, currentPost: null, currentPostScraps: [], currentComments: [], isLiked: false })
    const { token } = useAuthStore.getState()
    try {
      const response = await fetch(`${API_URL}/posts/${id}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })
      if (!response.ok) {
        throw new Error('Failed to fetch post')
      }
      const data = await response.json()
      
      const formattedPost = {
        ...data.post,
        tags: JSON.parse(data.post.tags || '[]'),
        scrap_ids: JSON.parse(data.post.scrap_ids || '[]')
      }

      set({ 
        currentPost: formattedPost, 
        currentPostScraps: data.scraps, 
        isLiked: data.isLiked || false,
        isLoading: false 
      })
      
      // Also fetch comments
      await get().fetchComments(id)
    } catch (err: any) {
      set({ error: err.message || '게시글을 불러오는데 실패했습니다.', isLoading: false })
    }
  },

  createPost: async (title, content, tags, scrapIds, thumbnail) => {
    set({ isLoading: true, error: null })
    const { token } = useAuthStore.getState()
    try {
      const response = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ title, content, tags, scrapIds, thumbnail })
      })

      checkAuthResponse(response)

      if (!response.ok) {
        throw new Error('Failed to create post')
      }

      set({ isLoading: false })
      // Optionally re-fetch here if needed
    } catch (err: any) {
      set({ error: err.message || '게시글 작성에 실패했습니다.', isLoading: false })
      throw err
    }
  },

  deletePost: async (id) => {
    set({ isLoading: true, error: null })
    const { token } = useAuthStore.getState()
    try {
      const response = await fetch(`${API_URL}/posts/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })

      checkAuthResponse(response)

      if (!response.ok) {
        throw new Error('Failed to delete post')
      }

      set((state) => ({ 
        posts: state.posts.filter((post) => post.id !== id),
        isLoading: false 
      }))
    } catch (err: any) {
      set({ error: err.message || '게시글 삭제에 실패했습니다.', isLoading: false })
      throw err
    }
  },

  toggleLike: async (id: number) => {
    const { token } = useAuthStore.getState()
    if (!token) {
       alert('로그인이 필요한 기능입니다.')
       return
    }

    try {
      const response = await fetch(`${API_URL}/posts/${id}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      checkAuthResponse(response)
      if (!response.ok) throw new Error('Failed to toggle like')
      
      const data = await response.json()
      
      set((state) => {
         const updatedPost = state.currentPost ? { ...state.currentPost, likes: data.likes } : null
         
         // Only update currentPost if we toggle exactly the one currently viewed
         if (state.currentPost && state.currentPost.id === id) {
             return { isLiked: data.liked, currentPost: updatedPost }
         }
         return {}
      })

    } catch (err: any) {
      console.error(err)
    }
  },

  fetchComments: async (id: number) => {
    try {
      const { token } = useAuthStore.getState()
      const response = await fetch(`${API_URL}/posts/${id}/comments`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })
      if (!response.ok) throw new Error('Failed to fetch comments')
      const data = await response.json()
      set({ currentComments: data })
    } catch (err: any) {
      console.error(err)
    }
  },

  addComment: async (id: number, content: string, parent_id?: number | null) => {
    const { token } = useAuthStore.getState()
    if (!token) {
       alert('로그인이 필요한 기능입니다.')
       return
    }

    try {
      const response = await fetch(`${API_URL}/posts/${id}/comments`, {
        method: 'POST',
        headers: { 
           'Content-Type': 'application/json',
           Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ content, parent_id })
      })
      checkAuthResponse(response)
      if (!response.ok) throw new Error('Failed to add comment')
      
      const data = await response.json()
      
      // Re-fetch comments and update current post comment count
      await get().fetchComments(id)
      set((state) => ({
         currentPost: state.currentPost ? { ...state.currentPost, comments: data.comments } : null
      }))
    } catch (err: any) {
      console.error(err)
      throw err
    }
  },

  deleteComment: async (postId: number, commentId: number) => {
    const { token } = useAuthStore.getState()
    if (!token) {
       alert('로그인이 필요한 기능입니다.')
       return
    }

    try {
      const response = await fetch(`${API_URL}/posts/${postId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      checkAuthResponse(response)
      if (!response.ok) throw new Error('Failed to delete comment')
      
      const data = await response.json()
      
      // Re-fetch comments and update current post comment count
      await get().fetchComments(postId)
      set((state) => ({
         currentPost: state.currentPost ? { ...state.currentPost, comments: data.comments } : null
      }))
    } catch (err: any) {
      console.error(err)
      throw err
    }
  },

  toggleCommentLike: async (id: number) => {
    const { token } = useAuthStore.getState()
    if (!token) {
       alert('로그인이 필요한 기능입니다.')
       return
    }

    try {
      const response = await fetch(`${API_URL}/comments/${id}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      checkAuthResponse(response)
      if (!response.ok) throw new Error('Failed to toggle comment like')
      
      const data = await response.json()
      
      set((state) => ({
         currentComments: state.currentComments.map((comment: any) => 
           comment.id === id ? { ...comment, likes: data.likes, isLiked: data.liked } : comment
         )
      }))

    } catch (err: any) {
      console.error(err)
    }
  }
}))
