import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  email: string;
  username: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  handleUnauthorized: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      handleUnauthorized: () => {
        set({ user: null, token: null, isAuthenticated: false });
        // Redirect to login page
        if (window.location.pathname !== '/login') {
          alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
          window.location.href = '/login';
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

/**
 * Checks a fetch Response for 401/403 status codes (expired/invalid token).
 * If unauthorized, triggers logout + redirect and throws an error.
 * Call this after every authenticated API fetch.
 */
export const checkAuthResponse = (response: Response): void => {
  if (response.status === 401 || response.status === 403) {
    useAuthStore.getState().handleUnauthorized();
    throw new Error('인증이 만료되었습니다.');
  }
};
