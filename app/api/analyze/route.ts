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
        content: `Kamu adalah asisten akademik Learnial. Analisis materi kuliah dan balas dalam format JSON:
{
  "ringkasan": "ringkasan materi 150 kata dalam Bahasa Indonesia",
  "ide_pokok": ["poin 1", "poin 2", "poin 3", "poin 4", "poin 5"],
  "kata_kunci": ["kata1", "kata2", "kata3", "kata4", "kata5", "kata6", "kata7", "kata8"],
  "mindmap": {
    "topik": "judul topik utama",
    "cabang": ["cabang1", "cabang2", "cabang3", "cabang4", "cabang5"]
  }
}
Balas HANYA JSON tanpa teks lain.`
      },
      { role: 'user', content: text }
    ],
  })

  const raw = msg.choices[0].message.content ?? ''
  const clean = raw.replace(/```json|```/g, '').trim()
  return NextResponse.json(JSON.parse(clean))
}