import { useQuery } from '@tanstack/react-query'
import { fetchStatsDashboard } from '@/data/api'

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchStatsDashboard,
    refetchInterval: 1000 * 60,
  })
}
