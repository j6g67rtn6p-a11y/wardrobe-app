import { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { db, type Category } from '../db'
import { getCurrentWardrobeId } from '../store/useWardrobeStore'
import { fileToBase64, compressImage } from '../utils/image'
import { generateId } from '../utils/helpers'

export default function AddEditItem() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isEdit = !!id

  const [categories, setCategories] = useState<Category[]>([])
  const [image, setImage] = useState<string>('')
  const [categoryId, setCategoryId] = useState('')
  const [saving, setSaving] = useState(false)

  const [price, setPrice] = useState('')
  const [color, setColor] = useState('')
  const [dateAdded, setDateAdded] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [notes, setNotes] = useState('')

  useEffect(() => {
    const wardrobeId = getCurrentWardrobeId()
    if (wardrobeId) {
      db.categories
        .where('wardrobeId')
        .equals(wardrobeId)
        .sortBy('order')
        .then(setCategories)
    }

    if (isEdit && id) {
      db.items.get(id).then((item) => {
        if (item) {
          setImage(item.image)
          setCategoryId(item.categoryId)
          setPrice(item.price != null ? String(item.price) : '')
          setColor(item.color)
          setDateAdded(item.dateAdded)
          setNotes(item.notes)
        }
      })
    }
  }, [id, isEdit])

  const handleImagePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const compressed = await compressImage(file, 800)
      const base64 = await fileToBase64(
        new File([compressed], file.name, { type: 'image/jpeg' })
      )
      setImage(base64)
    } catch {
      alert('图片处理失败，请重试')
    }
  }

  const handleSave = async () => {
    if (!image) {
      alert('请先选择照片')
      return
    }
    if (!categoryId) {
      alert('请选择分类')
      return
    }

    setSaving(true)
    const data = {
      image,
      categoryId,
      price: price ? Number(price) : null,
      color: color.trim(),
      dateAdded,
      notes: notes.trim(),
      updatedAt: new Date(),
    }

    if (isEdit && id) {
      await db.items.update(id, data)
    } else {
      await db.items.add({
        ...data,
        id: generateId(),
        createdAt: new Date(),
      })
    }

    setSaving(false)
    navigate('/', { replace: true })
  }

  const handleDelete = async () => {
    if (!isEdit || !id) return
    if (!window.confirm('确定删除这件衣服？')) return
    await db.items.delete(id)
    navigate('/', { replace: true })
  }

  return (
    <div className="p-4" style={{ paddingBottom: '280px' }}>
      <h1 className="text-base font-semibold text-gray-800 mb-5">
        {isEdit ? '编辑衣服' : '添加衣服'}
      </h1>

      {/* 照片上传区 */}
      <div className="mb-5">
        {image ? (
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-100">
            <img src={image} alt="衣服" className="w-full h-full object-cover" />
            <button
              onClick={() => setImage('')}
              className="absolute top-3 right-3 w-8 h-8 bg-black/50 text-white rounded-full text-sm"
            >
              ✕
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#FFB6C1] transition-colors"
          >
            <span className="text-4xl">📷</span>
            <span className="text-sm text-gray-400">点击选择照片</span>
            <span className="text-xs text-gray-300">从相册中选取</span>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImagePick}
          className="hidden"
        />
      </div>

      {/* 分类选择 */}
      <div className="mb-5">
        <label className="text-xs text-gray-500 mb-1 block">选择分类</label>
        <div className="grid grid-cols-3 gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryId(cat.id)}
              className={`py-3 px-2 rounded-xl text-sm border transition-all ${
                categoryId === cat.id
                  ? 'border-[#FFB6C1] bg-[#FFF0F0] text-[#E8A0A8] font-medium'
                  : 'border-gray-100 bg-white text-gray-500'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {/* 颜色 — 色块选择 */}
        <div>
          <label className="text-xs text-gray-500 mb-2 block">
            颜色{color && <span className="text-gray-700 ml-1">— {color}</span>}
          </label>
          <div className="grid grid-cols-6 gap-2 mb-2">
            {[
              { name: '黑色', hex: '#333333' },
              { name: '深灰', hex: '#555555' },
              { name: '灰色', hex: '#999999' },
              { name: '白色', hex: '#F5F5F5' },
              { name: '米色', hex: '#F5E6CA' },
              { name: '卡其', hex: '#C3B091' },
              { name: '棕色', hex: '#8B5A3C' },
              { name: '粉色', hex: '#FFB6C1' },
              { name: '酒红', hex: '#8B2252' },
              { name: '黄色', hex: '#F5D76E' },
              { name: '豆绿', hex: '#C2D5A3' },
              { name: '浅紫', hex: '#C4B5FD' },
              { name: '浅蓝', hex: '#87CEEB' },
              { name: '牛仔蓝', hex: '#5B7FA5' },
              { name: '藏蓝', hex: '#1A3A5C' },
            ].map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => setColor(color === c.name ? '' : c.name)}
                className="flex flex-col items-center gap-1"
              >
                <div
                  className="w-9 h-9 rounded-full border-2 transition-all"
                  style={{
                    backgroundColor: c.hex,
                    borderColor:
                      color === c.name
                        ? '#FFB6C1'
                        : c.name === '白色' || c.name === '米色'
                          ? '#E5E5E5'
                          : c.hex,
                    boxShadow:
                      color === c.name
                        ? '0 0 0 2px rgba(255,182,193,0.4)'
                        : 'none',
                    transform: color === c.name ? 'scale(1.15)' : 'scale(1)',
                  }}
                />
                <span
                  className={`text-[10px] ${
                    color === c.name ? 'text-[#FFB6C1] font-medium' : 'text-gray-400'
                  }`}
                >
                  {c.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">价格 (¥)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="输入价格"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#FFB6C1] focus:ring-1 focus:ring-[#FFB6C1] outline-none"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">收录日期</label>
          <input
            type="date"
            value={dateAdded}
            onChange={(e) => setDateAdded(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#FFB6C1] focus:ring-1 focus:ring-[#FFB6C1] outline-none"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">备注</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="添加一些备注..."
            rows={5}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-[#FFB6C1] focus:ring-1 focus:ring-[#FFB6C1] outline-none resize-none"
          />
        </div>
      </div>

      {/* 按钮 — 固定在底部导航上方 */}
      <div className="fixed bottom-28 left-0 right-0 max-w-lg mx-auto px-4 py-3 bg-white border-t border-gray-100 safe-bottom">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3.5 bg-[#FFB6C1] text-white text-base rounded-full font-medium disabled:opacity-50"
        >
          {saving ? '保存中...' : '保存'}
        </button>
        {isEdit && (
          <button
            onClick={handleDelete}
            className="w-full mt-2 py-3 text-red-400 text-sm border border-red-200 rounded-full"
          >
            删除这件衣服
          </button>
        )}
      </div>
    </div>
  )
}
