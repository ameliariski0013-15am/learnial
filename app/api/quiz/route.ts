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
        content: `Kamu adalah pembuat soal ujian Learnial. Buat TEPAT 5 soal pilihan ganda Bahasa Indonesia dari materi yang diberikan.
Jika materi mengandung angka/perhitungan, sertakan soal hitungan dengan langkah-langkah di penjelasan.
Format JSON array:
[
  {
    "q": "pertanyaan lengkap dan jelas",
    "opts": ["pilihan A", "pilihan B", "pilihan C", "pilihan D"],
    "ans": 0,
    "tipe": "konsep",
    "langkah": "",
    "penjelasan_benar": "penjelasan mengapa jawaban ini benar, minimal 3 kalimat",
    "penjelasan_salah": "penjelasan mengapa pilihan lain salah, minimal 2 kalimat"
  }
]
Untuk soal hitungan, isi "tipe": "hitung" dan "langkah": "Langkah 1: ... \nLangkah 2: ... \nHasil: ..."
ans = index jawaban benar (0-3). Balas HANYA JSON.`
      },
      { role: 'user', content: 'Buat soal dari materi ini:\n\n' + trimmedText }
    ],
  })

  const raw = msg.choices[0].message.content ?? ''
  const clean = raw.replace(/```json|```/g, '').trim()

  try {
    return NextResponse.json(JSON.parse(clean))
  } catch {
    return NextResponse.json({ error: 'Invalid JSON from AI' }, { status: 500 })
  }
}