'use client'
import { BookOpen, HelpCircle, CreditCard, Youtube, Calendar, Bell, GraduationCap, Heart, History } from 'lucide-react'
import type { Page } from '@/app/page'

const navItems: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: 'study',     label: 'Analisis Materi', icon: <BookOpen size={16} /> },
  { id: 'quiz',      label: 'Quiz Interaktif', icon: <HelpCircle size={16} /> },
  { id: 'flashcard', label: 'Flashcard',        icon: <CreditCard size={16} /> },
  { id: 'video',     label: 'Video & Narasi',   icon: <Youtube size={16} /> },
  { id: 'riwayat',   label: 'Riwayat',          icon: <History size={16} /> },
  { id: 'schedule',  label: 'Jadwal Kuliah',    icon: <Calendar size={16} /> },
  { id: 'notif',     label: 'Notifikasi',       icon: <Bell size={16} /> },
]

export default function Sidebar({ activePage, onNavigate }: {
  activePage: Page
  onNavigate: (p: Page) => void
}) {
  return (
    <aside className="w-56 bg-white border-r border-gray-100 flex flex-col shrink-0 h-screen">
      <div className="p-5 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <GraduationCap size={22} className="text-brand-600" />
          <span className="text-[18px] font-semibold text-gray-900">Learnial</span>
        </div>
        <p className="text-[11px] text-brand-400 leading-tight">Belajar Lebih Cerdas, Jadwal Lebih Rapi</p>
      </div>

      <nav className="flex-1 px-3 space-y-0.5">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-2 pt-4 pb-1.5">AI Study Buddy</p>
        {navItems.filter(i => ['study','quiz','flashcard','video','riwayat'].includes(i.id)).map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all ${
              activePage === item.id
                ? 'bg-brand-50 text-brand-600 font-medium'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}

        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-2 pt-4 pb-1.5">AI Schedule</p>
        {navItems.filter(i => ['schedule','notif'].includes(i.id)).map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all ${
              activePage === item.id
                ? 'bg-brand-50 text-brand-600 font-medium'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
          <Heart size={12} className="text-brand-400" /> Dibuat oleh <span className="text-brand-600 font-medium">Amelia</span>
        </p>
      </div>
    </aside>
  )
}