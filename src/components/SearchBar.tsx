import { useNavigate } from 'react-router-dom'

export default function SearchBar() {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate('/search')}
      className="mx-4 mt-3 mb-2 px-4 py-2.5 bg-gray-100 rounded-full text-sm text-gray-400 flex items-center gap-2 cursor-pointer"
    >
      <span>🔍</span>
      <span>搜索颜色、备注...</span>
    </div>
  )
}
