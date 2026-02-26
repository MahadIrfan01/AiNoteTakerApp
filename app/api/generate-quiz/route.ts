import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { notes, numQuestions = 5, difficulty = 'medium' } = body as {
      notes?: string
      numQuestions?: number
      difficulty?: 'easy' | 'medium' | 'hard'
    }

    if (!notes || notes.trim().length === 0) {
      return NextResponse.json(
        { error: 'Notes are required' },
        { status: 400 }
      )
    }

    const n = Math.min(20, Math.max(1, Math.floor(Number(numQuestions)) || 5))
    const diff = ['easy', 'medium', 'hard'].includes(difficulty) ? difficulty : 'medium'
    const diffInstructions: Record<string, string> = {
      easy: 'Use simple vocabulary, straightforward questions, and obvious distractors. Focus on recall and basic understanding.',
      medium: 'Use moderate complexity. Mix recall with some application. Include a few tricky distractors.',
      hard: 'Use advanced vocabulary, multi-step reasoning, and subtle distractors. Require deep understanding and application.',
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key is not configured' },
        { status: 500 }
      )
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = `You are an educational quiz generator. Based on the following notes, create a quiz with exactly ${n} multiple choice questions. Difficulty: ${diff.toUpperCase()}. ${diffInstructions[diff]}
Each question must have 4 options with one correct answer. Format your response as a JSON object, where each question has:
- question: string (the question text)
- options: array of 4 strings (the answer choices)
- correct_answer: number (0-3, the index of the correct answer)
- explanation: string (brief explanation of why the answer is correct)

Notes:
${notes}

Return ONLY valid JSON with exactly ${n} questions in this format:
{
  "questions": [
    {
      "question": "...",
      "options": ["...", "...", "...", "..."],
      "correct_answer": 0,
      "explanation": "..."
    }
  ]
}

Important: Return ONLY the JSON object, no markdown formatting, no code blocks, just the raw JSON.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const content = response.text()

    if (!content) {
      throw new Error('No response from Gemini')
    }

    // Parse the JSON response
    let quizData
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                       content.match(/```\n([\s\S]*?)\n```/) ||
                       content.match(/\{[\s\S]*\}/)
      const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content
      quizData = JSON.parse(jsonString.trim())
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', content)
      throw new Error('Failed to parse quiz data. Please try again.')
    }

    return NextResponse.json(quizData)
  } catch (error: any) {
    console.error('Error generating quiz:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate quiz' },
      { status: 500 }
    )
  }
}
