import { useState } from 'react'
import { Plus, Car, Bike, Truck, Wrench } from 'lucide-react'
import { useVehicules, useCreateVehicule, useUpdateVehicule, useDeleteVehicule } from '@/hooks/useVehicules'
import { VehiculeForm } from '@/components/vehicules/VehiculeForm'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Skeleton } from '@/components/ui/skeleton'
import type { Vehicule } from '@/types'

export function VehiculesPage() {
  const { data: vehicules, isLoading } = useVehicules()
  const createVehicule = useCreateVehicule()
  const updateVehicule = useUpdateVehicule()
  const deleteVehicule = useDeleteVehicule()

  const [showCreate, setShowCreate] = useState(false)
  const [selected, setSelected] = useState<Vehicule | null>(null)
  const [showEdit, setShowEdit] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleDelete = async () => {
    if (!selected) return
    await deleteVehicule.mutateAsync(selected.id)
    setShowDeleteConfirm(false)
    setSelected(null)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#64748B]">
          {vehicules?.length ?? 0} véhicule{(vehicules?.length ?? 0) > 1 ? 's' : ''} dans le parc
        </p>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4" />
          Ajouter un véhicule
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {vehicules?.map(v => (
            <VehiculeCard
              key={v.id}
              vehicule={v}
              onEdit={() => { setSelected(v); setShowEdit(true) }}
              onDelete={() => { setSelected(v); setShowDeleteConfirm(true) }}
            />
          ))}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nouveau véhicule">
        <VehiculeForm
          onSubmit={async (data) => { await createVehicule.mutateAsync(data); setShowCreate(false) }}
          onCancel={() => setShowCreate(false)}
          isLoading={createVehicule.isPending}
        />
      </Modal>

      <Modal open={showEdit && !!selected} onClose={() => { setShowEdit(false); setSelected(null) }} title="Modifier le véhicule">
        {selected && (
          <VehiculeForm
            defaultValues={selected}
            onSubmit={async (data) => {
              await updateVehicule.mutateAsync({ id: selected.id, data })
              setShowEdit(false); setSelected(null)
            }}
            onCancel={() => { setShowEdit(false); setSelected(null) }}
            isLoading={updateVehicule.isPending}
          />
        )}
      </Modal>

      <Modal open={showDeleteConfirm && !!selected} onClose={() => { setShowDeleteConfirm(false); setSelected(null) }} title="Supprimer le véhicule" size="sm">
        <p className="text-sm text-[#64748B] mb-4">
          Supprimer <strong>{selected?.marque} {selected?.modele}</strong> ({selected?.immatriculation}) ?
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => { setShowDeleteConfirm(false); setSelected(null) }}>Annuler</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteVehicule.isPending}>
            {deleteVehicule.isPending ? 'Suppression...' : 'Supprimer'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}

function VehiculeCard({ vehicule, onEdit, onDelete }: { vehicule: Vehicule; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#F8FAFC] rounded-lg flex items-center justify-center border border-[#E2E8F0]">
            {vehicule.categorie === 'moto'
              ? <Bike className="w-5 h-5 text-[#64748B]" />
              : vehicule.categorie === 'camion'
              ? <Truck className="w-5 h-5 text-[#64748B]" />
              : <Car className="w-5 h-5 text-[#64748B]" />
            }
          </div>
          <div>
            <p className="text-sm font-semibold text-[#0F172A]">{vehicule.marque} {vehicule.modele}</p>
            <p className="text-xs font-mono text-[#64748B]">{vehicule.immatriculation}</p>
          </div>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${vehicule.actif ? 'bg-[#16A34A]/10 text-[#16A34A]' : 'bg-[#64748B]/10 text-[#64748B]'}`}>
          {vehicule.actif ? 'Actif' : 'Inactif'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <Stat label="Année" value={String(vehicule.annee)} />
        <Stat label="Boîte" value={vehicule.type_boite === 'manuelle' ? 'BVM' : 'BVA'} />
        <Stat label="Km" value={vehicule.kilometrage.toLocaleString('fr-FR')} />
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0]">
        <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
          <Wrench className="w-3.5 h-3.5" />
          <span className="capitalize">{vehicule.categorie}</span>
          <span>·</span>
          {vehicule.type_boite === 'automatique' ? 'BVA' : 'BVM'}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onEdit} className="text-xs text-[#2563EB] hover:underline px-2 py-1 rounded hover:bg-[#EFF6FF] transition-colors">Modifier</button>
          <button onClick={onDelete} className="text-xs text-[#DC2626] hover:underline px-2 py-1 rounded hover:bg-[#FEF2F2] transition-colors">Supprimer</button>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#F8FAFC] rounded-lg py-2">
      <p className="text-xs text-[#94A3B8]">{label}</p>
      <p className="text-sm font-medium text-[#0F172A]">{value}</p>
    </div>
  )
}
