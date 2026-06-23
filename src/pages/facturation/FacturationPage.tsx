import { useState, useMemo } from 'react'
import { Plus, FileText, Clock, AlertCircle, CheckCircle } from 'lucide-react'
import { useFactures, useCreateFacture, useUpdateFacture, useDeleteFacture } from '@/hooks/useFactures'
import { useEleves } from '@/hooks/useEleves'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Skeleton } from '@/components/ui/skeleton'
import { FactureForm } from '@/components/facturation/FactureForm'
import type { Facture, StatutFacture } from '@/types'
import { formatDate } from '@/lib/utils'

const STATUT_CONFIG: Record<StatutFacture, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  brouillon:   { label: 'Brouillon',   color: '#64748B', bg: '#F1F5F9', icon: <FileText className="w-3 h-3" /> },
  envoyee:     { label: 'Envoyée',     color: '#D97706', bg: '#FEF3C7', icon: <Clock className="w-3 h-3" /> },
  payee:       { label: 'Payée',       color: '#16A34A', bg: '#DCFCE7', icon: <CheckCircle className="w-3 h-3" /> },
  en_retard:   { label: 'En retard',   color: '#DC2626', bg: '#FEE2E2', icon: <AlertCircle className="w-3 h-3" /> },
  annulee:     { label: 'Annulée',     color: '#94A3B8', bg: '#F8FAFC', icon: <FileText className="w-3 h-3" /> },
}

const FILTRES: { value: StatutFacture | 'toutes'; label: string }[] = [
  { value: 'toutes',   label: 'Toutes' },
  { value: 'brouillon', label: 'Brouillon' },
  { value: 'envoyee',  label: 'Envoyée' },
  { value: 'payee',    label: 'Payée' },
  { value: 'en_retard', label: 'En retard' },
  { value: 'annulee',  label: 'Annulée' },
]

function StatutBadge({ statut }: { statut: StatutFacture }) {
  const cfg = STATUT_CONFIG[statut]
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ color: cfg.color, backgroundColor: cfg.bg }}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  )
}

export function FacturationPage() {
  const { data: factures, isLoading } = useFactures()
  const { data: eleves } = useEleves()
  const createFacture = useCreateFacture()
  const updateFacture = useUpdateFacture()
  const deleteFacture = useDeleteFacture()

  const [filtre, setFiltre] = useState<StatutFacture | 'toutes'>('toutes')
  const [showCreate, setShowCreate] = useState(false)
  const [selected, setSelected] = useState<Facture | null>(null)
  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  const facturesFiltrees = useMemo(() => {
    if (!factures) return []
    return filtre === 'toutes' ? factures : factures.filter(f => f.statut_paiement === filtre)
  }, [factures, filtre])

  const stats = useMemo(() => {
    if (!factures) return { ca: 0, enAttente: 0, enRetard: 0 }
    return {
      ca: factures.filter(f => f.statut_paiement === 'payee').reduce((s, f) => s + f.montant_ttc, 0),
      enAttente: factures.filter(f => f.statut_paiement === 'envoyee').reduce((s, f) => s + f.montant_ttc, 0),
      enRetard: factures.filter(f => f.statut_paiement === 'en_retard').reduce((s, f) => s + f.montant_ttc, 0),
    }
  }, [factures])

  const genNumero = () => {
    const n = (factures?.length ?? 0) + 1
    return `FAC-${new Date().getFullYear()}-${String(n).padStart(3, '0')}`
  }

  const elevesOptions = [
    { value: '', label: '-- Élève --' },
    ...(eleves?.map(e => ({ value: e.id, label: `${e.prenom} ${e.nom}` })) ?? []),
  ]

  return (
    <div className="space-y-5">

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={<CheckCircle className="w-5 h-5 text-[#16A34A]" />} label="CA encaissé" value={`${stats.ca.toLocaleString('fr-FR')} €`} color="#DCFCE7" />
        <StatCard icon={<Clock className="w-5 h-5 text-[#D97706]" />} label="En attente" value={`${stats.enAttente.toLocaleString('fr-FR')} €`} color="#FEF3C7" />
        <StatCard icon={<AlertCircle className="w-5 h-5 text-[#DC2626]" />} label="En retard" value={`${stats.enRetard.toLocaleString('fr-FR')} €`} color="#FEE2E2" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {FILTRES.map(f => (
            <button
              key={f.value}
              onClick={() => setFiltre(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                filtre === f.value
                  ? 'bg-[#2563EB] text-white border-[#2563EB]'
                  : 'bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#94A3B8]'
              }`}
            >
              {f.label}
              {f.value !== 'toutes' && factures && (
                <span className="ml-1 opacity-60">
                  {factures.filter(fac => fac.statut_paiement === f.value).length}
                </span>
              )}
            </button>
          ))}
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4" />
          Nouvelle facture
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : facturesFiltrees.length === 0 ? (
        <div className="text-center py-16 text-[#94A3B8]">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Aucune facture</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wide">N°</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wide">Élève</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wide hidden md:table-cell">Émission</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wide hidden md:table-cell">Échéance</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[#64748B] uppercase tracking-wide">TTC</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wide">Statut</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {facturesFiltrees.map(f => (
                  <tr key={f.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-[#64748B]">{f.numero}</td>
                    <td className="px-4 py-3 font-medium text-[#0F172A]">{f.eleve?.prenom} {f.eleve?.nom}</td>
                    <td className="px-4 py-3 text-[#64748B] hidden md:table-cell">{formatDate(f.date_emission, 'dd/MM/yyyy')}</td>
                    <td className="px-4 py-3 text-[#64748B] hidden md:table-cell">{formatDate(f.date_echeance, 'dd/MM/yyyy')}</td>
                    <td className="px-4 py-3 text-right font-semibold text-[#0F172A]">{f.montant_ttc.toLocaleString('fr-FR')} €</td>
                    <td className="px-4 py-3"><StatutBadge statut={f.statut_paiement} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => { setSelected(f); setShowEdit(true) }}
                          className="text-xs text-[#2563EB] hover:underline px-2 py-1 rounded hover:bg-[#EFF6FF] transition-colors"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => { setSelected(f); setShowDelete(true) }}
                          className="text-xs text-[#DC2626] hover:underline px-2 py-1 rounded hover:bg-[#FEF2F2] transition-colors"
                        >
                          Suppr.
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal création */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nouvelle facture" size="lg">
        <FactureForm
          elevesOptions={elevesOptions}
          defaultNumero={genNumero()}
          onSubmit={async (data) => {
            await createFacture.mutateAsync(data)
            setShowCreate(false)
          }}
          onCancel={() => setShowCreate(false)}
          isLoading={createFacture.isPending}
        />
      </Modal>

      {/* Modal édition */}
      <Modal open={showEdit && !!selected} onClose={() => { setShowEdit(false); setSelected(null) }} title="Modifier la facture" size="lg">
        {selected && (
          <FactureForm
            defaultValues={selected}
            elevesOptions={elevesOptions}
            defaultNumero={selected.numero}
            onSubmit={async (data) => {
              await updateFacture.mutateAsync({ id: selected.id, data })
              setShowEdit(false); setSelected(null)
            }}
            onCancel={() => { setShowEdit(false); setSelected(null) }}
            isLoading={updateFacture.isPending}
          />
        )}
      </Modal>

      {/* Modal suppression */}
      <Modal open={showDelete && !!selected} onClose={() => { setShowDelete(false); setSelected(null) }} title="Supprimer la facture" size="sm">
        <p className="text-sm text-[#64748B] mb-4">
          Supprimer la facture <strong>{selected?.numero}</strong> ({selected?.montant_ttc?.toLocaleString('fr-FR')} €) ?
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => { setShowDelete(false); setSelected(null) }}>Annuler</Button>
          <Button variant="destructive" disabled={deleteFacture.isPending} onClick={async () => {
            await deleteFacture.mutateAsync(selected!.id)
            setShowDelete(false); setSelected(null)
          }}>
            {deleteFacture.isPending ? 'Suppression...' : 'Supprimer'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: color }}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-[#64748B]">{label}</p>
        <p className="text-lg font-semibold text-[#0F172A]">{value}</p>
      </div>
    </div>
  )
}
