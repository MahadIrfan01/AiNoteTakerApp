'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import HomePage from '@/components/HomePage'
import ClassesPage from '@/components/ClassesPage'
import QuizHistoryPage from '@/components/QuizHistoryPage'
import AnalyticsPage from '@/components/AnalyticsPage'
import AITutorPage from '@/components/AITutorPage'
import ProfilePage from '@/components/ProfilePage'
import AuthPage from '@/components/AuthPage'
import InvitePeopleModal from '@/components/InvitePeopleModal'
import ReminderModal from '@/components/ReminderModal'

export default function Home() {
  const [currentPage, setCurrentPage] = useState('home')
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false)
  const [stats, setStats] = useState({
    classCount: 0,
    quizCount: 0,
  })

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats()
    }
  }, [currentPage, isAuthenticated])

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      setIsAuthenticated(!!session)
      
      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setIsAuthenticated(!!session)
      })

      return () => subscription.unsubscribe()
    } catch (error) {
      console.error('Error checking auth:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAuthSuccess = () => {
    setIsAuthenticated(true)
    setCurrentPage('home')
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setCurrentPage('home')
  }

  const fetchStats = async () => {
    try {
      const [classesRes, quizzesRes] = await Promise.all([
        supabase.from('classes').select('*', { count: 'exact' }),
        supabase.from('quiz_results').select('*', { count: 'exact' }),
      ])

      setStats({
        classCount: classesRes.count || 0,
        quizCount: quizzesRes.count || 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage
            onNavigate={setCurrentPage}
            classCount={stats.classCount}
            quizCount={stats.quizCount}
          />
        )
      case 'classes':
        return <ClassesPage />
      case 'quiz-history':
        return <QuizHistoryPage />
      case 'analytics':
        return <AnalyticsPage />
      case 'ai-tutor':
        return <AITutorPage />
      case 'profile':
        return <ProfilePage onLogout={handleLogout} />
      default:
        return (
          <HomePage
            onNavigate={setCurrentPage}
            classCount={stats.classCount}
            quizCount={stats.quizCount}
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-1 ml-64">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {currentPage === 'home' && 'Dashboard'}
              {currentPage === 'classes' && 'My Classes'}
              {currentPage === 'quiz-history' && 'Quiz History'}
              {currentPage === 'analytics' && 'Analytics'}
              {currentPage === 'ai-tutor' && 'AI Tutor'}
              {currentPage === 'profile' && 'Profile'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <button 
              onClick={() => setIsReminderModalOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Set Quiz Reminder"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <button 
              onClick={() => setIsInviteModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Invite People
            </button>
          </div>
        </div>
        <div className="min-h-screen">
          {renderPage()}
        </div>
      </main>
      
      <InvitePeopleModal 
        isOpen={isInviteModalOpen} 
        onClose={() => setIsInviteModalOpen(false)} 
      />
      
      <ReminderModal 
        isOpen={isReminderModalOpen} 
        onClose={() => setIsReminderModalOpen(false)} 
      />
    </div>
  )
}
