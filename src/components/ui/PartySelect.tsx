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
}

/** Custom dropdown with the same look everywhere (replaces the browser's native <select> list). */
export function PartySelect({ id, value, onValueChange, options, placeholder, icon, className }: PartySelectProps) {
  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      <Select.Trigger
        id={id}
        className={cn(
          'group relative flex h-14 w-full items-center rounded-2xl border border-[#ecd9ec] bg-[#fff7f0] pl-11 pr-10 text-left text-base font-medium text-[#2a0e4f] outline-none',
          'data-[placeholder]:text-[#7d7094]',
          className,
        )}
      >
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8e39c7]" aria-hidden="true">
          {icon}
        </span>
        <Select.Value placeholder={placeholder} />
        <Select.Icon className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#7d7094] transition-transform group-data-[state=open]:rotate-180">
          <ChevronDown size={18} />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={8}
          className="z-[60] w-[var(--radix-select-trigger-width)] min-w-[200px] overflow-hidden rounded-2xl border border-[#ecd9ec] bg-white p-1.5 shadow-[0_24px_50px_rgba(107,35,152,0.22)] data-[state=open]:animate-fade-in"
        >
          <Select.Viewport className="max-h-[300px]">
            {options.map((o) => (
              <Select.Item
                key={o.value}
                value={o.value}
                className="relative flex cursor-pointer select-none items-center justify-between rounded-xl px-3.5 py-2.5 text-[15px] font-medium text-[#32105f] outline-none transition-colors data-[highlighted]:bg-[#f6e6ef] data-[state=checked]:bg-[linear-gradient(135deg,#6b2398,#d946ef)] data-[state=checked]:text-white"
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
