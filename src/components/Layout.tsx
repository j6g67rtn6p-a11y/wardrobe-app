import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import WardrobeSwitcher from './WardrobeSwitcher'

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()

  const tabs = [
    { path: '/', label: '首页' },
    { path: '/categories', label: '分类' },
    { path: '/add', label: '添加' },
  ]

  return (
    <div
      className="max-w-lg mx-auto min-h-screen flex flex-col"
      style={{ backgroundColor: '#FFF8F8' }}
    >
      <main className="flex-1 pb-32">
        <Outlet />
      </main>

      {/* 底部区域：衣橱切换栏 + 导航栏 */}
      <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white/90 backdrop-blur border-t border-[#FFE4E1] safe-bottom">
        <WardrobeSwitcher />
        <nav className="flex justify-around items-center h-14">
          {tabs.map((tab) => {
            const active = location.pathname === tab.path
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`text-sm tracking-wide ${
                  active
                    ? 'text-[#E8A0A8] font-medium'
                    : 'text-gray-400'
                }`}
              >
                {tab.label}
                {active && (
                  <div className="w-1.5 h-1.5 bg-[#E8A0A8] rounded-full mx-auto mt-0.5" />
                )}
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
