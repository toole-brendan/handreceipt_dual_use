import * as React from "react"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider as Provider,
  ToastTitle,
  ToastViewport,
} from "@radix-ui/react-toast"
import { useToast, ToastItem, ToastType } from "../hooks/useToast"
import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react"

const toastVariants = {
  default: "bg-background text-foreground",
  success: "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100",
  error: "bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100",
  warning: "bg-yellow-100 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100",
  info: "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100",
}

const getToastIcon = (type: ToastType): React.ReactNode => {
  switch (type) {
    case 'success':
      return <CheckCircle className="h-5 w-5 text-green-500" />
    case 'error':
      return <XCircle className="h-5 w-5 text-red-500" />
    case 'warning':
      return <AlertCircle className="h-5 w-5 text-yellow-500" />
    case 'info':
      return <Info className="h-5 w-5 text-blue-500" />
    default:
      return null
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { toasts } = useToast()

  return (
    <Provider swipeDirection="right">
      {children}
      {toasts.map(({ id, title, description, type, action, ...props }: ToastItem) => {
        return (
          <Toast 
            key={id} 
            className={`${toastVariants[type]} group relative rounded-lg p-4 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full`} 
            {...props}
          >
            <div className="flex gap-3">
              {getToastIcon(type)}
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
                {action && (
                  <div className="mt-2">
                    <button
                      className="text-sm font-medium text-[var(--brand-default)] hover:text-[var(--brand-emphasis)]"
                      onClick={action.onClick}
                    >
                      {action.label}
                    </button>
                  </div>
                )}
              </div>
            </div>
            <ToastClose className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100" />
          </Toast>
        )
      })}
      <ToastViewport className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]" />
    </Provider>
  )
}
