'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

type FormState = 'idle' | 'loading' | 'error' | 'success'

export function DeleteAccountForm() {
  const [state, setState] = useState<FormState>('idle')
  const [error, setError] = useState<string>('')
  const [showConfirmation, setShowConfirmation] = useState(false)
  const supabase = createClientComponentClient()
  const router = useRouter()

  const handleDeleteAccount = async () => {
    setState('loading')
    setError('')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        setError('No active session found')
        setState('error')
        return
      }

      const token = session.access_token
      const userId = session.user.id

      const response = await fetch('/api/profile/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId,
          timestamp: Date.now()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete account')
      }

      setState('success')
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err: any) {
      setError(err?.message || 'An error occurred')
      setState('error')
    }
  }

  return (
    <div className="space-y-4">
      {state === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-medium">Account deleted successfully. Redirecting...</p>
        </div>
      )}

      {state === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium text-sm">{error}</p>
        </div>
      )}

      {!showConfirmation ? (
        <button
          onClick={() => setShowConfirmation(true)}
          className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm"
        >
          Delete My Account
        </button>
      ) : (
        <div className="space-y-3">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 font-medium text-sm mb-2">Are you sure?</p>
            <p className="text-yellow-700 text-xs">
              This action cannot be undone. All your data will be permanently deleted.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowConfirmation(false)}
              disabled={state === 'loading'}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium text-sm disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={state === 'loading'}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {state === 'loading' && <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {state === 'loading' ? 'Deleting...' : 'Yes, Delete Account'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
