import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NoteAI',
  description: 'Your intelligent study companion – organize classes, take notes, and generate AI-powered quizzes',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  )
}
