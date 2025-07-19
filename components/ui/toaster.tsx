"use client"


import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()
  // Import ToastProvider from ui/toast.tsx, which is Radix's ToastPrimitives.Provider
  // This ensures Radix context is present for ToastViewport and other primitives
  // Do NOT use the custom context ToastProvider here
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { ToastProvider } = require("./toast")
  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
// End of Toaster component
