import { useState, useMemo } from 'react'
import { Calendar, dateFnsLocalizer, type Event } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Plus, ChevronLeft, ChevronRight, CheckCircle, XCircle, AlertTriangle, UserX } from 'lucide-react'
import 'react-big-calendar/lib/css/react-big-calendar.css'

import { useLecons, useCreateLecon, useUpdateLecon, useDeleteLecon } from '@/hooks/useLecons'
import { useMoniteurs } from '@/hooks/useMoniteurs'
import { useAuth } from '@/contexts/AuthContext'
import { LeconForm } from '@/components/planning/LeconForm'
import { LeconStatutBadge } from '@/components/lecons/LeconStatutBadge'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/utils'
import type { Lecon, StatutLecon } from '@/types'

type CalendarView = 'month' | 'week' | 'day' | 'agenda'

interface CalEvent extends Event {
  id: string
  lecon: Lecon
  color: string
}

// Icônes légères pour moto vs voiture (SVG inline, pas de dépendance externe)
function IconeMoto({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 12" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <circle cx="3.5" cy="9" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="16.5" cy="9" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M3.5 9 L6 5 L10 5 L13 3 L16.5 5 L16.5 9" fill="none" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  )
}

function IconeVoiture({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 12" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <circle cx="4.5" cy="9.5" r="1.8" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="15.5" cy="9.5" r="1.8" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M2 8 L3 4.5 L6 3 L14 3 L17 4.5 L18 8 Z" fill="none" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M6 3 L7 6.5 L13 6.5 L14 3" fill="none" stroke="currentColor" strokeWidth="0.8"/>
    </svg>
  )
}

function EventCalendrier({ event }: { event: CalEvent }) {
  const cat = event.lecon.vehicule?.categorie
  const boite = event.lecon.vehicule?.type_boite
  return (
    <div className="flex items-center gap-1 h-full overflow-hidden">
      {cat === 'moto'
        ? <IconeMoto className="w-4 h-3 shrink-0 opacity-90" />
        : <IconeVoiture className="w-4 h-3 shrink-0 opacity-90" />
      }
      <span className="truncate text-[11px] leading-tight flex-1">
        {event.lecon.eleve?.prenom} {event.lecon.eleve?.nom}
      </span>
      {boite && (
        <span className="shrink-0 text-[9px] font-bold bg-white/25 rounded px-0.5 leading-tight">
          {boite === 'manuelle' ? 'BVM' : 'BVA'}
        </span>
      )}
    </div>
  )
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: fr }),
  getDay,
  locales: { fr },
})

const STATUT_OPACITY: Record<StatutLecon, number> = {
  planifiee: 0.85,
  confirmee: 1,
  effectuee: 0.5,
  annulee_eleve: 0.25,
  annulee_moniteur: 0.25,
  no_show: 0.25,
}

const STATUT_ANNULE: StatutLecon[] = ['annulee_eleve', 'annulee_moniteur', 'no_show']

const MOTIFS_ANNULATION: { statut: StatutLecon; label: string; icon: React.ReactNode; color: string }[] = [
  { statut: 'annulee_eleve',    label: "Annulée — élève",    icon: <XCircle className="w-4 h-4" />,   color: '#D97706' },
  { statut: 'annulee_moniteur', label: "Annulée — moniteur", icon: <XCircle className="w-4 h-4" />,   color: '#7C3AED' },
  { statut: 'no_show',          label: "No-show élève",      icon: <UserX className="w-4 h-4" />,     color: '#DC2626' },
]

const VUES: { value: CalendarView; label: string }[] = [
  { value: 'day', label: 'Jour' },
  { value: 'week', label: 'Semaine' },
  { value: 'month', label: 'Mois' },
  { value: 'agenda', label: 'Agenda' },
]

export function PlanningPage() {
  const { user } = useAuth()
  const isMoniteur = user?.role === 'moniteur'
  // Moniteur ne voit que ses propres leçons
  const { data: lecons, isLoading } = useLecons(isMoniteur && user.moniteur_id ? { moniteur_id: user.moniteur_id } : undefined)
  const { data: moniteurs } = useMoniteurs()
  const createLecon = useCreateLecon()
  const updateLecon = useUpdateLecon()
  const deleteLecon = useDeleteLecon()

  const [vue, setVue] = useState<CalendarView>(
    window.innerWidth < 768 ? 'day' : 'week'
  )
  const [date, setDate] = useState(new Date())
  const [showCreate, setShowCreate] = useState(false)
  const [selectedLecon, setSelectedLecon] = useState<Lecon | null>(null)
  const [showEdit, setShowEdit] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Filtre moniteurs actifs
  const [moniteursActifs, setMoniteursActifs] = useState<Set<string>>(new Set())

  const toggleMoniteur = (id: string) => {
    setMoniteursActifs(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Convertit leçons → events react-big-calendar
  const events: CalEvent[] = useMemo(() => {
    if (!lecons) return []
    return lecons
      .filter(l => moniteursActifs.size === 0 || moniteursActifs.has(l.moniteur_id))
      .map(l => ({
        id: l.id,
        lecon: l,
        title: `${l.eleve?.prenom ?? ''} ${l.eleve?.nom ?? ''}`,
        start: new Date(l.date_debut),
        end: new Date(l.date_fin),
        color: l.moniteur?.couleur_agenda ?? '#2563EB',
      }))
  }, [lecons, moniteursActifs])

  const eventPropGetter = (event: CalEvent) => {
    const isAnnule = STATUT_ANNULE.includes(event.lecon.statut)
    return {
      style: {
        backgroundColor: isAnnule ? '#94A3B8' : event.color,
        opacity: STATUT_OPACITY[event.lecon.statut] ?? 1,
        borderRadius: '6px',
        border: 'none',
        color: '#fff',
        fontSize: '12px',
        padding: '2px 6px',
        textDecoration: isAnnule ? 'line-through' : 'none',
      },
    }
  }

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    // Pré-remplit les dates dans le form — on ouvre juste le modal
    setShowCreate(true)
    void start; void end
  }

  const handleSelectEvent = (event: CalEvent) => {
    setSelectedLecon(event.lecon)
    setShowEdit(true)
  }

  const handleDeleteLecon = async () => {
    if (!selectedLecon) return
    await deleteLecon.mutateAsync(selectedLecon.id)
    setShowDeleteConfirm(false)
    setShowEdit(false)
    setSelectedLecon(null)
  }

  const messages = {
    today: "Aujourd'hui",
    previous: 'Précédent',
    next: 'Suivant',
    month: 'Mois',
    week: 'Semaine',
    day: 'Jour',
    agenda: 'Agenda',
    date: 'Date',
    time: 'Heure',
    event: 'Leçon',
    noEventsInRange: 'Aucune leçon sur cette période.',
    showMore: (n: number) => `+${n} de plus`,
  }

  return (
    <div className="flex flex-col gap-4 h-full">

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">

        {/* Navigation date */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const d = new Date(date)
              if (vue === 'month') d.setMonth(d.getMonth() - 1)
              else if (vue === 'week') d.setDate(d.getDate() - 7)
              else d.setDate(d.getDate() - 1)
              setDate(d)
            }}
            className="p-1.5 rounded-lg border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[#64748B] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDate(new Date())}
            className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-sm text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
          >
            Aujourd'hui
          </button>
          <button
            onClick={() => {
              const d = new Date(date)
              if (vue === 'month') d.setMonth(d.getMonth() + 1)
              else if (vue === 'week') d.setDate(d.getDate() + 7)
              else d.setDate(d.getDate() + 1)
              setDate(d)
            }}
            className="p-1.5 rounded-lg border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] text-[#64748B] transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-[#0F172A] ml-1 capitalize">
            {format(date, vue === 'day' ? 'EEEE d MMMM yyyy' : vue === 'week' ? "'Semaine du' d MMMM yyyy" : 'MMMM yyyy', { locale: fr })}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Filtres moniteurs — masqués si connecté en tant que moniteur */}
          {!isMoniteur && moniteurs && (
            <div className="flex items-center gap-1.5">
              {moniteurs.map(m => (
                <button
                  key={m.id}
                  onClick={() => toggleMoniteur(m.id)}
                  title={`${m.prenom} ${m.nom}`}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                    moniteursActifs.has(m.id)
                      ? 'text-white border-transparent'
                      : 'bg-white text-[#64748B] border-[#E2E8F0] hover:border-[#94A3B8]'
                  }`}
                  style={moniteursActifs.has(m.id) ? { backgroundColor: m.couleur_agenda } : {}}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: m.couleur_agenda }}
                  />
                  {m.prenom}
                </button>
              ))}
            </div>
          )}

          {/* Sélecteur vue */}
          <div className="flex rounded-lg border border-[#E2E8F0] bg-white overflow-hidden">
            {VUES.map(v => (
              <button
                key={v.value}
                onClick={() => setVue(v.value)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  vue === v.value
                    ? 'bg-[#2563EB] text-white'
                    : 'text-[#64748B] hover:bg-[#F8FAFC]'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>

          {!isMoniteur && (
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4" />
              Nouvelle leçon
            </Button>
          )}
        </div>
      </div>

      {/* Calendrier */}
      {isLoading ? (
        <Skeleton className="flex-1 rounded-xl" />
      ) : (
        <div className="flex-1 bg-white rounded-xl border border-[#E2E8F0] overflow-hidden planning-calendar">
          <Calendar
            localizer={localizer}
            events={events}
            view={vue}
            date={date}
            onNavigate={setDate}
            onView={(v) => setVue(v as CalendarView)}
            eventPropGetter={eventPropGetter}
            components={{ event: EventCalendrier }}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable
            messages={messages}
            culture="fr"
            min={new Date(0, 0, 0, 7, 0)}
            max={new Date(0, 0, 0, 20, 0)}
            step={30}
            timeslots={2}
            toolbar={false}
            style={{ height: '100%' }}
          />
        </div>
      )}

      {/* Modal création */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nouvelle leçon" size="md">
        <LeconForm
          onSubmit={async (data) => {
            await createLecon.mutateAsync({
              ...data,
              vehicule_id: data.vehicule_id ?? null,
              lieu_rdv: data.lieu_rdv ?? null,
              notes: data.notes ?? null,
              date_debut: new Date(data.date_debut).toISOString(),
              date_fin: new Date(data.date_fin).toISOString(),
            })
            setShowCreate(false)
          }}
          onCancel={() => setShowCreate(false)}
          isLoading={createLecon.isPending}
        />
      </Modal>

      {/* Modal édition */}
      <Modal
        open={showEdit && !!selectedLecon}
        onClose={() => { setShowEdit(false); setSelectedLecon(null) }}
        title="Détail de la leçon"
        size="md"
      >
        {selectedLecon && !showDeleteConfirm && (
          <>
            {/* Résumé rapide */}
            <div className="mb-4 p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Élève</span>
                <span className="font-medium text-[#0F172A]">{selectedLecon.eleve?.prenom} {selectedLecon.eleve?.nom}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Moniteur</span>
                <span className="font-medium text-[#0F172A]">{selectedLecon.moniteur?.prenom} {selectedLecon.moniteur?.nom}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Date</span>
                <span className="font-medium text-[#0F172A]">{formatDate(selectedLecon.date_debut, "dd/MM/yyyy 'de' HH:mm")} → {formatDate(selectedLecon.date_fin, 'HH:mm')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Statut actuel</span>
                <LeconStatutBadge statut={selectedLecon.statut} />
              </div>
            </div>

            {/* ── Actions rapides ── */}
            {!STATUT_ANNULE.includes(selectedLecon.statut) && (
              <div className="mb-4 space-y-2">
                <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide">Actions rapides</p>
                <div className="flex flex-wrap gap-2">
                  {/* Marquer effectuée */}
                  {selectedLecon.statut !== 'effectuee' && (
                    <button
                      onClick={async () => {
                        await updateLecon.mutateAsync({ id: selectedLecon.id, data: { statut: 'effectuee' } })
                        setShowEdit(false); setSelectedLecon(null)
                      }}
                      disabled={updateLecon.isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#DCFCE7] text-[#16A34A] text-xs font-semibold hover:bg-[#BBF7D0] transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Marquer effectuée
                    </button>
                  )}
                  {/* Motifs annulation */}
                  {MOTIFS_ANNULATION.map(motif => (
                    <button
                      key={motif.statut}
                      onClick={async () => {
                        await updateLecon.mutateAsync({ id: selectedLecon.id, data: { statut: motif.statut } })
                        setShowEdit(false); setSelectedLecon(null)
                      }}
                      disabled={updateLecon.isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: motif.color + '20', color: motif.color }}
                    >
                      {motif.icon}
                      {motif.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bannière leçon annulée */}
            {STATUT_ANNULE.includes(selectedLecon.statut) && (
              <div className="mb-4 flex items-center gap-2 p-3 bg-[#FEF3C7] border border-[#FCD34D] rounded-lg text-sm text-[#D97706]">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  Cette leçon est {selectedLecon.statut === 'no_show' ? 'marquée no-show' : 'annulée'}.
                  <button
                    className="ml-2 underline font-medium"
                    onClick={async () => {
                      await updateLecon.mutateAsync({ id: selectedLecon.id, data: { statut: 'planifiee' } })
                      setShowEdit(false); setSelectedLecon(null)
                    }}
                  >
                    Remettre en planifiée
                  </button>
                </span>
              </div>
            )}

            <LeconForm
              defaultValues={selectedLecon}
              onSubmit={async (data) => {
                await updateLecon.mutateAsync({
                  id: selectedLecon.id,
                  data: {
                    ...data,
                    vehicule_id: data.vehicule_id ?? null,
                    lieu_rdv: data.lieu_rdv ?? null,
                    notes: data.notes ?? null,
                    date_debut: new Date(data.date_debut).toISOString(),
                    date_fin: new Date(data.date_fin).toISOString(),
                  },
                })
                setShowEdit(false)
                setSelectedLecon(null)
              }}
              onCancel={() => { setShowEdit(false); setSelectedLecon(null) }}
              isLoading={updateLecon.isPending}
            />
            {!isMoniteur && (
              <div className="mt-3 pt-3 border-t border-[#E2E8F0]">
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-xs text-[#DC2626] hover:underline"
                >
                  Supprimer cette leçon
                </button>
              </div>
            )}
          </>
        )}
        {selectedLecon && showDeleteConfirm && (
          <div>
            <p className="text-sm text-[#64748B] mb-4">
              Supprimer la leçon de <strong>{selectedLecon.eleve?.prenom} {selectedLecon.eleve?.nom}</strong> le {formatDate(selectedLecon.date_debut)} ?
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>Annuler</Button>
              <Button variant="destructive" onClick={handleDeleteLecon} disabled={deleteLecon.isPending}>
                {deleteLecon.isPending ? 'Suppression...' : 'Supprimer'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
