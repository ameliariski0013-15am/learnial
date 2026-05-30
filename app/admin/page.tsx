'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export const dynamic = 'force-dynamic'

const ADMIN_EMAIL = 'ameliariski0013@mhs.unisbank.ac.id'

interface User {
  id: string
  name: string
  email: string
  image: string
  created_at: string
  last_login: string
  activity_logs: { action: string; created_at: string }[]
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') { router.push('/login'); return }
    if (session?.user?.email !== ADMIN_EMAIL) { router.push('/'); return }

    fetch('/api/admin/users')
      .then(r => r.json())
      .then(data => { setUsers(data || []); setLoading(false) })
  }, [session, status])

  if (status === 'loading') return <div className="p-8">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-sm text-gray-400">Total User</p>
            <p className="text-3xl font-bold text-gray-800">{users.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-sm text-gray-400">Login Hari Ini</p>
            <p className="text-3xl font-bold text-gray-800">
              {users.filter(u => new Date(u.last_login).toDateString() === new Date().toDateString()).length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-sm text-gray-400">Total Aktivitas</p>
            <p className="text-3xl font-bold text-gray-800">
              {users.reduce((acc, u) => acc + (u.activity_logs?.length || 0), 0)}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left p-4 text-gray-500 font-medium">User</th>
                <th className="text-left p-4 text-gray-500 font-medium">Email</th>
                <th className="text-left p-4 text-gray-500 font-medium">Bergabung</th>
                <th className="text-left p-4 text-gray-500 font-medium">Login Terakhir</th>
                <th className="text-left p-4 text-gray-500 font-medium">Aktivitas</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center p-8 text-gray-400">Loading...</td></tr>
              ) : users.map(user => (
                <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-4 flex items-center gap-3">
                    {user.image && <img src={user.image} className="w-8 h-8 rounded-full" alt="" />}
                    <span className="font-medium text-gray-700">{user.name}</span>
                  </td>
                  <td className="p-4 text-gray-500">{user.email}</td>
                  <td className="p-4 text-gray-500">{new Date(user.created_at).toLocaleDateString('id-ID')}</td>
                  <td className="p-4 text-gray-500">{new Date(user.last_login).toLocaleDateString('id-ID')}</td>
                  <td className="p-4 text-gray-500">{user.activity_logs?.length || 0} aktivitas</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}