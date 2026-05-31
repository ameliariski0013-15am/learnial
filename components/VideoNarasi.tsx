'use client'
import { useState, useEffect } from 'react'
import { Youtube, Search, Volume2, VolumeX, ExternalLink } from 'lucide-react'

interface VideoResult {
  narasi: string
  videos: { judul: string; channel: string; query: string; durasi: string }[]
}

export default function VideoNarasi({ sharedText }: { sharedText: string }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<VideoResult | null>(null)
  const [speaking, setSpeaking] = useState(false)

  useEffect(() => {
    if (sharedText) doVideo()
  }, [])

  async function doVideo() {
    if (!sharedText.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sharedText })
      })
      setResult(await res.json())
    } catch {
      alert('Gagal. Coba lagi.')
    }
    setLoading(false)
  }

  function speakNarasi() {
    if (!result?.narasi) return
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel()
      const utt = new SpeechSynthesisUtterance(result.narasi)
      utt.lang = 'id-ID'
      utt.rate = 0.9
      utt.onend = () => setSpeaking(false)
      speechSynthesis.speak(utt)
      setSpeaking(true)
    }
  }

  function stopSpeech() { speechSynthesis.cancel(); setSpeaking(false) }

  return (
    <div className="max-w-3xl">
      <div className="bg-brand-50 border border-brand-100 rounded-2xl p-4 mb-5 flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-brand-600 flex items-center justify-center shrink-0">
          <Youtube size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-[15px] font-semibold text-brand-800">Video & Narasi AI</h1>
          <p className="text-[12px] text-brand-400">Rekomendasi video + penjelasan audio dari materi</p>
        </div>
      </div>

      {loading && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <div className="flex justify-center gap-1 mb-3">
            <span className="dot-1 text-brand-600">●</span>
            <span className="dot-2 text-brand-600">●</span>
            <span className="dot-3 text-brand-600">●</span>
          </div>
          <p className="text-[13px] text-gray-500">Sedang mencari video dan membuat narasi...</p>
        </div>
      )}

      {!loading && !result && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <p className="text-[13px] text-gray-500 mb-3">Kembali ke Analisis Materi dan upload file terlebih dahulu.</p>
          <button onClick={doVideo} disabled={!sharedText}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-[13px] font-medium hover:bg-brand-800 disabled:opacity-50 transition-colors mx-auto">
            <Search size={14} /> Coba Lagi
          </button>
        </div>
      )}

      {result && (
        <div className="space-y-4 fade-in">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-[13px] font-semibold text-gray-700 flex items-center gap-2 mb-3">
              <Volume2 size={14} className="text-brand-600" /> Narasi AI
            </h2>
            <p className="text-[13px] text-gray-600 leading-relaxed mb-4 whitespace-pre-line">{result.narasi}</p>
            <div className="flex gap-2">
              {!speaking
                ? <button onClick={speakNarasi} className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-[13px] font-medium hover:bg-brand-800 transition-colors">
                    <Volume2 size={14} /> Dengarkan Narasi
                  </button>
                : <button onClick={stopSpeech} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-[13px] text-gray-600 hover:bg-gray-50 transition-colors">
                    <VolumeX size={14} /> Stop
                  </button>
              }
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-[13px] font-semibold text-gray-700 flex items-center gap-2 mb-3">
              <Youtube size={14} className="text-brand-600" /> Rekomendasi Video YouTube
            </h2>
            <div className="space-y-3">
              {result.videos.map((v, i) => (
                <a key={i} href={`https://www.youtube.com/results?search_query=${encodeURIComponent(v.query)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:border-brand-200 hover:bg-brand-50 transition-all group">
                  <div className="w-16 h-12 bg-brand-50 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-brand-100">
                    <Youtube size={22} className="text-brand-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-gray-800 truncate">{v.judul}</p>
                    <p className="text-[11px] text-gray-400">{v.channel} · {v.durasi}</p>
                  </div>
                  <ExternalLink size={14} className="text-gray-300 group-hover:text-brand-400 shrink-0" />
                </a>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 mt-3">* Klik untuk mencari video di YouTube</p>
          </div>
        </div>
      )}
    </div>
  )
}