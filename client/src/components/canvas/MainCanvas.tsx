import React, { useEffect, useRef, useState } from 'react'
import { Stage, Layer, Rect, Transformer } from 'react-konva'
import { useSceneStore } from '../../store/sceneStore'
import { useCanvasStore } from '../../store/canvasStore'
import { useUiStore } from '../../store/uiStore'
import { GridBackground } from '../ui/GridBackground'
import { URLImage } from './URLImage'
import { ItemFloatingToolbar } from './ItemFloatingToolbar'
import { ImageCropModal } from './ImageCropModal'
export const MainCanvas = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const { scale, position, setPosition, setScale } = useCanvasStore()
  const { items, addItem, updateItem, removeItem } = useSceneStore()
  const { selectedItemId, setSelectedItemId, setStageRef } = useUiStore()
  const stageRef = useRef<any>(null)
  const transformerRef = useRef<any>(null)
  const [toolbarPosition, setToolbarPosition] = useState<{x: number, y: number} | null>(null)

  // Crop Modal State
  const [isCropModalOpen, setIsCropModalOpen] = useState(false)
  const [croppingImageUrl, setCroppingImageUrl] = useState('')
  const [croppingItemId, setCroppingItemId] = useState<string | null>(null)

  useEffect(() => {
    if (stageRef.current) {
        setStageRef(stageRef.current)
    }
  }, [setStageRef, items, selectedItemId])

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        })
      }
    }

    window.addEventListener('resize', updateDimensions)
    updateDimensions()

    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  // Keyboard shortcut: Delete/Backspace to remove selected item
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedItemId) return
      // Don't delete if user is typing in an input/textarea
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        removeItem(selectedItemId)
        setSelectedItemId(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedItemId, removeItem, setSelectedItemId])

  // Update Transformer selection and Toolbar position
  useEffect(() => {
    if (selectedItemId && transformerRef.current && stageRef.current) {
      const selectedNode = stageRef.current.findOne('#' + selectedItemId)
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode])
        transformerRef.current.getLayer().batchDraw()
        // Konva's getClientRect() returns the rect relative to the top-left of the canvas container, properly handling stage scale & position.
        const rect = selectedNode.getClientRect()
        setToolbarPosition({ x: rect.x + rect.width, y: rect.y })
      } else {
        transformerRef.current.nodes([])
        setToolbarPosition(null)
      }
    } else if (transformerRef.current) {
      transformerRef.current.nodes([])
      transformerRef.current.getLayer().batchDraw()
      setToolbarPosition(null)
    }
  }, [selectedItemId, items, scale, position])


  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const type = e.dataTransfer.getData('type')
    
    if (type && stageRef.current) {
      stageRef.current.setPointersPositions(e)
      const pointerPosition = stageRef.current.getRelativePointerPosition()
      
      if (pointerPosition) {
        if (type === 'image') {
          const src = e.dataTransfer.getData('src')
          const name = e.dataTransfer.getData('name')
          const price = e.dataTransfer.getData('price')
          const siteUrl = e.dataTransfer.getData('siteUrl')

          if (src) {
             addItem({
                type: 'image',
                x: pointerPosition.x,
                y: pointerPosition.y,
                width: 200,
                height: 200,
                fill: 'transparent',
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                src: src,
                originalSrc: src,
                name: name,
                price: price,
                siteUrl: siteUrl
             })
          }

        } else {
            addItem({
                type: type as 'rect' | 'circle',
                x: pointerPosition.x,
                y: pointerPosition.y,
                width: 100,
                height: 100,
                fill: 'blue',
                rotation: 0,
                scaleX: 1,
                scaleY: 1
            })
        }
      }
    }
  }

  return (
    <div 
        ref={containerRef} 
        className="w-full h-full bg-white overflow-hidden relative"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
    >
      <GridBackground interactive={false} />
      {/* Lighting Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(255,255,255,0.8)_100%)] z-0" />
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        draggable
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        onMouseDown={(e) => {
          // Deselect if clicked on empty stage
          if (e.target === e.target.getStage()) {
            setSelectedItemId(null)
          }
        }}
        onDragEnd={(e) => {
          // Only update position if the stage itself was dragged
          if (e.target === e.target.getStage()) {
            setPosition({ x: e.target.x(), y: e.target.y() })
          }
        }}
        onWheel={(e) => {
          e.evt.preventDefault()
          const scaleBy = 1.1
          const oldScale = e.target.scaleX()
          const pointer = e.target.getStage()?.getPointerPosition()

          if (!pointer) return

          const mousePointTo = {
            x: (pointer.x - e.target.x()) / oldScale,
            y: (pointer.y - e.target.y()) / oldScale,
          }

          const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy
          setScale(newScale)

          const newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
          }
          setPosition(newPos)
        }}
      >
        <Layer>
           {items.map(item => {
                if (item.type === 'image' && item.src) {
                    return (
                        <URLImage
                            key={item.id}
                            id={item.id}
                            src={item.src}
                            x={item.x}
                            y={item.y}
                            width={item.width}
                            height={item.height}
                            scaleX={item.scaleX || 1}
                            scaleY={item.scaleY || 1}
                            rotation={item.rotation}
                            draggable
                            isSelected={selectedItemId === item.id}
                            onClick={() => {
                                setSelectedItemId(item.id)
                            }}
                            onDragEnd={(e) => {
                                updateItem(item.id, {
                                    x: e.target.x(),
                                    y: e.target.y()
                                })
                            }}
                            onTransformEnd={(e) => {
                                const node = e.target
                                updateItem(item.id, {
                                    x: node.x(),
                                    y: node.y(),
                                    rotation: node.rotation(),
                                    scaleX: node.scaleX(),
                                    scaleY: node.scaleY(),
                                })
                            }}
                        />
                    )
                }
                return (
                    <Rect
                        key={item.id}
                        id={item.id}
                        x={item.x}
                        y={item.y}
                        width={item.width}
                        height={item.height}
                        scaleX={item.scaleX || 1}
                        scaleY={item.scaleY || 1}
                        fill={item.fill}
                        rotation={item.rotation}
                        draggable
                        cornerRadius={8}
                        onDragEnd={(e) => {
                            updateItem(item.id, {
                                x: e.target.x(),
                                y: e.target.y()
                            })
                        }}
                        onTransformEnd={(e) => {
                           const node = e.target
                           updateItem(item.id, {
                               x: node.x(),
                               y: node.y(),
                               rotation: node.rotation(),
                               scaleX: node.scaleX(),
                               scaleY: node.scaleY(),
                           })
                        }}
                        onClick={() => setSelectedItemId(item.id)}
                        stroke={selectedItemId === item.id ? 'blue' : undefined}
                        strokeWidth={selectedItemId === item.id ? 2 : 0}
                    />
                )
           })}
           <Transformer 
             ref={transformerRef} 
             boundBoxFunc={(oldBox, newBox) => {
               // Limit minimum size to 5px
               if (newBox.width < 5 || newBox.height < 5) {
                 return oldBox
               }
               return newBox
             }}
           />
        </Layer>
      </Stage>

      {/* Floating Toolbar */}
      {selectedItemId && toolbarPosition && (
        <ItemFloatingToolbar
          itemId={selectedItemId}
          x={toolbarPosition.x}
          y={toolbarPosition.y}
          isVisible={true}
          onDelete={() => setSelectedItemId(null)}
          onCropClick={() => {
            const item = items.find(i => i.id === selectedItemId)
            if (item && item.type === 'image' && item.src) {
              setCroppingImageUrl(item.originalSrc || item.src)
              setCroppingItemId(item.id)
              setIsCropModalOpen(true)
            }
          }}
        />
      )}

      {/* Image Crop Modal */}
      <ImageCropModal 
        isOpen={isCropModalOpen}
        imageUrl={croppingImageUrl}
        onClose={() => {
          setIsCropModalOpen(false)
          setCroppingImageUrl('')
          setCroppingItemId(null)
        }}
        onCropComplete={(croppedBase64, w, h) => {
          if (croppingItemId) {
            const item = items.find(i => i.id === croppingItemId)
            const currentWidth = item ? item.width * (item.scaleX || 1) : 200
            const newWidth = currentWidth
            const newHeight = w > 0 ? currentWidth * (h / w) : currentWidth

            updateItem(croppingItemId, { 
                src: croppedBase64,
                width: newWidth,
                height: newHeight,
                // Reset scale to 1 so the newly cropped image dimensions are properly matched
                scaleX: 1, 
                scaleY: 1 
            })
          }
          setIsCropModalOpen(false)
          setCroppingImageUrl('')
          setCroppingItemId(null)
        }}
      />
    </div>
  )
}
