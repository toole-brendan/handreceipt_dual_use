import { create } from 'zustand'

export type ToastType = 'default' | 'success' | 'error' | 'warning' | 'info'

interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastItem {
  id: string;
  title?: string;
  description?: string;
  type: ToastType;
  action?: ToastAction;
}

interface ToastStore {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
}

const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast: Omit<ToastItem, 'id'>) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: Math.random().toString(36).slice(2) }],
    })),
  removeToast: (id: string) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}))

export const useToast = () => {
  const { toasts, addToast, removeToast } = useToastStore()
  return { toasts, addToast, removeToast }
}
