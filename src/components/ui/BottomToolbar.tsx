import React, { useState } from 'react'
import { useUiStore } from '../../store/uiStore'
import { useSceneStore } from '../../store/sceneStore'
import { Wand2, Loader2, X } from 'lucide-react'
import { removeBackground } from '@imgly/background-removal'

export const BottomToolbar = () => {
    const { selectedItemId, setSelectedItemId } = useUiStore()
    const { items, updateItem } = useSceneStore()
    const [isProcessing, setIsProcessing] = useState(false)

    const selectedItem = items.find(i => i.id === selectedItemId)

    const handleRemoveBackground = async () => {
        if (!selectedItem || selectedItem.type !== 'image' || !selectedItem.src) return

        try {
            setIsProcessing(true)
            const imageSrc = selectedItem.src

            // Convert data URL or remote URL to Blob if necessary, 
            // but removeBackground handles URLs heavily.
            // Note: If using public URL, CORS might be an issue if not configured.
            // Since we are using dataURLs (base64) mostly from upload, it should be fine.
            
            const blob = await removeBackground(imageSrc)
            const newUrl = URL.createObjectURL(blob)

            updateItem(selectedItem.id, { src: newUrl })
        } catch (error) {
            console.error('Failed to remove background:', error)
            alert('배경 제거에 실패했습니다.')
        } finally {
            setIsProcessing(false)
        }
    }

    if (!selectedItemId || !selectedItem) return null

    return (
        <div className="flex items-center gap-2 px-2 py-2 bg-white/80 backdrop-blur-xl rounded-full shadow-2xl border border-white/50 ring-1 ring-black/5 animate-slide-up origin-bottom">
            {/* Selection Info (Optional) */}
            <div className="flex items-center gap-2 px-3 border-r border-gray-200/50">
                <span className="text-xs font-semibold text-gray-500">Selected</span>
                <span className="text-xs font-bold text-primary truncate max-w-[100px]">{selectedItem.name || 'Untitled'}</span>
                <button 
                    onClick={() => setSelectedItemId(null)}
                    className="p-0.5 hover:bg-black/5 rounded-full"
                >
                    <X size={12} className="text-gray-400" />
                </button>
            </div>

            {/* Actions */}
            <div className="flex items-center pl-1">
                {selectedItem.type === 'image' && (
                    <button
                        onClick={handleRemoveBackground}
                        disabled={isProcessing}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all
                            ${isProcessing 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-primary text-primary-foreground hover:shadow-lg hover:scale-105 active:scale-95'
                            }
                        `}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                <span>Processing...</span>
                            </>
                        ) : (
                            <>
                                <Wand2 size={16} />
                                <span>누끼 따기</span>
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    )
}
