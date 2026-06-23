import { useForm, useFieldArray, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { Facture } from '@/types'

const ligneSchema = z.object({
  description: z.string().min(1, 'Requis'),
  quantite: z.number().min(1),
  prix_unitaire_ht: z.number().min(0),
  tva: z.number().min(0).max(100),
})

const factureSchema = z.object({
  eleve_id: z.string().min(1, 'Élève requis'),
  numero: z.string().min(1),
  date_emission: z.string().min(1),
  date_echeance: z.string().min(1),
  statut_paiement: z.enum(['brouillon', 'envoyee', 'payee', 'en_retard', 'annulee']),
  lignes: z.array(ligneSchema).min(1, 'Au moins une ligne'),
  notes: z.string().optional(),
})

type FactureFormValues = z.infer<typeof factureSchema>

const STATUTS = [
  { value: 'brouillon', label: 'Brouillon' },
  { value: 'envoyee',   label: 'Envoyée' },
  { value: 'payee',     label: 'Payée' },
  { value: 'en_retard', label: 'En retard' },
  { value: 'annulee',   label: 'Annulée' },
]

const TVA_OPTIONS = [
  { value: '0',  label: '0%' },
  { value: '5.5', label: '5.5%' },
  { value: '10', label: '10%' },
  { value: '20', label: '20%' },
]

interface FactureFormProps {
  defaultValues?: Partial<Facture>
  defaultNumero: string
  elevesOptions: { value: string; label: string }[]
  onSubmit: (data: Omit<Facture, 'id' | 'auto_ecole_id' | 'created_at' | 'updated_at' | 'eleve'>) => void
  onCancel: () => void
  isLoading?: boolean
}

export function FactureForm({ defaultValues, defaultNumero, elevesOptions, onSubmit, onCancel, isLoading }: FactureFormProps) {
  const { register, control, handleSubmit, formState: { errors } } = useForm<FactureFormValues>({
    resolver: zodResolver(factureSchema),
    defaultValues: {
      eleve_id: defaultValues?.eleve_id ?? '',
      numero: defaultValues?.numero ?? defaultNumero,
      date_emission: defaultValues?.date_emission ?? new Date().toISOString().split('T')[0],
      date_echeance: defaultValues?.date_echeance ?? '',
      statut_paiement: defaultValues?.statut_paiement ?? 'brouillon',
      lignes: defaultValues?.lignes ?? [{ description: '', quantite: 1, prix_unitaire_ht: 0, tva: 20 }],
      notes: defaultValues?.notes ?? '',
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'lignes' })

  const lignesWatched = useWatch({ control, name: 'lignes' })
  const ht = lignesWatched?.reduce((s, l) => s + (l.quantite || 0) * (l.prix_unitaire_ht || 0), 0) ?? 0
  const tva = lignesWatched?.reduce((s, l) => s + (l.quantite || 0) * (l.prix_unitaire_ht || 0) * ((l.tva || 0) / 100), 0) ?? 0
  const ttc = ht + tva

  const handleFormSubmit = (data: FactureFormValues) => {
    onSubmit({
      ...data,
      montant_ht: ht,
      montant_tva: tva,
      montant_ttc: ttc,
      notes: data.notes ?? null,
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Select id="eleve_id" label="Élève *" options={elevesOptions} error={errors.eleve_id?.message} {...register('eleve_id')} />
        <Input id="numero" label="Numéro" {...register('numero')} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input id="date_emission" label="Date d'émission" type="date" {...register('date_emission')} />
        <Input id="date_echeance" label="Échéance" type="date" {...register('date_echeance')} />
      </div>

      <Select id="statut_paiement" label="Statut" options={STATUTS} {...register('statut_paiement')} />

      {/* Lignes */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-[#0F172A]">Lignes de facture *</p>
          <button
            type="button"
            onClick={() => append({ description: '', quantite: 1, prix_unitaire_ht: 0, tva: 20 })}
            className="flex items-center gap-1 text-xs text-[#2563EB] hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            Ajouter une ligne
          </button>
        </div>

        {/* Header */}
        <div className="hidden sm:grid grid-cols-[1fr_60px_90px_70px_32px] gap-2 px-2 text-xs text-[#94A3B8] font-medium">
          <span>Description</span><span className="text-center">Qté</span><span className="text-right">Prix HT</span><span className="text-right">TVA</span><span />
        </div>

        {fields.map((field, i) => (
          <div key={field.id} className="grid grid-cols-[1fr_60px_90px_70px_32px] gap-2 items-start">
            <input
              placeholder="Description"
              className="h-9 px-3 text-sm border border-[#E2E8F0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              {...register(`lignes.${i}.description`)}
            />
            <input
              type="number" min="1"
              className="h-9 px-2 text-sm border border-[#E2E8F0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-center"
              {...register(`lignes.${i}.quantite`, { valueAsNumber: true })}
            />
            <input
              type="number" min="0" step="0.01"
              className="h-9 px-2 text-sm border border-[#E2E8F0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-right"
              {...register(`lignes.${i}.prix_unitaire_ht`, { valueAsNumber: true })}
            />
            <select
              className="h-9 px-2 text-sm border border-[#E2E8F0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              {...register(`lignes.${i}.tva`, { valueAsNumber: true })}
            >
              {TVA_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button
              type="button"
              onClick={() => remove(i)}
              disabled={fields.length === 1}
              className="h-9 w-8 flex items-center justify-center text-[#DC2626] disabled:opacity-30 hover:bg-[#FEF2F2] rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        {errors.lignes && <p className="text-xs text-[#DC2626]">{String(errors.lignes.message ?? '')}</p>}
      </div>

      {/* Totaux */}
      <div className="bg-[#F8FAFC] rounded-lg p-3 space-y-1 text-sm">
        <div className="flex justify-between text-[#64748B]">
          <span>Sous-total HT</span>
          <span>{ht.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
        </div>
        <div className="flex justify-between text-[#64748B]">
          <span>TVA</span>
          <span>{tva.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
        </div>
        <div className="flex justify-between font-semibold text-[#0F172A] pt-1 border-t border-[#E2E8F0]">
          <span>Total TTC</span>
          <span>{ttc.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
        </div>
      </div>

      {/* Notes */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#0F172A]">Notes</label>
        <textarea rows={2} className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] resize-none" {...register('notes')} />
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
        <Button type="button" variant="outline" onClick={onCancel}>Annuler</Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Enregistrement...' : defaultValues?.id ? 'Modifier' : 'Créer'}
        </Button>
      </div>
    </form>
  )
}
