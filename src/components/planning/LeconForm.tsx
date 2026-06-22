import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useEleves } from '@/hooks/useEleves'
import { useMoniteurs } from '@/hooks/useMoniteurs'
import type { Lecon } from '@/types'

const leconSchema = z.object({
  eleve_id: z.string().min(1, 'Élève requis'),
  moniteur_id: z.string().min(1, 'Moniteur requis'),
  vehicule_id: z.string().nullable().optional(),
  date_debut: z.string().min(1, 'Date de début requise'),
  date_fin: z.string().min(1, 'Date de fin requise'),
  type: z.enum(['conduite', 'code', 'evaluation', 'examen_blanc', 'accompagnement']),
  statut: z.enum(['planifiee', 'confirmee', 'effectuee', 'annulee_eleve', 'annulee_moniteur', 'no_show']),
  lieu_rdv: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})

type LeconFormValues = z.infer<typeof leconSchema>

const TYPES = [
  { value: 'conduite', label: 'Conduite' },
  { value: 'code', label: 'Code' },
  { value: 'evaluation', label: 'Évaluation' },
  { value: 'examen_blanc', label: 'Examen blanc' },
  { value: 'accompagnement', label: 'Accompagnement' },
]

const STATUTS = [
  { value: 'planifiee', label: 'Planifiée' },
  { value: 'confirmee', label: 'Confirmée' },
  { value: 'effectuee', label: 'Effectuée' },
  { value: 'annulee_eleve', label: 'Annulée (élève)' },
  { value: 'annulee_moniteur', label: 'Annulée (moniteur)' },
  { value: 'no_show', label: 'No-show' },
]

interface LeconFormProps {
  defaultValues?: Partial<Lecon>
  onSubmit: (data: LeconFormValues) => void
  onCancel: () => void
  isLoading?: boolean
}

function toDateTimeLocal(iso: string) {
  return iso ? iso.slice(0, 16) : ''
}

export function LeconForm({ defaultValues, onSubmit, onCancel, isLoading }: LeconFormProps) {
  const { data: eleves } = useEleves()
  const { data: moniteurs } = useMoniteurs()

  const { register, handleSubmit, formState: { errors } } = useForm<LeconFormValues>({
    resolver: zodResolver(leconSchema),
    defaultValues: {
      eleve_id: defaultValues?.eleve_id ?? '',
      moniteur_id: defaultValues?.moniteur_id ?? '',
      vehicule_id: defaultValues?.vehicule_id ?? null,
      date_debut: defaultValues?.date_debut ? toDateTimeLocal(defaultValues.date_debut) : '',
      date_fin: defaultValues?.date_fin ? toDateTimeLocal(defaultValues.date_fin) : '',
      type: defaultValues?.type ?? 'conduite',
      statut: defaultValues?.statut ?? 'planifiee',
      lieu_rdv: defaultValues?.lieu_rdv ?? '',
      notes: defaultValues?.notes ?? '',
    },
  })

  const elevesOptions = [
    { value: '', label: '-- Sélectionner un élève --' },
    ...(eleves?.map(e => ({ value: e.id, label: `${e.prenom} ${e.nom}` })) ?? []),
  ]

  const moniteursOptions = [
    { value: '', label: '-- Sélectionner un moniteur --' },
    ...(moniteurs?.map(m => ({ value: m.id, label: `${m.prenom} ${m.nom}` })) ?? []),
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Select
          id="eleve_id"
          label="Élève *"
          options={elevesOptions}
          error={errors.eleve_id?.message}
          {...register('eleve_id')}
        />
        <Select
          id="moniteur_id"
          label="Moniteur *"
          options={moniteursOptions}
          error={errors.moniteur_id?.message}
          {...register('moniteur_id')}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          id="date_debut"
          label="Début *"
          type="datetime-local"
          error={errors.date_debut?.message}
          {...register('date_debut')}
        />
        <Input
          id="date_fin"
          label="Fin *"
          type="datetime-local"
          error={errors.date_fin?.message}
          {...register('date_fin')}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Select
          id="type"
          label="Type *"
          options={TYPES}
          error={errors.type?.message}
          {...register('type')}
        />
        <Select
          id="statut"
          label="Statut *"
          options={STATUTS}
          error={errors.statut?.message}
          {...register('statut')}
        />
      </div>

      <Input
        id="lieu_rdv"
        label="Lieu de RDV"
        placeholder="Ex: Agence principale"
        {...register('lieu_rdv')}
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="notes" className="text-sm font-medium text-[#0F172A]">Notes</label>
        <textarea
          id="notes"
          rows={2}
          className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] resize-none"
          placeholder="Observations, consignes..."
          {...register('notes')}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
        <Button type="button" variant="outline" onClick={onCancel}>Annuler</Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Enregistrement...' : defaultValues?.id ? 'Modifier' : 'Créer la leçon'}
        </Button>
      </div>
    </form>
  )
}
