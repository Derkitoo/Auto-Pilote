import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { fetchExamens, createExamen, updateExamen, deleteExamen } from '@/data/api'

const KEYS = {
  all: ['examens'] as const,
  list: (eleve_id?: string) => ['examens', eleve_id ?? 'all'] as const,
}

export function useExamens(eleve_id?: string) {
  return useQuery({
    queryKey: KEYS.list(eleve_id),
    queryFn: () => fetchExamens(eleve_id),
  })
}

export function useCreateExamen() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Parameters<typeof createExamen>[0]) => createExamen(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.all }); toast.success('Examen ajouté') },
    onError: () => toast.error('Erreur lors de la création'),
  })
}

export function useUpdateExamen() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateExamen>[1] }) =>
      updateExamen(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.all }); toast.success('Examen mis à jour') },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  })
}

export function useDeleteExamen() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteExamen(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.all }); toast.success('Examen supprimé') },
    onError: () => toast.error('Erreur lors de la suppression'),
  })
}
