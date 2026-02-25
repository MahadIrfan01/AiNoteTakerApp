'use client'

import { useState, useEffect } from 'react'
import InvitePeopleModal from './InvitePeopleModal'
import ReminderModal from './ReminderModal'
import Logo from './Logo'

interface DashboardHeaderProps {
  title: string
}

export default function DashboardHeader({ title }: DashboardHeaderProps) {
  const [dateStr, setDateStr] = useState('')
  const [timeStr, setTimeStr] = useState('')
  const [inviteOpen, setInviteOpen] = useState(false)
  const [reminderOpen, setReminderOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    setDarkMode(document.documentElement.classList.contains('dark'))
  }, [])

  const toggleTheme = () => {
    const next = !document.documentElement.classList.contains('dark')
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
    setDarkMode(next)
  }

  useEffect(() => {
    const update = () => {
      const d = new Date()
      setDateStr(d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }))
      setTimeStr(d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }))
    }
    update()
    const id = setInterval(update, 60000)
    return () => clearInterval(id)
  }, [])

  return (
    <>
      <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shrink-0 transition-colors duration-300">
        <div className="min-w-0">
          <Logo size="sm" showWordmark />
        </div>

        <h1 className="absolute left-1/2 -translate-x-1/2 text-xl font-bold text-gray-900 dark:text-white">
          {title}
        </h1>

        <div className="flex items-center gap-4 min-w-0 justify-end">
          <div className="hidden sm:flex flex-col items-end text-sm text-gray-600 dark:text-gray-400">
            <span>{dateStr}</span>
            <span>{timeStr}</span>
          </div>
          <button
            type="button"
            onClick={() => setReminderOpen(true)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Set quiz reminder"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Invite People
          </button>
        </div>
      </header>

      <InvitePeopleModal isOpen={inviteOpen} onClose={() => setInviteOpen(false)} />
      <ReminderModal isOpen={reminderOpen} onClose={() => setReminderOpen(false)} />
    </>
  )
}
