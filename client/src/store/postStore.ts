import { create } from 'zustand'
import { useAuthStore, checkAuthResponse } from './authStore'

const API_URL = import.meta.env.VITE_API_URL || '/api'

export interface Post {
  id: number
  user_id: number
  author: string
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
  isLoading: boolean
  error: string | null
  fetchPosts: () => Promise<void>
  fetchPost: (id: number) => Promise<void>
  createPost: (title: string, content: string, tags: string[], scrapIds: number[], thumbnail: string | null) => Promise<void>
  deletePost: (id: number) => Promise<void>
}

export const usePostStore = create<PostState>((set) => ({
  posts: [],
  currentPost: null,
  currentPostScraps: [],
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
    set({ isLoading: true, error: null, currentPost: null, currentPostScraps: [] })
    try {
      const response = await fetch(`${API_URL}/posts/${id}`)
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
        isLoading: false 
      })
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
  }
}))
