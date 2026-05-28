import Groq from 'groq-sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  const { text } = await req.json()
  if (!text) return NextResponse.json({ error: 'No text' }, { status: 400 })

  const msg = await client.chat.completions.create({
    model: 'llama3-70b-8192',
    max_tokens: 1200,
    messages: [
      {
        role: 'system',
        content: `Kamu adalah asisten video Learnial. Buat narasi penjelasan dan rekomendasi video YouTube.
Format JSON:
{
  "narasi": "penjelasan materi 3 paragraf dalam Bahasa Indonesia, gaya santai seperti menjelaskan ke teman. Mudah dipahami.",
  "videos": [
    {
      "judul": "judul video YouTube yang relevan",
      "channel": "nama channel YouTube yang relevan",
      "query": "search query dalam Bahasa Inggris untuk mencari video ini di YouTube",
      "durasi": "estimasi durasi contoh: 10-15 menit"
    },
    {
      "judul": "judul video YouTube ke-2",
      "channel": "nama channel",
      "query": "search query bahasa inggris",
      "durasi": "estimasi durasi"
    },
    {
      "judul": "judul video YouTube ke-3",
      "channel": "nama channel",
      "query": "search query bahasa inggris",
      "durasi": "estimasi durasi"
    }
  ]
}
Balas HANYA JSON.`
      },
      { role: 'user', content: text }
    ],
  })

  const raw = msg.choices[0].message.content ?? ''
  const clean = raw.replace(/```json|```/g, '').trim()
  return NextResponse.json(JSON.parse(clean))
}