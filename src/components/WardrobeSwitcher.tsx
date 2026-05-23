import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { db, type Wardrobe } from '../db'
import {
  getCurrentWardrobeId,
  switchWardrobe,
  onWardrobeChange,
} from '../store/useWardrobeStore'

export default function WardrobeSwitcher() {
  const navigate = useNavigate()
  const [wardrobes, setWardrobes] = useState<Wardrobe[]>([])
  const [activeId, setActiveId] = useState<string | null>(getCurrentWardrobeId())
  const [open, setOpen] = useState(false)

  const refresh = () => {
    db.wardrobes.orderBy('order').toArray().then(setWardrobes)
  }

  useEffect(() => {
    refresh()
    return onWardrobeChange((id) => setActiveId(id))
  }, [])

  const active = wardrobes.find((w) => w.id === activeId)

  return (
    <>
      {/* 切换栏 */}
      <div className="flex items-center justify-center gap-2 px-4 py-1.5">
        <button
          onClick={() => { refresh(); setOpen(!open) }}
          className="text-sm text-gray-500 flex items-center gap-1"
        >
          <span>{active?.name || '选择衣橱'}</span>
          <span className="text-xs">{open ? '▲' : '▼'}</span>
        </button>
      </div>

      {/* 下拉选择弹窗 */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/20"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-t-2xl p-4 pb-8 safe-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-semibold text-gray-500 mb-3">切换衣橱</h3>
            <div className="space-y-1">
              {wardrobes.map((w) => (
                <button
                  key={w.id}
                  onClick={() => {
                    switchWardrobe(w.id)
                    setOpen(false)
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm ${
                    w.id === activeId
                      ? 'bg-[#FFE4E1] text-[#FFB6C1] font-medium'
                      : 'text-gray-700'
                  }`}
                >
                  {w.name}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                navigate('/wardrobes')
                setOpen(false)
              }}
              className="w-full mt-3 py-3 text-sm text-[#FFB6C1] border border-[#FFB6C1] rounded-full"
            >
              管理衣橱
            </button>
          </div>
        </div>
      )}
    </>
  )
}
