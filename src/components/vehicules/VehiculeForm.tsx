import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { Vehicule } from '@/types'

const vehiculeSchema = z.object({
  immatriculation: z.string().min(5, 'Immatriculation invalide'),
  marque: z.string().min(2, 'Marque requise'),
  modele: z.string().min(1, 'Modèle requis'),
  categorie: z.enum(['voiture', 'moto', 'camion']),
  type_boite: z.enum(['manuelle', 'automatique']),
  annee: z.number().min(2000).max(new Date().getFullYear() + 1),
  kilometrage: z.number().min(0),
  actif: z.boolean(),
})

type VehiculeFormValues = z.infer<typeof vehiculeSchema>

interface VehiculeFormProps {
  defaultValues?: Partial<Vehicule>
  onSubmit: (data: VehiculeFormValues) => void
  onCancel: () => void
  isLoading?: boolean
}

const CATEGORIES = [
  { value: 'voiture', label: '🚗 Voiture' },
  { value: 'moto', label: '🏍️ Moto' },
  { value: 'camion', label: '🚛 Camion' },
]

const BOITES = [
  { value: 'manuelle', label: 'Manuelle (BVM)' },
  { value: 'automatique', label: 'Automatique (BVA)' },
]

export function VehiculeForm({ defaultValues, onSubmit, onCancel, isLoading }: VehiculeFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<VehiculeFormValues>({
    resolver: zodResolver(vehiculeSchema),
    defaultValues: {
      immatriculation: defaultValues?.immatriculation ?? '',
      marque: defaultValues?.marque ?? '',
      modele: defaultValues?.modele ?? '',
      categorie: defaultValues?.categorie ?? 'voiture',
      type_boite: defaultValues?.type_boite ?? 'manuelle',
      annee: defaultValues?.annee ?? new Date().getFullYear(),
      kilometrage: defaultValues?.kilometrage ?? 0,
      actif: defaultValues?.actif ?? true,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        id="immatriculation"
        label="Immatriculation *"
        placeholder="AB-123-CD"
        error={errors.immatriculation?.message}
        {...register('immatriculation')}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input id="marque" label="Marque *" placeholder="Peugeot" error={errors.marque?.message} {...register('marque')} />
        <Input id="modele" label="Modèle *" placeholder="208" error={errors.modele?.message} {...register('modele')} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Select id="categorie" label="Catégorie *" options={CATEGORIES} error={errors.categorie?.message} {...register('categorie')} />
        <Select id="type_boite" label="Boîte *" options={BOITES} error={errors.type_boite?.message} {...register('type_boite')} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input id="annee" label="Année *" type="number" error={errors.annee?.message} {...register('annee', { valueAsNumber: true })} />
        <Input id="kilometrage" label="Kilométrage" type="number" error={errors.kilometrage?.message} {...register('kilometrage', { valueAsNumber: true })} />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" {...register('actif')} className="w-4 h-4 accent-[#2563EB]" />
        <span className="text-sm text-[#0F172A]">Véhicule actif</span>
      </label>
      <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
        <Button type="button" variant="outline" onClick={onCancel}>Annuler</Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Enregistrement...' : defaultValues?.id ? 'Modifier' : 'Ajouter'}
        </Button>
      </div>
    </form>
  )
}
