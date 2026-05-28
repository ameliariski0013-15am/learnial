import Groq from 'groq-sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  const { text } = await req.json()
  if (!text) return NextResponse.json({ error: 'No text' }, { status: 400 })

  const msg = await client.chat.completions.create({
    model: 'llama3-70b-8192',
    max_tokens: 1000,
    messages: [
      {
        role: 'system',
        content: `Kamu adalah pembuat flashcard Learnial. Buat TEPAT 8 flashcard Bahasa Indonesia dari materi yang diberikan.
Format JSON array:
[
  {
    "front": "istilah / konsep / pertanyaan singkat",
    "back": "definisi / penjelasan singkat (1-2 kalimat)"
  }
]
Balas HANYA JSON.`
      },
      { role: 'user', content: 'Buat flashcard dari materi ini:\n\n' + text }
    ],
  })

  const raw = msg.choices[0].message.content ?? ''
  const clean = raw.replace(/```json|```/g, '').trim()
  return NextResponse.json(JSON.parse(clean))
}