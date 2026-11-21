import { useCallback, useState } from 'react'

/** Open / close state for modals, drawers and menus. */
export function useDisclosure(initial = false) {
  const [isOpen, setOpen] = useState(initial)
  const open = useCallback(() => setOpen(true), [])
  const close = useCallback(() => setOpen(false), [])
  const toggle = useCallback(() => setOpen((v) => !v), [])
  return { isOpen, open, close, toggle, setOpen }
}

/** Like useDisclosure, but remembers which item it was opened for (edit / delete dialogs). */
export function useDisclosureWith<T>() {
  const [item, setItem] = useState<T | null>(null)
  return {
    item,
    isOpen: item !== null,
    open: useCallback((value: T) => setItem(value), []),
    close: useCallback(() => setItem(null), []),
  }
}
