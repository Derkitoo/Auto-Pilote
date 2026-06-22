import { cn, getInitiales } from '@/lib/utils'

interface AvatarProps {
  prenom: string
  nom: string
  couleur?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-11 h-11 text-base',
}

export function Avatar({ prenom, nom, couleur = '#2563EB', size = 'md', className }: AvatarProps) {
  return (
    <div
      className={cn('rounded-full flex items-center justify-center font-semibold text-white shrink-0', sizes[size], className)}
      style={{ backgroundColor: couleur }}
    >
      {getInitiales(prenom, nom)}
    </div>
  )
}
