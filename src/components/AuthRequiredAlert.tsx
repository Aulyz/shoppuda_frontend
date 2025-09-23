import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

interface AuthRequiredAlertProps {
  title?: string
  message: string
  emoji?: string
  autoRedirect?: boolean
  redirectDelay?: number
  redirectPath?: string
  showLoginButton?: boolean
  onLoginClick?: () => void
  className?: string
}

const AuthRequiredAlert: React.FC<AuthRequiredAlertProps> = ({
  title = "로그인 필요",
  message,
  emoji = "🔐",
  autoRedirect = false,
  redirectDelay = 3000,
  redirectPath = "/login",
  showLoginButton = true,
  onLoginClick,
  className = ""
}) => {
  const navigate = useNavigate()
  const location = useLocation()

  const navigateToLogin = () => {
    const currentPath = location.pathname + location.search
    navigate(`${redirectPath}?redirect=${encodeURIComponent(currentPath)}`)
  }

  useEffect(() => {
    if (autoRedirect) {
      const timer = setTimeout(() => {
        if (onLoginClick) {
          onLoginClick()
        } else {
          navigateToLogin()
        }
      }, redirectDelay)

      return () => clearTimeout(timer)
    }
  }, [autoRedirect, redirectDelay, redirectPath, navigate, onLoginClick])

  const handleLoginClick = () => {
    if (onLoginClick) {
      onLoginClick()
    } else {
      navigateToLogin()
    }
  }

  return (
    <div className={`text-center py-8 ${className}`}>
      <div className="text-4xl mb-4 animate-bounce">
        {emoji}
      </div>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          ⚠ {title}
        </h3>
        <p className="text-yellow-700 mb-4 text-sm leading-relaxed">
          {message}
        </p>
        
        {showLoginButton && (
          <div className="space-y-3">
            <button
              onClick={handleLoginClick}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
            >
              로그인하기
            </button>
            
            {autoRedirect && (
              <p className="text-xs text-yellow-600">
                잠시 후 자동으로 로그인 페이지로 이동합니다.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AuthRequiredAlert