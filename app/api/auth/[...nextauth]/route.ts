import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async signIn({ user }) {
      const { email, name, image } = user
      const { data } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single()

      if (!data) {
        await supabase.from('users').insert({ email, name, image })
      } else {
        await supabase.from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('email', email)
      }

      await supabase.from('activity_logs').insert({
        user_id: data?.id,
        action: 'login'
      })

      return true
    },
    async session({ session }) {
      return session
    }
  },
  pages: {
    signIn: '/login'
  }
})

export { handler as GET, handler as POST }