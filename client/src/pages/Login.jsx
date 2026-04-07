import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMail, FiLock, FiBox, FiArrowRight, FiEye, FiEyeOff, FiShield, FiZap, FiTrendingUp } from 'react-icons/fi'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'
import ThemeToggle from '../components/ui/ThemeToggle'
import { api } from '../store/authStore'

const FloatingOrb = ({ size, color, delay, duration }) => (
  <motion.div
    className={`absolute rounded-full blur-3xl ${color}`}
    style={{ width: size, height: size }}
    initial={{ 
      x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
      y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
      opacity: 0
    }}
    animate={{ 
      x: [null, Math.random() * 200 - 100, Math.random() * -200 + 100],
      y: [null, -200, -100, -200],
      opacity: [0, 0.3, 0.2, 0]
    }}
    transition={{ 
      duration: duration || 15,
      repeat: Infinity,
      delay: delay || 0,
      ease: 'easeInOut'
    }}
  />
)

const GridPattern = () => (
  <div className="absolute inset-0 opacity-5">
    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-blue-500"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  </div>
)

const MorphingShape = () => (
  <motion.svg
    className="absolute w-96 h-96 opacity-20"
    viewBox="0 0 200 200"
    animate={{
      rotate: [0, 360],
      scale: [1, 1.1, 1],
    }}
    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
  >
    <motion.path
      d="M100,20 L180,60 L180,140 L100,180 L20,140 L20,60 Z"
      fill="none"
      stroke="url(#gradient)"
      strokeWidth="2"
      animate={{
        d: [
          'M100,20 L180,60 L180,140 L100,180 L20,140 L20,60 Z',
          'M100,40 L160,80 L160,120 L100,160 L40,120 L40,80 Z',
          'M100,20 L180,60 L180,140 L100,180 L20,140 L20,60 Z',
        ]
      }}
      transition={{ duration: 10, repeat: Infinity }}
    />
    <defs>
      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#8b5cf6" />
      </linearGradient>
    </defs>
  </motion.svg>
)

const ParticleField = () => (
  <div className="absolute inset-0 overflow-hidden">
    {[...Array(50)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-blue-500 rounded-full"
        initial={{ 
          x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
          y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
          opacity: 0
        }}
        animate={{ 
          y: [null, -500],
          opacity: [0, 0.6, 0],
          scale: [0.5, 1, 0.5]
        }}
        transition={{ 
          duration: Math.random() * 10 + 10, 
          repeat: Infinity,
          delay: Math.random() * 10,
          ease: 'linear'
        }}
      />
    ))}
  </div>
)

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [focusedField, setFocusedField] = useState(null)
  const { login, googleLogin } = useAuthStore()
  const { initTheme, theme } = useThemeStore()
  const navigate = useNavigate()
  const containerRef = useRef(null)

  useEffect(() => {
    initTheme()
  }, [initTheme])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      const result = await login(email, password)
      if (result.success) {
        window.location.href = '/dashboard'
      } else {
        setError(result.error || 'Invalid credentials')
      }
    } catch (err) {
      setError('Connection error. Please try again.')
    }
    setIsLoading(false)
  }

  const handleDemoLogin = async () => {
    setError('')
    setIsLoading(true)
    try {
      const result = await login(email || 'demo@cryptofx.com', 'demo123')
      setIsLoading(false)
      if (result.success) {
        window.location.href = '/dashboard'
      } else {
        setError(result.error || 'Demo login not available')
      }
    } catch {
      setError('Demo login not available')
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async (response) => {
    if (!response?.credential) {
      console.error('No credential in response:', response)
      setError('Invalid Google response')
      setIsLoading(false)
      return
    }
    setError('')
    setIsLoading(true)
    try {
      const result = await googleLogin(response.credential, null, null, null)
      if (result.success) {
        window.location.href = '/dashboard'
      } else {
        setError(result.error || 'Google login failed')
      }
    } catch (err) {
      console.error('Google login error:', err)
      setError('Google login failed')
    }
    setIsLoading(false)
  }

  useEffect(() => {
    const GOOGLE_CLIENT_ID = '413957752629-1d02tggq4fkvhulr4c5ll2aqibsac2db.apps.googleusercontent.com'
    
    const initializeGoogleSignIn = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleLogin
        })
        console.log('Google Sign-In initialized')
        return true
      }
      return false
    }

    const checkGoogle = setInterval(() => {
      if (initializeGoogleSignIn()) {
        clearInterval(checkGoogle)
      }
    }, 100)

    setTimeout(() => clearInterval(checkGoogle), 15000)

    return () => clearInterval(checkGoogle)
  }, [])

  const handleGoogleClick = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed()) {
          console.log('One Tap not displayed:', notification.getNotDisplayedReason())
        }
      })
    } else {
      setError('Google sign-in not ready. Please refresh the page.')
    }
  }

  const features = [
    { icon: FiZap, text: 'Instant Execution' },
    { icon: FiShield, text: 'Bank-Grade Security' },
    { icon: FiTrendingUp, text: 'Real-time Analytics' }
  ]

  return (
    <div 
      className={`min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden transition-all duration-500 ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-gray-950 via-blue-950/50 to-purple-950' 
          : 'bg-gradient-to-br from-gray-100 via-blue-50 to-purple-50'
      }`}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <GridPattern />
        <ParticleField />
        <MorphingShape />
        
        <motion.div 
          animate={{ 
            background: [
              'radial-gradient(ellipse at 20% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
              'radial-gradient(ellipse at 80% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)',
              'radial-gradient(ellipse at 50% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 60%)',
              'radial-gradient(ellipse at 20% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
            ]
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute inset-0"
        />
        
        <FloatingOrb size="400px" color="bg-blue-500/10" delay={0} duration={20} className="hidden sm:block" />
        <FloatingOrb size="300px" color="bg-purple-500/10" delay={5} duration={18} className="hidden lg:block" />
        <FloatingOrb size="200px" color="bg-indigo-500/10" delay={10} duration={22} className="hidden md:block" />
      </div>

      <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-50">
        <ThemeToggle />
      </div>

      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md sm:max-w-lg"
      >
        <motion.div 
          className="absolute -inset-1 rounded-[2rem] opacity-50 blur-xl"
          style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.4), rgba(139, 92, 246, 0.4))'
          }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />

        <div className={`relative rounded-[2rem] overflow-hidden ${
          theme === 'dark'
            ? 'bg-gray-900/80 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/50'
            : 'bg-white/90 backdrop-blur-2xl border border-black/5 shadow-2xl shadow-blue-500/10'
        }`}>
          <div className="absolute top-0 left-0 right-0 h-24 sm:h-28 md:h-32 overflow-hidden">
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))'
              }}
            />
            <motion.div
              className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%]"
              style={{
                background: 'conic-gradient(from 0deg, transparent, rgba(59, 130, 246, 0.15), transparent, rgba(139, 92, 246, 0.15), transparent)'
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            />
          </div>

          <div className="relative p-6 sm:p-8 pt-20 sm:pt-24">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-6 sm:mb-8"
            >
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="inline-flex items-center gap-3 mb-4"
              >
                <div className="relative">
                  <motion.div
                    className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl shadow-blue-500/30"
                    animate={{ boxShadow: [
                      '0 10px 40px rgba(59, 130, 246, 0.4)',
                      '0 10px 40px rgba(139, 92, 246, 0.4)',
                      '0 10px 40px rgba(59, 130, 246, 0.4)'
                    ]}}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <FiBox className="w-7 h-7 sm:w-8 h-8 md:w-9 md:h-9 text-white" />
                  </motion.div>
                  <motion.div
                    className="absolute -inset-2 rounded-2xl border-2 border-blue-500/30"
                    animate={{ rotate: 360, scale: [1, 1.05, 1] }}
                    transition={{ duration: 8, repeat: Infinity }}
                  />
                </div>
              </motion.div>
              <h1 className={`text-2xl sm:text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Welcome Back
              </h1>
              <p className={`text-sm sm:text-base ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Login to your trading account</p>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center gap-6 mb-8"
            >
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                    theme === 'dark' 
                      ? 'bg-white/5 text-gray-400 border border-white/10' 
                      : 'bg-blue-50 text-blue-600 border border-blue-200'
                  }`}
                >
                  <feature.icon className="w-3.5 h-3.5 text-blue-500" />
                  {feature.text}
                </motion.div>
              ))}
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30"
                >
                  <p className="text-red-400 text-sm text-center">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <label className={`block text-sm font-medium mb-2 sm:mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email Address
                </label>
                <div className="relative">
                  <motion.div
                    className={`absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 ${focusedField === 'email' ? 'text-blue-500' : theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}
                    animate={{ scale: focusedField === 'email' ? 1.1 : 1 }}
                  >
                    <FiMail className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="you@example.com"
                    required
                    className={`w-full pl-12 sm:pl-14 pr-4 sm:pr-5 py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl text-sm sm:text-base transition-all outline-none backdrop-blur-md ${
                      theme === 'dark'
                        ? 'bg-white/5 border border-white/15 focus:border-blue-500/50 text-white placeholder:text-gray-500'
                        : 'bg-white/60 border border-gray-200/50 focus:border-blue-500/50 text-gray-900 placeholder:text-gray-400'
                    } ${focusedField === 'email' ? 'ring-2 ring-blue-500/20 shadow-lg shadow-blue-500/10' : ''}`}
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <label className={`block text-sm font-medium mb-2 sm:mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Password
                </label>
                <div className="relative">
                  <motion.div
                    className={`absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 ${focusedField === 'password' ? 'text-blue-500' : theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}
                    animate={{ scale: focusedField === 'password' ? 1.1 : 1 }}
                  >
                    <FiLock className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="••••••••"
                    required
                    className={`w-full pl-12 sm:pl-14 pr-12 sm:pr-14 py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl text-sm sm:text-base transition-all outline-none backdrop-blur-md ${
                      theme === 'dark'
                        ? 'bg-white/5 border border-white/15 focus:border-blue-500/50 text-white placeholder:text-gray-500'
                        : 'bg-white/60 border border-gray-200/50 focus:border-blue-500/50 text-gray-900 placeholder:text-gray-400'
                    } ${focusedField === 'password' ? 'ring-2 ring-blue-500/20 shadow-lg shadow-blue-500/10' : ''}`}
                  />
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-4 sm:right-5 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    {showPassword ? <FiEyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <FiEye className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </motion.button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-end text-sm"
              >
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-500 hover:text-blue-400 transition-colors"
                >
                  Forgot password?
                </Link>
              </motion.div>

              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.4)' }}
                whileTap={{ scale: 0.98 }}
                className="relative w-full py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base md:text-lg text-white overflow-hidden disabled:opacity-50 backdrop-blur-md"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 opacity-0 hover:opacity-100"
                />
                <span className="relative flex items-center justify-center gap-2">
                  {isLoading ? (
                    <motion.div
                      className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                  ) : (
                    <>
                      Sign In
                      <motion.span
                        initial={{ x: 0 }}
                        whileHover={{ x: 5 }}
                      >
                        <FiArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                      </motion.span>
                    </>
                  )}
                </span>
              </motion.button>

              <div className="relative my-3 sm:my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className={`w-full border-t ${theme === 'dark' ? 'border-white/10' : 'border-gray-300'}`} />
                </div>
                <div className="relative flex justify-center text-xs sm:text-sm">
                  <span className={`px-3 sm:px-4 ${theme === 'dark' ? 'bg-gray-900 text-gray-500' : 'bg-white text-gray-500'}`}>
                    Or continue with
                  </span>
                </div>
              </div>

              <motion.button
                type="button"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGoogleClick}
                className={`relative w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl font-medium text-sm sm:text-base transition-all overflow-hidden group ${
                  theme === 'dark'
                    ? 'bg-white/5 border border-white/10 hover:bg-white/10'
                    : 'bg-white/80 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(135deg, rgba(66, 133, 244, 0.1) 0%, rgba(234, 67, 53, 0.1) 50%, rgba(251, 188, 5, 0.1) 100%)'
                  }}
                  animate={{
                    backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </div>
                <span className="relative flex items-center justify-center gap-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className={theme === 'dark' ? 'text-white' : 'text-gray-700'}>
                    Continue with Google
                  </span>
                  <motion.span
                    initial={{ x: 0, opacity: 0 }}
                    whileHover={{ x: 5, opacity: 1 }}
                    className="text-blue-500"
                  >
                    →
                  </motion.span>
                </span>
              </motion.button>
            </form>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className={`text-center text-sm mt-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
            >
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-blue-500 hover:text-blue-400 font-medium transition-colors relative group"
              >
                Sign up
                <motion.span
                  className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"
                />
              </Link>
            </motion.p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className={`absolute bottom-6 left-1/2 -translate-x-1/2 text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}
      >
        © 2026 CryptoFX. All rights reserved.
      </motion.div>
    </div>
  )
}
