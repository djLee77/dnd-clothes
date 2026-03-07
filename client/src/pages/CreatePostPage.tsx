import { useState, useEffect, useRef } from 'react'
import { Navbar } from '../components/ui/Navbar'
import { useNavigate } from 'react-router-dom'
import { useScrapStore, Scrap } from '../store/scrapStore'
import { useAuthStore } from '../store/authStore'
import { usePostStore } from '../store/postStore'
import {
  ArrowLeft, Sparkles, Image as ImageIcon, X, Check,
  Layout, Calendar, ChevronDown, Hash, Type, AlignLeft,
  Send, Loader2, AlertCircle
} from 'lucide-react'

export const CreatePostPage = () => {
  const navigate = useNavigate()
  const { scraps, fetchScraps, isLoading: scrapsLoading } = useScrapStore()
  const { user } = useAuthStore()
  const { createPost } = usePostStore()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [selectedScrapIds, setSelectedScrapIds] = useState<number[]>([])
  const [isScrapPickerOpen, setIsScrapPickerOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [charCount, setCharCount] = useState(0)

  const titleRef = useRef<HTMLInputElement>(null)
  const tagInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchScraps()
  }, [fetchScraps])

  useEffect(() => {
    titleRef.current?.focus()
  }, [])

  useEffect(() => {
    setCharCount(content.length)
  }, [content])

  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '')
    if (trimmed && !tags.includes(trimmed) && tags.length < 5) {
      setTags([...tags, trimmed])
      setTagInput('')
    }
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      handleAddTag()
    }
    if (e.key === 'Backspace' && tagInput === '' && tags.length > 0) {
      setTags(tags.slice(0, -1))
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  const toggleScrapSelection = (scrapId: number) => {
    setSelectedScrapIds(prev =>
      prev.includes(scrapId)
        ? prev.filter(id => id !== scrapId)
        : [...prev, scrapId]
    )
  }

  const selectedScraps = scraps.filter(s => selectedScrapIds.includes(s.id))

  const isFormValid = title.trim().length > 0 && content.trim().length > 0

  const handleSubmit = async () => {
    if (!isFormValid || isSubmitting) return
    setIsSubmitting(true)
    setError(null)

    try {
      const thumbnail = selectedScraps.length > 0 ? (selectedScraps[0].thumbnail || null) : null
      await createPost(title, content, tags, selectedScrapIds, thumbnail)

      // Navigate back to community page after successful submission
      navigate('/')
    } catch (err: any) {
      setError(err.message || '게시글 작성에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <Navbar />

      <main className="pt-20 sm:pt-24 pb-12 px-4 sm:px-6 max-w-4xl mx-auto">
        {/* Back Button & Title */}
        <div className="flex items-center gap-3 mb-8 sm:mb-10">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 sm:w-11 sm:h-11 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 hover:text-black hover:border-gray-200 hover:shadow-sm transition-all active:scale-95"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md shadow-violet-200">
                <Sparkles size={12} className="text-white sm:hidden" />
                <Sparkles size={14} className="text-white hidden sm:block" />
              </div>
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-violet-500">New Post</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-black tracking-tight">새 글 작성</h1>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center gap-3 px-5 py-4 bg-red-50 border border-red-100 rounded-2xl animate-shake">
            <AlertCircle size={18} className="text-red-500 shrink-0" />
            <p className="text-sm font-medium text-red-600">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-[2rem] border border-gray-100/50 shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden">
          {/* Title Section */}
          <div className="p-6 sm:p-8 border-b border-gray-50">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center">
                <Type size={16} className="text-gray-400" />
              </div>
              <label className="text-xs font-black uppercase tracking-[0.15em] text-gray-400">제목</label>
            </div>
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="멋진 코디를 소개해보세요!"
              maxLength={100}
              className="w-full text-xl sm:text-2xl font-extrabold text-gray-900 placeholder:text-gray-200 focus:outline-none bg-transparent"
            />
            <div className="mt-2 text-right">
              <span className={`text-[11px] font-bold ${title.length > 80 ? 'text-orange-500' : 'text-gray-300'}`}>
                {title.length}/100
              </span>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 sm:p-8 border-b border-gray-50">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center">
                <AlignLeft size={16} className="text-gray-400" />
              </div>
              <label className="text-xs font-black uppercase tracking-[0.15em] text-gray-400">내용</label>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="코디에 대한 이야기를 자유롭게 적어주세요. 어떤 상황에서 입으면 좋은지, 스타일링 팁 등을 공유해보세요!"
              rows={6}
              maxLength={2000}
              className="w-full text-[15px] sm:text-base text-gray-700 placeholder:text-gray-200 focus:outline-none bg-transparent leading-relaxed resize-none font-medium"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[11px] font-medium text-gray-300">마크다운을 지원합니다</span>
              <span className={`text-[11px] font-bold ${charCount > 1800 ? 'text-orange-500' : 'text-gray-300'}`}>
                {charCount}/2000
              </span>
            </div>
          </div>

          {/* Tags Section */}
          <div className="p-6 sm:p-8 border-b border-gray-50">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center">
                <Hash size={16} className="text-gray-400" />
              </div>
              <label className="text-xs font-black uppercase tracking-[0.15em] text-gray-400">태그</label>
              <span className="text-[10px] font-bold text-gray-300 ml-1">(최대 5개)</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {tags.map(tag => (
                <div
                  key={tag}
                  className="group/tag flex items-center gap-1.5 px-3.5 py-1.5 bg-violet-50 text-violet-600 rounded-full text-sm font-bold hover:bg-violet-100 transition-colors"
                >
                  <span>#{tag}</span>
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="w-4 h-4 rounded-full bg-violet-200/50 flex items-center justify-center text-violet-500 hover:bg-violet-300 hover:text-white transition-all opacity-0 group-hover/tag:opacity-100"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
              {tags.length < 5 && (
                <input
                  ref={tagInputRef}
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  onBlur={handleAddTag}
                  placeholder={tags.length === 0 ? "태그 입력 후 Enter" : "추가..."}
                  className="flex-1 min-w-[100px] text-sm font-medium text-gray-700 placeholder:text-gray-300 focus:outline-none bg-transparent py-1.5"
                />
              )}
            </div>
          </div>

          {/* Scrap Selection Section */}
          <div className="p-6 sm:p-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-50 to-indigo-50 rounded-xl flex items-center justify-center">
                  <Layout size={16} className="text-violet-500" />
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-[0.15em] text-gray-400">스크랩 첨부</label>
                  <p className="text-[11px] text-gray-300 font-medium mt-0.5">내 대시보드의 스크랩을 게시글에 첨부하세요</p>
                </div>
              </div>
              <button
                onClick={() => setIsScrapPickerOpen(!isScrapPickerOpen)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all active:scale-95 ${
                  isScrapPickerOpen
                    ? 'bg-black text-white shadow-lg'
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-black border border-gray-100'
                }`}
              >
                <ImageIcon size={16} />
                <span className="hidden sm:inline">스크랩 선택</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-300 ${isScrapPickerOpen ? 'rotate-180' : ''}`}
                />
              </button>
            </div>

            {/* Selected Scraps Preview */}
            {selectedScraps.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Check size={14} className="text-emerald-500" />
                  <span className="text-xs font-bold text-emerald-600">{selectedScraps.length}개 선택됨</span>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none -mx-2 px-2">
                  {selectedScraps.map(scrap => (
                    <SelectedScrapCard
                      key={scrap.id}
                      scrap={scrap}
                      onRemove={() => toggleScrapSelection(scrap.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Scrap Picker */}
            {isScrapPickerOpen && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-4 sm:p-5">
                  {scrapsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 size={24} className="text-gray-300 animate-spin" />
                    </div>
                  ) : scraps.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-14 h-14 bg-white rounded-2xl border border-gray-100 flex items-center justify-center text-gray-200 mb-4">
                        <Layout size={28} strokeWidth={1.5} />
                      </div>
                      <h4 className="text-sm font-bold text-gray-500 mb-1">스크랩이 없습니다</h4>
                      <p className="text-xs text-gray-400 font-medium mb-4">에디터에서 코디 스크랩을 먼저 만들어보세요!</p>
                      <button
                        onClick={() => navigate('/editor')}
                        className="px-5 py-2.5 bg-black text-white rounded-xl text-xs font-bold hover:scale-105 active:scale-95 transition-all"
                      >
                        에디터로 이동
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {scraps.map(scrap => (
                        <ScrapPickerCard
                          key={scrap.id}
                          scrap={scrap}
                          isSelected={selectedScrapIds.includes(scrap.id)}
                          onToggle={() => toggleScrapSelection(scrap.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Area */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 sm:gap-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center overflow-hidden">
              <span className="text-xs font-black text-gray-500">
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-700">{user?.username || '사용자'}</p>
              <p className="text-[10px] text-gray-400 font-medium">으로 게시</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 sm:flex-none px-6 py-3.5 bg-white border border-gray-100 text-gray-500 rounded-2xl font-bold text-sm hover:bg-gray-50 hover:text-black transition-all active:scale-95"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmitting}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-95 ${
                isFormValid && !isSubmitting
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-200 hover:shadow-xl hover:shadow-violet-300 hover:scale-105'
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  게시 중...
                </>
              ) : (
                <>
                  <Send size={16} />
                  게시하기
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

/* ─── Sub-components ─── */

const ScrapPickerCard = ({
  scrap,
  isSelected,
  onToggle,
}: {
  scrap: Scrap
  isSelected: boolean
  onToggle: () => void
}) => {
  return (
    <button
      onClick={onToggle}
      className={`group relative bg-white rounded-2xl border overflow-hidden transition-all duration-300 text-left hover:shadow-md active:scale-[0.97] ${
        isSelected
          ? 'border-violet-300 ring-2 ring-violet-200 shadow-md shadow-violet-100'
          : 'border-gray-100 hover:border-gray-200'
      }`}
    >
      {/* Thumbnail */}
      <div className="aspect-[1.3/1] bg-gradient-to-br from-gray-50 to-gray-100 relative flex items-center justify-center overflow-hidden">
        {scrap.thumbnail ? (
          <img
            src={scrap.thumbnail}
            alt={scrap.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-200 border border-gray-50">
            <Layout size={20} strokeWidth={1.5} />
          </div>
        )}

        {/* Selection Overlay */}
        <div
          className={`absolute inset-0 transition-all duration-300 ${
            isSelected
              ? 'bg-violet-500/10'
              : 'bg-transparent group-hover:bg-black/5'
          }`}
        />

        {/* Check Badge */}
        <div
          className={`absolute top-2.5 right-2.5 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
            isSelected
              ? 'bg-violet-500 text-white scale-100 shadow-lg shadow-violet-300'
              : 'bg-white/80 text-gray-300 scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100 border border-gray-200'
          }`}
        >
          <Check size={12} strokeWidth={3} />
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h4 className="text-xs font-bold text-gray-800 truncate leading-tight">{scrap.name}</h4>
        <div className="flex items-center gap-1.5 mt-1.5">
          <Calendar size={10} className="text-gray-300" />
          <span className="text-[10px] text-gray-400 font-medium">
            {new Date(scrap.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>
    </button>
  )
}

const SelectedScrapCard = ({
  scrap,
  onRemove,
}: {
  scrap: Scrap
  onRemove: () => void
}) => {
  return (
    <div className="relative group shrink-0 w-28 sm:w-32">
      <div className="bg-white rounded-2xl border border-violet-200 overflow-hidden shadow-sm shadow-violet-50">
        <div className="aspect-[1.3/1] bg-gradient-to-br from-violet-50/50 to-indigo-50/50 relative flex items-center justify-center overflow-hidden">
          {scrap.thumbnail ? (
            <img
              src={scrap.thumbnail}
              alt={scrap.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center text-violet-300 border border-violet-100">
              <Layout size={16} strokeWidth={1.5} />
            </div>
          )}
        </div>
        <div className="px-2.5 py-2">
          <p className="text-[10px] font-bold text-gray-700 truncate">{scrap.name}</p>
        </div>
      </div>
      {/* Remove button */}
      <button
        onClick={onRemove}
        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 hover:scale-110 transition-all"
      >
        <X size={10} />
      </button>
    </div>
  )
}
