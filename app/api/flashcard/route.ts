import Groq from 'groq-sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  const { text } = await req.json()
  if (!text) return NextResponse.json({ error: 'No text' }, { status: 400 })

  const trimmedText = text.slice(0, 8000)

  const msg = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 2000,
    messages: [
      {
        role: 'system',
        content: `Kamu adalah pembuat flashcard Learnial. Buat TEPAT 10 flashcard Bahasa Indonesia dari materi yang diberikan.
Format JSON array:
[
  {
    "front": "istilah / konsep / pertanyaan singkat",
    "back": "definisi / penjelasan lengkap 2-3 kalimat"
  }
]
Balas HANYA JSON.`
      },
      { role: 'user', content: 'Buat flashcard dari materi ini:\n\n' + trimmedText }
    ],
  })

  const raw = msg.choices[0].message.content ?? ''
  const jsonMatch = raw.match(/\[[\s\S]*\]/)
  if (!jsonMatch) return NextResponse.json({ error: 'Invalid JSON' }, { status: 500 })

  try {
    return NextResponse.json(JSON.parse(jsonMatch[0]))
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 500 })
  }
}