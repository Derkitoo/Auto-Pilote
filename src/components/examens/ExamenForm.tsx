import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { Examen } from '@/types'

const examenSchema = z.object({
  eleve_id: z.string().min(1, 'Élève requis'),
  type: z.enum(['code', 'conduite']),
  date_examen: z.string().min(1, 'Date requise'),
  lieu: z.string().nullable().optional(),
  resultat: z.enum(['admis', 'ajourne', 'absent']).nullable().optional(),
  score: z.number().min(0).max(40).nullable().optional(),
  notes: z.string().nullable().optional(),
})

type ExamenFormValues = z.infer<typeof examenSchema>

const TYPES = [
  { value: 'code',     label: 'Code de la route' },
  { value: 'conduite', label: 'Conduite' },
]
const RESULTATS = [
  { value: '',        label: '-- Résultat --' },
  { value: 'admis',   label: '✅ Admis' },
  { value: 'ajourne', label: '❌ Ajourné' },
  { value: 'absent',  label: '⚠️ Absent' },
]

interface ExamenFormProps {
  defaultValues?: Partial<Examen>
  elevesOptions: { value: string; label: string }[]
  onSubmit: (data: ExamenFormValues) => void
  onCancel: () => void
  isLoading?: boolean
}

export function ExamenForm({ defaultValues, elevesOptions, onSubmit, onCancel, isLoading }: ExamenFormProps) {
  const { register, handleSubmit, control, formState: { errors } } = useForm<ExamenFormValues>({
    resolver: zodResolver(examenSchema),
    defaultValues: {
      eleve_id: defaultValues?.eleve_id ?? '',
      type: defaultValues?.type ?? 'code',
      date_examen: defaultValues?.date_examen ?? '',
      lieu: defaultValues?.lieu ?? '',
      resultat: defaultValues?.resultat ?? null,
      score: defaultValues?.score ?? null,
      notes: defaultValues?.notes ?? '',
    },
  })

  const typeSelectionne = useWatch({ control, name: 'type' })
  const isCode = typeSelectionne === 'code'

  const handleFormSubmit = (data: ExamenFormValues) => {
    onSubmit({
      ...data,
      lieu: data.lieu || null,
      resultat: data.resultat || null,
      // On efface le score si ce n'est pas un examen de code
      score: isCode ? (data.score ?? null) : null,
      notes: data.notes || null,
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Select id="eleve_id" label="Élève *" options={elevesOptions} error={errors.eleve_id?.message} {...register('eleve_id')} />
        <Select id="type" label="Type *" options={TYPES} {...register('type')} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input id="date_examen" label="Date *" type="date" error={errors.date_examen?.message} {...register('date_examen')} />
        <Input id="lieu" label="Lieu" placeholder={isCode ? 'Centre ETG Lyon' : 'BSSER / Préfecture...'} {...register('lieu')} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Select id="resultat" label="Résultat" options={RESULTATS} {...register('resultat')} />
        {isCode ? (
          <div className="flex flex-col gap-1.5">
            <Input
              id="score"
              label="Score (/40)"
              type="number"
              min={0}
              max={40}
              {...register('score', { valueAsNumber: true, setValueAs: v => v === '' || isNaN(v) ? null : Number(v) })}
            />
            {/* Indicateur seuil 35/40 */}
            <p className="text-[10px] text-[#94A3B8]">Seuil de réussite : 35/40</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#64748B]">Score</label>
            <div className="h-9 px-3 flex items-center text-sm text-[#94A3B8] border border-[#E2E8F0] rounded-lg bg-[#F8FAFC]">
              Non applicable (conduite)
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#0F172A]">Notes</label>
        <textarea rows={2} className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] resize-none" {...register('notes')} />
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
        <Button type="button" variant="outline" onClick={onCancel}>Annuler</Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Enregistrement...' : defaultValues?.id ? 'Modifier' : 'Ajouter'}
        </Button>
      </div>
    </form>
  )
}
