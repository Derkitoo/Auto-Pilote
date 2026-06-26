import { Outlet, NavLink } from 'react-router-dom'
import { Home, CalendarDays, Award, Receipt, Star, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/eleve/accueil',      icon: Home,         label: 'Accueil' },
  { to: '/eleve/planning',     icon: CalendarDays,  label: 'Planning' },
  { to: '/eleve/examens',      icon: Award,         label: 'Examens' },
  { to: '/eleve/factures',     icon: Receipt,       label: 'Factures' },
  { to: '/eleve/evaluations',  icon: Star,          label: 'Évals' },
]

export function EleveLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-[#E2E8F0] dark:border-slate-700 px-4 h-14 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">P</span>
          </div>
          <span className="font-semibold text-[#0F172A] dark:text-slate-100 text-sm">PermisFlow</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs font-medium text-[#0F172A] dark:text-slate-100">{user?.prenom} {user?.nom}</p>
            <p className="text-[10px] text-[#94A3B8] dark:text-slate-500">Espace élève</p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-[#64748B] dark:text-slate-400 hover:bg-[#F1F5F9] dark:hover:bg-slate-800 transition-colors"
            title="Se déconnecter"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Contenu */}
      <main className="flex-1 px-4 py-5 pb-24 max-w-lg mx-auto w-full">
        <Outlet />
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-[#E2E8F0] dark:border-slate-700 flex z-40">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => cn(
              'flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-[10px] font-medium transition-colors',
              isActive ? 'text-primary' : 'text-[#94A3B8] dark:text-slate-500'
            )}
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
