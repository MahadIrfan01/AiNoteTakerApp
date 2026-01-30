import { NextRequest, NextResponse } from 'next/server'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    // Build conversation context
    let conversationContext = 'You are a helpful, patient, and knowledgeable AI tutor. Your role is to:\n'
    conversationContext += '- Explain concepts clearly and simply\n'
    conversationContext += '- Break down complex topics into understandable parts\n'
    conversationContext += '- Provide examples and analogies when helpful\n'
    conversationContext += '- Ask clarifying questions if needed\n'
    conversationContext += '- Encourage learning and critical thinking\n'
    conversationContext += '- Be supportive and encouraging\n\n'

    if (conversationHistory && conversationHistory.length > 0) {
      conversationContext += 'Previous conversation:\n'
      conversationHistory.forEach((msg: any) => {
        conversationContext += `${msg.role === 'user' ? 'Student' : 'Tutor'}: ${msg.content}\n`
      })
      conversationContext += '\n'
    }

    conversationContext += `Student: ${message}\nTutor:`

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: conversationContext
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Gemini API error:', errorData)
      throw new Error('Failed to get response from AI')
    }

    const data = await response.json()
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response from AI')
    }

    const aiResponse = data.candidates[0].content.parts[0].text

    return NextResponse.json({ response: aiResponse })
  } catch (error: any) {
    console.error('AI Tutor error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    )
  }
}
