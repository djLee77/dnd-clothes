import { X, Layers, ChevronDown } from 'lucide-react'
import { useUiStore } from '../../store/uiStore'
import { useAssetStore } from '../../store/assetStore'
import { useSceneStore } from '../../store/sceneStore'

export const BottomAssetBar = () => {
  const { assetLocation, setAssetLocation, transitionTo, setTransitionTo } = useUiStore()
  const { categories, assets, deleteAsset } = useAssetStore()
  const { addItem } = useSceneStore()
  
  if (assetLocation !== 'bottom' && transitionTo !== 'sidebar') return null
  
  const handleClose = () => {
    setTransitionTo('sidebar')
    // Trigger sidebar immediately
    setTimeout(() => {
        setAssetLocation('sidebar')
    }, 10)
    
    setTimeout(() => {
        setTransitionTo(null)
    }, 550) // Match slide-out-down duration (0.5s) + small buffer
  }

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-3xl border-t border-white/60 shadow-[0_-20px_50px_rgb(0,0,0,0.15)] z-[60] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] flex flex-col p-4 sm:p-8 rounded-t-3xl sm:rounded-t-[3.5rem] h-[60vh] sm:h-[420px] ${transitionTo === 'sidebar' ? 'animate-slide-out-down' : 'animate-dramatic-slide-up'}`}
    >
      <div className="relative flex items-center justify-between mb-4 px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black text-white rounded-2xl flex items-center justify-center">
            <Layers size={20} />
          </div>
          <div>
            <h3 className="font-black text-xl text-gray-800 tracking-tight leading-none">Assets Library</h3>
            <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">Expanded View Mode</p>
          </div>
        </div>
        
        <div className="absolute left-1/2 -translate-x-1/2">
          <button 
            onClick={handleClose}
            className="w-14 h-11 bg-white shadow-lg border border-gray-100 flex flex-col items-center justify-center text-gray-400 hover:text-black hover:scale-110 active:scale-95 rounded-2xl transition-all group"
            title="사이드바 모드로 전환 및 닫기"
          >
            <ChevronDown size={28} className="group-hover:translate-y-1 transition-transform" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto flex gap-4 sm:gap-6 px-2 sm:px-4 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent items-start py-2">
        {categories.map(category => (
          <div key={category.id} className="flex-shrink-0 w-[85vw] sm:min-w-[420px] h-full flex flex-col">
            <div className="flex items-center justify-between mb-3 px-2 sm:px-4">
              <span className="font-extrabold text-sm text-gray-700">{category.name}</span>
              <span className="text-[10px] bg-gray-100 px-2.5 py-1 rounded-full text-gray-500 font-bold">
                {assets.filter(a => a.categoryId === category.id).length} Items
              </span>
            </div>
            
            <div className={`flex-1 bg-white/40 rounded-[2rem] p-4 flex gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory border border-white/60 shadow-inner transition-all duration-500`}>
                {assets.filter(a => a.categoryId === category.id).map((asset) => (
                    <div
                        className={`flex-shrink-0 relative group/asset p-4 sm:p-5 bg-white rounded-3xl cursor-pointer sm:cursor-move shadow-sm hover:shadow-2xl hover:-translate-y-2 sm:hover:-translate-y-3 transition-all duration-500 snap-start border border-gray-50 w-44 sm:w-56 h-full`}
                        draggable
                        onClick={() => {
                            addItem({
                                type: 'image',
                                x: window.innerWidth / 2 - 100,
                                y: window.innerHeight / 2 - 100,
                                width: 200,
                                height: 200,
                                fill: 'transparent',
                                rotation: 0,
                                scaleX: 1,
                                scaleY: 1,
                                src: asset.src,
                                name: asset.name,
                                price: asset.price,
                                siteUrl: asset.siteUrl
                            })
                        }}
                        onDragStart={(e) => {
                            e.dataTransfer.setData('type', 'image')
                            e.dataTransfer.setData('src', asset.src)
                            e.dataTransfer.setData('name', asset.name)
                            e.dataTransfer.setData('price', asset.price)
                            e.dataTransfer.setData('siteUrl', asset.siteUrl)
                        }}
                    >
                        <div className="aspect-square w-full flex items-center justify-center overflow-hidden mb-3 rounded-xl bg-gray-50/50">
                            <img 
                                src={asset.src} 
                                alt="Asset" 
                                className="max-w-full max-h-full object-contain drop-shadow-md group-hover/asset:scale-110 transition-all duration-500" 
                                draggable={false}
                            />
                        </div>
                        <div className="text-center px-1">
                            <p className="text-sm font-black text-gray-800 truncate">{asset.name || 'Untitled'}</p>
                            <p className="text-[11px] text-gray-400 font-bold mt-1">{asset.price}</p>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                deleteAsset(asset.id);
                            }}
                            className="absolute top-3 right-3 p-2 bg-white shadow-lg rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover/asset:opacity-100 transition-all scale-90 group-hover/asset:scale-100"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
          </div>
        ))}
        
        {categories.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-gray-300 font-bold border-2 border-dashed border-gray-100 rounded-3xl m-4">
            등록된 카테고리가 없습니다. 사이드바로 돌아가 카테고리를 추가해 주세요.
          </div>
        )}
      </div>
    </div>
  )
}
