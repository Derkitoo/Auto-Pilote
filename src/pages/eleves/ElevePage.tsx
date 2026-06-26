import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Pencil, Trash2, Phone, Mail, MapPin, Calendar,
  Clock, CalendarDays, Award, CheckCircle, XCircle, AlertTriangle,
  Euro, Plus, Star,
} from 'lucide-react'
import { useEleve, useUpdateEleve, useDeleteEleve } from '@/hooks/useEleves'
import { useLecons } from '@/hooks/useLecons'
import { useExamens } from '@/hooks/useExamens'
import { useFactures } from '@/hooks/useFactures'
import { useEvaluations, useCreateEvaluation, useUpdateEvaluation, useDeleteEvaluation } from '@/hooks/useEvaluations'
import { useAuth } from '@/contexts/AuthContext'
import { StatutBadge } from '@/components/eleves/StatutBadge'
import { EleveForm } from '@/components/eleves/EleveForm'
import { EvaluationForm } from '@/components/evaluations/EvaluationForm'
import { LivretTab } from '@/components/livret/LivretTab'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate, formatMontant } from '@/lib/utils'
import type { StatutLecon, ResultatExamen, StatutFacture, Evaluation } from '@/types'

type Onglet = 'infos' | 'lecons' | 'examens' | 'factures' | 'evaluations' | 'livret'

const ONGLETS: { value: Onglet; label: string }[] = [
  { value: 'infos',       label: 'Informations' },
  { value: 'lecons',      label: 'Leçons' },
  { value: 'examens',     label: 'Examens' },
  { value: 'factures',    label: 'Factures' },
  { value: 'evaluations', label: 'Évaluations' },
  { value: 'livret',      label: '📋 Livret' },
]

export function ElevePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isGerant = user?.role === 'gerant'

  const { data: eleve, isLoading } = useEleve(id!)
  const { data: lecons, isLoading: leconsLoading } = useLecons({ eleve_id: id })
  const { data: examens } = useExamens(id)
  const { data: factures } = useFactures(id)
  const { data: evaluations } = useEvaluations(id)

  const updateEleve = useUpdateEleve()
  const deleteEleve = useDeleteEleve()
  const createEvaluation = useCreateEvaluation()
  const updateEvaluation = useUpdateEvaluation()
  const deleteEvaluation = useDeleteEvaluation()

  const [onglet, setOnglet] = useState<Onglet>('infos')
  const [showEdit, setShowEdit] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showEvalForm, setShowEvalForm] = useState(false)
  const [selectedEval, setSelectedEval] = useState<Evaluation | null>(null)
  const [showEditEval, setShowEditEval] = useState(false)
  const [showDeleteEval, setShowDeleteEval] = useState(false)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    )
  }

  if (!eleve) {
    return (
      <div className="text-center py-16">
        <p className="text-[#64748B]">Élève introuvable.</p>
        <Button variant="ghost" onClick={() => navigate('/eleves')} className="mt-4">
          Retour à la liste
        </Button>
      </div>
    )
  }

  const handleDelete = async () => {
    await deleteEleve.mutateAsync(eleve.id)
    navigate('/eleves')
  }

  const totalHeures = eleve.heures_effectuees + eleve.solde_heures
  const progression = totalHeures > 0 ? Math.round((eleve.heures_effectuees / totalHeures) * 100) : 0
  const leconsEffectuees = lecons?.filter(l => l.statut === 'effectuee') ?? []
  const leconsAnnulees = lecons?.filter(l => ['annulee_eleve', 'annulee_moniteur', 'no_show'].includes(l.statut)) ?? []
  const soldeAlerte = eleve.solde_heures === 0 ? 'epuise' : eleve.solde_heures <= 2 ? 'faible' : null

  return (
    <div className="space-y-5 max-w-4xl">

      {/* Back + actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/eleves')}
          className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#0F172A] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux élèves
        </button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowEdit(true)}>
            <Pencil className="w-3.5 h-3.5" />
            Modifier
          </Button>
          {isGerant && (
            <Button variant="destructive" size="sm" onClick={() => setShowDeleteConfirm(true)}>
              <Trash2 className="w-3.5 h-3.5" />
              Supprimer
            </Button>
          )}
        </div>
      </div>

      {/* Alerte solde */}
      {soldeAlerte === 'epuise' && (
        <div className="flex items-center gap-2.5 p-3.5 bg-[#FEE2E2] border border-[#FCA5A5] rounded-xl text-sm text-[#DC2626] font-medium">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Solde épuisé — impossible de planifier de nouvelles leçons sans renouvellement</span>
        </div>
      )}
      {soldeAlerte === 'faible' && (
        <div className="flex items-center gap-2.5 p-3.5 bg-[#FEF3C7] border border-[#FCD34D] rounded-xl text-sm text-[#D97706] font-medium">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Solde faible — {eleve.solde_heures}h restante{eleve.solde_heures > 1 ? 's' : ''}, renouvellement conseillé</span>
        </div>
      )}

      {/* Header card */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
        <div className="flex items-start gap-4">
          <Avatar prenom={eleve.prenom} nom={eleve.nom} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-semibold text-[#0F172A]">{eleve.prenom} {eleve.nom}</h2>
              <StatutBadge statut={eleve.statut} />
              <span className="text-xs bg-[#F8FAFC] border border-[#E2E8F0] px-2 py-0.5 rounded-full text-[#64748B]">
                Permis {eleve.permis_vise}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1.5">
              <InfoLine icon={<Mail className="w-3.5 h-3.5" />} text={eleve.email} />
              <InfoLine icon={<Phone className="w-3.5 h-3.5" />} text={eleve.telephone} />
              <InfoLine icon={<Calendar className="w-3.5 h-3.5" />} text={`Né(e) le ${formatDate(eleve.date_naissance)}`} />
              {eleve.ville && (
                <InfoLine icon={<MapPin className="w-3.5 h-3.5" />} text={`${eleve.code_postal} ${eleve.ville}`} />
              )}
            </div>
            {/* Mini stats */}
            <div className="mt-3 flex gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-20 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                  <div className="h-full bg-[#2563EB] rounded-full" style={{ width: `${progression}%` }} />
                </div>
                <span className="text-xs text-[#64748B]">{eleve.heures_effectuees}h / {totalHeures}h</span>
              </div>
              <span className="text-xs text-[#64748B]">Solde : <strong className="text-[#0F172A]">{eleve.solde_heures}h</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 bg-[#F8FAFC] p-1 rounded-xl border border-[#E2E8F0] overflow-x-auto">
        {ONGLETS.map(o => (
          <button
            key={o.value}
            onClick={() => setOnglet(o.value)}
            className={`shrink-0 px-4 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              onglet === o.value
                ? 'bg-white text-[#0F172A] shadow-sm'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {/* ── Tab : Informations ───────────────────────────────────────────────── */}
      {onglet === 'infos' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
              <p className="text-xs text-[#64748B] mb-1">Heures effectuées</p>
              <p className="text-2xl font-semibold text-[#0F172A]">{eleve.heures_effectuees}h</p>
              <div className="mt-2 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                <div className="h-full bg-[#2563EB] rounded-full" style={{ width: `${progression}%` }} />
              </div>
              <p className="text-xs text-[#64748B] mt-1">{progression}% du forfait ({totalHeures}h)</p>
            </div>
            <div className={`rounded-xl border p-4 ${
              eleve.solde_heures === 0
                ? 'bg-[#FEF2F2] border-[#FCA5A5]'
                : eleve.solde_heures <= 2
                ? 'bg-[#FFFBEB] border-[#FCD34D]'
                : 'bg-white border-[#E2E8F0]'
            }`}>
              <p className="text-xs text-[#64748B] mb-1 flex items-center gap-1.5">
                Heures restantes
                {soldeAlerte && <AlertTriangle className={`w-3 h-3 ${soldeAlerte === 'epuise' ? 'text-[#DC2626]' : 'text-[#D97706]'}`} />}
              </p>
              <p className={`text-2xl font-semibold ${
                eleve.solde_heures === 0 ? 'text-[#DC2626]' : eleve.solde_heures <= 2 ? 'text-[#D97706]' : 'text-[#0F172A]'
              }`}>{eleve.solde_heures}h</p>
              <p className="text-xs text-[#64748B] mt-1">
                {eleve.solde_heures === 0 ? 'Solde épuisé' : eleve.solde_heures <= 2 ? 'Renouvellement conseillé' : 'Solde suffisant'}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
              <p className="text-xs text-[#64748B] mb-1">Financement</p>
              <p className="text-base font-medium text-[#0F172A] capitalize">{eleve.financement.replace(/_/g, ' ')}</p>
              <p className="text-xs text-[#64748B] mt-1">Inscrit le {formatDate(eleve.date_inscription)}</p>
            </div>
          </div>

          {(eleve.date_code || eleve.date_permis) && (
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
              <h3 className="text-sm font-semibold text-[#0F172A] mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Dates clés
              </h3>
              <div className="flex gap-8">
                {eleve.date_code && (
                  <div>
                    <p className="text-xs text-[#64748B]">Code obtenu le</p>
                    <p className="text-sm font-medium text-[#0F172A]">{formatDate(eleve.date_code)}</p>
                  </div>
                )}
                {eleve.date_permis && (
                  <div>
                    <p className="text-xs text-[#64748B]">Permis obtenu le</p>
                    <p className="text-sm font-medium text-[#16A34A]">{formatDate(eleve.date_permis)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {eleve.notes && (
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
              <h3 className="text-sm font-semibold text-[#0F172A] mb-2">Notes</h3>
              <p className="text-sm text-[#64748B] whitespace-pre-wrap">{eleve.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* ── Tab : Leçons ─────────────────────────────────────────────────────── */}
      {onglet === 'lecons' && (
        <div className="bg-white rounded-xl border border-[#E2E8F0]">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#E2E8F0] bg-[#F8FAFC] flex-wrap gap-y-2">
            <CalendarDays className="w-4 h-4 text-[#64748B]" />
            <h3 className="text-sm font-semibold text-[#0F172A]">Historique des leçons</h3>
            <div className="ml-auto flex items-center gap-3">
              <span className="text-xs text-[#94A3B8]">{leconsEffectuees.length} effectuée{leconsEffectuees.length > 1 ? 's' : ''}</span>
              {leconsAnnulees.length > 0 && (
                <span className="flex items-center gap-1 text-xs text-[#DC2626] bg-[#FEE2E2] px-2 py-0.5 rounded-full font-medium">
                  <AlertTriangle className="w-3 h-3" />
                  {leconsAnnulees.length} absence{leconsAnnulees.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
          {leconsLoading ? (
            <div className="p-4 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
            </div>
          ) : !lecons?.length ? (
            <div className="py-10 text-center text-sm text-[#64748B]">Aucune leçon enregistrée.</div>
          ) : (
            <div className="divide-y divide-[#E2E8F0]">
              {lecons.sort((a, b) => new Date(b.date_debut).getTime() - new Date(a.date_debut).getTime()).map(l => (
                <div key={l.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="w-1 h-8 rounded-full shrink-0" style={{ backgroundColor: l.moniteur?.couleur_agenda ?? '#E2E8F0' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#0F172A]">
                      {formatDate(l.date_debut, "dd/MM/yyyy 'à' HH:mm")}
                      <span className="text-[#94A3B8] font-normal"> → {formatDate(l.date_fin, 'HH:mm')}</span>
                    </p>
                    <p className="text-xs text-[#64748B]">{l.moniteur?.prenom} {l.moniteur?.nom} · {l.type.replace(/_/g, ' ')}</p>
                  </div>
                  <LeconStatutBadge statut={l.statut} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab : Examens ────────────────────────────────────────────────────── */}
      {onglet === 'examens' && (
        <div className="bg-white rounded-xl border border-[#E2E8F0]">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#E2E8F0] bg-[#F8FAFC]">
            <Award className="w-4 h-4 text-[#64748B]" />
            <h3 className="text-sm font-semibold text-[#0F172A]">Examens</h3>
            <span className="ml-auto text-xs text-[#94A3B8]">{examens?.length ?? 0} examen{(examens?.length ?? 0) > 1 ? 's' : ''}</span>
          </div>
          {!examens?.length ? (
            <div className="py-10 text-center text-sm text-[#64748B]">Aucun examen enregistré.</div>
          ) : (
            <div className="divide-y divide-[#E2E8F0]">
              {examens.map(e => (
                <div key={e.id} className="flex items-center gap-3 px-5 py-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${e.type === 'code' ? 'bg-[#EFF6FF]' : 'bg-[#F5F3FF]'}`}>
                    <Award className={`w-4 h-4 ${e.type === 'code' ? 'text-[#2563EB]' : 'text-[#7C3AED]'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#0F172A]">{e.type === 'code' ? 'Code de la route' : 'Conduite'}</p>
                    <p className="text-xs text-[#64748B]">{formatDate(e.date_examen)} {e.lieu ? `· ${e.lieu}` : ''}{e.score !== null ? ` · ${e.score}/40` : ''}</p>
                  </div>
                  <ExamenResultatBadge resultat={e.resultat} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab : Factures ───────────────────────────────────────────────────── */}
      {onglet === 'factures' && (
        <div className="space-y-3">
          {/* Mini stats */}
          {factures && factures.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
                <p className="text-xs text-[#64748B] mb-1">Total payé</p>
                <p className="text-xl font-semibold text-[#16A34A]">
                  {formatMontant(factures.filter(f => f.statut_paiement === 'payee').reduce((s, f) => s + f.montant_ttc, 0))}
                </p>
              </div>
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
                <p className="text-xs text-[#64748B] mb-1">Restant dû</p>
                <p className="text-xl font-semibold text-[#D97706]">
                  {formatMontant(factures.filter(f => f.statut_paiement !== 'payee' && f.statut_paiement !== 'annulee').reduce((s, f) => s + f.montant_ttc, 0))}
                </p>
              </div>
            </div>
          )}
          <div className="bg-white rounded-xl border border-[#E2E8F0]">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <Euro className="w-4 h-4 text-[#64748B]" />
              <h3 className="text-sm font-semibold text-[#0F172A]">Factures</h3>
              <span className="ml-auto text-xs text-[#94A3B8]">{factures?.length ?? 0} facture{(factures?.length ?? 0) > 1 ? 's' : ''}</span>
            </div>
            {!factures?.length ? (
              <div className="py-10 text-center text-sm text-[#64748B]">Aucune facture.</div>
            ) : (
              <div className="divide-y divide-[#E2E8F0]">
                {factures.map(f => (
                  <div key={f.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#0F172A]">{f.numero}</p>
                      <p className="text-xs text-[#64748B]">
                        Émise le {formatDate(f.date_emission)} · Échéance {formatDate(f.date_echeance)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-[#0F172A]">{formatMontant(f.montant_ttc)}</p>
                      <FactureStatutBadge statut={f.statut_paiement} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Tab : Évaluations ────────────────────────────────────────────────── */}
      {onglet === 'evaluations' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#64748B]">{evaluations?.length ?? 0} évaluation{(evaluations?.length ?? 0) > 1 ? 's' : ''}</p>
            <Button size="sm" onClick={() => setShowEvalForm(true)}>
              <Plus className="w-3.5 h-3.5" />
              Nouvelle évaluation
            </Button>
          </div>
          {!evaluations?.length ? (
            <div className="bg-white rounded-xl border border-[#E2E8F0] py-12 text-center">
              <Star className="w-8 h-8 text-[#E2E8F0] mx-auto mb-3" />
              <p className="text-sm text-[#64748B]">Aucune évaluation pour le moment.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {evaluations.map(ev => (
                <EvaluationCard
                  key={ev.id}
                  evaluation={ev}
                  onEdit={() => { setSelectedEval(ev); setShowEditEval(true) }}
                  onDelete={() => { setSelectedEval(ev); setShowDeleteEval(true) }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {onglet === 'livret' && (
        <LivretTab eleve_id={eleve.id} />
      )}

      {/* Modal édition */}
      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Modifier l'élève" size="lg">
        <EleveForm
          defaultValues={eleve}
          onSubmit={async (data) => {
            await updateEleve.mutateAsync({
              id: eleve.id,
              data: {
                ...data,
                profile_id: data.profile_id ?? null,
                adresse: data.adresse ?? null,
                code_postal: data.code_postal ?? null,
                ville: data.ville ?? null,
                neph: data.neph ?? null,
                date_code: data.date_code ?? null,
                date_permis: data.date_permis ?? null,
                notes: data.notes ?? null,
              },
            })
            setShowEdit(false)
          }}
          onCancel={() => setShowEdit(false)}
          isLoading={updateEleve.isPending}
        />
      </Modal>

      {/* Modal confirmation suppression — gérant uniquement */}
      <Modal open={isGerant && showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Supprimer l'élève" size="sm">
        <p className="text-sm text-[#64748B] mb-4">
          Êtes-vous sûr de vouloir supprimer <strong>{eleve.prenom} {eleve.nom}</strong> ? Cette action est irréversible.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>Annuler</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteEleve.isPending}>
            {deleteEleve.isPending ? 'Suppression...' : 'Supprimer'}
          </Button>
        </div>
      </Modal>

      {/* Modal nouvelle évaluation */}
      <Modal open={showEvalForm} onClose={() => setShowEvalForm(false)} title="Nouvelle évaluation" size="md">
        <EvaluationForm
          mode="create"
          eleveId={eleve.id}
          lecons={leconsEffectuees}
          onSubmit={async (data) => {
            await createEvaluation.mutateAsync(data)
            setShowEvalForm(false)
          }}
          onCancel={() => setShowEvalForm(false)}
          isLoading={createEvaluation.isPending}
        />
      </Modal>

      {/* Modal modifier évaluation */}
      <Modal open={showEditEval && !!selectedEval} onClose={() => { setShowEditEval(false); setSelectedEval(null) }} title="Modifier l'évaluation" size="md">
        {selectedEval && (
          <EvaluationForm
            mode="edit"
            eleveId={eleve.id}
            defaultValues={selectedEval}
            onSubmit={async (data) => {
              await updateEvaluation.mutateAsync({ id: selectedEval.id, data })
              setShowEditEval(false); setSelectedEval(null)
            }}
            onCancel={() => { setShowEditEval(false); setSelectedEval(null) }}
            isLoading={updateEvaluation.isPending}
          />
        )}
      </Modal>

      {/* Modal supprimer évaluation */}
      <Modal open={showDeleteEval && !!selectedEval} onClose={() => { setShowDeleteEval(false); setSelectedEval(null) }} title="Supprimer l'évaluation" size="sm">
        <p className="text-sm text-[#64748B] mb-4">
          Supprimer l'évaluation du <strong>{selectedEval ? formatDate(selectedEval.created_at) : ''}</strong> ? Cette action est irréversible.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => { setShowDeleteEval(false); setSelectedEval(null) }}>Annuler</Button>
          <Button variant="destructive" disabled={deleteEvaluation.isPending} onClick={async () => {
            await deleteEvaluation.mutateAsync(selectedEval!.id)
            setShowDeleteEval(false); setSelectedEval(null)
          }}>
            {deleteEvaluation.isPending ? 'Suppression...' : 'Supprimer'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}

// ─── Sous-composants ────────────────────────────────────────────────────────

const COMPETENCES_LABELS: Record<string, string> = {
  maitrise_vehicule: 'Maîtrise du véhicule',
  comportement_circulation: 'Circulation',
  respect_regles: 'Règles',
  communication: 'Communication',
  independance: 'Autonomie',
}

function EvaluationCard({ evaluation, onEdit, onDelete }: {
  evaluation: Evaluation
  onEdit?: () => void
  onDelete?: () => void
}) {
  const entries = Object.entries(evaluation.competences) as [string, number][]
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-[#64748B]">{formatDate(evaluation.created_at, 'dd/MM/yyyy')}</p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-[#D97706] fill-[#D97706]" />
            <span className="text-sm font-bold text-[#0F172A]">{evaluation.note_globale}/5</span>
          </div>
          {onEdit && (
            <button onClick={onEdit} className="text-xs text-[#2563EB] hover:underline px-1.5 py-0.5 rounded hover:bg-[#EFF6FF] transition-colors">
              Modifier
            </button>
          )}
          {onDelete && (
            <button onClick={onDelete} className="text-xs text-[#DC2626] hover:underline px-1.5 py-0.5 rounded hover:bg-[#FEF2F2] transition-colors">
              Supprimer
            </button>
          )}
        </div>
      </div>
      <div className="space-y-2">
        {entries.map(([key, val]) => (
          <div key={key} className="flex items-center gap-2">
            <span className="text-xs text-[#64748B] w-32 shrink-0">{COMPETENCES_LABELS[key] ?? key}</span>
            <div className="flex-1 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${(val / 5) * 100}%`, backgroundColor: val >= 4 ? '#16A34A' : val >= 3 ? '#2563EB' : '#D97706' }}
              />
            </div>
            <span className="text-xs font-semibold text-[#0F172A] w-4 text-right">{val}</span>
          </div>
        ))}
      </div>
      {evaluation.commentaire && (
        <p className="mt-3 text-xs text-[#64748B] bg-[#F8FAFC] rounded-lg p-2 italic">{evaluation.commentaire}</p>
      )}
    </div>
  )
}

const STATUT_LECON_CONFIG: Record<StatutLecon, { label: string; color: string }> = {
  planifiee:        { label: 'Planifiée',   color: '#D97706' },
  confirmee:        { label: 'Confirmée',   color: '#2563EB' },
  effectuee:        { label: 'Effectuée',   color: '#16A34A' },
  annulee_eleve:    { label: 'Annulée',     color: '#DC2626' },
  annulee_moniteur: { label: 'Annulée',     color: '#DC2626' },
  no_show:          { label: 'No-show',     color: '#64748B' },
}

function LeconStatutBadge({ statut }: { statut: StatutLecon }) {
  const { label, color } = STATUT_LECON_CONFIG[statut]
  return (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: `${color}15`, color }}>
      {label}
    </span>
  )
}

const RESULTAT_CONFIG: Record<ResultatExamen | 'en_attente', { label: string; color: string; bg: string }> = {
  admis:      { label: 'Admis',      color: '#16A34A', bg: '#DCFCE7' },
  ajourne:    { label: 'Ajourné',    color: '#DC2626', bg: '#FEE2E2' },
  absent:     { label: 'Absent',     color: '#D97706', bg: '#FEF3C7' },
  en_attente: { label: 'En attente', color: '#64748B', bg: '#F1F5F9' },
}

function ExamenResultatBadge({ resultat }: { resultat: ResultatExamen | null }) {
  const cfg = RESULTAT_CONFIG[resultat ?? 'en_attente']
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium" style={{ color: cfg.color, backgroundColor: cfg.bg }}>
      {resultat === 'admis' ? <CheckCircle className="w-3 h-3" /> : resultat === 'ajourne' ? <XCircle className="w-3 h-3" /> : resultat === 'absent' ? <AlertTriangle className="w-3 h-3" /> : null}
      {cfg.label}
    </span>
  )
}

const STATUT_FACTURE_CONFIG: Record<StatutFacture, { label: string; color: string }> = {
  brouillon:  { label: 'Brouillon',   color: '#64748B' },
  envoyee:    { label: 'Envoyée',     color: '#2563EB' },
  payee:      { label: 'Payée',       color: '#16A34A' },
  en_retard:  { label: 'En retard',   color: '#DC2626' },
  annulee:    { label: 'Annulée',     color: '#94A3B8' },
}

function FactureStatutBadge({ statut }: { statut: StatutFacture }) {
  const { label, color } = STATUT_FACTURE_CONFIG[statut]
  return (
    <span className="text-[10px] font-medium" style={{ color }}>{label}</span>
  )
}

function InfoLine({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-[#64748B]">
      <span className="text-[#94A3B8] shrink-0">{icon}</span>
      {text}
    </div>
  )
}
