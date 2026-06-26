import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  UserCheck,
  Settings,
  Car,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Award,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

type Role = 'gerant' | 'moniteur' | 'secretaire' | 'eleve'

const navItems: { to: string; icon: React.ElementType; label: string; roles: Role[] }[] = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Tableau de bord', roles: ['gerant', 'moniteur', 'secretaire'] },
  { to: '/eleves',      icon: Users,           label: 'Élèves',          roles: ['gerant', 'moniteur', 'secretaire'] },
  { to: '/planning',    icon: CalendarDays,    label: 'Planning',        roles: ['gerant', 'moniteur', 'secretaire'] },
  { to: '/moniteurs',   icon: UserCheck,       label: 'Moniteurs',       roles: ['gerant', 'secretaire'] },
  { to: '/vehicules',   icon: Car,             label: 'Véhicules',       roles: ['gerant', 'secretaire'] },
  { to: '/facturation', icon: Receipt,         label: 'Facturation',     roles: ['gerant', 'secretaire'] },
  { to: '/examens',     icon: Award,           label: 'Examens',         roles: ['gerant', 'moniteur', 'secretaire'] },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { user } = useAuth()
  const role = user?.role ?? 'gerant'
  const visibleItems = navItems.filter(item => item.roles.includes(role as Role))

  return (
    <aside
      className={cn(
        'relative flex flex-col bg-white dark:bg-slate-900 border-r border-[#E2E8F0] dark:border-slate-700 transition-all duration-200 shrink-0',
        collapsed ? 'w-16' : 'w-56'
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center gap-3 px-4 h-16 border-b border-[#E2E8F0] dark:border-slate-700', collapsed && 'justify-center px-0')}>
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-sm">P</span>
        </div>
        {!collapsed && (
          <span className="font-semibold text-[#0F172A] dark:text-slate-100 text-sm truncate">PermisFlow</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5">
        {visibleItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                collapsed && 'justify-center px-0',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-[#64748B] dark:text-slate-400 hover:bg-[#F8FAFC] dark:hover:bg-slate-800 hover:text-[#0F172A] dark:hover:text-slate-100'
              )
            }
            title={collapsed ? label : undefined}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Settings + collapse */}
      <div className="p-2 border-t border-[#E2E8F0] dark:border-slate-700 space-y-0.5">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              collapsed && 'justify-center px-0',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-[#64748B] dark:text-slate-400 hover:bg-[#F8FAFC] dark:hover:bg-slate-800 hover:text-[#0F172A] dark:hover:text-slate-100'
            )
          }
          title={collapsed ? 'Paramètres' : undefined}
        >
          <Settings className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Paramètres</span>}
        </NavLink>

        <button
          onClick={() => setCollapsed(c => !c)}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#64748B] dark:text-slate-400 hover:bg-[#F8FAFC] dark:hover:bg-slate-800 hover:text-[#0F172A] dark:hover:text-slate-100 transition-colors',
            collapsed && 'justify-center px-0'
          )}
          title={collapsed ? 'Agrandir' : 'Réduire'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 shrink-0" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 shrink-0" />
              <span>Réduire</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
