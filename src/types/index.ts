// ─── Entités principales ────────────────────────────────────────────────────

export type RoleUtilisateur = 'gerant' | 'moniteur' | 'secretaire' | 'eleve'

export type StatutEleve =
  | 'prospect'
  | 'inscrit'
  | 'en_formation'
  | 'examen_code'
  | 'examen_conduite'
  | 'diplome'
  | 'abandonne'

export type TypePermis = 'B' | 'A' | 'A2' | 'A1' | 'AM' | 'BE' | 'C' | 'CE' | 'D'

export type TypeFinancement = 'personnel' | 'cpf' | 'permis_a_un_euro' | 'aidants' | 'autre'

export type TypeBoite = 'manuelle' | 'automatique'

export type CategorieVehicule = 'voiture' | 'moto' | 'camion'

export const PERMIS_MOTO: TypePermis[] = ['A', 'A2', 'A1', 'AM']
export const PERMIS_VOITURE: TypePermis[] = ['B', 'BE']
export const PERMIS_CAMION: TypePermis[] = ['C', 'CE', 'D']

export function categorieFromPermis(permis: TypePermis): CategorieVehicule {
  if (PERMIS_MOTO.includes(permis)) return 'moto'
  if (PERMIS_CAMION.includes(permis)) return 'camion'
  return 'voiture'
}

export type StatutLecon =
  | 'planifiee'
  | 'confirmee'
  | 'effectuee'
  | 'annulee_eleve'
  | 'annulee_moniteur'
  | 'no_show'

export type TypeLecon = 'conduite' | 'code' | 'evaluation' | 'examen_blanc' | 'accompagnement'

export type StatutFacture = 'brouillon' | 'envoyee' | 'payee' | 'en_retard' | 'annulee'

export type ResultatExamen = 'admis' | 'ajourne' | 'absent'

export type TypeExamen = 'code' | 'conduite'

// ─── AutoÉcole ──────────────────────────────────────────────────────────────

export interface AutoEcole {
  id: string
  nom: string
  siret: string
  adresse: string
  code_postal: string
  ville: string
  telephone: string
  email: string
  logo_url: string | null
  couleur_principale: string
  created_at: string
  updated_at: string
}

// ─── Profile ────────────────────────────────────────────────────────────────

export interface Profile {
  id: string
  auto_ecole_id: string
  role: RoleUtilisateur
  prenom: string
  nom: string
  email: string
  telephone: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

// ─── Élève ──────────────────────────────────────────────────────────────────

export interface Eleve {
  id: string
  auto_ecole_id: string
  profile_id: string | null
  prenom: string
  nom: string
  email: string
  telephone: string
  date_naissance: string
  adresse: string | null
  code_postal: string | null
  ville: string | null
  neph: string | null
  permis_vise: TypePermis
  statut: StatutEleve
  solde_heures: number
  heures_effectuees: number
  financement: TypeFinancement
  date_inscription: string
  date_code: string | null
  date_permis: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

// ─── Moniteur ───────────────────────────────────────────────────────────────

export interface Moniteur {
  id: string
  auto_ecole_id: string
  profile_id: string
  prenom: string
  nom: string
  email: string
  telephone: string
  numero_enseignant: string | null
  couleur_agenda: string
  actif: boolean
  created_at: string
  updated_at: string
}

// ─── Véhicule ───────────────────────────────────────────────────────────────

export interface Vehicule {
  id: string
  auto_ecole_id: string
  immatriculation: string
  marque: string
  modele: string
  categorie: CategorieVehicule
  type_boite: TypeBoite
  annee: number
  kilometrage: number
  actif: boolean
  created_at: string
  updated_at: string
}

// ─── Leçon ──────────────────────────────────────────────────────────────────

export interface Lecon {
  id: string
  auto_ecole_id: string
  eleve_id: string
  moniteur_id: string
  vehicule_id: string | null
  date_debut: string
  date_fin: string
  type: TypeLecon
  statut: StatutLecon
  lieu_rdv: string | null
  notes: string | null
  created_at: string
  updated_at: string
  // Relations
  eleve?: Pick<Eleve, 'id' | 'prenom' | 'nom' | 'permis_vise'>
  moniteur?: Pick<Moniteur, 'id' | 'prenom' | 'nom' | 'couleur_agenda'>
  vehicule?: Pick<Vehicule, 'id' | 'marque' | 'modele' | 'type_boite' | 'categorie'>
}

// ─── Évaluation ─────────────────────────────────────────────────────────────

export type CompetencesEvaluation = {
  maitrise_vehicule: number        // 1-5
  comportement_circulation: number // 1-5
  respect_regles: number           // 1-5
  communication: number            // 1-5
  independance: number             // 1-5
}

export interface Evaluation {
  id: string
  lecon_id: string
  eleve_id: string
  moniteur_id: string
  competences: CompetencesEvaluation
  note_globale: number
  commentaire: string | null
  created_at: string
}

// ─── Facture ────────────────────────────────────────────────────────────────

export interface LigneFacture {
  description: string
  quantite: number
  prix_unitaire_ht: number
  tva: number
}

export interface Facture {
  id: string
  auto_ecole_id: string
  eleve_id: string
  numero: string
  date_emission: string
  date_echeance: string
  lignes: LigneFacture[]
  montant_ht: number
  montant_tva: number
  montant_ttc: number
  statut_paiement: StatutFacture
  notes: string | null
  created_at: string
  updated_at: string
  // Relations
  eleve?: Pick<Eleve, 'id' | 'prenom' | 'nom'>
}

// ─── Examen ─────────────────────────────────────────────────────────────────

export interface Examen {
  id: string
  eleve_id: string
  auto_ecole_id: string
  type: TypeExamen
  date_examen: string
  lieu: string | null
  resultat: ResultatExamen | null
  score: number | null
  notes: string | null
  created_at: string
  updated_at: string
  // Relations
  eleve?: Pick<Eleve, 'id' | 'prenom' | 'nom'>
}

// ─── Forms ──────────────────────────────────────────────────────────────────

export type CreateEleveInput = Omit<
  Eleve,
  'id' | 'auto_ecole_id' | 'created_at' | 'updated_at' | 'heures_effectuees'
>

export type UpdateEleveInput = Partial<CreateEleveInput>

export type CreateLeconInput = Omit<Lecon, 'id' | 'auto_ecole_id' | 'created_at' | 'updated_at' | 'eleve' | 'moniteur'>

export type UpdateLeconInput = Partial<CreateLeconInput>

export type CreateMoniteurInput = Omit<Moniteur, 'id' | 'auto_ecole_id' | 'created_at' | 'updated_at'>

export type UpdateMoniteurInput = Partial<CreateMoniteurInput>
