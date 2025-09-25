import { create } from 'zustand'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
  autoClose?: boolean
  timeoutId?: NodeJS.Timeout
}

interface ToastStore {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  clearToasts: () => void
}

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],

  addToast: (toast) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const newToast: Toast = {
      id,
      duration: 4000,
      autoClose: true,
      ...toast,
    }

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }))

    // 자동 제거 - 메모리 누수 방지를 위한 cleanup
    if (newToast.autoClose) {
      const timeoutId = setTimeout(() => {
        const currentToasts = get().toasts
        if (currentToasts.find(t => t.id === id)) {
          get().removeToast(id)
        }
      }, newToast.duration)

      // 컴포넌트 언마운트 시 cleanup을 위해 timeout ID 저장
      newToast.timeoutId = timeoutId
    }
  },

  removeToast: (id) => {
    set((state) => {
      // 제거할 토스트의 타이머가 있다면 정리
      const toastToRemove = state.toasts.find(toast => toast.id === id)
      if (toastToRemove?.timeoutId) {
        clearTimeout(toastToRemove.timeoutId)
      }

      return {
        toasts: state.toasts.filter((toast) => toast.id !== id),
      }
    })
  },

  clearToasts: () => {
    set((state) => {
      // 모든 타이머 정리
      state.toasts.forEach(toast => {
        if (toast.timeoutId) {
          clearTimeout(toast.timeoutId)
        }
      })
      return { toasts: [] }
    })
  },
}))