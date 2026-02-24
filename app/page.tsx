'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import DashboardHeader from '@/components/DashboardHeader'
import HomePage from '@/components/HomePage'
import ClassesPage from '@/components/ClassesPage'
import QuizHistoryPage from '@/components/QuizHistoryPage'
import AnalyticsPage from '@/components/AnalyticsPage'
import AITutorPage from '@/components/AITutorPage'
import ProfilePage from '@/components/ProfilePage'

const PAGE_TITLES: Record<string, string> = {
  home: 'Dashboard',
  classes: 'My Classes',
  'quiz-history': 'Quiz History',
  analytics: 'Analytics',
  'ai-tutor': 'AI Tutor',
  profile: 'Profile',
}

export default function Home() {
  const [currentPage, setCurrentPage] = useState('home')
  const [classCount, setClassCount] = useState(0)
  const [quizCount, setQuizCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCounts() {
      try {
        const [classesRes, quizzesRes] = await Promise.all([
          supabase.from('classes').select('*', { count: 'exact', head: true }),
          supabase.from('quiz_results').select('*', { count: 'exact', head: true }),
        ])
        setClassCount(classesRes.count ?? 0)
        setQuizCount(quizzesRes.count ?? 0)
      } catch {
        setClassCount(0)
        setQuizCount(0)
      } finally {
        setLoading(false)
      }
    }
    fetchCounts()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

      <div className="flex-1 flex flex-col pl-64 min-h-screen">
        <DashboardHeader title={PAGE_TITLES[currentPage] ?? 'Dashboard'} />

        <main className="flex-1 overflow-auto">
          {currentPage === 'home' && (
            <HomePage
              onNavigate={setCurrentPage}
              classCount={classCount}
              quizCount={quizCount}
            />
          )}
          {currentPage === 'classes' && <ClassesPage />}
          {currentPage === 'quiz-history' && <QuizHistoryPage />}
          {currentPage === 'analytics' && <AnalyticsPage />}
          {currentPage === 'ai-tutor' && <AITutorPage />}
          {currentPage === 'profile' && <ProfilePage onLogout={handleLogout} />}
        </main>
      </div>
    </div>
  )
}
