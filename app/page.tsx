'use client'
import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import StudyAnalysis from '@/components/StudyAnalysis'
import QuizGenerator from '@/components/QuizGenerator'
import Flashcard from '@/components/Flashcard'
import VideoNarasi from '@/components/VideoNarasi'
import Schedule from '@/components/Schedule'
import Notification from '@/components/Notification'
import Riwayat from '@/components/Riwayat'
import { useSession } from 'next-auth/react'

export const dynamic = 'force-dynamic'

export type Page = 'study' | 'quiz' | 'flashcard' | 'video' | 'riwayat' | 'schedule' | 'notif'

export default function Home() {
  const [page, setPage] = useState<Page>('study')
  const [sharedText, setSharedText] = useState('')
  const { data: session } = useSession()
  const userId = (session?.user as any)?.id ?? ''

  function goToQuiz() { setPage('quiz') }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar activePage={page} onNavigate={setPage} />
      <main className="flex-1 overflow-y-auto p-6 bg-[#F6F5FF]">
        <div className={page === 'study' ? '' : 'hidden'}>
          <StudyAnalysis onTextExtracted={setSharedText} onGoToQuiz={goToQuiz} userId={userId} />
        </div>
        <div className={page === 'quiz' ? '' : 'hidden'}>
          <QuizGenerator sharedText={sharedText} userId={userId} />
        </div>
        <div className={page === 'flashcard' ? '' : 'hidden'}>
          <Flashcard sharedText={sharedText} />
        </div>
        <div className={page === 'video' ? '' : 'hidden'}>
          <VideoNarasi sharedText={sharedText} />
        </div>
        <div className={page === 'riwayat' ? '' : 'hidden'}>
          <Riwayat userId={userId} />
        </div>
        <div className={page === 'schedule' ? '' : 'hidden'}>
          <Schedule />
        </div>
        <div className={page === 'notif' ? '' : 'hidden'}>
          <Notification />
        </div>
      </main>
    </div>
  )
}