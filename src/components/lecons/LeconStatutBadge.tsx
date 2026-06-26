import type { StatutLecon } from '@/types'

const CONFIG: Record<StatutLecon, { label: string; color: string }> = {
  planifiee:        { label: 'Planifiée',   color: '#D97706' },
  confirmee:        { label: 'Confirmée',   color: '#2563EB' },
  effectuee:        { label: 'Effectuée',   color: '#16A34A' },
  annulee_eleve:    { label: 'Annulée (élève)',    color: '#DC2626' },
  annulee_moniteur: { label: 'Annulée (moniteur)', color: '#7C3AED' },
  no_show:          { label: 'No-show',     color: '#64748B' },
}

export function LeconStatutBadge({ statut }: { statut: StatutLecon }) {
  const { label, color } = CONFIG[statut]
  return (
    <span
      className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0"
      style={{ backgroundColor: `${color}18`, color }}
    >
      {label}
    </span>
  )
}
