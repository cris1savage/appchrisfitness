import AsyncStorage from '@react-native-async-storage/async-storage'

export interface OfflineSet {
  id: string
  exerciseId: string
  exerciseName: string
  set: number
  weight?: number
  reps: number
  timestamp: number
  synced: boolean
}

export interface OfflineWorkout {
  id: string
  trainingDayId: string
  sets: OfflineSet[]
  startedAt: number
  completedAt?: number
  synced: boolean
}

const OFFLINE_QUEUE_KEY = '@cf_offline_queue'
const OFFLINE_WORKOUT_KEY = '@cf_current_workout'

/**
 * Queue an exercise set for offline use
 */
export async function queueExerciseSet(set: OfflineSet): Promise<void> {
  try {
    const queue = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY)
    const sets: OfflineSet[] = queue ? JSON.parse(queue) : []
    sets.push({ ...set, synced: false })
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(sets))
  } catch (error) {
    console.error('Error queueing exercise set:', error)
    throw error
  }
}

/**
 * Get all queued exercise sets
 */
export async function getQueuedSets(): Promise<OfflineSet[]> {
  try {
    const queue = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY)
    return queue ? JSON.parse(queue) : []
  } catch (error) {
    console.error('Error getting queued sets:', error)
    return []
  }
}

/**
 * Clear synced sets from the queue
 */
export async function clearSyncedSets(): Promise<void> {
  try {
    const queue = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY)
    if (!queue) return

    const sets: OfflineSet[] = JSON.parse(queue)
    const unsyncedSets = sets.filter(s => !s.synced)

    if (unsyncedSets.length === 0) {
      await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY)
    } else {
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(unsyncedSets))
    }
  } catch (error) {
    console.error('Error clearing synced sets:', error)
  }
}

/**
 * Start an offline workout session
 */
export async function startOfflineWorkout(trainingDayId: string): Promise<OfflineWorkout> {
  const workout: OfflineWorkout = {
    id: `workout_${Date.now()}`,
    trainingDayId,
    sets: [],
    startedAt: Date.now(),
    synced: false
  }

  try {
    await AsyncStorage.setItem(OFFLINE_WORKOUT_KEY, JSON.stringify(workout))
  } catch (error) {
    console.error('Error starting offline workout:', error)
  }

  return workout
}

/**
 * Get current offline workout
 */
export async function getCurrentWorkout(): Promise<OfflineWorkout | null> {
  try {
    const workout = await AsyncStorage.getItem(OFFLINE_WORKOUT_KEY)
    return workout ? JSON.parse(workout) : null
  } catch (error) {
    console.error('Error getting current workout:', error)
    return null
  }
}

/**
 * Add set to current workout
 */
export async function addSetToWorkout(set: OfflineSet): Promise<void> {
  try {
    const workout = await getCurrentWorkout()
    if (!workout) {
      await queueExerciseSet(set)
      return
    }

    workout.sets.push(set)
    await AsyncStorage.setItem(OFFLINE_WORKOUT_KEY, JSON.stringify(workout))
  } catch (error) {
    console.error('Error adding set to workout:', error)
  }
}

/**
 * Complete current workout
 */
export async function completeWorkout(): Promise<OfflineWorkout | null> {
  try {
    const workout = await getCurrentWorkout()
    if (!workout) return null

    workout.completedAt = Date.now()

    // Queue all sets
    for (const set of workout.sets) {
      await queueExerciseSet(set)
    }

    await AsyncStorage.removeItem(OFFLINE_WORKOUT_KEY)
    return workout
  } catch (error) {
    console.error('Error completing workout:', error)
    return null
  }
}

/**
 * Sync all queued sets with the server
 */
export async function syncOfflineSets(
  supabase: any,
  onProgress?: (synced: number, total: number) => void
): Promise<boolean> {
  try {
    const sets = await getQueuedSets()
    if (sets.length === 0) return true

    let synced = 0

    for (const set of sets) {
      try {
        // Insert exercise log to Supabase
        const { error } = await supabase
          .from('exercise_logs')
          .insert({
            client_id: set.id, // This would need the actual client_id
            exercise_id: set.exerciseId,
            weight: set.weight,
            reps: set.reps,
            set_number: set.set,
            created_at: new Date(set.timestamp).toISOString()
          })

        if (!error) {
          set.synced = true
          synced++
        }
      } catch (error) {
        console.error(`Error syncing set ${set.id}:`, error)
      }

      onProgress?.(synced, sets.length)
    }

    await clearSyncedSets()
    return synced === sets.length
  } catch (error) {
    console.error('Error syncing offline sets:', error)
    return false
  }
}
