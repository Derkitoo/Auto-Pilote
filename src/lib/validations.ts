import { z } from 'zod'

export const eleveSchema = z.object({
  prenom: z.string().min(2, 'Prénom requis'),
  nom: z.string().min(2, 'Nom requis'),
  email: z.string().email('Email invalide'),
  telephone: z.string().min(10, 'Téléphone invalide'),
  date_naissance: z.string().min(1, 'Date de naissance requise'),
  adresse: z.string().nullable().optional(),
  code_postal: z.string().nullable().optional(),
  ville: z.string().nullable().optional(),
  neph: z.string().nullable().optional(),
  permis_vise: z.enum(['B', 'A', 'A2', 'A1', 'AM', 'BE', 'C', 'CE', 'D']),
  statut: z.enum(['prospect', 'inscrit', 'en_formation', 'examen_code', 'examen_conduite', 'diplome', 'abandonne']),
  solde_heures: z.number().min(0),
  financement: z.enum(['personnel', 'cpf', 'permis_a_un_euro', 'aidants', 'autre']),
  date_inscription: z.string().min(1, 'Date d\'inscription requise'),
  date_code: z.string().nullable().optional(),
  date_permis: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  profile_id: z.string().nullable().optional(),
})

export type EleveFormValues = z.infer<typeof eleveSchema>
