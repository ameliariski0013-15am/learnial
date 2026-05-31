import Groq from 'groq-sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  const { question, answer, context } = await req.json()
  if (!question || !answer) return NextResponse.json({ error: 'No data' }, { status: 400 })

  const msg = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 1000,
    messages: [
      {
        role: 'system',
        content: `Kamu adalah penilai jawaban essay akademik Learnial. Nilai jawaban mahasiswa dan balas dalam format JSON:
{
  "skor": 85,
  "predikat": "Baik",
  "feedback": "penjelasan feedback lengkap 3-4 kalimat tentang jawaban mahasiswa",
  "poin_benar": ["hal yang benar dari jawaban"],
  "poin_kurang": ["hal yang kurang atau perlu diperbaiki"],
  "jawaban_ideal": "jawaban ideal yang lengkap dan benar"
}
Skor 0-100. Predikat: Sangat Baik (90-100), Baik (75-89), Cukup (60-74), Perlu Belajar Lagi (<60).
Balas HANYA JSON.`
      },
      {
        role: 'user',
        content: `Konteks materi: ${context?.slice(0, 3000) ?? ''}

Pertanyaan Essay: ${question}

Jawaban Mahasiswa: ${answer}

Nilai jawaban ini secara objektif.`
      }
    ],
  })

  const raw = msg.choices[0].message.content ?? ''
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return NextResponse.json({ error: 'Invalid JSON' }, { status: 500 })

  try {
    return NextResponse.json(JSON.parse(jsonMatch[0]))
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 500 })
  }
}