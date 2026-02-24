'use client'

interface SettingsPageProps {
  onNavigate: (page: string) => void
}

export default function SettingsPage({ onNavigate }: SettingsPageProps) {
  return (
    <div className="p-8 max-w-2xl mx-auto transition-colors duration-300">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h2>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
        <button
          type="button"
          onClick={() => onNavigate('profile')}
          className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-300"
        >
          <span className="font-medium text-gray-900 dark:text-white">Account</span>
          <span className="text-gray-400 dark:text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </button>
        <div className="px-6 py-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">More settings options can be added here.</p>
        </div>
      </div>
    </div>
  )
}
