'use client'
import { useState } from 'react'
import { CreditCard, Sparkles, ChevronLeft, ChevronRight, Copy, RotateCcw } from 'lucide-react'

interface FC { front: string; back: string }

export default function Flashcard({ sharedText }: { sharedText: string }) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [cards, setCards] = useState<FC[]>([])
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)

  async function doFlashcard() {
    if (!text.trim()) return
    setLoading(true)
    setCards([])
    setIdx(0)
    setFlipped(false)
    try {
      const res = await fetch('/api/flashcard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })
      setCards(await res.json())
    } catch {
      alert('Gagal generate flashcard. Coba lagi.')
    }
    setLoading(false)
  }

  function next() { if (idx < cards.length - 1) { setIdx(idx + 1); setFlipped(false) } }
  function prev() { if (idx > 0) { setIdx(idx - 1); setFlipped(false) } }

  return (
    <div className="max-w-3xl">
      <div className="bg-brand-50 border border-brand-100 rounded-2xl p-4 mb-5 flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-brand-600 flex items-center justify-center shrink-0">
          <CreditCard size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-[15px] font-semibold text-brand-800">Flashcard Generator</h1>
          <p className="text-[12px] text-brand-400">Kartu belajar interaktif — klik untuk flip</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Paste materi kuliah di sini..."
          className="w-full min-h-[90px] p-3 border border-gray-100 rounded-xl text-[13px] bg-gray-50 resize-y focus:outline-none focus:border-brand-400 text-gray-700"
        />
        <div className="flex gap-2 mt-3">
          <button onClick={doFlashcard} disabled={loading || !text.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-[13px] font-medium hover:bg-brand-800 disabled:opacity-50 transition-colors">
            {loading ? <><span className="dot-1">●</span><span className="dot-2">●</span><span className="dot-3">●</span> Generating...</> : <><Sparkles size={14} /> Generate Flashcard</>}
          </button>
          {sharedText && (
            <button onClick={() => setText(sharedText)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-[13px] text-gray-600 hover:bg-gray-50 transition-colors">
              <Copy size={13} /> Pakai teks materi
            </button>
          )}
        </div>
      </div>

      {cards.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 fade-in">
          <p className="text-[11px] text-gray-400 text-center mb-3">Klik kartu untuk melihat jawaban</p>

          <div className="flashcard-container h-[180px] mb-4 cursor-pointer" onClick={() => setFlipped(!flipped)}>
            <div className={`flashcard-inner h-full relative ${flipped ? 'flipped' : ''}`}>
              <div className="flashcard-face absolute inset-0 bg-brand-50 rounded-2xl border border-brand-100 flex flex-col items-center justify-center p-6 text-center">
                <p className="text-[10px] font-semibold text-brand-400 uppercase tracking-widest mb-2">Pertanyaan</p>
                <p className="text-[16px] font-semibold text-brand-800">{cards[idx].front}</p>
              </div>
              <div className="flashcard-face flashcard-back absolute inset-0 bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center p-6 text-center">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Jawaban</p>
                <p className="text-[14px] text-gray-700 leading-relaxed">{cards[idx].back}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button onClick={prev} disabled={idx === 0}
              className="flex items-center gap-1 px-3 py-2 border border-gray-100 rounded-lg text-[13px] text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-colors">
              <ChevronLeft size={14} /> Sebelumnya
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-gray-400">{idx + 1} / {cards.length}</span>
              <button onClick={() => setFlipped(false)} className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-400">
                <RotateCcw size={13} />
              </button>
            </div>
            <button onClick={next} disabled={idx === cards.length - 1}
              className="flex items-center gap-1 px-3 py-2 border border-gray-100 rounded-lg text-[13px] text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-colors">
              Selanjutnya <ChevronRight size={14} />
            </button>
          </div>

          <div className="flex gap-1 justify-center mt-4">
            {cards.map((_, i) => (
              <button key={i} onClick={() => { setIdx(i); setFlipped(false) }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx ? 'bg-brand-600 w-4' : 'bg-gray-200'}`} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
