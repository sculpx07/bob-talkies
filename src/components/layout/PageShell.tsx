import { type ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

interface PageShellProps {
  children: ReactNode
  className?: string
  fullWidth?: boolean
}

export function PageShell({ children, className, fullWidth }: PageShellProps) {
  return (
    <main className={cn('min-h-screen pt-16 md:pt-20 pb-24 md:pb-0', className)}>
      {fullWidth ? children : (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
          {children}
        </div>
      )}
    </main>
  )
}

interface SectionProps {
  children: ReactNode
  className?: string
  bg?: 'base' | 'surface' | 'navy'
}

export function Section({ children, className, bg = 'base' }: SectionProps) {
  const bgs = {
    base: 'bg-transparent',
    surface: 'bg-transparent',
    navy: 'bg-transparent',
  }
  return (
    <section className={cn(bgs[bg], 'py-16 md:py-24', className)}>
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {children}
      </div>
    </section>
  )
}

interface SectionHeaderProps {
  eyebrow?: string
  title: string
  subtitle?: string
  centered?: boolean
  className?: string
}

export function SectionHeader({ eyebrow, title, subtitle, centered, className }: SectionHeaderProps) {
  return (
    <div className={cn('mb-10 md:mb-14', centered && 'text-center', className)}>
      {eyebrow && (
        <p className="text-gold-500 text-sm font-medium tracking-widest uppercase mb-3">{eyebrow}</p>
      )}
      <h2 className="font-display text-3xl md:text-4xl text-text-primary leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-text-secondary mt-3 text-base md:text-lg max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  )
}
