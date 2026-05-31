'use client'
import { useState, useEffect } from 'react'
import { HelpCircle, Sparkles, CheckCircle, XCircle, Trophy, Calculator } from 'lucide-react'

interface QuizItem {
  q: string
  opts: string[]
  ans: number
  tipe: string
  langkah: string
  penjelasan_benar: string
  penjelasan_salah: string
}

export default function QuizGenerator({ sharedText }: { sharedText: string }) {
  const [loading, setLoading] = useState(false)
  const [quiz, setQuiz] = useState<QuizItem[]>([])
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [score, setScore] = useState<number | null>(null)

  useEffect(() => {
    if (sharedText) doQuiz()
  }, [])

  async function doQuiz() {
    if (!sharedText.trim()) return
    setLoading(true)
    setQuiz([])
    setAnswers({})
    setScore(null)
    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sharedText })
      })
      if (!res.ok) throw new Error('Server error')
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
          <p className="text-[12px] text-brand-400">Soal dari materi yang kamu upload</p>
        </div>
      </div>

      {loading && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <div className="flex justify-center gap-1 mb-3">
            <span className="dot-1 text-brand-600">●</span>
            <span className="dot-2 text-brand-600">●</span>
            <span className="dot-3 text-brand-600">●</span>
          </div>
          <p className="text-[13px] text-gray-500">Sedang membuat soal dari materimu...</p>
        </div>
      )}

      {!loading && quiz.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <p className="text-[13px] text-gray-500 mb-3">Tidak ada soal. Kembali ke Analisis Materi dan upload file terlebih dahulu.</p>
          <button
            onClick={doQuiz}
            disabled={!sharedText}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-[13px] font-medium hover:bg-brand-800 disabled:opacity-50 transition-colors mx-auto"
          >
            <Sparkles size={14} /> Coba Lagi
          </button>
        </div>
      )}

      {score !== null && (
        <div className="bg-white rounded-2xl border border-brand-100 p-4 mb-4 flex items-center gap-4 fade-in">
          <Trophy size={28} className="text-brand-600" />
          <div>
            <p className="text-[15px] font-semibold text-gray-800">
              Skor: {score} / {quiz.length} ({Math.round((score / quiz.length) * 100)}%)
            </p>
            <p className="text-[12px] text-gray-500">
              {score === quiz.length ? 'Sempurna! 🎉' : score >= quiz.length * 0.8 ? 'Bagus sekali!' : score >= quiz.length * 0.6 ? 'Lumayan, pelajari lagi ya!' : 'Yuk pelajari lagi materinya!'}
            </p>
          </div>
        </div>
      )}

      {quiz.map((q, qi) => (
        <div key={qi} className="bg-white rounded-2xl border border-gray-100 p-5 mb-3 fade-in">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-[11px] font-semibold text-brand-400">Soal {qi + 1} dari {quiz.length}</p>
            {q.tipe === 'hitung' && (
              <span className="flex items-center gap-1 text-[10px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full font-medium">
                <Calculator size={10} /> Hitungan
              </span>
            )}
          </div>
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
              {q.tipe === 'hitung' && q.langkah && (
                <div className="bg-orange-50 border-l-2 border-orange-400 rounded-lg p-3">
                  <p className="text-[11px] font-semibold text-orange-600 flex items-center gap-1 mb-2">
                    <Calculator size={12} /> Langkah Penyelesaian
                  </p>
                  <p className="text-[12px] text-orange-800 leading-relaxed whitespace-pre-line">{q.langkah}</p>
                </div>
              )}
              {answers[qi] !== q.ans && (
                <div className="bg-red-50 border-l-2 border-red-400 rounded-lg p-3">
                  <p className="text-[11px] font-semibold text-red-600 flex items-center gap-1 mb-1"><XCircle size={12} /> Kurang Tepat</p>
                  <p className="text-[12px] text-red-700 leading-relaxed">{q.penjelasan_salah}</p>
                </div>
              )}
              <div className="bg-green-50 border-l-2 border-green-400 rounded-lg p-3">
                <p className="text-[11px] font-semibold text-green-700 flex items-center gap-1 mb-1">
                  <CheckCircle size={12} /> Jawaban Benar: {String.fromCharCode(65 + q.ans)}
                </p>
                <p className="text-[12px] text-green-800 leading-relaxed">{q.penjelasan_benar}</p>
              </div>
            </div>
          )}
        </div>
      ))}

      {score !== null && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 text-center">
          <button
            onClick={doQuiz}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl text-[13px] font-medium hover:bg-brand-800 transition-colors mx-auto"
          >
            <Sparkles size={14} /> Ulangi Quiz
          </button>
        </div>
      )}
    </div>
  )
}