import { Badge } from '@/components/ui/badge'
import type { StatutEleve } from '@/types'

const config: Record<StatutEleve, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'neutral' }> = {
  prospect:         { label: 'Prospect',          variant: 'neutral' },
  inscrit:          { label: 'Inscrit',            variant: 'default' },
  en_formation:     { label: 'En formation',       variant: 'default' },
  examen_code:      { label: 'Examen code',        variant: 'warning' },
  examen_conduite:  { label: 'Examen conduite',    variant: 'warning' },
  diplome:          { label: 'Diplômé',            variant: 'success' },
  abandonne:        { label: 'Abandonné',          variant: 'danger' },
}

export function StatutBadge({ statut }: { statut: StatutEleve }) {
  const { label, variant } = config[statut]
  return <Badge variant={variant}>{label}</Badge>
}
