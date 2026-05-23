import Dexie, { type EntityTable } from 'dexie'

export interface Wardrobe {
  id: string
  name: string
  order: number
  createdAt: Date
}

export interface Category {
  id: string
  wardrobeId: string
  name: string
  order: number
  createdAt: Date
}

export interface ClothingItem {
  id: string
  categoryId: string
  image: string
  price: number | null
  color: string
  dateAdded: string
  notes: string
  createdAt: Date
  updatedAt: Date
}

const db = new Dexie('WardrobeDB') as Dexie & {
  wardrobes: EntityTable<Wardrobe, 'id'>
  categories: EntityTable<Category, 'id'>
  items: EntityTable<ClothingItem, 'id'>
}

db.version(1).stores({
  wardrobes: 'id, order',
  categories: 'id, wardrobeId, order',
  items: 'id, categoryId',
})

export { db }
