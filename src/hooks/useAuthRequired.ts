import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useToastStore } from '../store/toastStore'

interface UseAuthRequiredOptions {
  redirectPath?: string
  showToast?: boolean
  toastMessage?: string
  autoRedirect?: boolean
  redirectDelay?: number
  onAuthRequired?: () => void
}

interface UseAuthRequiredReturn {
  isAuthenticated: boolean
  isAuthRequired: boolean
  checkAuth: () => boolean
  handleAuthRequired: (message?: string) => void
  requireAuth: <T extends any[], R>(
    fn: (...args: T) => R,
    message?: string
  ) => (...args: T) => R | void
}

export const useAuthRequired = (
  options: UseAuthRequiredOptions = {}
): UseAuthRequiredReturn => {
  const {
    redirectPath = '/login',
    showToast = true,
    toastMessage = '로그인이 필요한 서비스입니다.',
    autoRedirect = false,
    redirectDelay = 3000,
    onAuthRequired
  } = options

  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { addToast } = useToastStore()
  const [isAuthRequired, setIsAuthRequired] = useState(false)

  useEffect(() => {
    if (isAuthRequired && autoRedirect) {
      const timer = setTimeout(() => {
        if (onAuthRequired) {
          onAuthRequired()
        } else {
          navigate(redirectPath)
        }
      }, redirectDelay)

      return () => clearTimeout(timer)
    }
  }, [isAuthRequired, autoRedirect, redirectDelay, redirectPath, navigate, onAuthRequired])

  const checkAuth = (): boolean => {
    return isAuthenticated
  }

  const handleAuthRequired = (message?: string) => {
    setIsAuthRequired(true)
    
    if (showToast) {
      addToast({
        type: 'warning',
        message: message || toastMessage
      })
    }

    if (onAuthRequired) {
      onAuthRequired()
    } else if (!autoRedirect) {
      // 자동 리다이렉트가 비활성화된 경우 즉시 이동
      navigate(redirectPath)
    }
  }

  const requireAuth = <T extends any[], R>(
    fn: (...args: T) => R,
    message?: string
  ) => {
    return (...args: T): R | void => {
      if (!isAuthenticated) {
        handleAuthRequired(message)
        return
      }
      return fn(...args)
    }
  }

  return {
    isAuthenticated,
    isAuthRequired,
    checkAuth,
    handleAuthRequired,
    requireAuth
  }
}