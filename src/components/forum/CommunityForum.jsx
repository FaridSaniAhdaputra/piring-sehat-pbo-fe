import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../hooks/useAuth'
import RetroButton from '../ui/RetroButton'
import RetroInput from '../ui/RetroInput'
import RetroTextarea from '../ui/RetroTextarea'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

export default function CommunityForum() {
  const { user, profile, session } = useAuth()
  const [activeView, setActiveView] = useState('list') // 'list' | 'compose'
  const [editingId, setEditingId] = useState(null)
  
  // ─── Compose State (DTO-Ready) ───
  const [composePayload, setComposePayload] = useState({
    title: '',
    content: '',
    category: 'General',
  })

  // ─── Local State for Threads ───
  const [threads, setThreads] = useState([])
  const [statusMessage, setStatusMessage] = useState('Ready')
  const [loading, setLoading] = useState(false)

  // ─── Fetch Threads dari Backend ───
  const fetchThreads = useCallback(async () => {
    setLoading(true)
    setStatusMessage('Loading threads...')

    try {
      const headers = {}
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      const response = await fetch(`${API_BASE_URL}/api/forums`, { headers })

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }

      const result = await response.json()
      if (result.success) {
        setThreads(result.data || [])
        setStatusMessage(`${result.data?.length || 0} threads loaded`)
      } else {
        throw new Error(result.message || 'Gagal memuat forum')
      }
    } catch (err) {
      console.error('[Forum] Fetch error:', err)
      if (err.message?.includes('Failed to fetch')) {
        setStatusMessage('⚠️ Backend tidak tersedia')
      } else {
        setStatusMessage(`Error: ${err.message}`)
      }
      setThreads([])
    } finally {
      setLoading(false)
    }
  }, [session])

  useEffect(() => {
    fetchThreads()
  }, [fetchThreads])

  const handleEdit = (thread) => {
    setComposePayload({
      title: thread.title,
      content: thread.content || '',
      category: thread.category || 'General',
    })
    setEditingId(thread.id)
    setActiveView('compose')
  }

  // ─── Post Handler (ke Backend API) ───
  const handlePost = async (e) => {
    e.preventDefault()
    if (!session?.access_token) {
      setStatusMessage('⚠️ Login terlebih dahulu untuk membuat forum')
      return
    }
    if (!composePayload.title || !composePayload.content) return

    setLoading(true)
    setStatusMessage('Mengirim forum...')

    try {
      const url = editingId 
        ? `${API_BASE_URL}/api/forums/${editingId}` 
        : `${API_BASE_URL}/api/forums`
        
      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          title: composePayload.title,
          content: composePayload.content,
          category: composePayload.category || 'General',
        })
      })

      const result = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(result?.message || `Server error: ${response.status}`)
      }

      if (result?.success) {
        setStatusMessage(editingId ? 'Forum berhasil diperbarui!' : 'Forum berhasil dibuat!')
        setComposePayload({ title: '', content: '', category: 'General' })
        setEditingId(null)
        setActiveView('list')
        fetchThreads() // Refresh daftar forum
      } else {
        throw new Error(result?.message || (editingId ? 'Gagal memperbarui forum' : 'Gagal membuat forum'))
      }
    } catch (err) {
      console.error('[Forum] Post error:', err)
      if (err.message?.includes('Failed to fetch')) {
        setStatusMessage('⚠️ Backend tidak tersedia')
      } else {
        setStatusMessage(`Error: ${err.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  // ─── Delete Handler ───
  const handleDelete = async (id) => {
    if (!session?.access_token) return

    setLoading(true)
    setStatusMessage('Menghapus forum...')

    try {
      const response = await fetch(`${API_BASE_URL}/api/forums/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const result = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(result?.message || `Server error: ${response.status}`)
      }

      if (result?.success) {
        setStatusMessage('Forum berhasil dihapus')
        fetchThreads()
      } else {
        throw new Error(result?.message || 'Gagal menghapus forum')
      }
    } catch (err) {
      console.error('[Forum] Delete error:', err)
      setStatusMessage(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full gap-2">
      {/* Toolbar */}
      <div className="flex gap-2 mb-1">
        <RetroButton 
          onClick={() => setActiveView('list')} 
          primary={activeView === 'list'}
        >
          📁 View Threads
        </RetroButton>
        <RetroButton 
          onClick={() => { setActiveView('compose'); setEditingId(null); setComposePayload({ title: '', content: '', category: 'General' }) }}
          primary={activeView === 'compose'}
        >
          📝 New Post
        </RetroButton>
        <RetroButton onClick={fetchThreads} disabled={loading}>
          🔄 Refresh
        </RetroButton>
      </div>

      {/* Main Content Area */}
      <div className="retro-groupbox flex-1 flex flex-col mt-0">
        <span className="retro-groupbox-label">
          {activeView === 'list' ? '🌐 Message Board' : '✉️ Compose Message'}
        </span>

        {activeView === 'list' ? (
          <div className="retro-scroll-area flex-1">
            {threads.length === 0 ? (
              <p className="text-gray-500 text-center p-4 text-[11px]">
                {loading ? 'Memuat data...' : 'No threads available. Be the first to post!'}
              </p>
            ) : (
              <table className="retro-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th style={{ width: '80px' }}>Category</th>
                    <th style={{ width: '120px' }}>Date</th>
                    <th style={{ width: '60px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {threads.map((thread) => (
                    <tr key={thread.id}>
                      <td className="font-bold text-[#000080] underline">{thread.title}</td>
                      <td className="text-[10px]">{thread.category}</td>
                      <td className="text-[10px]">{thread.createdAt}</td>
                      <td className="flex justify-around">
                        <button
                          type="button"
                          className="text-[10px] text-blue-600 hover:underline cursor-pointer"
                          onClick={() => handleEdit(thread)}
                          title="Edit Forum"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          className="text-[10px] text-red-600 hover:underline cursor-pointer"
                          onClick={() => handleDelete(thread.id)}
                          title="Hapus Forum"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <form onSubmit={handlePost} className="flex flex-col gap-3 flex-1">
            <RetroInput
              label="Subject:"
              id="forum-title"
              value={composePayload.title}
              onChange={(e) => setComposePayload({ ...composePayload, title: e.target.value })}
              required
            />
            <div className="flex flex-col gap-1">
              <label htmlFor="forum-category" className="text-[12px]">Category:</label>
              <select
                id="forum-category"
                value={composePayload.category}
                onChange={(e) => setComposePayload({ ...composePayload, category: e.target.value })}
                className="retro-input p-1 cursor-pointer"
              >
                <option value="General">General</option>
                <option value="Makanan">Makanan</option>
                <option value="Kesehatan">Kesehatan</option>
                <option value="Olahraga">Olahraga</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
            <div className="flex-1 flex flex-col">
              <RetroTextarea
                label="Message:"
                id="forum-content"
                value={composePayload.content}
                onChange={(e) => setComposePayload({ ...composePayload, content: e.target.value })}
                required
                className="flex-1"
                style={{ height: '100%', minHeight: '150px' }}
              />
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <RetroButton type="submit" primary disabled={loading}>
                {loading ? 'Sending...' : (editingId ? 'Update Message' : 'Send Message')}
              </RetroButton>
              <RetroButton type="button" onClick={() => { setActiveView('list'); setEditingId(null); setComposePayload({ title: '', content: '', category: 'General' }) }}>Cancel</RetroButton>
            </div>
          </form>
        )}
      </div>

      {/* Status Bar */}
      <div className="retro-statusbar mt-auto">
        <div className="retro-statusbar-section">{statusMessage}</div>
        {activeView === 'list' && (
          <div className="retro-statusbar-section" style={{ flex: 'none', width: 120 }}>
            Threads: {threads.length}
          </div>
        )}
      </div>
    </div>
  )
}

