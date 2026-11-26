import { motion } from 'framer-motion'
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
  /** when given, completed steps become buttons that jump back to that step */
  onStepClick?: (index: number) => void
}

export function Stepper({ steps, currentStep, className, onStepClick }: StepperProps) {
  return (
    <nav aria-label="Booking progress" className={cn('flex w-full items-start', className)}>
      {steps.map((step, i) => {
        const done = i < currentStep
        const active = i === currentStep
        return (
          <div key={step.id} className="flex flex-1 items-start last:flex-none">
            <button
              type="button"
              disabled={!(onStepClick && done)}
              onClick={() => onStepClick?.(i)}
              aria-label={done ? `Go back to ${step.label}` : undefined}
              className={cn('group flex w-9 flex-col items-center gap-1.5 disabled:cursor-default sm:w-16', done && onStepClick && 'cursor-pointer')}
            >
              <span className="relative flex h-9 w-9 items-center justify-center">
                {active && (
                  <motion.span
                    className="absolute inset-0 rounded-full bg-[#f5d7a1]/40"
                    animate={{ scale: [1, 1.7], opacity: [0.7, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                    aria-hidden="true"
                  />
                )}
                <motion.span
                  key={`${i}-${done}-${active}`}
                  initial={{ scale: 0.6 }}
                  animate={{ scale: active ? 1.1 : 1 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 14 }}
                  className={cn(
                    'relative flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold',
                    done && 'bg-[linear-gradient(135deg,#f5d7a1,#c9933a)] text-[#3d0a24] ring-2 ring-[#f5d7a1]/60 group-hover:brightness-110',
                    active && 'bg-white text-[#5c1535] ring-2 ring-[#f5d7a1] shadow-[0_8px_20px_rgba(0,0,0,0.35)]',
                    !done && !active && 'border border-white/30 bg-white/15 text-white/80',
                  )}
                  aria-current={active ? 'step' : undefined}
                >
                  {done ? <Check size={15} /> : i + 1}
                </motion.span>
              </span>
              <span
                className={cn(
                  'whitespace-nowrap text-[11px] font-medium',
                  active ? 'block font-semibold text-white' : cn('hidden sm:block', done ? 'text-[#f5d7a1]' : 'text-white/65'),
                )}
              >
                {step.label}
              </span>
            </button>
            {i < steps.length - 1 && (
              <div className="relative mx-1 mt-[17px] h-1 min-w-2 flex-1 overflow-hidden rounded-full bg-white/20">
                <motion.div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#f5d7a1,#c9933a)]"
                  initial={false}
                  animate={{ width: i < currentStep ? '100%' : '0%' }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                />
                {i === currentStep && (
                  <motion.span
                    className="absolute inset-y-0 w-1/3 rounded-full bg-gradient-to-r from-transparent via-[#f5d7a1]/70 to-transparent"
                    animate={{ left: ['-35%', '105%'] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                    aria-hidden="true"
                  />
                )}
              </div>
            )}
          </div>
        )
      })}
    </nav>
  )
}
