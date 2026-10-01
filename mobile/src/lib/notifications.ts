import * as Notifications from 'expo-notifications'
import AsyncStorage from '@react-native-async-storage/async-storage'

export interface NotificationSchedule {
  id: string
  title: string
  body: string
  hour: number
  minute: number
  daysOfWeek: number[] // 0 = Sunday, 6 = Saturday
  enabled: boolean
}

const NOTIFICATIONS_KEY = '@cf_notifications_config'

/**
 * Initialize notifications
 */
export async function initializeNotifications(): Promise<void> {
  // Set notification handler
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  })

  // Request permissions
  const { status } = await Notifications.requestPermissionsAsync()
  if (status !== 'granted') {
    console.warn('Notification permissions not granted')
  }
}

/**
 * Schedule check-in reminder
 */
export async function scheduleCheckinReminder(
  title: string = 'Time for Check-in',
  body: string = 'How are you feeling today?',
  hour: number = 20,
  minute: number = 0
): Promise<string> {
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: 'default',
      badge: 1,
      data: {
        type: 'checkin'
      }
    },
    trigger: {
      hour,
      minute,
      repeats: true,
      type: 'daily'
    }
  })

  return notificationId
}

/**
 * Schedule daily notification (repeats every day at specific time)
 */
export async function scheduleDailyNotification(
  title: string,
  body: string,
  hour: number,
  minute: number,
  notificationType: string = 'daily'
): Promise<string> {
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: 'default',
      data: {
        type: notificationType
      }
    },
    trigger: {
      hour,
      minute,
      repeats: true,
      type: 'daily'
    }
  })

  return notificationId
}

/**
 * Cancel notification by ID
 */
export async function cancelNotification(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId)
}

/**
 * Cancel all notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  const notifications = await Notifications.getAllScheduledNotificationsAsync()
  for (const notification of notifications) {
    await Notifications.cancelScheduledNotificationAsync(notification.identifier)
  }
}

/**
 * Get all scheduled notifications
 */
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  return await Notifications.getAllScheduledNotificationsAsync()
}

/**
 * Save notification preferences
 */
export async function saveNotificationPreferences(
  preferences: Record<string, boolean>
): Promise<void> {
  await AsyncStorage.setItem(
    NOTIFICATIONS_KEY,
    JSON.stringify(preferences)
  )
}

/**
 * Get notification preferences
 */
export async function getNotificationPreferences(): Promise<Record<string, boolean>> {
  const prefs = await AsyncStorage.getItem(NOTIFICATIONS_KEY)
  return prefs
    ? JSON.parse(prefs)
    : {
        checkin: true,
        workout: true,
        nutrition: true,
        measurements: true
      }
}

/**
 * Setup default notifications for new user
 */
export async function setupDefaultNotifications(): Promise<void> {
  try {
    await initializeNotifications()

    // Morning check-in reminder (9 AM)
    await scheduleCheckinReminder(
      '🌅 Good Morning!',
      'How are you feeling today? Time for your check-in.',
      9,
      0
    )

    // Evening workout reminder (6 PM)
    await scheduleDailyNotification(
      '💪 Time to Train',
      "It's time for your workout. Let's go!",
      18,
      0,
      'workout'
    )

    // Night nutrition reminder (8 PM)
    await scheduleDailyNotification(
      '🥗 Nutrition Update',
      "Don't forget to log your meals today",
      20,
      0,
      'nutrition'
    )

    // Save preferences
    await saveNotificationPreferences({
      checkin: true,
      workout: true,
      nutrition: true,
      measurements: false
    })
  } catch (error) {
    console.error('Error setting up default notifications:', error)
  }
}

/**
 * Handle notification response (when user taps notification)
 */
export function handleNotificationResponse(
  response: Notifications.NotificationResponse
): void {
  const { notification } = response
  const type = notification.request.content.data?.type

  switch (type) {
    case 'checkin':
      // Navigate to check-in screen
      console.log('Navigate to check-in')
      break
    case 'workout':
      // Navigate to training screen
      console.log('Navigate to training')
      break
    case 'nutrition':
      // Navigate to nutrition screen
      console.log('Navigate to nutrition')
      break
    default:
      console.log('Unknown notification type:', type)
  }
}

/**
 * Listen for notification responses
 */
export function listenForNotificationResponses(
  callback: (response: Notifications.NotificationResponse) => void
): () => void {
  const subscription = Notifications.addNotificationResponseReceivedListener(callback)
  return () => subscription.remove()
}

/**
 * Listen for notifications received while app is in foreground
 */
export function listenForIncomingNotifications(
  callback: (notification: Notifications.Notification) => void
): () => void {
  const subscription = Notifications.addNotificationReceivedListener(callback)
  return () => subscription.remove()
}
