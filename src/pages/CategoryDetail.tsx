import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { db, type Category, type ClothingItem } from '../db'
import ClothingCard from '../components/ClothingCard'

export default function CategoryDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [category, setCategory] = useState<Category | null>(null)
  const [items, setItems] = useState<ClothingItem[]>([])

  useEffect(() => {
    if (!id) return
    db.categories.get(id).then((c) => setCategory(c ?? null))
    db.items
      .where('categoryId')
      .equals(id)
      .sortBy('createdAt')
      .then((data) => setItems(data.reverse()))
  }, [id])

  return (
    <div className="pb-8">
      {/* 顶部 */}
      <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-50">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-400 text-lg"
        >
          ←
        </button>
        <h1 className="text-base font-semibold text-gray-800">
          {category?.name || '加载中...'}
        </h1>
        <span className="text-xs text-gray-400 ml-auto">
          {items.length} 件
        </span>
      </div>

      {/* 衣服网格 */}
      {items.length === 0 ? (
        <div className="px-4 py-20 text-center">
          <div className="text-5xl mb-4">👔</div>
          <p className="text-gray-400 text-sm mb-4">这个分类下还没有衣服</p>
          <button
            onClick={() => navigate('/add')}
            className="px-6 py-2.5 bg-[#FFB6C1] text-white text-sm rounded-full"
          >
            添加衣服
          </button>
        </div>
      ) : (
        <div className="p-3 grid grid-cols-3 gap-2">
          {items.map((item) => (
            <ClothingCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
