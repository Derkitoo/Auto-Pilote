import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  fetchLecons,
  fetchLecon,
  createLecon,
  updateLecon,
  deleteLecon,
} from '@/data/api'
import type { CreateLeconInput, UpdateLeconInput } from '@/types'

export const leconsKeys = {
  all: ['lecons'] as const,
  filtered: (params: { moniteur_id?: string; eleve_id?: string }) =>
    ['lecons', params] as const,
  detail: (id: string) => ['lecons', id] as const,
}

export function useLecons(params?: { moniteur_id?: string; eleve_id?: string }) {
  return useQuery({
    queryKey: params ? leconsKeys.filtered(params) : leconsKeys.all,
    queryFn: () => fetchLecons(params),
  })
}

export function useLecon(id: string) {
  return useQuery({
    queryKey: leconsKeys.detail(id),
    queryFn: () => fetchLecon(id),
    enabled: !!id,
  })
}

export function useCreateLecon() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateLeconInput) => createLecon(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: leconsKeys.all })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Leçon créée')
    },
    onError: () => toast.error('Erreur lors de la création'),
  })
}

export function useUpdateLecon() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeconInput }) =>
      updateLecon(id, data),
    onSuccess: (lecon) => {
      qc.invalidateQueries({ queryKey: leconsKeys.all })
      qc.invalidateQueries({ queryKey: leconsKeys.detail(lecon.id) })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Leçon mise à jour')
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  })
}

export function useDeleteLecon() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteLecon(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: leconsKeys.all })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Leçon supprimée')
    },
    onError: () => toast.error('Erreur lors de la suppression'),
  })
}
