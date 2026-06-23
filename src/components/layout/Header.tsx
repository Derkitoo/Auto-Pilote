import { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Bell, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { getInitiales } from '@/lib/utils'

const pageTitles: Record<string, string> = {
  '/dashboard':   'Tableau de bord',
  '/eleves':      'Élèves',
  '/planning':    'Planning',
  '/moniteurs':   'Moniteurs',
  '/vehicules':   'Véhicules',
  '/facturation': 'Facturation',
  '/examens':     'Examens',
  '/settings':    'Paramètres',
}

export function Header() {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const baseRoute = '/' + pathname.split('/')[1]
  const title = pageTitles[baseRoute] ?? 'PermisFlow'

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className="h-14 md:h-16 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-4 md:px-6 shrink-0">
      <div className="flex items-center gap-2 md:hidden">
        <div className="w-7 h-7 bg-[#2563EB] rounded-lg flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-xs">P</span>
        </div>
        <span className="font-semibold text-[#0F172A] text-sm">PermisFlow</span>
      </div>

      <h1 className="hidden md:block text-lg font-semibold text-[#0F172A]">{title}</h1>

      <h1 className="md:hidden absolute left-1/2 -translate-x-1/2 text-sm font-semibold text-[#0F172A]">
        {title}
      </h1>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" title="Notifications">
          <Bell className="w-4 h-4" />
        </Button>

        {/* Avatar + menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="w-8 h-8 bg-[#2563EB] rounded-full flex items-center justify-center hover:bg-[#1D4ED8] transition-colors"
            title={user ? `${user.prenom} ${user.nom}` : ''}
          >
            <span className="text-white text-xs font-semibold">
              {user ? getInitiales(user.prenom, user.nom) : 'U'}
            </span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-10 w-52 bg-white rounded-xl border border-[#E2E8F0] shadow-lg z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-[#E2E8F0]">
                <p className="text-sm font-medium text-[#0F172A]">{user?.prenom} {user?.nom}</p>
                <p className="text-xs text-[#64748B]">{user?.email}</p>
                <span className="inline-block mt-1 text-xs bg-[#2563EB]/10 text-[#2563EB] px-2 py-0.5 rounded-full capitalize">
                  {user?.role}
                </span>
              </div>
              <button
                onClick={() => { logout(); setMenuOpen(false) }}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-[#DC2626] hover:bg-[#FEF2F2] transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Se déconnecter
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
