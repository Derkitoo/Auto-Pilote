import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchLivret, upsertLivretEntry } from '@/data/api'
import type { NiveauCompetence } from '@/types'

export function useLivret(eleve_id?: string) {
  return useQuery({
    queryKey: ['livret', eleve_id],
    queryFn: () => fetchLivret(eleve_id!),
    enabled: !!eleve_id,
  })
}

export function useUpsertLivretEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (args: {
      eleve_id: string
      competence_id: number
      niveau: NiveauCompetence
      commentaire: string | null
      moniteur_id: string
    }) => upsertLivretEntry(args.eleve_id, args.competence_id, args.niveau, args.commentaire, args.moniteur_id),
    onSuccess: (livret) => {
      qc.setQueryData(['livret', livret.eleve_id], livret)
    },
  })
}
