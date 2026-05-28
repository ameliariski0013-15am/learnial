# 🎓 Learnial
> Belajar Lebih Cerdas, Jadwal Lebih Rapi — by Amelia

## Cara Menjalankan (Pilih salah satu)

---

### ✅ Opsi 1: StackBlitz (Paling Cepat, Tanpa Install)
1. Buka https://stackblitz.com/fork/nextjs
2. Hapus semua isi folder `app/`
3. Copy semua file dari project ini ke dalam folder yang sesuai
4. Buat file `.env.local` dan isi API key
5. Langsung jalan otomatis!

---

### ✅ Opsi 2: Lokal (VS Code / Terminal)
```bash
# 1. Install Node.js dari https://nodejs.org (pilih versi LTS)

# 2. Buka terminal, masuk ke folder project
cd learnial

# 3. Install dependencies
npm install

# 4. Buat file .env.local (lihat .env.example)
cp .env.example .env.local
# Isi ANTHROPIC_API_KEY dengan API key kamu

# 5. Jalankan
npm run dev

# 6. Buka browser: http://localhost:3000
```

---

### ✅ Opsi 3: Deploy ke Vercel (Online, Bisa Diakses HP)
1. Upload folder ini ke GitHub
2. Buka https://vercel.com → New Project → Import dari GitHub
3. Tambahkan Environment Variable: `ANTHROPIC_API_KEY`
4. Klik Deploy → selesai! Dapat link publik

---

## Cara Dapat API Key Anthropic
1. Buka https://console.anthropic.com
2. Daftar / Login
3. Klik "API Keys" → Create Key
4. Copy dan paste ke `.env.local`

---

## Struktur Project
```
learnial/
├── app/
│   ├── layout.tsx          ← Root layout + font
│   ├── page.tsx            ← Halaman utama (dashboard)
│   ├── globals.css         ← Global styles
│   └── api/
│       ├── analyze/route.ts    ← AI analisis materi
│       ├── quiz/route.ts       ← AI generate quiz
│       ├── flashcard/route.ts  ← AI generate flashcard
│       └── video/route.ts      ← AI narasi & video
├── components/
│   ├── Sidebar.tsx
│   ├── StudyAnalysis.tsx
│   ├── QuizGenerator.tsx
│   ├── Flashcard.tsx
│   ├── VideoNarasi.tsx
│   └── Schedule.tsx
├── .env.example
├── package.json
└── README.md
```

---

## Fitur
- 📄 Upload PDF / DOCX → analisis otomatis
- 📋 Ringkasan, Ide Pokok, Kata Kunci, Mind Map
- ❓ Quiz interaktif dengan penjelasan benar/salah
- 🃏 Flashcard generator
- 🎥 Rekomendasi video YouTube + narasi AI
- 🔔 Notifikasi jadwal kuliah real-time + alarm
- 📧 Email reminder harian
