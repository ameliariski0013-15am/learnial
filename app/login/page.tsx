'use client'
import { signIn } from 'next-auth/react'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg p-10 flex flex-col items-center gap-6 w-full max-w-sm">
        <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center">
          <span className="text-white text-2xl font-bold">L</span>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Learnial</h1>
          <p className="text-sm text-gray-400 mt-1">Belajar Lebih Cerdas, Jadwal Lebih Rapi</p>
        </div>
        <button
          onClick={() => signIn('google', { callbackUrl: '/' })}
          className="flex items-center gap-3 px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors w-full justify-center"
        >
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5" />
          <span className="text-sm font-medium text-gray-700">Masuk dengan Google</span>
        </button>
      </div>
    </div>
  )
}