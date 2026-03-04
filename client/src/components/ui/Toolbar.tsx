import React from 'react'
import { MousePointer2, Hand, Square, Circle, Type } from 'lucide-react'
import { useUiStore, ToolType } from '../../store/uiStore'

export const Toolbar = () => {
  const { activeTool, setActiveTool } = useUiStore()

  const tools: { id: ToolType; icon: React.ReactNode; label: string }[] = [
    { id: 'select', icon: <MousePointer2 size={20} />, label: 'Selection' },
    { id: 'hand', icon: <Hand size={20} />, label: 'Pan Tool' },
    { id: 'rect', icon: <Square size={20} />, label: 'Rectangle' },
    { id: 'circle', icon: <Circle size={20} />, label: 'Circle' },
    { id: 'text', icon: <Type size={20} />, label: 'Text' },
  ]

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-lg border border-gray-200 p-2 flex gap-2 pointer-events-auto">
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => setActiveTool(tool.id)}
          className={`p-2 rounded-lg transition-colors duration-200 ${
            activeTool === tool.id
              ? 'bg-blue-100 text-blue-600'
              : 'hover:bg-gray-100 text-gray-600'
          }`}
          title={tool.label}
        >
          {tool.icon}
        </button>
      ))}
    </div>
  )
}
