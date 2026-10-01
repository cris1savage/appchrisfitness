'use client'

import { useEffect, useState } from 'react'

interface ErrorAlertProps {
  error?: string | null
  type?: 'error' | 'warning' | 'info' | 'success'
  dismissible?: boolean
  autoClose?: number
  onDismiss?: () => void
}

export function ErrorAlert({
  error,
  type = 'error',
  dismissible = true,
  autoClose,
  onDismiss
}: ErrorAlertProps) {
  const [isVisible, setIsVisible] = useState(!!error)

  useEffect(() => {
    setIsVisible(!!error)

    if (autoClose && error) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        onDismiss?.()
      }, autoClose)
      return () => clearTimeout(timer)
    }
  }, [error, autoClose, onDismiss])

  if (!isVisible || !error) return null

  const bgColors = {
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
    success: 'bg-green-50 border-green-200'
  }

  const textColors = {
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800',
    success: 'text-green-800'
  }

  const icons = {
    error: '⚠️',
    warning: '⚡',
    info: 'ℹ️',
    success: '✓'
  }

  return (
    <div className={`border rounded-lg p-4 ${bgColors[type]} flex items-start gap-3`}>
      <span className="text-lg">{icons[type]}</span>
      <div className="flex-1">
        <p className={`font-medium text-sm ${textColors[type]}`}>{error}</p>
      </div>
      {dismissible && (
        <button
          onClick={() => {
            setIsVisible(false)
            onDismiss?.()
          }}
          className={`text-sm font-medium ${textColors[type]} hover:opacity-75 transition`}
        >
          ✕
        </button>
      )}
    </div>
  )
}
