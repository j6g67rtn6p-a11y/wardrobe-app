import { db } from '../db'
import { generateId } from '../utils/helpers'

// 简单全局状态：用模块级变量 + localStorage 实现
const STORAGE_KEY = 'wardrobe_active_id'

export function getLastActiveWardrobeId(): string | null {
  return localStorage.getItem(STORAGE_KEY)
}

export function setLastActiveWardrobeId(id: string): void {
  localStorage.setItem(STORAGE_KEY, id)
}

// 状态变更监听器列表
const listeners: Array<(id: string | null) => void> = []

let currentWardrobeId: string | null = getLastActiveWardrobeId()

export function getCurrentWardrobeId(): string | null {
  return currentWardrobeId
}

export async function initActiveWardrobe(): Promise<string> {
  if (currentWardrobeId) {
    // 验证衣橱是否还存在
    const w = await db.wardrobes.get(currentWardrobeId)
    if (w) return currentWardrobeId
  }

  // 没有有效衣橱时，取第一个
  const first = await db.wardrobes.orderBy('order').first()
  if (first) {
    switchWardrobe(first.id)
    return first.id
  }

  // 没有任何衣橱，创建一个默认的
  const id = generateId()
  await db.wardrobes.add({
    id,
    name: '我的衣橱',
    order: 0,
    createdAt: new Date(),
  })
  // 创建默认分类
  const defaults = ['上衣', '裤子', '裙子', '外套', '鞋子', '配饰']
  await db.categories.bulkAdd(
    defaults.map((name, i) => ({
      id: generateId(),
      wardrobeId: id,
      name,
      order: i,
      createdAt: new Date(),
    }))
  )
  switchWardrobe(id)
  return id
}

export function switchWardrobe(id: string): void {
  currentWardrobeId = id
  setLastActiveWardrobeId(id)
  listeners.forEach((fn) => fn(id))
}

export function onWardrobeChange(fn: (id: string | null) => void): () => void {
  listeners.push(fn)
  return () => {
    const idx = listeners.indexOf(fn)
    if (idx > -1) listeners.splice(idx, 1)
  }
}
