import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Users, BookOpen, Trophy, Clock, AlertTriangle } from 'lucide-react'
import { useEleves, useCreateEleve } from '@/hooks/useEleves'
import { StatutBadge } from '@/components/eleves/StatutBadge'
import { EleveForm } from '@/components/eleves/EleveForm'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/utils'
import type { StatutEleve } from '@/types'

const FILTRES_STATUT: { value: StatutEleve | 'tous'; label: string }[] = [
  { value: 'tous', label: 'Tous' },
  { value: 'inscrit', label: 'Inscrits' },
  { value: 'en_formation', label: 'En formation' },
  { value: 'examen_code', label: 'Examen code' },
  { value: 'examen_conduite', label: 'Examen conduite' },
  { value: 'diplome', label: 'Diplômés' },
]

export function ElevesPage() {
  const navigate = useNavigate()
  const { data: eleves, isLoading } = useEleves()
  const createEleve = useCreateEleve()

  const [search, setSearch] = useState('')
  const [filtreStatut, setFiltreStatut] = useState<StatutEleve | 'tous'>('tous')
  const [showForm, setShowForm] = useState(false)

  const elevesFiltres = useMemo(() => {
    if (!eleves) return []
    return eleves.filter(e => {
      const matchSearch =
        !search ||
        `${e.prenom} ${e.nom}`.toLowerCase().includes(search.toLowerCase()) ||
        e.email.toLowerCase().includes(search.toLowerCase()) ||
        e.telephone.includes(search)
      const matchStatut = filtreStatut === 'tous' || e.statut === filtreStatut
      return matchSearch && matchStatut
    })
  }, [eleves, search, filtreStatut])

  // Stats
  const stats = useMemo(() => {
    if (!eleves) return null
    return {
      total: eleves.length,
      enFormation: eleves.filter(e => e.statut === 'en_formation').length,
      examens: eleves.filter(e => e.statut === 'examen_code' || e.statut === 'examen_conduite').length,
      diplomes: eleves.filter(e => e.statut === 'diplome').length,
      soldeFaible: eleves.filter(e => e.solde_heures <= 2).length,
    }
  }, [eleves])

  return (
    <div className="space-y-6">

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))
        ) : stats ? (
          <>
            <StatCard icon={<Users className="w-5 h-5 text-[#2563EB]" />} label="Total élèves" value={stats.total} color="blue" />
            <StatCard icon={<BookOpen className="w-5 h-5 text-[#2563EB]" />} label="En formation" value={stats.enFormation} color="blue" />
            <StatCard icon={<Clock className="w-5 h-5 text-[#D97706]" />} label="En examen" value={stats.examens} color="orange" />
            <StatCard icon={<Trophy className="w-5 h-5 text-[#16A34A]" />} label="Diplômés" value={stats.diplomes} color="green" />
            <StatCard icon={<AlertTriangle className="w-5 h-5 text-[#DC2626]" />} label="Solde faible" value={stats.soldeFaible} color="red" />
          </>
        ) : null}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#64748B]" />
            <input
              type="text"
              placeholder="Rechercher un élève..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-[#E2E8F0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>

          <div className="flex items-center gap-1">
            {FILTRES_STATUT.map(f => (
              <button
                key={f.value}
                onClick={() => setFiltreStatut(f.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filtreStatut === f.value
                    ? 'bg-[#2563EB] text-white'
                    : 'text-[#64748B] hover:bg-[#F8FAFC]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" />
          Nouvel élève
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <th className="text-left px-4 py-3 text-xs font-medium text-[#64748B] uppercase tracking-wide">Élève</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#64748B] uppercase tracking-wide">Statut</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#64748B] uppercase tracking-wide">Permis</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#64748B] uppercase tracking-wide">Heures restantes</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#64748B] uppercase tracking-wide">Financement</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#64748B] uppercase tracking-wide">Inscription</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-[#E2E8F0]">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <Skeleton className="h-4 w-24" />
                    </td>
                  ))}
                </tr>
              ))
            ) : elevesFiltres.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-[#64748B]">
                  {search || filtreStatut !== 'tous' ? 'Aucun élève ne correspond aux filtres.' : 'Aucun élève pour le moment.'}
                </td>
              </tr>
            ) : (
              elevesFiltres.map(eleve => (
                <tr
                  key={eleve.id}
                  onClick={() => navigate(`/eleves/${eleve.id}`)}
                  className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] cursor-pointer transition-colors last:border-0"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar prenom={eleve.prenom} nom={eleve.nom} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-[#0F172A]">{eleve.prenom} {eleve.nom}</p>
                        <p className="text-xs text-[#64748B]">{eleve.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatutBadge statut={eleve.statut} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-[#0F172A]">{eleve.permis_vise}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(100, (eleve.heures_effectuees / (eleve.heures_effectuees + eleve.solde_heures || 1)) * 100)}%`,
                            backgroundColor: eleve.solde_heures === 0 ? '#DC2626' : eleve.solde_heures <= 2 ? '#D97706' : '#2563EB',
                          }}
                        />
                      </div>
                      <span className={`text-sm font-medium ${
                        eleve.solde_heures === 0 ? 'text-[#DC2626]' : eleve.solde_heures <= 2 ? 'text-[#D97706]' : 'text-[#0F172A]'
                      }`}>{eleve.solde_heures}h</span>
                      {eleve.solde_heures <= 2 && (
                        <AlertTriangle className={`w-3.5 h-3.5 shrink-0 ${eleve.solde_heures === 0 ? 'text-[#DC2626]' : 'text-[#D97706]'}`} />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-[#64748B] capitalize">{eleve.financement.replace(/_/g, ' ')}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-[#64748B]">{formatDate(eleve.date_inscription)}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!isLoading && elevesFiltres.length > 0 && (
          <div className="px-4 py-3 border-t border-[#E2E8F0] bg-[#F8FAFC]">
            <span className="text-xs text-[#64748B]">{elevesFiltres.length} élève{elevesFiltres.length > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Modal création */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nouvel élève" size="lg">
        <EleveForm
          onSubmit={async (data) => {
            await createEleve.mutateAsync({
            ...data,
            profile_id: data.profile_id ?? null,
            adresse: data.adresse ?? null,
            code_postal: data.code_postal ?? null,
            ville: data.ville ?? null,
            neph: data.neph ?? null,
            date_code: data.date_code ?? null,
            date_permis: data.date_permis ?? null,
            notes: data.notes ?? null,
          })
            setShowForm(false)
          }}
          onCancel={() => setShowForm(false)}
          isLoading={createEleve.isPending}
        />
      </Modal>
    </div>
  )
}

function StatCard({
  icon, label, value, color,
}: {
  icon: React.ReactNode
  label: string
  value: number
  color: 'blue' | 'orange' | 'green' | 'red'
}) {
  const bg = { blue: 'bg-[#2563EB]/10', orange: 'bg-[#D97706]/10', green: 'bg-[#16A34A]/10', red: 'bg-[#DC2626]/10' }
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg ${bg[color]} flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-semibold text-[#0F172A]">{value}</p>
        <p className="text-xs text-[#64748B]">{label}</p>
      </div>
    </div>
  )
}
