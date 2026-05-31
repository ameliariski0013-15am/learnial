'use client'
import { useState, useRef } from 'react'
import { Upload, Sparkles, FileCheck, BookOpen, Lightbulb, Tag, Network, ArrowRight } from 'lucide-react'

interface AnalysisResult {
  ringkasan: string
  ide_pokok: string[]
  kata_kunci: string[]
  mindmap: { topik: string; cabang: string[] }
}

export default function StudyAnalysis({ onTextExtracted, onGoToQuiz, userId }: { 
  onTextExtracted: (t: string) => void
  onGoToQuiz: () => void
  userId: string
}) {
  const [text, setText] = useState('')
  const [fileName, setFileName] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [activeTab, setActiveTab] = useState<'ringkasan' | 'ide' | 'kata' | 'mindmap'>('ringkasan')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    const ext = file.name.split('.').pop()?.toLowerCase()

    if (ext === 'pdf') {
      const pdfjsLib = (await import('pdfjs-dist')).default
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`
      const ab = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: ab }).promise
      let extracted = ''
      for (let i = 1; i <= Math.min(pdf.numPages, 15); i++) {
        const page = await pdf.getPage(i)
        const tc = await page.getTextContent()
        extracted += tc.items.map((x: any) => x.str ?? '').join(' ') + '\n'
      }
      setText(extracted.trim())
      onTextExtracted(extracted.trim())
    } else if (ext === 'docx' || ext === 'doc') {
      const mammoth = await import('mammoth')
      const ab = await file.arrayBuffer()
      const res = await mammoth.extractRawText({ arrayBuffer: ab })
      setText(res.value)
      onTextExtracted(res.value)
    } else if (ext === 'pptx' || ext === 'ppt') {
      try {
        const PizZip = (await import('pizzip')).default
        const ab = await file.arrayBuffer()
        const zip = new PizZip(ab)
        let extracted = ''
        const slideFiles = Object.keys(zip.files).filter(f =>
          /ppt\/slides\/slide[0-9]+\.xml/.test(f)
        )
        for (const sf of slideFiles) {
          const xml = zip.files[sf].asText()
          const matches = xml.match(/<a:t[^>]*>([^<]+)<\/a:t>/g) || []
          extracted += matches.map(m => m.replace(/<[^>]+>/g, '')).join(' ') + '\n'
        }
        const trimmed = extracted.trim()
        if (!trimmed) {
          alert('Tidak ada teks yang bisa diekstrak dari file ini.')
          return
        }
        setText(trimmed)
        onTextExtracted(trimmed)
      } catch {
        alert('Gagal membaca file PPTX. Coba copy-paste teks secara manual.')
      }
    }
  }

  async function doAnalysis() {
    if (!text.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })
      if (!res.ok) throw new Error('Server error')
      const data = await res.json()
      setResult(data)
      onTextExtracted(text)

      // Auto-save ke riwayat
      if (userId && fileName) {
        await fetch('/api/riwayat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            nama_file: fileName,
            ringkasan: data.ringkasan,
            ide_pokok: data.ide_pokok,
            kata_kunci: data.kata_kunci,
          })
        }).catch(() => {}) // silent fail jika tidak login
      }
    } catch (e: any) {
      alert('Gagal menganalisis: ' + (e.message || 'Coba lagi.'))
    }
    setLoading(false)
  }

  const tabs = [
    { id: 'ringkasan', label: 'Ringkasan', icon: <BookOpen size={13} /> },
    { id: 'ide',       label: 'Ide Pokok', icon: <Lightbulb size={13} /> },
    { id: 'kata',      label: 'Kata Kunci', icon: <Tag size={13} /> },
    { id: 'mindmap',   label: 'Mind Map',  icon: <Network size={13} /> },
  ] as const

  return (
    <div className="max-w-3xl">
      <div className="bg-brand-50 border border-brand-100 rounded-2xl p-4 mb-5 flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-brand-600 flex items-center justify-center shrink-0">
          <BookOpen size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-[15px] font-semibold text-brand-800">Analisis Materi</h1>
          <p className="text-[12px] text-brand-400">Upload file atau paste teks — AI analisis otomatis</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
        <h2 className="text-[13px] font-semibold text-gray-700 mb-1 flex items-center gap-2">
          <Upload size={14} className="text-brand-600" /> Upload File
        </h2>
        <p className="text-[11px] text-gray-400 mb-3">Mendukung PDF, Word (.docx), PowerPoint (.pptx)</p>

        <div
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            fileName ? 'border-green-400 bg-green-50' : 'border-brand-200 bg-brand-50 hover:border-brand-400'
          }`}
          onClick={() => fileRef.current?.click()}
        >
          {fileName ? (
            <>
              <FileCheck size={28} className="text-green-500 mx-auto mb-2" />
              <p className="text-[13px] font-medium text-green-700">{fileName}</p>
              <p className="text-[11px] text-green-500">File siap dianalisis</p>
            </>
          ) : (
            <>
              <Upload size={28} className="text-brand-400 mx-auto mb-2" />
              <p className="text-[13px] font-medium text-gray-700">Klik untuk upload file</p>
              <p className="text-[11px] text-gray-400">PDF · DOCX · PPTX — maks. 10MB</p>
            </>
          )}
        </div>
        <input ref={fileRef} type="file" accept=".pdf,.pptx,.ppt,.docx,.doc" className="hidden" onChange={handleFile} />

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-[11px] text-gray-400">atau paste teks langsung</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Paste teks materi kuliah di sini..."
          className="w-full min-h-[100px] p-3 border border-gray-100 rounded-xl text-[13px] bg-gray-50 resize-y focus:outline-none focus:border-brand-400 text-gray-700"
        />

        <button
          onClick={doAnalysis}
          disabled={loading || !text.trim()}
          className="mt-3 flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-[13px] font-medium hover:bg-brand-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <><span className="dot-1">●</span><span className="dot-2">●</span><span className="dot-3">●</span> Menganalisis...</>
          ) : (
            <><Sparkles size={14} /> Analisis Sekarang</>
          )}
        </button>
      </div>

      {result && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 fade-in">
          <div className="flex gap-1 mb-4 border-b border-gray-100">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-[12px] border-b-2 -mb-px transition-all ${
                  activeTab === tab.id
                    ? 'border-brand-600 text-brand-600 font-medium'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'ringkasan' && (
            <p className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-line">{result.ringkasan}</p>
          )}
          {activeTab === 'ide' && (
            <ul className="space-y-3">
              {result.ide_pokok.map((p, i) => (
                <li key={i} className="flex gap-3 text-[13px] text-gray-700">
                  <span className="w-5 h-5 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center text-[11px] font-semibold shrink-0 mt-0.5">{i + 1}</span>
                  {p}
                </li>
              ))}
            </ul>
          )}
          {activeTab === 'kata' && (
            <div className="flex flex-wrap gap-2">
              {result.kata_kunci.map((k, i) => (
                <span key={i} className="bg-brand-50 text-brand-800 text-[12px] font-medium px-3 py-1.5 rounded-full">{k}</span>
              ))}
            </div>
          )}
          {activeTab === 'mindmap' && (
            <div className="text-center">
              <div className="inline-block bg-brand-600 text-white text-[13px] font-semibold px-5 py-2 rounded-full mb-5">{result.mindmap.topik}</div>
              <div className="flex flex-wrap gap-2 justify-center">
                {result.mindmap.cabang.map((c, i) => (
                  <div key={i} className="bg-brand-50 text-brand-800 text-[12px] px-4 py-2 rounded-lg border-l-2 border-brand-400">{c}</div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-[12px] text-gray-400">Sudah paham materinya?</p>
            <button
              onClick={onGoToQuiz}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl text-[13px] font-medium hover:bg-brand-800 transition-colors"
            >
              Uji Pemahaman <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}