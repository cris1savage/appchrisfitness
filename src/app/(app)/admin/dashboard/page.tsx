'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { redirect } from 'next/navigation'

interface CoachStats {
  totalClients: number
  activeWorkouts: number
  completedThisWeek: number
  adherenceRate: number
  topClients: Array<{
    name: string
    workoutsDone: number
    adherence: number
  }>
}

export default function CoachDashboard() {
  const [stats, setStats] = useState<CoachStats>({
    totalClients: 0,
    activeWorkouts: 0,
    completedThisWeek: 0,
    adherenceRate: 0,
    topClients: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          redirect('/login')
        }

        // Get clients count
        const { data: clientsData, count: clientsCount } = await supabase
          .from('clients')
          .select('id', { count: 'exact' })
          .eq('coach_id', user.id)

        // Get this week's completed exercises
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        const { count: completedCount } = await supabase
          .from('exercise_logs')
          .select('id', { count: 'exact' })
          .gte('created_at', weekAgo)

        setStats(prev => ({
          ...prev,
          totalClients: clientsCount || 0,
          activeWorkouts: Math.floor(Math.random() * 10), // Placeholder
          completedThisWeek: completedCount || 0,
          adherenceRate: Math.floor(Math.random() * 40) + 60, // 60-100%
          topClients: [
            { name: 'Carlos', workoutsDone: 5, adherence: 100 },
            { name: 'María', workoutsDone: 4, adherence: 80 },
            { name: 'Juan', workoutsDone: 3, adherence: 60 }
          ]
        }))
      } catch (error) {
        console.error('Error loading dashboard:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [supabase])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Resumen del rendimiento de tus clientes</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Clients */}
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Clientes Totales</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalClients}</p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>

          {/* Active Workouts */}
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Entrenamientos Activos</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeWorkouts}</p>
              </div>
              <div className="text-4xl">💪</div>
            </div>
          </div>

          {/* Completed This Week */}
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Completados Esta Semana</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.completedThisWeek}</p>
              </div>
              <div className="text-4xl">✓</div>
            </div>
          </div>

          {/* Adherence Rate */}
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Tasa de Adherencia</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.adherenceRate}%</p>
              </div>
              <div className="text-4xl">📈</div>
            </div>
          </div>
        </div>

        {/* Top Clients */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Clientes Destacados</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {stats.topClients.map((client, idx) => (
              <div key={idx} className="p-6 flex items-center justify-between hover:bg-gray-50 transition">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{client.name}</p>
                    <p className="text-sm text-gray-600">{client.workoutsDone} entrenamientos</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{client.adherence}%</p>
                  <p className="text-xs text-gray-500">adherencia</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Actividad Reciente</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0">
                <div className="w-2 h-2 bg-blue-600 rounded-full" />
                <p className="text-sm text-gray-600">Cliente completó un entrenamiento</p>
                <p className="text-xs text-gray-400 ml-auto">Hace {i} horas</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
