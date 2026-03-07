import React, { useState, useEffect } from 'react'
import { MainCanvas } from './components/canvas/MainCanvas'
import { MainLayout } from './components/layout/MainLayout'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { useAuthStore } from './store/authStore'
import { DashboardPage } from './pages/DashboardPage'
import { CommunityPage } from './pages/CommunityPage'
import { CreatePostPage } from './pages/CreatePostPage'
import { PostDetailPage } from './pages/PostDetailPage'
import { MyPage } from './pages/MyPage'
import { MobileDesktopOnly } from './components/ui/MobileDesktopOnly'

function App() {
  return (
    <Router>
      <Routes>
        {/* Main: Community page for both desktop and mobile */}
        <Route path="/" element={
          <ProtectedRoute>
            <CommunityPage />
          </ProtectedRoute>
        } />
        {/* Create post: both desktop and mobile */}
        <Route path="/create-post" element={
          <ProtectedRoute>
            <CreatePostPage />
          </ProtectedRoute>
        } />
        {/* Canvas editor: desktop only */}
        <Route path="/editor" element={
          <ProtectedRoute>
            <DesktopOnlyRoute>
              <MainLayout>
                <MainCanvas />
              </MainLayout>
            </DesktopOnlyRoute>
          </ProtectedRoute>
        } />
        {/* Dashboard: desktop only */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DesktopOnlyRoute>
              <DashboardPage />
            </DesktopOnlyRoute>
          </ProtectedRoute>
        } />
        {/* My Page */}
        <Route path="/mypage" element={
          <ProtectedRoute>
            <MyPage />
          </ProtectedRoute>
        } />
        {/* Redirect legacy /community to / */}
        <Route path="/community" element={<Navigate to="/" replace />} />
        {/* Post Detail */}
        <Route path="/post/:id" element={<PostDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  )
}

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

/**
 * Shows MobileDesktopOnly screen on mobile devices (< 768px).
 * Desktop-only features like canvas editor and dashboard are not
 * usable on small screens due to drag-and-drop limitations.
 */
const DesktopOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)');
    setIsMobile(mql.matches);

    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  if (isMobile) {
    return <MobileDesktopOnly />;
  }

  return <>{children}</>;
};

export default App
