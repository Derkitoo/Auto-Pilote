import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Building2, MapPin, Phone, Hash, Palette, Save } from 'lucide-react'
import { useAutoEcole, useUpdateAutoEcole } from '@/hooks/useAutoEcole'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

const settingsSchema = z.object({
  nom: z.string().min(2, 'Nom requis'),
  siret: z.string().length(14, 'SIRET = 14 chiffres'),
  adresse: z.string().min(3, 'Adresse requise'),
  code_postal: z.string().length(5, 'Code postal invalide'),
  ville: z.string().min(2, 'Ville requise'),
  telephone: z.string().min(10, 'Téléphone invalide'),
  email: z.string().email('Email invalide'),
  couleur_principale: z.string().min(4, 'Couleur requise'),
})

type SettingsFormValues = z.infer<typeof settingsSchema>

const COULEURS_PRESET = [
  { value: '#2563EB', label: 'Bleu' },
  { value: '#7C3AED', label: 'Violet' },
  { value: '#16A34A', label: 'Vert' },
  { value: '#D97706', label: 'Orange' },
  { value: '#DC2626', label: 'Rouge' },
  { value: '#0891B2', label: 'Cyan' },
  { value: '#DB2777', label: 'Rose' },
  { value: '#0F172A', label: 'Ardoise' },
]

export function SettingsPage() {
  const { data: autoEcole, isLoading } = useAutoEcole()
  const updateAutoEcole = useUpdateAutoEcole()

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isDirty } } =
    useForm<SettingsFormValues>({
      resolver: zodResolver(settingsSchema),
      defaultValues: {
        nom: '',
        siret: '',
        adresse: '',
        code_postal: '',
        ville: '',
        telephone: '',
        email: '',
        couleur_principale: '#2563EB',
      },
    })

  useEffect(() => {
    if (autoEcole) {
      reset({
        nom: autoEcole.nom,
        siret: autoEcole.siret,
        adresse: autoEcole.adresse,
        code_postal: autoEcole.code_postal,
        ville: autoEcole.ville,
        telephone: autoEcole.telephone,
        email: autoEcole.email,
        couleur_principale: autoEcole.couleur_principale,
      })
    }
  }, [autoEcole, reset])

  const couleur = watch('couleur_principale')

  const onSubmit = async (data: SettingsFormValues) => {
    await updateAutoEcole.mutateAsync(data)
    reset(data)
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-5">

      {/* Identité */}
      <Section icon={<Building2 className="w-4 h-4" />} title="Identité de l'auto-école">
        <div className="space-y-4">
          <Input
            id="nom"
            label="Nom de l'établissement *"
            error={errors.nom?.message}
            {...register('nom')}
          />
          <Input
            id="siret"
            label="SIRET *"
            placeholder="14 chiffres"
            error={errors.siret?.message}
            {...register('siret')}
          />
        </div>
      </Section>

      {/* Adresse */}
      <Section icon={<MapPin className="w-4 h-4" />} title="Adresse">
        <div className="space-y-4">
          <Input
            id="adresse"
            label="Adresse *"
            error={errors.adresse?.message}
            {...register('adresse')}
          />
          <div className="grid grid-cols-3 gap-3">
            <Input
              id="code_postal"
              label="Code postal *"
              error={errors.code_postal?.message}
              {...register('code_postal')}
            />
            <div className="col-span-2">
              <Input
                id="ville"
                label="Ville *"
                error={errors.ville?.message}
                {...register('ville')}
              />
            </div>
          </div>
        </div>
      </Section>

      {/* Contact */}
      <Section icon={<Phone className="w-4 h-4" />} title="Contact">
        <div className="grid grid-cols-2 gap-4">
          <Input
            id="telephone"
            label="Téléphone *"
            error={errors.telephone?.message}
            {...register('telephone')}
          />
          <Input
            id="email"
            label="Email *"
            type="email"
            error={errors.email?.message}
            {...register('email')}
          />
        </div>
      </Section>

      {/* Branding */}
      <Section icon={<Palette className="w-4 h-4" />} title="Couleur principale">
        <div className="space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            {COULEURS_PRESET.map(c => (
              <button
                key={c.value}
                type="button"
                title={c.label}
                onClick={() => setValue('couleur_principale', c.value, { shouldDirty: true })}
                className="w-8 h-8 rounded-full border-2 transition-all"
                style={{
                  backgroundColor: c.value,
                  borderColor: couleur === c.value ? '#0F172A' : 'transparent',
                  transform: couleur === c.value ? 'scale(1.2)' : 'scale(1)',
                }}
              />
            ))}
            <input
              type="color"
              {...register('couleur_principale')}
              className="w-8 h-8 rounded-full border border-[#E2E8F0] cursor-pointer"
              title="Couleur personnalisée"
            />
          </div>
          {/* Aperçu */}
          <div className="flex items-center gap-3 p-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: couleur }}>
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0F172A]">PermisFlow</p>
              <p className="text-xs" style={{ color: couleur }}>Aperçu couleur principale</p>
            </div>
          </div>
        </div>
      </Section>

      {/* Infos système */}
      <Section icon={<Hash className="w-4 h-4" />} title="Informations système">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <InfoRow label="ID auto-école" value={autoEcole?.id ?? '—'} />
          <InfoRow label="Compte créé le" value={autoEcole ? new Date(autoEcole.created_at).toLocaleDateString('fr-FR') : '—'} />
          <InfoRow label="Version" value="MVP 1.0.0 — local" />
          <InfoRow label="Base de données" value="Mock (local)" />
        </div>
      </Section>

      {/* Save bar */}
      <div className={`sticky bottom-0 -mx-6 px-6 py-4 bg-white border-t border-[#E2E8F0] flex items-center justify-between transition-opacity ${isDirty ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <p className="text-sm text-[#64748B]">Vous avez des modifications non sauvegardées.</p>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={() => reset()}>Annuler</Button>
          <Button type="submit" disabled={updateAutoEcole.isPending}>
            <Save className="w-4 h-4" />
            {updateAutoEcole.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </div>
    </form>
  )
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#E2E8F0] bg-[#F8FAFC]">
        <span className="text-[#64748B]">{icon}</span>
        <h3 className="text-sm font-semibold text-[#0F172A]">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-[#64748B] mb-0.5">{label}</p>
      <p className="text-sm font-medium text-[#0F172A] font-mono">{value}</p>
    </div>
  )
}
