import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Learnial — Belajar Lebih Cerdas, Jadwal Lebih Rapi',
  description: 'AI Study Buddy & Schedule Optimizer untuk Mahasiswa oleh Amelia',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}
