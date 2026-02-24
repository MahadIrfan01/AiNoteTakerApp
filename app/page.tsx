'use client'

import { useState, useEffect } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import AuthPage from '@/components/AuthPage'
import Sidebar from '@/components/Sidebar'
import DashboardHeader from '@/components/DashboardHeader'
import HomePage from '@/components/HomePage'
import ClassesPage from '@/components/ClassesPage'
import QuizHistoryPage from '@/components/QuizHistoryPage'
import AnalyticsPage from '@/components/AnalyticsPage'
import AITutorPage from '@/components/AITutorPage'
import ProfilePage from '@/components/ProfilePage'
import SettingsPage from '@/components/SettingsPage'

const PAGE_TITLES: Record<string, string> = {
  home: 'Dashboard',
  classes: 'My Classes',
  'quiz-history': 'Quiz History',
  analytics: 'Analytics',
  'ai-tutor': 'AI Tutor',
  profile: 'Profile',
  settings: 'Settings',
}

export default function Home() {
  const [session, setSession] = useState<Session | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState('home')
  const [classCount, setClassCount] = useState(0)
  const [quizCount, setQuizCount] = useState(0)
  const [countsLoading, setCountsLoading] = useState(true)

  // Auth state: check session and subscribe to changes (login, logout, email confirmation)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      setAuthLoading(false)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Fetch dashboard counts only when authenticated
  useEffect(() => {
    if (!session) {
      setCountsLoading(false)
      return
    }
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
        setCountsLoading(false)
      }
    }
    fetchCounts()
  }, [session])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setCurrentPage('home')
    // Session is cleared by onAuthStateChange; we'll show AuthPage
  }

  // Still determining auth state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    )
  }

  // Not signed in: show login / sign up (with email verification handled by Supabase)
  if (!session) {
    return <AuthPage onAuthSuccess={() => {}} />
  }

  // Signed in: show dashboard
  const loading = countsLoading
  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

      <div className="flex-1 flex flex-col pl-64 min-h-screen">
        <DashboardHeader title={PAGE_TITLES[currentPage] ?? 'Dashboard'} />

        <main className="flex-1 overflow-auto">
          {loading ? (
            <div className="p-8 flex items-center justify-center min-h-[200px]">
              <div className="text-gray-600 dark:text-gray-400">Loading...</div>
            </div>
          ) : (
            <>
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
              {currentPage === 'settings' && <SettingsPage onNavigate={setCurrentPage} />}
            </>
          )}
        </main>
      </div>
    </div>
  )
}
