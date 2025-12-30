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
    <div className="w-80 h-[calc(100vh-2rem)] m-4 bg-surface rounded-3xl shadow-xl flex flex-col pointer-events-auto ring-1 ring-black/5 transition-all duration-300">
      <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100/50">
        <h2 className="font-semibold text-primary text-lg tracking-tight">Properties</h2>
        <button
          onClick={toggleSidebar}
          className="p-1 hover:bg-gray-100 rounded text-gray-500"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {selectedItem ? (
           <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                <input 
                  type="text" 
                  value={selectedItem.name || ''} 
                  onChange={(e) => updateItem(selectedItem.id, { name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">가격</label>
                <input 
                  type="text" 
                  value={selectedItem.price || ''} 
                  onChange={(e) => updateItem(selectedItem.id, { price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">구매 링크</label>
                  <input 
                  type="text" 
                  value={selectedItem.siteUrl || ''} 
                  onChange={(e) => updateItem(selectedItem.id, { siteUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 transition-shadow"
                />
              </div>
              {selectedItem.siteUrl && (
                  <a 
                    href={selectedItem.siteUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full text-center py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm"
                  >
                    사이트 방문
                  </a>
              )}
           </div>
        ) : (
          <div className="text-center text-gray-400 mt-10">
            <Settings className="mx-auto mb-2 opacity-50" size={48} />
            <p>Select an item to view properties</p>
          </div>
        )}
        
        {/* Draggable Assets */}
        <div className="mt-8 border-t pt-8">
            <h3 className="font-medium text-gray-700 mb-4 flex items-center gap-2">
                <Layers size={18} /> Assets
            </h3>
            <div className="space-y-6">
                
                {/* Add Category Section */}
                <div className="flex items-center gap-2 mb-6">
                    <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="새 카테고리 이름"
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 transition-shadow"
                        onKeyDown={(e) => e.key === 'Enter' && addCategory()}
                    />
                    <button 
                        onClick={addCategory}
                        className="p-2 bg-white border border-gray-200 text-gray-600 rounded-full hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95"
                        title="카테고리 추가"
                    >
                        <Plus size={18} />
                    </button>
                </div>

                {categories.map(category => (
                    <div key={category.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        {/* Category Header */}
                        <div className="flex items-center justify-between p-3 bg-white/50 border-b border-gray-100 transition-colors hover:bg-white">
                            <div 
                                className="flex items-center gap-2 font-medium text-primary cursor-pointer select-none"
                                onClick={() => toggleCategoryCollapse(category.id)}
                            >
                                <div className={`transition-transform duration-300 ${collapsedCategories.includes(category.id) ? '-rotate-90' : 'rotate-0'}`}>
                                    <ChevronDown size={16} />
                                </div>
                                {category.name}
                            </div>
                            <div className="flex items-center gap-1">
                                <input
                                    type="file"
                                    ref={el => fileInputRefs.current[category.id] = el}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => handleFileUpload(e, category.id)}
                                />
                                <button
                                    onClick={() => fileInputRefs.current[category.id]?.click()}
                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                    title="이미지 업로드"
                                >
                                    <Upload size={16} />
                                </button>
                                <button
                                    onClick={() => deleteCategory(category.id)}
                                    className="p-1 text-red-400 hover:bg-red-50 rounded"
                                    title="카테고리 삭제"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Category Assets */}
                        {!collapsedCategories.includes(category.id) && (
                            <div className="p-3 grid grid-cols-2 gap-2 bg-white">
                                {assets.filter(a => a.categoryId === category.id).map((asset) => (
                                    <div
                                        key={asset.id}
                                        className="relative group p-2 bg-white border border-gray-100 rounded-2xl cursor-move hover:shadow-md hover:scale-105 transition-all duration-300"
                                        draggable
                                        onDragStart={(e) => {
                                            e.dataTransfer.setData('type', 'image')
                                            e.dataTransfer.setData('src', asset.src)
                                            e.dataTransfer.setData('name', asset.name)
                                            e.dataTransfer.setData('price', asset.price)
                                            e.dataTransfer.setData('siteUrl', asset.siteUrl)
                                        }}
                                    >
                                        <img 
                                            src={asset.src} 
                                            alt="Asset" 
                                            className="w-full h-20 object-contain" 
                                            draggable={false}
                                        />
                                        <button
                                            onClick={() => deleteAsset(asset.id)}
                                            className="absolute top-1 right-1 p-0.5 bg-white shadow rounded-full text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                                {assets.filter(a => a.categoryId === category.id).length === 0 && (
                                    <div className="col-span-2 text-center text-xs text-gray-400 py-4 italic">
                                        비어있음
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}

                {/* Legacy / Test Item */}
                <div 
                  className="p-4 bg-blue-50 border border-blue-200 rounded cursor-move hover:shadow-md transition-shadow"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('type', 'rect')
                  }}
                >
                    <div className="w-full h-12 bg-blue-500 rounded mb-2"></div>
                    <span className="text-sm font-medium text-gray-700">Test Item (Blue Box)</span>
                </div>
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
