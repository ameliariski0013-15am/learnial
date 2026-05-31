'use client'
import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import StudyAnalysis from '@/components/StudyAnalysis'
import QuizGenerator from '@/components/QuizGenerator'
import Flashcard from '@/components/Flashcard'
import VideoNarasi from '@/components/VideoNarasi'
import Schedule from '@/components/Schedule'
import Notification from '@/components/Notification'

export type Page = 'study' | 'quiz' | 'flashcard' | 'video' | 'schedule' | 'notif'

export default function Home() {
  const [page, setPage] = useState<Page>('study')
  const [sharedText, setSharedText] = useState('')

  function goToQuiz() {
    setPage('quiz')
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar activePage={page} onNavigate={setPage} />
      <main className="flex-1 overflow-y-auto p-6 bg-[#F6F5FF]">
        {page === 'study'     && <StudyAnalysis onTextExtracted={setSharedText} onGoToQuiz={goToQuiz} />}
        {page === 'quiz'      && <QuizGenerator sharedText={sharedText} />}
        {page === 'flashcard' && <Flashcard sharedText={sharedText} />}
        {page === 'video'     && <VideoNarasi sharedText={sharedText} />}
        {page === 'schedule'  && <Schedule />}
        {page === 'notif'     && <Notification />}
      </main>
    </div>
  )
}