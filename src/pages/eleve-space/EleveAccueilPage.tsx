import { useMemo } from 'react'
import { CalendarDays, Clock, Award, TrendingUp, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useEleve } from '@/hooks/useEleves'
import { useLecons } from '@/hooks/useLecons'
import { useExamens } from '@/hooks/useExamens'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/utils'

const STATUT_LABELS: Record<string, string> = {
  planifiee: 'Planifiée', confirmee: 'Confirmée', effectuee: 'Effectuée',
  annulee_eleve: 'Annulée', annulee_moniteur: 'Annulée', no_show: 'No-show',
}
const STATUT_COLORS: Record<string, string> = {
  planifiee: '#64748B', confirmee: '#2563EB', effectuee: '#16A34A',
  annulee_eleve: '#DC2626', annulee_moniteur: '#DC2626', no_show: '#D97706',
}

export function EleveAccueilPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const eleveId = user?.eleve_id ?? ''

  const { data: eleve, isLoading: loadingEleve } = useEleve(eleveId)
  const { data: lecons } = useLecons({ eleve_id: eleveId })
  const { data: examens } = useExamens(eleveId)

  const prochaines = useMemo(() => {
    if (!lecons) return []
    const now = new Date()
    return lecons
      .filter(l => new Date(l.date_debut) >= now && l.statut !== 'annulee_eleve' && l.statut !== 'annulee_moniteur')
      .sort((a, b) => a.date_debut.localeCompare(b.date_debut))
      .slice(0, 3)
  }, [lecons])

  const prochainExamen = useMemo(() => {
    if (!examens) return null
    return examens.find(e => !e.resultat) ?? null
  }, [examens])

  const progression = eleve
    ? Math.min(100, Math.round((eleve.heures_effectuees / Math.max(eleve.heures_effectuees + eleve.solde_heures, 1)) * 100))
    : 0

  if (loadingEleve) return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>

  return (
    <div className="space-y-5">
      {/* Bonjour */}
      <div>
        <h1 className="text-xl font-bold text-[#0F172A]">Bonjour, {eleve?.prenom} 👋</h1>
        <p className="text-sm text-[#64748B] mt-0.5">Permis {eleve?.permis_vise} · {eleve?.statut?.replace('_', ' ')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4">
          <p className="text-xs text-[#64748B] mb-1">Heures effectuées</p>
          <p className="text-2xl font-bold text-[#0F172A]">{eleve?.heures_effectuees}<span className="text-sm font-normal text-[#64748B]">h</span></p>
          <div className="mt-2 h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
            <div className="h-full bg-[#2563EB] rounded-full transition-all" style={{ width: `${progression}%` }} />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4">
          <p className="text-xs text-[#64748B] mb-1">Solde d'heures</p>
          <p className="text-2xl font-bold text-[#0F172A]">{eleve?.solde_heures}<span className="text-sm font-normal text-[#64748B]">h</span></p>
          <p className="text-[10px] text-[#94A3B8] mt-2">disponibles</p>
        </div>
      </div>

      {/* Prochain examen */}
      {prochainExamen && (
        <div
          className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl p-4 flex items-center gap-3 cursor-pointer"
          onClick={() => navigate('/eleve/examens')}
        >
          <div className="w-10 h-10 bg-[#2563EB] rounded-xl flex items-center justify-center shrink-0">
            <Award className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#2563EB] font-medium">Prochain examen</p>
            <p className="text-sm font-semibold text-[#0F172A]">{prochainExamen.type === 'code' ? 'Code de la route' : 'Conduite'}</p>
            <p className="text-xs text-[#64748B]">{formatDate(prochainExamen.date_examen, 'dd MMMM yyyy')}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-[#2563EB] shrink-0" />
        </div>
      )}

      {/* Prochaines leçons */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[#0F172A]">Prochaines leçons</h2>
          <button onClick={() => navigate('/eleve/planning')} className="text-xs text-[#2563EB]">Voir tout</button>
        </div>
        {prochaines.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 text-center text-sm text-[#94A3B8]">
            Aucune leçon planifiée
          </div>
        ) : (
          <div className="space-y-2">
            {prochaines.map(l => (
              <div key={l.id} className="bg-white rounded-2xl border border-[#E2E8F0] p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-[#F8FAFC] rounded-xl flex items-center justify-center shrink-0 border border-[#E2E8F0]">
                  <CalendarDays className="w-4 h-4 text-[#64748B]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#0F172A] capitalize">{l.type.replace('_', ' ')}</p>
                  <p className="text-xs text-[#64748B]">{formatDate(l.date_debut, "EEEE d MMM 'à' HH'h'mm")}</p>
                  {l.moniteur && <p className="text-xs text-[#94A3B8]">Avec {l.moniteur.prenom} {l.moniteur.nom}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="flex items-center gap-1 text-[10px] font-medium" style={{ color: STATUT_COLORS[l.statut] }}>
                    <Clock className="w-3 h-3" />
                    {STATUT_LABELS[l.statut]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Progression */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-[#2563EB]" />
          <h2 className="text-sm font-semibold text-[#0F172A]">Progression globale</h2>
        </div>
        <div className="flex items-center justify-between text-xs text-[#64748B] mb-1.5">
          <span>{eleve?.heures_effectuees}h effectuées</span>
          <span>{(eleve?.heures_effectuees ?? 0) + (eleve?.solde_heures ?? 0)}h au total</span>
        </div>
        <div className="h-2.5 bg-[#F1F5F9] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#2563EB] to-[#60A5FA] rounded-full transition-all" style={{ width: `${progression}%` }} />
        </div>
        <p className="text-xs text-[#64748B] mt-1.5 text-right">{progression}% du forfait réalisé</p>

      </div>
    </div>
  )
}
