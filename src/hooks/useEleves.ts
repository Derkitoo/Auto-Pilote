import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  fetchEleves,
  fetchEleve,
  createEleve,
  updateEleve,
  deleteEleve,
} from '@/data/api'
import type { CreateEleveInput, UpdateEleveInput } from '@/types'

export const elevesKeys = {
  all: ['eleves'] as const,
  detail: (id: string) => ['eleves', id] as const,
}

export function useEleves() {
  return useQuery({
    queryKey: elevesKeys.all,
    queryFn: fetchEleves,
  })
}

export function useEleve(id: string) {
  return useQuery({
    queryKey: elevesKeys.detail(id),
    queryFn: () => fetchEleve(id),
    enabled: !!id,
  })
}

export function useCreateEleve() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateEleveInput) => createEleve(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: elevesKeys.all })
      toast.success('Élève créé avec succès')
    },
    onError: () => toast.error('Erreur lors de la création'),
  })
}

export function useUpdateEleve() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEleveInput }) =>
      updateEleve(id, data),
    onSuccess: (eleve) => {
      qc.invalidateQueries({ queryKey: elevesKeys.all })
      qc.invalidateQueries({ queryKey: elevesKeys.detail(eleve.id) })
      toast.success('Élève mis à jour')
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  })
}

export function useDeleteEleve() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteEleve(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: elevesKeys.all })
      toast.success('Élève supprimé')
    },
    onError: () => toast.error('Erreur lors de la suppression'),
  })
}
