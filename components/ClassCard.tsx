'use client'

import { useState, useEffect } from 'react'
import { supabase, Class, Note } from '@/lib/supabase'
import NoteEditor from './NoteEditor'
import QuizGenerator from './QuizGenerator'

interface ClassCardProps {
  classItem: Class
  onDelete: (id: string) => void
}

export default function ClassCard({ classItem, onDelete }: ClassCardProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false)
  const [isQuizOpen, setIsQuizOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotes()
  }, [classItem.id])

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('class_id', classItem.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setNotes(data || [])
    } catch (error) {
      console.error('Error fetching notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddNote = async (content: string) => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([{ class_id: classItem.id, content }])
        .select()
        .single()

      if (error) throw error
      setNotes([data, ...notes])
      setIsNoteEditorOpen(false)
    } catch (error) {
      console.error('Error adding note:', error)
      alert('Failed to add note. Please try again.')
    }
  }

  const handleDeleteNote = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note?')) {
      return
    }

    try {
      const { error } = await supabase.from('notes').delete().eq('id', id)
      if (error) throw error
      setNotes(notes.filter(n => n.id !== id))
    } catch (error) {
      console.error('Error deleting note:', error)
      alert('Failed to delete note. Please try again.')
    }
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{classItem.name}</h2>
          <button
            onClick={() => onDelete(classItem.id)}
            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
            title="Delete class"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            {notes.length} {notes.length === 1 ? 'note' : 'notes'}
          </p>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => setIsNoteEditorOpen(true)}
            className="w-full px-4 py-2 bg-primary-600 dark:bg-blue-600 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-blue-700 transition-colors duration-300 text-sm font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Note
          </button>

          {notes.length > 0 && (
            <>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Notes:</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      className="bg-gray-50 dark:bg-gray-700/80 rounded-lg p-3 text-sm text-gray-700 dark:text-gray-200 relative group transition-colors duration-300"
                    >
                      <p className="pr-8 break-words">{note.content}</p>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="absolute top-2 right-2 text-red-400 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete note"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setIsQuizOpen(true)}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-300 text-sm font-medium flex items-center justify-center gap-2 mt-3"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Generate Quiz
              </button>
            </>
          )}
        </div>
      </div>

      <NoteEditor
        isOpen={isNoteEditorOpen}
        onClose={() => setIsNoteEditorOpen(false)}
        onSave={handleAddNote}
      />

      <QuizGenerator
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        classId={classItem.id}
        notes={notes}
      />
    </>
  )
}
