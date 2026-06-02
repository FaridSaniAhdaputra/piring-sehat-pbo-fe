import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

// URL Backend Spring Boot (bisa diganti via .env jika ingin deploy)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

// 1. Membuat Context Autentikasi
const AuthContext = createContext({
  user: null,
  session: null,
  profile: null,
  backendProfile: null,
  backendError: null, // Menyimpan pesan error detail dari backend
  loading: true,
  isRecoveryFlow: false,
  setIsRecoveryFlow: () => {},
  loginWithEmail: async () => {},
  registerWithEmail: async () => {},
  loginWithGoogle: async () => {},
  loginWithGithub: async () => {},
  logout: async () => {},
  refreshProfile: async () => {},
  fetchBackendProfile: async () => {},
  resetPassword: async () => {} // Fitur Lupa Password
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [backendProfile, setBackendProfile] = useState(null)
  const [backendError, setBackendError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isRecoveryFlow, setIsRecoveryFlow] = useState(false)

  // ─── Query Database Supabase: SELECT * FROM user_profiles WHERE id = ? ───
  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (err) {
      setProfile(null)
    }
  }

  // ─── Panggil Backend Spring Boot: GET /api/auth/me ───
  // Fungsi ini membuktikan koneksi frontend → backend berjalan dengan mengirim token JWT
  // Backend mengembalikan format ApiResponse: { success, message, data: {...}, timestamp }
  const fetchBackendProfile = async (accessToken) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Backend responded with status ${response.status}`)
      }

      const apiResponse = await response.json()

      // Ekstrak data profil dari dalam wrapper ApiResponse
      // Format: { success: true, message: "...", data: { id, email, ... }, timestamp: "..." }
      const profileData = apiResponse.data || apiResponse
      setBackendProfile(profileData)
      setBackendError(null) // Reset error jika sukses
      return profileData
    } catch (err) {
      setBackendProfile(null)
      setBackendError(err.message) // Simpan detail error
      return null
    }
  }

  useEffect(() => {
    // Deteksi awal jika ada hash type=recovery pada saat mount pertama kali
    if (window.location.hash && window.location.hash.includes('type=recovery')) {
      setIsRecoveryFlow(true)
    }

    // Dengarkan perubahan auth (termasuk inisialisasi awal lewat event INITIAL_SESSION)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryFlow(true)
      }

      if (event === 'SIGNED_OUT') {
        setIsRecoveryFlow(false)
      }

      if (currentUser) {
        // 1. Ambil data profil dari database (non-blocking)
        fetchUserProfile(currentUser.id)
        
        // 2. Hubungi backend Spring Boot untuk verifikasi JWT (non-blocking)
        if (session?.access_token) {
          fetchBackendProfile(session.access_token)
        }
      } else {
        setProfile(null)
        setBackendProfile(null)
      }
      
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // ─── Efek Auto-Retry: Hubungkan kembali ke backend jika sempat offline ───
  useEffect(() => {
    if (!user || backendProfile || !session?.access_token) return

    // Coba hubungi backend setiap 5 detik jika status masih offline/gagal secara diam-diam
    const interval = setInterval(() => {
      fetchBackendProfile(session.access_token)
    }, 5000)

    return () => clearInterval(interval)
  }, [user, backendProfile, session])

  // C. Fungsi login email
  const loginWithEmail = async (email, password) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err }
    } finally {
      setLoading(false)
    }
  }

  // D. Fungsi registrasi email (menyisipkan metadata username untuk memicu trigger SQL)
  const registerWithEmail = async (username, email, password) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username
          }
        }
      })
      if (error) throw error
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err }
    } finally {
      setLoading(false)
    }
  }

  // E. Login Google
  const loginWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      })
      if (error) throw error
      return data
    } catch (err) {
      console.error('[Google OAuth] Error:', err.message)
      throw err
    }
  }

  // F. Login GitHub
  const loginWithGithub = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: { redirectTo: window.location.origin }
      })
      if (error) throw error
      return data
    } catch (err) {
      console.error('[GitHub OAuth] Error:', err.message)
      throw err
    }
  }

  // G. Logout — Langsung bersihkan state lokal TERLEBIH DAHULU agar UI tidak pernah stuck
  const logout = async () => {
    // LANGKAH 1: Bersihkan semua state React secara instan (UI langsung berubah ke tampilan login)
    setUser(null)
    setSession(null)
    setProfile(null)
    setBackendProfile(null)
    setIsRecoveryFlow(false)
    setLoading(false)

    // LANGKAH 2: Coba beritahu cloud Supabase secara terpisah di latar belakang
    // Jika gagal (misalnya koneksi mati), tidak masalah karena UI sudah bersih
    try {
      supabase.auth.signOut()
    } catch (err) {
      console.warn('[Logout] Cloud signOut gagal (tidak masalah, state lokal sudah bersih):', err.message)
    }
  }

  // H. Refresh data profil secara manual
  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id)
      if (session?.access_token) {
        await fetchBackendProfile(session.access_token)
      }
    }
  }

  // I. Fitur Lupa Password (Kirim Link Reset)
  const resetPassword = async (email) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      })
      if (error) throw error
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err }
    } finally {
      setLoading(false)
    }
  }

  // J. Fitur Ubah Password Baru
  const updatePassword = async (newPassword) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      })
      if (error) throw error
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err }
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    session,
    profile,
    backendProfile,
    backendError, // Ekspor status error detail
    loading,
    isRecoveryFlow,
    setIsRecoveryFlow,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    loginWithGithub,
    logout,
    refreshProfile,
    fetchBackendProfile,
    resetPassword, // Ekspor fitur lupa password
    updatePassword // Ekspor fitur ubah password baru
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
