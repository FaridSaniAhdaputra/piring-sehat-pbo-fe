import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import RetroButton from '../ui/RetroButton'
import RetroInput from '../ui/RetroInput'

export default function AuthWindow() {
  const {
    user,
    profile,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    loginWithGithub,
    logout,
    loading,
    resetPassword
  } = useAuth()

  const [activeTab, setActiveTab] = useState('login')

  // ─── Login State ───
  const [loginPayload, setLoginPayload] = useState({
    email: '',
    password: '',
  })

  // ─── Register State ───
  const [registerPayload, setRegisterPayload] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  // ─── Forgot Password State ───
  const [forgotPayload, setForgotPayload] = useState({
    email: '',
  })

  const [statusMessage, setStatusMessage] = useState('')

  // ─── Login Handler ───
  const handleLogin = async (e) => {
    e.preventDefault()
    
    // Client-side validation to reduce unnecessary authentication request load
    if (loginPayload.password.length < 6) {
      setStatusMessage('Error: Password minimal harus 6 karakter!')
      return
    }

    setStatusMessage('Logging in...')

    const { data, error } = await loginWithEmail(loginPayload.email, loginPayload.password)

    if (error) {
      setStatusMessage(`Error: ${error.message || 'Invalid credentials'}`)
    } else {
      setStatusMessage('Login successful! Welcome back.')
      setLoginPayload({ email: '', password: '' })
    }
  }

  // ─── Register Handler ───
  const handleRegister = async (e) => {
    e.preventDefault()
    
    // Client-side validations
    if (registerPayload.username.trim().length < 3) {
      setStatusMessage('Error: Username minimal harus 3 karakter!')
      return
    }
    if (registerPayload.password.length < 6) {
      setStatusMessage('Error: Password minimal harus 6 karakter!')
      return
    }
    if (registerPayload.password !== registerPayload.confirmPassword) {
      setStatusMessage('Error: Passwords do not match!')
      return
    }

    setStatusMessage('Creating account...')
    const { data, error } = await registerWithEmail(
      registerPayload.username,
      registerPayload.email,
      registerPayload.password
    )

    if (error) {
      setStatusMessage(`Error: ${error.message}`)
    } else {
      if (data?.user?.identities?.length === 0) {
        setStatusMessage('Email sudah terdaftar.')
      } else {
        setStatusMessage('Registrasi sukses! Silakan cek email untuk konfirmasi.')
      }
      setRegisterPayload({ username: '', email: '', password: '', confirmPassword: '' })
    }
  }

  // ─── Forgot Password Handler ───
  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setStatusMessage('Sending reset link...')

    const { data, error } = await resetPassword(forgotPayload.email)

    if (error) {
      setStatusMessage(`Error: ${error.message}`)
    } else {
      setStatusMessage('Tautan reset password telah dikirim ke email Anda!')
      setForgotPayload({ email: '' })
    }
  }

  // ─── OAuth Handlers ───
  const handleGoogleLogin = async () => {
    setStatusMessage('Redirecting to Google...')
    try {
      await loginWithGoogle()
    } catch (error) {
      setStatusMessage(`OAuth Error: ${error.message}`)
    }
  }

  const handleGithubLogin = async () => {
    setStatusMessage('Redirecting to GitHub...')
    try {
      await loginWithGithub()
    } catch (error) {
      setStatusMessage(`OAuth Error: ${error.message}`)
    }
  }

  // ═══════════════════════════════════════════════
  // TAMPILAN SETELAH LOGIN (Logged In View)
  // ═══════════════════════════════════════════════
  if (user) {
    // Gunakan data dari database (profile), fallback ke user metadata
    const displayName = profile?.full_name || profile?.username || user.email?.split('@')[0] || 'User'
    const avatar = profile?.avatar_url || '👤'

    return (
      <div className="flex flex-col h-full justify-between">
        <div className="retro-raised flex-1 p-5 flex flex-col items-center justify-center gap-3 text-center overflow-y-auto">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-none border-2 border-gray-400 bg-gray-200 flex items-center justify-center text-3xl shadow-inner overflow-hidden">
            {avatar && avatar.startsWith('http') ? (
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              avatar || '👤'
            )}
          </div>

          <div>
            <h3 className="font-bold text-sm text-gray-800">Welcome, {displayName}!</h3>
            <p className="text-[11px] text-gray-600 mt-1">{user.email || 'No email'}</p>
          </div>

          <p className="text-[9px] text-gray-400 font-mono mt-1 truncate max-w-[280px]">
            UID: {user.id}
          </p>

          <div className="w-full border-t border-gray-300 my-1"></div>

          <RetroButton onClick={logout} primary className="w-full max-w-[180px] py-1">
            🚪 Log Out
          </RetroButton>
        </div>

        {/* Status Bar */}
        <div className="retro-statusbar">
          <div className="retro-statusbar-section">
            Logged in as {user.email || 'user'}
          </div>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════
  // TAMPILAN FORM LOGIN / REGISTER / RESET PASSWORD
  // ═══════════════════════════════════════════════
  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex">
        <button
          className={`retro-tab ${activeTab === 'login' || activeTab === 'forgot_password' ? 'retro-tab-active' : ''}`}
          disabled={loading}
          onClick={() => { setActiveTab('login'); setStatusMessage('') }}
        >
          🔑 Login
        </button>
        <button
          className={`retro-tab ${activeTab === 'register' ? 'retro-tab-active' : ''}`}
          disabled={loading}
          onClick={() => { setActiveTab('register'); setStatusMessage('') }}
        >
          📝 Register
        </button>
      </div>

      {/* Tab Content */}
      <div className="retro-raised flex-1 p-4 overflow-y-auto">
        {activeTab === 'login' ? (
          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[32px]">🔐</span>
              <div>
                <p className="font-bold text-[13px]">Welcome to PiringSehat</p>
                <p className="text-[11px] text-gray-600">Enter your credentials to continue.</p>
              </div>
            </div>

            <RetroInput label="Email:" id="login-email" type="email" disabled={loading}
              value={loginPayload.email}
              onChange={(e) => setLoginPayload({ ...loginPayload, email: e.target.value })}
              required
            />
            
            <div className="flex flex-col gap-1">
              <RetroInput label="Password:" id="login-password" type="password" disabled={loading}
                value={loginPayload.password}
                onChange={(e) => setLoginPayload({ ...loginPayload, password: e.target.value })}
                required
              />
              <div className="flex justify-end mt-0.5">
                <span
                  onClick={() => { setActiveTab('forgot_password'); setStatusMessage('') }}
                  className="text-[10px] text-blue-700 hover:text-blue-900 hover:underline cursor-pointer font-bold select-none"
                >
                  ❓ Lupa password?
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <RetroButton type="submit" primary disabled={loading}>
                {loading ? 'Please wait...' : 'OK'}
              </RetroButton>
              <RetroButton type="button" disabled={loading}
                onClick={() => setLoginPayload({ email: '', password: '' })}>
                Cancel
              </RetroButton>
            </div>
          </form>
        ) : activeTab === 'register' ? (
          <form onSubmit={handleRegister} className="flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[32px]">👤</span>
              <div>
                <p className="font-bold text-[13px]">Create New Account</p>
                <p className="text-[11px] text-gray-600">Fill in the details below.</p>
              </div>
            </div>

            <RetroInput label="Username:" id="reg-username" disabled={loading}
              value={registerPayload.username}
              onChange={(e) => setRegisterPayload({ ...registerPayload, username: e.target.value })}
              required
            />
            <RetroInput label="Email:" id="reg-email" type="email" disabled={loading}
              value={registerPayload.email}
              onChange={(e) => setRegisterPayload({ ...registerPayload, email: e.target.value })}
              required
            />
            <RetroInput label="Password:" id="reg-password" type="password" disabled={loading}
              value={registerPayload.password}
              onChange={(e) => setRegisterPayload({ ...registerPayload, password: e.target.value })}
              required
            />
            <RetroInput label="Confirm:" id="reg-confirm" type="password" disabled={loading}
              value={registerPayload.confirmPassword}
              onChange={(e) => setRegisterPayload({ ...registerPayload, confirmPassword: e.target.value })}
              required
            />

            <div className="flex justify-end gap-2 mt-2">
              <RetroButton type="submit" primary disabled={loading}>
                {loading ? 'Please wait...' : 'Register'}
              </RetroButton>
              <RetroButton type="button" disabled={loading}
                onClick={() => setRegisterPayload({ username: '', email: '', password: '', confirmPassword: '' })}>
                Clear
              </RetroButton>
            </div>
          </form>
        ) : (
          <form onSubmit={handleForgotPassword} className="flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[32px]">🔑</span>
              <div>
                <p className="font-bold text-[13px]">Reset Password</p>
                <p className="text-[11px] text-gray-600">Enter your email to receive a password reset link.</p>
              </div>
            </div>

            <RetroInput label="Email:" id="forgot-email" type="email" disabled={loading}
              value={forgotPayload.email}
              onChange={(e) => setForgotPayload({ email: e.target.value })}
              required
            />

            <div className="flex justify-end gap-2 mt-2">
              <RetroButton type="submit" primary disabled={loading}>
                {loading ? 'Please wait...' : 'Reset Password'}
              </RetroButton>
              <RetroButton type="button" disabled={loading}
                onClick={() => { setActiveTab('login'); setStatusMessage('') }}>
                Cancel
              </RetroButton>
            </div>
          </form>
        )}

        {/* Social Authentication / OAuth */}
        {activeTab !== 'forgot_password' && (
          <div className="w-full flex flex-col gap-2 mt-4 pt-3 border-t border-dashed border-gray-400">
            <p className="text-[10px] font-bold text-gray-600 text-center">
              ───── Or Connect with OAuth ─────
            </p>
            <div className="flex gap-2">
              <RetroButton type="button" disabled={loading} onClick={handleGoogleLogin}
                className="flex-1 py-1 text-[11px] flex items-center justify-center gap-1">
                🌐 Google OAuth
              </RetroButton>
              <RetroButton type="button" disabled={loading} onClick={handleGithubLogin}
                className="flex-1 py-1 text-[11px] flex items-center justify-center gap-1">
                🐙 GitHub OAuth
              </RetroButton>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="retro-statusbar">
        <div className="retro-statusbar-section truncate">
          {statusMessage || (loading ? 'Processing request...' : 'Ready')}
        </div>
      </div>
    </div>
  )
}
