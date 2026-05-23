import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { db, type ClothingItem, type Category } from '../db'

export default function ItemDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [item, setItem] = useState<ClothingItem | null>(null)
  const [category, setCategory] = useState<Category | null>(null)

  useEffect(() => {
    if (!id) return
    db.items.get(id).then((data) => {
      if (data) {
        setItem(data)
        db.categories.get(data.categoryId).then((c) => setCategory(c ?? null))
      }
    })
  }, [id])

  const handleDelete = async () => {
    if (!id) return
    if (!window.confirm('确定删除这件衣服？')) return
    await db.items.delete(id)
    navigate('/', { replace: true })
  }

  if (!item) {
    return (
      <div className="p-8 text-center text-gray-400 text-sm">加载中...</div>
    )
  }

  return (
    <div className="pb-8">
      {/* 大图 */}
      <div className="w-full aspect-square bg-gray-100">
        <img
          src={item.image}
          alt={item.color || '衣服'}
          className="w-full h-full object-cover"
        />
      </div>

      {/* 信息区域 */}
      <div className="p-4 space-y-4">
        {/* 分类标签 */}
        {category && (
          <div>
            <span className="inline-block px-3 py-1 bg-[#FFE4E1] text-[#FFB6C1] text-xs rounded-full">
              {category.name}
            </span>
          </div>
        )}

        {/* 信息列表 */}
        <div className="space-y-3">
          {item.color && (
            <div className="flex items-center gap-3 py-2 border-b border-gray-50">
              <span className="text-xs text-gray-400 w-16">颜色</span>
              <span className="text-sm text-gray-700">{item.color}</span>
            </div>
          )}

          {item.price != null && (
            <div className="flex items-center gap-3 py-2 border-b border-gray-50">
              <span className="text-xs text-gray-400 w-16">价格</span>
              <span className="text-sm text-gray-700">
                ¥{item.price.toLocaleString()}
              </span>
            </div>
          )}

          <div className="flex items-center gap-3 py-2 border-b border-gray-50">
            <span className="text-xs text-gray-400 w-16">收录日期</span>
            <span className="text-sm text-gray-700">{item.dateAdded}</span>
          </div>

          {item.notes && (
            <div className="flex items-start gap-3 py-2 border-b border-gray-50">
              <span className="text-xs text-gray-400 w-16 pt-0.5">备注</span>
              <span className="text-sm text-gray-700">{item.notes}</span>
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={() => navigate(`/edit/${item.id}`)}
            className="flex-1 py-3 bg-[#FFB6C1] text-white text-sm rounded-full"
          >
            编辑
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 py-3 text-red-400 text-sm border border-red-200 rounded-full"
          >
            删除
          </button>
        </div>
      </div>
    </div>
  )
}
