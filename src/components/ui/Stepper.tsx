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
    <nav aria-label="Booking progress" className={cn('flex min-w-max items-start', className)}>
      {steps.map((step, i) => {
        const done = i < currentStep
        const active = i === currentStep
        return (
          <div key={step.id} className="flex flex-1 items-start last:flex-none">
            <div className="flex w-16 flex-col items-center gap-1.5">
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all duration-300',
                  done && 'bg-[#32105f] text-white',
                  active && 'bg-[linear-gradient(135deg,#6b2398,#d946ef)] text-white shadow-[0_8px_20px_rgba(107,35,152,0.4)] scale-110',
                  !done && !active && 'bg-white text-[#7d7094] border border-[#ecd9ec]',
                )}
                aria-current={active ? 'step' : undefined}
              >
                {done ? <Check size={15} /> : i + 1}
              </div>
              <span className={cn(
                'text-[11px] font-medium',
                active ? 'text-[#6b2398] font-semibold' : done ? 'text-[#32105f]' : 'text-[#7d7094]',
              )}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="mt-[17px] h-1 min-w-3 flex-1 overflow-hidden rounded-full bg-[#ecd9ec]">
                <div
                  className={cn(
                    'h-full rounded-full bg-[linear-gradient(90deg,#6b2398,#d946ef)] transition-all duration-500',
                    i < currentStep ? 'w-full' : 'w-0',
                  )}
                />
              </div>
            )}
          </div>
        )
      })}
    </nav>
  )
}
