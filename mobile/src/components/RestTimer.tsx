import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Vibration,
  Dimensions,
  Platform
} from 'react-native'

interface RestTimerProps {
  duration: number // seconds
  onComplete: () => void
  autoStart?: boolean
}

export function RestTimer({ duration, onComplete, autoStart = true }: RestTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const [isRunning, setIsRunning] = useState(autoStart)
  const [isCompleted, setIsCompleted] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (!isRunning || isCompleted) return

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsRunning(false)
          setIsCompleted(true)

          // Vibration feedback
          if (Platform.OS === 'android') {
            Vibration.vibrate([0, 50, 100, 50])
          } else {
            Vibration.vibrate()
          }

          onComplete()
          return 0
        }

        // Vibrate at 10s, 5s, 3s, 2s, 1s
        if ([10, 5, 3, 2, 1].includes(prev - 1)) {
          Vibration.vibrate(Platform.OS === 'android' ? 30 : 50)
        }

        return prev - 1
      })
    }, 1000)

    return () => clearInterval(intervalRef.current)
  }, [isRunning, isCompleted, onComplete])

  const percentage = ((duration - timeLeft) / duration) * 100
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  const handlePlayPause = () => {
    setIsRunning(!isRunning)
  }

  const handleReset = () => {
    setIsRunning(false)
    setTimeLeft(duration)
    setIsCompleted(false)
  }

  const handleAddTime = (seconds: number) => {
    setTimeLeft(prev => prev + seconds)
  }

  return (
    <View style={styles.container}>
      {/* Circle Progress */}
      <View style={styles.circleContainer}>
        <View
          style={[
            styles.circle,
            {
              backgroundColor: isCompleted ? '#10B981' : '#3B82F6'
            }
          ]}
        >
          <View
            style={[
              styles.progressRing,
              {
                transform: [{ rotate: `${(percentage / 100) * 360}deg` }]
              }
            ]}
          />
          <View style={styles.innerCircle}>
            <Text style={styles.timeText}>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </Text>
            <Text style={styles.labelText}>
              {isCompleted ? '✓ Done' : 'Rest'}
            </Text>
          </View>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleReset}
        >
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handlePlayPause}
        >
          <Text style={styles.buttonText}>
            {isRunning ? '⏸ Pause' : '▶ Start'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => handleAddTime(15)}
        >
          <Text style={styles.buttonText}>+15s</Text>
        </TouchableOpacity>
      </View>

      {/* Quick actions */}
      {!isCompleted && (
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickButton}
            onPress={() => setTimeLeft(30)}
          >
            <Text style={styles.quickButtonText}>30s</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickButton}
            onPress={() => setTimeLeft(60)}
          >
            <Text style={styles.quickButtonText}>1m</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickButton}
            onPress={() => setTimeLeft(90)}
          >
            <Text style={styles.quickButtonText}>1:30m</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickButton}
            onPress={() => setTimeLeft(120)}
          >
            <Text style={styles.quickButtonText}>2m</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
    gap: 20
  },
  circleContainer: {
    width: '100%',
    aspectRatio: 1,
    maxWidth: 300,
    justifyContent: 'center',
    alignItems: 'center'
  },
  circle: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  progressRing: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 9999,
    borderWidth: 8,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderTopColor: 'white',
    borderRightColor: 'white'
  },
  innerCircle: {
    width: '90%',
    height: '90%',
    borderRadius: 9999,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1
  },
  timeText: {
    fontSize: 56,
    fontWeight: '700',
    color: '#1F2937',
    fontFamily: 'monospace'
  },
  labelText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    fontWeight: '600'
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
    width: '100%'
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    flex: 1.2
  },
  secondaryButton: {
    backgroundColor: '#E5E7EB',
    borderWidth: 1,
    borderColor: '#D1D5DB'
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937'
  },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    justifyContent: 'space-between'
  },
  quickButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center'
  },
  quickButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E40AF'
  }
})
