import Groq from 'groq-sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  const { text } = await req.json()
  if (!text) return NextResponse.json({ error: 'No text' }, { status: 400 })

  const trimmedText = text.slice(0, 8000)

  const msg = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 3000,
    messages: [
      {
        role: 'system',
        content: `Kamu adalah pembuat soal ujian Learnial. Buat soal dalam format JSON dengan struktur:
{
  "pilihan_ganda": [
    {
      "q": "pertanyaan lengkap",
      "opts": ["pilihan A", "pilihan B", "pilihan C", "pilihan D"],
      "ans": 0,
      "tipe": "konsep",
      "langkah": "",
      "penjelasan_benar": "penjelasan mengapa benar minimal 3 kalimat",
      "penjelasan_salah": "penjelasan mengapa pilihan lain salah minimal 2 kalimat"
    }
  ],
  "essay": [
    {
      "q": "pertanyaan essay yang membutuhkan pemahaman mendalam",
      "petunjuk": "petunjuk singkat cara menjawab"
    }
  ]
}
Buat TEPAT 5 soal pilihan ganda dan 2 soal essay.
Untuk soal hitungan, isi tipe: "hitung" dan langkah penyelesaian.
ans = index jawaban benar (0-3). Balas HANYA JSON.`
      },
      { role: 'user', content: 'Buat soal dari materi ini:\n\n' + trimmedText }
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