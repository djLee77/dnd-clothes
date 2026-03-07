import React, { useState, useRef } from 'react'
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { X, Check } from 'lucide-react'

interface ImageCropModalProps {
  isOpen: boolean
  imageUrl: string
  onClose: () => void
  onCropComplete: (croppedImgb64: string) => void
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({ isOpen, imageUrl, onClose, onCropComplete }) => {
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const imgRef = useRef<HTMLImageElement>(null)

  if (!isOpen) return null

  const handleComplete = async () => {
    if (completedCrop && imgRef.current && completedCrop.width > 0 && completedCrop.height > 0) {
      const croppedImage = await getCroppedImg(imgRef.current, completedCrop)
      onCropComplete(croppedImage)
    } else {
      onClose()
    }
  }

  // Helper to extract the cropped area as a base64 string
  const getCroppedImg = (image: HTMLImageElement, crop: PixelCrop): Promise<string> => {
    const canvas = document.createElement('canvas')
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    
    canvas.width = crop.width
    canvas.height = crop.height
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return Promise.reject(new Error('No 2d context'))

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    )

    return new Promise((resolve) => {
      resolve(canvas.toDataURL('image/png', 1.0))
    })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-black tracking-tight text-gray-800">이미지 자르기</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[60vh] flex items-center justify-center bg-gray-50 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
          <ReactCrop 
            crop={crop} 
            onChange={c => setCrop(c)} 
            onComplete={c => setCompletedCrop(c)}
            className="max-h-full max-w-full shadow-lg rounded-lg overflow-hidden"
          >
            <img 
              ref={imgRef}
              src={imageUrl} 
              alt="Crop target" 
              className="max-h-[50vh] object-contain"
              crossOrigin="anonymous" // Important for external images if applicable
            />
          </ReactCrop>
        </div>

        <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:text-black transition-all active:scale-95"
          >
            취소
          </button>
          <button 
            onClick={handleComplete}
            className="flex items-center gap-2 px-8 py-2.5 rounded-xl font-bold text-white bg-black hover:bg-gray-800 shadow-md hover:shadow-xl hover:shadow-gray-200 transition-all active:scale-95"
          >
            <Check size={18} />
            적용하기
          </button>
        </div>
      </div>
    </div>
  )
}
