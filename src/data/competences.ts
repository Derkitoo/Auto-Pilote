export interface CompetenceInfo {
  id: number
  groupe: 1 | 2 | 3 | 4
  label: string
}

export interface GroupeInfo {
  id: 1 | 2 | 3 | 4
  label: string
  emoji: string
  color: string
  bgColor: string
}

export const GROUPES: GroupeInfo[] = [
  { id: 1, label: 'Maîtriser le véhicule',              emoji: '🔧', color: '#7C3AED', bgColor: '#F5F3FF' },
  { id: 2, label: 'Appréhender la route',               emoji: '🛣️', color: '#2563EB', bgColor: '#EFF6FF' },
  { id: 3, label: 'Communiquer avec les autres usagers', emoji: '👥', color: '#0891B2', bgColor: '#ECFEFF' },
  { id: 4, label: 'Se comporter en usager responsable', emoji: '✅', color: '#16A34A', bgColor: '#F0FDF4' },
]

export const COMPETENCES: CompetenceInfo[] = [
  // ── Groupe 1 : Maîtriser le véhicule (8) ──────────────────────────────────
  { id: 1,  groupe: 1, label: "M'installer dans le véhicule et en partir en sécurité" },
  { id: 2,  groupe: 1, label: "Identifier et utiliser les organes de commande" },
  { id: 3,  groupe: 1, label: "Effectuer les vérifications intérieures et extérieures" },
  { id: 4,  groupe: 1, label: "Démarrer et m'arrêter" },
  { id: 5,  groupe: 1, label: "Choisir l'allure adaptée à la situation" },
  { id: 6,  groupe: 1, label: "Maîtriser les trajectoires en courbe" },
  { id: 7,  groupe: 1, label: "Effectuer une marche arrière et faire demi-tour" },
  { id: 8,  groupe: 1, label: "Effectuer des manœuvres (créneau, épi, bataille, garage)" },

  // ── Groupe 2 : Appréhender la route (9) ──────────────────────────────────
  { id: 9,  groupe: 2, label: "M'engager dans une circulation simple" },
  { id: 10, groupe: 2, label: "Gérer les intersections ordinaires" },
  { id: 11, groupe: 2, label: "Gérer les intersections réglementées (feux, stops, priorités)" },
  { id: 12, groupe: 2, label: "Tourner à droite et à gauche en agglomération" },
  { id: 13, groupe: 2, label: "Circuler hors agglomération" },
  { id: 14, groupe: 2, label: "Conduire sur voie express / routes à chaussées séparées" },
  { id: 15, groupe: 2, label: "Conduire sur autoroute" },
  { id: 16, groupe: 2, label: "Conduire de nuit" },
  { id: 17, groupe: 2, label: "Conduire par mauvais temps ou en conditions difficiles" },

  // ── Groupe 3 : Communiquer avec les autres usagers (9) ────────────────────
  { id: 18, groupe: 3, label: "Croiser, dépasser et être dépassé" },
  { id: 19, groupe: 3, label: "Changer de file ou de voie de circulation" },
  { id: 20, groupe: 3, label: "Respecter les distances de sécurité" },
  { id: 21, groupe: 3, label: "Partager la route avec les piétons" },
  { id: 22, groupe: 3, label: "Partager la route avec les cyclistes et usagers de 2RM" },
  { id: 23, groupe: 3, label: "Partager la route avec les poids lourds et transports en commun" },
  { id: 24, groupe: 3, label: "Franchir un passage à niveau" },
  { id: 25, groupe: 3, label: "S'insérer, circuler et sortir d'un giratoire" },
  { id: 26, groupe: 3, label: "Utiliser les signaux lumineux et sonores" },

  // ── Groupe 4 : Se comporter en usager responsable (8) ────────────────────
  { id: 27, groupe: 4, label: "Connaître les effets de l'alcool et des drogues sur la conduite" },
  { id: 28, groupe: 4, label: "Connaître les effets de la fatigue et des distracteurs" },
  { id: 29, groupe: 4, label: "Connaître et respecter les règles liées à la vitesse" },
  { id: 30, groupe: 4, label: "Connaître ses responsabilités civile, pénale et financière" },
  { id: 31, groupe: 4, label: "Connaître les systèmes d'aide à la conduite (ABS, ESP…)" },
  { id: 32, groupe: 4, label: "Assurer l'entretien courant du véhicule" },
  { id: 33, groupe: 4, label: "Porter les premiers secours et alerter les secours" },
  { id: 34, groupe: 4, label: "Adopter une conduite économique et respectueuse de l'environnement" },
]

export const NIVEAU_LABELS: Record<number, { label: string; color: string; bg: string }> = {
  0: { label: 'Non abordée', color: '#94A3B8', bg: '#F1F5F9' },
  1: { label: 'Non abordée', color: '#94A3B8', bg: '#F1F5F9' },
  2: { label: 'Découverte',  color: '#EA580C', bg: '#FFF7ED' },
  3: { label: 'En cours',    color: '#D97706', bg: '#FFFBEB' },
  4: { label: 'Acquise',     color: '#0891B2', bg: '#ECFEFF' },
  5: { label: 'Maîtrisée',   color: '#16A34A', bg: '#F0FDF4' },
}
