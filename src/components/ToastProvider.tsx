import React from 'react'
import * as RadixToast from '@radix-ui/react-toast'
import { CheckCircle2, XCircle, X } from 'lucide-react'

type Toast = {
  id: string
  title: string
  description?: string
  variant?: 'success' | 'error'
}

type ToastContextValue = {
  toast: (opts: Omit<Toast, 'id'>) => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const toast = React.useCallback((opts: Omit<Toast, 'id'>) => {
    const id = crypto.randomUUID()
    setToasts((current) => [...current, { ...opts, id }])
  }, [])

  const dismiss = React.useCallback((id: string) => {
    setToasts((current) => current.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      <RadixToast.Provider duration={3500}>
        {children}
        {toasts.map((t) => (
          <RadixToast.Root
            key={t.id}
            open
            onOpenChange={(open) => {
              if (!open) dismiss(t.id)
            }}
            className="ht-toast"
            data-variant={t.variant ?? 'success'}
          >
            <div className="ht-toast-icon">
              {t.variant === 'error' ? (
                <XCircle size={18} />
              ) : (
                <CheckCircle2 size={18} />
              )}
            </div>
            <div className="ht-toast-body">
              <RadixToast.Title className="ht-toast-title">
                {t.title}
              </RadixToast.Title>
              {t.description ? (
                <RadixToast.Description className="ht-toast-desc">
                  {t.description}
                </RadixToast.Description>
              ) : null}
            </div>
            <RadixToast.Close className="ht-toast-close" aria-label="Dismiss">
              <X size={14} />
            </RadixToast.Close>
          </RadixToast.Root>
        ))}
        <RadixToast.Viewport className="ht-toast-viewport" />
      </RadixToast.Provider>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = React.useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
