import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024   // 10MB
const MAX_IMAGE_SIZE_BYTES = 4 * 1024 * 1024   // 4MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

interface AttachmentInput {
  type: 'pdf' | 'image'
  name: string
  data: string  // base64
  mimeType?: string
}

async function extractPdfText(base64Data: string): Promise<string> {
  const buffer = Buffer.from(base64Data, 'base64')
  if (buffer.length > MAX_PDF_SIZE_BYTES) {
    throw new Error('PDF is too large (max 10MB)')
  }
  // Use lib path directly to avoid pdf-parse loading its test suite (known webpack compat issue)
  const pdfParseLib = await import('pdf-parse/lib/pdf-parse.js' as string)
  const pdfParse: (buf: Buffer) => Promise<{ text: string }> = pdfParseLib.default ?? pdfParseLib
  const result = await pdfParse(buffer)
  return result?.text || ''
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, conversationHistory, attachments = [] } = body as {
      message: string
      conversationHistory?: Array<{ role: string; content: string }>
      attachments?: AttachmentInput[]
    }

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    let documentContext = ''
    const imageParts: Array<{ inlineData: { mimeType: string; data: string } }> = []

    for (const att of attachments) {
      if (att.type === 'pdf') {
        try {
          const text = await extractPdfText(att.data)
          if (text.trim()) {
            documentContext += `\n\n--- Document: ${att.name} ---\n${text}\n--- End document ---`
          }
        } catch (e: any) {
          console.error('[AI Tutor] PDF parse error:', e?.message)
          documentContext += `\n\n[Could not parse PDF "${att.name}": ${e?.message}]`
        }
      } else if (att.type === 'image' && att.data) {
        const mimeType = att.mimeType || 'image/jpeg'
        if (!ACCEPTED_IMAGE_TYPES.includes(mimeType)) continue
        const sizeBytes = (att.data.length * 3) / 4
        if (sizeBytes > MAX_IMAGE_SIZE_BYTES) continue
        imageParts.push({ inlineData: { mimeType, data: att.data } })
      }
    }

    let conversationContext = 'You are a helpful, patient, and knowledgeable AI tutor. Your role is to:\n'
    conversationContext += '- Explain concepts clearly and simply\n'
    conversationContext += '- Break down complex topics into understandable parts\n'
    conversationContext += '- Provide examples and analogies when helpful\n'
    conversationContext += '- Ask clarifying questions if needed\n'
    conversationContext += '- Encourage learning and critical thinking\n'
    conversationContext += '- Be supportive and encouraging\n\n'

    if (documentContext) {
      conversationContext += 'The student has uploaded the following document(s) for you to read and reference when answering. Use this content to help explain, summarize, or answer questions.\n'
      conversationContext += documentContext
      conversationContext += '\n\n'
    }

    if (conversationHistory && conversationHistory.length > 0) {
      conversationContext += 'Previous conversation:\n'
      conversationHistory.forEach((msg: any) => {
        conversationContext += `${msg.role === 'user' ? 'Student' : 'Tutor'}: ${msg.content}\n`
      })
      conversationContext += '\n'
    }

    conversationContext += `Student: ${message}\nTutor:`

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      // Use a widely supported multimodal model for this API key.
      // If you later upgrade your key, you can switch to a newer model here.
      model: 'gemini-3-flash-preview',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    })

    const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
      { text: conversationContext },
      ...imageParts,
    ]

    const result = await model.generateContent(parts)
    const response = result.response

    if (!response.candidates?.length) {
      const blockReason = response.promptFeedback?.blockReason || 'No candidates returned'
      console.error('[AI Tutor] Blocked or empty:', blockReason, response.promptFeedback)
      throw new Error(blockReason ? `Response blocked: ${blockReason}` : 'No response from AI')
    }

    let aiResponse: string
    try {
      aiResponse = response.text()
    } catch (e: any) {
      console.error('[AI Tutor] response.text() error:', e?.message)
      throw new Error(e?.message || 'Could not get response text')
    }

    if (!aiResponse?.trim()) {
      throw new Error('Empty response from AI')
    }

    return NextResponse.json({ response: aiResponse })
  } catch (error: any) {
    console.error('[AI Tutor] Error:', error?.message, error?.stack)
    const message = error?.message || 'Failed to process request'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
