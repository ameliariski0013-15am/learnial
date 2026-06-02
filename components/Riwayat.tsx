'use client'
import { useState, useEffect } from 'react'
import { History, BookOpen, Trophy, ChevronDown, ChevronUp } from 'lucide-react'

interface RiwayatItem {
  id: string
  nama_file: string
  ringkasan: string
  ide_pokok: string[]
  kata_kunci: string[]
  skor_quiz: number | null
  total_soal: number | null
  created_at: string
}

export default function Riwayat({ userId }: { userId: string }) {
  const [items, setItems] = useState<RiwayatItem[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    if (userId) fetchRiwayat()
    else setLoading(false)
  }, [userId])

  async function fetchRiwayat() {
    if (!userId) { setLoading(false); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/riwayat?user_id=${userId}`)
      const data = await res.json()
      setItems(Array.isArray(data) ? data : [])
    } catch {
      setItems([])
    }
    setLoading(false)
  }

  function formatTanggal(iso: string) {
    return new Date(iso).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <div className="max-w-3xl">
      <div className="bg-brand-50 border border-brand-100 rounded-2xl p-4 mb-5 flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-brand-600 flex items-center justify-center shrink-0">
          <History size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-[15px] font-semibold text-brand-800">Riwayat Belajar</h1>
          <p className="text-[12px] text-brand-400">Materi yang pernah kamu analisis</p>
        </div>
      </div>

      {loading && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <div className="flex justify-center gap-1 mb-3">
            <span className="dot-1 text-brand-600">●</span>
            <span className="dot-2 text-brand-600">●</span>
            <span className="dot-3 text-brand-600">●</span>
          </div>
          <p className="text-[13px] text-gray-500">Memuat riwayat...</p>
        </div>
      )}

      {!loading && !userId && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <History size={32} className="text-gray-200 mx-auto mb-3" />
          <p className="text-[13px] text-gray-500">Login terlebih dahulu untuk melihat riwayat belajar.</p>
        </div>
      )}

      {!loading && userId && items.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <History size={32} className="text-gray-200 mx-auto mb-3" />
          <p className="text-[13px] text-gray-500">Belum ada riwayat belajar.</p>
          <p className="text-[12px] text-gray-400 mt-1">Upload materi di Analisis Materi untuk mulai!</p>
        </div>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div
              className="p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setExpanded(expanded === item.id ? null : item.id)}
            >
              <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                <BookOpen size={16} className="text-brand-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-gray-800 truncate">{item.nama_file}</p>
                <p className="text-[11px] text-gray-400">{formatTanggal(item.created_at)}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {item.skor_quiz !== null && (
                  <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                    <Trophy size={11} className="text-yellow-500" />
                    <span className="text-[11px] font-semibold text-yellow-700">
                      {item.skor_quiz}/{(item.total_soal ?? 0) * 20}
                    </span>
                  </div>
                )}
                {expanded === item.id
                  ? <ChevronUp size={14} className="text-gray-400" />
                  : <ChevronDown size={14} className="text-gray-400" />
                }
              </div>
            </div>

            {expanded === item.id && (
              <div className="px-4 pb-4 border-t border-gray-50 pt-3 space-y-3 fade-in">
                {item.ringkasan && (
                  <div>
                    <p className="text-[11px] font-semibold text-gray-500 mb-1">Ringkasan</p>
                    <p className="text-[12px] text-gray-600 leading-relaxed line-clamp-4">{item.ringkasan}</p>
                  </div>
                )}
                {item.ide_pokok?.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold text-gray-500 mb-1">Ide Pokok</p>
                    <ul className="space-y-1">
                      {item.ide_pokok.map((p, i) => (
                        <li key={i} className="flex gap-2 text-[12px] text-gray-600">
                          <span className="text-brand-400 shrink-0">•</span>{p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {item.kata_kunci?.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold text-gray-500 mb-1">Kata Kunci</p>
                    <div className="flex flex-wrap gap-1.5">
                      {item.kata_kunci.map((k, i) => (
                        <span key={i} className="bg-brand-50 text-brand-700 text-[11px] px-2 py-0.5 rounded-full">{k}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}