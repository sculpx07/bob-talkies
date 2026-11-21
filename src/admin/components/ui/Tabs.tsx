import type { ReactNode } from 'react'
import * as RadixTabs from '@radix-ui/react-tabs'
import { cn } from '@/admin/lib/utils/cn'

export interface TabItem {
  value: string
  label: ReactNode
  /** small count shown next to the label */
  count?: number
  content: ReactNode
}

/** Underlined tabs. Controlled when `value` is given, otherwise starts on the first tab. */
export function Tabs({ items, value, onValueChange, className }: {
  items: TabItem[]
  value?: string
  onValueChange?: (value: string) => void
  className?: string
}) {
  return (
    <RadixTabs.Root value={value} defaultValue={value ? undefined : items[0]?.value} onValueChange={onValueChange} className={className}>
      <RadixTabs.List className="flex gap-1 overflow-x-auto border-b border-slate-200">
        {items.map((tab) => (
          <RadixTabs.Trigger
            key={tab.value}
            value={tab.value}
            className={cn(
              'focus-ring -mb-px inline-flex items-center gap-2 whitespace-nowrap border-b-2 border-transparent px-3 py-2.5 text-sm font-medium text-slate-500',
              'hover:text-slate-800 data-[state=active]:border-violet-600 data-[state=active]:text-violet-700',
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-600">{tab.count}</span>
            )}
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>
      {items.map((tab) => (
        <RadixTabs.Content key={tab.value} value={tab.value} className="pt-4 focus:outline-none">
          {tab.content}
        </RadixTabs.Content>
      ))}
    </RadixTabs.Root>
  )
}
