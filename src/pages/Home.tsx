import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db, type Category, type ClothingItem } from '../db'
import { getCurrentWardrobeId, onWardrobeChange } from '../store/useWardrobeStore'
import SearchBar from '../components/SearchBar'
import ClothingCard from '../components/ClothingCard'

interface CategoryGroup {
  category: Category
  items: ClothingItem[]
}

export default function Home() {
  const navigate = useNavigate()
  const [groups, setGroups] = useState<CategoryGroup[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    const wardrobeId = getCurrentWardrobeId()
    if (!wardrobeId) return

    const categories = await db.categories
      .where('wardrobeId')
      .equals(wardrobeId)
      .sortBy('order')

    const result: CategoryGroup[] = []
    for (const cat of categories) {
      const items = await db.items
        .where('categoryId')
        .equals(cat.id)
        .sortBy('createdAt')
      result.push({ category: cat, items })
    }

    setGroups(result)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
    return onWardrobeChange(() => loadData())
  }, [])

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-400 text-sm min-h-screen" style={{ backgroundColor: '#FFF8F8' }}>
        加载中...
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF8F8' }}>
      <SearchBar />

      {/* 居中标题 */}
      <div className="text-center py-2">
        <h1 className="text-base font-semibold tracking-wider text-[#D4A0A8]">
          我的衣橱
        </h1>
      </div>

      {/* 分类分组展示 */}
      {groups.length === 0 ? (
        <div className="px-4 py-16 text-center">
          <p className="text-gray-400 text-sm mb-4">还没有添加任何分类</p>
          <button
            onClick={() => navigate('/categories')}
            className="px-6 py-2.5 bg-[#FFB6C1] text-white text-sm rounded-full"
          >
            去添加分类
          </button>
        </div>
      ) : (
        <div className="px-2 space-y-3 pb-20">
          {groups.map(({ category, items }) => (
            <section key={category.id}>
              {/* 分类标题行 */}
              <div className="flex items-center justify-between px-0.5 mb-1">
                <h2 className="text-xs font-medium text-gray-500">
                  {category.name}
                  <span className="ml-1 text-[10px] text-gray-400 font-normal">
                    {items.length}
                  </span>
                </h2>
              </div>

              {/* 衣服卡片 — 横向滑动 */}
              {items.length === 0 ? (
                <div
                  onClick={() => navigate(`/category/${category.id}`)}
                  className="rounded-xl border border-dashed border-[#FFE4E1] p-4 text-center cursor-pointer hover:border-[#FFB6C1] transition-colors bg-white/60"
                >
                  <p className="text-gray-400 text-[10px]">暂无衣服，点击添加</p>
                </div>
              ) : (
                <div className="overflow-x-auto scrollbar-hide -mr-2">
                  <div className="flex gap-1.5 pb-1 pr-2" style={{ scrollSnapType: 'x mandatory' }}>
                    {items.map((item) => (
                      <div
                        key={item.id}
                        style={{ scrollSnapAlign: 'start', width: '26%', minWidth: '100px', flexShrink: 0 }}
                      >
                        <ClothingCard item={item} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
