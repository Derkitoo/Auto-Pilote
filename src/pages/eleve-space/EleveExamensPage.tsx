import { Award, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useExamens } from '@/hooks/useExamens'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/utils'
import type { ResultatExamen } from '@/types'

const RESULTAT_CONFIG: Record<ResultatExamen | 'en_attente', { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  admis:      { label: 'Admis',      color: '#16A34A', bg: '#DCFCE7', icon: <CheckCircle className="w-4 h-4" /> },
  ajourne:    { label: 'Ajourné',    color: '#DC2626', bg: '#FEE2E2', icon: <XCircle className="w-4 h-4" /> },
  absent:     { label: 'Absent',     color: '#D97706', bg: '#FEF3C7', icon: <AlertTriangle className="w-4 h-4" /> },
  en_attente: { label: 'En attente', color: '#64748B', bg: '#F1F5F9', icon: <Clock className="w-4 h-4" /> },
}

export function EleveExamensPage() {
  const { user } = useAuth()
  const { data: examens, isLoading } = useExamens(user?.eleve_id)

  const admis = examens?.filter(e => e.resultat === 'admis').length ?? 0
  const total = examens?.filter(e => e.resultat !== null).length ?? 0
  const taux = total > 0 ? Math.round((admis / total) * 100) : null

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-[#0F172A]">Mes examens</h1>

      {/* Stats */}
      {examens && examens.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 text-center">
            <p className="text-2xl font-bold text-[#0F172A]">{examens.length}</p>
            <p className="text-xs text-[#64748B]">Examens passés</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: taux !== null && taux >= 50 ? '#16A34A' : '#DC2626' }}>
              {taux !== null ? `${taux}%` : '—'}
            </p>
            <p className="text-xs text-[#64748B]">Taux de réussite</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>
      ) : !examens?.length ? (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 text-center text-sm text-[#94A3B8]">
          <Award className="w-8 h-8 mx-auto mb-2 opacity-40" />
          Aucun examen enregistré
        </div>
      ) : (
        <div className="space-y-3">
          {examens.map(e => {
            const key = e.resultat ?? 'en_attente'
            const cfg = RESULTAT_CONFIG[key]
            return (
              <div key={e.id} className="bg-white rounded-2xl border border-[#E2E8F0] p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-[#0F172A]">
                      {e.type === 'code' ? 'Code de la route' : 'Examen de conduite'}
                    </p>
                    <p className="text-xs text-[#64748B]">{formatDate(e.date_examen, 'dd MMMM yyyy')}</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" style={{ color: cfg.color, backgroundColor: cfg.bg }}>
                    {cfg.icon}
                    {cfg.label}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-[#64748B]">
                  {e.lieu && <span>📍 {e.lieu}</span>}
                  {e.score !== null && e.type === 'code' && (
                    <span className="font-medium">Score : {e.score}/40</span>
                  )}
                </div>
                {e.notes && <p className="text-xs text-[#94A3B8] mt-2 italic">{e.notes}</p>}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
