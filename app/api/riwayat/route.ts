import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const { user_id, nama_file, ringkasan, ide_pokok, kata_kunci, skor_quiz, total_soal } = await req.json()
  if (!user_id || !nama_file) return NextResponse.json({ error: 'No data' }, { status: 400 })

  const { data, error } = await supabase
    .from('riwayat_materi')
    .insert({ user_id, nama_file, ringkasan, ide_pokok, kata_kunci, skor_quiz, total_soal })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function GET(req: NextRequest) {
  const user_id = req.nextUrl.searchParams.get('user_id')
  if (!user_id) return NextResponse.json({ error: 'No user_id' }, { status: 400 })

  const { data, error } = await supabase
    .from('riwayat_materi')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}