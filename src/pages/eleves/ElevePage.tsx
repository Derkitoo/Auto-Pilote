import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2, Phone, Mail, MapPin, Calendar, Clock, CalendarDays } from 'lucide-react'
import { useEleve, useUpdateEleve, useDeleteEleve } from '@/hooks/useEleves'
import { useLecons } from '@/hooks/useLecons'
import { StatutBadge } from '@/components/eleves/StatutBadge'
import { EleveForm } from '@/components/eleves/EleveForm'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/utils'
import type { StatutLecon } from '@/types'

export function ElevePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: eleve, isLoading } = useEleve(id!)
  const { data: lecons, isLoading: leconsLoading } = useLecons({ eleve_id: id })
  const updateEleve = useUpdateEleve()
  const deleteEleve = useDeleteEleve()

  const [showEdit, setShowEdit] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

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
          <Button variant="destructive" size="sm" onClick={() => setShowDeleteConfirm(true)}>
            <Trash2 className="w-3.5 h-3.5" />
            Supprimer
          </Button>
        </div>
      </div>

      {/* Header card */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
        <div className="flex items-start gap-5">
          <Avatar prenom={eleve.prenom} nom={eleve.nom} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-semibold text-[#0F172A]">{eleve.prenom} {eleve.nom}</h2>
              <StatutBadge statut={eleve.statut} />
              <span className="text-xs bg-[#F8FAFC] border border-[#E2E8F0] px-2 py-0.5 rounded-full text-[#64748B]">
                Permis {eleve.permis_vise}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-y-2 gap-x-6">
              <InfoLine icon={<Mail className="w-3.5 h-3.5" />} text={eleve.email} />
              <InfoLine icon={<Phone className="w-3.5 h-3.5" />} text={eleve.telephone} />
              {eleve.ville && (
                <InfoLine icon={<MapPin className="w-3.5 h-3.5" />} text={`${eleve.adresse ?? ''}, ${eleve.code_postal} ${eleve.ville}`} />
              )}
              <InfoLine icon={<Calendar className="w-3.5 h-3.5" />} text={`Né(e) le ${formatDate(eleve.date_naissance)}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats heures + financement */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
          <p className="text-xs text-[#64748B] mb-1">Heures effectuées</p>
          <p className="text-2xl font-semibold text-[#0F172A]">{eleve.heures_effectuees}h</p>
          <div className="mt-2 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
            <div className="h-full bg-[#2563EB] rounded-full" style={{ width: `${progression}%` }} />
          </div>
          <p className="text-xs text-[#64748B] mt-1">{progression}% du forfait ({totalHeures}h)</p>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
          <p className="text-xs text-[#64748B] mb-1">Heures restantes</p>
          <p className="text-2xl font-semibold text-[#0F172A]">{eleve.solde_heures}h</p>
          <p className="text-xs text-[#64748B] mt-1">
            {eleve.solde_heures <= 2
              ? 'Renouvellement conseillé'
              : 'Solde suffisant'}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
          <p className="text-xs text-[#64748B] mb-1">Financement</p>
          <p className="text-base font-medium text-[#0F172A] capitalize">{eleve.financement.replace(/_/g, ' ')}</p>
          <p className="text-xs text-[#64748B] mt-1">Inscrit le {formatDate(eleve.date_inscription)}</p>
        </div>
      </div>

      {/* Dates clés */}
      {(eleve.date_code || eleve.date_permis) && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
          <h3 className="text-sm font-semibold text-[#0F172A] mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Dates clés
          </h3>
          <div className="flex gap-6">
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

      {/* Historique leçons */}
      <div className="bg-white rounded-xl border border-[#E2E8F0]">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#E2E8F0] bg-[#F8FAFC]">
          <CalendarDays className="w-4 h-4 text-[#64748B]" />
          <h3 className="text-sm font-semibold text-[#0F172A]">Historique des leçons</h3>
          <span className="ml-auto text-xs text-[#94A3B8]">{lecons?.length ?? 0} leçon{(lecons?.length ?? 0) > 1 ? 's' : ''}</span>
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
                <LeconStatut statut={l.statut} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      {eleve.notes && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
          <h3 className="text-sm font-semibold text-[#0F172A] mb-2">Notes</h3>
          <p className="text-sm text-[#64748B] whitespace-pre-wrap">{eleve.notes}</p>
        </div>
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

      {/* Modal confirmation suppression */}
      <Modal open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Supprimer l'élève" size="sm">
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

function LeconStatut({ statut }: { statut: StatutLecon }) {
  const { label, color } = STATUT_LECON_CONFIG[statut]
  return (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: `${color}15`, color }}>
      {label}
    </span>
  )
}

function InfoLine({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-[#64748B]">
      <span className="text-[#94A3B8]">{icon}</span>
      {text}
    </div>
  )
}
