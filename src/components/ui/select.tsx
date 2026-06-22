import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, options, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-[#0F172A]">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          ref={ref}
          className={cn(
            'flex h-9 w-full appearance-none rounded-lg border border-[#E2E8F0] bg-white px-3 py-1 pr-8 text-sm text-[#0F172A] transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-[#DC2626] focus:ring-[#DC2626]',
            className
          )}
          {...props}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-[#64748B] pointer-events-none" />
      </div>
      {error && <p className="text-xs text-[#DC2626]">{error}</p>}
    </div>
  )
)
Select.displayName = 'Select'

export { Select }
