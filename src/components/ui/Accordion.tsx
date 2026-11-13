import * as RadixAccordion from '@radix-ui/react-accordion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface AccordionItem {
  id: string
  question: string
  answer: string
}

interface AccordionProps {
  items: AccordionItem[]
  className?: string
}

export function Accordion({ items, className }: AccordionProps) {
  return (
    <RadixAccordion.Root type="multiple" className={cn('space-y-2', className)}>
      {items.map((item) => (
        <RadixAccordion.Item
          key={item.id}
          value={item.id}
          className="border border-border-subtle rounded-card overflow-hidden bg-bg-surface"
        >
          <RadixAccordion.Header>
            <RadixAccordion.Trigger className={cn(
              'flex w-full items-center justify-between px-5 py-4 text-left',
              'text-text-primary font-medium text-sm hover:text-gold-400 transition-colors',
              'data-[state=open]:text-gold-400',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/40',
              'group',
            )}>
              <span>{item.question}</span>
              <ChevronDown
                size={18}
                className="text-text-muted shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
                aria-hidden="true"
              />
            </RadixAccordion.Trigger>
          </RadixAccordion.Header>
          <RadixAccordion.Content className={cn(
            'overflow-hidden text-sm text-text-secondary',
            'data-[state=open]:animate-[accordionSlideDown_200ms_ease-out]',
            'data-[state=closed]:animate-[accordionSlideUp_200ms_ease-out]',
          )}>
            <p className="px-5 pb-4 leading-relaxed">{item.answer}</p>
          </RadixAccordion.Content>
        </RadixAccordion.Item>
      ))}
    </RadixAccordion.Root>
  )
}
