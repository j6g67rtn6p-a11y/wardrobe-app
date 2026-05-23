import { useNavigate } from 'react-router-dom'

export default function SearchBar() {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate('/search')}
      className="mx-3 mt-2 mb-1 px-3 py-2 bg-gray-100 rounded-full text-xs text-gray-400 flex items-center gap-1.5 cursor-pointer"
    >
      <span>🔍</span>
      <span>搜索颜色、备注...</span>
    </div>
  )
}
