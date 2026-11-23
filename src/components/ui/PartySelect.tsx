import type { ReactNode } from 'react'
import * as Select from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface PartySelectOption {
  value: string
  label: string
}

interface PartySelectProps {
  id: string
  value: string
  onValueChange: (value: string) => void
  options: PartySelectOption[]
  placeholder: string
  icon: ReactNode
  className?: string
  /** When set, renders a small label above the value (compact bar mode) */
  label?: string
  disabled?: boolean
}

/** Custom dropdown with the same look everywhere (replaces the browser's native <select> list). */
export function PartySelect({ id, value, onValueChange, options, placeholder, icon, className, label, disabled }: PartySelectProps) {
  return (
    <Select.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <Select.Trigger
        id={id}
        className={cn(
          'group relative flex h-14 w-full items-center rounded-2xl border border-[#f5d5e0] pl-11 pr-10 text-left text-base font-semibold text-[#160730] outline-none transition-colors',
          label && 'flex-col items-start justify-center gap-px',
          'data-[placeholder]:text-[#7d4555]',
          value ? 'bg-[#ede8ff] border-[#c4b5fd]' : 'bg-[#fff7f0]',
          disabled && 'cursor-not-allowed opacity-50',
          className,
        )}
      >
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#a81a3a]" aria-hidden="true">
          {icon}
        </span>
        {label && (
          <span className="pointer-events-none text-[11px] font-bold uppercase tracking-[0.12em] text-black leading-none">
            {label}
          </span>
        )}
        <Select.Value placeholder={placeholder} className="data-[placeholder]:text-[#b0a0c8]" />
        <Select.Icon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7d4555] transition-transform group-data-[state=open]:rotate-180">
          <ChevronDown size={15} />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={8}
          side="bottom"
          avoidCollisions
          collisionPadding={{ top: 80 }}
          className="z-[200] w-[var(--radix-select-trigger-width)] min-w-[200px] overflow-hidden rounded-2xl border border-[#f5d5e0] bg-white p-1.5 shadow-[0_24px_50px_rgba(107,35,152,0.22)] data-[state=open]:animate-fade-in"
        >
          <Select.Viewport className="max-h-[300px]">
            {options.map((o) => (
              <Select.Item
                key={o.value}
                value={o.value}
                className="relative flex cursor-pointer select-none items-center justify-between rounded-xl px-3.5 py-2.5 text-[15px] font-medium text-[#5c1535] outline-none transition-colors data-[highlighted]:bg-[#f6e6ef] data-[state=checked]:bg-[linear-gradient(135deg,#8b1a3a,#d9126a)] data-[state=checked]:text-white"
              >
                <Select.ItemText>{o.label}</Select.ItemText>
                <Select.ItemIndicator>
                  <Check size={16} />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}
