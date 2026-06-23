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

const navItems = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Tableau de bord' },
  { to: '/eleves',      icon: Users,           label: 'Élèves' },
  { to: '/planning',    icon: CalendarDays,    label: 'Planning' },
  { to: '/moniteurs',   icon: UserCheck,       label: 'Moniteurs' },
  { to: '/vehicules',   icon: Car,             label: 'Véhicules' },
  { to: '/facturation', icon: Receipt,         label: 'Facturation' },
  { to: '/examens',     icon: Award,           label: 'Examens' },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'relative flex flex-col bg-white border-r border-[#E2E8F0] transition-all duration-200 shrink-0',
        collapsed ? 'w-16' : 'w-56'
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center gap-3 px-4 h-16 border-b border-[#E2E8F0]', collapsed && 'justify-center px-0')}>
        <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-sm">P</span>
        </div>
        {!collapsed && (
          <span className="font-semibold text-[#0F172A] text-sm truncate">PermisFlow</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                collapsed && 'justify-center px-0',
                isActive
                  ? 'bg-[#2563EB]/10 text-[#2563EB]'
                  : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
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
      <div className="p-2 border-t border-[#E2E8F0] space-y-0.5">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              collapsed && 'justify-center px-0',
              isActive
                ? 'bg-[#2563EB]/10 text-[#2563EB]'
                : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
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
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors',
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
