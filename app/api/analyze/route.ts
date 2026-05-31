import Groq from 'groq-sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  const { text } = await req.json()
  if (!text) return NextResponse.json({ error: 'No text' }, { status: 400 })

  // Bersihkan karakter HTML entities dan potong teks
  const cleanText = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .slice(0, 8000)

  const msg = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 3000,
    messages: [
      {
        role: 'system',
        content: `Kamu adalah asisten akademik Learnial. Analisis materi kuliah dan balas dalam format JSON:
{
  "ringkasan": "ringkasan materi yang detail dan komprehensif minimal 300 kata dalam Bahasa Indonesia, jelaskan konsep-konsep penting secara mendalam",
  "ide_pokok": ["ide pokok 1 yang dijelaskan lengkap", "ide pokok 2", "ide pokok 3", "ide pokok 4", "ide pokok 5"],
  "kata_kunci": ["kata1", "kata2", "kata3", "kata4", "kata5", "kata6", "kata7", "kata8"],
  "mindmap": {
    "topik": "judul topik utama",
    "cabang": ["cabang1", "cabang2", "cabang3", "cabang4", "cabang5"]
  }
}
Balas HANYA JSON tanpa teks lain. Jangan gunakan karakter khusus dalam JSON.`
      },
      { role: 'user', content: cleanText }
    ],
  })

  const raw = msg.choices[0].message.content ?? ''
  
  // Ekstrak JSON dari response
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    return NextResponse.json({ error: 'Invalid JSON from AI' }, { status: 500 })
  }

  try {
    const parsed = JSON.parse(jsonMatch[0])
    return NextResponse.json(parsed)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON from AI' }, { status: 500 })
  }
}