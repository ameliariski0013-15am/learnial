import type { Metadata } from 'next'
import './globals.css'
import { SessionProvider } from '@/app/providers'

export const metadata: Metadata = {
  title: 'Learnial — Belajar Lebih Cerdas, Jadwal Lebih Rapi',
  description: 'AI Study Buddy & Schedule Optimizer untuk Mahasiswa oleh Amelia',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}