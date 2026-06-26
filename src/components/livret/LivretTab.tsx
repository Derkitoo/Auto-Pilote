import { useState } from 'react'
import { ChevronDown, ChevronRight, BookOpen, Pencil, X, Check } from 'lucide-react'
import { useLivret, useUpsertLivretEntry } from '@/hooks/useLivret'
import { useAuth } from '@/contexts/AuthContext'
import { COMPETENCES, GROUPES, NIVEAU_LABELS } from '@/data/competences'
import type { NiveauCompetence, EntreeLivret } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'

interface Props {
  eleve_id: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const NIVEAUX: NiveauCompetence[] = [1, 2, 3, 4, 5]

function pct(done: number, total: number) {
  if (total === 0) return 0
  return Math.round((done / total) * 100)
}

// ─── Composant principal ──────────────────────────────────────────────────────

export function LivretTab({ eleve_id }: Props) {
  const { user } = useAuth()
  const canEdit = user?.role === 'gerant' || user?.role === 'moniteur'
  const moniteur_id = user?.moniteur_id ?? user?.id ?? ''

  const { data: livret, isLoading } = useLivret(eleve_id)
  const upsert = useUpsertLivretEntry()

  const [openGroupes, setOpenGroupes] = useState<Set<number>>(new Set([1, 2, 3, 4]))
  const [editingId, setEditingId] = useState<number | null>(null)
  const [commentaire, setCommentaire] = useState('')

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    )
  }

  const entries = livret?.entries ?? []
  const entryMap = new Map(entries.map(e => [e.competence_id, e]))

  // Stats globales
  const totalComp = COMPETENCES.length // 34
  const abordees = entries.length
  const acquises = entries.filter(e => e.niveau >= 4).length
  const globalPct = pct(acquises, totalComp)

  const toggleGroupe = (id: number) => {
    setOpenGroupes(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const handleNiveau = (competence_id: number, niveau: NiveauCompetence, current?: EntreeLivret) => {
    if (!canEdit) return
    upsert.mutate({
      eleve_id,
      competence_id,
      niveau,
      commentaire: current?.commentaire ?? null,
      moniteur_id,
    })
  }

  const startEdit = (competence_id: number, current?: EntreeLivret) => {
    setEditingId(competence_id)
    setCommentaire(current?.commentaire ?? '')
  }

  const saveComment = (competence_id: number, current?: EntreeLivret) => {
    if (!canEdit) return
    upsert.mutate({
      eleve_id,
      competence_id,
      niveau: current?.niveau ?? 1,
      commentaire: commentaire.trim() || null,
      moniteur_id,
    })
    setEditingId(null)
  }

  return (
    <div className="space-y-4">
      {/* ── En-tête global ── */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-[#E2E8F0] dark:border-slate-700 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-[#EFF6FF] dark:bg-slate-700 rounded-xl flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-sm font-semibold text-[#0F172A] dark:text-slate-100">Progression globale</p>
              <span className="text-sm font-bold text-primary">{globalPct}%</span>
            </div>
            <p className="text-xs text-[#64748B] dark:text-slate-400">
              {acquises} acquises · {abordees} abordées · {totalComp - abordees} non vues
            </p>
          </div>
        </div>

        {/* Barre globale */}
        <div className="h-2.5 bg-[#F1F5F9] dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${globalPct}%` }}
          />
        </div>

        {/* Mini stats par groupe */}
        <div className="grid grid-cols-4 gap-2 mt-3">
          {GROUPES.map(g => {
            const comps = COMPETENCES.filter(c => c.groupe === g.id)
            const acq = comps.filter(c => (entryMap.get(c.id)?.niveau ?? 0) >= 4).length
            return (
              <div key={g.id} className="text-center">
                <div className="text-base">{g.emoji}</div>
                <div className="text-xs font-semibold mt-0.5" style={{ color: g.color }}>
                  {acq}/{comps.length}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Groupes accordéon ── */}
      {GROUPES.map(groupe => {
        const comps = COMPETENCES.filter(c => c.groupe === groupe.id)
        const acq = comps.filter(c => (entryMap.get(c.id)?.niveau ?? 0) >= 4).length
        const abrd = comps.filter(c => entryMap.has(c.id)).length
        const isOpen = openGroupes.has(groupe.id)
        const groupePct = pct(acq, comps.length)

        return (
          <div key={groupe.id} className="bg-white dark:bg-slate-800 rounded-xl border border-[#E2E8F0] dark:border-slate-700 overflow-hidden">
            {/* Header groupe */}
            <button
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[#F8FAFC] dark:hover:bg-slate-700/50 transition-colors text-left"
              onClick={() => toggleGroupe(groupe.id)}
            >
              <span className="text-lg">{groupe.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[#0F172A] dark:text-slate-100 truncate">{groupe.label}</p>
                  <span className="text-xs font-medium shrink-0" style={{ color: groupe.color }}>
                    {acq}/{comps.length}
                  </span>
                </div>
                {/* Mini barre de groupe */}
                <div className="mt-1.5 h-1.5 bg-[#F1F5F9] dark:bg-slate-600 rounded-full overflow-hidden w-full">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${groupePct}%`, backgroundColor: groupe.color }}
                  />
                </div>
                <p className="text-[10px] text-[#94A3B8] dark:text-slate-500 mt-0.5">
                  {abrd} abordées · {comps.length - abrd} non vues
                </p>
              </div>
              {isOpen
                ? <ChevronDown className="w-4 h-4 text-[#94A3B8] shrink-0" />
                : <ChevronRight className="w-4 h-4 text-[#94A3B8] shrink-0" />
              }
            </button>

            {/* Compétences */}
            {isOpen && (
              <div className="divide-y divide-[#F1F5F9] dark:divide-slate-700 border-t border-[#F1F5F9] dark:border-slate-700">
                {comps.map(comp => {
                  const entry = entryMap.get(comp.id)
                  const niveau = entry?.niveau ?? 0
                  const nInfo = NIVEAU_LABELS[niveau]
                  const isEditingThis = editingId === comp.id

                  return (
                    <div key={comp.id} className="px-4 py-3">
                      <div className="flex items-start gap-3">
                        {/* Numéro */}
                        <span className="text-[10px] font-bold text-[#CBD5E1] dark:text-slate-600 w-5 text-right shrink-0 mt-1">
                          {comp.id}
                        </span>

                        {/* Contenu */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#0F172A] dark:text-slate-100 leading-snug mb-2">
                            {comp.label}
                          </p>

                          {/* Sélecteur niveau 1-5 */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {NIVEAUX.map(n => {
                              const info = NIVEAU_LABELS[n]
                              const isActive = niveau >= n
                              const isSelected = niveau === n
                              return (
                                <button
                                  key={n}
                                  disabled={!canEdit}
                                  onClick={() => handleNiveau(comp.id, n, entry)}
                                  title={info.label}
                                  className={`
                                    w-7 h-7 rounded-lg text-xs font-bold transition-all
                                    ${canEdit ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
                                    ${isActive
                                      ? isSelected ? 'ring-2 ring-offset-1' : ''
                                      : ''
                                    }
                                  `}
                                  style={{
                                    backgroundColor: isActive ? info.bg : '#F1F5F9',
                                    color: isActive ? info.color : '#CBD5E1',
                                    borderColor: isSelected ? info.color : 'transparent',
                                    border: `2px solid ${isSelected ? info.color : 'transparent'}`,
                                  }}
                                >
                                  {n}
                                </button>
                              )
                            })}

                            {/* Badge niveau */}
                            {niveau > 0 && (
                              <span
                                className="text-[10px] font-semibold px-2 py-0.5 rounded-full ml-1"
                                style={{ backgroundColor: nInfo.bg, color: nInfo.color }}
                              >
                                {nInfo.label}
                              </span>
                            )}

                            {/* Bouton commentaire */}
                            {canEdit && (
                              <button
                                onClick={() => startEdit(comp.id, entry)}
                                className="ml-auto p-1 rounded text-[#CBD5E1] dark:text-slate-600 hover:text-[#64748B] dark:hover:text-slate-400 transition-colors"
                                title="Ajouter un commentaire"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          {/* Commentaire affiché */}
                          {entry?.commentaire && !isEditingThis && (
                            <p className="mt-1.5 text-xs text-[#64748B] dark:text-slate-400 italic bg-[#F8FAFC] dark:bg-slate-700/50 rounded-lg px-2 py-1">
                              "{entry.commentaire}"
                            </p>
                          )}

                          {/* Inline edit commentaire */}
                          {isEditingThis && (
                            <div className="mt-2 flex gap-1.5">
                              <input
                                autoFocus
                                value={commentaire}
                                onChange={e => setCommentaire(e.target.value)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') saveComment(comp.id, entry)
                                  if (e.key === 'Escape') setEditingId(null)
                                }}
                                placeholder="Commentaire moniteur…"
                                className="flex-1 text-xs px-2 py-1.5 border border-[#E2E8F0] dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-[#0F172A] dark:text-slate-100 outline-none focus:border-primary"
                              />
                              <button
                                onClick={() => saveComment(comp.id, entry)}
                                className="p-1.5 rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="p-1.5 rounded-lg border border-[#E2E8F0] dark:border-slate-600 text-[#64748B] dark:text-slate-400 hover:bg-[#F8FAFC] dark:hover:bg-slate-700 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      {/* Légende niveaux */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-[#E2E8F0] dark:border-slate-700 p-4">
        <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide mb-3">Légende des niveaux</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {NIVEAUX.map(n => {
            const info = NIVEAU_LABELS[n]
            return (
              <div
                key={n}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium"
                style={{ backgroundColor: info.bg, color: info.color }}
              >
                <span className="font-bold text-sm w-4 text-center">{n}</span>
                {info.label}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
