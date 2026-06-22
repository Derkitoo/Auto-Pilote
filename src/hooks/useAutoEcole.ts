import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { fetchAutoEcole, updateAutoEcole } from '@/data/api'
import type { AutoEcole } from '@/types'

export function useAutoEcole() {
  return useQuery({
    queryKey: ['auto_ecole'],
    queryFn: fetchAutoEcole,
  })
}

export function useUpdateAutoEcole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<AutoEcole>) => updateAutoEcole(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['auto_ecole'] })
      toast.success('Paramètres enregistrés')
    },
    onError: () => toast.error('Erreur lors de la sauvegarde'),
  })
}
