import { ref } from 'vue'

export type ToastType = 'success' | 'danger' | 'warning' | 'info'

export interface Toast {
    id: string
    title: string
    message?: string
    type: ToastType
    duration?: number
}

// Global state for toasts
const toasts = ref<Toast[]>([])

export const useToast = () => {
    const addToast = (toast: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).substring(2, 9)
        const newToast: Toast = {
            ...toast,
            id,
            duration: toast.duration || 5000 // Default to 5s
        }

        toasts.value.push(newToast)

        if (newToast.duration && newToast.duration > 0) {
            setTimeout(() => {
                removeToast(id)
            }, newToast.duration)
        }

        return id
    }

    const removeToast = (id: string) => {
        const index = toasts.value.findIndex(t => t.id === id)
        if (index !== -1) {
            toasts.value.splice(index, 1)
        }
    }

    const success = (title: string, message?: string, duration?: number) => {
        return addToast({ title, message, type: 'success', duration })
    }

    const error = (title: string, message?: string, duration?: number) => {
        return addToast({ title, message, type: 'danger', duration })
    }

    const warning = (title: string, message?: string, duration?: number) => {
        return addToast({ title, message, type: 'warning', duration })
    }

    const info = (title: string, message?: string, duration?: number) => {
        return addToast({ title, message, type: 'info', duration })
    }

    return {
        toasts,
        addToast,
        removeToast,
        success,
        error,
        warning,
        info
    }
}
