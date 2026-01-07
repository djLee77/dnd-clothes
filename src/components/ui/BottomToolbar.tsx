import { useState } from 'react'
import { useUiStore } from '../../store/uiStore'
import { useSceneStore } from '../../store/sceneStore'
import { Wand2, Loader2, X, BringToFront, SendToBack, MoveUp, MoveDown } from 'lucide-react'
import { removeBackground } from '@imgly/background-removal'

export const BottomToolbar = () => {
    const { selectedItemId, setSelectedItemId, assetLocation } = useUiStore()
    const { items, updateItem, bringToFront, sendToBack, moveForward, moveBackward } = useSceneStore()
    const [isProcessing, setIsProcessing] = useState(false)

    const selectedItem = items.find(i => i.id === selectedItemId)

    const handleRemoveBackground = async () => {
        if (!selectedItem || selectedItem.type !== 'image' || !selectedItem.src) return

        try {
            setIsProcessing(true)
            const imageSrc = selectedItem.src
            
            const blob = await removeBackground(imageSrc)
            
            // Convert to base64 to ensure persistence when saving/loading scraps
            const reader = new FileReader()
            reader.readAsDataURL(blob)
            reader.onloadend = () => {
                const base64data = reader.result as string
                updateItem(selectedItem.id, { src: base64data })
            }
        } catch (error) {
            console.error('Failed to remove background:', error)
            alert('배경 제거에 실패했습니다.')
        } finally {
            setIsProcessing(false)
        }
    }

    if (!selectedItemId || !selectedItem) return null

    return (
        <div className={`flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur-xl rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/50 ${assetLocation === 'bottom' ? 'animate-slide-down origin-top' : 'animate-slide-up origin-bottom'}`}>
            {/* Selection Info (Optional) */}
            <div className="flex items-center gap-3 px-3 border-r border-gray-200">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Selected</span>
                <span className="text-sm font-bold text-gray-800 truncate max-w-[120px]">{selectedItem.name || 'Untitled'}</span>
                <button 
                    onClick={() => setSelectedItemId(null)}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X size={14} className="text-gray-400 hover:text-gray-600" />
                </button>
            </div>

            {/* Actions */}
            <div className="flex items-center pl-1">
                <div className="flex items-center gap-1 mr-3 pr-3 border-r border-gray-100">
                    <button
                        onClick={() => bringToFront(selectedItem.id)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400 hover:text-black hover:scale-110 active:scale-90"
                        title="맨 앞으로"
                    >
                        <BringToFront size={18} />
                    </button>
                    <button
                        onClick={() => moveForward(selectedItem.id)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400 hover:text-black hover:scale-110 active:scale-90"
                        title="앞으로"
                    >
                        <MoveUp size={18} />
                    </button>
                    <button
                        onClick={() => moveBackward(selectedItem.id)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400 hover:text-black hover:scale-110 active:scale-90"
                        title="뒤로"
                    >
                        <MoveDown size={18} />
                    </button>
                    <button
                        onClick={() => sendToBack(selectedItem.id)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400 hover:text-black hover:scale-110 active:scale-90"
                        title="맨 뒤로"
                    >
                        <SendToBack size={18} />
                    </button>
                </div>

                {selectedItem.type === 'image' && (
                    <button
                        onClick={handleRemoveBackground}
                        disabled={isProcessing}
                        className={`
                            relative overflow-hidden flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all group mr-2
                            ${isProcessing 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'text-white hover:shadow-lg hover:scale-105 active:scale-95'
                            }
                        `}
                    >
                        {!isProcessing && (
                            <div className="absolute inset-0 bg-gradient-to-r from-brand-orange to-brand-green group-hover:opacity-90 transition-opacity"></div>
                        )}
                        
                        <div className="relative z-10 flex items-center gap-2">
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
                        </div>
                    </button>
                )}


            </div>
        </div>
    )
}
