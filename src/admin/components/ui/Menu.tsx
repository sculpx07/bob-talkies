import { useState, type ReactNode } from 'react'
import * as Popover from '@radix-ui/react-popover'
import { cn } from '@/admin/lib/utils/cn'

export interface MenuItem {
  label: ReactNode
  icon?: ReactNode
  onSelect: () => void
  danger?: boolean
  disabled?: boolean
}

/**
 * Small action menu (row actions, user menu).
 *   <Menu trigger={<IconButton label="Actions"><MoreHorizontal/></IconButton>} items={[...]} />
 */
export function Menu({ trigger, items, header, align = 'end' }: {
  trigger: ReactNode
  items: MenuItem[]
  header?: ReactNode
  align?: 'start' | 'end'
}) {
  const [open, setOpen] = useState(false)
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>{trigger}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align={align}
          sideOffset={6}
          className="z-50 min-w-[12rem] rounded-xl border border-slate-200 bg-white p-1 shadow-lg data-[state=open]:animate-fade-in"
          onClick={(e) => e.stopPropagation()} // keep row-click handlers from firing
        >
          {header && <div className="border-b border-slate-100 px-3 py-2">{header}</div>}
          <div role="menu" className={cn(header && 'pt-1')}>
            {items.map((item, i) => (
              <button
                key={i}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => { setOpen(false); item.onSelect() }}
                className={cn(
                  'focus-ring flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm disabled:opacity-50',
                  item.danger ? 'text-red-600 hover:bg-red-50' : 'text-slate-700 hover:bg-slate-100',
                )}
              >
                {item.icon && <span className="h-4 w-4 shrink-0 [&>svg]:h-4 [&>svg]:w-4">{item.icon}</span>}
                {item.label}
              </button>
            ))}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
