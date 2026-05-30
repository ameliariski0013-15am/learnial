import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Missing env vars' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: users } = await supabase
      .from('users')
      .select('*, activity_logs(action, created_at)')
      .order('created_at', { ascending: false })

    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}