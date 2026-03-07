import React, { useState, useRef, useEffect } from 'react'
import { X, Settings, Layers, Upload, Plus, Trash2, ChevronDown, Save, Bookmark, FolderOpen, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react'
import { useUiStore } from '../../store/uiStore'
import { UploadModal } from './UploadModal'
import { useSceneStore } from '../../store/sceneStore'
import { useScrapStore } from '../../store/scrapStore'
import { useAssetStore } from '../../store/assetStore'

export const Sidebar = () => {
  const { isSidebarOpen, toggleSidebar, isExpanded, toggleExpanded, assetLocation, setAssetLocation, transitionTo, setTransitionTo, selectedItemId, stageRef, setSelectedItemId } = useUiStore()
  const { items, updateItem, addItem } = useSceneStore()
  const { scraps, fetchScraps, saveCurrentScrap, loadScrap, deleteScrap, isLoading } = useScrapStore()
  const { categories, assets, addCategory: storeAddCategory, deleteCategory: storeDeleteCategory, addAsset, deleteAsset: storeDeleteAsset, fetchData: fetchAssetData } = useAssetStore()
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [pendingFile, setPendingFile] = useState<{ file: File; categoryId: number } | null>(null)
  
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newScrapName, setNewScrapName] = useState('')
  const [collapsedCategories, setCollapsedCategories] = useState<string[]>(['cat-scraps'])
  
  // Refs for file inputs mapped by category ID
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({})

  useEffect(() => {
    if (isSidebarOpen) {
      fetchScraps()
      fetchAssetData()
    }
  }, [isSidebarOpen, fetchScraps, fetchAssetData])

  const selectedItem = items.find(i => i.id === selectedItemId)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, categoryId: number) => {
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
      reader.onloadend = async () => {
        try {
          await addAsset({
            src: reader.result as string,
            categoryId: pendingFile.categoryId,
            ...data
          })
        } catch (error) {
          alert('에셋 저장에 실패했습니다.')
        }
      }
      reader.readAsDataURL(pendingFile.file)
      setPendingFile(null)
    }
  }

  const addCategory = async () => {
    if (newCategoryName.trim()) {
      try {
        await storeAddCategory(newCategoryName.trim())
        setNewCategoryName('')
      } catch (error) {
        alert('카테고리 추가에 실패했습니다.')
      }
    }
  }

  const deleteCategory = async (id: number) => {
    if (confirm('카테고리와 포함된 모든 에셋이 삭제됩니다. 계속하시겠습니까?')) {
      try {
        await storeDeleteCategory(id)
      } catch (error) {
        alert('카테고리 삭제에 실패했습니다.')
      }
    }
  }

  const toggleCategoryCollapse = (id: string | number) => {
    const idStr = id.toString()
    setCollapsedCategories(prev => 
      prev.includes(idStr) ? prev.filter(c => c !== idStr) : [...prev, idStr]
    )
  }

  const deleteAsset = async (assetId: number) => {
    try {
      await storeDeleteAsset(assetId)
    } catch (error) {
      alert('에셋 삭제에 실패했습니다.')
    }
  }

  const handleMoveToBottom = () => {
    setTransitionTo('bottom')
    // Start bottom bar immediately
    setAssetLocation('bottom')
    
    setTimeout(() => {
      setTransitionTo(null)
    }, 550) // Match slide-out-right duration (0.5s)
  }

  const handleSaveScrap = async () => {
    if (!newScrapName.trim()) {
        alert('스크랩 이름을 입력해주세요.')
        return
    }
    try {
        let thumbnail = ''
        if (stageRef) {
            // Deselect to avoid transformer in thumbnail
            setSelectedItemId(null)
            
            // Wait a bit for React to re-render without the Transformer
            await new Promise(resolve => setTimeout(resolve, 100))
            
            try {
                console.log('Attempting to generate thumbnail...')
                
                // Store current transform
                const oldScale = stageRef.scale()
                const oldPos = stageRef.position()
                
                // Reset transform temporarily to get accurate bounds and full-res crop
                stageRef.scale({ x: 1, y: 1 })
                stageRef.position({ x: 0, y: 0 })
                stageRef.batchDraw()

                // Get bounding box of the items in the main layer
                const layer = stageRef.getLayers()[0]
                const rect = layer.getClientRect({ skipTransform: false })
                
                // Add padding to crop bounds (40px)
                const padding = 40
                const cropParams = {
                    x: rect.width === 0 ? 0 : rect.x - padding,
                    y: rect.height === 0 ? 0 : rect.y - padding,
                    width: rect.width === 0 ? stageRef.width() : rect.width + padding * 2,
                    height: rect.height === 0 ? stageRef.height() : rect.height + padding * 2,
                }

                // Capture region as PNG (preserves transparency)
                const tempDataUrl = stageRef.toDataURL({
                    x: cropParams.x,
                    y: cropParams.y,
                    width: cropParams.width,
                    height: cropParams.height,
                    pixelRatio: 1,
                    mimeType: 'image/png'
                })

                // Restore transform
                stageRef.scale(oldScale)
                stageRef.position(oldPos)
                stageRef.batchDraw()

                // Draw onto an off-screen canvas with a solid white background
                const img = new Image()
                img.src = tempDataUrl
                await new Promise((resolve, reject) => {
                    img.onload = resolve
                    img.onerror = reject
                })

                const canvas = document.createElement('canvas')
                // Scale down slightly for dashboard if it's too large, but preserve aspect ratio
                const MAX_SIZE = 800
                const scale = Math.min(MAX_SIZE / img.width, MAX_SIZE / img.height, 1)
                
                canvas.width = img.width * scale
                canvas.height = img.height * scale

                const ctx = canvas.getContext('2d')
                if (ctx) {
                    // Fill white background
                    ctx.fillStyle = '#ffffff'
                    ctx.fillRect(0, 0, canvas.width, canvas.height)
                    
                    // Draw the captured PNG over it
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
                    
                    // Extract as high-quality JPEG
                    thumbnail = canvas.toDataURL('image/jpeg', 0.85)
                }

                console.log('Thumbnail generated, length:', thumbnail.length)
            } catch (e) {
                console.error('Thumbnail generation failed:', e)
            }
        } else {
            console.log('No stageRef available')
        }
        
        console.log('Saving scrap with thumbnail length:', thumbnail?.length)
        await saveCurrentScrap(newScrapName, thumbnail)
        setNewScrapName('')
        alert('스크랩이 저장되었습니다.')
    } catch (error: any) {
        console.error('Save failed:', error)
        alert(`저장에 실패했습니다: ${error.message}`)
    }
  }

  if (!isSidebarOpen) return null

  return (
    <div 
      className={`absolute sm:relative right-0 sm:right-auto z-40 h-[calc(100vh-6rem)] mt-20 sm:mr-4 mb-4 bg-white/90 sm:bg-white/70 backdrop-blur-xl rounded-l-[2rem] sm:rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col pointer-events-auto border border-white/60 transition-all duration-500 ease-in-out animate-dramatic-slide-in-right ${isExpanded ? 'w-full sm:w-[45rem]' : 'w-[85vw] sm:w-80'}`}
      data-tutorial="sidebar"
    >
      {/* Expand/Collapse Toggle Button */}
      <button
        onClick={toggleExpanded}
        className="absolute -left-4 sm:-left-4 top-1/2 -translate-y-1/2 w-8 h-12 bg-white/90 backdrop-blur-md border border-white/80 rounded-xl shadow-lg hidden sm:flex items-center justify-center text-gray-400 hover:text-black hover:scale-110 transition-all z-50 group"
        data-tutorial="sidebar-expand"
        title={isExpanded ? "축소하기" : "펼치기"}
      >
        {isExpanded ? (
          <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
        ) : (
          <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
        )}
      </button>

      {/* Move to Bottom Toggle Button (Floating at screen bottom center) */}
      {assetLocation === 'sidebar' && isSidebarOpen && (
        <button
          onClick={handleMoveToBottom}
          className="fixed bottom-10 left-1/2 -translate-x-1/2 w-14 h-10 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/80 rounded-2xl flex flex-col items-center justify-center text-gray-500 hover:text-black hover:scale-110 hover:shadow-[0_12px_40px_rgb(0,0,0,0.15)] transition-all z-[100] group"
          title="하단 바 모드로 전환"
          data-tutorial="move-to-bottom"
        >
          <ChevronUp size={24} className="group-hover:-translate-y-1 transition-transform" />
          <span className="text-[8px] font-black uppercase tracking-tighter -mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Asset Bar</span>
        </button>
      )}

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
           <div className={`space-y-5 animate-slide-up ${isExpanded ? 'sm:grid sm:grid-cols-2 gap-x-6 gap-y-2 content-start' : ''}`} key={selectedItem.id}>
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
              <div className={`opacity-0 animate-fade-in space-y-2 ${isExpanded ? 'col-span-2' : ''}`} style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
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
                    className={`block w-full text-center py-3.5 bg-gradient-to-r from-gray-800 to-black text-white font-bold rounded-xl hover:shadow-lg hover:shadow-gray-500/25 hover:-translate-y-0.5 transition-all duration-300 animate-pop text-sm ${isExpanded ? 'sm:col-span-2 mt-4' : ''}`}
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

        {/* Scraps Section */}
        <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="font-extrabold text-gray-300 text-xs tracking-widest uppercase mb-6 px-2 flex items-center gap-2">
                <Bookmark size={14} /> Saved Scraps
            </h3>
            
            <div className="space-y-4">
                {/* Save Current Board Section */}
                <div className="flex items-center gap-2 mb-6 group focus-within:ring-2 focus-within:ring-brand-orange/10 rounded-full transition-shadow">
                    <input
                        type="text"
                        value={newScrapName}
                        onChange={(e) => setNewScrapName(e.target.value)}
                        placeholder="스크랩 이름..."
                        className="flex-1 px-5 py-3 bg-white border-none rounded-full text-sm font-medium focus:outline-none placeholder:text-gray-300"
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveScrap()}
                    />
                    <button 
                        onClick={handleSaveScrap}
                        disabled={isLoading}
                        className="p-3 bg-gray-900 text-white rounded-full hover:bg-black shadow-lg hover:shadow-gray-500/30 transition-all active:scale-95 disabled:bg-gray-400"
                        title="보드 저장하기"
                    >
                        <Save size={16} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Scraps List */}
                <div className="bg-white/50 border border-white rounded-[1.8rem] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group">
                    <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/60 transition-colors" onClick={() => toggleCategoryCollapse('cat-scraps')}>
                        <div className="flex items-center gap-3 font-bold text-gray-700 select-none">
                            <div className={`w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-400 group-hover:text-black transition-all duration-300 ${collapsedCategories.includes('cat-scraps') ? '-rotate-90' : 'rotate-0'}`}>
                                <ChevronDown size={16} />
                            </div>
                            저장된 보드 목록
                        </div>
                    </div>

                    {!collapsedCategories.includes('cat-scraps') && (
                        <div className="flex overflow-x-auto gap-3 pb-4 px-4 pt-2 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                            {scraps.map(scrap => (
                                <div key={scrap.id} className="flex-shrink-0 w-40 flex flex-col p-3 bg-white rounded-2xl group/scrap hover:shadow-md transition-all snap-start border border-gray-50">
                                    <div className="flex flex-col gap-3 flex-1 min-w-0" onClick={() => loadScrap(scrap.id)}>
                                        <div className="p-3 bg-gray-50 rounded-xl text-gray-400 group-hover/scrap:text-black group-hover/scrap:bg-gray-100 transition-colors flex items-center justify-center">
                                            <FolderOpen size={24} />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[11px] font-bold text-gray-700 truncate">{scrap.name}</p>
                                            <p className="text-[9px] text-gray-400 font-medium">{new Date(scrap.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="mt-2 pt-2 border-t border-gray-50 flex justify-end">
                                        <button 
                                            onClick={() => deleteScrap(scrap.id)}
                                            className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {scraps.length === 0 && (
                                <div className="w-full text-center py-6">
                                    <p className="text-sm text-gray-300 font-medium">저장된 보드가 없습니다.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
        
        {(assetLocation === 'sidebar' || transitionTo === 'bottom') && (
          <div className={`mt-8 pt-6 border-t border-gray-100 transition-all duration-500 ${transitionTo === 'bottom' ? 'animate-slide-out-right' : 'animate-dramatic-slide-in-right'}`}>
              <div className="flex items-center justify-between mb-6 px-2">
                <h3 className="font-extrabold text-gray-300 text-xs tracking-widest uppercase flex items-center gap-2">
                    <Layers size={14} /> Assets
                </h3>
              </div>
              <div className="space-y-4">
                
                {/* Add Category Section */}
                <div className="flex items-center gap-2 mb-6 group focus-within:ring-2 focus-within:ring-brand-orange/10 rounded-full transition-shadow" data-tutorial="add-category-input">
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
                                <div className={`w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-400 group-hover:text-black transition-all duration-300 ${collapsedCategories.includes(category.id.toString()) ? '-rotate-90' : 'rotate-0'}`}>
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
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        fileInputRefs.current[category.id]?.click();
                                    }}
                                    className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-all"
                                    title="이미지 업로드"
                                    data-tutorial="upload-image-btn"
                                >
                                    <Upload size={18} />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteCategory(category.id);
                                    }}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                    title="카테고리 삭제"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Category Assets */}
                        {!collapsedCategories.includes(category.id.toString()) && (
                            <div className="flex overflow-x-auto gap-3 pb-4 px-4 pt-0 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                                {assets.filter(a => a.categoryId === category.id).map((asset) => (
                                    <div
                                        key={asset.id}
                                        className="flex-shrink-0 w-28 sm:w-32 relative group/asset p-2 sm:p-3 bg-white rounded-2xl cursor-pointer sm:cursor-move shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 snap-start"
                                        draggable
                                        onClick={() => {
                                            addItem({
                                                type: 'image',
                                                x: window.innerWidth / 2 - 100,
                                                y: window.innerHeight / 2 - 100,
                                                width: 200,
                                                height: 200,
                                                fill: 'transparent',
                                                rotation: 0,
                                                scaleX: 1,
                                                scaleY: 1,
                                                src: asset.src,
                                                name: asset.name,
                                                price: asset.price,
                                                siteUrl: asset.siteUrl
                                            })
                                        }}
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
                                            <p className="text-[11px] font-bold text-gray-700 truncate">{asset.name || 'Untitled'}</p>
                                            <p className="text-[9px] text-gray-400 font-medium tracking-tight mt-0.5">{asset.price}</p>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteAsset(asset.id);
                                            }}
                                            className="absolute top-2 right-2 p-1.5 bg-white shadow-md rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover/asset:opacity-100 transition-all scale-90 group-hover/asset:scale-100"
                                        >
                                            <X size={10} />
                                        </button>
                                    </div>
                                ))}
                                {assets.filter(a => a.categoryId === category.id).length === 0 && (
                                    <div className="w-full text-center py-8 border-2 border-dashed border-gray-100 rounded-2xl group-hover:border-gray-200 transition-colors">
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
        )}
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
