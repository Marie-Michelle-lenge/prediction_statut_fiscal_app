import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import {
  LayoutDashboard,
  Search,
  Brain,
  ChevronLeft,
  ChevronRight,
  Shield,
  User,
  Sun,
  Moon,
  LogOut,
} from 'lucide-react'
import { cx } from '@/lib/utils'
import { useState, type ReactNode } from 'react'
import { useTheme } from '@/lib/theme-context'
import { useAuth } from '@/lib/auth-context'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/formulaire', icon: Brain, label: 'Interface Analyse' },
  { to: '/analysis', icon: Search, label: 'Analyse & Recherche' }
]

export default function Sidebar({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const { isDark, toggle } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const sidebarWidth = collapsed ? 60 : 260

  const handleLogout = async () => {
    await logout()
    navigate({ to: '/login' })
  }

  return (
    <div data-state={collapsed ? "collapse" : ""} className="group lg:pl-71.5 lg:data-[state=collapse]:pl-16.5 min-h-screen transition-all duration-200">
      <aside data-state={collapsed ? "collapse" : ""}
        className="fixed
        lg:data-[state=collapse]:w-15 w-70 lg:transition-[width] ease-linear duration-200
        top-1.5 left-1.5 bottom-1.5 z-100 flex flex-col overflow-hidden bg-gray-950 border border-gray-800/50 dark:border-gray-800 rounded-ui
        dark:bg-gray-800/50
        "
      >
        <div className="px-2 py-1 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3 pt-2">
            <div className="min-w-9 bg-primary text-white size-9 rounded-ui d-flex-place-center">
              <Shield size={24} className="size-4" />
            </div>
            <div className="lg:group-data-[state=collapse]:hidden flex-1 flex flex-col leading-tight">
              <span className="line-clamp-1 text-sm font-bold tracking-wide text-white">DGI</span>
              <span className="line-clamp-1 text-xs text-white/50 tracking-wide">Analyse Véhicules</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-150',
                location.pathname === item.to
                  ? 'bg-white/8 text-white'
                  : 'text-white/65 hover:bg-white/5 hover:text-white/90'
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon strokeWidth={1.2} className="shrink-0 size-4" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <button type='button'
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center py-3 border-t border-white/10 text-white/40 hover:text-white/80 transition-colors"
          aria-label={collapsed ? 'Développer' : 'Réduire'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </aside>

      <header
        className="fixed top-0 right-0 h-14 lg:h-16.5 bg-card backdrop-blur-xl lg:bg-white lg:dark:bg-gray-900/40 border-b border-border-input/50 flex items-center justify-between px-6 z-90 transition-all duration-200"
        style={{ left: sidebarWidth }}
      >
        <div className="flex-1 max-w-120">

        </div>

        <div className="flex items-center gap-4">


          <button type='button'
            onClick={toggle}
            className="flex items-center justify-center w-9 h-9 rounded-lg text-fg-muted hover:bg-bg-muted hover:text-fg transition-all"
            title={isDark ? 'Mode clair' : 'Mode sombre'}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>



          <div className="flex items-center gap-2.5 pl-4 border-l border-border ml-1">
            <div className="w-8 h-8 rounded-full bg-primary/5 text-primary flex items-center justify-center">
              <User size={16} />
            </div>
            <div className="flex-col leading-tight hidden sm:flex">
              <span className="text-sm font-semibold text-fg">{user?.name ?? 'Utilisateur'}</span>
              <span className="text-[11px] text-fg-muted">{user?.role ?? ''}</span>
            </div>
            <button type='button'
              onClick={handleLogout}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-fg-muted hover:bg-danger/10 hover:text-danger transition-all"
              title="Déconnexion"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="min-h-screen pt-14">
        {children}
      </main>
    </div>
  )
}
