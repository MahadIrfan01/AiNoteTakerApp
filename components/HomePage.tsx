'use client'

interface HomePageProps {
  onNavigate: (page: string) => void
  classCount: number
  quizCount: number
}

export default function HomePage({ onNavigate, classCount, quizCount }: HomePageProps) {
  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? 'morning' : currentHour < 18 ? 'afternoon' : 'evening'
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  return (
    <div className="p-8 max-w-7xl mx-auto transition-colors duration-300">
      {/* Greeting Section - left aligned */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
          Good {greeting}
        </h1>
        <p className="text-gray-600 dark:text-gray-200 text-lg transition-colors duration-300">
          Ready to start today's learning session?
        </p>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 transition-colors duration-300">
          {currentDate}
        </p>
      </div>

      {/* About Section - clean card; darker card for contrast in dark mode */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 mb-8 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">About Noteify</h2>
        <p className="text-gray-700 dark:text-gray-200 leading-relaxed mb-6 transition-colors duration-300">
          Noteify is your intelligent study companion that helps you organize your classes, take notes,
          and generate AI-powered quizzes to test your knowledge. Our platform uses advanced AI technology
          to transform your notes into interactive learning experiences.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700/80 rounded-lg p-4 border-l-4 border-indigo-500 transition-colors duration-300">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Organize Notes</h3>
            <p className="text-sm text-gray-600 dark:text-gray-200 transition-colors duration-300">Keep your study materials organized by class and topic.</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/80 rounded-lg p-4 border-l-4 border-purple-500 transition-colors duration-300">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">AI-Powered Quizzes</h3>
            <p className="text-sm text-gray-600 dark:text-gray-200 transition-colors duration-300">Generate custom quizzes from your notes instantly.</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/80 rounded-lg p-4 border-l-4 border-red-400 transition-colors duration-300">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Track Progress</h3>
            <p className="text-sm text-gray-600 dark:text-gray-200 transition-colors duration-300">Monitor your learning journey with detailed analytics.</p>
          </div>
        </div>
      </div>

      {/* Quick Stats - distinct card background in dark mode */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-1 transition-colors duration-300">Total Classes</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">{classCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-1 transition-colors duration-300">Quizzes Taken</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">{quizCount}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Quick Actions</h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => onNavigate('classes')}
            className="px-5 py-3 bg-gray-100 dark:bg-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-300 font-medium text-gray-900"
          >
            Create New Class
          </button>
          <button
            onClick={() => onNavigate('quiz-history')}
            className="px-5 py-3 bg-gray-100 dark:bg-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-300 font-medium text-gray-900"
          >
            View Quiz History
          </button>
        </div>
      </div>
    </div>
  )
}
