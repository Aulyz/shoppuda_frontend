import React from 'react'
import { useToastStore, Toast } from '../store/toastStore'

const ToastItem: React.FC<{ toast: Toast }> = ({ toast }) => {
  const { removeToast } = useToastStore()

  const getToastStyles = () => {
    const baseStyles = 'p-4 rounded-lg shadow-lg border-l-4 min-w-80 max-w-md'
    
    switch (toast.type) {
      case 'success':
        return `${baseStyles} bg-green-50 border-green-500 text-green-800`
      case 'error':
        return `${baseStyles} bg-red-50 border-red-500 text-red-800`
      case 'warning':
        return `${baseStyles} bg-yellow-50 border-yellow-500 text-yellow-800`
      case 'info':
        return `${baseStyles} bg-blue-50 border-blue-500 text-blue-800`
      default:
        return `${baseStyles} bg-gray-50 border-gray-500 text-gray-800`
    }
  }

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✓'
      case 'error':
        return '✕'
      case 'warning':
        return '⚠'
      case 'info':
        return 'ℹ'
      default:
        return ''
    }
  }

  return (
    <div className={`${getToastStyles()} animate-slide-in-right`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <span className="text-lg font-semibold">{getIcon()}</span>
          <div>
            {toast.title && (
              <h4 className="font-semibold mb-1">{toast.title}</h4>
            )}
            <p className="text-sm">{toast.message}</p>
          </div>
        </div>
        <button
          onClick={() => removeToast(toast.id)}
          className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="토스트 닫기"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

const ToastContainer: React.FC = () => {
  const { toasts } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  )
}

export default ToastContainer