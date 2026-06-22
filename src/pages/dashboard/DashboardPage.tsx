import { useNavigate } from 'react-router-dom'
import {
  Users, CalendarDays, Euro, AlertCircle,
  Clock, CheckCircle2, TrendingUp,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { useDashboard } from '@/hooks/useDashboard'
import { useEleves } from '@/hooks/useEleves'
import { StatutBadge } from '@/components/eleves/StatutBadge'
import { Avatar } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate, formatMontant, formatDateTime } from '@/lib/utils'

// Données graphique simulées (30 derniers jours)
const activiteData = Array.from({ length: 8 }, (_, i) => ({
  semaine: `S${i + 1}`,
  lecons: Math.floor(Math.random() * 12) + 4,
  eleves: Math.floor(Math.random() * 4) + 1,
}))

export function DashboardPage() {
  const navigate = useNavigate()
  const { data: stats, isLoading: statsLoading } = useDashboard()
  const { data: eleves, isLoading: elevesLoading } = useEleves()

  const isLoading = statsLoading || elevesLoading

  const elevesRecents = eleves
    ?.slice()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
        ) : (
          <>
            <KpiCard
              icon={<Users className="w-5 h-5 text-[#2563EB]" />}
              label="Élèves actifs"
              value={stats?.elevesActifs ?? 0}
              sub={`${stats?.totalEleves ?? 0} au total`}
              color="blue"
            />
            <KpiCard
              icon={<CalendarDays className="w-5 h-5 text-[#16A34A]" />}
              label="Leçons aujourd'hui"
              value={stats?.leconsAujourdhui ?? 0}
              sub="planifiées & confirmées"
              color="green"
            />
            <KpiCard
              icon={<Euro className="w-5 h-5 text-[#2563EB]" />}
              label="CA encaissé"
              value={formatMontant(stats?.caTotal ?? 0)}
              sub="factures payées"
              color="blue"
              valueSmall
            />
            <KpiCard
              icon={<AlertCircle className="w-5 h-5 text-[#D97706]" />}
              label="Factures en attente"
              value={stats?.facturesEnAttente ?? 0}
              sub="à relancer"
              color="orange"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">

        {/* Graphique activité */}
        <div className="md:col-span-2 bg-white rounded-xl border border-[#E2E8F0] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A]">Activité — 8 dernières semaines</h3>
              <p className="text-xs text-[#64748B]">Nombre de leçons effectuées</p>
            </div>
            <TrendingUp className="w-4 h-4 text-[#64748B]" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={activiteData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="lecons" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="semaine" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }}
                itemStyle={{ color: '#0F172A' }}
              />
              <Area
                type="monotone"
                dataKey="lecons"
                name="Leçons"
                stroke="#2563EB"
                strokeWidth={2}
                fill="url(#lecons)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Leçons du jour */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
          <h3 className="text-sm font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Leçons du jour
          </h3>
          {statsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
            </div>
          ) : !stats?.prochaines_lecons?.length ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <CheckCircle2 className="w-8 h-8 text-[#E2E8F0] mb-2" />
              <p className="text-sm text-[#64748B]">Aucune leçon aujourd'hui</p>
            </div>
          ) : (
            <div className="space-y-2">
              {stats.prochaines_lecons.map(lecon => (
                <div key={lecon.id} className="flex items-start gap-3 p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                  <div
                    className="w-1 self-stretch rounded-full shrink-0"
                    style={{ backgroundColor: lecon.moniteur?.couleur_agenda ?? '#2563EB' }}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#0F172A] truncate">
                      {lecon.eleve?.prenom} {lecon.eleve?.nom}
                    </p>
                    <p className="text-xs text-[#64748B]">{formatDateTime(lecon.date_debut)}</p>
                    <p className="text-xs text-[#94A3B8]">{lecon.moniteur?.prenom} {lecon.moniteur?.nom}</p>
                  </div>
                  <LeconStatutDot statut={lecon.statut} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Derniers élèves */}
      <div className="bg-white rounded-xl border border-[#E2E8F0]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
          <h3 className="text-sm font-semibold text-[#0F172A]">Derniers élèves inscrits</h3>
          <button
            onClick={() => navigate('/eleves')}
            className="text-xs text-[#2563EB] hover:underline"
          >
            Voir tous →
          </button>
        </div>
        <div className="divide-y divide-[#E2E8F0]">
          {elevesLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))
          ) : (
            elevesRecents?.map(eleve => (
              <div
                key={eleve.id}
                onClick={() => navigate(`/eleves/${eleve.id}`)}
                className="flex items-center gap-3 px-5 py-3 hover:bg-[#F8FAFC] cursor-pointer transition-colors"
              >
                <Avatar prenom={eleve.prenom} nom={eleve.nom} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#0F172A]">{eleve.prenom} {eleve.nom}</p>
                  <p className="text-xs text-[#64748B]">Inscrit le {formatDate(eleve.date_inscription)}</p>
                </div>
                <StatutBadge statut={eleve.statut} />
                <span className="text-xs text-[#64748B] shrink-0 ml-2">{eleve.solde_heures}h restantes</span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  )
}

function KpiCard({
  icon, label, value, sub, color, valueSmall,
}: {
  icon: React.ReactNode
  label: string
  value: number | string
  sub: string
  color: 'blue' | 'green' | 'orange'
  valueSmall?: boolean
}) {
  const bg = { blue: 'bg-[#2563EB]/10', green: 'bg-[#16A34A]/10', orange: 'bg-[#D97706]/10' }
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-[#64748B] uppercase tracking-wide">{label}</p>
        <div className={`w-8 h-8 rounded-lg ${bg[color]} flex items-center justify-center`}>{icon}</div>
      </div>
      <p className={`font-semibold text-[#0F172A] ${valueSmall ? 'text-xl' : 'text-3xl'}`}>{value}</p>
      <p className="text-xs text-[#64748B] mt-1">{sub}</p>
    </div>
  )
}

function LeconStatutDot({ statut }: { statut: string }) {
  const colors: Record<string, string> = {
    confirmee: 'bg-[#16A34A]',
    planifiee: 'bg-[#D97706]',
    effectuee: 'bg-[#64748B]',
  }
  return (
    <div className={`w-2 h-2 rounded-full shrink-0 mt-1 ${colors[statut] ?? 'bg-[#E2E8F0]'}`} />
  )
}
