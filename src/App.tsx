import React from 'react'
import { MainCanvas } from './components/canvas/MainCanvas'
import { MainLayout } from './components/layout/MainLayout'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <MainLayout>
            <MainCanvas />
          </MainLayout>
        } />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  )
}

export default App
