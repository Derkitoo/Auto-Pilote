import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-[#0F172A]">
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        className={cn(
          'flex h-9 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-1 text-sm text-[#0F172A] placeholder:text-[#64748B] transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-[#DC2626] focus:ring-[#DC2626]',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-[#DC2626]">{error}</p>}
    </div>
  )
)
Input.displayName = 'Input'

export { Input }
