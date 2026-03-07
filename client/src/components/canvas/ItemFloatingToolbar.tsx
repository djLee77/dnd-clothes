import React from 'react'
import { BringToFront, SendToBack, MoveUp, MoveDown, Trash2 } from 'lucide-react'
import { useSceneStore } from '../../store/sceneStore'

interface ItemFloatingToolbarProps {
  itemId: string
  x: number
  y: number
  isVisible: boolean
  onDelete?: () => void
}

export const ItemFloatingToolbar: React.FC<ItemFloatingToolbarProps> = ({ itemId, x, y, isVisible, onDelete }) => {
  const { bringToFront, sendToBack, moveForward, moveBackward, removeItem } = useSceneStore()

  if (!isVisible) return null

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    removeItem(itemId)
    onDelete?.()
  }

  return (
    <div 
      className="absolute z-50 flex items-center gap-1 p-1.5 bg-white/90 backdrop-blur-md border border-white/80 rounded-full shadow-lg transition-all duration-200 animate-slide-up"
      style={{ 
        left: x, 
        top: y - 45, // Position above the item
        transform: 'translateX(-100%) translateX(20px)' // Align right edge with some padding
      }}
    >
      <button
        onClick={(e) => { e.stopPropagation(); bringToFront(itemId); }}
        className="p-1.5 hover:bg-gray-100 rounded-full text-gray-600 hover:text-black transition-colors"
        title="맨 앞으로"
      >
        <BringToFront size={16} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); moveForward(itemId); }}
        className="p-1.5 hover:bg-gray-100 rounded-full text-gray-600 hover:text-black transition-colors"
        title="앞으로"
      >
        <MoveUp size={16} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); moveBackward(itemId); }}
        className="p-1.5 hover:bg-gray-100 rounded-full text-gray-600 hover:text-black transition-colors"
        title="뒤로"
      >
        <MoveDown size={16} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); sendToBack(itemId); }}
        className="p-1.5 hover:bg-gray-100 rounded-full text-gray-600 hover:text-black transition-colors"
        title="맨 뒤로"
      >
        <SendToBack size={16} />
      </button>
      <div className="w-px h-5 bg-gray-200 mx-0.5" />
      <button
        onClick={handleDelete}
        className="p-1.5 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-500 transition-colors"
        title="삭제"
      >
        <Trash2 size={16} />
      </button>
    </div>
  )
}

