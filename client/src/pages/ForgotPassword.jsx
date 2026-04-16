import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMail, FiLock, FiArrowRight, FiCheck, FiX, FiBox, FiEye, FiEyeOff } from 'react-icons/fi'
import { useThemeStore } from '../store/themeStore'
import { api } from '../store/authStore'
import AnimatedBackground from '../components/animations/AnimatedBackground'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [countdown, setCountdown] = useState(0)
  const { theme, initTheme } = useThemeStore()

  useEffect(() => {
    initTheme()
  }, [initTheme])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleSendOtp = async (e) => {
    e.preventDefault()
    if (!email.trim()) {
      setError('Please enter your email address')
      return
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await api.post('/auth/forgot-password', { email })
      setSuccess('OTP sent to your email!')
      setStep(2)
      setCountdown(60)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (!otp.trim() || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await api.post('/auth/verify-otp', { email, otp })
      setSuccess('OTP verified! Please set your new password.')
      setStep(3)
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await api.post('/auth/reset-password', { email, otp, newPassword })
      setSuccess('Password reset successfully! Redirecting to login...')
      setTimeout(() => {
        window.location.href = '/login'
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (countdown > 0) return
    
    setIsLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSuccess('OTP resent successfully!')
      setCountdown(60)
    } catch (err) {
      setError('Failed to resend OTP. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const passwordStrength = () => {
    if (!newPassword) return { strength: 0, label: '', color: '' }
    let strength = 0
    if (newPassword.length >= 8) strength++
    if (/[a-z]/.test(newPassword)) strength++
    if (/[A-Z]/.test(newPassword)) strength++
    if (/\d/.test(newPassword)) strength++
    if (/[^a-zA-Z0-9]/.test(newPassword)) strength++
    
    if (strength <= 1) return { strength: 20, label: 'Very Weak', color: 'bg-red-500' }
    if (strength <= 2) return { strength: 40, label: 'Weak', color: 'bg-orange-500' }
    if (strength <= 3) return { strength: 60, label: 'Fair', color: 'bg-yellow-500' }
    if (strength <= 4) return { strength: 80, label: 'Strong', color: 'bg-blue-500' }
    return { strength: 100, label: 'Very Strong', color: 'bg-purple-500' }
  }

  const strength = passwordStrength()

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden transition-all duration-500 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-950 via-blue-950/50 to-purple-950' 
        : 'bg-gradient-to-br from-gray-100 via-blue-50 to-purple-50'
    }`}>
      <AnimatedBackground />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md sm:max-w-lg"
      >
        <div className={`relative rounded-[2rem] overflow-hidden p-6 sm:p-8 ${
          theme === 'dark'
            ? 'bg-gray-900/80 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/50'
            : 'bg-white/90 backdrop-blur-2xl border border-black/5 shadow-2xl shadow-blue-500/10'
        }`}>
          <div className="text-center mb-8">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="inline-flex items-center gap-3 mb-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl shadow-blue-500/30">
                <FiLock className="w-9 h-9 text-white" />
              </div>
            </motion.div>
            <h1 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {step === 1 && 'Reset Password'}
              {step === 2 && 'Verify OTP'}
              {step === 3 && 'New Password'}
            </h1>
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
              {step === 1 && 'Enter your email to receive OTP'}
              {step === 2 && 'Enter the 6-digit code sent to your email'}
              {step === 3 && 'Create a new secure password'}
            </p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30"
              >
                <p className="text-red-400 text-sm text-center flex items-center justify-center gap-2">
                  <FiX className="w-4 h-4" />
                  {error}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30"
              >
                <p className="text-emerald-400 text-sm text-center flex items-center justify-center gap-2">
                  <FiCheck className="w-4 h-4" />
                  {success}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email Address
                </label>
                <div className="relative">
                  <div className={`absolute left-5 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    <FiMail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className={`w-full pl-14 pr-5 py-5 rounded-2xl text-base transition-all outline-none backdrop-blur-md ${
                      theme === 'dark'
                        ? 'bg-white/5 border border-white/15 focus:border-blue-500/50 text-white placeholder:text-gray-500'
                        : 'bg-white/60 border border-gray-200/50 focus:border-blue-500/50 text-gray-900 placeholder:text-gray-400'
                    }`}
                  />
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.4)' }}
                whileTap={{ scale: 0.98 }}
                className="relative w-full py-5 rounded-2xl font-semibold text-lg text-white overflow-hidden disabled:opacity-50 backdrop-blur-md"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500" />
                <span className="relative flex items-center justify-center gap-2">
                  {isLoading ? (
                    <motion.div
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                  ) : (
                    <>
                      Send OTP
                      <FiArrowRight className="w-5 h-5" />
                    </>
                  )}
                </span>
              </motion.button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Enter OTP
                </label>
                <div className="relative">
                  <div className={`absolute left-5 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    <FiBox className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    required
                    className={`w-full pl-14 pr-5 py-5 rounded-2xl text-base text-center tracking-[0.5em] font-mono transition-all outline-none backdrop-blur-md ${
                      theme === 'dark'
                        ? 'bg-white/5 border border-white/15 focus:border-blue-500/50 text-white placeholder:text-gray-500'
                        : 'bg-white/60 border border-gray-200/50 focus:border-blue-500/50 text-gray-900 placeholder:text-gray-400'
                    }`}
                  />
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.4)' }}
                whileTap={{ scale: 0.98 }}
                className="relative w-full py-5 rounded-2xl font-semibold text-lg text-white overflow-hidden disabled:opacity-50 backdrop-blur-md"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500" />
                <span className="relative flex items-center justify-center gap-2">
                  {isLoading ? (
                    <motion.div
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                  ) : (
                    <>
                      Verify OTP
                      <FiArrowRight className="w-5 h-5" />
                    </>
                  )}
                </span>
              </motion.button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={countdown > 0 || isLoading}
                  className={`text-sm ${countdown > 0 ? 'text-gray-500' : 'text-blue-500 hover:text-blue-400'} transition-colors`}
                >
                  {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  New Password
                </label>
                <div className="relative">
                  <div className={`absolute left-5 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    <FiLock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    className={`w-full pl-14 pr-14 py-5 rounded-2xl text-base transition-all outline-none backdrop-blur-md ${
                      theme === 'dark'
                        ? 'bg-white/5 border border-white/15 focus:border-blue-500/50 text-white placeholder:text-gray-500'
                        : 'bg-white/60 border border-gray-200/50 focus:border-blue-500/50 text-gray-900 placeholder:text-gray-400'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-5 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>
                {newPassword && (
                  <div className="mt-3">
                    <div className="h-1.5 rounded-full bg-gray-700 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${strength.strength}%` }}
                        className={`h-full rounded-full ${strength.color}`}
                      />
                    </div>
                    <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {strength.label}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Confirm Password
                </label>
                <div className="relative">
                  <div className={`absolute left-5 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    <FiLock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    className={`w-full pl-14 pr-5 py-5 rounded-2xl text-base transition-all outline-none backdrop-blur-md ${
                      theme === 'dark'
                        ? 'bg-white/5 border border-white/15 focus:border-blue-500/50 text-white placeholder:text-gray-500'
                        : 'bg-white/60 border border-gray-200/50 focus:border-blue-500/50 text-gray-900 placeholder:text-gray-400'
                    } ${confirmPassword && newPassword !== confirmPassword ? 'border-red-500' : ''}`}
                  />
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={isLoading || (confirmPassword && newPassword !== confirmPassword)}
                whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.4)' }}
                whileTap={{ scale: 0.98 }}
                className="relative w-full py-5 rounded-2xl font-semibold text-lg text-white overflow-hidden disabled:opacity-50 backdrop-blur-md"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500" />
                <span className="relative flex items-center justify-center gap-2">
                  {isLoading ? (
                    <motion.div
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                  ) : (
                    <>
                      Reset Password
                      <FiArrowRight className="w-5 h-5" />
                    </>
                  )}
                </span>
              </motion.button>
            </form>
          )}

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`text-center text-sm mt-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
          >
            Remember your password?{' '}
            <Link
              to="/login"
              className="text-blue-500 hover:text-blue-400 font-medium transition-colors relative group"
            >
              Sign in
              <motion.span
                className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"
              />
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  )
}
