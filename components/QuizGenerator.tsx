'use client'
import { useState } from 'react'
import { HelpCircle, Sparkles, CheckCircle, XCircle, Trophy, Copy } from 'lucide-react'

interface QuizItem {
  q: string
  opts: string[]
  ans: number
  penjelasan_benar: string
  penjelasan_salah: string
}

export default function QuizGenerator({ sharedText }: { sharedText: string }) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [quiz, setQuiz] = useState<QuizItem[]>([])
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [score, setScore] = useState<number | null>(null)

  async function doQuiz() {
    if (!text.trim()) return
    setLoading(true)
    setQuiz([])
    setAnswers({})
    setScore(null)
    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })
      const data = await res.json()
      setQuiz(data)
    } catch {
      alert('Gagal generate quiz. Coba lagi.')
    }
    setLoading(false)
  }

  function answer(qi: number, oi: number) {
    if (answers[qi] !== undefined) return
    const newAnswers = { ...answers, [qi]: oi }
    setAnswers(newAnswers)
    if (Object.keys(newAnswers).length === quiz.length) {
      const correct = quiz.filter((q, i) => newAnswers[i] === q.ans).length
      setScore(correct)
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="bg-brand-50 border border-brand-100 rounded-2xl p-4 mb-5 flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-brand-600 flex items-center justify-center shrink-0">
          <HelpCircle size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-[15px] font-semibold text-brand-800">Quiz Interaktif</h1>
          <p className="text-[12px] text-brand-400">Soal pilihan ganda + penjelasan mengapa benar/salah</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
        <h2 className="text-[13px] font-semibold text-gray-700 mb-1">Input Materi</h2>
        <p className="text-[11px] text-gray-400 mb-3">Paste materi atau gunakan teks dari Analisis Materi</p>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Paste materi kuliah di sini..."
          className="w-full min-h-[90px] p-3 border border-gray-100 rounded-xl text-[13px] bg-gray-50 resize-y focus:outline-none focus:border-brand-400 text-gray-700"
        />
        <div className="flex gap-2 mt-3">
          <button
            onClick={doQuiz}
            disabled={loading || !text.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-[13px] font-medium hover:bg-brand-800 disabled:opacity-50 transition-colors"
          >
            {loading
              ? <><span className="dot-1">●</span><span className="dot-2">●</span><span className="dot-3">●</span> Generating...</>
              : <><Sparkles size={14} /> Generate Quiz</>
            }
          </button>
          {sharedText && (
            <button
              onClick={() => setText(sharedText)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-[13px] text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Copy size={13} /> Pakai teks materi
            </button>
          )}
        </div>
      </div>

      {score !== null && (
        <div className="bg-white rounded-2xl border border-brand-100 p-4 mb-4 flex items-center gap-4 fade-in">
          <Trophy size={28} className="text-brand-600" />
          <div>
            <p className="text-[15px] font-semibold text-gray-800">
              Skor: {score} / {quiz.length} ({Math.round((score / quiz.length) * 100)}%)
            </p>
            <p className="text-[12px] text-gray-500">
              {score === quiz.length ? 'Sempurna! Luar biasa Amelia! 🎉' : score >= quiz.length * 0.8 ? 'Bagus sekali! Terus semangat!' : score >= quiz.length * 0.6 ? 'Lumayan, pelajari lagi ya!' : 'Yuk pelajari lagi materinya!'}
            </p>
          </div>
        </div>
      )}

      {quiz.map((q, qi) => (
        <div key={qi} className="bg-white rounded-2xl border border-gray-100 p-5 mb-3 fade-in">
          <p className="text-[11px] font-semibold text-brand-400 mb-2">Soal {qi + 1} dari {quiz.length}</p>
          <p className="text-[14px] font-medium text-gray-800 mb-4 leading-relaxed">{q.q}</p>
          <div className="space-y-2">
            {q.opts.map((opt, oi) => {
              const answered = answers[qi] !== undefined
              const isChosen = answers[qi] === oi
              const isCorrect = oi === q.ans

              let cls = 'border-gray-100 bg-gray-50 text-gray-600 hover:border-brand-300 hover:text-brand-700'
              if (answered) {
                if (isCorrect) cls = 'border-green-400 bg-green-50 text-green-700'
                else if (isChosen && !isCorrect) cls = 'border-red-300 bg-red-50 text-red-700'
                else cls = 'border-gray-100 bg-gray-50 text-gray-400'
              }

              return (
                <button
                  key={oi}
                  onClick={() => answer(qi, oi)}
                  disabled={answered}
                  className={`w-full text-left px-4 py-2.5 rounded-xl border text-[13px] transition-all flex items-center gap-2 ${cls}`}
                >
                  <span className="font-semibold text-[11px] shrink-0">{String.fromCharCode(65 + oi)}</span>
                  {opt}
                  {answered && isCorrect && <CheckCircle size={14} className="ml-auto text-green-500 shrink-0" />}
                  {answered && isChosen && !isCorrect && <XCircle size={14} className="ml-auto text-red-400 shrink-0" />}
                </button>
              )
            })}
          </div>

          {answers[qi] !== undefined && (
            <div className="mt-3 space-y-2">
              {answers[qi] !== q.ans && (
                <div className="bg-red-50 border-l-2 border-red-400 rounded-lg p-3">
                  <p className="text-[11px] font-semibold text-red-600 flex items-center gap-1 mb-1"><XCircle size={12} /> Kurang Tepat</p>
                  <p className="text-[12px] text-red-700 leading-relaxed">{q.penjelasan_salah}</p>
                </div>
              )}
              <div className="bg-green-50 border-l-2 border-green-400 rounded-lg p-3">
                <p className="text-[11px] font-semibold text-green-700 flex items-center gap-1 mb-1"><CheckCircle size={12} /> Jawaban Benar: {String.fromCharCode(65 + q.ans)}</p>
                <p className="text-[12px] text-green-800 leading-relaxed">{q.penjelasan_benar}</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
