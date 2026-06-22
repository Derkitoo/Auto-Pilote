import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  fetchMoniteurs,
  fetchMoniteur,
  createMoniteur,
  updateMoniteur,
  deleteMoniteur,
} from '@/data/api'
import type { CreateMoniteurInput, UpdateMoniteurInput } from '@/types'

export const moniteursKeys = {
  all: ['moniteurs'] as const,
  detail: (id: string) => ['moniteurs', id] as const,
}

export function useMoniteurs() {
  return useQuery({
    queryKey: moniteursKeys.all,
    queryFn: fetchMoniteurs,
  })
}

export function useMoniteur(id: string) {
  return useQuery({
    queryKey: moniteursKeys.detail(id),
    queryFn: () => fetchMoniteur(id),
    enabled: !!id,
  })
}

export function useCreateMoniteur() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateMoniteurInput) => createMoniteur(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: moniteursKeys.all })
      toast.success('Moniteur créé')
    },
    onError: () => toast.error('Erreur lors de la création'),
  })
}

export function useUpdateMoniteur() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMoniteurInput }) =>
      updateMoniteur(id, data),
    onSuccess: (moniteur) => {
      qc.invalidateQueries({ queryKey: moniteursKeys.all })
      qc.invalidateQueries({ queryKey: moniteursKeys.detail(moniteur.id) })
      toast.success('Moniteur mis à jour')
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  })
}

export function useDeleteMoniteur() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteMoniteur(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: moniteursKeys.all })
      toast.success('Moniteur supprimé')
    },
    onError: () => toast.error('Erreur lors de la suppression'),
  })
}
