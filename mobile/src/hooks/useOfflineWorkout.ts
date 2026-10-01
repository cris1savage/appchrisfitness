import { useState, useCallback, useEffect } from 'react'
import {
  startOfflineWorkout,
  addSetToWorkout,
  completeWorkout,
  getCurrentWorkout,
  getQueuedSets,
  syncOfflineSets
} from '../lib/offline'
import type { OfflineSet, OfflineWorkout } from '../lib/offline'

interface UseOfflineWorkoutReturn {
  currentWorkout: OfflineWorkout | null
  isLoading: boolean
  error: string | null
  startWorkout: (trainingDayId: string) => Promise<void>
  addSet: (set: Omit<OfflineSet, 'id' | 'synced'>) => Promise<void>
  finishWorkout: () => Promise<OfflineWorkout | null>
  syncSets: (supabase: any) => Promise<boolean>
  queuedSetsCount: number
}

export function useOfflineWorkout(): UseOfflineWorkoutReturn {
  const [currentWorkout, setCurrentWorkout] = useState<OfflineWorkout | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [queuedSetsCount, setQueuedSetsCount] = useState(0)

  // Load current workout on mount
  useEffect(() => {
    const loadWorkout = async () => {
      try {
        const workout = await getCurrentWorkout()
        setCurrentWorkout(workout)

        const queued = await getQueuedSets()
        setQueuedSetsCount(queued.length)
      } catch (err: any) {
        setError(err?.message || 'Failed to load workout')
      }
    }

    loadWorkout()
  }, [])

  const startWorkout = useCallback(async (trainingDayId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const workout = await startOfflineWorkout(trainingDayId)
      setCurrentWorkout(workout)
    } catch (err: any) {
      setError(err?.message || 'Failed to start workout')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const addSet = useCallback(async (set: Omit<OfflineSet, 'id' | 'synced'>) => {
    setIsLoading(true)
    setError(null)

    try {
      const fullSet: OfflineSet = {
        ...set,
        id: `set_${Date.now()}`,
        synced: false
      }

      await addSetToWorkout(fullSet)

      const updated = await getCurrentWorkout()
      setCurrentWorkout(updated)
    } catch (err: any) {
      setError(err?.message || 'Failed to add set')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const finishWorkout = useCallback(async (): Promise<OfflineWorkout | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const completed = await completeWorkout()
      setCurrentWorkout(null)

      const queued = await getQueuedSets()
      setQueuedSetsCount(queued.length)

      return completed
    } catch (err: any) {
      setError(err?.message || 'Failed to complete workout')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const syncSets = useCallback(async (supabase: any): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const success = await syncOfflineSets(
        supabase,
        (synced, total) => {
          console.log(`Synced ${synced}/${total} sets`)
        }
      )

      if (success) {
        setQueuedSetsCount(0)
      }

      return success
    } catch (err: any) {
      setError(err?.message || 'Failed to sync sets')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    currentWorkout,
    isLoading,
    error,
    startWorkout,
    addSet,
    finishWorkout,
    syncSets,
    queuedSetsCount
  }
}
