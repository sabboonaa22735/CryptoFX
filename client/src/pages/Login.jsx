import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { FiMail, FiLock, FiBox, FiArrowRight, FiEye, FiEyeOff, FiShield, FiZap, FiTrendingUp } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'
import { IoLogoApple } from 'react-icons/io'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'
import ThemeToggle from '../components/ui/ThemeToggle'
import { api } from '../store/authStore'

const FaceIdIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 4C7.58 4 4 7.58 4 12s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm-2-6c0-.55-.45-1-1-1s-1 .45-1 1 .45 1 1 1 1-.45 1-1zm6 0c0-.55-.45-1-1-1s-1 .45-1 1 .45 1 1 1 1-.45 1-1zm-3 2c0 1.1-.9 2-2 2s-2-.9-2-2h1v-1c0-.55.45-1 1-1h4c.55 0 1 .45 1 1v1h1z"/>
  </svg>
)

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
  const { login } = useAuthStore()
  const { initTheme, theme } = useThemeStore()
  const navigate = useNavigate()
  const containerRef = useRef(null)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springConfig = { damping: 20, stiffness: 300 }
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), springConfig)
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), springConfig)

  useEffect(() => {
    initTheme()
  }, [initTheme])

  const handleMouseMove = (e) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (rect) {
      mouseX.set((e.clientX - rect.left) / rect.width - 0.5)
      mouseY.set((e.clientY - rect.top) / rect.height - 0.5)
    }
  }

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
    const result = await login('admin@platform.com', 'Admin@123')
    setIsLoading(false)
    if (result.success) {
      window.location.href = '/dashboard'
    } else {
      setError(result.error || 'Demo login failed')
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setIsLoading(true)
    try {
      const mockGoogleId = 'google_' + Date.now()
      const mockEmail = 'user' + Date.now() + '@gmail.com'
      const mockName = 'Google User'
      
      const result = await api.post('/auth/google', {
        googleId: mockGoogleId,
        email: mockEmail,
        name: mockName
      })
      
      if (result.data.success) {
        localStorage.setItem('token', result.data.token)
        localStorage.setItem('refreshToken', result.data.refreshToken)
        window.location.href = '/dashboard'
      } else {
        setError('Google login failed')
      }
    } catch (err) {
      setError('Google login failed. Please try again.')
    }
    setIsLoading(false)
  }

  const handleAppleLogin = async () => {
    setError('')
    setIsLoading(true)
    try {
      const mockAppleId = 'apple_' + Date.now()
      const mockEmail = 'user' + Date.now() + '@icloud.com'
      const mockName = 'Apple User'
      
      const result = await api.post('/auth/apple', {
        appleId: mockAppleId,
        email: mockEmail,
        name: mockName
      })
      
      if (result.data.success) {
        localStorage.setItem('token', result.data.token)
        localStorage.setItem('refreshToken', result.data.refreshToken)
        window.location.href = '/dashboard'
      } else {
        setError('Apple login failed')
      }
    } catch (err) {
      setError('Apple login failed. Please try again.')
    }
    setIsLoading(false)
  }

  const handleFaceIDLogin = async () => {
    setError('')
    setIsLoading(true)
    try {
      const mockFaceId = 'face_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      
      const result = await api.post('/auth/face-login', {
        faceId: mockFaceId
      })
      
      if (result.data.success) {
        localStorage.setItem('token', result.data.token)
        localStorage.setItem('refreshToken', result.data.refreshToken)
        window.location.href = '/dashboard'
      } else {
        setError('Face ID authentication failed')
      }
    } catch (err) {
      setError('Face ID authentication failed. Please try again.')
    }
    setIsLoading(false)
  }

  const features = [
    { icon: FiZap, text: 'Instant Execution' },
    { icon: FiShield, text: 'Bank-Grade Security' },
    { icon: FiTrendingUp, text: 'Real-time Analytics' }
  ]

  return (
    <div 
      className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden transition-all duration-500 ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-gray-950 via-blue-950/50 to-purple-950' 
          : 'bg-gradient-to-br from-gray-100 via-blue-50 to-purple-50'
      }`}
      onMouseMove={handleMouseMove}
    >
      <div className="absolute inset-0 overflow-hidden">
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
        
        <FloatingOrb size="400px" color="bg-blue-500/10" delay={0} duration={20} />
        <FloatingOrb size="300px" color="bg-purple-500/10" delay={5} duration={18} />
        <FloatingOrb size="200px" color="bg-indigo-500/10" delay={10} duration={22} />
      </div>

      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <motion.div
        ref={containerRef}
        style={{ rotateX, rotateY, transformPerspective: 1200 }}
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
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
          <div className="absolute top-0 left-0 right-0 h-32 overflow-hidden">
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

          <div className="relative p-8 pt-24">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-8"
            >
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="inline-flex items-center gap-3 mb-4"
              >
                <div className="relative">
                  <motion.div
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl shadow-blue-500/30"
                    animate={{ boxShadow: [
                      '0 10px 40px rgba(59, 130, 246, 0.4)',
                      '0 10px 40px rgba(139, 92, 246, 0.4)',
                      '0 10px 40px rgba(59, 130, 246, 0.4)'
                    ]}}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <FiBox className="w-9 h-9 text-white" />
                  </motion.div>
                  <motion.div
                    className="absolute -inset-2 rounded-2xl border-2 border-blue-500/30"
                    animate={{ rotate: 360, scale: [1, 1.05, 1] }}
                    transition={{ duration: 8, repeat: Infinity }}
                  />
                </div>
              </motion.div>
              <h1 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Welcome Back
              </h1>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                Sign in to your trading account
              </p>
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

            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email Address
                </label>
                <div className="relative">
                  <motion.div
                    className={`absolute left-5 top-1/2 -translate-y-1/2 ${focusedField === 'email' ? 'text-blue-500' : theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}
                    animate={{ scale: focusedField === 'email' ? 1.1 : 1 }}
                  >
                    <FiMail className="w-5 h-5" />
                  </motion.div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="you@example.com"
                    required
                    className={`w-full pl-14 pr-5 py-5 rounded-2xl text-base transition-all outline-none backdrop-blur-md ${
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
                <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Password
                </label>
                <div className="relative">
                  <motion.div
                    className={`absolute left-5 top-1/2 -translate-y-1/2 ${focusedField === 'password' ? 'text-blue-500' : theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}
                    animate={{ scale: focusedField === 'password' ? 1.1 : 1 }}
                  >
                    <FiLock className="w-5 h-5" />
                  </motion.div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="••••••••"
                    required
                    className={`w-full pl-14 pr-14 py-5 rounded-2xl text-base transition-all outline-none backdrop-blur-md ${
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
                    className={`absolute right-5 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </motion.button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-end"
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
                className="relative w-full py-5 rounded-2xl font-semibold text-lg text-white overflow-hidden disabled:opacity-50 backdrop-blur-md"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 opacity-0 hover:opacity-100"
                />
                <span className="relative flex items-center justify-center gap-2">
                  {isLoading ? (
                    <motion.div
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
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
                        <FiArrowRight className="w-5 h-5" />
                      </motion.span>
                    </>
                  )}
                </span>
              </motion.button>
            </form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="relative my-8"
            >
              <div className={`absolute inset-0 flex items-center ${theme === 'dark' ? 'border-t border-white/10' : 'border-t border-gray-200'}`} />
              <div className="relative flex justify-center">
                <span className={`px-4 text-sm ${theme === 'dark' ? 'bg-gray-900 text-gray-500' : 'bg-white text-gray-400'}`}>
                  or continue with
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="grid grid-cols-3 gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleGoogleLogin}
                className={`py-4 rounded-2xl font-medium text-sm transition-all flex items-center justify-center gap-3 backdrop-blur-md border ${
                  theme === 'dark'
                    ? 'bg-white/10 hover:bg-white/15 border-white/20 text-gray-300 shadow-lg shadow-black/20'
                    : 'bg-white/70 hover:bg-white/90 border-gray-200/50 text-gray-700 shadow-lg shadow-gray-200/50'
                }`}
              >
                <FcGoogle className="w-6 h-6" />
                Google
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleAppleLogin}
                className={`py-4 rounded-2xl font-medium text-sm transition-all flex items-center justify-center gap-3 backdrop-blur-md border ${
                  theme === 'dark'
                    ? 'bg-white/10 hover:bg-white/15 border-white/20 text-gray-300 shadow-lg shadow-black/20'
                    : 'bg-white/70 hover:bg-white/90 border-gray-200/50 text-gray-700 shadow-lg shadow-gray-200/50'
                }`}
              >
                <IoLogoApple className="w-6 h-6" />
                Apple
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleFaceIDLogin}
                className={`py-4 rounded-2xl font-medium text-sm transition-all flex items-center justify-center gap-3 backdrop-blur-md border ${
                  theme === 'dark'
                    ? 'bg-white/10 hover:bg-white/15 border-white/20 text-gray-300 shadow-lg shadow-black/20'
                    : 'bg-white/70 hover:bg-white/90 border-gray-200/50 text-gray-700 shadow-lg shadow-gray-200/50'
                }`}
              >
                <FaceIdIcon />
                Face ID
              </motion.button>
            </motion.div>

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
