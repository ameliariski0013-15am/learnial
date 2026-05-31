'use client'
import { useState, useEffect } from 'react'
import { HelpCircle, Sparkles, CheckCircle, XCircle, Trophy, Calculator, Star, Send, Loader } from 'lucide-react'

interface QuizItem {
  q: string
  opts: string[]
  ans: number
  tipe: string
  langkah: string
  penjelasan_benar: string
  penjelasan_salah: string
}

interface EssayItem {
  q: string
  petunjuk: string
}

interface EssayResult {
  skor: number
  predikat: string
  feedback: string
  poin_benar: string[]
  poin_kurang: string[]
  jawaban_ideal: string
}

export default function QuizGenerator({ sharedText }: { sharedText: string }) {
  const [loading, setLoading] = useState(false)
  const [quiz, setQuiz] = useState<QuizItem[]>([])
  const [essay, setEssay] = useState<EssayItem[]>([])
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [essayAnswers, setEssayAnswers] = useState<Record<number, string>>({})
  const [essayResults, setEssayResults] = useState<Record<number, EssayResult>>({})
  const [essayLoading, setEssayLoading] = useState<Record<number, boolean>>({})
  const [totalPoin, setTotalPoin] = useState(0)
  const [selesai, setSelesai] = useState(false)

  useEffect(() => {
    if (sharedText) doQuiz()
  }, [])

  async function doQuiz() {
    if (!sharedText.trim()) return
    setLoading(true)
    setQuiz([])
    setEssay([])
    setAnswers({})
    setEssayAnswers({})
    setEssayResults({})
    setTotalPoin(0)
    setSelesai(false)
    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sharedText })
      })
      if (!res.ok) throw new Error('Server error')
      const data = await res.json()
      setQuiz(data.pilihan_ganda ?? [])
      setEssay(data.essay ?? [])
    } catch {
      alert('Gagal generate quiz. Coba lagi.')
    }
    setLoading(false)
  }

  function answer(qi: number, oi: number) {
    if (answers[qi] !== undefined) return
    const newAnswers = { ...answers, [qi]: oi }
    setAnswers(newAnswers)
    const isBenar = oi === quiz[qi].ans
    setTotalPoin(prev => prev + (isBenar ? 20 : 10))
    if (Object.keys(newAnswers).length === quiz.length) setSelesai(true)
  }

  async function submitEssay(ei: number) {
    const jawaban = essayAnswers[ei]?.trim()
    if (!jawaban) return
    setEssayLoading(prev => ({ ...prev, [ei]: true }))
    try {
      const res = await fetch('/api/essay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: essay[ei].q,
          answer: jawaban,
          context: sharedText
        })
      })
      const data = await res.json()
      setEssayResults(prev => ({ ...prev, [ei]: data }))
    } catch {
      alert('Gagal menilai essay. Coba lagi.')
    }
    setEssayLoading(prev => ({ ...prev, [ei]: false }))
  }

  const maxPoin = quiz.length * 20

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="bg-brand-50 border border-brand-100 rounded-2xl p-4 mb-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-brand-600 flex items-center justify-center shrink-0">
            <HelpCircle size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-[15px] font-semibold text-brand-800">Quiz Interaktif</h1>
            <p className="text-[12px] text-brand-400">Pilihan ganda + Essay — dari materi yang kamu upload</p>
          </div>
        </div>
        {quiz.length > 0 && (
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-brand-100">
            <Star size={14} className="text-yellow-500 fill-yellow-500" />
            <span className="text-[13px] font-semibold text-gray-800">{totalPoin}</span>
            <span className="text-[11px] text-gray-400">poin</span>
          </div>
        )}
      </div>

      {/* Loading */}
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

      {/* Skor akhir pilihan ganda */}
      {selesai && (
        <div className="bg-white rounded-2xl border border-brand-100 p-4 mb-4 fade-in">
          <div className="flex items-center gap-4">
            <Trophy size={28} className="text-yellow-500" />
            <div className="flex-1">
              <p className="text-[15px] font-semibold text-gray-800">
                Pilihan Ganda Selesai! 🎉
              </p>
              <p className="text-[12px] text-gray-500">
                Poin terkumpul: <span className="font-bold text-brand-600">{totalPoin}</span> dari {maxPoin} poin maksimal
              </p>
            </div>
          </div>
          <div className="mt-3 bg-gray-50 rounded-xl p-3">
            <div className="flex justify-between text-[11px] text-gray-400 mb-1">
              <span>Progress</span>
              <span>{Math.round((totalPoin / maxPoin) * 100)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-600 rounded-full transition-all"
                style={{ width: `${Math.round((totalPoin / maxPoin) * 100)}%` }}
              />
            </div>
          </div>
          {essay.length > 0 && (
            <p className="text-[12px] text-gray-500 mt-3">👇 Lanjutkan dengan soal essay di bawah!</p>
          )}
        </div>
      )}

      {/* Soal Pilihan Ganda */}
      {quiz.map((q, qi) => (
        <div key={qi} className="bg-white rounded-2xl border border-gray-100 p-5 mb-3 fade-in">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-semibold text-brand-400">Soal {qi + 1} dari {quiz.length}</p>
              {q.tipe === 'hitung' && (
                <span className="flex items-center gap-1 text-[10px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full font-medium">
                  <Calculator size={10} /> Hitungan
                </span>
              )}
            </div>
            {answers[qi] !== undefined && (
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${answers[qi] === q.ans ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                {answers[qi] === q.ans ? '+20 poin' : '+10 poin'}
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
                <button key={oi} onClick={() => answer(qi, oi)} disabled={answered}
                  className={`w-full text-left px-4 py-2.5 rounded-xl border text-[13px] transition-all flex items-center gap-2 ${cls}`}>
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

      {/* Soal Essay */}
      {essay.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-[12px] font-semibold text-gray-500 px-2">Soal Essay</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          {essay.map((eq, ei) => (
            <div key={ei} className="bg-white rounded-2xl border border-gray-100 p-5 mb-3 fade-in">
              <p className="text-[11px] font-semibold text-purple-400 mb-2">Essay {ei + 1} dari {essay.length}</p>
              <p className="text-[14px] font-medium text-gray-800 mb-2 leading-relaxed">{eq.q}</p>
              <p className="text-[11px] text-gray-400 mb-3 italic">{eq.petunjuk}</p>

              {!essayResults[ei] ? (
                <>
                  <textarea
                    value={essayAnswers[ei] ?? ''}
                    onChange={e => setEssayAnswers(prev => ({ ...prev, [ei]: e.target.value }))}
                    placeholder="Tulis jawabanmu di sini..."
                    className="w-full min-h-[120px] p-3 border border-gray-100 rounded-xl text-[13px] bg-gray-50 resize-y focus:outline-none focus:border-purple-400 text-gray-700"
                    disabled={!!essayResults[ei]}
                  />
                  <button
                    onClick={() => submitEssay(ei)}
                    disabled={!essayAnswers[ei]?.trim() || essayLoading[ei]}
                    className="mt-3 flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-[13px] font-medium hover:bg-purple-800 disabled:opacity-50 transition-colors"
                  >
                    {essayLoading[ei]
                      ? <><Loader size={13} className="animate-spin" /> Menilai...</>
                      : <><Send size={13} /> Submit Jawaban</>
                    }
                  </button>
                </>
              ) : (
                <div className="space-y-3 fade-in">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[11px] text-gray-400 mb-1">Jawaban kamu:</p>
                    <p className="text-[13px] text-gray-700">{essayAnswers[ei]}</p>
                  </div>

                  <div className={`rounded-xl p-4 ${
                    essayResults[ei].skor >= 90 ? 'bg-green-50 border border-green-200' :
                    essayResults[ei].skor >= 75 ? 'bg-blue-50 border border-blue-200' :
                    essayResults[ei].skor >= 60 ? 'bg-yellow-50 border border-yellow-200' :
                    'bg-red-50 border border-red-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[13px] font-semibold text-gray-800">
                        Skor: {essayResults[ei].skor}/100
                      </p>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        essayResults[ei].skor >= 90 ? 'bg-green-100 text-green-700' :
                        essayResults[ei].skor >= 75 ? 'bg-blue-100 text-blue-700' :
                        essayResults[ei].skor >= 60 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>{essayResults[ei].predikat}</span>
                    </div>
                    <p className="text-[12px] text-gray-700 leading-relaxed">{essayResults[ei].feedback}</p>
                  </div>

                  {essayResults[ei].poin_benar?.length > 0 && (
                    <div className="bg-green-50 border-l-2 border-green-400 rounded-lg p-3">
                      <p className="text-[11px] font-semibold text-green-700 mb-2">✅ Poin yang benar:</p>
                      <ul className="space-y-1">
                        {essayResults[ei].poin_benar.map((p, i) => (
                          <li key={i} className="text-[12px] text-green-800">• {p}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {essayResults[ei].poin_kurang?.length > 0 && (
                    <div className="bg-orange-50 border-l-2 border-orange-400 rounded-lg p-3">
                      <p className="text-[11px] font-semibold text-orange-700 mb-2">📝 Perlu diperbaiki:</p>
                      <ul className="space-y-1">
                        {essayResults[ei].poin_kurang.map((p, i) => (
                          <li key={i} className="text-[12px] text-orange-800">• {p}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="bg-blue-50 border-l-2 border-blue-400 rounded-lg p-3">
                    <p className="text-[11px] font-semibold text-blue-700 mb-1">💡 Jawaban Ideal:</p>
                    <p className="text-[12px] text-blue-800 leading-relaxed">{essayResults[ei].jawaban_ideal}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Ulangi Quiz */}
      {(selesai || quiz.length === 0) && !loading && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 text-center">
          <button onClick={doQuiz}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl text-[13px] font-medium hover:bg-brand-800 transition-colors mx-auto">
            <Sparkles size={14} /> Ulangi Quiz
          </button>
        </div>
      )}
    </div>
  )
}