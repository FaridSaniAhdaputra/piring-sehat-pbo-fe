import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../supabaseClient'
import RetroButton from '../ui/RetroButton'
import RetroInput from '../ui/RetroInput'
import RetroTextarea from '../ui/RetroTextarea'
import RetroPrompt from '../ui/RetroPrompt'
import RetroAlert from '../ui/RetroAlert'
import RetroConfirm from '../ui/RetroConfirm'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

export default function CommunityForum() {
  const { user, profile, backendProfile, session } = useAuth()
  const [activeView, setActiveView] = useState('list') // 'list' | 'compose' | 'detail'
  const [editingId, setEditingId] = useState(null)
  const [selectedThread, setSelectedThread] = useState(null)

  // ─── Role Checkers ───
  const isModerator =
    profile?.role?.toLowerCase() === 'moderator' ||
    backendProfile?.role?.toLowerCase() === 'moderator' ||
    user?.email?.toLowerCase() === 'moderator@piringsehat.com'
  const isAuthor = (authorId) => user?.id === authorId
  const canDelete = (authorId) => isAuthor(authorId) || isModerator
  const canEdit = (authorId) => isAuthor(authorId) || isModerator

  // ─── Compose State (DTO-Ready) ───
  const [composePayload, setComposePayload] = useState({
    title: '',
    content: '',
    category: 'General',
  })

  // ─── Local State for Threads & Replies ───
  const [threads, setThreads] = useState([])
  
  // FILTERING VISIBILITAS THREAD:
  // Menyaring postingan agar thread yang sudah soft-delete oleh admin ('[Removed by Moderator]')
  // tidak dimunculkan di halaman utama, demi menjaga ketertiban isi papan forum.
  const visibleThreads = threads.filter(thread => thread.content !== '[Removed by Moderator]')
  const [replies, setReplies] = useState([])
  const [statusMessage, setStatusMessage] = useState('Ready')
  const [loading, setLoading] = useState(false)
  const [showReplyPrompt, setShowReplyPrompt] = useState(false)
  const [alertMessage, setAlertMessage] = useState(null)
  const [confirmPayload, setConfirmPayload] = useState(null)

  // ─── Author Profiles Syncing & Premium Fallback Generator ───
  const [profilesMap, setProfilesMap] = useState({})
  const [editingReply, setEditingReply] = useState(null)

  // Generates a unique, constant premium profile name and HSL color block for any user
  const getFallbackProfile = useCallback((authorId) => {
    if (!authorId) return { full_name: 'Anonymous', avatar_url: null };

    // Extract last 4 characters of UUID to make a unique short ID (e.g. User_91A0)
    const shortId = authorId.substring(authorId.length - 4).toUpperCase();
    const displayName = `User_${shortId}`;

    // Hash function to get a constant pastel HSL color based on authorId
    let hash = 0;
    for (let i = 0; i < authorId.length; i++) {
      hash = authorId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    const backgroundColor = `hsl(${hue}, 60%, 45%)`;

    // Select a unique retro system pixel icon based on hash
    const retroIcons = ['💻', '💾', '📁', '🌐', '🔑', '💬', '🕹️', '🖨️', '⚡', '💡', '🔍', '⚙️'];
    const iconIndex = Math.abs(hash) % retroIcons.length;
    const fallbackIcon = retroIcons[iconIndex];

    return {
      id: authorId,
      full_name: displayName,
      username: displayName.toLowerCase(),
      backgroundColor,
      avatar_url: null,
      fallbackIcon,
      isFallback: true
    };
  }, []);

  const fetchProfilesForIds = useCallback(async (ids) => {
    if (!ids || ids.length === 0) return
    const missingIds = ids.filter(id => id && !profilesMap[id])
    if (missingIds.length === 0) return

    console.log('[Forum] Fetching profiles for IDs:', missingIds)

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .in('id', missingIds)

      console.log('[Forum] Supabase response - data:', data, 'error:', error)

      if (error) throw error

      const newMap = {}
      // Pre-fill all missing IDs as fallback profiles
      missingIds.forEach(id => {
        newMap[id] = getFallbackProfile(id)
      })

      // Overwrite with actual retrieved profile from database if available
      if (data && data.length > 0) {
        console.log('[Forum] ✅ Found', data.length, 'profiles from Supabase')
        data.forEach(p => {
          newMap[p.id] = { ...p, isFallback: false }
        })
      } else {
        console.warn('[Forum] ⚠️ No profiles found in user_profiles for IDs:', missingIds)
      }

      setProfilesMap(prev => ({ ...prev, ...newMap }))
    } catch (err) {
      console.error('[Forum] ❌ Error fetching user profiles:', err?.message || err)
      setStatusMessage(`⚠️ Gagal memuat profil: ${err?.message || 'Unknown error'}`)

      // Fallback cache even on error to prevent infinite loops
      const errorFallbackMap = {}
      missingIds.forEach(id => {
        errorFallbackMap[id] = getFallbackProfile(id)
      })
      setProfilesMap(prev => ({ ...prev, ...errorFallbackMap }))
    }
  }, [profilesMap, getFallbackProfile])

  useEffect(() => {
    if (threads && threads.length > 0) {
      const ids = threads.map(t => t.authorId).filter(Boolean)
      fetchProfilesForIds(ids)
    }
  }, [threads, fetchProfilesForIds])

  useEffect(() => {
    if (replies && replies.length > 0) {
      const ids = replies.map(r => r.authorId).filter(Boolean)
      fetchProfilesForIds(ids)
    }
  }, [replies, fetchProfilesForIds])

  // ─── Render Avatar Helper ───
  const renderAvatar = (authorProfile, sizeClass = "w-4 h-4", authorId) => {
    const profileObj = (authorProfile && typeof authorProfile === 'object')
      ? authorProfile
      : getFallbackProfile(authorId);

    const avatarUrl = profileObj?.avatar_url
    const displayName = profileObj?.username || profileObj?.full_name || 'Anonymous'
    const firstLetter = displayName.charAt(0).toUpperCase()

    let backgroundColor = profileObj?.backgroundColor
    if (!backgroundColor) {
      let hash = 0
      const key = displayName
      for (let i = 0; i < key.length; i++) {
        hash = key.charCodeAt(i) + ((hash << 5) - hash)
      }
      const hue = Math.abs(hash) % 360
      backgroundColor = `hsl(${hue}, 60%, 45%)`
    }

    if (avatarUrl && avatarUrl.startsWith('http')) {
      return (
        <img
          src={avatarUrl}
          alt={displayName}
          className={`${sizeClass} inline-block object-cover border border-[#808080] mr-1`}
          onError={(e) => {
            e.target.onerror = null;
            e.target.outerHTML = `<div class="${sizeClass} inline-flex items-center justify-center text-white font-bold select-none text-[10px] border border-[#808080] mr-1" style="background-color: ${backgroundColor}">${firstLetter}</div>`
          }}
        />
      )
    }

    // Render a beautifully designed classic retro system icon for the fallback profile!
    if (profileObj?.isFallback && profileObj?.fallbackIcon) {
      return (
        <div
          className={`${sizeClass} inline-flex items-center justify-center text-[11px] border border-[#808080] mr-1 select-none`}
          style={{ backgroundColor }}
        >
          {profileObj.fallbackIcon}
        </div>
      )
    }

    return (
      <div
        className={`${sizeClass} inline-flex items-center justify-center text-white font-bold select-none text-[10px] border border-[#808080] mr-1`}
        style={{ backgroundColor }}
      >
        {firstLetter}
      </div>
    )
  }

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

  // ─── Fetch Replies untuk Thread tertentu ───
  const fetchReplies = async (threadId) => {
    setLoading(true)
    setStatusMessage('Loading replies...')
    try {
      const response = await fetch(`${API_BASE_URL}/api/forums/${threadId}/replies`)
      if (!response.ok) throw new Error(`Server error: ${response.status}`)
      const result = await response.json()
      if (result.success) {
        setReplies(result.data || [])
        setStatusMessage(`${result.data?.length || 0} replies loaded`)
      }
    } catch (err) {
      console.error('[Forum] Fetch replies error:', err)
      setStatusMessage(`Error: ${err.message}`)
      setReplies([])
    } finally {
      setLoading(false)
    }
  }

  const handleViewThread = (thread) => {
    setSelectedThread(thread)
    setActiveView('detail')
    fetchReplies(thread.id)
  }

  const handleEdit = (thread) => {
    if (!session?.access_token) {
      setAlertMessage('Anda harus login terlebih dahulu untuk mengedit forum.')
      return
    }
    setComposePayload({
      title: thread.title,
      content: thread.content || '',
      category: thread.category || 'General',
    })
    setEditingId(thread.id)
    setActiveView('compose')
  }

  const handleComposeClick = () => {
    if (!session?.access_token) {
      setAlertMessage('Anda harus login terlebih dahulu untuk membuat forum baru.')
      return
    }
    setActiveView('compose')
    setEditingId(null)
    setComposePayload({ title: '', content: '', category: 'General' })
  }

  // ─── Post Handler (ke Backend API) ───
  const handlePost = async (e) => {
    e.preventDefault()
    if (!session?.access_token) {
      setAlertMessage('Anda harus login terlebih dahulu.')
      return
    }
    if (!composePayload.title || !composePayload.content) return

    // Client-side validation to avoid putting burden on the backend
    if (composePayload.title.trim().length < 5 || composePayload.title.trim().length > 255) {
      setAlertMessage('Judul forum harus di antara 5 hingga 255 karakter.')
      return
    }
    if (composePayload.content.trim().length < 10) {
      setAlertMessage('Isi forum minimal harus 10 karakter.')
      return
    }

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

  // ─── Delete Thread Handlers ───
  const executeDelete = async (id) => {
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
        setActiveView('list')
        setSelectedThread(null)
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

  const handleDelete = (id) => {
    if (!session?.access_token) {
      setAlertMessage('Anda harus login terlebih dahulu untuk menghapus forum.')
      return
    }

    setConfirmPayload({
      title: "Confirm Delete",
      message: "Apakah Anda yakin ingin menghapus thread forum ini?",
      onConfirm: () => executeDelete(id)
    })
  }

  // ─── Delete Reply Handlers ───
  const executeDeleteReply = async (replyId) => {
    setLoading(true)
    setStatusMessage('Menghapus balasan...')

    try {
      const response = await fetch(`${API_BASE_URL}/api/forums/replies/${replyId}`, {
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
        setStatusMessage('Balasan berhasil dihapus')
        fetchReplies(selectedThread.id)
      } else {
        throw new Error(result?.message || 'Gagal menghapus balasan')
      }
    } catch (err) {
      console.error('[Forum] Delete reply error:', err)
      setStatusMessage(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteReply = (replyId) => {
    if (!session?.access_token) {
      setAlertMessage('Anda harus login terlebih dahulu untuk menghapus balasan.')
      return
    }

    setConfirmPayload({
      title: "Confirm Delete",
      message: "Apakah Anda yakin ingin menghapus balasan ini?",
      onConfirm: () => executeDeleteReply(replyId)
    })
  }

  // ─── Reply Submit Handler ───
  const handleReplySubmit = async (text) => {
    if (!text.trim()) return
    if (text.trim().length < 10) {
      setAlertMessage('Konten balasan minimal harus 10 karakter.')
      return
    }
    setShowReplyPrompt(false)
    setLoading(true)
    setStatusMessage('Mengirim balasan...')

    try {
      const response = await fetch(`${API_BASE_URL}/api/forums/${selectedThread.id}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ content: text })
      })

      const result = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(result?.message || `Server error: ${response.status}`)
      }

      if (result?.success) {
        setStatusMessage('Balasan berhasil dikirim!')
        fetchReplies(selectedThread.id)
      } else {
        throw new Error(result?.message || 'Gagal mengirim balasan')
      }
    } catch (err) {
      console.error('[Forum] Reply error:', err)
      setStatusMessage(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenReplyPrompt = () => {
    if (!session?.access_token) {
      setAlertMessage('Anda harus login terlebih dahulu untuk membalas.')
      return
    }
    setShowReplyPrompt(true)
  }

  // ─── Reply Edit Handlers ───
  const handleEditReply = (reply) => {
    if (!session?.access_token) {
      setAlertMessage('Anda harus login terlebih dahulu untuk mengedit balasan.')
      return
    }
    setEditingReply({ id: reply.id, content: reply.content })
  }

  const handleReplyEditSubmit = async (text) => {
    if (!text.trim()) return
    if (text.trim().length < 10) {
      setAlertMessage('Konten balasan minimal harus 10 karakter.')
      return
    }
    const replyId = editingReply.id
    setEditingReply(null)
    setLoading(true)
    setStatusMessage('Memperbarui balasan...')

    try {
      const response = await fetch(`${API_BASE_URL}/api/forums/replies/${replyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ content: text })
      })

      const result = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(result?.message || `Server error: ${response.status}`)
      }

      if (result?.success) {
        setStatusMessage('Balasan berhasil diperbarui!')
        fetchReplies(selectedThread.id)
      } else {
        throw new Error(result?.message || 'Gagal memperbarui balasan')
      }
    } catch (err) {
      console.error('[Forum] Update reply error:', err)
      setStatusMessage(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full gap-2 relative">
      {/* Toolbar */}
      <div className="flex gap-2 mb-1">
        <RetroButton
          onClick={() => { setActiveView('list'); setSelectedThread(null); }}
          primary={activeView === 'list'}
        >
          📁 View Threads
        </RetroButton>
        <RetroButton
          onClick={handleComposeClick}
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
          {activeView === 'list' && '🌐 Message Board'}
          {activeView === 'compose' && '✉️ Compose Message'}
          {activeView === 'detail' && '💬 Thread View'}
        </span>

        {activeView === 'list' && (
          <div className="retro-scroll-area flex-1">
            {visibleThreads.length === 0 ? (
              <p className="text-gray-500 text-center p-4 text-[11px]">
                {loading ? 'Memuat data...' : 'No threads available. Be the first to post!'}
              </p>
            ) : (
              <table className="retro-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th style={{ width: '100px' }}>Author</th>
                    <th style={{ width: '80px' }}>Category</th>
                    <th style={{ width: '120px' }}>Date</th>
                    <th style={{ width: '60px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {visibleThreads.map((thread) => {
                    const isThreadRemoved = thread.content === '[Removed by Moderator]'
                    const fallback = getFallbackProfile(thread.authorId)
                    const profileFromDb = profilesMap[thread.authorId]
                    const author = {
                      ...fallback,
                      ...profileFromDb,
                      username: isThreadRemoved ? '[removed]' : (thread.authorUsername || profileFromDb?.username || fallback.username),
                      avatar_url: isThreadRemoved ? null : (thread.authorAvatarUrl || profileFromDb?.avatar_url || null),
                      isFallback: !isThreadRemoved && !thread.authorUsername && !profileFromDb?.username
                    }
                    const authorName = author.username || author.full_name
                    return (
                      <tr key={thread.id}>
                        <td
                          className="font-bold text-[#000080] underline cursor-pointer"
                          onClick={() => handleViewThread(thread)}
                        >
                          {thread.title}
                        </td>
                        <td className="text-[10px] truncate max-w-[100px]" title={authorName}>
                          <div className="flex items-center gap-1 py-1">
                            {isThreadRemoved ? (
                              <div className="w-4 h-4 inline-flex items-center justify-center text-gray-500 border border-[#808080] mr-1 select-none bg-gray-200">🚫</div>
                            ) : (
                              renderAvatar(author, "w-4 h-4", thread.authorId)
                            )}
                            <span className="truncate">{authorName}</span>
                          </div>
                        </td>
                        <td className="text-[10px]">{thread.category}</td>
                        <td className="text-[10px]">{thread.createdAt}</td>
                        <td className="text-center" style={{ width: '60px' }}>
                          <div className="flex justify-center gap-2 items-center py-1">
                            {!isThreadRemoved && canEdit(thread.authorId) && (
                              <button
                                type="button"
                                className="text-[10px] text-blue-600 hover:underline cursor-pointer"
                                onClick={() => handleEdit(thread)}
                                title="Edit Forum"
                              >
                                ✏️
                              </button>
                            )}
                            {!isThreadRemoved && canDelete(thread.authorId) && (
                              <button
                                type="button"
                                className="text-[10px] text-red-600 hover:underline cursor-pointer"
                                onClick={() => handleDelete(thread.id)}
                                title="Hapus Forum"
                              >
                                ✕
                              </button>
                            )}
                            {(isThreadRemoved || (!canEdit(thread.authorId) && !canDelete(thread.authorId))) && (
                              <span className="text-gray-400 select-none">-</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeView === 'compose' && (
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

        {activeView === 'detail' && selectedThread && (
          <div className="flex flex-col flex-1 h-full">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-[#000080] text-[14px]">{selectedThread.title}</h3>
              <RetroButton onClick={handleOpenReplyPrompt}>Reply</RetroButton>
            </div>

            <div className="retro-scroll-area flex-1 p-2 bg-white flex flex-col gap-4">
              {/* Original Post */}
              <div className="border-b-2 border-dotted border-gray-400 pb-2">
                <div className="text-[10px] text-gray-600 mb-1 flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    {(() => {
                      const isThreadRemoved = selectedThread.content === '[Removed by Moderator]'
                      const fallback = getFallbackProfile(selectedThread.authorId)
                      const profileFromDb = profilesMap[selectedThread.authorId]
                      const threadAuthor = {
                        ...fallback,
                        ...profileFromDb,
                        username: isThreadRemoved ? '[removed]' : (selectedThread.authorUsername || profileFromDb?.username || fallback.username),
                        avatar_url: isThreadRemoved ? null : (selectedThread.authorAvatarUrl || profileFromDb?.avatar_url || null),
                        isFallback: !isThreadRemoved && !selectedThread.authorUsername && !profileFromDb?.username
                      }
                      return (
                        <>
                          {isThreadRemoved ? (
                            <div className="w-5 h-5 inline-flex items-center justify-center text-gray-500 border border-[#808080] mr-1 select-none bg-gray-200">🚫</div>
                          ) : (
                            renderAvatar(threadAuthor, "w-5 h-5", selectedThread.authorId)
                          )}
                          <span className="font-bold text-gray-800">
                            {threadAuthor.username || threadAuthor.full_name}
                          </span>
                        </>
                      )
                    })()}
                    <span className="text-gray-400">|</span>
                    <span>Posted on: {selectedThread.createdAt} | Category: {selectedThread.category}</span>
                  </div>
                  {!selectedThread.content?.includes('[Removed by Moderator]') && canDelete(selectedThread.authorId) && (
                    <button
                      className="text-red-600 hover:underline cursor-pointer font-bold px-1"
                      onClick={() => {
                        handleDelete(selectedThread.id);
                        setActiveView('list');
                      }}
                      title="Hapus Thread"
                    >
                      ✕ Hapus Thread
                    </button>
                  )}
                </div>
                {selectedThread.content === '[Removed by Moderator]' ? (
                  <div className="text-[12px] whitespace-pre-wrap italic text-red-600 bg-[#ffdddd] p-2 border border-red-400 mt-2 font-semibold">
                    🚫 [Postingan ini telah dihapus oleh Admin/Moderator]
                  </div>
                ) : (
                  <div className="text-[12px] whitespace-pre-wrap">{selectedThread.content}</div>
                )}
              </div>

              {/* Replies */}
              <div className="flex flex-col gap-2">
                <h4 className="font-bold text-[12px] text-gray-700">Replies ({replies.length}):</h4>
                {replies.length === 0 ? (
                  <p className="text-[11px] text-gray-500 italic">No replies yet.</p>
                ) : (
                  replies.map(reply => {
                    const isReplyRemoved = reply.content === '[Removed by Moderator]'
                    const rFallback = getFallbackProfile(reply.authorId)
                    const rProfileFromDb = profilesMap[reply.authorId]
                    const rAuthor = {
                      ...rFallback,
                      ...rProfileFromDb,
                      username: isReplyRemoved ? '[removed]' : (reply.authorUsername || rProfileFromDb?.username || rFallback.username),
                      avatar_url: isReplyRemoved ? null : (reply.authorAvatarUrl || rProfileFromDb?.avatar_url || null),
                      isFallback: !isReplyRemoved && !reply.authorUsername && !rProfileFromDb?.username
                    }
                    const rAuthorName = rAuthor.username || rAuthor.full_name
                    return (
                      <div key={reply.id} className="bg-gray-100 p-2 border border-gray-300 shadow-[1px_1px_0_#fff_inset,-1px_-1px_0_#888_inset]">
                        <div className="text-[10px] text-gray-600 mb-1 border-b border-gray-300 pb-1 flex justify-between items-center">
                          <div className="flex items-center gap-1">
                            {isReplyRemoved ? (
                              <div className="w-4 h-4 inline-flex items-center justify-center text-gray-500 border border-[#808080] mr-1 select-none bg-gray-200">🚫</div>
                            ) : (
                              renderAvatar(rAuthor, "w-4 h-4", reply.authorId)
                            )}
                            <span className="font-bold text-gray-800">{rAuthorName}</span>
                            <span className="text-gray-400">|</span>
                            <span>Reply on: {reply.createdAt}</span>
                          </div>
                          {!isReplyRemoved && (
                            <div className="flex gap-2">
                              {canEdit(reply.authorId) && (
                                <button
                                  className="text-blue-600 hover:underline cursor-pointer px-1"
                                  onClick={() => handleEditReply(reply)}
                                  title="Edit Balasan"
                                >
                                  ✏️
                                </button>
                              )}
                              {canDelete(reply.authorId) && (
                                <button
                                  className="text-red-600 hover:underline cursor-pointer px-1"
                                  onClick={() => handleDeleteReply(reply.id)}
                                  title="Hapus Balasan"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                        {isReplyRemoved ? (
                          <div className="text-[12px] whitespace-pre-wrap italic text-red-600 bg-[#ffdddd] p-1 border border-red-300 font-semibold">
                            🚫 [Balasan ini telah dihapus oleh Admin/Moderator]
                          </div>
                        ) : (
                          <div className="text-[12px] whitespace-pre-wrap">{reply.content}</div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="retro-statusbar mt-auto">
        <div className="retro-statusbar-section">{statusMessage}</div>
        {activeView === 'list' && (
          <div className="retro-statusbar-section" style={{ flex: 'none', width: 120 }}>
            Threads: {visibleThreads.length}
          </div>
        )}
      </div>

      {/* Reply Prompt */}
      {showReplyPrompt && (
        <RetroPrompt
          title={`Reply to: ${selectedThread?.title}`}
          message="Enter your reply below:"
          onSubmit={handleReplySubmit}
          onCancel={() => setShowReplyPrompt(false)}
        />
      )}

      {/* Edit Reply Prompt */}
      {editingReply && (
        <RetroPrompt
          title="Edit Reply"
          message="Update your reply below:"
          defaultValue={editingReply.content}
          onSubmit={handleReplyEditSubmit}
          onCancel={() => setEditingReply(null)}
        />
      )}

      {/* Alert Component */}
      {alertMessage && (
        <RetroAlert
          title="Access Denied"
          message={alertMessage}
          onClose={() => setAlertMessage(null)}
        />
      )}

      {/* Confirm Component */}
      {confirmPayload && (
        <RetroConfirm
          title={confirmPayload.title}
          message={confirmPayload.message}
          onConfirm={() => {
            confirmPayload.onConfirm();
            setConfirmPayload(null);
          }}
          onCancel={() => setConfirmPayload(null)}
        />
      )}
    </div>
  )
}
