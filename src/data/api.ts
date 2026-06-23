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

export async function fetchVehicule(id: string): Promise<Vehicule> {
  await delay()
  const v = _vehicules.find(v => v.id === id)
  if (!v) throw new Error(`Véhicule ${id} introuvable`)
  return { ...v }
}

export async function createVehicule(data: Omit<Vehicule, 'id' | 'auto_ecole_id' | 'created_at' | 'updated_at'>): Promise<Vehicule> {
  await delay()
  const nouveau: Vehicule = { ...data, id: uid(), auto_ecole_id: 'ae-001', created_at: now(), updated_at: now() }
  _vehicules = [..._vehicules, nouveau]
  return { ...nouveau }
}

export async function updateVehicule(id: string, data: Partial<Vehicule>): Promise<Vehicule> {
  await delay()
  _vehicules = _vehicules.map(v => v.id === id ? { ...v, ...data, updated_at: now() } : v)
  return fetchVehicule(id)
}

export async function deleteVehicule(id: string): Promise<void> {
  await delay()
  _vehicules = _vehicules.filter(v => v.id !== id)
}

// ─── Leçons ───────────────────────────────────────────────────────────────────

function enrichirLecon(l: Lecon): Lecon {
  const eleve = _eleves.find(e => e.id === l.eleve_id)
  const moniteur = _moniteurs.find(m => m.id === l.moniteur_id)
  const vehicule = l.vehicule_id ? _vehicules.find(v => v.id === l.vehicule_id) : undefined
  return {
    ...l,
    eleve: eleve ? { id: eleve.id, prenom: eleve.prenom, nom: eleve.nom, permis_vise: eleve.permis_vise } : l.eleve,
    moniteur: moniteur ? { id: moniteur.id, prenom: moniteur.prenom, nom: moniteur.nom, couleur_agenda: moniteur.couleur_agenda } : l.moniteur,
    vehicule: vehicule ? { id: vehicule.id, marque: vehicule.marque, modele: vehicule.modele, type_boite: vehicule.type_boite, categorie: vehicule.categorie } : l.vehicule,
  }
}

export async function fetchLecons(params?: { moniteur_id?: string; eleve_id?: string }): Promise<Lecon[]> {
  await delay()
  let result = [..._lecons]
  if (params?.moniteur_id) result = result.filter(l => l.moniteur_id === params.moniteur_id)
  if (params?.eleve_id) result = result.filter(l => l.eleve_id === params.eleve_id)
  return result.map(enrichirLecon)
}

export async function fetchLecon(id: string): Promise<Lecon> {
  await delay()
  const lecon = _lecons.find(l => l.id === id)
  if (!lecon) throw new Error(`Leçon ${id} introuvable`)
  return enrichirLecon(lecon)
}

export async function createLecon(data: CreateLeconInput): Promise<Lecon> {
  await delay()
  const nouvelle: Lecon = { ...data, id: uid(), auto_ecole_id: 'ae-001', created_at: now(), updated_at: now() }
  _lecons = [..._lecons, nouvelle]
  return enrichirLecon(nouvelle)
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

export async function createEvaluation(data: Omit<Evaluation, 'id' | 'created_at'>): Promise<Evaluation> {
  await delay()
  const nouvelle: Evaluation = { ...data, id: uid(), created_at: now() }
  _evaluations = [..._evaluations, nouvelle]
  return { ...nouvelle }
}

export async function updateEvaluation(id: string, data: Partial<Omit<Evaluation, 'id' | 'created_at'>>): Promise<Evaluation> {
  await delay()
  _evaluations = _evaluations.map(e => e.id === id ? { ...e, ...data } : e)
  const updated = _evaluations.find(e => e.id === id)
  if (!updated) throw new Error(`Évaluation ${id} introuvable`)
  return { ...updated }
}

export async function deleteEvaluation(id: string): Promise<void> {
  await delay()
  _evaluations = _evaluations.filter(e => e.id !== id)
}

// ─── Factures ─────────────────────────────────────────────────────────────────

function enrichirFacture(f: Facture): Facture {
  const eleve = _eleves.find(e => e.id === f.eleve_id)
  return { ...f, eleve: eleve ? { id: eleve.id, prenom: eleve.prenom, nom: eleve.nom } : f.eleve }
}

export async function fetchFactures(eleve_id?: string): Promise<Facture[]> {
  await delay()
  const result = eleve_id ? _factures.filter(f => f.eleve_id === eleve_id) : [..._factures]
  return result.map(enrichirFacture).sort((a, b) => b.created_at.localeCompare(a.created_at))
}

export async function fetchFacture(id: string): Promise<Facture> {
  await delay()
  const f = _factures.find(f => f.id === id)
  if (!f) throw new Error(`Facture ${id} introuvable`)
  return enrichirFacture(f)
}

export async function createFacture(data: Omit<Facture, 'id' | 'auto_ecole_id' | 'created_at' | 'updated_at' | 'eleve'>): Promise<Facture> {
  await delay()
  const nouvelle: Facture = { ...data, id: uid(), auto_ecole_id: 'ae-001', created_at: now(), updated_at: now() }
  _factures = [..._factures, nouvelle]
  return enrichirFacture(nouvelle)
}

export async function updateFacture(id: string, data: Partial<Omit<Facture, 'id' | 'auto_ecole_id' | 'created_at' | 'eleve'>>): Promise<Facture> {
  await delay()
  _factures = _factures.map(f => f.id === id ? { ...f, ...data, updated_at: now() } : f)
  return fetchFacture(id)
}

export async function deleteFacture(id: string): Promise<void> {
  await delay()
  _factures = _factures.filter(f => f.id !== id)
}

// ─── Examens ──────────────────────────────────────────────────────────────────

function enrichirExamen(e: Examen): Examen {
  const eleve = _eleves.find(el => el.id === e.eleve_id)
  return { ...e, eleve: eleve ? { id: eleve.id, prenom: eleve.prenom, nom: eleve.nom } : e.eleve }
}

export async function fetchExamens(eleve_id?: string): Promise<Examen[]> {
  await delay()
  const result = eleve_id ? _examens.filter(e => e.eleve_id === eleve_id) : [..._examens]
  return result.map(enrichirExamen).sort((a, b) => b.date_examen.localeCompare(a.date_examen))
}

export async function createExamen(data: Omit<Examen, 'id' | 'auto_ecole_id' | 'created_at' | 'updated_at' | 'eleve'>): Promise<Examen> {
  await delay()
  const nouveau: Examen = { ...data, id: uid(), auto_ecole_id: 'ae-001', created_at: now(), updated_at: now() }
  _examens = [..._examens, nouveau]
  return enrichirExamen(nouveau)
}

export async function updateExamen(id: string, data: Partial<Omit<Examen, 'id' | 'auto_ecole_id' | 'created_at' | 'eleve'>>): Promise<Examen> {
  await delay()
  _examens = _examens.map(e => e.id === id ? { ...e, ...data, updated_at: now() } : e)
  const updated = _examens.find(e => e.id === id)!
  return enrichirExamen(updated)
}

export async function deleteExamen(id: string): Promise<void> {
  await delay()
  _examens = _examens.filter(e => e.id !== id)
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
