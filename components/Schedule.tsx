'use client'
import { useState, useEffect } from 'react'
import { Calendar, Plus, Trash2, Clock } from 'lucide-react'

interface ScheduleItem {
  id: string
  name: string
  day: string
  time: string
  room: string
}

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const DAY_COLORS: Record<string, string> = {
  'Senin': 'bg-brand-50 border-l-brand-400',
  'Selasa': 'bg-purple-50 border-l-purple-400',
  'Rabu': 'bg-teal-50 border-l-teal-400',
  'Kamis': 'bg-amber-50 border-l-amber-400',
  'Jumat': 'bg-green-50 border-l-green-400',
  'Sabtu': 'bg-pink-50 border-l-pink-400',
}

export default function Schedule() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([])
  const [name, setName] = useState('')
  const [day, setDay] = useState('Senin')
  const [time, setTime] = useState('09:30')
  const [room, setRoom] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('learnial_schedules')
    if (saved) setSchedules(JSON.parse(saved))
  }, [])

  function save(items: ScheduleItem[]) {
    setSchedules(items)
    localStorage.setItem('learnial_schedules', JSON.stringify(items))
  }

  function add() {
    if (!name.trim()) return
    const item: ScheduleItem = { id: Date.now().toString(), name, day, time, room }
    save([...schedules, item])
    setName(''); setRoom('')
  }

  function remove(id: string) {
    save(schedules.filter(s => s.id !== id))
  }

  const grouped = DAYS.reduce((acc, d) => {
    acc[d] = schedules.filter(s => s.day === d).sort((a, b) => a.time.localeCompare(b.time))
    return acc
  }, {} as Record<string, ScheduleItem[]>)

  const today = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][new Date().getDay()]
  const todayItems = grouped[today] || []

  return (
    <div className="max-w-3xl">
      <div className="bg-brand-50 border border-brand-100 rounded-2xl p-4 mb-5 flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-brand-600 flex items-center justify-center shrink-0">
          <Calendar size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-[15px] font-semibold text-brand-800">Jadwal Kuliah</h1>
          <p className="text-[12px] text-brand-400">Atur jadwal dan deadline tugasmu</p>
        </div>
      </div>

      {todayItems.length > 0 && (
        <div className="bg-white rounded-2xl border border-brand-100 p-4 mb-4">
          <h2 className="text-[12px] font-semibold text-brand-600 flex items-center gap-1.5 mb-3"><Clock size={13} /> Jadwal Hari Ini — {today}</h2>
          <div className="space-y-2">
            {todayItems.map(s => (
              <div key={s.id} className={`p-3 rounded-xl border-l-4 ${DAY_COLORS[s.day] || 'bg-gray-50 border-l-gray-300'}`}>
                <p className="text-[13px] font-semibold text-gray-800">{s.time} — {s.name}</p>
                {s.room && <p className="text-[11px] text-gray-500 mt-0.5">{s.room}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
        <h2 className="text-[13px] font-semibold text-gray-700 flex items-center gap-2 mb-4"><Plus size={14} className="text-brand-600" /> Tambah Jadwal</h2>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-[11px] text-gray-500 block mb-1">Mata Kuliah</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="cth: Sistem Keamanan"
              className="w-full px-3 py-2 border border-gray-100 rounded-lg text-[13px] bg-gray-50 focus:outline-none focus:border-brand-400" />
          </div>
          <div>
            <label className="text-[11px] text-gray-500 block mb-1">Hari</label>
            <select value={day} onChange={e => setDay(e.target.value)}
              className="w-full px-3 py-2 border border-gray-100 rounded-lg text-[13px] bg-gray-50 focus:outline-none focus:border-brand-400">
              {DAYS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] text-gray-500 block mb-1">Jam Mulai</label>
            <input type="time" value={time} onChange={e => setTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-100 rounded-lg text-[13px] bg-gray-50 focus:outline-none focus:border-brand-400" />
          </div>
          <div>
            <label className="text-[11px] text-gray-500 block mb-1">Ruang / Dosen (opsional)</label>
            <input type="text" value={room} onChange={e => setRoom(e.target.value)}
              placeholder="cth: R.301 / Dr. Budi"
              className="w-full px-3 py-2 border border-gray-100 rounded-lg text-[13px] bg-gray-50 focus:outline-none focus:border-brand-400" />
          </div>
        </div>
        <button onClick={add} disabled={!name.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-[13px] font-medium hover:bg-brand-800 disabled:opacity-50 transition-colors">
          <Plus size={14} /> Tambah Jadwal
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="text-[13px] font-semibold text-gray-700 mb-4">Semua Jadwal ({schedules.length})</h2>
        {schedules.length === 0
          ? <p className="text-[13px] text-gray-400 text-center py-6">Belum ada jadwal. Tambahkan di atas!</p>
          : DAYS.filter(d => grouped[d].length > 0).map(d => (
            <div key={d} className="mb-4">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-2">{d}</p>
              <div className="space-y-2">
                {grouped[d].map(s => (
                  <div key={s.id} className={`flex items-center gap-3 p-3 rounded-xl border-l-4 ${DAY_COLORS[s.day] || 'bg-gray-50'}`}>
                    <div className="flex-1">
                      <p className="text-[13px] font-medium text-gray-800">{s.time} — {s.name}</p>
                      {s.room && <p className="text-[11px] text-gray-400">{s.room}</p>}
                    </div>
                    <button onClick={() => remove(s.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}
