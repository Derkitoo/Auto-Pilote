import { useMemo, useState } from 'react'
import { CalendarDays, Clock, MapPin } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useLecons } from '@/hooks/useLecons'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/utils'
import type { StatutLecon } from '@/types'

const STATUT_CONFIG: Record<StatutLecon, { label: string; color: string; bg: string }> = {
  planifiee:         { label: 'Planifiée',        color: '#64748B', bg: '#F1F5F9' },
  confirmee:         { label: 'Confirmée',         color: '#2563EB', bg: '#EFF6FF' },
  effectuee:         { label: 'Effectuée',         color: '#16A34A', bg: '#DCFCE7' },
  annulee_eleve:     { label: 'Annulée',           color: '#DC2626', bg: '#FEE2E2' },
  annulee_moniteur:  { label: 'Annulée moniteur',  color: '#DC2626', bg: '#FEE2E2' },
  no_show:           { label: 'No-show',           color: '#D97706', bg: '#FEF3C7' },
}

const TYPE_LABELS: Record<string, string> = {
  conduite: 'Conduite', code: 'Code', evaluation: 'Évaluation',
  examen_blanc: 'Examen blanc', accompagnement: 'Accompagnement',
}

export function ElevePlanningPage() {
  const { user } = useAuth()
  const eleveId = user?.eleve_id ?? ''
  const { data: lecons, isLoading } = useLecons({ eleve_id: eleveId })
  const [filtre, setFiltre] = useState<'toutes' | 'a_venir' | 'passees'>('a_venir')

  const leconsFiltrees = useMemo(() => {
    if (!lecons) return []
    const now = new Date()
    const sorted = [...lecons].sort((a, b) =>
      filtre === 'passees'
        ? b.date_debut.localeCompare(a.date_debut)
        : a.date_debut.localeCompare(b.date_debut)
    )
    if (filtre === 'a_venir') return sorted.filter(l => new Date(l.date_debut) >= now)
    if (filtre === 'passees') return sorted.filter(l => new Date(l.date_debut) < now)
    return sorted
  }, [lecons, filtre])

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-[#0F172A]">Mes leçons</h1>

      {/* Filtres */}
      <div className="flex rounded-xl border border-[#E2E8F0] bg-white overflow-hidden">
        {([['a_venir', 'À venir'], ['passees', 'Passées'], ['toutes', 'Toutes']] as const).map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFiltre(val)}
            className={`flex-1 py-2 text-xs font-medium transition-colors ${filtre === val ? 'bg-[#2563EB] text-white' : 'text-[#64748B] hover:bg-[#F8FAFC]'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>
      ) : leconsFiltrees.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 text-center text-sm text-[#94A3B8]">
          <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-40" />
          Aucune leçon
        </div>
      ) : (
        <div className="space-y-3">
          {leconsFiltrees.map(l => {
            const cfg = STATUT_CONFIG[l.statut]
            const duree = Math.round((new Date(l.date_fin).getTime() - new Date(l.date_debut).getTime()) / 60000)
            return (
              <div key={l.id} className="bg-white rounded-2xl border border-[#E2E8F0] p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-[#0F172A]">{TYPE_LABELS[l.type] ?? l.type}</p>
                    <p className="text-xs text-[#64748B]">{formatDate(l.date_debut, "EEEE d MMMM yyyy")}</p>
                  </div>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ color: cfg.color, backgroundColor: cfg.bg }}>
                    {cfg.label}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-[#64748B]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDate(l.date_debut, "HH'h'mm")} → {formatDate(l.date_fin, "HH'h'mm")} ({duree}min)
                  </span>
                  {l.lieu_rdv && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {l.lieu_rdv}
                    </span>
                  )}
                </div>
                {l.moniteur && (
                  <p className="text-xs text-[#94A3B8] mt-1.5">Moniteur : {l.moniteur.prenom} {l.moniteur.nom}</p>
                )}
                {l.vehicule && (
                  <p className="text-xs text-[#94A3B8]">{l.vehicule.marque} {l.vehicule.modele} · {l.vehicule.type_boite === 'manuelle' ? 'BVM' : 'BVA'}</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
