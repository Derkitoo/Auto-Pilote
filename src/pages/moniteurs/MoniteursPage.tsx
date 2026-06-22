import { useState } from 'react'
import { Plus, Phone, Mail, UserCheck, UserX } from 'lucide-react'
import { useMoniteurs, useCreateMoniteur, useUpdateMoniteur, useDeleteMoniteur } from '@/hooks/useMoniteurs'
import { useLecons } from '@/hooks/useLecons'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Skeleton } from '@/components/ui/skeleton'
import { MoniteurForm } from '@/components/moniteurs/MoniteurForm'
import type { Moniteur } from '@/types'

export function MoniteursPage() {
  const { data: moniteurs, isLoading } = useMoniteurs()
  const { data: lecons } = useLecons()
  const createMoniteur = useCreateMoniteur()
  const updateMoniteur = useUpdateMoniteur()
  const deleteMoniteur = useDeleteMoniteur()

  const [showCreate, setShowCreate] = useState(false)
  const [selected, setSelected] = useState<Moniteur | null>(null)
  const [showEdit, setShowEdit] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const leconsParMoniteur = (moniteurId: string) =>
    lecons?.filter(l => l.moniteur_id === moniteurId).length ?? 0

  const handleDelete = async () => {
    if (!selected) return
    await deleteMoniteur.mutateAsync(selected.id)
    setShowDeleteConfirm(false)
    setSelected(null)
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[#64748B]">
            {moniteurs?.length ?? 0} moniteur{(moniteurs?.length ?? 0) > 1 ? 's' : ''} enregistré{(moniteurs?.length ?? 0) > 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4" />
          Nouveau moniteur
        </Button>
      </div>

      {/* Cards grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {moniteurs?.map(moniteur => (
            <MoniteurCard
              key={moniteur.id}
              moniteur={moniteur}
              nbLecons={leconsParMoniteur(moniteur.id)}
              onEdit={() => { setSelected(moniteur); setShowEdit(true) }}
              onDelete={() => { setSelected(moniteur); setShowDeleteConfirm(true) }}
            />
          ))}
        </div>
      )}

      {/* Modal création */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nouveau moniteur">
        <MoniteurForm
          onSubmit={async (data) => {
            await createMoniteur.mutateAsync({ ...data, numero_enseignant: data.numero_enseignant ?? null })
            setShowCreate(false)
          }}
          onCancel={() => setShowCreate(false)}
          isLoading={createMoniteur.isPending}
        />
      </Modal>

      {/* Modal édition */}
      <Modal
        open={showEdit && !!selected}
        onClose={() => { setShowEdit(false); setSelected(null) }}
        title="Modifier le moniteur"
      >
        {selected && (
          <MoniteurForm
            defaultValues={selected}
            onSubmit={async (data) => {
              await updateMoniteur.mutateAsync({ id: selected.id, data: { ...data, numero_enseignant: data.numero_enseignant ?? null } })
              setShowEdit(false)
              setSelected(null)
            }}
            onCancel={() => { setShowEdit(false); setSelected(null) }}
            isLoading={updateMoniteur.isPending}
          />
        )}
      </Modal>

      {/* Modal suppression */}
      <Modal
        open={showDeleteConfirm && !!selected}
        onClose={() => { setShowDeleteConfirm(false); setSelected(null) }}
        title="Supprimer le moniteur"
        size="sm"
      >
        <p className="text-sm text-[#64748B] mb-4">
          Supprimer <strong>{selected?.prenom} {selected?.nom}</strong> ? Les leçons associées ne seront pas supprimées.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => { setShowDeleteConfirm(false); setSelected(null) }}>Annuler</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteMoniteur.isPending}>
            {deleteMoniteur.isPending ? 'Suppression...' : 'Supprimer'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}

function MoniteurCard({
  moniteur, nbLecons, onEdit, onDelete,
}: {
  moniteur: Moniteur
  nbLecons: number
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 flex flex-col gap-4">
      {/* Header card */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar prenom={moniteur.prenom} nom={moniteur.nom} couleur={moniteur.couleur_agenda} size="md" />
          <div>
            <p className="text-sm font-semibold text-[#0F172A]">{moniteur.prenom} {moniteur.nom}</p>
            {moniteur.numero_enseignant && (
              <p className="text-xs text-[#64748B]">{moniteur.numero_enseignant}</p>
            )}
          </div>
        </div>
        <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
          moniteur.actif
            ? 'bg-[#16A34A]/10 text-[#16A34A]'
            : 'bg-[#64748B]/10 text-[#64748B]'
        }`}>
          {moniteur.actif
            ? <><UserCheck className="w-3 h-3" />Actif</>
            : <><UserX className="w-3 h-3" />Inactif</>
          }
        </span>
      </div>

      {/* Infos contact */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-xs text-[#64748B]">
          <Mail className="w-3.5 h-3.5 text-[#94A3B8]" />
          <span className="truncate">{moniteur.email}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#64748B]">
          <Phone className="w-3.5 h-3.5 text-[#94A3B8]" />
          {moniteur.telephone}
        </div>
      </div>

      {/* Stat leçons + couleur agenda */}
      <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: moniteur.couleur_agenda }} />
          <span className="text-xs text-[#64748B]">{nbLecons} leçon{nbLecons > 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="text-xs text-[#2563EB] hover:underline px-2 py-1 rounded hover:bg-[#EFF6FF] transition-colors"
          >
            Modifier
          </button>
          <button
            onClick={onDelete}
            className="text-xs text-[#DC2626] hover:underline px-2 py-1 rounded hover:bg-[#FEF2F2] transition-colors"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  )
}
