'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'

interface DashboardStats {
  tasksCompleted: number
  totalTasks: number
  nextWorkout: string | null
  streakinDays: number
  recentActivity: Array<{
    date: string
    type: string
    title: string
  }>
}

export default function ClientDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    tasksCompleted: 0,
    totalTasks: 0,
    nextWorkout: null,
    streakinDays: 0,
    recentActivity: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const loadStats = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Get client data
        const { data: clientData } = await supabase
          .from('clients')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (!clientData) {
          setIsLoading(false)
          return
        }

        // Get training blocks
        const { data: trainingBlocks } = await supabase
          .from('training_blocks')
          .select('*')
          .eq('client_id', clientData.id)
          .order('created_at', { ascending: false })
          .limit(1)

        setStats(prev => ({
          ...prev,
          nextWorkout: trainingBlocks?.[0]?.name || 'No active training block',
          streakinDays: Math.floor(Math.random() * 14) // Placeholder
        }))
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [supabase])

  const today = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 p-4 pb-20">
      {/* Header */}
      <div className="text-white mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center font-bold text-lg">
            CF
          </div>
          <button className="text-white">🔔 💬</button>
        </div>

        <div className="text-sm opacity-75 mb-2">{today.toUpperCase()}</div>
        <h1 className="text-3xl font-bold mb-1">Hola Christian</h1>
      </div>

      {/* Main Content Card */}
      <div className="space-y-4">
        {/* Tareas Card */}
        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Tareas</h2>
            <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              {stats.tasksCompleted}/{stats.totalTasks} Completado
            </span>
          </div>

          <div className="space-y-3">
            {/* Next Workout */}
            <Link href="/entrenamientos/actual" className="block">
              <div className="flex items-center gap-4 p-4 bg-blue-600 rounded-2xl text-white hover:bg-blue-700 transition cursor-pointer">
                <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center text-xl flex-shrink-0">
                  💪
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{stats.nextWorkout}</p>
                  <p className="text-xs opacity-90">Hoy</p>
                </div>
              </div>
            </Link>

            {/* Steps Goal */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl flex-shrink-0">
                👟
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900">8.000 Pasos</p>
                <p className="text-xs text-gray-500">1 de 4 esta semana</p>
              </div>
            </div>
          </div>
        </div>

        {/* Challenges Card */}
        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">🏆 Desafíos</h2>
          <div className="bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl p-4 text-white">
            <p className="font-bold text-lg mb-2">Focus 200%</p>
            <p className="text-xs opacity-90 mb-3">Total de entrenamientos completados</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-6 h-6 bg-white opacity-30 rounded-full" />
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/entrenamientos" className="bg-white rounded-2xl p-4 text-center hover:shadow-lg transition">
            <div className="text-2xl mb-2">📅</div>
            <p className="text-sm font-medium text-gray-900">Entrenamientos</p>
          </Link>
          <Link href="/nutricion" className="bg-white rounded-2xl p-4 text-center hover:shadow-lg transition">
            <div className="text-2xl mb-2">🥗</div>
            <p className="text-sm font-medium text-gray-900">Nutrición</p>
          </Link>
          <Link href="/progreso" className="bg-white rounded-2xl p-4 text-center hover:shadow-lg transition">
            <div className="text-2xl mb-2">📊</div>
            <p className="text-sm font-medium text-gray-900">Progreso</p>
          </Link>
          <Link href="/perfil" className="bg-white rounded-2xl p-4 text-center hover:shadow-lg transition">
            <div className="text-2xl mb-2">👤</div>
            <p className="text-sm font-medium text-gray-900">Perfil</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
