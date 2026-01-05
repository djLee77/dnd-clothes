
import React, { useState, useEffect } from 'react'
import { Shirt, ArrowRight, Mail, Lock, Stars } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { GridBackground } from '../components/ui/GridBackground'
import { ParticleBackground } from '../components/ui/ParticleBackground'

export const LoginPage = () => {
  const [isLoaded, setIsLoaded] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Login attempted")
    navigate('/')
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
                
                <form onSubmit={handleLogin} className="space-y-6 relative z-10">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email</label>
                        <div className="relative group/input">

                            <Mail size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-black transition-colors duration-300" />
                            <input 
                                type="email" 
                                placeholder="hello@wardrobe.com"
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
                                className="w-full bg-white/70 border-2 border-transparent rounded-2xl py-4 pl-14 pr-4 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-black/20 focus:shadow-lg focus:shadow-black/5 transition-all duration-300 hover:bg-white/90"
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        className="w-full relative overflow-hidden bg-gray-900 text-white font-bold text-lg py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 active:scale-[0.98] group/btn mt-4"
                    >
                         <div className="absolute inset-0 bg-gradient-to-r from-stone-800 via-stone-600 to-stone-800 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                        <span className="relative z-10 flex items-center justify-center gap-2 group-hover/btn:text-white transition-colors">
                            시작하기
                            <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                        </span>
                    </button>
                </form>

                <div className="mt-8 text-center relative z-10">
                    <p className="text-sm font-medium text-gray-500">
                        계정이 없으신가요?{' '}
                        <button className="text-gray-900 hover:text-black font-bold transition-colors underline decoration-2 decoration-gray-200 underline-offset-4 hover:decoration-black">
                            회원가입
                        </button>
                    </p>
                </div>
            </div>
            
        </div>
    </div>
  )
}
