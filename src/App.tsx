import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import ManageWardrobes from './pages/ManageWardrobes'
import ManageCategories from './pages/ManageCategories'
import CategoryDetail from './pages/CategoryDetail'
import AddEditItem from './pages/AddEditItem'
import ItemDetail from './pages/ItemDetail'
import Search from './pages/Search'
import { initActiveWardrobe } from './store/useWardrobeStore'

function App() {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    initActiveWardrobe()
      .then(() => setReady(true))
      .catch((err) => {
        console.error('初始化失败:', err)
        setError(err instanceof Error ? err.message : String(err))
      })
  }, [])

  if (error) {
    return (
      <div className="max-w-lg mx-auto min-h-screen flex flex-col items-center justify-center bg-[#FFE4E1] p-8">
        <p className="text-red-500 text-sm mb-2">初始化失败</p>
        <p className="text-gray-500 text-xs text-center break-all">{error}</p>
        <button
          onClick={() => {
            setError(null)
            initActiveWardrobe()
              .then(() => setReady(true))
              .catch((err) =>
                setError(err instanceof Error ? err.message : String(err))
              )
          }}
          className="mt-4 px-6 py-2 bg-[#FFB6C1] text-white text-sm rounded-full"
        >
          重试
        </button>
      </div>
    )
  }

  if (!ready) {
    return (
      <div className="max-w-lg mx-auto min-h-screen flex items-center justify-center bg-[#FFE4E1]">
        <p className="text-[#FFB6C1] text-lg">加载中...</p>
      </div>
    )
  }

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/wardrobes" element={<ManageWardrobes />} />
          <Route path="/categories" element={<ManageCategories />} />
          <Route path="/category/:id" element={<CategoryDetail />} />
          <Route path="/add" element={<AddEditItem />} />
          <Route path="/edit/:id" element={<AddEditItem />} />
          <Route path="/detail/:id" element={<ItemDetail />} />
          <Route path="/search" element={<Search />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
