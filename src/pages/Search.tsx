import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { db, type ClothingItem } from '../db'
import { getCurrentWardrobeId } from '../store/useWardrobeStore'
import ClothingCard from '../components/ClothingCard'

export default function Search() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [allItems, setAllItems] = useState<ClothingItem[]>([])

  useEffect(() => {
    const wardrobeId = getCurrentWardrobeId()
    if (!wardrobeId) return

    // 获取当前衣橱下所有分类
    db.categories
      .where('wardrobeId')
      .equals(wardrobeId)
      .toArray()
      .then(async (cats) => {
        const catIds = cats.map((c) => c.id)
        if (catIds.length === 0) {
          setAllItems([])
          return
        }
        const items = await db.items
          .where('categoryId')
          .anyOf(catIds)
          .sortBy('createdAt')
        setAllItems(items.reverse())
      })
  }, [])

  const results = useMemo(() => {
    if (!query.trim()) return allItems
    const q = query.trim().toLowerCase()
    return allItems.filter(
      (item) =>
        item.color.toLowerCase().includes(q) ||
        item.notes.toLowerCase().includes(q)
    )
  }, [query, allItems])

  return (
    <div className="pb-8">
      {/* 搜索栏 */}
      <div className="px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-400 text-lg"
        >
          ←
        </button>
        <div className="flex-1 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索颜色、备注..."
            autoFocus
            className="w-full px-4 py-2.5 bg-gray-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-[#FFB6C1]"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 搜索结果 */}
      <div className="px-3">
        {query && (
          <p className="text-xs text-gray-400 px-1 mb-3">
            找到 {results.length} 件衣服
          </p>
        )}

        {results.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-gray-400 text-sm">
              {query ? '没有找到匹配的衣服' : '输入关键词开始搜索'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {results.map((item) => (
              <ClothingCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
