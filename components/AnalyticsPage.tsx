'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface AnalyticsData {
  totalClasses: number
  totalNotes: number
  totalQuizzes: number
  averageScore: number
  recentActivity: {
    date: string
    quizzesTaken: number
  }[]
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalClasses: 0,
    totalNotes: 0,
    totalQuizzes: 0,
    averageScore: 0,
    recentActivity: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const [classesRes, notesRes, quizzesRes] = await Promise.all([
        supabase.from('classes').select('*', { count: 'exact' }),
        supabase.from('notes').select('*', { count: 'exact' }),
        supabase.from('quiz_results').select('*'),
      ])

      const totalQuizzes = quizzesRes.data?.length || 0
      const averageScore =
        totalQuizzes > 0
          ? quizzesRes.data!.reduce((sum, quiz) => sum + (quiz.score / quiz.total_questions) * 100, 0) / totalQuizzes
          : 0

      setAnalytics({
        totalClasses: classesRes.count || 0,
        totalNotes: notesRes.count || 0,
        totalQuizzes,
        averageScore: Math.round(averageScore),
        recentActivity: [],
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600 dark:text-gray-300">Loading analytics...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto transition-colors duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Analytics</h1>
        <p className="text-gray-600 dark:text-gray-300">Track your learning progress and performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-1">Total Classes</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{analytics.totalClasses}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-1">Total Notes</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{analytics.totalNotes}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-1">Quizzes Taken</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{analytics.totalQuizzes}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-1">Average Score</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{analytics.averageScore}%</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Performance Overview</h2>
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p>Detailed charts and graphs coming soon!</p>
        </div>
      </div>
    </div>
  )
}
