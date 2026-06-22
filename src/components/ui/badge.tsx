import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[#2563EB]/10 text-[#2563EB]',
        success: 'bg-[#16A34A]/10 text-[#16A34A]',
        warning: 'bg-[#D97706]/10 text-[#D97706]',
        danger: 'bg-[#DC2626]/10 text-[#DC2626]',
        neutral: 'bg-[#64748B]/10 text-[#64748B]',
        outline: 'border border-[#E2E8F0] text-[#64748B]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
