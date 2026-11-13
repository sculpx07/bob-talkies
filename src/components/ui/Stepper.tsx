import { Check } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface Step {
  id: string
  label: string
}

interface StepperProps {
  steps: Step[]
  currentStep: number
  className?: string
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <nav aria-label="Booking progress" className={cn('flex items-center gap-0', className)}>
      {steps.map((step, i) => {
        const done = i < currentStep
        const active = i === currentStep
        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all duration-200',
                  done && 'bg-gold-500 border-gold-500 text-bg-base',
                  active && 'border-gold-500 text-gold-400 bg-gold-500/10',
                  !done && !active && 'border-border-subtle text-text-muted bg-bg-surface',
                )}
                aria-current={active ? 'step' : undefined}
              >
                {done ? <Check size={14} /> : i + 1}
              </div>
              <span className={cn(
                'text-xs hidden sm:block',
                active ? 'text-gold-400 font-medium' : done ? 'text-text-secondary' : 'text-text-muted',
              )}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn(
                'flex-1 h-0.5 mx-1 transition-all duration-200',
                i < currentStep ? 'bg-gold-500' : 'bg-border-subtle',
              )} />
            )}
          </div>
        )
      })}
    </nav>
  )
}
