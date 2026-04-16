import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMail, FiLock, FiUser, FiPhone, FiBox, FiArrowRight, FiShield, FiCheck, FiZap, FiEye, FiEyeOff } from 'react-icons/fi'
import { useAuthStore, api } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'
import ThemeToggle from '../components/ui/ThemeToggle'
import AnimatedBackground from '../components/animations/AnimatedBackground'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [focusedField, setFocusedField] = useState(null)
  const { register, googleLogin } = useAuthStore()
  const { initTheme, theme } = useThemeStore()
  const navigate = useNavigate()

  useEffect(() => {
    initTheme()
  }, [initTheme])

  const validateForm = async () => {
    const newErrors = {}
    if (!name.trim()) newErrors.name = 'Name is required'
    else if (name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters'
    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[a-z][a-z0-9.]*@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format. Must start with a letter and use lowercase.'
    } else {
      try {
        const response = await api.post('/auth/check-email', { email })
        if (response.data && response.data.available === false) {
          newErrors.email = response.data.message || 'This email is already registered. Did you mean to login?'
        }
      } catch (err) {
        if (err.response?.status === 400 && err.response?.data?.message === 'User already exists') {
          newErrors.email = 'This email is already registered. Please login instead.'
        } else if (err.response?.status === 400 && err.response?.data?.message) {
          newErrors.email = err.response.data.message
        } else if (err.response?.status === 409) {
          newErrors.email = 'This email is already registered. Please login instead.'
        } else if (err.response?.status === 422 && err.response?.data?.invalidDomain) {
          newErrors.email = err.response.data.message || 'Google/ Gmail accounts are not allowed.'
        }
      }
    }
    if (!phone.trim()) newErrors.phone = 'Phone is required'
    if (!password) newErrors.password = 'Password is required'
    else if (password.length < 8) newErrors.password = 'Min 8 characters'
    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm'
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    if (!acceptTerms) newErrors.terms = 'You must accept the terms'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        phone
      })
      
      if (response.data.success) {
        window.location.href = '/login'
      } else {
        setError(response.data.error || response.data.message || 'Registration failed. Please try again.')
      }
    } catch (err) {
      if (err.response?.status === 409 || (err.response?.status === 400 && err.response?.data?.message === 'User already exists')) {
        setError('This email is already registered. Please login instead.')
        setErrors({ email: 'This email is already registered. Did you mean to login?' })
      } else if (err.response?.status === 400 && err.response?.data?.message) {
        setError(err.response.data.message)
        setErrors({ ...errors, email: err.response.data.message })
      } else if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError('Registration failed. Please try again later.')
      }
    } finally {
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
        setError(result.error || 'Google sign-up failed')
      }
    } catch (err) {
      console.error('Google signup error:', err)
      setError('Google sign-up failed')
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
        console.log('Google Sign-In initialized on Register page')
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

  const passwordStrength = () => {
    if (!password) return { strength: 0, label: '', color: '' }
    let strength = 0
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^a-zA-Z0-9]/.test(password)) strength++
    
    if (strength <= 1) return { strength: 20, label: 'Very Weak', color: 'bg-red-500' }
    if (strength <= 2) return { strength: 40, label: 'Weak', color: 'bg-orange-500' }
    if (strength <= 3) return { strength: 60, label: 'Fair', color: 'bg-yellow-500' }
    if (strength <= 4) return { strength: 80, label: 'Strong', color: 'bg-blue-500' }
    return { strength: 100, label: 'Very Strong', color: 'bg-purple-500' }
  }

  const strength = passwordStrength()

  const benefits = [
    'Zero trading fees on first $10,000',
    'AI-powered trading signals',
    '24/7 support in 50+ languages',
    'Multi-chain wallet support'
  ]

  return (
    <div 
      className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden transition-all duration-500 ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950' 
          : 'bg-gradient-to-br from-gray-100 via-white to-blue-50'
      }`}
    >
      <AnimatedBackground />

      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-lg sm:max-w-xl"
      >
        <motion.div 
          className="absolute -inset-1 rounded-[2rem] opacity-40 blur-xl"
          style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.5), rgba(124, 58, 237, 0.5))'
          }}
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 5, repeat: Infinity }}
        />

        <div className={`relative rounded-[2rem] overflow-hidden ${
          theme === 'dark'
            ? 'bg-gray-900/80 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/50'
            : 'bg-white/90 backdrop-blur-2xl border border-black/5 shadow-2xl shadow-blue-500/10'
        }`}>
          <div className="absolute top-0 left-0 right-0 h-40 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-purple-500/20" />
            <motion.div
              className="absolute top-0 right-0 w-64 h-64 rounded-full bg-gradient-to-br from-blue-500/30 to-transparent blur-3xl"
              animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
              transition={{ duration: 8, repeat: Infinity }}
            />
          </div>

          <div className="relative p-6 sm:p-8 pt-20 sm:pt-28">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-6"
            >
              <motion.div
                whileHover={{ scale: 1.05, rotate: -5 }}
                className="inline-flex items-center gap-3 mb-3"
              >
                <div className="relative">
                  <motion.div
                    className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl shadow-blue-500/30"
                    animate={{ boxShadow: ['0 10px 40px rgba(59, 130, 246, 0.4)', '0 10px 40px rgba(124, 58, 237, 0.4)', '0 10px 40px rgba(59, 130, 246, 0.4)'] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <FiBox className="w-8 h-8 text-white" />
                  </motion.div>
                </div>
              </motion.div>
              <h1 className={`text-2xl sm:text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Create Account
              </h1>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                Join thousands of traders worldwide
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6"
            >
              {benefits.slice(0, 2).map((benefit, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs ${
                    theme === 'dark' 
                      ? 'bg-white/5 border border-white/10' 
                      : 'bg-blue-50 border border-blue-200'
                  }`}
                >
                  <FiCheck className="w-4 h-4 text-blue-500" />
                  <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{benefit}</span>
                </motion.div>
              ))}
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/30"
                >
                  <p className="text-red-400 text-sm text-center">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.35 }}
              >
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Full Name
                </label>
                <div className="relative">
                  <FiUser className={`absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-5 h-5 ${focusedField === 'name' ? 'text-blue-500' : 'text-gray-400'}`} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="John Doe"
                    className={`w-full pl-12 sm:pl-14 pr-5 py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl transition-all outline-none backdrop-blur-md ${
                      theme === 'dark'
                        ? 'bg-white/5 border border-white/15 focus:border-blue-500/50 text-white'
                        : 'bg-white/60 border border-gray-200/50 focus:border-blue-500/50 text-gray-900'
                    } ${errors.name ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className={`absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-5 h-5 ${focusedField === 'email' ? 'text-blue-500' : 'text-gray-400'}`} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      const val = e.target.value.toLowerCase()
                      setEmail(val)
                      if (val && !/^[a-z][a-z0-9.]*@[^\s@]+\.[^\s@]+$/.test(val)) {
                        setErrors(prev => ({ ...prev, email: 'Invalid email format. Must start with a letter and use lowercase.' }))
                      } else {
                        setErrors(prev => ({ ...prev, email: null }))
                      }
                    }}
                    onFocus={() => setFocusedField('email')}
                    onBlur={async () => {
                      setFocusedField(null)
                      if (email && /^[a-z][a-z0-9.]*@[^\s@]+\.[^\s@]+$/.test(email)) {
                        try {
                          await api.post('/auth/check-email', { email })
                        } catch (err) {
                          if (err.response?.status === 409 || err.response?.status === 422 || err.response?.status === 400) {
                            setErrors(prev => ({ ...prev, email: err.response.data.message }))
                          }
                        }
                      }
                    }}
                    placeholder="john@example.com"
                    className={`w-full pl-12 sm:pl-14 pr-5 py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl transition-all outline-none backdrop-blur-md ${
                      theme === 'dark'
                        ? 'bg-white/5 border border-white/15 focus:border-blue-500/50 text-white'
                        : 'bg-white/60 border border-gray-200/50 focus:border-blue-500/50 text-gray-900'
                    } ${errors.email ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.45 }}
              >
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Phone Number
                </label>
                <div className="relative">
                  <FiPhone className={`absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-5 h-5 ${focusedField === 'phone' ? 'text-blue-500' : 'text-gray-400'}`} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onFocus={() => setFocusedField('phone')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="+1 (555) 123-4567"
                    className={`w-full pl-12 sm:pl-14 pr-5 py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl transition-all outline-none backdrop-blur-md ${
                      theme === 'dark'
                        ? 'bg-white/5 border border-white/15 focus:border-blue-500/50 text-white'
                        : 'bg-white/60 border border-gray-200/50 focus:border-blue-500/50 text-gray-900'
                    } ${errors.phone ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Password
                </label>
                <div className="relative">
                  <FiLock className={`absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-5 h-5 ${focusedField === 'password' ? 'text-blue-500' : 'text-gray-400'}`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Create password"
                    className={`w-full pl-12 sm:pl-14 pr-14 py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl transition-all outline-none backdrop-blur-md ${
                      theme === 'dark'
                        ? 'bg-white/5 border border-white/15 focus:border-blue-500/50 text-white'
                        : 'bg-white/60 border border-gray-200/50 focus:border-blue-500/50 text-gray-900'
                    } ${errors.password ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
                  >
                    {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>
                {password && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`flex-1 h-1.5 rounded-full ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'}`}>
                        <motion.div
                          className={`h-full rounded-full ${strength.color}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${strength.strength}%` }}
                        />
                      </div>
                      <span className={`text-xs font-medium ${
                        strength.label === 'Very Weak' || strength.label === 'Weak' ? 'text-red-400' :
                        strength.label === 'Fair' ? 'text-yellow-400' : 'text-blue-400'
                      }`}>
                        {strength.label}
                      </span>
                    </div>
                  </div>
                )}
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.55 }}
              >
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Confirm Password
                </label>
                <div className="relative">
                  <FiLock className={`absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-5 h-5 ${focusedField === 'confirm' ? 'text-blue-500' : 'text-gray-400'}`} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onFocus={() => setFocusedField('confirm')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Confirm password"
                    className={`w-full pl-12 sm:pl-14 pr-14 py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl transition-all outline-none backdrop-blur-md ${
                      theme === 'dark'
                        ? 'bg-white/5 border border-white/15 focus:border-blue-500/50 text-white'
                        : 'bg-white/60 border border-gray-200/50 focus:border-blue-500/50 text-gray-900'
                    } ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
                  >
                    {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className={`flex items-start gap-4 p-4 rounded-2xl backdrop-blur-md border ${
                  theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white/60 border-gray-200/50'
                }`}
              >
                <motion.button
                  type="button"
                  onClick={() => setAcceptTerms(!acceptTerms)}
                  whileTap={{ scale: 0.9 }}
                  className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center transition-all ${
                    acceptTerms 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                      : theme === 'dark' ? 'border border-white/30' : 'border border-gray-300'
                  }`}
                >
                  {acceptTerms && <FiCheck className="w-3 h-3 text-white" />}
                </motion.button>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  I agree to the{' '}
                  <Link to="/terms" className="text-blue-500 hover:text-blue-400">Terms</Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="text-blue-500 hover:text-blue-400">Privacy Policy</Link>
                </p>
              </motion.div>
              {errors.terms && <p className="text-red-400 text-xs -mt-2">{errors.terms}</p>}

              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.4)' }}
                whileTap={{ scale: 0.98 }}
                className="relative w-full py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base md:text-lg text-white overflow-hidden disabled:opacity-50 backdrop-blur-md shadow-xl shadow-blue-500/30"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 opacity-0 hover:opacity-100 transition-opacity" />
                <span className="relative flex items-center justify-center gap-2">
                  {isLoading ? (
                    <motion.div
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                  ) : (
                    <>
                      Sign up
                      <motion.span initial={{ x: 0 }} whileHover={{ x: 5 }}>
                        <FiArrowRight className="w-5 h-5" />
                      </motion.span>
                    </>
                  )}
                </span>
              </motion.button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className={`w-full border-t ${theme === 'dark' ? 'border-white/10' : 'border-gray-300'}`} />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className={`px-4 ${theme === 'dark' ? 'bg-gray-900 text-gray-500' : 'bg-white text-gray-500'}`}>
                    Or sign up with
                  </span>
                </div>
              </div>

              <motion.button
                type="button"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGoogleClick}
                className={`relative w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl font-medium transition-all overflow-hidden group ${
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
                    Sign up with Google
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

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className={`mt-6 p-5 rounded-2xl border backdrop-blur-md ${
                theme === 'dark' ? 'bg-blue-500/10 border-blue-500/20 shadow-lg shadow-blue-500/10' : 'bg-blue-50/80 border-blue-200/50 shadow-lg shadow-blue-200/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <FiShield className="w-5 h-5 text-blue-500" />
                </motion.div>
                <div>
                  <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Your Security is Our Priority
                  </p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Protected by 256-bit AES encryption
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className={`text-center text-sm mt-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
            >
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-blue-500 hover:text-blue-400 font-medium transition-colors relative group"
              >
                Sign in
                <motion.span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300" />
              </Link>
            </motion.p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
