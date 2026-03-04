import React, { useState } from 'react'

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (data: { name: string; price: string; siteUrl: string }) => void
}

export const UploadModal = ({ isOpen, onClose, onConfirm }: UploadModalProps) => {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [siteUrl, setSiteUrl] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConfirm({ name, price, siteUrl })
    // Reset form
    setName('')
    setPrice('')
    setSiteUrl('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-slide-up ring-1 ring-black/5">
        <h2 className="text-2xl font-semibold mb-6 text-primary tracking-tight">아이템 정보 입력</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2 ml-1">
              이름
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-surface border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 transition-shadow text-primary placeholder:text-gray-400"
              placeholder="예: 여름 티셔츠"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2 ml-1">
              가격
            </label>
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-4 py-3 bg-surface border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 transition-shadow text-primary placeholder:text-gray-400"
              placeholder="예: 35,000원"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2 ml-1">
              구매 사이트 주소
            </label>
            <input
              type="url"
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
              className="w-full px-4 py-3 bg-surface border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/10 transition-shadow text-primary placeholder:text-gray-400"
              placeholder="https://example.com/product"
            />
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-sm font-medium text-secondary-foreground bg-secondary hover:bg-gray-200 rounded-full transition-colors active:scale-95"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-6 py-3 text-sm font-medium text-primary-foreground bg-primary hover:bg-black/90 rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95"
            >
              확인
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
