'use client'

import { useState, useEffect } from 'react'
import { Note, QuizQuestion } from '@/lib/supabase'

type Difficulty = 'easy' | 'medium' | 'hard'

interface QuizGeneratorProps {
  isOpen: boolean
  onClose: () => void
  classId: string
  notes: Note[]
}

export default function QuizGenerator({ isOpen, onClose, classId, notes }: QuizGeneratorProps) {
  const [quiz, setQuiz] = useState<QuizQuestion[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({})
  const [showResults, setShowResults] = useState(false)
  const [timeLimit, setTimeLimit] = useState(10)
  const [numQuestions, setNumQuestions] = useState(5)
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [timeUp, setTimeUp] = useState(false)

  // Countdown timer (must run before early return - hooks rules)
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return
    const id = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          setTimeUp(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [timeRemaining !== null && timeRemaining > 0])

  useEffect(() => {
    if (timeUp && quiz.length > 0) {
      setShowResults(true)
    }
  }, [timeUp, quiz.length])

  if (!isOpen) return null

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const handleGenerateQuiz = async () => {
    if (notes.length === 0) {
      alert('Please add some notes first before generating a quiz.')
      return
    }

    const q = Math.floor(Number(numQuestions)) || 5
    const t = Math.floor(Number(timeLimit))
    if (q < 1 || q > 20) {
      alert('Number of questions must be between 1 and 20.')
      return
    }
    if (isNaN(t) || t < 1) {
      alert('Time limit must be at least 1 minute. Please enter 1 or more.')
      return
    }

    setIsGenerating(true)
    setShowResults(false)
    setSelectedAnswers({})
    setTimeUp(false)
    setTimeRemaining(null)

    try {
      const allNotes = notes.map(n => n.content).join('\n\n')
      
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: allNotes,
          numQuestions: q,
          difficulty,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate quiz')
      }

      const data = await response.json()
      const questions = data.questions || []
      setQuiz(questions)
      setTimeRemaining(t * 60)
    } catch (error) {
      console.error('Error generating quiz:', error)
      alert('Failed to generate quiz. Please make sure you have set up your Gemini API key.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: answerIndex,
    })
  }

  const calculateScore = () => {
    let correct = 0
    quiz.forEach((q, index) => {
      if (selectedAnswers[index] === q.correct_answer) {
        correct++
      }
    })
    return { correct, total: quiz.length }
  }

  const score = quiz.length > 0 ? calculateScore() : { correct: 0, total: 0 }

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full p-6 mt-8 mb-8 border border-gray-200 dark:border-gray-700 transition-colors duration-300 shrink-0">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Generate Quiz</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {quiz.length === 0 && !isGenerating && (
          <div className="space-y-6">
            <p className="text-gray-600 dark:text-gray-400">
              Generate a quiz based on your notes using AI
            </p>
            <div className="space-y-4">
              <div>
                <label htmlFor="numQuestions" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Number of questions (1–20)
                </label>
                <input
                  id="numQuestions"
                  type="number"
                  min={1}
                  max={20}
                  value={numQuestions}
                  onChange={(e) => {
                    const raw = e.target.value
                    if (raw === '') setNumQuestions(1)
                    else {
                      const v = parseInt(raw, 10)
                      if (!isNaN(v)) {
                        if (v < 1) setNumQuestions(1)
                        else if (v > 20) setNumQuestions(20)
                        else setNumQuestions(v)
                      }
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Time limit (minutes)
                </label>
                <input
                  id="timeLimit"
                  type="number"
                  min={0}
                  value={timeLimit}
                  onChange={(e) => {
                    const raw = e.target.value
                    if (raw === '') setTimeLimit(0)
                    else {
                      const v = parseInt(raw, 10)
                      if (!isNaN(v) && v >= 0) setTimeLimit(v)
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Difficulty
                </label>
                <div className="flex gap-2">
                  {(['easy', 'medium', 'hard'] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDifficulty(d)}
                      className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                        difficulty === d
                          ? 'bg-indigo-600 dark:bg-indigo-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={handleGenerateQuiz}
              className="w-full px-6 py-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors font-medium"
            >
              Generate Quiz
            </button>
          </div>
        )}

        {isGenerating && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Generating quiz from your notes...</p>
          </div>
        )}

        {quiz.length > 0 && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <p className="text-gray-600 dark:text-gray-400">
                {quiz.length} {quiz.length === 1 ? 'question' : 'questions'}
              </p>
              {!showResults && timeRemaining !== null && (
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono font-semibold ${
                  timeUp ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' :
                  timeRemaining <= 60 ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200' :
                  'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {timeUp ? "Time's up!" : formatTime(timeRemaining)}
                </div>
              )}
              {showResults && (
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  Score: {score.correct}/{score.total}
                </div>
              )}
              <div className="flex gap-2">
                {!showResults && Object.keys(selectedAnswers).length === quiz.length && (
                  <button
                    onClick={() => setShowResults(true)}
                    className="px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors text-sm"
                  >
                    Check Answers
                  </button>
                )}
                <button
                  onClick={handleGenerateQuiz}
                  className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors text-sm"
                  disabled={isGenerating}
                >
                  Regenerate
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {quiz.map((question, qIndex) => {
                const isCorrect = selectedAnswers[qIndex] === question.correct_answer
                const showAnswer = showResults

                return (
                  <div
                    key={qIndex}
                    className={`border rounded-lg p-4 transition-colors ${
                      showAnswer
                        ? isCorrect
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/30 dark:border-green-700'
                          : 'border-red-500 bg-red-50 dark:bg-red-900/30 dark:border-red-700'
                        : 'border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                      {qIndex + 1}. {question.question}
                    </h3>
                    <div className="space-y-2">
                      {question.options.map((option, oIndex) => {
                        const isSelected = selectedAnswers[qIndex] === oIndex
                        const isCorrectOption = oIndex === question.correct_answer

                        return (
                          <label
                            key={oIndex}
                            className={`block p-3 rounded-lg border cursor-pointer transition-colors ${
                              showAnswer && isCorrectOption
                                ? 'bg-green-100 dark:bg-green-900/40 border-green-500 dark:border-green-600 text-gray-900 dark:text-white'
                                : showAnswer && isSelected && !isCorrect
                                ? 'bg-red-100 dark:bg-red-900/40 border-red-500 dark:border-red-600 text-gray-900 dark:text-white'
                                : isSelected
                                ? 'bg-primary-50 dark:bg-indigo-900/30 border-primary-500 dark:border-indigo-600 text-gray-900 dark:text-white'
                                : 'bg-gray-50 dark:bg-gray-700/80 border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-indigo-500 text-gray-900 dark:text-gray-200'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`question-${qIndex}`}
                              value={oIndex}
                              checked={isSelected}
                              onChange={() => handleAnswerSelect(qIndex, oIndex)}
                              disabled={showResults}
                              className="mr-2"
                            />
                            {option}
                          </label>
                        )
                      })}
                    </div>
                    {showAnswer && question.explanation && (
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-gray-700 dark:text-gray-200">
                          <strong>Explanation:</strong> {question.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
