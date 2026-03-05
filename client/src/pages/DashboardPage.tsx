import React, { useEffect } from 'react'
import { useScrapStore } from '../store/scrapStore'
import { Navbar } from '../components/ui/Navbar'
import { Trash2, Calendar, Layout, Search, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export const DashboardPage = () => {
    const { scraps, fetchScraps, deleteScrap, isLoading } = useScrapStore()
    const navigate = useNavigate()

    useEffect(() => {
        fetchScraps()
    }, [fetchScraps])

    const handleDelete = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation()
        if (confirm('이 스크랩을 삭제하시겠습니까?')) {
            await deleteScrap(id)
        }
    }

    return (
        <div className="min-h-screen bg-[#f8f9fc]">
            <Navbar />
            
            <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-black tracking-tight mb-2">MY SCRAPS</h1>
                        <p className="text-gray-400 font-medium">저장된 코디 보드들을 관리하세요.</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={18} />
                            <input 
                                type="text" 
                                placeholder="스크랩 검색..." 
                                className="pl-11 pr-6 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-black/5 focus:border-gray-200 transition-all w-64 shadow-sm"
                            />
                        </div>
                        <button 
                            onClick={() => navigate('/editor')}
                            className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-2xl font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-gray-200"
                        >
                            <Plus size={18} />
                            <span>새 보드 만들기</span>
                        </button>
                    </div>
                </div>

                {/* Grid */}
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent"></div>
                    </div>
                ) : scraps.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-fade-in">
                        {scraps.map(scrap => (
                            <div 
                                key={scrap.id}
                                onClick={() => navigate('/editor')} 
                                className="group relative bg-white rounded-[2.5rem] border border-gray-100/50 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.12)] hover:-translate-y-3 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden cursor-pointer"
                            >
                                {/* Thumbnail Area */}
                                <div className="aspect-[1.4/1] bg-[#fdfdfd] relative flex items-center justify-center overflow-hidden">
                                    {/* Animated Background Gradients */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-gray-50 via-white to-gray-50 opacity-50 group-hover:scale-125 transition-transform duration-1000"></div>
                                    <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.02)_0%,transparent_70%)] group-hover:rotate-12 transition-transform duration-1000"></div>
                                    
                                    {/* Thumbnail Image or Icon/Logo Placeholder */}
                                    <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
                                        {scrap.thumbnail ? (
                                            <img 
                                                src={scrap.thumbnail} 
                                                alt={scrap.name} 
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-20 h-20 bg-white rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.08)] flex items-center justify-center text-gray-200 group-hover:text-black group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border border-gray-50/50">
                                                <Layout size={36} strokeWidth={1.5} />
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Detail Overlay */}
                                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    
                                    <div className="absolute top-5 right-5 flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                                        <button 
                                            onClick={(e) => handleDelete(e, scrap.id)}
                                            className="w-11 h-11 bg-white/95 backdrop-blur-xl text-gray-400 hover:text-red-500 rounded-2xl shadow-xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all border border-gray-100"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Info Section */}
                                <div className="p-8 relative">
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">Closet Scrap</span>
                                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                                        </div>
                                        <h3 className="font-extrabold text-2xl text-gray-900 leading-tight truncate group-hover:text-black transition-colors">{scrap.name}</h3>
                                    </div>
                                    
                                    <div className="pt-6 border-t border-gray-50/80 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                            <Calendar size={13} className="text-gray-300" />
                                            <span>{new Date(scrap.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-black group-hover:text-white transition-all duration-500">
                                            <Layout size={14} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-96 text-center border-4 border-dashed border-gray-100 rounded-[3rem]">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mb-4">
                            <Plus size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">저장된 보드가 없습니다.</h3>
                        <p className="text-gray-400 mb-8">첫 번째 코디 스크랩을 만들어보세요!</p>
                        <button 
                            onClick={() => navigate('/editor')}
                            className="px-8 py-3.5 bg-black text-white rounded-2xl font-bold shadow-xl shadow-gray-200 hover:scale-105 active:scale-95 transition-all"
                        >
                            시작하기
                        </button>
                    </div>
                )}
            </main>
        </div>
    )
}
