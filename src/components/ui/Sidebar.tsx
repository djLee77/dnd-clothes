import React from 'react'
import { X, Settings, Layers, Upload, Plus, Trash2, ChevronDown } from 'lucide-react'
import { useUiStore } from '../../store/uiStore'
import { useState, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { UploadModal } from './UploadModal'
import { useSceneStore } from '../../store/sceneStore'

interface Category {
  id: string
  name: string
}

interface Asset {
  id: string
  src: string
  categoryId: string
  name: string
  price: string
  siteUrl: string
}

export const Sidebar = () => {
  const { isSidebarOpen, toggleSidebar, selectedItemId } = useUiStore()
  const { items, updateItem } = useSceneStore()
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [pendingFile, setPendingFile] = useState<{ file: File; categoryId: string } | null>(null)
  
  // Default categories
  const [categories, setCategories] = useState<Category[]>([
    { id: 'cat-tops', name: '상의' },
    { id: 'cat-bottoms', name: '하의' }
  ])
  const [assets, setAssets] = useState<Asset[]>([])
  const [newCategoryName, setNewCategoryName] = useState('')
  const [collapsedCategories, setCollapsedCategories] = useState<string[]>([])
  
  // Refs for file inputs mapped by category ID
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

  const selectedItem = items.find(i => i.id === selectedItemId)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, categoryId: string) => {
    const file = e.target.files?.[0]
    if (file) {
      setPendingFile({ file, categoryId })
      setIsModalOpen(true)
    }
    // Reset input
    e.target.value = ''
  }

  const handleModalConfirm = (data: { name: string; price: string; siteUrl: string }) => {
    if (pendingFile) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAssets((prev) => [
          ...prev, 
          { 
            id: uuidv4(), 
            src: reader.result as string, 
            categoryId: pendingFile.categoryId,
            ...data
          }
        ])
      }
      reader.readAsDataURL(pendingFile.file)
      setPendingFile(null)
    }
  }

  const addCategory = () => {
    if (newCategoryName.trim()) {
      setCategories([...categories, { id: uuidv4(), name: newCategoryName.trim() }])
      setNewCategoryName('')
    }
  }

  const deleteCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id))
    // Optional: Delete assets in this category or move them to 'Uncategorized'
    // For now we just keep them but they won't show up. 
    // Ideally we should filter them out too:
    setAssets(assets.filter(a => a.categoryId !== id))
  }

  const toggleCategoryCollapse = (id: string) => {
    setCollapsedCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  const deleteAsset = (assetId: string) => {
      setAssets(assets.filter(a => a.id !== assetId))
  }

  if (!isSidebarOpen) return null

  return (
    <div className="w-80 h-[calc(100vh-6rem)] mt-20 mr-4 mb-4 bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col pointer-events-auto border border-white/60 transition-all duration-300">
      <div className="h-20 flex items-center justify-between px-8 border-b border-white/20">
        <h2 className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-gray-600 text-2xl tracking-tighter">Properties</h2>
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-white/80 rounded-xl text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        {selectedItem ? (
           <div className="space-y-5 animate-slide-up" key={selectedItem.id}>
              <div className="opacity-0 animate-fade-in space-y-2" style={{ animationDelay: '0ms', animationFillMode: 'forwards' }}>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">이름</label>
                  <input 
                  type="text" 
                  value={selectedItem.name || ''} 
                  onChange={(e) => updateItem(selectedItem.id, { name: e.target.value })}
                  className="w-full px-4 py-3.5 bg-white border-2 border-transparent rounded-2xl text-sm font-medium text-gray-700 focus:outline-none focus:border-gray-800 focus:shadow-lg focus:shadow-gray-200 transition-all"
                  placeholder="아이템 이름"
                />
              </div>
              <div className="opacity-0 animate-fade-in space-y-2" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">가격</label>
                  <input 
                  type="text" 
                  value={selectedItem.price || ''} 
                  onChange={(e) => updateItem(selectedItem.id, { price: e.target.value })}
                  className="w-full px-4 py-3.5 bg-white border-2 border-transparent rounded-2xl text-sm font-medium text-gray-700 focus:outline-none focus:border-gray-800 focus:shadow-lg focus:shadow-gray-200 transition-all"
                  placeholder="₩ 0"
                />
              </div>
              <div className="opacity-0 animate-fade-in space-y-2" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">구매 링크</label>
                  <input 
                  type="text" 
                  value={selectedItem.siteUrl || ''} 
                  onChange={(e) => updateItem(selectedItem.id, { siteUrl: e.target.value })}
                  className="w-full px-4 py-3.5 bg-white border-2 border-transparent rounded-2xl text-sm font-medium text-gray-700 focus:outline-none focus:border-gray-800 focus:shadow-lg focus:shadow-gray-200 transition-all"
                  placeholder="https://..."
                />
              </div>
              {selectedItem.siteUrl && (
                  <a 
                    href={selectedItem.siteUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full text-center py-3.5 bg-gradient-to-r from-gray-800 to-black text-white font-bold rounded-xl hover:shadow-lg hover:shadow-gray-500/25 hover:-translate-y-0.5 transition-all duration-300 animate-pop text-sm"
                    style={{ animationDelay: '300ms' }}
                  >
                    사이트 방문
                  </a>
              )}
           </div>
        ) : (
          <div className="h-40 flex flex-col items-center justify-center text-gray-300 space-y-3 border-2 border-dashed border-gray-200/50 rounded-3xl m-2">
            <Settings className="opacity-20" size={40} />
            <p className="text-sm font-medium">아이템을 선택하세요</p>
          </div>
        )}
        
        {/* Draggable Assets */}
        <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="font-extrabold text-gray-300 text-xs tracking-widest uppercase mb-6 px-2 flex items-center gap-2">
                <Layers size={14} /> Assets
            </h3>
            <div className="space-y-4">
                
                {/* Add Category Section */}
                <div className="flex items-center gap-2 mb-6 group focus-within:ring-2 focus-within:ring-brand-orange/10 rounded-full transition-shadow">
                    <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="새 카테고리..."
                        className="flex-1 px-5 py-3 bg-white border-none rounded-full text-sm font-medium focus:outline-none placeholder:text-gray-300"
                        onKeyDown={(e) => e.key === 'Enter' && addCategory()}
                    />
                    <button 
                        onClick={addCategory}
                        className="p-3 bg-gray-900 text-white rounded-full hover:bg-black shadow-lg hover:shadow-gray-500/30 transition-all active:scale-95"
                        title="카테고리 추가"
                    >
                        <Plus size={16} strokeWidth={2.5} />
                    </button>
                </div>

                {categories.map(category => (
                    <div key={category.id} className="bg-white/50 border border-white rounded-[1.8rem] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group">
                        {/* Category Header */}
                            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/60 transition-colors" onClick={() => toggleCategoryCollapse(category.id)}>
                            <div className="flex items-center gap-3 font-bold text-gray-700 select-none">
                                <div className={`w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-400 group-hover:text-black transition-all duration-300 ${collapsedCategories.includes(category.id) ? '-rotate-90' : 'rotate-0'}`}>
                                    <ChevronDown size={16} />
                                </div>
                                {category.name}
                            </div>
                            <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                                <input
                                    type="file"
                                    ref={el => fileInputRefs.current[category.id] = el}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => handleFileUpload(e, category.id)}
                                />
                                <button
                                    onClick={() => fileInputRefs.current[category.id]?.click()}
                                    className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-all"
                                    title="이미지 업로드"
                                >
                                    <Upload size={18} />
                                </button>
                                <button
                                    onClick={() => deleteCategory(category.id)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                    title="카테고리 삭제"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Category Assets */}
                        {!collapsedCategories.includes(category.id) && (
                            <div className="p-4 pt-0 grid grid-cols-2 gap-3">
                                {assets.filter(a => a.categoryId === category.id).map((asset) => (
                                    <div
                                        key={asset.id}
                                        className="relative group/asset p-3 bg-white rounded-2xl cursor-move shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                                        draggable
                                        onDragStart={(e) => {
                                            e.dataTransfer.setData('type', 'image')
                                            e.dataTransfer.setData('src', asset.src)
                                            e.dataTransfer.setData('name', asset.name)
                                            e.dataTransfer.setData('price', asset.price)
                                            e.dataTransfer.setData('siteUrl', asset.siteUrl)
                                        }}
                                    >
                                        <div className="aspect-square w-full flex items-center justify-center overflow-hidden mb-2 rounded-lg bg-gray-50/50">
                                            <img 
                                                src={asset.src} 
                                                alt="Asset" 
                                                className="max-w-full max-h-full object-contain drop-shadow-sm group-hover/asset:drop-shadow-md transition-all group-hover/asset:scale-110 duration-500" 
                                                draggable={false}
                                            />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs font-bold text-gray-700 truncate">{asset.name || 'Untitled'}</p>
                                            <p className="text-[10px] text-gray-400 font-medium tracking-tight mt-0.5">{asset.price}</p>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteAsset(asset.id);
                                            }}
                                            className="absolute top-2 right-2 p-1.5 bg-white shadow-md rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover/asset:opacity-100 transition-all scale-90 group-hover/asset:scale-100"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                                {assets.filter(a => a.categoryId === category.id).length === 0 && (
                                    <div className="col-span-2 text-center py-8 border-2 border-dashed border-gray-100 rounded-2xl group-hover:border-gray-200 transition-colors">
                                        <p className="text-xs text-gray-300 font-medium mb-1">비어있음</p>
                                        <p className="text-[10px] text-gray-300">이미지를 추가해보세요</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}


            </div>
        </div>
      </div>
      
      <UploadModal 
        isOpen={isModalOpen}
        onClose={() => {
            setIsModalOpen(false)
            setPendingFile(null)
        }}
        onConfirm={handleModalConfirm}
      />
    </div>
  )
}
