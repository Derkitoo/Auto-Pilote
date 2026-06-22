import { useLocation } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Tableau de bord',
  '/eleves': 'Élèves',
  '/planning': 'Planning',
  '/moniteurs': 'Moniteurs',
  '/vehicules': 'Véhicules',
  '/settings': 'Paramètres',
}

export function Header() {
  const { pathname } = useLocation()
  const baseRoute = '/' + pathname.split('/')[1]
  const title = pageTitles[baseRoute] ?? 'PermisFlow'

  return (
    <header className="h-14 md:h-16 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-4 md:px-6 shrink-0">
      {/* Logo visible uniquement sur mobile (sidebar cachée) */}
      <div className="flex items-center gap-2 md:hidden">
        <div className="w-7 h-7 bg-[#2563EB] rounded-lg flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-xs">P</span>
        </div>
        <span className="font-semibold text-[#0F172A] text-sm">PermisFlow</span>
      </div>

      <h1 className="hidden md:block text-lg font-semibold text-[#0F172A]">{title}</h1>

      {/* Titre centré sur mobile */}
      <h1 className="md:hidden absolute left-1/2 -translate-x-1/2 text-sm font-semibold text-[#0F172A]">
        {title}
      </h1>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" title="Notifications">
          <Bell className="w-4 h-4" />
        </Button>
        <div className="w-7 h-7 bg-[#2563EB] rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-semibold">G</span>
        </div>
      </div>
    </header>
  )
}
