import { useState, useMemo } from 'react'
import { Plus, Award, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react'
import { useExamens, useCreateExamen, useUpdateExamen, useDeleteExamen } from '@/hooks/useExamens'
import { useEleves } from '@/hooks/useEleves'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Skeleton } from '@/components/ui/skeleton'
import { ExamenForm } from '@/components/examens/ExamenForm'
import type { Examen, ResultatExamen, TypeExamen } from '@/types'
import { formatDate } from '@/lib/utils'

type FiltreType = TypeExamen | 'tous'
type FiltreResultat = ResultatExamen | 'tous' | 'en_attente'

const RESULTAT_CONFIG: Record<ResultatExamen | 'en_attente', { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  admis:      { label: 'Admis',      color: '#16A34A', bg: '#DCFCE7', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  ajourne:    { label: 'Ajourné',    color: '#DC2626', bg: '#FEE2E2', icon: <XCircle className="w-3.5 h-3.5" /> },
  absent:     { label: 'Absent',     color: '#D97706', bg: '#FEF3C7', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  en_attente: { label: 'En attente', color: '#64748B', bg: '#F1F5F9', icon: <Clock className="w-3.5 h-3.5" /> },
}

function ResultatBadge({ resultat }: { resultat: ResultatExamen | null }) {
  const key = resultat ?? 'en_attente'
  const cfg = RESULTAT_CONFIG[key]
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium" style={{ color: cfg.color, backgroundColor: cfg.bg }}>
      {cfg.icon}{cfg.label}
    </span>
  )
}

export function ExamensPage() {
  const { user } = useAuth()
  const isGerant = user?.role === 'gerant'
  const { data: examens, isLoading } = useExamens()
  const { data: eleves } = useEleves()
  const createExamen = useCreateExamen()
  const updateExamen = useUpdateExamen()
  const deleteExamen = useDeleteExamen()

  const [filtreType, setFiltreType] = useState<FiltreType>('tous')
  const [filtreResultat, setFiltreResultat] = useState<FiltreResultat>('tous')
  const [showCreate, setShowCreate] = useState(false)
  const [selected, setSelected] = useState<Examen | null>(null)
  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  const examensFiltres = useMemo(() => {
    if (!examens) return []
    return examens.filter(e => {
      if (filtreType !== 'tous' && e.type !== filtreType) return false
      if (filtreResultat === 'en_attente' && e.resultat !== null) return false
      if (filtreResultat !== 'tous' && filtreResultat !== 'en_attente' && e.resultat !== filtreResultat) return false
      return true
    })
  }, [examens, filtreType, filtreResultat])

  const stats = useMemo(() => {
    if (!examens) return { total: 0, admis: 0, taux: 0, code: 0, conduite: 0 }
    const passes = examens.filter(e => e.resultat !== null)
    const admis = examens.filter(e => e.resultat === 'admis').length
    return {
      total: examens.length,
      admis,
      taux: passes.length > 0 ? Math.round((admis / passes.length) * 100) : 0,
      code: examens.filter(e => e.type === 'code').length,
      conduite: examens.filter(e => e.type === 'conduite').length,
    }
  }, [examens])

  const elevesOptions = [
    { value: '', label: '-- Élève --' },
    ...(eleves?.map(e => ({ value: e.id, label: `${e.prenom} ${e.nom}` })) ?? []),
  ]

  return (
    <div className="space-y-5">

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={<Award className="w-5 h-5 text-[#2563EB]" />} label="Total" value={String(stats.total)} color="#EFF6FF" />
        <StatCard icon={<CheckCircle className="w-5 h-5 text-[#16A34A]" />} label="Admis" value={String(stats.admis)} color="#DCFCE7" />
        <StatCard icon={<Award className="w-5 h-5 text-[#D97706]" />} label="Taux de réussite" value={`${stats.taux}%`} color="#FEF3C7" />
        <StatCard icon={<Clock className="w-5 h-5 text-[#64748B]" />} label="En attente" value={String(examens?.filter(e => !e.resultat).length ?? 0)} color="#F1F5F9" />
      </div>

      {/* Filtres + bouton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Type */}
          <div className="flex rounded-lg border border-[#E2E8F0] bg-white overflow-hidden">
            {(['tous', 'code', 'conduite'] as const).map(t => (
              <button
                key={t}
                onClick={() => setFiltreType(t)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors capitalize ${filtreType === t ? 'bg-[#2563EB] text-white' : 'text-[#64748B] hover:bg-[#F8FAFC]'}`}
              >
                {t === 'tous' ? 'Tous' : t === 'code' ? 'Code' : 'Conduite'}
              </button>
            ))}
          </div>
          {/* Résultat */}
          <div className="flex rounded-lg border border-[#E2E8F0] bg-white overflow-hidden">
            {(['tous', 'admis', 'ajourne', 'en_attente'] as const).map(r => (
              <button
                key={r}
                onClick={() => setFiltreResultat(r)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${filtreResultat === r ? 'bg-[#2563EB] text-white' : 'text-[#64748B] hover:bg-[#F8FAFC]'}`}
              >
                {r === 'tous' ? 'Tous' : r === 'admis' ? 'Admis' : r === 'ajourne' ? 'Ajourné' : 'En attente'}
              </button>
            ))}
          </div>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4" />
          Ajouter un examen
        </Button>
      </div>

      {/* Liste */}
      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : examensFiltres.length === 0 ? (
        <div className="text-center py-16 text-[#94A3B8]">
          <Award className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Aucun examen</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wide">Élève</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wide">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wide">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wide hidden md:table-cell">Lieu</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-[#64748B] uppercase tracking-wide hidden sm:table-cell">Score</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[#64748B] uppercase tracking-wide">Résultat</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {examensFiltres.map(e => (
                  <tr key={e.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-4 py-3 font-medium text-[#0F172A]">{e.eleve?.prenom} {e.eleve?.nom}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${e.type === 'code' ? 'bg-[#EFF6FF] text-[#2563EB]' : 'bg-[#F5F3FF] text-[#7C3AED]'}`}>
                        {e.type === 'code' ? 'Code' : 'Conduite'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#64748B]">{formatDate(e.date_examen, 'dd/MM/yyyy')}</td>
                    <td className="px-4 py-3 text-[#64748B] hidden md:table-cell">{e.lieu ?? '—'}</td>
                    <td className="px-4 py-3 text-center text-[#64748B] hidden sm:table-cell">
                      {e.score !== null ? `${e.score}/40` : '—'}
                    </td>
                    <td className="px-4 py-3"><ResultatBadge resultat={e.resultat} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => { setSelected(e); setShowEdit(true) }} className="text-xs text-[#2563EB] hover:underline px-2 py-1 rounded hover:bg-[#EFF6FF] transition-colors">Modifier</button>
                        {isGerant && (
                          <button onClick={() => { setSelected(e); setShowDelete(true) }} className="text-xs text-[#DC2626] hover:underline px-2 py-1 rounded hover:bg-[#FEF2F2] transition-colors">Suppr.</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Ajouter un examen" size="md">
        <ExamenForm
          elevesOptions={elevesOptions}
          onSubmit={async (data) => {
            await createExamen.mutateAsync({ ...data, resultat: data.resultat ?? null, score: data.score ?? null, lieu: data.lieu ?? null, notes: data.notes ?? null })
            setShowCreate(false)
          }}
          onCancel={() => setShowCreate(false)}
          isLoading={createExamen.isPending}
        />
      </Modal>

      <Modal open={showEdit && !!selected} onClose={() => { setShowEdit(false); setSelected(null) }} title="Modifier l'examen" size="md">
        {selected && (
          <ExamenForm
            defaultValues={selected}
            elevesOptions={elevesOptions}
            onSubmit={async (data) => {
              await updateExamen.mutateAsync({ id: selected.id, data: { ...data, resultat: data.resultat ?? null, score: data.score ?? null, lieu: data.lieu ?? null, notes: data.notes ?? null } })
              setShowEdit(false); setSelected(null)
            }}
            onCancel={() => { setShowEdit(false); setSelected(null) }}
            isLoading={updateExamen.isPending}
          />
        )}
      </Modal>

      <Modal open={isGerant && showDelete && !!selected} onClose={() => { setShowDelete(false); setSelected(null) }} title="Supprimer l'examen" size="sm">
        <p className="text-sm text-[#64748B] mb-4">
          Supprimer l'examen <strong>{selected?.type === 'code' ? 'Code' : 'Conduite'}</strong> de <strong>{selected?.eleve?.prenom} {selected?.eleve?.nom}</strong> ?
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => { setShowDelete(false); setSelected(null) }}>Annuler</Button>
          <Button variant="destructive" disabled={deleteExamen.isPending} onClick={async () => {
            await deleteExamen.mutateAsync(selected!.id)
            setShowDelete(false); setSelected(null)
          }}>
            {deleteExamen.isPending ? 'Suppression...' : 'Supprimer'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: color }}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-[#64748B]">{label}</p>
        <p className="text-lg font-semibold text-[#0F172A]">{value}</p>
      </div>
    </div>
  )
}
