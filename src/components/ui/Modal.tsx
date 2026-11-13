import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-4xl',
}

export function Modal({ open, onClose, title, description, children, size = 'md' }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 data-[state=open]:animate-fade-in" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100vw-2rem)]',
            'bg-bg-elevated border border-border-subtle rounded-card shadow-2xl',
            'data-[state=open]:animate-slide-up',
            'focus:outline-none',
            sizes[size],
          )}
          aria-describedby={description ? 'modal-desc' : undefined}
        >
          {(title || description) && (
            <div className="flex items-start justify-between p-5 border-b border-border-subtle">
              <div>
                {title && (
                  <Dialog.Title className="text-lg font-semibold text-text-primary font-display">
                    {title}
                  </Dialog.Title>
                )}
                {description && (
                  <Dialog.Description id="modal-desc" className="text-sm text-text-secondary mt-1">
                    {description}
                  </Dialog.Description>
                )}
              </div>
              <Dialog.Close asChild>
                <button className="text-text-muted hover:text-text-primary transition-colors p-1 rounded-lg focus-visible:outline-gold-500">
                  <X size={20} aria-hidden="true" />
                  <span className="sr-only">Close</span>
                </button>
              </Dialog.Close>
            </div>
          )}
          <div className="p-5">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
