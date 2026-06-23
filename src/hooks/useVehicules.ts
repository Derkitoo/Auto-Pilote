import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { fetchVehicules, createVehicule, updateVehicule, deleteVehicule } from '@/data/api'
import type { Vehicule } from '@/types'

export const vehiculesKeys = {
  all: ['vehicules'] as const,
}

export function useVehicules() {
  return useQuery({ queryKey: vehiculesKeys.all, queryFn: fetchVehicules })
}

export function useCreateVehicule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Vehicule, 'id' | 'auto_ecole_id' | 'created_at' | 'updated_at'>) =>
      createVehicule(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: vehiculesKeys.all }); toast.success('Véhicule ajouté') },
    onError: () => toast.error('Erreur lors de la création'),
  })
}

export function useUpdateVehicule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Vehicule> }) => updateVehicule(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: vehiculesKeys.all }); toast.success('Véhicule mis à jour') },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  })
}

export function useDeleteVehicule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteVehicule(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: vehiculesKeys.all }); toast.success('Véhicule supprimé') },
    onError: () => toast.error('Erreur lors de la suppression'),
  })
}
