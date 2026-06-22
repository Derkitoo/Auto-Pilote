/**
 * Couche d'accès aux données (local mock).
 * Quand on branche Supabase, seul ce fichier change — les hooks React Query
 * et les composants restent identiques.
 */

import type {
  AutoEcole,
  Eleve,
  Moniteur,
  Vehicule,
  Lecon,
  Evaluation,
  Facture,
  Examen,
  CreateEleveInput,
  UpdateEleveInput,
  CreateLeconInput,
  UpdateLeconInput,
  CreateMoniteurInput,
  UpdateMoniteurInput,
} from '@/types'

import {
  mockAutoEcole,
  mockEleves,
  mockMoniteurs,
  mockVehicules,
  mockLecons,
  mockEvaluations,
  mockFactures,
  mockExamens,
} from './mock'

// État mutable en mémoire (simule la base de données)
let _autoEcole: AutoEcole = { ...mockAutoEcole }
let _eleves: Eleve[] = [...mockEleves]
let _moniteurs: Moniteur[] = [...mockMoniteurs]
let _vehicules: Vehicule[] = [...mockVehicules]
let _lecons: Lecon[] = [...mockLecons]
let _evaluations: Evaluation[] = [...mockEvaluations]
let _factures: Facture[] = [...mockFactures]
let _examens: Examen[] = [...mockExamens]

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms))
const uid = () => crypto.randomUUID()
const now = () => new Date().toISOString()

// ─── Auto-école ──────────────────────────────────────────────────────────────

export async function fetchAutoEcole(): Promise<AutoEcole> {
  await delay()
  return { ..._autoEcole }
}

export async function updateAutoEcole(data: Partial<AutoEcole>): Promise<AutoEcole> {
  await delay()
  _autoEcole = { ..._autoEcole, ...data, updated_at: now() }
  return { ..._autoEcole }
}

// ─── Élèves ───────────────────────────────────────────────────────────────────

export async function fetchEleves(): Promise<Eleve[]> {
  await delay()
  return [..._eleves]
}

export async function fetchEleve(id: string): Promise<Eleve> {
  await delay()
  const eleve = _eleves.find(e => e.id === id)
  if (!eleve) throw new Error(`Élève ${id} introuvable`)
  return { ...eleve }
}

export async function createEleve(data: CreateEleveInput): Promise<Eleve> {
  await delay()
  const nouvelEleve: Eleve = {
    ...data,
    id: uid(),
    auto_ecole_id: 'ae-001',
    heures_effectuees: 0,
    created_at: now(),
    updated_at: now(),
  }
  _eleves = [..._eleves, nouvelEleve]
  return { ...nouvelEleve }
}

export async function updateEleve(id: string, data: UpdateEleveInput): Promise<Eleve> {
  await delay()
  _eleves = _eleves.map(e =>
    e.id === id ? { ...e, ...data, updated_at: now() } : e
  )
  return fetchEleve(id)
}

export async function deleteEleve(id: string): Promise<void> {
  await delay()
  _eleves = _eleves.filter(e => e.id !== id)
}

// ─── Moniteurs ───────────────────────────────────────────────────────────────

export async function fetchMoniteurs(): Promise<Moniteur[]> {
  await delay()
  return [..._moniteurs]
}

export async function fetchMoniteur(id: string): Promise<Moniteur> {
  await delay()
  const moniteur = _moniteurs.find(m => m.id === id)
  if (!moniteur) throw new Error(`Moniteur ${id} introuvable`)
  return { ...moniteur }
}

export async function createMoniteur(data: CreateMoniteurInput): Promise<Moniteur> {
  await delay()
  const nouveau: Moniteur = {
    ...data,
    id: uid(),
    auto_ecole_id: 'ae-001',
    created_at: now(),
    updated_at: now(),
  }
  _moniteurs = [..._moniteurs, nouveau]
  return { ...nouveau }
}

export async function updateMoniteur(id: string, data: UpdateMoniteurInput): Promise<Moniteur> {
  await delay()
  _moniteurs = _moniteurs.map(m =>
    m.id === id ? { ...m, ...data, updated_at: now() } : m
  )
  return fetchMoniteur(id)
}

export async function deleteMoniteur(id: string): Promise<void> {
  await delay()
  _moniteurs = _moniteurs.filter(m => m.id !== id)
}

// ─── Véhicules ───────────────────────────────────────────────────────────────

export async function fetchVehicules(): Promise<Vehicule[]> {
  await delay()
  return [..._vehicules]
}

// ─── Leçons ───────────────────────────────────────────────────────────────────

export async function fetchLecons(params?: { moniteur_id?: string; eleve_id?: string }): Promise<Lecon[]> {
  await delay()
  let result = [..._lecons]
  if (params?.moniteur_id) result = result.filter(l => l.moniteur_id === params.moniteur_id)
  if (params?.eleve_id) result = result.filter(l => l.eleve_id === params.eleve_id)
  return result
}

export async function fetchLecon(id: string): Promise<Lecon> {
  await delay()
  const lecon = _lecons.find(l => l.id === id)
  if (!lecon) throw new Error(`Leçon ${id} introuvable`)
  return { ...lecon }
}

export async function createLecon(data: CreateLeconInput): Promise<Lecon> {
  await delay()
  const eleve = _eleves.find(e => e.id === data.eleve_id)
  const moniteur = _moniteurs.find(m => m.id === data.moniteur_id)
  const nouvelle: Lecon = {
    ...data,
    id: uid(),
    auto_ecole_id: 'ae-001',
    created_at: now(),
    updated_at: now(),
    eleve: eleve ? { id: eleve.id, prenom: eleve.prenom, nom: eleve.nom } : undefined,
    moniteur: moniteur
      ? { id: moniteur.id, prenom: moniteur.prenom, nom: moniteur.nom, couleur_agenda: moniteur.couleur_agenda }
      : undefined,
  }
  _lecons = [..._lecons, nouvelle]
  return { ...nouvelle }
}

export async function updateLecon(id: string, data: UpdateLeconInput): Promise<Lecon> {
  await delay()
  _lecons = _lecons.map(l =>
    l.id === id ? { ...l, ...data, updated_at: now() } : l
  )
  return fetchLecon(id)
}

export async function deleteLecon(id: string): Promise<void> {
  await delay()
  _lecons = _lecons.filter(l => l.id !== id)
}

// ─── Évaluations ─────────────────────────────────────────────────────────────

export async function fetchEvaluations(eleve_id?: string): Promise<Evaluation[]> {
  await delay()
  return eleve_id
    ? _evaluations.filter(e => e.eleve_id === eleve_id)
    : [..._evaluations]
}

// ─── Factures ─────────────────────────────────────────────────────────────────

export async function fetchFactures(): Promise<Facture[]> {
  await delay()
  return [..._factures]
}

// ─── Examens ──────────────────────────────────────────────────────────────────

export async function fetchExamens(eleve_id?: string): Promise<Examen[]> {
  await delay()
  return eleve_id
    ? _examens.filter(e => e.eleve_id === eleve_id)
    : [..._examens]
}

// ─── Stats dashboard ──────────────────────────────────────────────────────────

export async function fetchStatsDashboard() {
  await delay()
  const today = new Date().toDateString()
  const leconsAujourdhui = _lecons.filter(l =>
    new Date(l.date_debut).toDateString() === today
  )
  const elevesActifs = _eleves.filter(e =>
    e.statut === 'en_formation' || e.statut === 'examen_conduite' || e.statut === 'examen_code'
  )
  const caTotal = _factures
    .filter(f => f.statut_paiement === 'payee')
    .reduce((sum, f) => sum + f.montant_ttc, 0)
  const facturesEnAttente = _factures.filter(f => f.statut_paiement === 'envoyee').length

  return {
    leconsAujourdhui: leconsAujourdhui.length,
    elevesActifs: elevesActifs.length,
    totalEleves: _eleves.length,
    caTotal,
    facturesEnAttente,
    prochaines_lecons: leconsAujourdhui,
  }
}
