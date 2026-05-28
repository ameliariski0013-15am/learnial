'use client'
import { useState, useEffect } from 'react'
import { Bell, Mail, Activity, BellOff, CheckCircle, Play } from 'lucide-react'

export default function Notification() {
  const [notifStatus, setNotifStatus] = useState<'unknown' | 'granted' | 'denied'>('unknown')
  const [email, setEmail] = useState('')
  const [emailSaved, setEmailSaved] = useState(false)
  const [testSent, setTestSent] = useState(0)

  useEffect(() => {
    if ('Notification' in window) {
      setNotifStatus(Notification.permission as 'unknown' | 'granted' | 'denied')
    }
    const saved = localStorage.getItem('learnial_email')
    if (saved) setEmail(saved)
  }, [])

  async function reqNotif() {
    const perm = await Notification.requestPermission()
    setNotifStatus(perm as 'granted' | 'denied')
  }

  function playAlarm() {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      ;[0, 0.15, 0.3].forEach((t, i) => {
        const osc = ctx.createOscillator(), gain = ctx.createGain()
        osc.connect(gain); gain.connect(ctx.destination)
        osc.frequency.value = i % 2 === 0 ? 880 : 1100
        osc.type = 'sine'
        gain.gain.setValueAtTime(0.3, ctx.currentTime + t)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.12)
        osc.start(ctx.currentTime + t)
        osc.stop(ctx.currentTime + t + 0.13)
      })
    } catch {}
  }

  function testNotif() {
    playAlarm()
    if (notifStatus === 'granted') {
      new Notification('Learnial — Waktunya Kuliah!', {
        body: '09:30 · Sistem Keamanan · R.301'
      })
      setTestSent(n => n + 1)
    }
  }

  function saveEmail() {
    localStorage.setItem('learnial_email', email)
    setEmailSaved(true)
    setTimeout(() => setEmailSaved(false), 3000)
  }

  const schedules = JSON.parse(localStorage.getItem('learnial_schedules') || '[]')

  return (
    <div className="max-w-3xl">
      <div className="bg-brand-50 border border-brand-100 rounded-2xl p-4 mb-5 flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-brand-600 flex items-center justify-center shrink-0">
          <Bell size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-[15px] font-semibold text-brand-800">Pengaturan Notifikasi</h1>
          <p className="text-[12px] text-brand-400">Aktifkan pengingat jadwal kuliah real-time</p>
        </div>
      </div>

      <div className={`rounded-xl p-3 mb-4 flex items-center gap-2.5 text-[12px] ${
        notifStatus === 'granted' ? 'bg-green-50 border border-green-200 text-green-700' :
        notifStatus === 'denied'  ? 'bg-red-50 border border-red-200 text-red-600' :
        'bg-brand-50 border border-brand-100 text-brand-700'
      }`}>
        {notifStatus === 'granted' ? <CheckCircle size={14} /> : notifStatus === 'denied' ? <BellOff size={14} /> : <Bell size={14} />}
        {notifStatus === 'granted' ? 'Notifikasi aktif! Kamu akan diberitahu saat jam kuliah tiba.' :
         notifStatus === 'denied'  ? 'Notifikasi diblokir. Aktifkan di pengaturan browser.' :
         'Klik tombol di bawah untuk mengaktifkan notifikasi browser.'}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
        <h2 className="text-[13px] font-semibold text-gray-700 flex items-center gap-2 mb-1"><Bell size={14} className="text-brand-600" /> Notifikasi Browser</h2>
        <p className="text-[11px] text-gray-400 mb-4">Muncul di layar + bunyi alarm saat jam kuliah tiba</p>
        <div className="flex gap-2 flex-wrap">
          {notifStatus !== 'granted'
            ? <button onClick={reqNotif} className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-[13px] font-medium hover:bg-brand-800 transition-colors">
                <Bell size={14} /> Aktifkan Notifikasi
              </button>
            : <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg text-[13px] font-medium border border-green-200">
                <CheckCircle size={14} /> Notifikasi Aktif
              </div>
          }
          <button onClick={testNotif}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-[13px] text-gray-600 hover:bg-gray-50 transition-colors">
            <Play size={14} /> Test Sekarang
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
        <h2 className="text-[13px] font-semibold text-gray-700 flex items-center gap-2 mb-1"><Mail size={14} className="text-brand-600" /> Email Reminder</h2>
        <p className="text-[11px] text-gray-400 mb-4">Simpan email untuk reminder jadwal harian (integrasi EmailJS tersedia)</p>
        <div className="flex gap-2">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="emailkamu@gmail.com"
            className="flex-1 px-3 py-2 border border-gray-100 rounded-lg text-[13px] bg-gray-50 focus:outline-none focus:border-brand-400" />
          <button onClick={saveEmail} disabled={!email.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-[13px] font-medium hover:bg-brand-800 disabled:opacity-50 transition-colors">
            {emailSaved ? <><CheckCircle size={14} /> Tersimpan!</> : 'Simpan'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="text-[13px] font-semibold text-gray-700 flex items-center gap-2 mb-4"><Activity size={14} className="text-brand-600" /> Status Monitor</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-[11px] text-gray-400 mb-1">Jadwal tersimpan</p>
            <p className="text-[22px] font-semibold text-gray-800">{schedules.length}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-[11px] text-gray-400 mb-1">Test terkirim</p>
            <p className="text-[22px] font-semibold text-gray-800">{testSent}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-[11px] text-gray-400 mb-1">Status</p>
            <p className="text-[13px] font-semibold text-green-600 mt-1">● Aktif</p>
          </div>
        </div>
        <p className="text-[11px] text-gray-400 mt-3">Monitor berjalan setiap menit untuk mengecek jadwal kuliah.</p>
      </div>
    </div>
  )
}
