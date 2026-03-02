import React, { useState, useEffect, useCallback, useRef } from 'react'
import { ChevronRight, ChevronLeft, X, Sparkles, MousePointerClick } from 'lucide-react'

interface TutorialStep {
  selector: string
  title: string
  description: string
  position: 'top' | 'bottom' | 'left' | 'right'
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    selector: '[data-tutorial="navbar-logo"]',
    title: '🏠 홈으로 돌아가기',
    description: '로고를 클릭하면 언제든지 메인 화면으로 돌아갈 수 있어요.',
    position: 'bottom',
  },
  {
    selector: '[data-tutorial="navbar-dashboard"]',
    title: '📋 대시보드',
    description: '대시보드에서 저장한 코디 보드들을 한눈에 확인하고 관리할 수 있어요.',
    position: 'bottom',
  },
  {
    selector: '[data-tutorial="canvas-area"]',
    title: '🎨 스크랩보드 캔버스',
    description: '여기가 메인 작업 공간이에요! 사이드바에서 옷을 드래그하여 캔버스 위에 놓으면 자유롭게 배치할 수 있어요.',
    position: 'right',
  },
  {
    selector: '[data-tutorial="sidebar"]',
    title: '📂 사이드바 패널',
    description: '에셋(옷 이미지)을 카테고리별로 관리하고, 스크랩을 저장/불러올 수 있는 패널이에요. 이미지를 드래그하여 캔버스에 놓아보세요!',
    position: 'left',
  },
  {
    selector: '[data-tutorial="add-category-input"]',
    title: '📁 카테고리 추가하기',
    description: '원하는 이름의 카테고리를 입력하고 + 버튼이나 엔터 키를 눌러 새 카테고리를 먼저 생성해주세요.',
    position: 'left',
  },
  {
    selector: '[data-tutorial="upload-image-btn"]',
    title: '📤 이미지 업로드 & 정보 입력',
    description: '생성된 카테고리의 업로드 아이콘을 눌러 옷 이미지를 추가하고 이름, 가격, 구매 링크 등을 입력할 수 있어요!',
    position: 'left',
  },
  {
    selector: '[data-tutorial="sidebar-expand"]',
    title: '↔️ 사이드바 확장',
    description: '이 버튼을 클릭하면 사이드바를 넓혀서 더 많은 에셋을 한눈에 볼 수 있어요.',
    position: 'left',
  },
  {
    selector: '[data-tutorial="move-to-bottom"]',
    title: '⬇️ 하단 바 모드',
    description: '에셋 목록을 화면 하단에 펼쳐볼 수도 있어요. 클릭하면 하단 바 모드로 전환됩니다.',
    position: 'top',
  },
]

const STORAGE_KEY = 'dnd-closet-tutorial-dismissed'

interface TutorialOverlayProps {
  onComplete: () => void
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [highlight, setHighlight] = useState<DOMRect | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({})
  const overlayRef = useRef<HTMLDivElement>(null)

  const updateHighlight = useCallback(() => {
    const step = TUTORIAL_STEPS[currentStep]
    if (!step) return

    const el = document.querySelector(step.selector)
    if (el) {
      const rect = el.getBoundingClientRect()
      setHighlight(rect)

      // Calculate tooltip position
      const padding = 16
      const tooltipWidth = 340
      const tooltipHeight = 180
      let style: React.CSSProperties = {}

      switch (step.position) {
        case 'bottom':
          style = {
            top: rect.bottom + padding,
            left: Math.max(padding, Math.min(rect.left + rect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - padding)),
          }
          break
        case 'top':
          style = {
            top: rect.top - tooltipHeight - padding,
            left: Math.max(padding, Math.min(rect.left + rect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - padding)),
          }
          break
        case 'left':
          style = {
            top: Math.max(padding, Math.min(rect.top + rect.height / 2 - tooltipHeight / 2, window.innerHeight - tooltipHeight - padding)),
            left: rect.left - tooltipWidth - padding,
          }
          break
        case 'right':
          style = {
            top: Math.max(padding, Math.min(rect.top + rect.height / 2 - tooltipHeight / 2, window.innerHeight - tooltipHeight - padding)),
            left: rect.right + padding,
          }
          break
      }

      setTooltipStyle(style)
    }
  }, [currentStep])

  useEffect(() => {
    setIsAnimating(true)
    const timeout = setTimeout(() => {
      updateHighlight()
      setIsAnimating(false)
    }, 150)

    return () => clearTimeout(timeout)
  }, [currentStep, updateHighlight])

  useEffect(() => {
    window.addEventListener('resize', updateHighlight)
    return () => window.removeEventListener('resize', updateHighlight)
  }, [updateHighlight])

  const goNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const goPrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleFinish = () => {
    onComplete()
  }

  const step = TUTORIAL_STEPS[currentStep]
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] transition-opacity duration-300"
      style={{ pointerEvents: 'auto' }}
    >
      {/* SVG overlay with cutout */}
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
        <defs>
          <mask id="tutorial-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {highlight && (
              <rect
                x={highlight.left - 8}
                y={highlight.top - 8}
                width={highlight.width + 16}
                height={highlight.height + 16}
                rx="16"
                ry="16"
                fill="black"
                className="transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.55)"
          mask="url(#tutorial-mask)"
          style={{ pointerEvents: 'auto' }}
        />
      </svg>

      {/* Pulsing ring around highlighted element */}
      {highlight && (
        <div
          className="absolute border-2 border-white/60 rounded-2xl transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] animate-pulse pointer-events-none"
          style={{
            left: highlight.left - 8,
            top: highlight.top - 8,
            width: highlight.width + 16,
            height: highlight.height + 16,
            boxShadow: '0 0 0 4px rgba(255,255,255,0.15), 0 0 30px rgba(255,255,255,0.1)',
          }}
        />
      )}

      {/* Tooltip Card */}
      {highlight && !isAnimating && (
        <div
          className="absolute z-[10000] w-[340px] animate-fade-in"
          style={tooltipStyle}
        >
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-white/80 overflow-hidden">
            {/* Step indicator bar */}
            <div className="h-1 bg-gray-100 relative">
              <div
                className="h-full bg-gradient-to-r from-gray-800 to-gray-600 transition-all duration-500 ease-out rounded-full"
                style={{ width: `${((currentStep + 1) / TUTORIAL_STEPS.length) * 100}%` }}
              />
            </div>

            <div className="p-6">
              {/* Step badge */}
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2.5 py-1 bg-gray-900 text-white text-[10px] font-black rounded-full uppercase tracking-wider">
                  Step {currentStep + 1}/{TUTORIAL_STEPS.length}
                </span>
                <Sparkles size={14} className="text-gray-400" />
              </div>

              {/* Title */}
              <h3 className="text-lg font-black text-gray-900 tracking-tight mb-2 leading-snug">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-500 font-medium leading-relaxed mb-5">
                {step.description}
              </p>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between">
                <button
                  onClick={goPrev}
                  disabled={currentStep === 0}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                >
                  <ChevronLeft size={16} />
                  이전
                </button>

                {isLastStep ? (
                  <button
                    onClick={handleFinish}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-black shadow-lg hover:shadow-gray-400/30 transition-all active:scale-95 hover:-translate-y-0.5"
                  >
                    <MousePointerClick size={16} />
                    시작하기
                  </button>
                ) : (
                  <button
                    onClick={goNext}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-black shadow-lg hover:shadow-gray-400/30 transition-all active:scale-95 hover:-translate-y-0.5"
                  >
                    다음
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Skip button */}
      <button
        onClick={handleFinish}
        className="fixed top-24 right-8 z-[10001] flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md text-white/80 text-sm font-bold rounded-full hover:bg-white/30 hover:text-white transition-all active:scale-95 border border-white/20"
      >
        <X size={14} />
        건너뛰기
      </button>
    </div>
  )
}

// --- Completion Modal ---

interface TutorialCompleteModalProps {
  onClose: (dontShowAgain: boolean) => void
}

export const TutorialCompleteModal: React.FC<TutorialCompleteModalProps> = ({ onClose }) => {
  const [dontShowAgain, setDontShowAgain] = useState(false)

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-[0_30px_80px_rgba(0,0,0,0.25)] border border-white/80 w-[400px] overflow-hidden animate-pop">
        {/* Top decorative bar */}
        <div className="h-1.5 bg-gradient-to-r from-gray-800 via-gray-500 to-gray-800" />

        <div className="p-8 text-center">
          {/* Icon */}
          <div className="w-16 h-16 mx-auto mb-5 bg-gray-900 rounded-2xl flex items-center justify-center shadow-lg shadow-gray-300">
            <Sparkles size={28} className="text-white" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">
            튜토리얼 완료! 🎉
          </h2>
          <p className="text-sm text-gray-500 font-medium leading-relaxed mb-6">
            모든 가이드를 확인했어요.<br />
            이제 자유롭게 코디를 시작해보세요!
          </p>

          {/* Don't show again checkbox */}
          <label className="flex items-center justify-center gap-3 mb-6 cursor-pointer group select-none">
            <div className="relative">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-5 h-5 bg-gray-100 border-2 border-gray-200 rounded-lg peer-checked:bg-gray-900 peer-checked:border-gray-900 transition-all flex items-center justify-center group-hover:border-gray-400">
                {dontShowAgain && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-sm font-bold text-gray-500 group-hover:text-gray-700 transition-colors">
              다시 보지 않기
            </span>
          </label>

          {/* Close button */}
          <button
            onClick={() => onClose(dontShowAgain)}
            className="w-full py-3.5 bg-gray-900 text-white text-sm font-bold rounded-2xl hover:bg-black shadow-lg hover:shadow-gray-400/30 transition-all active:scale-[0.98] hover:-translate-y-0.5"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}

// --- Hook ---

export const useTutorial = () => {
  const [showTutorial, setShowTutorial] = useState(false)
  const [showCompleteModal, setShowCompleteModal] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY)
    if (dismissed !== 'true') {
      // Small delay so DOM elements are mounted and positioned
      const timer = setTimeout(() => setShowTutorial(true), 800)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleTutorialComplete = () => {
    setShowTutorial(false)
    setShowCompleteModal(true)
  }

  const handleCloseComplete = (dontShowAgain: boolean) => {
    if (dontShowAgain) {
      localStorage.setItem(STORAGE_KEY, 'true')
    }
    setShowCompleteModal(false)
  }

  return {
    showTutorial,
    showCompleteModal,
    handleTutorialComplete,
    handleCloseComplete,
  }
}
