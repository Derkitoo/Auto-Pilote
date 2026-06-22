import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { Moniteur } from '@/types'

const moniteurSchema = z.object({
  prenom: z.string().min(2, 'Prénom requis'),
  nom: z.string().min(2, 'Nom requis'),
  email: z.string().email('Email invalide'),
  telephone: z.string().min(10, 'Téléphone invalide'),
  numero_enseignant: z.string().nullable().optional(),
  couleur_agenda: z.string().min(4, 'Couleur requise'),
  actif: z.boolean(),
  profile_id: z.string().min(1, 'ID profil requis'),
})

type MoniteurFormValues = z.infer<typeof moniteurSchema>

const COULEURS = [
  '#2563EB', '#16A34A', '#D97706', '#DC2626',
  '#7C3AED', '#0891B2', '#DB2777', '#059669',
]

interface MoniteurFormProps {
  defaultValues?: Partial<Moniteur>
  onSubmit: (data: MoniteurFormValues) => void
  onCancel: () => void
  isLoading?: boolean
}

export function MoniteurForm({ defaultValues, onSubmit, onCancel, isLoading }: MoniteurFormProps) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<MoniteurFormValues>({
    resolver: zodResolver(moniteurSchema),
    defaultValues: {
      prenom: defaultValues?.prenom ?? '',
      nom: defaultValues?.nom ?? '',
      email: defaultValues?.email ?? '',
      telephone: defaultValues?.telephone ?? '',
      numero_enseignant: defaultValues?.numero_enseignant ?? '',
      couleur_agenda: defaultValues?.couleur_agenda ?? '#2563EB',
      actif: defaultValues?.actif ?? true,
      profile_id: defaultValues?.profile_id ?? `prof-${crypto.randomUUID().slice(0, 8)}`,
    },
  })

  const couleurActuelle = watch('couleur_agenda')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input id="prenom" label="Prénom *" error={errors.prenom?.message} {...register('prenom')} />
        <Input id="nom" label="Nom *" error={errors.nom?.message} {...register('nom')} />
      </div>

      <Input id="email" label="Email *" type="email" error={errors.email?.message} {...register('email')} />
      <Input id="telephone" label="Téléphone *" error={errors.telephone?.message} {...register('telephone')} />
      <Input id="numero_enseignant" label="N° enseignant" placeholder="ENS-069-XXX" {...register('numero_enseignant')} />

      {/* Couleur agenda */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#0F172A]">Couleur agenda</label>
        <div className="flex items-center gap-2 flex-wrap">
          {COULEURS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setValue('couleur_agenda', c)}
              className="w-7 h-7 rounded-full border-2 transition-all"
              style={{
                backgroundColor: c,
                borderColor: couleurActuelle === c ? '#0F172A' : 'transparent',
                transform: couleurActuelle === c ? 'scale(1.15)' : 'scale(1)',
              }}
            />
          ))}
          <input
            type="color"
            {...register('couleur_agenda')}
            className="w-7 h-7 rounded-full border border-[#E2E8F0] cursor-pointer"
            title="Couleur personnalisée"
          />
        </div>
        {errors.couleur_agenda && <p className="text-xs text-[#DC2626]">{errors.couleur_agenda.message}</p>}
      </div>

      {/* Actif */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" {...register('actif')} className="w-4 h-4 accent-[#2563EB]" />
        <span className="text-sm text-[#0F172A]">Moniteur actif</span>
      </label>

      <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
        <Button type="button" variant="outline" onClick={onCancel}>Annuler</Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Enregistrement...' : defaultValues?.id ? 'Modifier' : 'Créer'}
        </Button>
      </div>
    </form>
  )
}
