import { useEffect, useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { db, type Category } from '../db'
import { getCurrentWardrobeId, onWardrobeChange } from '../store/useWardrobeStore'
import { generateId } from '../utils/helpers'

const DEFAULT_NAMES = ['上衣', '裤子', '裙子', '外套', '鞋子', '配饰']

function SortableCategory({
  cat,
  isEditing,
  editName,
  onEditNameChange,
  onStartEdit,
  onSaveEdit,
  onDelete,
}: {
  cat: Category
  isEditing: boolean
  editName: string
  onEditNameChange: (v: string) => void
  onStartEdit: () => void
  onSaveEdit: () => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: cat.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3 bg-white"
    >
      {/* 拖拽手柄 */}
      <button
        {...attributes}
        {...listeners}
        className="text-gray-300 text-lg cursor-grab active:cursor-grabbing touch-none select-none"
        aria-label="拖拽排序"
      >
        ⠿
      </button>

      {isEditing ? (
        <input
          value={editName}
          onChange={(e) => onEditNameChange(e.target.value)}
          className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
          onKeyDown={(e) => e.key === 'Enter' && onSaveEdit()}
          autoFocus
        />
      ) : (
        <span className="flex-1 text-sm text-gray-700">{cat.name}</span>
      )}

      {isEditing ? (
        <button
          onClick={onSaveEdit}
          className="text-xs text-[#FFB6C1] px-2 flex-shrink-0"
        >
          保存
        </button>
      ) : (
        <button
          onClick={onStartEdit}
          className="text-xs text-gray-400 px-1 flex-shrink-0"
        >
          重命名
        </button>
      )}

      <button
        onClick={onDelete}
        className="text-xs text-red-400 px-1 flex-shrink-0"
      >
        删除
      </button>
    </div>
  )
}

export default function ManageCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [wardrobeId, setWardrobeId] = useState<string | null>(
    getCurrentWardrobeId()
  )
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [newName, setNewName] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  const refresh = () => {
    const wid = getCurrentWardrobeId()
    setWardrobeId(wid)
    if (wid) {
      db.categories
        .where('wardrobeId')
        .equals(wid)
        .sortBy('order')
        .then(setCategories)
    }
  }

  useEffect(() => {
    refresh()
    return onWardrobeChange(() => refresh())
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = categories.findIndex((c) => c.id === active.id)
    const newIndex = categories.findIndex((c) => c.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove(categories, oldIndex, newIndex)
    setCategories(reordered)

    // 批量更新 order 字段
    await db.transaction('rw', db.categories, async () => {
      for (let i = 0; i < reordered.length; i++) {
        await db.categories.update(reordered[i].id, { order: i })
      }
    })
  }

  const handleAdd = async () => {
    const name = newName.trim()
    if (!name || !wardrobeId) return
    await db.categories.add({
      id: generateId(),
      wardrobeId,
      name,
      order: categories.length,
      createdAt: new Date(),
    })
    setNewName('')
    setShowAdd(false)
    refresh()
  }

  const handleRename = async (id: string) => {
    const name = editName.trim()
    if (!name) return
    await db.categories.update(id, { name })
    setEditingId(null)
    setEditName('')
    refresh()
  }

  const handleDelete = async (cat: Category) => {
    const count = await db.items.where('categoryId').equals(cat.id).count()
    if (count > 0) {
      const ok = window.confirm(
        `分类"${cat.name}"下有 ${count} 件衣服，删除分类将同时删除这些衣服，确定删除？`
      )
      if (!ok) return
      await db.items.where('categoryId').equals(cat.id).delete()
    }
    await db.categories.delete(cat.id)
    refresh()
  }

  const handleAddDefault = async () => {
    if (!wardrobeId) return
    const existing = new Set(categories.map((c) => c.name))
    const toAdd = DEFAULT_NAMES.filter((n) => !existing.has(n))
    if (toAdd.length === 0) {
      alert('默认分类已全部存在')
      return
    }
    await db.categories.bulkAdd(
      toAdd.map((name, i) => ({
        id: generateId(),
        wardrobeId,
        name,
        order: categories.length + i,
        createdAt: new Date(),
      }))
    )
    refresh()
  }

  return (
    <div className="p-4 pb-8">
      {/* 顶部 */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-base font-semibold text-gray-800">分类管理</h1>
        <div className="flex gap-2">
          <button
            onClick={handleAddDefault}
            className="text-xs text-[#FFB6C1] px-3 py-1.5 border border-[#FFB6C1] rounded-full"
          >
            恢复默认
          </button>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FFB6C1] text-white text-lg"
          >
            {showAdd ? '−' : '+'}
          </button>
        </div>
      </div>

      {/* 提示 */}
      <p className="text-xs text-gray-400 mb-3">
        长按左侧 <span className="text-gray-500">⠿</span> 手柄可拖拽调整顺序
      </p>

      {/* 添加新分类 */}
      {showAdd && (
        <div className="flex gap-2 mb-4">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="输入分类名称"
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#FFB6C1] focus:ring-1 focus:ring-[#FFB6C1] outline-none"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button
            onClick={handleAdd}
            className="px-5 py-2.5 bg-[#FFB6C1] text-white text-sm rounded-full"
          >
            添加
          </button>
        </div>
      )}

      {/* 拖拽排序列表 */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={categories.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {categories.map((cat) => (
              <SortableCategory
                key={cat.id}
                cat={cat}
                isEditing={editingId === cat.id}
                editName={editName}
                onEditNameChange={setEditName}
                onStartEdit={() => {
                  setEditingId(cat.id)
                  setEditName(cat.name)
                }}
                onSaveEdit={() => handleRename(cat.id)}
                onDelete={() => handleDelete(cat)}
              />
            ))}

            {categories.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-8">
                暂无分类，点击 + 添加
              </p>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
