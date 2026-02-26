import React, { useState, useEffect } from 'react'
import { Shirt, ArrowRight, Mail, Lock, Stars, User, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { GridBackground } from '../components/ui/GridBackground'
import { ParticleBackground } from '../components/ui/ParticleBackground'
import { useAuthStore } from '../store/authStore'

export const LoginPage = () => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const navigate = useNavigate()
  const setAuth = useAuthStore(state => state.setAuth)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register'
    const body = isLogin ? { email, password } : { email, password, username }

    try {
      const response = await fetch(`${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '인증에 실패했습니다.')
      }

      setAuth(data.user, data.token)
      navigate('/')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-br from-white via-gray-100 to-gray-50 flex items-center justify-center font-sans">
        {/* Animated Background Elements - Antigravity inspired fun shapes */}
        {/* Animated Background Elements - Antigravity inspired fun shapes */}
        {/* Animated Background Elements - Antigravity inspired fun shapes */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
            <GridBackground interactive={true} distortionRadius={1000} distortionStrength={0.125} />
            <ParticleBackground attractionRadius={350} />
        </div>

        {/* Content Container */}
        <div className={`relative z-10 w-full max-w-md p-8 transition-all duration-700 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            
            {/* Logo Section */}
            <div className="flex flex-col items-center mb-10">
                <div className="relative mb-6 group cursor-pointer" onClick={() => navigate('/')}>

                    <div className="absolute inset-0 bg-black/5 rounded-3xl blur-md opacity-40 group-hover:opacity-60 transition-opacity duration-300 animate-pulse"></div>
                    <div className="relative bg-white border border-white/50 p-5 rounded-3xl shadow-xl group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
                        <Shirt size={48} className="text-gray-900" strokeWidth={1.5} />
                    </div>
                </div>
                <h1 className="text-5xl font-extrabold text-gray-900 tracking-tighter drop-shadow-sm">
                    Wardrobe
                </h1>
                <p className="mt-3 text-gray-500 text-base font-medium tracking-wide flex items-center gap-2">
                    <Stars size={16} className="text-gray-400" />
                    나만의 스타일, 나만의 중력
                    <Stars size={16} className="text-gray-400" />
                </p>
            </div>

            {/* Login Card - Glassmorphism Light */}
            <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-[40px] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow duration-500">
                
                {error && (
                    <div className="mb-6 p-4 bg-red-50/50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                        <AlertCircle size={18} />
                        <span className="font-medium">{error}</span>
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-6 relative z-10">
                    {!isLogin && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Username</label>
                            <div className="relative group/input">
                                <User size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-black transition-colors duration-300" />
                                <input 
                                    type="text" 
                                    placeholder="Your Name"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required={!isLogin}
                                    className="w-full bg-white/70 border-2 border-transparent rounded-2xl py-4 pl-14 pr-4 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-black/20 focus:shadow-lg focus:shadow-black/5 transition-all duration-300 hover:bg-white/90"
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email</label>
                        <div className="relative group/input">
                            <Mail size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-black transition-colors duration-300" />
                            <input 
                                type="email" 
                                placeholder="hello@wardrobe.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-white/70 border-2 border-transparent rounded-2xl py-4 pl-14 pr-4 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-black/20 focus:shadow-lg focus:shadow-black/5 transition-all duration-300 hover:bg-white/90"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center ml-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Password</label>
                            <a href="#" className="text-xs font-semibold text-gray-500 hover:text-black transition-colors">Forgot?</a>
                        </div>
                        <div className="relative group/input">
                            <Lock size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-black transition-colors duration-300" />
                            <input 
                                type="password" 
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full bg-white/70 border-2 border-transparent rounded-2xl py-4 pl-14 pr-4 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-black/20 focus:shadow-lg focus:shadow-black/5 transition-all duration-300 hover:bg-white/90"
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full relative overflow-hidden bg-gray-900 text-white font-bold text-lg py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 active:scale-[0.98] group/btn mt-4 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                         <div className="absolute inset-0 bg-gradient-to-r from-stone-800 via-stone-600 to-stone-800 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                        <span className="relative z-10 flex items-center justify-center gap-2 group-hover/btn:text-white transition-colors">
                            {isLoading ? '처리 중...' : (isLogin ? '시작하기' : '회원가입 완료')}
                            {!isLoading && <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />}
                        </span>
                    </button>
                </form>

                <div className="mt-8 text-center relative z-10">
                    <p className="text-sm font-medium text-gray-500">
                        {isLogin ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'} {' '}
                        <button 
                            type="button"
                            onClick={() => { setIsLogin(!isLogin); setError(null); }}
                            className="text-gray-900 hover:text-black font-bold transition-colors underline decoration-2 decoration-gray-200 underline-offset-4 hover:decoration-black"
                        >
                            {isLogin ? '회원가입' : '로그인'}
                        </button>
                    </p>
                </div>
            </div>
            
        </div>
    </div>
  )
}
