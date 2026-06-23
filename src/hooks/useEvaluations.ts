import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { fetchEvaluations, createEvaluation } from '@/data/api'

const KEYS = {
  all: ['evaluations'] as const,
  byEleve: (eleve_id: string) => ['evaluations', eleve_id] as const,
}

export function useEvaluations(eleve_id?: string) {
  return useQuery({
    queryKey: eleve_id ? KEYS.byEleve(eleve_id) : KEYS.all,
    queryFn: () => fetchEvaluations(eleve_id),
    enabled: !!eleve_id,
  })
}

export function useCreateEvaluation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Parameters<typeof createEvaluation>[0]) => createEvaluation(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all })
      toast.success('Évaluation enregistrée')
    },
    onError: () => toast.error("Erreur lors de l'enregistrement"),
  })
}
