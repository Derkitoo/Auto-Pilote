import { Star } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useEvaluations } from '@/hooks/useEvaluations'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/utils'
import type { Evaluation } from '@/types'

const COMPETENCES_LABELS: Record<string, string> = {
  maitrise_vehicule:        'Maîtrise du véhicule',
  comportement_circulation: 'Comportement en circulation',
  respect_regles:           'Respect des règles',
  communication:            'Communication',
  independance:             'Autonomie',
}

export function EleveEvaluationsPage() {
  const { user } = useAuth()
  const { data: evaluations, isLoading } = useEvaluations(user?.eleve_id ?? '')

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-[#0F172A]">Mes évaluations</h1>
        <p className="text-sm text-[#64748B] mt-0.5">{evaluations?.length ?? 0} évaluation{(evaluations?.length ?? 0) > 1 ? 's' : ''} enregistrée{(evaluations?.length ?? 0) > 1 ? 's' : ''}</p>
      </div>

      {!evaluations?.length ? (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] py-14 text-center">
          <Star className="w-10 h-10 text-[#E2E8F0] mx-auto mb-3" />
          <p className="text-sm text-[#64748B]">Aucune évaluation pour le moment.</p>
          <p className="text-xs text-[#94A3B8] mt-1">Elles apparaîtront après vos leçons.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {evaluations.map(ev => <EvalCard key={ev.id} evaluation={ev} />)}
        </div>
      )}
    </div>
  )
}

function EvalCard({ evaluation }: { evaluation: Evaluation }) {
  const entries = Object.entries(evaluation.competences) as [string, number][]
  const noteColor = evaluation.note_globale >= 4 ? '#16A34A' : evaluation.note_globale >= 3 ? '#2563EB' : '#D97706'

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-[#64748B]">{formatDate(evaluation.created_at, 'dd MMMM yyyy')}</p>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ backgroundColor: `${noteColor}15` }}>
          <Star className="w-3.5 h-3.5 fill-current" style={{ color: noteColor }} />
          <span className="text-sm font-bold" style={{ color: noteColor }}>{evaluation.note_globale}/5</span>
        </div>
      </div>

      <div className="space-y-2.5">
        {entries.map(([key, val]) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[#64748B]">{COMPETENCES_LABELS[key] ?? key}</span>
              <span className="text-xs font-semibold text-[#0F172A]">{val}/5</span>
            </div>
            <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${(val / 5) * 100}%`,
                  backgroundColor: val >= 4 ? '#16A34A' : val >= 3 ? '#2563EB' : '#D97706',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {evaluation.commentaire && (
        <div className="mt-3 p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
          <p className="text-xs text-[#64748B] italic">"{evaluation.commentaire}"</p>
        </div>
      )}
    </div>
  )
}
