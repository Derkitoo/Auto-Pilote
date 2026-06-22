import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, CalendarDays, UserCheck, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/eleves', icon: Users, label: 'Élèves' },
  { to: '/planning', icon: CalendarDays, label: 'Planning' },
  { to: '/moniteurs', icon: UserCheck, label: 'Moniteurs' },
  { to: '/settings', icon: Settings, label: 'Réglages' },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E2E8F0] flex md:hidden">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              'flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] font-medium transition-colors',
              isActive ? 'text-[#2563EB]' : 'text-[#94A3B8]'
            )
          }
        >
          <Icon className="w-5 h-5" />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
