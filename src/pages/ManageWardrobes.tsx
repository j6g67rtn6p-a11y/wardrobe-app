import { useEffect, useState } from 'react'
import { db, type Wardrobe } from '../db'
import { getCurrentWardrobeId, switchWardrobe } from '../store/useWardrobeStore'
import { generateId } from '../utils/helpers'

export default function ManageWardrobes() {
  const [wardrobes, setWardrobes] = useState<Wardrobe[]>([])
  const [activeId, setActiveId] = useState<string | null>(getCurrentWardrobeId())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [newName, setNewName] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  const refresh = () => {
    db.wardrobes.orderBy('order').toArray().then(setWardrobes)
  }

  useEffect(() => {
    refresh()
  }, [])

  const handleAdd = async () => {
    const name = newName.trim()
    if (!name) return
    await db.wardrobes.add({
      id: generateId(),
      name,
      order: wardrobes.length,
      createdAt: new Date(),
    })
    setNewName('')
    setShowAdd(false)
    refresh()
  }

  const handleRename = async (id: string) => {
    const name = editName.trim()
    if (!name) return
    await db.wardrobes.update(id, { name })
    setEditingId(null)
    setEditName('')
    refresh()
  }

  const handleDelete = async (wardrobe: Wardrobe) => {
    const count = await db.wardrobes.count()
    if (count <= 1) {
      alert('至少保留一个衣橱')
      return
    }
    const categories = await db.categories.where('wardrobeId').equals(wardrobe.id).toArray()
    const itemCount = categories.length > 0
      ? await db.items.where('categoryId').anyOf(categories.map((c) => c.id)).count()
      : 0

    if (itemCount > 0) {
      const ok = window.confirm(
        `删除衣橱"${wardrobe.name}"将同时删除其下 ${categories.length} 个分类和 ${itemCount} 件衣服，确定删除？`
      )
      if (!ok) return
    }

    // 删除该衣橱下的所有衣服
    for (const cat of categories) {
      await db.items.where('categoryId').equals(cat.id).delete()
    }
    // 删除分类
    await db.categories.where('wardrobeId').equals(wardrobe.id).delete()
    // 删除衣橱
    await db.wardrobes.delete(wardrobe.id)

    // 如果删的是当前活跃衣橱，切换到第一个
    if (wardrobe.id === activeId) {
      const first = await db.wardrobes.orderBy('order').first()
      if (first) switchWardrobe(first.id)
    }

    setActiveId(getCurrentWardrobeId())
    refresh()
  }

  const handleSwitch = (id: string) => {
    switchWardrobe(id)
    setActiveId(id)
  }

  return (
    <div className="p-4">
      {/* 顶部 */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-base font-semibold text-gray-800">衣橱管理</h1>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FFB6C1] text-white text-lg"
        >
          {showAdd ? '−' : '+'}
        </button>
      </div>

      {/* 添加新衣橱 */}
      {showAdd && (
        <div className="flex gap-2 mb-4">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="输入衣橱名称"
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#FFB6C1] focus:ring-1 focus:ring-[#FFB6C1] outline-none"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button
            onClick={handleAdd}
            className="px-5 py-2.5 bg-[#FFB6C1] text-white text-sm rounded-full"
          >
            创建
          </button>
        </div>
      )}

      {/* 衣橱列表 */}
      <div className="space-y-2">
        {wardrobes.map((w) => (
          <div
            key={w.id}
            className={`rounded-xl border px-4 py-3 flex items-center gap-3 ${
              w.id === activeId
                ? 'border-[#FFB6C1] bg-[#FFF5F5]'
                : 'border-gray-100'
            }`}
          >
            {editingId === w.id ? (
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleRename(w.id)}
                autoFocus
              />
            ) : (
              <span className="flex-1 text-sm text-gray-700">{w.name}</span>
            )}

            {w.id !== activeId && (
              <button
                onClick={() => handleSwitch(w.id)}
                className="text-xs text-[#FFB6C1] px-2"
              >
                切换
              </button>
            )}
            {w.id === activeId && (
              <span className="text-xs text-[#FFB6C1] bg-[#FFE4E1] px-2 py-0.5 rounded-full">
                当前
              </span>
            )}

            {editingId === w.id ? (
              <button
                onClick={() => handleRename(w.id)}
                className="text-xs text-[#FFB6C1] px-2"
              >
                保存
              </button>
            ) : (
              <button
                onClick={() => {
                  setEditingId(w.id)
                  setEditName(w.name)
                }}
                className="text-xs text-gray-400 px-1"
              >
                重命名
              </button>
            )}

            <button
              onClick={() => handleDelete(w)}
              className="text-xs text-red-400 px-1"
            >
              删除
            </button>
          </div>
        ))}

        {wardrobes.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">
            暂无衣橱，点击 + 创建
          </p>
        )}
      </div>
    </div>
  )
}
