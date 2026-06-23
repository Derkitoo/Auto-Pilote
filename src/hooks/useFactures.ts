import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchFactures, createFacture, updateFacture, deleteFacture } from '@/data/api'
import type { Facture } from '@/types'

const KEYS = {
  all: ['factures'] as const,
  list: (eleve_id?: string) => ['factures', eleve_id ?? 'all'] as const,
}

export function useFactures(eleve_id?: string) {
  return useQuery({
    queryKey: KEYS.list(eleve_id),
    queryFn: () => fetchFactures(eleve_id),
  })
}

export function useCreateFacture() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Parameters<typeof createFacture>[0]) => createFacture(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  })
}

export function useUpdateFacture() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateFacture>[1] }) =>
      updateFacture(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  })
}

export function useDeleteFacture() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteFacture(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  })
}

// Calcul totaux à partir des lignes
export function calculerTotaux(lignes: Facture['lignes']) {
  const ht = lignes.reduce((s, l) => s + l.quantite * l.prix_unitaire_ht, 0)
  const tva = lignes.reduce((s, l) => s + l.quantite * l.prix_unitaire_ht * (l.tva / 100), 0)
  return { montant_ht: ht, montant_tva: tva, montant_ttc: ht + tva }
}
