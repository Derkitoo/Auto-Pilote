import { Receipt, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useFactures } from '@/hooks/useFactures'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/utils'
import type { StatutFacture } from '@/types'

const STATUT_CONFIG: Record<StatutFacture, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  brouillon:   { label: 'Brouillon',   color: '#64748B', bg: '#F1F5F9', icon: <Receipt className="w-3.5 h-3.5" /> },
  envoyee:     { label: 'À payer',     color: '#D97706', bg: '#FEF3C7', icon: <Clock className="w-3.5 h-3.5" /> },
  payee:       { label: 'Payée',       color: '#16A34A', bg: '#DCFCE7', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  en_retard:   { label: 'En retard',   color: '#DC2626', bg: '#FEE2E2', icon: <AlertCircle className="w-3.5 h-3.5" /> },
  annulee:     { label: 'Annulée',     color: '#94A3B8', bg: '#F8FAFC', icon: <Receipt className="w-3.5 h-3.5" /> },
}

export function EleveFacturesPage() {
  const { user } = useAuth()
  const { data: factures, isLoading } = useFactures(user?.eleve_id)

  const totalDu = factures?.filter(f => f.statut_paiement === 'envoyee' || f.statut_paiement === 'en_retard')
    .reduce((s, f) => s + f.montant_ttc, 0) ?? 0
  const totalPaye = factures?.filter(f => f.statut_paiement === 'payee')
    .reduce((s, f) => s + f.montant_ttc, 0) ?? 0

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-[#0F172A]">Mes factures</h1>

      {/* Résumé */}
      {factures && factures.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#DCFCE7] rounded-2xl p-4">
            <p className="text-xs text-[#16A34A] font-medium">Total payé</p>
            <p className="text-xl font-bold text-[#16A34A]">{totalPaye.toLocaleString('fr-FR')} €</p>
          </div>
          <div className={`rounded-2xl p-4 ${totalDu > 0 ? 'bg-[#FEF3C7]' : 'bg-[#F1F5F9]'}`}>
            <p className={`text-xs font-medium ${totalDu > 0 ? 'text-[#D97706]' : 'text-[#64748B]'}`}>Restant dû</p>
            <p className={`text-xl font-bold ${totalDu > 0 ? 'text-[#D97706]' : 'text-[#64748B]'}`}>{totalDu.toLocaleString('fr-FR')} €</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>
      ) : !factures?.length ? (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 text-center text-sm text-[#94A3B8]">
          <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40" />
          Aucune facture
        </div>
      ) : (
        <div className="space-y-3">
          {factures.map(f => {
            const cfg = STATUT_CONFIG[f.statut_paiement]
            return (
              <div key={f.id} className="bg-white rounded-2xl border border-[#E2E8F0] p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs font-mono text-[#94A3B8]">{f.numero}</p>
                    <p className="text-sm font-semibold text-[#0F172A]">{f.montant_ttc.toLocaleString('fr-FR')} €</p>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium" style={{ color: cfg.color, backgroundColor: cfg.bg }}>
                    {cfg.icon}{cfg.label}
                  </span>
                </div>
                <div className="space-y-0.5">
                  {f.lignes.map((l, i) => (
                    <p key={i} className="text-xs text-[#64748B]">· {l.description} ({l.quantite > 1 ? `${l.quantite}×` : ''}{l.prix_unitaire_ht} € HT)</p>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#F1F5F9] text-xs text-[#94A3B8]">
                  <span>Émise le {formatDate(f.date_emission, 'dd/MM/yyyy')}</span>
                  <span>Échéance {formatDate(f.date_echeance, 'dd/MM/yyyy')}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
