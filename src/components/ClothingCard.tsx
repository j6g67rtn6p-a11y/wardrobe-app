import { useNavigate } from 'react-router-dom'
import type { ClothingItem } from '../db'

interface Props {
  item: ClothingItem
}

export default function ClothingCard({ item }: Props) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/detail/${item.id}`)}
      className="rounded-2xl shadow-sm bg-white overflow-hidden active:scale-95 transition-transform cursor-pointer"
    >
      <div className="aspect-square">
        <img
          src={item.image}
          alt={item.color || '衣服'}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    </div>
  )
}
