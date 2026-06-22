import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { eleveSchema, type EleveFormValues } from '@/lib/validations'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { Eleve } from '@/types'

interface EleveFormProps {
  defaultValues?: Partial<Eleve>
  onSubmit: (data: EleveFormValues) => void
  onCancel: () => void
  isLoading?: boolean
}

const STATUTS = [
  { value: 'prospect', label: 'Prospect' },
  { value: 'inscrit', label: 'Inscrit' },
  { value: 'en_formation', label: 'En formation' },
  { value: 'examen_code', label: 'Examen code' },
  { value: 'examen_conduite', label: 'Examen conduite' },
  { value: 'diplome', label: 'Diplômé' },
  { value: 'abandonne', label: 'Abandonné' },
]

const PERMIS = ['B', 'A', 'A2', 'A1', 'AM', 'BE', 'C', 'CE', 'D'].map(v => ({ value: v, label: v }))

const FINANCEMENTS = [
  { value: 'personnel', label: 'Personnel' },
  { value: 'cpf', label: 'CPF' },
  { value: 'permis_a_un_euro', label: 'Permis à 1€' },
  { value: 'aidants', label: 'Aidants' },
  { value: 'autre', label: 'Autre' },
]

export function EleveForm({ defaultValues, onSubmit, onCancel, isLoading }: EleveFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<EleveFormValues>({
    resolver: zodResolver(eleveSchema),
    defaultValues: {
      prenom: defaultValues?.prenom ?? '',
      nom: defaultValues?.nom ?? '',
      email: defaultValues?.email ?? '',
      telephone: defaultValues?.telephone ?? '',
      date_naissance: defaultValues?.date_naissance ?? '',
      adresse: defaultValues?.adresse ?? '',
      code_postal: defaultValues?.code_postal ?? '',
      ville: defaultValues?.ville ?? '',
      neph: defaultValues?.neph ?? '',
      permis_vise: defaultValues?.permis_vise ?? 'B',
      statut: defaultValues?.statut ?? 'inscrit',
      solde_heures: defaultValues?.solde_heures ?? 20,
      financement: defaultValues?.financement ?? 'personnel',
      date_inscription: defaultValues?.date_inscription ?? new Date().toISOString().split('T')[0],
      date_code: defaultValues?.date_code ?? '',
      date_permis: defaultValues?.date_permis ?? '',
      notes: defaultValues?.notes ?? '',
      profile_id: defaultValues?.profile_id ?? null,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input
          id="prenom"
          label="Prénom *"
          error={errors.prenom?.message}
          {...register('prenom')}
        />
        <Input
          id="nom"
          label="Nom *"
          error={errors.nom?.message}
          {...register('nom')}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          id="email"
          label="Email *"
          type="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          id="telephone"
          label="Téléphone *"
          error={errors.telephone?.message}
          {...register('telephone')}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          id="date_naissance"
          label="Date de naissance *"
          type="date"
          error={errors.date_naissance?.message}
          {...register('date_naissance')}
        />
        <Input
          id="date_inscription"
          label="Date d'inscription *"
          type="date"
          error={errors.date_inscription?.message}
          {...register('date_inscription')}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Select
          id="permis_vise"
          label="Permis visé *"
          options={PERMIS}
          error={errors.permis_vise?.message}
          {...register('permis_vise')}
        />
        <Select
          id="statut"
          label="Statut *"
          options={STATUTS}
          error={errors.statut?.message}
          {...register('statut')}
        />
        <Select
          id="financement"
          label="Financement *"
          options={FINANCEMENTS}
          error={errors.financement?.message}
          {...register('financement')}
        />
      </div>

      <Input
        id="solde_heures"
        label="Solde d'heures *"
        type="number"
        min={0}
        error={errors.solde_heures?.message}
        {...register('solde_heures', { valueAsNumber: true })}
      />

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <Input
            id="adresse"
            label="Adresse"
            {...register('adresse')}
          />
        </div>
        <Input
          id="code_postal"
          label="Code postal"
          {...register('code_postal')}
        />
      </div>

      <Input
        id="ville"
        label="Ville"
        {...register('ville')}
      />

      <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Enregistrement...' : defaultValues?.id ? 'Modifier' : 'Créer'}
        </Button>
      </div>
    </form>
  )
}
