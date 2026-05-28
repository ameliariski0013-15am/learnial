import Groq from 'groq-sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  const { text } = await req.json()
  if (!text) return NextResponse.json({ error: 'No text' }, { status: 400 })

  const msg = await client.chat.completions.create({
    model: 'llama3-70b-8192',
    max_tokens: 1500,
    messages: [
      {
        role: 'system',
        content: `Kamu adalah pembuat soal ujian Learnial. Buat TEPAT 5 soal pilihan ganda Bahasa Indonesia dari materi yang diberikan.
Format JSON array:
[
  {
    "q": "pertanyaan",
    "opts": ["pilihan A", "pilihan B", "pilihan C", "pilihan D"],
    "ans": 0,
    "penjelasan_benar": "penjelasan mengapa jawaban ini benar (2-3 kalimat)",
    "penjelasan_salah": "kesalahan umum atau mengapa pilihan lain salah (2-3 kalimat)"
  }
]
ans = index jawaban benar (0-3). Balas HANYA JSON.`
      },
      { role: 'user', content: 'Buat soal dari materi ini:\n\n' + text }
    ],
  })

  const raw = msg.choices[0].message.content ?? ''
  const clean = raw.replace(/```json|```/g, '').trim()
  return NextResponse.json(JSON.parse(clean))
}