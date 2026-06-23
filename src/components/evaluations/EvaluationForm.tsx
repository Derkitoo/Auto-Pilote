import { useForm, useWatch } from 'react-hook-form'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { Lecon, CompetencesEvaluation } from '@/types'

const COMPETENCES: { key: keyof CompetencesEvaluation; label: string }[] = [
  { key: 'maitrise_vehicule',        label: 'Maîtrise du véhicule' },
  { key: 'comportement_circulation', label: 'Comportement en circulation' },
  { key: 'respect_regles',           label: 'Respect des règles' },
  { key: 'communication',            label: 'Communication' },
  { key: 'independance',             label: 'Autonomie / Indépendance' },
]

interface FormValues {
  lecon_id: string
  maitrise_vehicule: number
  comportement_circulation: number
  respect_regles: number
  communication: number
  independance: number
  commentaire: string
}

interface Props {
  eleveId: string
  lecons: Lecon[]
  onSubmit: (data: {
    lecon_id: string
    eleve_id: string
    moniteur_id: string
    competences: CompetencesEvaluation
    note_globale: number
    commentaire: string | null
  }) => Promise<void>
  onCancel: () => void
  isLoading: boolean
}

export function EvaluationForm({ eleveId, lecons, onSubmit, onCancel, isLoading }: Props) {
  const { register, handleSubmit, control } = useForm<FormValues>({
    defaultValues: {
      lecon_id: lecons[0]?.id ?? '',
      maitrise_vehicule: 3,
      comportement_circulation: 3,
      respect_regles: 3,
      communication: 3,
      independance: 3,
      commentaire: '',
    },
  })

  const values = useWatch({ control })
  const leconId = values.lecon_id
  const selectedLecon = lecons.find(l => l.id === leconId)

  const scores = [
    Number(values.maitrise_vehicule),
    Number(values.comportement_circulation),
    Number(values.respect_regles),
    Number(values.communication),
    Number(values.independance),
  ]
  const noteGlobale = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10

  const submit = handleSubmit(async (data) => {
    if (!selectedLecon) return
    await onSubmit({
      lecon_id: data.lecon_id,
      eleve_id: eleveId,
      moniteur_id: selectedLecon.moniteur_id,
      competences: {
        maitrise_vehicule: Number(data.maitrise_vehicule),
        comportement_circulation: Number(data.comportement_circulation),
        respect_regles: Number(data.respect_regles),
        communication: Number(data.communication),
        independance: Number(data.independance),
      },
      note_globale: noteGlobale,
      commentaire: data.commentaire?.trim() || null,
    })
  })

  if (lecons.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-[#64748B]">
        Aucune leçon effectuée disponible pour évaluer.
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {/* Leçon */}
      <div>
        <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Leçon à évaluer</label>
        <select
          {...register('lecon_id')}
          className="w-full h-9 px-3 text-sm border border-[#E2E8F0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
        >
          {lecons.map(l => (
            <option key={l.id} value={l.id}>
              {formatDate(l.date_debut, "dd/MM/yyyy 'à' HH:mm")} — {l.type.replace(/_/g, ' ')}
              {l.moniteur ? ` (${l.moniteur.prenom} ${l.moniteur.nom})` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Compétences */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-[#0F172A]">Compétences</p>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[#64748B]">Note globale :</span>
            <span className="text-sm font-bold text-[#2563EB]">{noteGlobale}/5</span>
          </div>
        </div>
        {COMPETENCES.map(({ key, label }) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-[#64748B]">{label}</label>
              <span className="text-xs font-semibold text-[#0F172A]">{values[key]}/5</span>
            </div>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map(n => (
                <label key={n} className="flex-1 cursor-pointer">
                  <input type="radio" {...register(key)} value={n} className="sr-only" />
                  <div className={`h-7 rounded-md flex items-center justify-center text-xs font-semibold transition-colors ${
                    Number(values[key]) >= n
                      ? 'bg-[#2563EB] text-white'
                      : 'bg-[#F1F5F9] text-[#94A3B8] hover:bg-[#E2E8F0]'
                  }`}>
                    {n}
                  </div>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Commentaire */}
      <div>
        <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Commentaire</label>
        <textarea
          {...register('commentaire')}
          rows={3}
          placeholder="Observations, points à travailler..."
          className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg bg-white resize-none focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
        />
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="outline" onClick={onCancel}>Annuler</Button>
        <Button type="submit" disabled={isLoading || !selectedLecon}>
          {isLoading ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </div>
    </form>
  )
}
