import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => 
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''))
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion'
import { 
  FaUsers, FaChartLine, FaWallet, FaSignOutAlt, 
  FaEdit, FaTrash, FaPlus, FaCoins, FaExchangeAlt,
  FaShieldAlt, FaQrcode, FaSearch, FaChartBar, FaChartPie,
  FaLock, FaUnlock, FaBan, FaCheckCircle, FaTimesCircle,
  FaCog, FaBell, FaServer, FaDatabase, FaUserShield,
  FaDollarSign, FaBitcoin, FaArrowUp, FaArrowDown,
  FaRobot, FaChartArea, FaLayerGroup, FaFire, FaBolt,
  FaExclamationTriangle, FaUserCog, FaKey, FaSync,
  FaHistory, FaFilter, FaDownload, FaUpload, FaEye,
  FaEyeSlash, FaSort, FaTimes, FaCheck,
  FaRocket, FaMicrochip, FaNetworkWired, FaCloud,
  FaCopy, FaSnowflake, FaServer as FaServerIcon, FaCrown,
  FaBriefcase, FaHeadset, FaComments, FaTicketAlt,
  FaPercentage, FaGift, FaHandHoldingUsd, FaClock
} from 'react-icons/fa'
import { 
  FiActivity, FiRefreshCw, FiMenu, FiX, FiTrendingUp, 
  FiTrendingDown, FiSettings, FiLogOut, FiHome, FiGrid,
  FiPieChart, FiDollarSign, FiUsers, FiBarChart2, FiShield,
  FiZap, FiAlertTriangle, FiClock, FiTarget, FiGlobe,
  FiMail, FiArrowRight, FiPlus, FiMinus, FiSend,
  FiMessageSquare, FiPhone, FiVideo, FiFileText,
  FiTrash2, FiEdit3, FiMoreVertical, FiChevronDown,
  FiSearch, FiFilter, FiDownload, FiUpload as FiUploadIcon,
  FiLoader
} from 'react-icons/fi'
import { QRCodeSVG } from 'qrcode.react'
import { useThemeStore } from '../store/themeStore'
import { useTransactionStore } from '../store/transactionStore'
import ThemeToggle from '../components/ui/ThemeToggle'

const COIN_COLORS = {
  BTC: { color: 'from-orange-500 to-yellow-500', icon: '₿', bg: 'bg-orange-500/20', text: 'text-orange-400' },
  ETH: { color: 'from-purple-500 to-blue-500', icon: 'Ξ', bg: 'bg-purple-500/20', text: 'text-purple-400' },
  USDT: { color: 'from-green-500 to-emerald-500', icon: '₮', bg: 'bg-green-500/20', text: 'text-green-400' },
  XRP: { color: 'from-gray-500 to-slate-600', icon: '✕', bg: 'bg-gray-500/20', text: 'text-gray-400' },
  BNB: { color: 'from-yellow-400 to-amber-500', icon: '◈', bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  SOL: { color: 'from-purple-400 via-pink-500 to-orange-400', icon: '◎', bg: 'bg-purple-500/20', text: 'text-purple-400' },
  ADA: { color: 'from-blue-500 to-cyan-500', icon: '₳', bg: 'bg-blue-500/20', text: 'text-blue-400' },
  DOGE: { color: 'from-yellow-300 to-yellow-500', icon: 'Ð', bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  DOT: { color: 'from-pink-500 to-rose-500', icon: '●', bg: 'bg-pink-500/20', text: 'text-pink-400' },
  AVAX: { color: 'from-red-500 to-red-600', icon: '▲', bg: 'bg-red-500/20', text: 'text-red-400' },
  MATIC: { color: 'from-purple-600 to-indigo-600', icon: '⬡', bg: 'bg-purple-500/20', text: 'text-purple-400' },
  LINK: { color: 'from-blue-400 to-cyan-400', icon: '⬡', bg: 'bg-blue-500/20', text: 'text-blue-400' },
}

const SUPPORTED_COINS = ['BTC', 'ETH', 'USDT', 'XRP', 'BNB', 'SOL', 'ADA', 'DOGE', 'DOT', 'AVAX', 'MATIC', 'LINK']

const MotionDiv = motion.div
const MotionButton = motion.button

const ModernCard = ({ children, className = '', hover = true, glow = false, delay = 0 }) => (
  <MotionDiv
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
    whileHover={hover ? { y: -4, scale: 1.01 } : {}}
    className={`rounded-2xl backdrop-blur-xl border transition-all duration-300 ${
      glow 
        ? 'bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20 shadow-lg shadow-primary/10' 
        : 'bg-white/[0.03] dark:bg-white/[0.03] border-white/[0.08] dark:border-white/[0.08]'
    } ${className}`}
  >
    {children}
  </MotionDiv>
)

const GlowButton = ({ children, onClick, variant = 'primary', size = 'md', disabled, className = '' }) => {
  const variants = {
    primary: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25',
    danger: 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/25',
    success: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25',
    warning: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25',
    ghost: 'bg-white/[0.05] border border-white/10 text-white/80 hover:bg-white/[0.1] hover:text-white'
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-lg',
    md: 'px-4 py-2.5 text-sm rounded-xl',
    lg: 'px-6 py-3 text-base rounded-xl'
  }
  
  return (
    <MotionButton
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </MotionButton>
  )
}

const MetricCard = ({ title, value, change, changeType, icon: Icon, color, delay = 0 }) => {
  const isPositive = changeType === 'up'
  
  return (
    <ModernCard hover glow={false} delay={delay} className="p-5 relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-white/50">{title}</span>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${color}/20`}>
            <Icon className={`w-5 h-5 text-${color}`} />
          </div>
        </div>
        <p className="text-2xl font-bold text-white mb-1">{value}</p>
        <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
          {isPositive ? <FaArrowUp className="w-3 h-3" /> : <FaArrowDown className="w-3 h-3" />}
          <span>{change}</span>
        </div>
      </div>
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-${color}/10 blur-2xl`} />
    </ModernCard>
  )
}

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
        <pattern id="grid-admin" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-purple-500"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid-admin)" />
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
      stroke="url(#gradient-admin)"
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
      <linearGradient id="gradient-admin" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8b5cf6" />
        <stop offset="50%" stopColor="#ec4899" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
    </defs>
  </motion.svg>
)

const ParticleField = () => (
  <div className="absolute inset-0 overflow-hidden">
    {[...Array(50)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-purple-500 rounded-full"
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

const HexagonAnimation = () => (
  <motion.div
    className="absolute top-1/4 right-1/4 w-64 h-64"
    animate={{
      rotate: 360,
      scale: [1, 1.1, 1],
    }}
    transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
  >
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <polygon
        points="50,5 93,27.5 93,72.5 50,95 7,72.5 7,27.5"
        fill="none"
        stroke="url(#hex-gradient)"
        strokeWidth="0.5"
        opacity="0.3"
      />
      <polygon
        points="50,15 83,32.5 83,67.5 50,85 17,67.5 17,32.5"
        fill="none"
        stroke="url(#hex-gradient)"
        strokeWidth="0.5"
        opacity="0.5"
      />
      <polygon
        points="50,25 73,37.5 73,62.5 50,75 27,62.5 27,37.5"
        fill="none"
        stroke="url(#hex-gradient)"
        strokeWidth="0.5"
        opacity="0.7"
      />
      <defs>
        <linearGradient id="hex-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
    </svg>
  </motion.div>
)

const CircuitLines = () => (
  <svg className="absolute inset-0 w-full h-full opacity-10">
    <motion.path
      d="M0,100 Q200,50 400,100 T800,100"
      fill="none"
      stroke="url(#circuit-gradient)"
      strokeWidth="1"
      animate={{
        strokeDashoffset: [0, 1000],
        opacity: [0.3, 0.8, 0.3],
      }}
      transition={{ duration: 3, repeat: Infinity }}
    />
    <motion.path
      d="M0,300 Q300,200 600,300 T1200,300"
      fill="none"
      stroke="url(#circuit-gradient)"
      strokeWidth="1"
      animate={{
        strokeDashoffset: [0, 1000],
        opacity: [0.3, 0.8, 0.3],
      }}
      transition={{ duration: 4, repeat: Infinity, delay: 1 }}
    />
    <motion.path
      d="M0,500 Q400,400 800,500 T1600,500"
      fill="none"
      stroke="url(#circuit-gradient)"
      strokeWidth="1"
      animate={{
        strokeDashoffset: [0, 1000],
        opacity: [0.3, 0.8, 0.3],
      }}
      transition={{ duration: 5, repeat: Infinity, delay: 2 }}
    />
    <defs>
      <linearGradient id="circuit-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#8b5cf6" />
        <stop offset="50%" stopColor="#ec4899" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
    </defs>
  </svg>
)

const DataStream = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-0.5 h-20 bg-gradient-to-b from-transparent via-purple-500 to-transparent"
        initial={{ 
          x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
          y: -100,
          opacity: 0
        }}
        animate={{ 
          y: [null, window.innerHeight + 100],
          opacity: [0, 0.6, 0],
        }}
        transition={{ 
          duration: Math.random() * 5 + 5, 
          repeat: Infinity,
          delay: Math.random() * 10,
          ease: 'linear'
        }}
        style={{
          left: `${Math.random() * 100}%`,
        }}
      />
    ))}
  </div>
)

const LoginPage = ({ onLogin, isLoading }) => {
  const { theme, initTheme } = useThemeStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pin, setPin] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [focusedField, setFocusedField] = useState(null)
  const containerRef = useRef(null)
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 500], [0, 150])
  const y2 = useTransform(scrollY, [0, 500], [0, -100])
  
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

  const adminFeatures = [
    { icon: FaServerIcon, text: 'Full System Control', color: 'from-purple-500 to-pink-500' },
    { icon: FaCrown, text: 'Priority Access', color: 'from-amber-500 to-orange-500' },
    { icon: FaShieldAlt, text: 'Military Encryption', color: 'from-emerald-500 to-teal-500' },
  ]
  
  return (
    <div 
      className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden transition-all duration-500 ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-gray-950 via-purple-950/50 to-slate-950' 
          : 'bg-gradient-to-br from-gray-100 via-purple-50 to-slate-50'
      }`}
      onMouseMove={handleMouseMove}
    >
      <div className="absolute inset-0 overflow-hidden">
        <GridPattern />
        <ParticleField />
        <MorphingShape />
        <HexagonAnimation />
        <CircuitLines />
        <DataStream />
        
        <motion.div 
          animate={{ 
            background: [
              'radial-gradient(ellipse at 20% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)',
              'radial-gradient(ellipse at 80% 80%, rgba(236, 72, 153, 0.15) 0%, transparent 50%)',
              'radial-gradient(ellipse at 50% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 60%)',
              'radial-gradient(ellipse at 20% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)',
            ]
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute inset-0"
        />
        
        <FloatingOrb size="400px" color="bg-purple-500/10" delay={0} duration={20} />
        <FloatingOrb size="300px" color="bg-pink-500/10" delay={5} duration={18} />
        <FloatingOrb size="200px" color="bg-amber-500/10" delay={10} duration={22} />
        
        <MotionDiv 
          style={{ y: y1 }}
          className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-2xl"
        />
        <MotionDiv 
          style={{ y: y2 }}
          className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-pink-500/20 to-transparent rounded-full blur-2xl"
        />
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
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.4), rgba(236, 72, 153, 0.4))'
          }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />

        <div className={`relative rounded-[2rem] overflow-hidden ${
          theme === 'dark'
            ? 'bg-gray-900/80 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/50'
            : 'bg-white/90 backdrop-blur-2xl border border-black/5 shadow-2xl shadow-purple-500/10'
        }`}>
          <div className="absolute top-0 left-0 right-0 h-32 overflow-hidden">
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))'
              }}
            />
            <motion.div
              className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%]"
              style={{
                background: 'conic-gradient(from 0deg, transparent, rgba(139, 92, 246, 0.15), transparent, rgba(236, 72, 153, 0.15), transparent)'
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
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-amber-500 flex items-center justify-center shadow-xl shadow-purple-500/30"
                    animate={{ boxShadow: [
                      '0 10px 40px rgba(139, 92, 246, 0.4)',
                      '0 10px 40px rgba(236, 72, 153, 0.4)',
                      '0 10px 40px rgba(139, 92, 246, 0.4)'
                    ]}}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <FaShieldAlt className="w-9 h-9 text-white" />
                  </motion.div>
                  <motion.div
                    className="absolute -inset-2 rounded-2xl border-2 border-purple-500/30"
                    animate={{ rotate: 360, scale: [1, 1.05, 1] }}
                    transition={{ duration: 8, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute -top-1 -right-1 w-4 h-4"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="w-full h-full rounded-full bg-emerald-500" />
                  </motion.div>
                </div>
              </motion.div>
              <h1 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Super Admin Portal
              </h1>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                Access administrative control center
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center gap-4 mb-8"
            >
              {adminFeatures.map((feature, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r ${feature.color} text-white shadow-lg`}
                >
                  <feature.icon className="w-3.5 h-3.5" />
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

            <form onSubmit={(e) => { e.preventDefault(); onLogin({ email, password, pin }); }} className="space-y-5">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email Address
                </label>
                <div className="relative">
                  <motion.div
                    className={`absolute left-4 top-1/2 -translate-y-1/2 ${focusedField === 'email' ? 'text-purple-500' : theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}
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
                    placeholder="superadmin@cryptofx.com"
                    required
                    className={`w-full pl-12 pr-4 py-4 rounded-xl text-base transition-all outline-none ${
                      theme === 'dark'
                        ? 'bg-white/5 border border-white/10 focus:border-purple-500/50 text-white placeholder:text-gray-500'
                        : 'bg-gray-50 border border-gray-200 focus:border-purple-500/50 text-gray-900 placeholder:text-gray-400'
                    } ${focusedField === 'email' ? 'ring-2 ring-purple-500/20' : ''}`}
                  />
                </div>
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
                  <motion.div
                    className={`absolute left-4 top-1/2 -translate-y-1/2 ${focusedField === 'password' ? 'text-purple-500' : theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}
                    animate={{ scale: focusedField === 'password' ? 1.1 : 1 }}
                  >
                    <FaLock className="w-5 h-5" />
                  </motion.div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="••••••••"
                    required
                    className={`w-full pl-12 pr-12 py-4 rounded-xl text-base transition-all outline-none ${
                      theme === 'dark'
                        ? 'bg-white/5 border border-white/10 focus:border-purple-500/50 text-white placeholder:text-gray-500'
                        : 'bg-gray-50 border border-gray-200 focus:border-purple-500/50 text-gray-900 placeholder:text-gray-400'
                    } ${focusedField === 'password' ? 'ring-2 ring-purple-500/20' : ''}`}
                  />
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    {showPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                  </motion.button>
                </div>
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Security PIN
                </label>
                <div className="relative">
                  <motion.div
                    className={`absolute left-4 top-1/2 -translate-y-1/2 ${focusedField === 'pin' ? 'text-purple-500' : theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}
                    animate={{ scale: focusedField === 'pin' ? 1.1 : 1 }}
                  >
                    <FaKey className="w-5 h-5" />
                  </motion.div>
                  <input
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    onFocus={() => setFocusedField('pin')}
                    onBlur={() => setFocusedField(null)}
                    maxLength={6}
                    placeholder="••••••"
                    required
                    className={`w-full pl-12 pr-4 py-4 rounded-xl text-base transition-all outline-none tracking-[0.3em] ${
                      theme === 'dark'
                        ? 'bg-white/5 border border-white/10 focus:border-purple-500/50 text-white placeholder:text-gray-500'
                        : 'bg-gray-50 border border-gray-200 focus:border-purple-500/50 text-gray-900 placeholder:text-gray-400'
                    } ${focusedField === 'pin' ? 'ring-2 ring-purple-500/20' : ''}`}
                  />
                </div>
              </motion.div>

              <motion.button
                type="submit"
                disabled={isLoading || !email || !password || !pin}
                whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(139, 92, 246, 0.4)' }}
                whileTap={{ scale: 0.98 }}
                className="relative w-full py-4 rounded-xl font-semibold text-white overflow-hidden disabled:opacity-50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600 opacity-0 hover:opacity-100"
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
                      Access Portal
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
                  Enhanced Security
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className={`p-4 rounded-xl border ${
                theme === 'dark' ? 'bg-purple-500/5 border-purple-500/20' : 'bg-purple-50 border-purple-200'
              }`}
            >
              <div className="flex items-center justify-center gap-3">
                <motion.div
                  animate={{ 
                    boxShadow: [
                      '0 0 0 0 rgba(139, 92, 246, 0.4)',
                      '0 0 0 8px rgba(139, 92, 246, 0)',
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-purple-500"
                />
                <p className={`text-xs text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  256-bit AES encrypted • Two-factor authentication • Biometric support
                </p>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className={`text-center text-sm mt-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
            >
              <span className="flex items-center justify-center gap-2">
                <FaLock className="w-3 h-3" />
                Restricted access only • Authorized personnel
              </span>
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
        © 2026 CryptoFX Admin Portal. All rights reserved.
      </motion.div>
    </div>
  )
}

const DashboardPage = ({ onLogout }) => {
  const { theme } = useThemeStore()
  const { transactions: localTransactions, updateTransactionStatus } = useTransactionStore()
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New User Registration', message: 'John Doe just signed up', time: '2 min ago', type: 'user', read: false },
    { id: 2, title: 'High Trading Volume', message: 'BTC volume spiked 50%', time: '15 min ago', type: 'alert', read: false },
    { id: 3, title: 'Support Ticket', message: 'New ticket #1234 opened', time: '1 hour ago', type: 'support', read: true },
  ])
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const queryClient = useQueryClient()
  
  const showNotification = (message) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const markNotificationRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ))
    showNotification('Notification marked as read')
  }

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
    showNotification('All notifications marked as read')
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const { data: stats, isLoading } = useQuery({
    queryKey: ['superadmin-stats'],
    queryFn: async () => {
      const res = await fetch('/api/superadmin/dashboard', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      return res.json()
    },
    refetchInterval: 30000
  })

  const [usersData, setUsersData] = useState([])

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers()
    }
  }, [activeTab])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/superadmin/users', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await res.json()
      const usersArray = Array.isArray(data) ? data : (data.users || [])
      
      const usersWithDefaults = usersArray.map(user => ({
        ...user,
        phone: user.phone || '',
        hasPassword: user.hasPassword !== undefined ? user.hasPassword : Boolean(user.password && user.password.length > 0),
        password: user.password || (user.hasPassword ? '••••••••••••' : null)
      }))
      
      setUsersData(usersWithDefaults)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  const { data: apiTransactionsData } = useQuery({
    queryKey: ['superadmin-transactions'],
    queryFn: async () => {
      const res = await fetch('/api/superadmin/transactions', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await res.json()
      return Array.isArray(data) ? data : (data.transactions || [])
    },
    enabled: activeTab === 'transactions'
  })

  const apiTransactions = apiTransactionsData || []
  const transactions = [...localTransactions, ...apiTransactions]

  const handleMarkComplete = (transactionId) => {
    updateTransactionStatus(transactionId, 'completed')
    showNotification('Transaction marked as complete')
  }

  const { data: tradesData } = useQuery({
    queryKey: ['superadmin-trades'],
    queryFn: async () => {
      const res = await fetch('/api/superadmin/trades', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await res.json()
      return Array.isArray(data) ? data : (data.trades || [])
    },
    enabled: activeTab === 'trades'
  })

  const trades = tradesData || []

  const sidebarItems = [
    { id: 'overview', icon: FiGrid, label: 'Overview', color: 'from-blue-500 to-cyan-500' },
    { id: 'users', icon: FiUsers, label: 'Users', color: 'from-purple-500 to-pink-500' },
    { id: 'deposits', icon: FaCoins, label: 'Deposits', color: 'from-emerald-500 to-teal-500' },
    { id: 'transactions', icon: FiDollarSign, label: 'Transactions', color: 'from-amber-500 to-orange-500' },
    { id: 'trades', icon: FaChartLine, label: 'Trades', color: 'from-rose-500 to-pink-500' },
    { id: 'trade-settings', icon: FiZap, label: 'Trade Settings', color: 'from-orange-500 to-amber-500' },
    { id: 'portfolio', icon: FaBriefcase, label: 'Portfolio', color: 'from-violet-500 to-purple-500' },
    { id: 'wallet', icon: FaWallet, label: 'Wallet', color: 'from-cyan-500 to-blue-500' },
    { id: 'support', icon: FaHeadset, label: 'Support', color: 'from-pink-500 to-rose-500' },
    { id: 'security', icon: FaShieldAlt, label: 'Security', color: 'from-red-500 to-rose-500' },
    { id: 'analytics', icon: FaChartPie, label: 'Analytics', color: 'from-indigo-500 to-blue-500' },
    { id: 'settings', icon: FiSettings, label: 'Settings', color: 'from-gray-500 to-gray-600' },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] } }
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <MotionDiv
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        className="fixed left-0 top-0 h-full backdrop-blur-xl bg-gray-900/50 border-r border-white/5 z-50"
      >
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center justify-between border-b border-white/5">
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-cyan-500 to-purple-500 flex items-center justify-center">
                    <FaShieldAlt className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-lg font-bold text-white">CryptoFX</span>
                </motion.div>
              )}
            </AnimatePresence>
            <MotionButton
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all"
            >
              {sidebarOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
            </MotionButton>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {sidebarItems.map((item, i) => (
              <MotionButton
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setActiveTab(item.id)}
                whileHover={{ x: 4 }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === item.id
                    ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="font-medium whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </MotionButton>
            ))}
          </nav>

          <div className="p-4 border-t border-white/5">
            <MotionButton
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
            >
              <FiLogOut className="w-5 h-5" />
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="font-medium"
                  >
                    Logout
                  </motion.span>
                )}
              </AnimatePresence>
            </MotionButton>
          </div>
        </div>
      </MotionDiv>

      <div className={`flex-1 ${sidebarOpen ? 'ml-72' : 'ml-24'} transition-all duration-300`}>
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, y: -20, x: 50 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: -20, x: 50 }}
              className="fixed top-4 right-4 z-[100] px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium text-sm shadow-lg shadow-emerald-500/30 flex items-center gap-2"
            >
              <FaCheckCircle className="w-4 h-4" />
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>
        
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-gray-950/50 border-b border-white/5">
          <div className="px-8 py-5 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white capitalize">{activeTab}</h1>
              <p className="text-sm text-white/40">Real-time platform monitoring</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <MotionButton
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
                >
                  <FaBell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs font-bold flex items-center justify-center"
                    >
                      {unreadCount}
                    </motion.span>
                  )}
                </MotionButton>
                
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 top-full mt-2 w-80 rounded-xl bg-gray-900/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden"
                    >
                      <div className="p-4 border-b border-white/10 flex items-center justify-between">
                        <h3 className="font-semibold text-white">Notifications</h3>
                        <button
                          onClick={markAllRead}
                          className="text-xs text-blue-400 hover:text-blue-300"
                        >
                          Mark all read
                        </button>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.map((notif) => (
                          <motion.div
                            key={notif.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onClick={() => markNotificationRead(notif.id)}
                            className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${
                              !notif.read ? 'bg-white/5' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                notif.type === 'user' ? 'bg-purple-500/20 text-purple-400' :
                                notif.type === 'alert' ? 'bg-amber-500/20 text-amber-400' :
                                'bg-blue-500/20 text-blue-400'
                              }`}>
                                {notif.type === 'user' ? <FiUsers className="w-4 h-4" /> :
                                 notif.type === 'alert' ? <FiAlertTriangle className="w-4 h-4" /> :
                                 <FaHeadset className="w-4 h-4" />}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-white">{notif.title}</p>
                                <p className="text-xs text-white/50 mt-0.5">{notif.message}</p>
                                <p className="text-xs text-white/30 mt-1">{notif.time}</p>
                              </div>
                              {!notif.read && (
                                <span className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </span>
                <span className="text-sm font-medium text-emerald-400">System Online</span>
              </div>
            </div>
          </div>
        </header>

        <main className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'overview' && <OverviewTab stats={stats} isLoading={isLoading} showNotification={showNotification} />}
              {activeTab === 'users' && <UsersTab users={usersData} showNotification={showNotification} />}
              {activeTab === 'deposits' && <DepositTab showNotification={showNotification} />}
              {activeTab === 'transactions' && <TransactionsTab transactions={transactions} showNotification={showNotification} />}
              {activeTab === 'trades' && <TradesTab trades={trades} showNotification={showNotification} />}
              {activeTab === 'trade-settings' && <TradeSettingsTab showNotification={showNotification} />}
              {activeTab === 'portfolio' && <PortfolioTab showNotification={showNotification} />}
              {activeTab === 'wallet' && <WalletTab showNotification={showNotification} />}
              {activeTab === 'support' && <SupportTab showNotification={showNotification} />}
              {activeTab === 'security' && <SecurityTab showNotification={showNotification} />}
              {activeTab === 'analytics' && <AnalyticsTab stats={stats} showNotification={showNotification} />}
              {activeTab === 'settings' && <SettingsTab showNotification={showNotification} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

const OverviewTab = ({ stats, isLoading }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] } }
  }

  const metrics = [
    { label: 'Total Users', value: stats?.totalUsers || 0, change: '+12.5%', icon: FaUsers, color: 'blue' },
    { label: 'Trading Volume', value: `$${(stats?.volume || 0).toLocaleString()}`, change: '+8.2%', icon: FaChartLine, color: 'emerald' },
    { label: 'Active Trades', value: stats?.activeTrades || 0, change: '+23.1%', icon: FaExchangeAlt, color: 'purple' },
    { label: 'Revenue', value: `$${(stats?.revenue || 0).toLocaleString()}`, change: '+15.7%', icon: FaDollarSign, color: 'amber' },
  ]

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {metrics.map((metric, i) => (
          <MetricCard key={metric.label} {...metric} delay={i * 0.1} />
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <ModernCard className="p-6" hover={false}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Trading Volume (24h)</h3>
              <div className="flex items-center gap-2 text-emerald-400">
                <FaArrowUp className="w-4 h-4" />
                <span className="text-sm font-medium">+5.2%</span>
              </div>
            </div>
            <div className="h-64 flex items-center justify-center">
              <div className="w-full h-full bg-gradient-to-t from-blue-500/20 to-transparent rounded-xl flex items-end justify-around p-4">
                {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: i * 0.05, duration: 0.5 }}
                    className="w-6 rounded-t-lg bg-gradient-to-t from-blue-500 to-cyan-400"
                  />
                ))}
              </div>
            </div>
          </ModernCard>
        </motion.div>

        <motion.div variants={itemVariants}>
          <ModernCard className="p-6" hover={false}>
            <h3 className="text-lg font-semibold text-white mb-6">Market Share</h3>
            <div className="space-y-4">
              {[
                { coin: 'Bitcoin', symbol: 'BTC', percent: 42, color: 'from-orange-400 to-yellow-400' },
                { coin: 'Ethereum', symbol: 'ETH', percent: 28, color: 'from-purple-400 to-indigo-400' },
                { coin: 'Solana', symbol: 'SOL', percent: 18, color: 'from-emerald-400 to-teal-400' },
                { coin: 'Others', symbol: 'ALT', percent: 12, color: 'from-gray-400 to-gray-500' },
              ].map((item) => (
                <div key={item.symbol} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/80">{item.coin}</span>
                    <span className="text-white font-medium">{item.percent}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percent}%` }}
                      transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                      className={`h-full rounded-full bg-gradient-to-r ${item.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </ModernCard>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <ModernCard className="p-6" hover={false}>
            <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {[
                { user: 'John D.', action: 'deposited', amount: '$5,000', time: '2m ago', type: 'deposit' },
                { user: 'Sarah M.', action: 'withdrew', amount: '$2,500', time: '5m ago', type: 'withdraw' },
                { user: 'Mike R.', action: 'traded', amount: '0.5 BTC', time: '8m ago', type: 'trade' },
                { user: 'Emma W.', action: 'registered', amount: '', time: '12m ago', type: 'register' },
              ].map((activity, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      activity.type === 'deposit' ? 'bg-emerald-500/20 text-emerald-400' :
                      activity.type === 'withdraw' ? 'bg-red-500/20 text-red-400' :
                      activity.type === 'trade' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-purple-500/20 text-purple-400'
                    }`}>
                      {activity.type === 'deposit' && <FaArrowDown className="w-5 h-5" />}
                      {activity.type === 'withdraw' && <FaArrowUp className="w-5 h-5" />}
                      {activity.type === 'trade' && <FaExchangeAlt className="w-5 h-5" />}
                      {activity.type === 'register' && <FaUserShield className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-sm text-white">{activity.user}</p>
                      <p className="text-xs text-white/40">{activity.action}{activity.amount && ` ${activity.amount}`}</p>
                    </div>
                  </div>
                  <span className="text-xs text-white/40">{activity.time}</span>
                </motion.div>
              ))}
            </div>
          </ModernCard>
        </motion.div>

        <motion.div variants={itemVariants}>
          <ModernCard className="p-6" hover={false}>
            <h3 className="text-lg font-semibold text-white mb-4">System Status</h3>
            <div className="space-y-3">
              {[
                { name: 'API Servers', status: 'Operational', uptime: '99.99%', color: 'emerald' },
                { name: 'Database', status: 'Operational', uptime: '99.95%', color: 'emerald' },
                { name: 'WebSocket', status: 'Operational', uptime: '99.98%', color: 'emerald' },
                { name: 'Payment Gateway', status: 'Degraded', uptime: '98.50%', color: 'amber' },
              ].map((system, i) => (
                <div key={system.name} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full bg-${system.color}-400`} />
                    <span className="text-sm text-white/80">{system.name}</span>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium text-${system.color}-400`}>{system.status}</p>
                    <p className="text-xs text-white/40">{system.uptime} uptime</p>
                  </div>
                </div>
              ))}
            </div>
          </ModernCard>
        </motion.div>
      </div>
    </motion.div>
  )
}

const UsersTab = ({ users: initialUsers, showNotification }) => {
  const [users, setUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [deletingUser, setDeletingUser] = useState(null)
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', role: 'user', password: '', balance: '', deposits: '', withdrawals: '', avatar: '' })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (Array.isArray(initialUsers) && initialUsers.length > 0) {
      setUsers(initialUsers)
    } else {
      fetchUsers()
    }
  }, [initialUsers])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/superadmin/users', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (res.ok) {
        const data = await res.json()
        const usersArray = Array.isArray(data) ? data : (data.users || [])
        
        const usersWithDefaults = usersArray.map(user => ({
          ...user,
          phone: user.phone || '',
          hasPassword: user.hasPassword !== undefined ? user.hasPassword : Boolean(user.password && user.password.length > 0),
          password: user.password || (user.hasPassword ? '••••••••••••' : null)
        }))
        
        setUsers(usersWithDefaults)
      } else {
        const errorData = await res.json()
        console.error('Failed to fetch users:', errorData)
        showNotification(errorData.message || 'Failed to fetch users', 'error')
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
      showNotification('Failed to fetch users', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      showNotification('Please fill in all required fields (name, email, password)', 'error')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/superadmin/users', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        const newUser = await res.json()
        setUsers([...users, { 
          ...newUser, 
          balance: parseFloat(formData.balance) || 0,
          wallet: { 
            balance: parseFloat(formData.balance) || 0,
            deposits: parseFloat(formData.deposits) || 0,
            withdrawals: parseFloat(formData.withdrawals) || 0
          },
          walletStats: {
            availableBalance: parseFloat(formData.balance) || 0,
            totalDeposit: parseFloat(formData.deposits) || 0,
            totalWithdraw: parseFloat(formData.withdrawals) || 0,
            totalProfit: parseFloat(formData.profit) || 0
          }
        }])
        showNotification('User created successfully!')
        setShowModal(false)
      } else {
        showNotification('Failed to create user', 'error')
      }
    } catch (error) {
      showNotification('Failed to create user', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async () => {
    if (!editingUser || !formData.name || !formData.email) {
      showNotification('Please fill in all required fields', 'error')
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/superadmin/users/${editingUser._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        const updatedUser = await res.json()
        setUsers(users.map(u => u._id === editingUser._id ? { 
          ...u, 
          ...updatedUser.user,
          wallet: updatedUser.user.wallet || u.wallet,
          walletStats: updatedUser.user.walletStats || u.walletStats
        } : u))
        showNotification('User updated successfully!')
        setShowModal(false)
      } else {
        showNotification('Failed to update user', 'error')
      }
    } catch (error) {
      showNotification('Failed to update user', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingUser) return
    try {
      const res = await fetch(`/api/superadmin/users/${deletingUser._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      if (res.ok) {
        setUsers(users.filter(u => u._id !== deletingUser._id))
        showNotification('User deleted successfully!')
        setShowDeleteModal(false)
      } else {
        showNotification('Failed to delete user', 'error')
      }
    } catch (error) {
      showNotification('Failed to delete user', 'error')
    }
  }

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone?.includes(searchQuery)
  )

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user)
      setFormData({ 
        name: user.name, 
        email: user.email, 
        phone: user.phone || '', 
        role: user.role, 
        status: user.status,
        password: '',
        hasPassword: user.hasPassword,
        passwordLength: user.password?.length || 0,
        balance: user.wallet?.balance?.toString() || '0',
        deposits: user.wallet?.deposits?.toString() || '0',
        withdrawals: user.wallet?.withdrawals?.toString() || '0',
        profit: user.walletStats?.totalProfit?.toString() || '0',
        avatar: user.avatar || ''
      })
    } else {
      setEditingUser(null)
      setFormData({ name: '', email: '', phone: '', role: 'user', status: 'active', password: '', hasPassword: false, balance: '', deposits: '', withdrawals: '', profit: '', avatar: '' })
    }
    setShowModal(true)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="w-80 bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50"
            />
          </div>
        </div>
        <GlowButton onClick={() => handleOpenModal()}>
          <FaPlus className="w-4 h-4" />
          Add User
        </GlowButton>
        <button onClick={async () => {
          if (confirm('Reset all user balances to $0? This cannot be undone.')) {
            try {
              const res = await fetch('/api/superadmin/users/reset-balances', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
              })
              if (res.ok) {
                setUsers(users.map(u => ({ ...u, wallet: { ...u.wallet, balance: 0 } })))
                showNotification('All balances reset to $0')
              }
            } catch (err) {
              showNotification('Failed to reset balances', 'error')
            }
          }
        }} className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 text-sm">
          Reset All Balances
        </button>
      </div>

      <ModernCard className="overflow-hidden" hover={false}>
        <table className="w-full">
          <thead className="bg-white/[0.02]">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white/60">User</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white/60">Email</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white/60">Phone</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white/60">Password</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white/60">Role</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white/60">Balance</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-white/60">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredUsers.map((user) => (
              <tr key={user._id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-xl object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {user.name?.charAt(0) || 'U'}
                      </div>
                    )}
                    <span className="text-white font-medium">{user.name || 'User'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-white/60">{user.email}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-white/60 text-sm">{user.phone || '-'}</span>
                    {user.phone && user.phone.length > 0 && (
                      <span className="text-emerald-400 text-xs">✓ Verified</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {user.hasPassword ? (
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">
                          ••••••••
                        </span>
                      </div>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                        Not Set
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-white font-medium">${(user.wallet?.balance || 0).toLocaleString()}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <MotionButton whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleOpenModal(user)} className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30">
                      <FaEdit className="w-4 h-4" />
                    </MotionButton>
                    <MotionButton whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => { setDeletingUser(user); setShowDeleteModal(true); }} className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30">
                      <FaTrash className="w-4 h-4" />
                    </MotionButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ModernCard>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()} className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-6">{editingUser ? 'Edit User' : 'Add New User'}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Name *</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Email *</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Phone Number</label>
                  <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+1 234 567 8900" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">
                    Password {editingUser && (
                      formData.hasPassword ? (
                        <span className="text-emerald-400 ml-2">(Current: {formData.passwordLength || 8} characters)</span>
                      ) : (
                        <span className="text-red-400 ml-2">(Not Set)</span>
                      )
                    )}
                  </label>
                  <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder={editingUser ? 'Leave blank to keep current' : 'Enter password'} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" />
                  {editingUser && formData.hasPassword && (
                    <p className="text-xs text-white/40 mt-1">Leave blank to keep the current password unchanged</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Avatar URL</label>
                  <input type="text" value={formData.avatar} onChange={e => setFormData({...formData, avatar: e.target.value})} placeholder="https://..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Available Balance</label>
                  <input type="number" step="0.01" value={formData.balance} onChange={e => setFormData({...formData, balance: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Total Deposits</label>
                    <input type="number" step="0.01" value={formData.deposits} onChange={e => setFormData({...formData, deposits: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Total Withdrawals</label>
                    <input type="number" step="0.01" value={formData.withdrawals} onChange={e => setFormData({...formData, withdrawals: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Total Profit</label>
                  <input type="number" step="0.01" value={formData.profit} onChange={e => setFormData({...formData, profit: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Role</label>
                    <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500">
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Status</label>
                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => { setShowModal(false); setFormData({ name: '', email: '', phone: '', role: 'user', status: 'active', password: '', balance: '', deposits: '', withdrawals: '', profit: '', avatar: '' }); }} className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10">Cancel</button>
                <button onClick={editingUser ? handleUpdate : handleCreate} disabled={saving} className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium disabled:opacity-50">
                  {saving ? 'Saving...' : editingUser ? 'Update' : 'Create'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteModal && deletingUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteModal(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()} className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <FaExclamationTriangle className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete User</h3>
              <p className="text-white/60 mb-6">Are you sure you want to delete <span className="text-white font-medium">{deletingUser.name}</span>? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10">Cancel</button>
                <button onClick={handleDelete} className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const TransactionsTab = ({ transactions: initialTransactions, showNotification }) => {
  const { updateTransactionStatus } = useTransactionStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [processingId, setProcessingId] = useState(null)
  const [statusDropdownId, setStatusDropdownId] = useState(null)
  const [allTransactions, setAllTransactions] = useState(() => {
    if (Array.isArray(initialTransactions) && initialTransactions.length > 0) {
      return initialTransactions
    }
    return [
      { _id: 'TXN001', user: { name: 'John Doe' }, type: 'deposit', amount: 5000, status: 'completed', createdAt: new Date() },
      { _id: 'TXN002', user: { name: 'Sarah Connor' }, type: 'withdraw', amount: 2500, status: 'pending', createdAt: new Date() },
      { _id: 'TXN003', user: { name: 'Mike Johnson' }, type: 'deposit', amount: 10000, status: 'completed', createdAt: new Date() },
      { _id: 'TXN004', user: { name: 'Emily Davis' }, type: 'withdraw', amount: 1500, status: 'rejected', createdAt: new Date() },
      { _id: 'TXN005', user: { name: 'David Lee' }, type: 'deposit', amount: 7500, status: 'pending', createdAt: new Date() },
      { _id: 'TXN006', user: { name: 'Alex Chen' }, type: 'deposit', amount: 3200, status: 'confirm', createdAt: new Date() },
      { _id: 'TXN007', user: { name: 'Lisa Wang' }, type: 'withdraw', amount: 8900, status: 'pending', createdAt: new Date() },
    ]
  })

  const displayTransactions = allTransactions

  const filteredTransactions = displayTransactions.filter(tx => {
    const matchesSearch = tx._id?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         tx.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tx.symbol?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleChangeStatus = async (tx, newStatus) => {
    setStatusDropdownId(null)
    setProcessingId(tx._id)
    
    const updated = allTransactions.map(t => t._id === tx._id ? { ...t, status: newStatus } : t)
    setAllTransactions(updated)
    
    if (tx._id.startsWith('TXN')) {
      showNotification(`Transaction status changed to ${newStatus}!`)
      setProcessingId(null)
      return
    }
    
    try {
      const res = await fetch(`/api/superadmin/transactions/${tx._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (res.ok) {
        showNotification(`Transaction status changed to ${newStatus}!`)
      } else {
        const data = await res.json()
        showNotification(data.message || 'Failed to update server, but local update succeeded', 'error')
      }
    } catch (error) {
      console.log('API call failed, but UI updated locally')
    }
    setProcessingId(null)
  }

  const stats = {
    total: displayTransactions.length,
    pending: displayTransactions.filter(tx => tx.status === 'pending').length,
    completed: displayTransactions.filter(tx => tx.status === 'completed').length,
    rejected: displayTransactions.filter(tx => tx.status === 'rejected').length,
  }

  const statusConfig = {
    pending: { color: 'from-amber-500 to-orange-500', bg: 'bg-amber-500/10', text: 'text-amber-400', icon: FaClock },
    confirm: { color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/10', text: 'text-blue-400', icon: FaCheck },
    completed: { color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-500/10', text: 'text-emerald-400', icon: FaCheckCircle },
    rejected: { color: 'from-red-500 to-rose-500', bg: 'bg-red-500/10', text: 'text-red-400', icon: FaTimesCircle },
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="space-y-6"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'from-purple-500 to-pink-500', icon: FaCoins },
          { label: 'Pending', value: stats.pending, color: 'from-amber-500 to-orange-500', icon: FaClock, pulse: true },
          { label: 'Completed', value: stats.completed, color: 'from-emerald-500 to-teal-500', icon: FaCheckCircle },
          { label: 'Rejected', value: stats.rejected, color: 'from-red-500 to-rose-500', icon: FaTimesCircle },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`relative overflow-hidden rounded-2xl p-5 backdrop-blur-xl border border-white/10 bg-gradient-to-br ${stat.color} bg-opacity-10`}
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/5 blur-2xl" />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm font-medium mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center ${stat.pulse ? 'animate-pulse' : ''}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-1"
      >
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <motion.div
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
              whileHover={{ scale: 1.1 }}
            >
              <FaSearch className="w-5 h-5" />
            </motion.div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search transactions..."
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2">
            {['all', 'pending', 'confirm', 'completed', 'rejected'].map((status) => (
              <motion.button
                key={status}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all capitalize ${
                  statusFilter === status
                    ? status === 'all' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30' :
                      status === 'pending' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' :
                      status === 'confirm' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' :
                      status === 'completed' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' :
                      'bg-red-500 text-white shadow-lg shadow-red-500/30'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                {status === 'confirm' ? 'Confirmed' : status}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredTransactions.map((tx, index) => {
          const config = statusConfig[tx.status] || statusConfig.pending
          const StatusIcon = config.icon
          const isActive = processingId === tx._id
          const isDropdownOpen = statusDropdownId === tx._id
          
          return (
            <motion.div
              key={tx._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4, scale: 1.01 }}
              className="group relative"
            >
              <div className={`relative overflow-hidden rounded-2xl backdrop-blur-xl border border-white/10 transition-all duration-300 ${
                tx.status === 'pending' ? 'bg-amber-500/5 hover:bg-amber-500/10' :
                tx.status === 'confirm' ? 'bg-blue-500/5 hover:bg-blue-500/10' :
                tx.status === 'completed' ? 'bg-emerald-500/5 hover:bg-emerald-500/10' :
                'bg-red-500/5 hover:bg-red-500/10'
              }`}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <motion.div 
                        whileHover={{ rotate: 5 }}
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center shadow-lg`}
                        style={{ boxShadow: `0 10px 30px -10px ${tx.status === 'pending' ? '#f59e0b' : tx.status === 'confirm' ? '#3b82f6' : tx.status === 'completed' ? '#10b981' : '#ef4444'}40` }}
                      >
                        <span className="text-white font-bold text-lg">{tx.type === 'deposit' ? '+' : '-'}</span>
                      </motion.div>
                      <div>
                        <h4 className="text-white font-semibold text-lg">{tx.user?.name || 'User'}</h4>
                        <p className="text-white/40 text-sm font-mono">{tx._id}</p>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setStatusDropdownId(isDropdownOpen ? null : tx._id)}
                        className={`p-3 rounded-xl backdrop-blur-md transition-all ${
                          tx.status === 'pending' ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' :
                          tx.status === 'confirm' ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' :
                          tx.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' :
                          'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        } ${isDropdownOpen ? 'ring-2 ring-white/40' : ''}`}
                      >
                        <FiMoreVertical className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-2xl font-bold ${
                        tx.type === 'deposit' ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {tx.type === 'deposit' ? '+' : '-'}{tx.symbol ? `${tx.amount} ${tx.symbol}` : `$${tx.amount?.toLocaleString()}`}
                      </p>
                      <p className="text-white/40 text-sm">{new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className={`px-4 py-2 rounded-xl backdrop-blur-md flex items-center gap-2 ${config.bg} ${config.text}`}
                    >
                      {tx.status === 'pending' && (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        >
                          <StatusIcon className="w-4 h-4" />
                        </motion.div>
                      )}
                      {tx.status !== 'pending' && <StatusIcon className="w-4 h-4" />}
                      <span className="font-semibold text-sm capitalize">
                        {tx.status === 'confirm' ? 'Confirmed' : tx.status}
                      </span>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {filteredTransactions.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 rounded-2xl bg-white/5 border border-white/10"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4"
          >
            <FaCoins className="w-10 h-10 text-white/40" />
          </motion.div>
          <p className="text-white/60 text-lg font-medium">No transactions found</p>
          <p className="text-white/30 text-sm mt-1">Try adjusting your search or filters</p>
        </motion.div>
      )}

      <AnimatePresence>
        {statusDropdownId && (() => {
          const selectedTx = displayTransactions.find(tx => tx._id === statusDropdownId)
          if (!selectedTx) return null
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
              onClick={() => setStatusDropdownId(null)}
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md overflow-hidden rounded-3xl bg-gradient-to-b from-gray-800 to-gray-900 border border-white/20 shadow-2xl"
              >
                <div className="relative p-6 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600">
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="relative text-center">
                    <h3 className="text-2xl font-bold text-white mb-1">Change Status</h3>
                    <p className="text-white/70 text-sm">Update transaction status</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setStatusDropdownId(null)}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <FaTimes className="w-5 h-5" />
                  </motion.button>
                </div>
                
                <div className="p-6 space-y-3">
                  <StatusOption
                    tx={selectedTx}
                    status="pending"
                    label="Pending"
                    icon={FaClock}
                    color="amber"
                    description="Transaction is waiting for review"
                    onClick={handleChangeStatus}
                    isActive={processingId === selectedTx._id}
                  />
                  <StatusOption
                    tx={selectedTx}
                    status="confirm"
                    label="Confirm"
                    icon={FaCheck}
                    color="blue"
                    description="Transaction has been confirmed"
                    onClick={handleChangeStatus}
                    isActive={processingId === selectedTx._id}
                  />
                  <StatusOption
                    tx={selectedTx}
                    status="completed"
                    label="Complete"
                    icon={FaCheckCircle}
                    color="emerald"
                    description="Transaction completed successfully"
                    onClick={handleChangeStatus}
                    isActive={processingId === selectedTx._id}
                  />
                  <div className="border-t border-white/10 pt-3 mt-3">
                    <StatusOption
                      tx={selectedTx}
                      status="rejected"
                      label="Rejected"
                      icon={FaTimesCircle}
                      color="red"
                      description="Transaction was rejected"
                      onClick={handleChangeStatus}
                      isActive={processingId === selectedTx._id}
                      isDanger
                    />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )
        })()}
      </AnimatePresence>
    </motion.div>
  )
}

const StatusOption = ({ tx, status, label, icon: Icon, color, description, onClick, isActive, isDanger }) => {
  const colorMap = {
    amber: { bg: 'bg-amber-500', text: 'text-amber-400', hover: 'hover:bg-amber-500/20', active: 'bg-amber-500/30 border-amber-500' },
    blue: { bg: 'bg-blue-500', text: 'text-blue-400', hover: 'hover:bg-blue-500/20', active: 'bg-blue-500/30 border-blue-500' },
    emerald: { bg: 'bg-emerald-500', text: 'text-emerald-400', hover: 'hover:bg-emerald-500/20', active: 'bg-emerald-500/30 border-emerald-500' },
    red: { bg: 'bg-red-500', text: 'text-red-400', hover: 'hover:bg-red-500/20', active: 'bg-red-500/30 border-red-500' },
  }
  const colors = colorMap[color]
  const isSelected = tx.status === status
  
  return (
    <motion.button
      whileHover={{ scale: 1.02, x: 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(tx, status)}
      disabled={isActive}
      className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all border-2 ${
        isSelected 
          ? `${colors.active}` 
          : isDanger 
            ? `bg-red-500/10 ${colors.hover} border-transparent` 
            : `bg-white/5 ${colors.hover} border-transparent`
      } ${isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <motion.div 
        whileHover={{ rotate: 360 }}
        className={`w-14 h-14 rounded-2xl ${colors.bg} flex items-center justify-center shadow-lg`}
      >
        <Icon className="w-7 h-7 text-white" />
      </motion.div>
      <div className="flex-1">
        <p className={`font-bold text-lg ${colors.text}`}>{label}</p>
        <p className="text-white/50 text-sm">{description}</p>
      </div>
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`w-8 h-8 rounded-full ${colors.bg} flex items-center justify-center shadow-lg`}
        >
          <FaCheck className="w-5 h-5 text-white" />
        </motion.div>
      )}
    </motion.button>
  )
}

const TradesTab = ({ trades: propTrades, showNotification }) => {
  const mockTrades = [
    { id: 1, pair: 'BTC/USDT', type: 'buy', amount: 0.5, price: 67250, total: 33625, user: 'user_1', status: 'completed', time: new Date(Date.now() - 300000).toISOString() },
    { id: 2, pair: 'ETH/USDT', type: 'sell', amount: 2.5, price: 3450, total: 8625, user: 'user_2', status: 'completed', time: new Date(Date.now() - 600000).toISOString() },
    { id: 3, pair: 'SOL/USDT', type: 'buy', amount: 50, price: 145, total: 7250, user: 'user_3', status: 'completed', time: new Date(Date.now() - 900000).toISOString() },
    { id: 4, pair: 'BTC/USDT', type: 'sell', amount: 0.25, price: 67500, total: 16875, user: 'user_4', status: 'completed', time: new Date(Date.now() - 1200000).toISOString() },
    { id: 5, pair: 'ETH/USDT', type: 'buy', amount: 1.2, price: 3420, total: 4104, user: 'user_5', status: 'pending', time: new Date(Date.now() - 1800000).toISOString() },
    { id: 6, pair: 'XRP/USDT', type: 'sell', amount: 5000, price: 0.52, total: 2600, user: 'user_6', status: 'completed', time: new Date(Date.now() - 2400000).toISOString() },
  ]
  const [trades, setTrades] = useState(Array.isArray(propTrades) && propTrades.length > 0 ? propTrades : mockTrades)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedTrade, setSelectedTrade] = useState(null)
  const [formData, setFormData] = useState({ pair: 'BTC/USDT', type: 'buy', amount: '', price: '', user: '' })

  const filteredTrades = trades.filter(trade => {
    const matchesSearch = trade.pair.toLowerCase().includes(searchTerm.toLowerCase()) || trade.user.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || trade.type === filterType
    const matchesStatus = filterStatus === 'all' || trade.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const totalVolume = filteredTrades.reduce((sum, t) => sum + t.total, 0)
  const buyVolume = filteredTrades.filter(t => t.type === 'buy').reduce((sum, t) => sum + t.total, 0)
  const sellVolume = filteredTrades.filter(t => t.type === 'sell').reduce((sum, t) => sum + t.total, 0)

  const handleCreate = () => {
    if (!formData.amount || !formData.price) return
    const newTrade = {
      id: Date.now(),
      pair: formData.pair,
      type: formData.type,
      amount: parseFloat(formData.amount),
      price: parseFloat(formData.price),
      total: parseFloat(formData.amount) * parseFloat(formData.price),
      user: formData.user || `user_${Date.now()}`,
      status: 'completed',
      time: new Date().toISOString()
    }
    setTrades([newTrade, ...trades])
    setShowCreateModal(false)
    setFormData({ pair: 'BTC/USDT', type: 'buy', amount: '', price: '', user: '' })
    showNotification('Trade created successfully')
  }

  const handleEdit = () => {
    if (!selectedTrade || !formData.amount || !formData.price) return
    const updated = trades.map(t => t.id === selectedTrade.id ? {
      ...t,
      pair: formData.pair,
      type: formData.type,
      amount: parseFloat(formData.amount),
      price: parseFloat(formData.price),
      total: parseFloat(formData.amount) * parseFloat(formData.price),
      user: formData.user || t.user
    } : t)
    setTrades(updated)
    setShowEditModal(false)
    setSelectedTrade(null)
    setFormData({ pair: 'BTC/USDT', type: 'buy', amount: '', price: '', user: '' })
    showNotification('Trade updated successfully')
  }

  const handleDelete = () => {
    if (!selectedTrade) return
    setTrades(trades.filter(t => t.id !== selectedTrade.id))
    setShowDeleteModal(false)
    setSelectedTrade(null)
    showNotification('Trade deleted successfully')
  }

  const openEditModal = (trade) => {
    setSelectedTrade(trade)
    setFormData({ pair: trade.pair, type: trade.type, amount: trade.amount.toString(), price: trade.price.toString(), user: trade.user })
    setShowEditModal(true)
  }

  const openDeleteModal = (trade) => {
    setSelectedTrade(trade)
    setShowDeleteModal(true)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <ModernCard className="p-6" hover={false}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-xl bg-white/[0.02]">
            <p className="text-2xl font-bold text-white">{filteredTrades.length}</p>
            <p className="text-sm text-white/40">Total Trades</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-white/[0.02]">
            <p className="text-2xl font-bold text-emerald-400">${(buyVolume / 1000).toFixed(1)}K</p>
            <p className="text-sm text-white/40">Buy Volume</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-white/[0.02]">
            <p className="text-2xl font-bold text-red-400">${(sellVolume / 1000).toFixed(1)}K</p>
            <p className="text-sm text-white/40">Sell Volume</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-white/[0.02]">
            <p className="text-2xl font-bold text-blue-400">${(totalVolume / 1000).toFixed(1)}K</p>
            <p className="text-sm text-white/40">Total Volume</p>
          </div>
        </div>
      </ModernCard>

      <ModernCard className="overflow-hidden" hover={false}>
        <div className="p-4 border-b border-white/5">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by pair or user..."
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50"
              />
            </div>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/80 text-sm focus:outline-none cursor-pointer">
              <option value="all">All Types</option>
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/80 text-sm focus:outline-none cursor-pointer">
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <GlowButton onClick={() => { setFormData({ pair: 'BTC/USDT', type: 'buy', amount: '', price: '', user: '' }); setShowCreateModal(true); }}>
              <FaPlus className="w-4 h-4" /> Add Trade
            </GlowButton>
          </div>
        </div>
        <table className="w-full">
          <thead className="bg-white/[0.02]">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white/60">Pair</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white/60">Type</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white/60">Amount</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white/60">Price</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white/60">Total</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white/60">User</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white/60">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white/60">Time</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-white/60">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredTrades.map((trade) => (
              <tr key={trade.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4 text-white font-medium">{trade.pair}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    trade.type === 'buy' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {trade.type.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-white">{trade.amount}</td>
                <td className="px-6 py-4 text-white/60">${trade.price.toLocaleString()}</td>
                <td className="px-6 py-4 text-white font-medium">${trade.total.toLocaleString()}</td>
                <td className="px-6 py-4 text-white/60">{trade.user}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    trade.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                    trade.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {trade.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-white/40 text-sm">{new Date(trade.time).toLocaleTimeString()}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => openEditModal(trade)} className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors">
                      <FaEdit className="w-4 h-4" />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => openDeleteModal(trade)} className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors">
                      <FaTrash className="w-4 h-4" />
                    </motion.button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ModernCard>

      <AnimatePresence>
        {showCreateModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-6">Create New Trade</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Trading Pair</label>
                  <select value={formData.pair} onChange={(e) => setFormData({...formData, pair: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500/50 cursor-pointer">
                    {['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'XRP/USDT', 'BNB/USDT', 'ADA/USDT', 'DOGE/USDT', 'DOT/USDT'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Type</label>
                  <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500/50 cursor-pointer">
                    <option value="buy">Buy</option>
                    <option value="sell">Sell</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-white/60 mb-2 block">Amount</label>
                    <input type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} placeholder="0.00" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50" />
                  </div>
                  <div>
                    <label className="text-sm text-white/60 mb-2 block">Price ($)</label>
                    <input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} placeholder="0.00" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50" />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-2 block">User ID</label>
                  <input type="text" value={formData.user} onChange={(e) => setFormData({...formData, user: e.target.value})} placeholder="user_id" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 transition-all">Cancel</button>
                <button onClick={handleCreate} className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all">Create Trade</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEditModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowEditModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-6">Edit Trade</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Trading Pair</label>
                  <select value={formData.pair} onChange={(e) => setFormData({...formData, pair: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500/50 cursor-pointer">
                    {['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'XRP/USDT', 'BNB/USDT', 'ADA/USDT', 'DOGE/USDT', 'DOT/USDT'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Type</label>
                  <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500/50 cursor-pointer">
                    <option value="buy">Buy</option>
                    <option value="sell">Sell</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-white/60 mb-2 block">Amount</label>
                    <input type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500/50" />
                  </div>
                  <div>
                    <label className="text-sm text-white/60 mb-2 block">Price ($)</label>
                    <input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500/50" />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-2 block">User ID</label>
                  <input type="text" value={formData.user} onChange={(e) => setFormData({...formData, user: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500/50" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 transition-all">Cancel</button>
                <button onClick={handleEdit} className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all">Update Trade</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteModal && selectedTrade && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-4">Delete Trade</h3>
              <p className="text-white/60 mb-6">Are you sure you want to delete this trade? This action cannot be undone.</p>
              <div className="bg-white/5 rounded-xl p-4 mb-6">
                <div className="flex justify-between mb-2"><span className="text-white/40">Pair:</span><span className="text-white font-medium">{selectedTrade.pair}</span></div>
                <div className="flex justify-between mb-2"><span className="text-white/40">Type:</span><span className={selectedTrade.type === 'buy' ? 'text-emerald-400' : 'text-red-400'}>{selectedTrade.type.toUpperCase()}</span></div>
                <div className="flex justify-between mb-2"><span className="text-white/40">Amount:</span><span className="text-white">{selectedTrade.amount}</span></div>
                <div className="flex justify-between"><span className="text-white/40">Total:</span><span className="text-white font-medium">${selectedTrade.total.toLocaleString()}</span></div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 transition-all">Cancel</button>
                <button onClick={handleDelete} className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-medium hover:shadow-lg hover:shadow-red-500/30 transition-all">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const SecurityTab = ({ showNotification }) => {
  const [securityEvents, setSecurityEvents] = useState([
    { id: 1, event: 'Failed login attempt', location: 'New York, US', time: new Date(Date.now() - 120000).toISOString(), risk: 'high' },
    { id: 2, event: 'Password changed', location: 'London, UK', time: new Date(Date.now() - 3600000).toISOString(), risk: 'low' },
    { id: 3, event: 'New device login', location: 'Tokyo, JP', time: new Date(Date.now() - 10800000).toISOString(), risk: 'medium' },
    { id: 4, event: 'API key created', location: 'Singapore, SG', time: new Date(Date.now() - 18000000).toISOString(), risk: 'low' },
  ])
  const [accessControls, setAccessControls] = useState([
    { id: 1, name: 'IP Whitelist', enabled: true, description: 'Restrict access by IP addresses' },
    { id: 2, name: 'Two-Factor Auth', enabled: true, description: 'Require 2FA for all admin actions' },
    { id: 3, name: 'Session Timeout', enabled: true, description: 'Auto logout after 30 minutes' },
    { id: 4, name: 'Audit Logging', enabled: true, description: 'Log all admin actions' },
  ])
  const [apiKeys, setApiKeys] = useState([
    { id: 1, name: 'Production API', key: 'cfx_prod_****************************', created: '2024-01-15', status: 'active' },
    { id: 2, name: 'Staging API', key: 'cfx_stag_****************************', created: '2024-02-20', status: 'active' },
    { id: 3, name: 'Test API', key: 'cfx_test_****************************', created: '2024-03-10', status: 'inactive' },
  ])
  const [showEventModal, setShowEventModal] = useState(false)
  const [showControlModal, setShowControlModal] = useState(false)
  const [showApiModal, setShowApiModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteType, setDeleteType] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [formData, setFormData] = useState({ event: '', location: '', risk: 'low', name: '', description: '', key: '' })

  const toggleAccessControl = (id) => {
    setAccessControls(controls => controls.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c))
    showNotification('Access control updated')
  }

  const handleCreateEvent = () => {
    if (!formData.event) return
    const newEvent = { id: Date.now(), event: formData.event, location: formData.location || 'Unknown', time: new Date().toISOString(), risk: formData.risk }
    setSecurityEvents([newEvent, ...securityEvents])
    setShowEventModal(false)
    setFormData({ event: '', location: '', risk: 'low', name: '', description: '', key: '' })
    showNotification('Security event added')
  }

  const handleCreateControl = () => {
    if (!formData.name) return
    const newControl = { id: Date.now(), name: formData.name, enabled: false, description: formData.description || '' }
    setAccessControls([...accessControls, newControl])
    setShowControlModal(false)
    setFormData({ event: '', location: '', risk: 'low', name: '', description: '', key: '' })
    showNotification('Access control added')
  }

  const handleCreateApiKey = () => {
    if (!formData.name) return
    const newKey = { id: Date.now(), name: formData.name, key: `cfx_${Date.now()}_${Math.random().toString(36).substring(7)}`, created: new Date().toISOString().split('T')[0], status: 'active' }
    setApiKeys([...apiKeys, newKey])
    setShowApiModal(false)
    setFormData({ event: '', location: '', risk: 'low', name: '', description: '', key: '' })
    showNotification('API key created')
  }

  const handleDelete = () => {
    if (!selectedItem) return
    if (deleteType === 'event') setSecurityEvents(events => events.filter(e => e.id !== selectedItem.id))
    else if (deleteType === 'control') setAccessControls(controls => controls.filter(c => c.id !== selectedItem.id))
    else if (deleteType === 'apikey') setApiKeys(keys => keys.filter(k => k.id !== selectedItem.id))
    setShowDeleteModal(false)
    setSelectedItem(null)
    showNotification(`${deleteType === 'event' ? 'Event' : deleteType === 'control' ? 'Control' : 'API Key'} deleted`)
  }

  const openDeleteModal = (type, item) => {
    setDeleteType(type)
    setSelectedItem(item)
    setShowDeleteModal(true)
  }

  const handleRefreshKey = (key) => {
    const updated = apiKeys.map(k => k.id === key.id ? { ...k, key: `cfx_${Date.now()}_${Math.random().toString(36).substring(7)}` } : k)
    setApiKeys(updated)
    showNotification('API key refreshed')
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ModernCard className="p-6" hover={false}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Security Events</h3>
            <GlowButton size="sm" onClick={() => { setFormData({ event: '', location: '', risk: 'low', name: '', description: '', key: '' }); setShowEventModal(true); }}>
              <FaPlus className="w-3 h-3" /> Add
            </GlowButton>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {securityEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${event.risk === 'high' ? 'bg-red-500/20 text-red-400' : event.risk === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    <FaExclamationTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{event.event}</p>
                    <p className="text-sm text-white/40">{event.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white/40">{new Date(event.time).toLocaleTimeString()}</span>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => openDeleteModal('event', event)} className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30">
                    <FaTrash className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
              </div>
            ))}
          </div>
        </ModernCard>

        <ModernCard className="p-6" hover={false}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Access Control</h3>
            <GlowButton size="sm" onClick={() => { setFormData({ event: '', location: '', risk: 'low', name: '', description: '', key: '' }); setShowControlModal(true); }}>
              <FaPlus className="w-3 h-3" /> Add
            </GlowButton>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {accessControls.map((setting) => (
              <div key={setting.id} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02]">
                <div>
                  <p className="text-white font-medium">{setting.name}</p>
                  <p className="text-sm text-white/40">{setting.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => toggleAccessControl(setting.id)} className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${setting.enabled ? 'bg-blue-500' : 'bg-white/10'}`}>
                    <motion.div animate={{ x: setting.enabled ? 24 : 0 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} className="w-4 h-4 rounded-full bg-white" />
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => openDeleteModal('control', setting)} className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30">
                    <FaTrash className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
              </div>
            ))}
          </div>
        </ModernCard>
      </div>

      <ModernCard className="p-6" hover={false}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">API Keys</h3>
          <GlowButton size="sm" variant="success" onClick={() => { setFormData({ event: '', location: '', risk: 'low', name: '', description: '', key: '' }); setShowApiModal(true); }}>
            <FaPlus className="w-3 h-3" /> Create Key
          </GlowButton>
        </div>
        <div className="space-y-3">
          {apiKeys.map((api) => (
            <div key={api.id} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02]">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-white font-medium">{api.name}</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${api.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>{api.status}</span>
                </div>
                <p className="text-sm text-white/40 font-mono mt-1">{api.key}</p>
                <p className="text-xs text-white/30 mt-1">Created: {api.created}</p>
              </div>
              <div className="flex items-center gap-2">
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleRefreshKey(api)} className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30">
                  <FaSync className="w-4 h-4" />
                </motion.button>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => openDeleteModal('apikey', api)} className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30">
                  <FaTrash className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          ))}
        </div>
      </ModernCard>

      <AnimatePresence>
        {showEventModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowEventModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-6">Add Security Event</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Event Description</label>
                  <input type="text" value={formData.event} onChange={(e) => setFormData({...formData, event: e.target.value})} placeholder="e.g., Failed login attempt" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50" />
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Location</label>
                  <input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} placeholder="e.g., New York, US" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50" />
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Risk Level</label>
                  <select value={formData.risk} onChange={(e) => setFormData({...formData, risk: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none cursor-pointer">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowEventModal(false)} className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10">Cancel</button>
                <button onClick={handleCreateEvent} className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium">Add Event</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showControlModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowControlModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-6">Add Access Control</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Control Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g., IP Whitelist" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50" />
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Description</label>
                  <input type="text" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Brief description" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowControlModal(false)} className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10">Cancel</button>
                <button onClick={handleCreateControl} className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium">Add Control</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showApiModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowApiModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-6">Create API Key</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Key Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g., Production API" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowApiModal(false)} className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10">Cancel</button>
                <button onClick={handleCreateApiKey} className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium">Create Key</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteModal && selectedItem && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-4">Confirm Delete</h3>
              <p className="text-white/60 mb-6">Are you sure you want to delete this {deleteType === 'event' ? 'security event' : deleteType === 'control' ? 'access control' : 'API key'}? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10">Cancel</button>
                <button onClick={handleDelete} className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-medium">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const AnalyticsTab = ({ stats }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <ModernCard className="p-6" hover={false}>
        <h3 className="text-lg font-semibold text-white mb-4">Revenue Analytics</h3>
        <div className="h-48 flex items-end justify-around gap-2">
          {[65, 45, 78, 52, 88, 67, 92, 73, 85, 60, 78, 95].map((h, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              className="w-full rounded-t-lg bg-gradient-to-t from-purple-500 to-pink-400"
            />
          ))}
        </div>
        <div className="flex justify-between mt-4 text-sm text-white/40">
          <span>Jan</span>
          <span>Jun</span>
          <span>Dec</span>
        </div>
      </ModernCard>

      <ModernCard className="p-6" hover={false}>
        <h3 className="text-lg font-semibold text-white mb-4">User Growth</h3>
        <div className="h-48 flex items-end justify-around gap-2">
          {[30, 45, 35, 60, 50, 75, 65, 85, 70, 90, 80, 95].map((h, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              className="w-full rounded-t-lg bg-gradient-to-t from-emerald-500 to-teal-400"
            />
          ))}
        </div>
        <div className="flex justify-between mt-4 text-sm text-white/40">
          <span>Jan</span>
          <span>Jun</span>
          <span>Dec</span>
        </div>
      </ModernCard>

      <ModernCard className="p-6" hover={false}>
        <h3 className="text-lg font-semibold text-white mb-4">Trading Activity</h3>
        <div className="h-48 flex items-end justify-around gap-2">
          {[55, 70, 45, 80, 60, 90, 75, 85, 65, 95, 80, 88].map((h, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              className="w-full rounded-t-lg bg-gradient-to-t from-blue-500 to-cyan-400"
            />
          ))}
        </div>
        <div className="flex justify-between mt-4 text-sm text-white/40">
          <span>Jan</span>
          <span>Jun</span>
          <span>Dec</span>
        </div>
      </ModernCard>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ModernCard className="p-6" hover={false}>
        <h3 className="text-lg font-semibold text-white mb-4">Geographic Distribution</h3>
        <div className="space-y-3">
          {[
            { country: 'United States', percent: 35, users: '12,450' },
            { country: 'United Kingdom', percent: 22, users: '7,890' },
            { country: 'Germany', percent: 15, users: '5,340' },
            { country: 'Japan', percent: 12, users: '4,280' },
            { country: 'Others', percent: 16, users: '5,720' },
          ].map((geo, i) => (
            <div key={geo.country} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/80">{geo.country}</span>
                <span className="text-white font-medium">{geo.users} users</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${geo.percent}%` }}
                  transition={{ delay: i * 0.1, duration: 0.8 }}
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                />
              </div>
            </div>
          ))}
        </div>
      </ModernCard>

      <ModernCard className="p-6" hover={false}>
        <h3 className="text-lg font-semibold text-white mb-4">Device Analytics</h3>
        <div className="flex items-center justify-center gap-8 py-8">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full border-8 border-blue-500 flex items-center justify-center mb-2">
              <span className="text-2xl font-bold text-white">58%</span>
            </div>
            <p className="text-sm text-white/60">Mobile</p>
          </div>
          <div className="text-center">
            <div className="w-24 h-24 rounded-full border-8 border-purple-500 flex items-center justify-center mb-2">
              <span className="text-2xl font-bold text-white">35%</span>
            </div>
            <p className="text-sm text-white/60">Desktop</p>
          </div>
          <div className="text-center">
            <div className="w-24 h-24 rounded-full border-8 border-emerald-500 flex items-center justify-center mb-2">
              <span className="text-2xl font-bold text-white">7%</span>
            </div>
            <p className="text-sm text-white/60">Tablet</p>
          </div>
        </div>
      </ModernCard>
    </div>
  </motion.div>
)

const SettingsTab = ({ showNotification }) => {
  const [platformSettings, setPlatformSettings] = useState([
    { id: 1, name: 'Maintenance Mode', description: 'Put the platform in maintenance mode', enabled: false },
    { id: 2, name: 'New Registrations', description: 'Allow new user registrations', enabled: true },
    { id: 3, name: 'Trading Enabled', description: 'Enable trading functionality', enabled: true },
    { id: 4, name: 'Withdrawals Enabled', description: 'Enable withdrawal requests', enabled: true },
    { id: 5, name: 'Deposit Enabled', description: 'Enable deposit functionality', enabled: true },
  ])
  const [fees, setFees] = useState([
    { id: 1, label: 'Trading Fee', value: '0.1', type: 'percent', description: 'Per trade' },
    { id: 2, label: 'Withdrawal Fee', value: '0.0005', type: 'fixed', description: 'Per transaction' },
    { id: 3, label: 'Deposit Fee', value: '0', type: 'percent', description: 'No deposit fee' },
  ])
  const [showSettingModal, setShowSettingModal] = useState(false)
  const [showFeeModal, setShowFeeModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editType, setEditType] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [formData, setFormData] = useState({ name: '', description: '', label: '', value: '', type: 'percent' })

  const toggleSetting = (id) => {
    setPlatformSettings(settings => settings.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s))
    showNotification('Setting updated')
  }

  const handleCreateSetting = () => {
    if (!formData.name) return
    const newSetting = { id: Date.now(), name: formData.name, description: formData.description || '', enabled: false }
    setPlatformSettings([...platformSettings, newSetting])
    setShowSettingModal(false)
    setFormData({ name: '', description: '', label: '', value: '', type: 'percent' })
    showNotification('Setting created')
  }

  const handleCreateFee = () => {
    if (!formData.label) return
    const newFee = { id: Date.now(), label: formData.label, value: formData.value || '0', type: formData.type || 'percent', description: formData.description || '' }
    setFees([...fees, newFee])
    setShowFeeModal(false)
    setFormData({ name: '', description: '', label: '', value: '', type: 'percent' })
    showNotification('Fee configuration created')
  }

  const handleUpdateFee = () => {
    if (!selectedItem || !formData.value) return
    const updated = fees.map(f => f.id === selectedItem.id ? { ...f, value: formData.value, type: formData.type } : f)
    setFees(updated)
    setShowFeeModal(false)
    setSelectedItem(null)
    setFormData({ name: '', description: '', label: '', value: '', type: 'percent' })
    showNotification('Fee updated')
  }

  const handleDelete = () => {
    if (!selectedItem) return
    if (editType === 'setting') setPlatformSettings(settings => settings.filter(s => s.id !== selectedItem.id))
    else if (editType === 'fee') setFees(fees => fees.filter(f => f.id !== selectedItem.id))
    setShowDeleteModal(false)
    setSelectedItem(null)
    showNotification(`${editType === 'setting' ? 'Setting' : 'Fee'} deleted`)
  }

  const openEditFeeModal = (fee) => {
    setSelectedItem(fee)
    setFormData({ name: '', description: '', label: fee.label, value: fee.value, type: fee.type })
    setShowFeeModal(true)
  }

  const openDeleteModal = (type, item) => {
    setEditType(type)
    setSelectedItem(item)
    setShowDeleteModal(true)
  }

  const systemInfo = [
    { label: 'Version', value: '2.6.0' },
    { label: 'Node.js', value: 'v22.16.0' },
    { label: 'MongoDB', value: 'v7.0' },
    { label: 'Uptime', value: '99.9%' },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <ModernCard className="p-6" hover={false}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Platform Settings</h3>
          <GlowButton size="sm" onClick={() => { setFormData({ name: '', description: '', label: '', value: '', type: 'percent' }); setShowSettingModal(true); }}>
            <FaPlus className="w-3 h-3" /> Add Setting
          </GlowButton>
        </div>
        <div className="space-y-4">
          {platformSettings.map((setting) => (
            <div key={setting.id} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02]">
              <div>
                <p className="text-white font-medium">{setting.name}</p>
                <p className="text-sm text-white/40">{setting.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => toggleSetting(setting.id)} className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${setting.enabled ? 'bg-blue-500' : 'bg-white/10'}`}>
                  <motion.div animate={{ x: setting.enabled ? 24 : 0 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} className="w-4 h-4 rounded-full bg-white" />
                </motion.button>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => openDeleteModal('setting', setting)} className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30">
                  <FaTrash className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </div>
          ))}
        </div>
      </ModernCard>

      <ModernCard className="p-6" hover={false}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Fee Configuration</h3>
          <GlowButton size="sm" variant="success" onClick={() => { setSelectedItem(null); setFormData({ name: '', description: '', label: '', value: '', type: 'percent' }); setShowFeeModal(true); }}>
            <FaPlus className="w-3 h-3" /> Add Fee
          </GlowButton>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {fees.map((fee) => (
            <div key={fee.id} className="p-4 rounded-xl bg-white/[0.02] text-center relative">
              <div className="flex items-center justify-center gap-2 mb-2">
                <p className="text-2xl font-bold text-white">{fee.type === 'percent' ? `${fee.value}%` : fee.value}</p>
                <div className="flex gap-1">
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => openEditFeeModal(fee)} className="p-1 rounded bg-white/10 text-white/60 hover:text-white">
                    <FaEdit className="w-3 h-3" />
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => openDeleteModal('fee', fee)} className="p-1 rounded bg-red-500/20 text-red-400 hover:text-red-300">
                    <FaTrash className="w-3 h-3" />
                  </motion.button>
                </div>
              </div>
              <p className="text-sm text-white/60">{fee.label}</p>
              <p className="text-xs text-white/40">{fee.description}</p>
            </div>
          ))}
        </div>
      </ModernCard>

      <ModernCard className="p-6" hover={false}>
        <h3 className="text-lg font-semibold text-white mb-6">System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {systemInfo.map((info, i) => (
            <div key={i} className="p-4 rounded-xl bg-white/[0.02] text-center">
              <p className="text-xl font-bold text-white">{info.value}</p>
              <p className="text-sm text-white/40">{info.label}</p>
            </div>
          ))}
        </div>
      </ModernCard>

      <AnimatePresence>
        {showSettingModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowSettingModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-6">Add Platform Setting</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Setting Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g., Demo Mode" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50" />
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Description</label>
                  <input type="text" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Brief description" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowSettingModal(false)} className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10">Cancel</button>
                <button onClick={handleCreateSetting} className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium">Add Setting</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFeeModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowFeeModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-6">{selectedItem ? 'Edit Fee' : 'Add Fee'}</h3>
              <div className="space-y-4">
                {!selectedItem && (
                  <div>
                    <label className="text-sm text-white/60 mb-2 block">Fee Label</label>
                    <input type="text" value={formData.label} onChange={(e) => setFormData({...formData, label: e.target.value})} placeholder="e.g., Maker Fee" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50" />
                  </div>
                )}
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Value</label>
                  <input type="text" value={formData.value} onChange={(e) => setFormData({...formData, value: e.target.value})} placeholder="e.g., 0.1" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50" />
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Type</label>
                  <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none cursor-pointer">
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => { setShowFeeModal(false); setSelectedItem(null); }} className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10">Cancel</button>
                <button onClick={selectedItem ? handleUpdateFee : handleCreateFee} className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium">{selectedItem ? 'Update Fee' : 'Add Fee'}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteModal && selectedItem && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-4">Confirm Delete</h3>
              <p className="text-white/60 mb-6">Are you sure you want to delete this {editType === 'setting' ? 'platform setting' : 'fee configuration'}? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10">Cancel</button>
                <button onClick={handleDelete} className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-medium">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const AddressManagementTab = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)

  const [showCoinModal, setShowCoinModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedCoinData, setSelectedCoinData] = useState(null)
  const [toast, setToast] = useState(null)
  const [copiedId, setCopiedId] = useState(null)
  const [saving, setSaving] = useState(false)

  const [editData, setEditData] = useState({
    address: '',
    label: '',
    qrBg: '#ffffff',
    qrFg: '#000000',
    status: 'active'
  })

  useEffect(() => {
    fetchAddresses()
  }, [])

  const fetchAddresses = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/superadmin/deposit-addresses', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      if (res.ok) {
        const data = await res.json()
        const mapped = data.map(addr => ({
          _id: addr._id,
          coin: addr.symbol,
          label: addr.coin,
          address: addr.address,
          status: addr.isActive ? 'active' : 'inactive',
          balance: `0.00 ${addr.symbol}`,
          qrBg: addr.qrBg || '#ffffff',
          qrFg: addr.qrFg || '#000000',
          updated: new Date(addr.updatedAt).toLocaleString()
        }))
        setAddresses(mapped)
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error)
      showToast('Failed to load addresses', 'error')
    } finally {
      setLoading(false)
    }
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleCopyAddress = (addr) => {
    navigator.clipboard.writeText(addr.address)
    setCopiedId(addr._id || addr.coin)
    showToast('Address copied to clipboard!')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleExport = () => {
    const csv = [
      ['Label', 'Address', 'Coin', 'Balance', 'Status', 'Updated'].join(','),
      ...addresses.map(a => [a.label, a.address, a.coin, a.balance, a.status, a.updated].join(','))
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `wallet-addresses-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Addresses exported successfully!')
  }

  const handleCoinSelect = (coinSymbol) => {
    const existing = addresses.find(a => a.coin === coinSymbol)
    if (existing) {
      handleEditClick(existing)
    } else {
      setSelectedCoinData({ symbol: coinSymbol, ...COIN_COLORS[coinSymbol] })
      setEditData({
        address: '',
        label: '',
        qrBg: '#ffffff',
        qrFg: '#000000',
        status: 'active'
      })
      setShowCoinModal(false)
      setShowEditModal(true)
    }
  }

  const handleEditClick = (addr) => {
    setSelectedCoinData({ symbol: addr.coin, ...COIN_COLORS[addr.coin] })
    setEditData({
      address: addr.address,
      label: addr.label,
      qrBg: addr.qrBg || '#ffffff',
      qrFg: addr.qrFg || '#000000',
      status: addr.status
    })
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    if (!editData.address || !editData.label) {
      showToast('Please fill in all required fields', 'error')
      return
    }
    setSaving(true)
    try {
      const existing = addresses.find(a => a.coin === selectedCoinData.symbol)
      const payload = {
        coin: selectedCoinData.symbol,
        symbol: selectedCoinData.symbol,
        address: editData.address,
        memo: editData.label,
        isActive: editData.status === 'active',
        qrBg: editData.qrBg,
        qrFg: editData.qrFg
      }

      if (existing) {
        const res = await fetch(`/api/superadmin/deposit-addresses/${existing._id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(payload)
        })
        if (!res.ok) throw new Error('Failed to update')
        showToast('Coin address updated!')
      } else {
        const res = await fetch('/api/superadmin/deposit-addresses', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(payload)
        })
        if (!res.ok) {
          const err = await res.json()
          if (err.message.includes('already exists')) {
            showToast('Address already exists. Edit it instead.', 'error')
            setSaving(false)
            return
          }
          throw new Error('Failed to create')
        }
        showToast('Coin address added!')
      }
      await fetchAddresses()
      setShowEditModal(false)
    } catch (error) {
      console.error('Save error:', error)
      showToast('Failed to save address', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleViewClick = (addr) => {
    setSelectedCoinData({ symbol: addr.coin, ...COIN_COLORS[addr.coin] })
    setEditData({
      address: addr.address,
      label: addr.label,
      qrBg: addr.qrBg || '#ffffff',
      qrFg: addr.qrFg || '#000000',
      status: addr.status
    })
    setShowViewModal(true)
  }

  const handleDeleteClick = (addr) => {
    setSelectedCoinData({ symbol: addr.coin, ...COIN_COLORS[addr.coin] })
    setEditData({ address: addr.address, label: addr.label, qrBg: addr.qrBg, qrFg: addr.qrFg, status: addr.status })
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    const existing = addresses.find(a => a.coin === selectedCoinData.symbol)
    if (!existing) return
    try {
      const res = await fetch(`/api/superadmin/deposit-addresses/${existing._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      if (!res.ok) throw new Error('Failed to delete')
      showToast('Coin address deleted!')
      await fetchAddresses()
    } catch (error) {
      console.error('Delete error:', error)
      showToast('Failed to delete address', 'error')
    }
    setShowDeleteModal(false)
  }

  const handleToggleStatus = async (addr) => {
    const newStatus = addr.status === 'active' ? 'inactive' : 'active'
    try {
      const res = await fetch(`/api/superadmin/deposit-addresses/${addr._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ isActive: newStatus === 'active' })
      })
      if (!res.ok) throw new Error('Failed to update')
      showToast(`Address ${newStatus === 'active' ? 'activated' : 'deactivated'}!`)
      await fetchAddresses()
    } catch (error) {
      console.error('Toggle error:', error)
      showToast('Failed to update status', 'error')
    }
  }

  const filteredAddresses = addresses.filter(addr => {
    return addr.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
           addr.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
           addr.coin.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const getCoinBySymbol = (symbol) => addresses.find(a => a.coin === symbol)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className={`fixed top-4 left-1/2 z-50 px-6 py-3 rounded-xl shadow-2xl ${
              toast.type === 'error' ? 'bg-red-500/90 text-white' : 'bg-emerald-500/90 text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              {toast.type === 'error' ? <FaTimesCircle className="w-5 h-5" /> : <FaCheckCircle className="w-5 h-5" />}
              <span className="font-medium">{toast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-2xl p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <FaWallet className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-sm text-blue-400 font-medium">Configured Coins</span>
          </div>
          <p className="text-3xl font-bold text-white">{addresses.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-2xl p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <FaFire className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-sm text-emerald-400 font-medium">Active Coins</span>
          </div>
          <p className="text-3xl font-bold text-white">{addresses.filter(a => a.status === 'active').length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-2xl p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <FaCoins className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-sm text-purple-400 font-medium">Available Coins</span>
          </div>
          <p className="text-3xl font-bold text-white">{SUPPORTED_COINS.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-2xl p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <FaSnowflake className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-sm text-amber-400 font-medium">Pending Setup</span>
          </div>
          <p className="text-3xl font-bold text-white">{SUPPORTED_COINS.length - addresses.length}</p>
        </motion.div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
          <input
            type="text"
            placeholder="Search coins..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-80 bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white/80 hover:bg-white/[0.05] hover:text-white transition-all"
          >
            <FaDownload className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setShowCoinModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all"
          >
            <FaPlus className="w-4 h-4" />
            Manage Coins
          </button>
        </div>
      </div>

      <ModernCard className="p-6" hover={false}>
        <h3 className="text-lg font-semibold text-white mb-6">Coin Addresses & QR Codes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAddresses.map((addr, i) => {
            const coinInfo = COIN_COLORS[addr.coin] || { color: 'from-gray-500 to-gray-600', icon: addr.coin[0], bg: 'bg-gray-500/20', text: 'text-gray-400' }
            return (
              <motion.div
                key={addr.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${coinInfo.color} flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
                      {coinInfo.icon}
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{addr.coin}</h4>
                      <p className="text-white/50 text-sm">{addr.label}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleStatus(addr)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      addr.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {addr.status}
                  </button>
                </div>

                <div className="bg-white rounded-xl p-3 mb-4 flex items-center justify-center">
                  <QRCodeSVG
                    value={addr.address}
                    size={120}
                    level="H"
                    includeMargin={true}
                    bgColor={addr.qrBg || '#ffffff'}
                    fgColor={addr.qrFg || '#000000'}
                  />
                </div>

                <div className="bg-white/[0.03] rounded-xl p-3 mb-4">
                  <p className="text-white/50 text-xs mb-1 truncate">{addr.address.slice(0, 30)}...</p>
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">{addr.balance}</span>
                    <button
                      onClick={() => handleCopyAddress(addr)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        copiedId === addr.id ? 'bg-emerald-500/30 text-emerald-400' : 'hover:bg-white/10 text-white/40 hover:text-white/60'
                      }`}
                    >
                      {copiedId === addr.id ? <FaCheck className="w-3.5 h-3.5" /> : <FaCopy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditClick(addr)}
                    className="flex-1 px-3 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <FaEdit className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleViewClick(addr)}
                    className="flex-1 px-3 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <FaEye className="w-3.5 h-3.5" />
                    View
                  </button>
                  <button
                    onClick={() => handleDeleteClick(addr)}
                    className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
        {filteredAddresses.length === 0 && (
          <div className="text-center py-12">
            <FaCoins className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/40 mb-4">No coin addresses configured yet</p>
            <button
              onClick={() => setShowCoinModal(true)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all"
            >
              Add Your First Coin
            </button>
          </div>
        )}
      </ModernCard>

      <AnimatePresence>
        {showCoinModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setShowCoinModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">Manage Coin Addresses</h3>
                  <p className="text-white/50 text-sm mt-1">Click a coin to add or edit its address</p>
                </div>
                <button onClick={() => setShowCoinModal(false)} className="text-white/60 hover:text-white">
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {SUPPORTED_COINS.map((coinSymbol) => {
                    const coin = COIN_COLORS[coinSymbol] || { color: 'from-gray-500 to-gray-600', icon: coinSymbol[0], bg: 'bg-gray-500/20', text: 'text-gray-400' }
                    const hasAddress = !!getCoinBySymbol(coinSymbol)
                    return (
                      <motion.button
                        key={coinSymbol}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleCoinSelect(coinSymbol)}
                        className={`relative bg-white/[0.03] border rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${
                          hasAddress ? 'border-emerald-500/30 hover:border-emerald-500/50' : 'border-white/10 hover:border-white/20'
                        }`}
                      >
                        {hasAddress && (
                          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400" />
                        )}
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${coin.color} flex items-center justify-center text-white text-2xl font-bold shadow-lg`}>
                          {coin.icon}
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-white text-sm">{coinSymbol}</p>
                          <p className={`text-xs ${hasAddress ? 'text-emerald-400' : 'text-white/40'}`}>
                            {hasAddress ? 'Configured' : 'Not Set'}
                          </p>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10">
                <button
                  onClick={() => setShowCoinModal(false)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEditModal && selectedCoinData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${selectedCoinData.color} flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
                    {selectedCoinData.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedCoinData.symbol} Address</h3>
                    <p className="text-white/50 text-sm">Configure deposit address & QR code</p>
                  </div>
                </div>
                <button onClick={() => setShowEditModal(false)} className="text-white/60 hover:text-white">
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Label *</label>
                    <input
                      type="text"
                      value={editData.label}
                      onChange={(e) => setEditData({...editData, label: e.target.value})}
                      placeholder="e.g., Main Deposit Wallet"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Wallet Address *</label>
                    <input
                      type="text"
                      value={editData.address}
                      onChange={(e) => setEditData({...editData, address: e.target.value})}
                      placeholder="Enter wallet address..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Status</label>
                    <select
                      value={editData.status}
                      onChange={(e) => setEditData({...editData, status: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-white/60 mb-3">QR Code Colors</label>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs text-white/40 mb-2">Background</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={editData.qrBg}
                            onChange={(e) => setEditData({...editData, qrBg: e.target.value})}
                            className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
                          />
                          <input
                            type="text"
                            value={editData.qrBg}
                            onChange={(e) => setEditData({...editData, qrBg: e.target.value})}
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-white/40 mb-2">Foreground</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={editData.qrFg}
                            onChange={(e) => setEditData({...editData, qrFg: e.target.value})}
                            className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
                          />
                          <input
                            type="text"
                            value={editData.qrFg}
                            onChange={(e) => setEditData({...editData, qrFg: e.target.value})}
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center bg-white/5 rounded-2xl p-6">
                  <p className="text-sm text-white/60 mb-4">QR Code Preview</p>
                  <div 
                    className="rounded-2xl p-4 flex items-center justify-center"
                    style={{ backgroundColor: editData.qrBg || '#ffffff' }}
                  >
                    {editData.address ? (
                      <QRCodeSVG
                        value={editData.address}
                        size={160}
                        level="H"
                        includeMargin={true}
                        bgColor={editData.qrBg || '#ffffff'}
                        fgColor={editData.qrFg || '#000000'}
                      />
                    ) : (
                      <div className="w-[160px] h-[160px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                        <span className="text-gray-400 text-sm">Enter address</span>
                      </div>
                    )}
                  </div>
                  <p className="text-white/40 text-xs mt-4 text-center">Live preview updates as you type</p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showViewModal && selectedCoinData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setShowViewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${selectedCoinData.color} flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
                    {selectedCoinData.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedCoinData.symbol}</h3>
                    <p className="text-white/50 text-sm">{editData.label}</p>
                  </div>
                </div>
                <button onClick={() => setShowViewModal(false)} className="text-white/60 hover:text-white">
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>

              <div 
                className="rounded-2xl p-6 mb-6 flex items-center justify-center"
                style={{ backgroundColor: editData.qrBg || '#ffffff' }}
              >
                <QRCodeSVG
                  value={editData.address}
                  size={180}
                  level="H"
                  includeMargin={true}
                  bgColor={editData.qrBg || '#ffffff'}
                  fgColor={editData.qrFg || '#000000'}
                />
              </div>

              <div className="bg-white/5 rounded-xl p-4 mb-6">
                <label className="text-sm text-white/60 mb-2 block">Deposit Address</label>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-white font-mono text-sm break-all flex-1">{editData.address}</p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(editData.address)
                      showToast('Address copied!')
                    }}
                    className="shrink-0 p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                  >
                    <FaCopy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  editData.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {editData.status}
                </span>
                <div className="flex items-center gap-2 text-white/40 text-sm">
                  <span>QR Colors:</span>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded border border-white/20" style={{ backgroundColor: editData.qrBg }} />
                    <span>/</span>
                    <div className="w-4 h-4 rounded border border-white/20" style={{ backgroundColor: editData.qrFg }} />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowViewModal(false)
                    setShowEditModal(true)
                  }}
                  className="flex-1 px-4 py-3 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <FaEdit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteModal && selectedCoinData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                  <FaExclamationTriangle className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Delete {selectedCoinData.symbol} Address</h3>
                <p className="text-white/60">
                  Are you sure you want to delete the address for <span className="text-white font-medium">{selectedCoinData.symbol}</span>? This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const PortfolioTab = ({ showNotification }) => {
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showStatsModal, setShowStatsModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('value')
  const [sortOrder, setSortOrder] = useState('desc')
  const [editAsset, setEditAsset] = useState(null)
  const [portfolioAssets, setPortfolioAssets] = useState([
    { id: 1, name: 'Bitcoin', symbol: 'BTC', amount: 12.5, value: 843750, change: 2.5, allocation: 35, color: 'from-orange-500 to-yellow-500' },
    { id: 2, name: 'Ethereum', symbol: 'ETH', amount: 85, value: 293250, change: -1.2, allocation: 25, color: 'from-purple-500 to-blue-500' },
    { id: 3, name: 'USDT', symbol: 'USDT', amount: 250000, value: 250000, change: 0, allocation: 20, color: 'from-green-500 to-emerald-500' },
    { id: 4, name: 'Solana', symbol: 'SOL', amount: 1200, value: 174000, change: 5.8, allocation: 12, color: 'from-purple-400 via-pink-500 to-orange-400' },
    { id: 5, name: 'Cardano', symbol: 'ADA', amount: 50000, value: 37500, change: -0.5, allocation: 5, color: 'from-blue-500 to-cyan-500' },
    { id: 6, name: 'Polygon', symbol: 'MATIC', amount: 25000, value: 22500, change: 1.8, allocation: 3, color: 'from-purple-600 to-indigo-600' },
  ])
  const [stats, setStats] = useState({
    totalBalance: 0,
    totalPL: 0,
    totalVolume: 0,
    totalTrades: 0
  })
  const [formData, setFormData] = useState({ name: '', symbol: '', amount: '', value: '' })
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [users, setUsers] = useState([])
  const [selectedUserName, setSelectedUserName] = useState('Global Stats')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/superadmin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        const usersArray = Array.isArray(data) ? data : (data.users || [])
        setUsers(usersArray)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  const handleUserSelect = (userId) => {
    setSelectedUserId(userId)
    if (userId) {
      const user = users.find(u => u._id === userId)
      setSelectedUserName(user?.name || 'User')
    } else {
      setSelectedUserName('Global Stats')
    }
  }

  useEffect(() => {
    const fetchPortfolioStats = async () => {
      try {
        const token = localStorage.getItem('token')
        const url = selectedUserId 
          ? `/api/superadmin/portfolio-stats?userId=${selectedUserId}`
          : '/api/superadmin/portfolio-stats'
        const res = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setStats(data)
          setStatsFormData(data)
        }
      } catch (error) {
        console.error('Failed to fetch portfolio stats:', error)
      }
    }
    if (users.length > 0) {
      fetchPortfolioStats()
    }
  }, [selectedUserId, users])
  const [statsFormData, setStatsFormData] = useState({ ...stats })

  const filteredAssets = portfolioAssets
    .filter(asset => asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const aVal = a[sortBy]
      const bVal = b[sortBy]
      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal
    })

  const totalValue = portfolioAssets.reduce((sum, asset) => sum + asset.value, 0)
  const avgChange = portfolioAssets.length > 0 ? (portfolioAssets.reduce((sum, a) => sum + a.change, 0) / portfolioAssets.length).toFixed(1) : 0
  const bestPerformer = portfolioAssets.reduce((best, a) => a.change > (best?.change || -Infinity) ? a : best, null)

  const handleSort = (column) => {
    if (sortBy === column) setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
    else { setSortBy(column); setSortOrder('desc') }
  }

  const openEditModal = (asset) => {
    setEditAsset(asset)
    setFormData({ name: asset.name, symbol: asset.symbol, amount: asset.amount.toString(), value: asset.value.toString() })
    setShowAddModal(true)
  }

  const handleCreate = () => {
    if (!formData.name || !formData.symbol) return
    const colors = ['from-orange-500 to-yellow-500', 'from-purple-500 to-blue-500', 'from-green-500 to-emerald-500', 'from-purple-400 via-pink-500 to-orange-400', 'from-blue-500 to-cyan-500', 'from-purple-600 to-indigo-600']
    const newAsset = { id: Date.now(), name: formData.name, symbol: formData.symbol.toUpperCase(), amount: parseFloat(formData.amount) || 0, value: parseFloat(formData.value) || 0, change: 0, allocation: 0, color: colors[Math.floor(Math.random() * colors.length)] }
    setPortfolioAssets([...portfolioAssets, newAsset])
    setShowAddModal(false)
    setFormData({ name: '', symbol: '', amount: '', value: '' })
    showNotification('Asset added successfully')
  }

  const handleUpdate = () => {
    if (!editAsset || !formData.name) return
    const updated = portfolioAssets.map(a => a.id === editAsset.id ? { ...a, name: formData.name, symbol: formData.symbol.toUpperCase(), amount: parseFloat(formData.amount) || 0, value: parseFloat(formData.value) || 0 } : a)
    setPortfolioAssets(updated)
    setShowAddModal(false)
    setEditAsset(null)
    setFormData({ name: '', symbol: '', amount: '', value: '' })
    showNotification('Asset updated successfully')
  }

  const handleDelete = () => {
    if (!editAsset) return
    setPortfolioAssets(portfolioAssets.filter(a => a.id !== editAsset.id))
    setShowDeleteModal(false)
    setEditAsset(null)
    showNotification('Asset deleted successfully')
  }

  const openDeleteModal = (asset) => {
    setEditAsset(asset)
    setShowDeleteModal(true)
  }

  const openStatsModal = () => {
    setStatsFormData({ ...stats })
    setShowStatsModal(true)
  }

  const handleSaveStats = async () => {
    try {
      const token = localStorage.getItem('token')
      
      const res = await fetch('/api/superadmin/portfolio-stats', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: selectedUserId,
          totalBalance: statsFormData.totalBalance,
          totalPL: statsFormData.totalPL,
          totalVolume: statsFormData.totalVolume,
          totalTrades: statsFormData.totalTrades
        })
      })
      
      if (res.ok) {
        setStats(statsFormData)
        setShowStatsModal(false)
        showNotification('Portfolio stats updated successfully!')
      } else {
        const error = await res.json()
        showNotification(error.message || 'Failed to update portfolio stats', 'error')
      }
    } catch (error) {
      console.error('Failed to save portfolio stats:', error)
      setStats(statsFormData)
      setShowStatsModal(false)
      showNotification('Portfolio stats updated locally')
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-white">Portfolio Overview</h2>
          <select
            value={selectedUserId || ''}
            onChange={(e) => handleUserSelect(e.target.value || null)}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/80 text-sm focus:outline-none cursor-pointer"
          >
            <option value="">Global Stats</option>
            {users.map(user => (
              <option key={user._id} value={user._id}>{user.name}</option>
            ))}
          </select>
          {selectedUserId && (
            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-sm">
              Editing: {selectedUserName}
            </span>
          )}
        </div>
        <GlowButton size="sm" onClick={openStatsModal}>
          <FaEdit className="w-3 h-3" /> Edit Stats
        </GlowButton>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <ModernCard className="p-5 cursor-pointer hover:border-violet-500/30 transition-colors" onClick={openStatsModal}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
              <FaDollarSign className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm text-white/50">Total Balance</span>
          </div>
          <p className="text-2xl font-bold text-white">${stats.totalBalance.toLocaleString()}</p>
        </ModernCard>
        <ModernCard className="p-5 cursor-pointer hover:border-emerald-500/30 transition-colors" onClick={openStatsModal}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <FaArrowUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm text-white/50">Total P/L</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">+${stats.totalPL.toLocaleString()}</p>
        </ModernCard>
        <ModernCard className="p-5 cursor-pointer hover:border-amber-500/30 transition-colors" onClick={openStatsModal}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <FaPercentage className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm text-white/50">Total Volume</span>
          </div>
          <p className="text-2xl font-bold text-white">${(stats.totalVolume / 1000000).toFixed(2)}M</p>
        </ModernCard>
        <ModernCard className="p-5 cursor-pointer hover:border-blue-500/30 transition-colors" onClick={openStatsModal}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <FaCoins className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm text-white/50">Total Trades</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.totalTrades.toLocaleString()}</p>
        </ModernCard>
      </div>

      <ModernCard className="p-6" hover={false}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search assets..." className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50" />
          </div>
          <div className="flex items-center gap-3">
            <select value={`${sortBy}-${sortOrder}`} onChange={(e) => { const [col, order] = e.target.value.split('-'); setSortBy(col); setSortOrder(order); }} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/80 text-sm focus:outline-none cursor-pointer">
              <option value="value-desc">Value (High to Low)</option>
              <option value="value-asc">Value (Low to High)</option>
              <option value="change-desc">Change (High to Low)</option>
              <option value="change-asc">Change (Low to High)</option>
              <option value="allocation-desc">Allocation (High to Low)</option>
              <option value="allocation-asc">Allocation (Low to High)</option>
            </select>
            <GlowButton onClick={() => { setEditAsset(null); setFormData({ name: '', symbol: '', amount: '', value: '' }); setShowAddModal(true); }}>
              <FaPlus className="w-4 h-4" /> Add Asset
            </GlowButton>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/[0.02]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/60">Asset</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/60 cursor-pointer hover:text-white" onClick={() => handleSort('amount')}>Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/60 cursor-pointer hover:text-white" onClick={() => handleSort('value')}>Value (USD)</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/60 cursor-pointer hover:text-white" onClick={() => handleSort('change')}>24h Change</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/60">Allocation</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-white/60">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredAssets.map((asset) => (
                <motion.tr key={asset.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => setSelectedAsset(asset)}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${asset.color} flex items-center justify-center text-white font-bold`}>{asset.symbol.slice(0, 2)}</div>
                      <div>
                        <p className="text-white font-medium">{asset.name}</p>
                        <p className="text-sm text-white/40">{asset.symbol}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white">{asset.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-white font-medium">${asset.value.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${asset.change > 0 ? 'bg-emerald-500/20 text-emerald-400' : asset.change < 0 ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white/60'}`}>{asset.change > 0 ? '+' : ''}{asset.change}%</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${asset.allocation}%` }} className={`h-full rounded-full bg-gradient-to-r ${asset.color}`} />
                      </div>
                      <span className="text-white text-sm w-12">{asset.allocation}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); openEditModal(asset); }} className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"><FaEdit className="w-4 h-4" /></motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); openDeleteModal(asset); }} className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"><FaTrash className="w-4 h-4" /></motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </ModernCard>

      <AnimatePresence>
        {showAddModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-6">{editAsset ? 'Edit Asset' : 'Add New Asset'}</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Asset Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g., Bitcoin" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50" />
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Symbol</label>
                  <input type="text" value={formData.symbol} onChange={(e) => setFormData({...formData, symbol: e.target.value})} placeholder="e.g., BTC" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-white/60 mb-2 block">Amount</label>
                    <input type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} placeholder="0.00" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50" />
                  </div>
                  <div>
                    <label className="text-sm text-white/60 mb-2 block">Value (USD)</label>
                    <input type="number" value={formData.value} onChange={(e) => setFormData({...formData, value: e.target.value})} placeholder="0.00" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 transition-all">Cancel</button>
                <button onClick={editAsset ? handleUpdate : handleCreate} className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-medium hover:shadow-lg hover:shadow-violet-500/30 transition-all">{editAsset ? 'Update' : 'Add Asset'}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteModal && editAsset && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-4">Delete Asset</h3>
              <p className="text-white/60 mb-6">Are you sure you want to delete {editAsset.name}? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10">Cancel</button>
                <button onClick={handleDelete} className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-medium">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showStatsModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowStatsModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-6">Edit Portfolio Stats</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Total Balance ($)</label>
                  <input type="number" value={statsFormData.totalBalance} onChange={(e) => setStatsFormData({...statsFormData, totalBalance: parseFloat(e.target.value) || 0})} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500/50" />
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Total P/L ($)</label>
                  <input type="number" value={statsFormData.totalPL} onChange={(e) => setStatsFormData({...statsFormData, totalPL: parseFloat(e.target.value) || 0})} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500/50" />
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Total Volume ($)</label>
                  <input type="number" value={statsFormData.totalVolume} onChange={(e) => setStatsFormData({...statsFormData, totalVolume: parseFloat(e.target.value) || 0})} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500/50" />
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Total Trades</label>
                  <input type="number" value={statsFormData.totalTrades} onChange={(e) => setStatsFormData({...statsFormData, totalTrades: parseInt(e.target.value) || 0})} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500/50" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowStatsModal(false)} className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10">Cancel</button>
                <button onClick={handleSaveStats} className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-medium hover:shadow-lg hover:shadow-violet-500/30">Save Changes</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const WalletTab = ({ showNotification }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedWallet, setSelectedWallet] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showStatsModal, setShowStatsModal] = useState(false)
  const [wallets, setWallets] = useState([
    { id: 1, name: 'Main Deposit', coin: 'BTC', address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', balance: 15.234, status: 'active', created: '2024-01-15' },
    { id: 2, name: 'Trading Hot Wallet', coin: 'ETH', address: '0x71c7656ec7ab88b098defb751b7401b5f6d8976f', balance: 125.5, status: 'active', created: '2024-02-20' },
    { id: 3, name: 'Cold Storage', coin: 'USDT', address: '0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE', balance: 500000, status: 'active', created: '2024-03-05' },
    { id: 4, name: 'Withdrawal Pool', coin: 'BTC', address: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq', balance: 3.892, status: 'inactive', created: '2024-03-10' },
  ])
  const [walletStats, setWalletStats] = useState({
    availableBalance: 0,
    totalDeposit: 0,
    totalWithdraw: 0,
    totalProfit: 0
  })
  const [formData, setFormData] = useState({ name: '', coin: 'BTC', address: '', balance: '' })
  const [statsFormData, setStatsFormData] = useState({ ...walletStats })
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [users, setUsers] = useState([])
  const [selectedUserName, setSelectedUserName] = useState('Global Stats')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/superadmin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        const usersArray = Array.isArray(data) ? data : (data.users || [])
        setUsers(usersArray)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  const handleUserSelect = (userId) => {
    setSelectedUserId(userId)
    if (userId) {
      const user = users.find(u => u._id === userId)
      setSelectedUserName(user?.name || 'User')
    } else {
      setSelectedUserName('Global Stats')
    }
  }

  const filteredWallets = wallets.filter(wallet => {
    const matchesSearch = wallet.name.toLowerCase().includes(searchTerm.toLowerCase()) || wallet.coin.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || wallet.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0)

  const fetchWalletStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const url = selectedUserId 
        ? `/api/superadmin/wallet-stats?userId=${selectedUserId}`
        : '/api/superadmin/wallet-stats'
      
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (res.ok) {
        const data = await res.json()
        setWalletStats({
          availableBalance: data.availableBalance || 0,
          totalDeposit: data.totalDeposit || 0,
          totalWithdraw: data.totalWithdraw || 0,
          totalProfit: data.totalProfit || 0
        })
        setStatsFormData({
          availableBalance: data.availableBalance || 0,
          totalDeposit: data.totalDeposit || 0,
          totalWithdraw: data.totalWithdraw || 0,
          totalProfit: data.totalProfit || 0
        })
        if (selectedUserId) {
          const user = users.find(u => u._id === selectedUserId)
          setSelectedUserName(user?.name || 'User')
        } else {
          setSelectedUserName('Global Stats')
        }
      }
    } catch (error) {
      console.error('Failed to fetch wallet stats:', error)
    }
  }

  useEffect(() => {
    if (users.length > 0) {
      fetchWalletStats()
    }
  }, [selectedUserId, users])

  const handleCreate = () => {
    if (!formData.name || !formData.address) return
    const newWallet = { id: Date.now(), name: formData.name, coin: formData.coin, address: formData.address, balance: parseFloat(formData.balance) || 0, status: 'active', created: new Date().toISOString().split('T')[0] }
    setWallets([...wallets, newWallet])
    setShowAddModal(false)
    setFormData({ name: '', coin: 'BTC', address: '', balance: '' })
    showNotification('Wallet created successfully')
  }

  const handleUpdate = () => {
    if (!selectedWallet || !formData.name) return
    const updated = wallets.map(w => w.id === selectedWallet.id ? { ...w, name: formData.name, coin: formData.coin, address: formData.address, balance: parseFloat(formData.balance) || 0 } : w)
    setWallets(updated)
    setShowEditModal(false)
    setSelectedWallet(null)
    setFormData({ name: '', coin: 'BTC', address: '', balance: '' })
    showNotification('Wallet updated successfully')
  }

  const handleDelete = () => {
    if (!selectedWallet) return
    setWallets(wallets.filter(w => w.id !== selectedWallet.id))
    setShowDeleteModal(false)
    setSelectedWallet(null)
    showNotification('Wallet deleted successfully')
  }

  const openEditModal = (wallet) => {
    setSelectedWallet(wallet)
    setFormData({ name: wallet.name, coin: wallet.coin, address: wallet.address, balance: wallet.balance.toString() })
    setShowEditModal(true)
  }

  const openDeleteModal = (wallet) => {
    setSelectedWallet(wallet)
    setShowDeleteModal(true)
  }

  const toggleStatus = (wallet) => {
    const updated = wallets.map(w => w.id === wallet.id ? { ...w, status: w.status === 'active' ? 'inactive' : 'active' } : w)
    setWallets(updated)
    showNotification(`Wallet ${wallet.status === 'active' ? 'deactivated' : 'activated'}`)
  }

  const openStatsModal = () => {
    setStatsFormData({ ...walletStats })
    setShowStatsModal(true)
  }

  const handleSaveStats = async () => {
    try {
      const token = localStorage.getItem('token')
      
      const payload = {
        userId: selectedUserId,
        availableBalance: statsFormData.availableBalance,
        totalDeposit: statsFormData.totalDeposit,
        totalWithdraw: statsFormData.totalWithdraw,
        totalProfit: statsFormData.totalProfit
      }
      console.log('Sending wallet stats update:', payload);
      
      const res = await fetch('/api/superadmin/wallet-stats', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: selectedUserId,
          availableBalance: statsFormData.availableBalance,
          totalDeposit: statsFormData.totalDeposit,
          totalWithdraw: statsFormData.totalWithdraw,
          totalProfit: statsFormData.totalProfit
        })
      })
      
      if (res.ok) {
        const data = await res.json()
        setWalletStats(statsFormData)
        setShowStatsModal(false)
        showNotification('Wallet stats updated successfully!')
      } else {
        const error = await res.json()
        showNotification(error.message || 'Failed to update wallet stats', 'error')
      }
    } catch (error) {
      console.error('Failed to save wallet stats:', error)
      setWalletStats(statsFormData)
      setShowStatsModal(false)
      showNotification('Wallet stats updated locally')
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-white">Wallet Overview</h2>
          <select
            value={selectedUserId || ''}
            onChange={(e) => handleUserSelect(e.target.value || null)}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/80 text-sm focus:outline-none cursor-pointer"
          >
            <option value="">Global Stats</option>
            {users.map(user => (
              <option key={user._id} value={user._id}>{user.name}</option>
            ))}
          </select>
          {selectedUserId && (
            <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-sm">
              Editing: {selectedUserName}
            </span>
          )}
        </div>
        <GlowButton size="sm" onClick={openStatsModal}>
          <FaEdit className="w-3 h-3" /> Edit Stats
        </GlowButton>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <ModernCard className="p-5 cursor-pointer hover:border-cyan-500/30 transition-colors" onClick={openStatsModal}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
              <FaWallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm text-white/50">Available Balance</span>
          </div>
          <p className="text-2xl font-bold text-white">${walletStats.availableBalance.toLocaleString()}</p>
        </ModernCard>
        <ModernCard className="p-5 cursor-pointer hover:border-emerald-500/30 transition-colors" onClick={openStatsModal}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <FaArrowDown className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm text-white/50">Total Deposit</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">${walletStats.totalDeposit.toLocaleString()}</p>
        </ModernCard>
        <ModernCard className="p-5 cursor-pointer hover:border-red-500/30 transition-colors" onClick={openStatsModal}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center">
              <FaArrowUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm text-white/50">Total Withdraw</span>
          </div>
          <p className="text-2xl font-bold text-red-400">${walletStats.totalWithdraw.toLocaleString()}</p>
        </ModernCard>
        <ModernCard className="p-5 cursor-pointer hover:border-purple-500/30 transition-colors" onClick={openStatsModal}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <FaCoins className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm text-white/50">Total Profit</span>
          </div>
          <p className="text-2xl font-bold text-purple-400">${walletStats.totalProfit.toLocaleString()}</p>
        </ModernCard>
      </div>

      <ModernCard className="p-6" hover={false}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search wallets..." className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50" />
          </div>
          <div className="flex items-center gap-3">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/80 text-sm focus:outline-none cursor-pointer">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <GlowButton onClick={() => { setFormData({ name: '', coin: 'BTC', address: '', balance: '' }); setShowAddModal(true); }} variant="success">
              <FaPlus className="w-4 h-4" /> Add Wallet
            </GlowButton>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWallets.map((wallet) => (
            <motion.div key={wallet.id} whileHover={{ scale: 1.02, y: -4 }} className="p-5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${COIN_COLORS[wallet.coin]?.color || 'from-gray-500 to-gray-600'} flex items-center justify-center text-white font-bold text-sm`}>{COIN_COLORS[wallet.coin]?.icon || wallet.coin.slice(0, 2)}</div>
                  <div>
                    <p className="text-white font-medium">{wallet.name}</p>
                    <p className="text-sm text-white/40">{wallet.coin}</p>
                  </div>
                </div>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => toggleStatus(wallet)} className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer ${wallet.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>{wallet.status}</motion.button>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Balance</span>
                  <span className="text-white font-medium">{wallet.balance} {wallet.coin}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Address</span>
                  <span className="text-white/60 font-mono text-xs">{wallet.address.slice(0, 8)}...{wallet.address.slice(-6)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                <span className="text-xs text-white/30">{wallet.created}</span>
                <div className="flex gap-2">
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => { navigator.clipboard.writeText(wallet.address); showNotification('Address copied!'); }} className="p-1.5 rounded-lg bg-white/10 text-white/60 hover:text-white transition-colors"><FaCopy className="w-3.5 h-3.5" /></motion.button>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => openEditModal(wallet)} className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"><FaEdit className="w-3.5 h-3.5" /></motion.button>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => openDeleteModal(wallet)} className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"><FaTrash className="w-3.5 h-3.5" /></motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </ModernCard>

      <AnimatePresence>
        {showAddModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-6">Add New Wallet</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Wallet Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g., Main Deposit Wallet" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50" />
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Coin</label>
                  <select value={formData.coin} onChange={(e) => setFormData({...formData, coin: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 cursor-pointer">
                    {SUPPORTED_COINS.map(coin => <option key={coin} value={coin}>{coin}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Wallet Address</label>
                  <input type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} placeholder="Enter wallet address..." className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50" />
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Initial Balance</label>
                  <input type="number" value={formData.balance} onChange={(e) => setFormData({...formData, balance: e.target.value})} placeholder="0.00" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 transition-all">Cancel</button>
                <button onClick={handleCreate} className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:shadow-lg hover:shadow-cyan-500/30 transition-all">Create Wallet</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEditModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowEditModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-6">Edit Wallet</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Wallet Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50" />
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Coin</label>
                  <select value={formData.coin} onChange={(e) => setFormData({...formData, coin: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 cursor-pointer">
                    {SUPPORTED_COINS.map(coin => <option key={coin} value={coin}>{coin}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Wallet Address</label>
                  <input type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50" />
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Balance</label>
                  <input type="number" value={formData.balance} onChange={(e) => setFormData({...formData, balance: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 transition-all">Cancel</button>
                <button onClick={handleUpdate} className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all">Update Wallet</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteModal && selectedWallet && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-4">Delete Wallet</h3>
              <p className="text-white/60 mb-6">Are you sure you want to delete {selectedWallet.name}? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10">Cancel</button>
                <button onClick={handleDelete} className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-medium">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showStatsModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowStatsModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-6">Edit Wallet Stats</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Available Balance ($)</label>
                  <input type="number" value={statsFormData.availableBalance} onChange={(e) => setStatsFormData({...statsFormData, availableBalance: parseFloat(e.target.value) || 0})} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50" />
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Total Deposit ($)</label>
                  <input type="number" value={statsFormData.totalDeposit} onChange={(e) => setStatsFormData({...statsFormData, totalDeposit: parseFloat(e.target.value) || 0})} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50" />
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Total Withdraw ($)</label>
                  <input type="number" value={statsFormData.totalWithdraw} onChange={(e) => setStatsFormData({...statsFormData, totalWithdraw: parseFloat(e.target.value) || 0})} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50" />
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Total Profit ($)</label>
                  <input type="number" value={statsFormData.totalProfit} onChange={(e) => setStatsFormData({...statsFormData, totalProfit: parseFloat(e.target.value) || 0})} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500/50" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowStatsModal(false)} className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10">Cancel</button>
                <button onClick={handleSaveStats} className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:shadow-lg hover:shadow-cyan-500/30">Save Changes</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const DepositTab = ({ showNotification }) => {
  const { data: depositsData, refetch } = useQuery({
    queryKey: ['superadmin-deposits'],
    queryFn: async () => {
      const res = await fetch('/api/superadmin/deposits', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await res.json()
      return Array.isArray(data) ? data : (data.deposits || [])
    }
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [processingId, setProcessingId] = useState(null)
  const [selectedDeposit, setSelectedDeposit] = useState(null)
  const [allDeposits, setAllDeposits] = useState(() => {
    if (depositsData && depositsData.length > 0) {
      return depositsData
    }
    return [
      { _id: 'DEP001', user: { name: 'John Doe', email: 'john@example.com' }, amount: 5000, method: 'bank', status: 'pending', createdAt: new Date() },
      { _id: 'DEP002', user: { name: 'Sarah Connor', email: 'sarah@example.com' }, amount: 10000, method: 'card', status: 'pending', createdAt: new Date() },
      { _id: 'DEP003', user: { name: 'Mike Johnson', email: 'mike@example.com' }, amount: 2500, method: 'crypto', status: 'completed', createdAt: new Date() },
      { _id: 'DEP004', user: { name: 'Emily Davis', email: 'emily@example.com' }, amount: 7500, method: 'bank', status: 'pending', createdAt: new Date() },
      { _id: 'DEP005', user: { name: 'David Lee', email: 'david@example.com' }, amount: 3200, method: 'card', status: 'completed', createdAt: new Date() },
    ]
  })

  useEffect(() => {
    if (depositsData && depositsData.length > 0) {
      setAllDeposits(depositsData)
    }
  }, [depositsData])

  const deposits = allDeposits

  const filteredDeposits = deposits.filter(deposit => {
    const matchesSearch = deposit.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         deposit.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         deposit._id?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || deposit.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: deposits.length,
    pending: deposits.filter(d => d.status === 'pending').length,
    completed: deposits.filter(d => d.status === 'completed').length,
    totalAmount: deposits.reduce((sum, d) => sum + d.amount, 0),
  }

  const handleApprove = async (deposit) => {
    setProcessingId(deposit._id)
    
    const updated = allDeposits.map(d => d._id === deposit._id ? { ...d, status: 'completed' } : d)
    setAllDeposits(updated)
    
    if (deposit._id.startsWith('DEP')) {
      showNotification('Deposit approved successfully!')
      setProcessingId(null)
      return
    }
    
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/superadmin/deposits/${deposit._id}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (res.ok) {
        refetch()
        showNotification('Deposit approved successfully!')
      } else {
        showNotification('Failed to approve deposit')
      }
    } catch (error) {
      showNotification('Failed to approve deposit')
    }
    setProcessingId(null)
  }

  const handleReject = async (deposit) => {
    setProcessingId(deposit._id)
    
    const updated = allDeposits.map(d => d._id === deposit._id ? { ...d, status: 'rejected' } : d)
    setAllDeposits(updated)
    
    if (deposit._id.startsWith('DEP')) {
      showNotification('Deposit rejected!')
      setProcessingId(null)
      return
    }
    
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/superadmin/deposits/${deposit._id}/reject`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (res.ok) {
        refetch()
        showNotification('Deposit rejected!')
      } else {
        showNotification('Failed to reject deposit')
      }
    } catch (error) {
      showNotification('Failed to reject deposit')
    }
    setProcessingId(null)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <ModernCard className="p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
              <FaCoins className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm text-white/50">Total Deposits</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </ModernCard>
        <ModernCard className="p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <FaClock className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm text-white/50">Pending</span>
          </div>
          <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
        </ModernCard>
        <ModernCard className="p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <FaCheckCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm text-white/50">Completed</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">{stats.completed}</p>
        </ModernCard>
        <ModernCard className="p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <FaDollarSign className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm text-white/50">Total Amount</span>
          </div>
          <p className="text-2xl font-bold text-white">${stats.totalAmount.toLocaleString()}</p>
        </ModernCard>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative flex-1 w-full">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search by user or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'pending', 'completed', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                statusFilter === status
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredDeposits.map((deposit) => (
          <motion.div
            key={deposit._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  deposit.status === 'completed' ? 'bg-emerald-500/20' :
                  deposit.status === 'pending' ? 'bg-amber-500/20' : 'bg-red-500/20'
                }`}>
                  {deposit.status === 'completed' ? <FaCheckCircle className="w-6 h-6 text-emerald-400" /> :
                   deposit.status === 'pending' ? <FaClock className="w-6 h-6 text-amber-400" /> :
                   <FaTimesCircle className="w-6 h-6 text-red-400" />}
                </div>
                <div>
                  <p className="font-semibold text-white">{deposit.user?.name || 'Unknown User'}</p>
                  <p className="text-sm text-white/50">{deposit.user?.email}</p>
                  <p className="text-xs text-white/30">ID: {deposit._id}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-400">${deposit.amount?.toLocaleString()}</p>
                  <p className="text-sm text-white/50">{deposit.method}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  deposit.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                  deposit.status === 'pending' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {deposit.status}
                </div>
                {deposit.status === 'pending' && (
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleApprove(deposit)}
                      disabled={processingId === deposit._id}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium disabled:opacity-50"
                    >
                      {processingId === deposit._id ? 'Processing...' : 'Approve'}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleReject(deposit)}
                      disabled={processingId === deposit._id}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-medium disabled:opacity-50"
                    >
                      Reject
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

const SupportTab = ({ showNotification }) => {
  const [activeTab, setActiveTab] = useState('tickets')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [showReplyModal, setShowReplyModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [tickets, setTickets] = useState([
    { id: 'TKT-001', subject: 'Unable to withdraw funds', user: 'John Doe', email: 'john@example.com', status: 'open', priority: 'high', created: '2024-03-25', lastUpdate: '2 hours ago', messages: 3 },
    { id: 'TKT-002', subject: 'KYC verification pending', user: 'Sarah Smith', email: 'sarah@example.com', status: 'pending', priority: 'medium', created: '2024-03-24', lastUpdate: '5 hours ago', messages: 5 },
    { id: 'TKT-003', subject: 'API integration issue', user: 'Mike Johnson', email: 'mike@example.com', status: 'resolved', priority: 'low', created: '2024-03-23', lastUpdate: '1 day ago', messages: 8 },
    { id: 'TKT-004', subject: 'Account locked', user: 'Emily Davis', email: 'emily@example.com', status: 'open', priority: 'high', created: '2024-03-26', lastUpdate: '30 min ago', messages: 2 },
  ])
  const [formData, setFormData] = useState({ subject: '', user: '', email: '', priority: 'medium' })

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) || ticket.user.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const stats = {
    open: tickets.filter(t => t.status === 'open').length,
    pending: tickets.filter(t => t.status === 'pending').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    total: tickets.length,
  }

  const handleSendReply = () => {
    if (newMessage.trim()) {
      showNotification('Reply sent successfully')
      setNewMessage('')
      setShowReplyModal(false)
    }
  }

  const handleCreateTicket = () => {
    if (!formData.subject || !formData.user) return
    const newTicket = { id: `TKT-${String(Date.now()).slice(-6)}`, subject: formData.subject, user: formData.user, email: formData.email || 'no-reply@example.com', status: 'open', priority: formData.priority, created: new Date().toISOString().split('T')[0], lastUpdate: 'Just now', messages: 1 }
    setTickets([newTicket, ...tickets])
    setShowCreateModal(false)
    setFormData({ subject: '', user: '', email: '', priority: 'medium' })
    showNotification('Ticket created successfully')
  }

  const handleResolve = (ticket) => {
    const updated = tickets.map(t => t.id === ticket.id ? { ...t, status: 'resolved', lastUpdate: 'Just now' } : t)
    setTickets(updated)
    showNotification(`Ticket ${ticket.id} marked as resolved`)
  }

  const handleDelete = () => {
    if (!selectedTicket) return
    setTickets(tickets.filter(t => t.id !== selectedTicket.id))
    setShowDeleteModal(false)
    setSelectedTicket(null)
    showNotification('Ticket deleted successfully')
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <ModernCard className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center">
              <FaTicketAlt className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm text-white/50">Open Tickets</span>
          </div>
          <p className="text-2xl font-bold text-red-400">{stats.open}</p>
        </ModernCard>
        <ModernCard className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <FiClock className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm text-white/50">Pending</span>
          </div>
          <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
        </ModernCard>
        <ModernCard className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <FaCheckCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm text-white/50">Resolved</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">{stats.resolved}</p>
        </ModernCard>
        <ModernCard className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
              <FaHeadset className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm text-white/50">Total Tickets</span>
          </div>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </ModernCard>
      </div>

      <div className="flex gap-2 mb-6">
        {['tickets', 'live-chat', 'knowledge-base'].map((tab) => (
          <MotionButton key={tab} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setActiveTab(tab)} className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === tab ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30' : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'}`}>
            {tab === 'tickets' && <FaTicketAlt className="w-4 h-4 mr-2 inline" />}
            {tab === 'live-chat' && <FaComments className="w-4 h-4 mr-2 inline" />}
            {tab === 'knowledge-base' && <FiFileText className="w-4 h-4 mr-2 inline" />}
            {tab.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </MotionButton>
        ))}
      </div>

      {activeTab === 'tickets' && (
        <>
          <ModernCard className="p-6" hover={false}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search tickets..." className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-pink-500/50" />
              </div>
              <div className="flex items-center gap-3">
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/80 text-sm focus:outline-none cursor-pointer">
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="pending">Pending</option>
                  <option value="resolved">Resolved</option>
                </select>
                <GlowButton onClick={() => { setFormData({ subject: '', user: '', email: '', priority: 'medium' }); setShowCreateModal(true); }}>
                  <FaPlus className="w-4 h-4" /> New Ticket
                </GlowButton>
              </div>
            </div>

            <div className="space-y-3">
              {filteredTickets.map((ticket) => (
                <motion.div key={ticket.id} whileHover={{ scale: 1.01, x: 4 }} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-pink-500/30 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ticket.priority === 'high' ? 'bg-red-500/20 text-red-400' : ticket.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
                        {ticket.priority === 'high' ? <FaExclamationTriangle className="w-5 h-5" /> : ticket.priority === 'medium' ? <FiAlertTriangle className="w-5 h-5" /> : <FaTicketAlt className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium">{ticket.subject}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ticket.status === 'open' ? 'bg-red-500/20 text-red-400' : ticket.status === 'pending' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>{ticket.status}</span>
                        </div>
                        <p className="text-sm text-white/40">{ticket.user} • {ticket.email}</p>
                        <p className="text-xs text-white/30 mt-1">ID: {ticket.id} • {ticket.messages} messages • Updated {ticket.lastUpdate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => { setSelectedTicket(ticket); setShowReplyModal(true); }} className="p-2 rounded-lg bg-pink-500/20 text-pink-400 hover:bg-pink-500/30 transition-colors"><FiMessageSquare className="w-4 h-4" /></motion.button>
                      {ticket.status !== 'resolved' && (
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleResolve(ticket)} className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"><FaCheckCircle className="w-4 h-4" /></motion.button>
                      )}
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => { setSelectedTicket(ticket); setShowDeleteModal(true); }} className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"><FaTrash className="w-4 h-4" /></motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </ModernCard>
        </>
      )}

      {activeTab === 'live-chat' && (
        <ModernCard className="p-6" hover={false}>
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mx-auto mb-4">
              <FaComments className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Live Chat Center</h3>
            <p className="text-white/60 mb-6">Connect with users in real-time</p>
            <GlowButton onClick={() => showNotification('Opening live chat...')}>
              <FaComments className="w-4 h-4" /> Start New Chat
            </GlowButton>
          </div>
        </ModernCard>
      )}

      {activeTab === 'knowledge-base' && (
        <ModernCard className="p-6" hover={false}>
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center mx-auto mb-4">
              <FiFileText className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Knowledge Base</h3>
            <p className="text-white/60 mb-6">Find answers and documentation</p>
            <GlowButton onClick={() => showNotification('Opening knowledge base...')}>
              <FiSearch className="w-4 h-4" /> Browse Articles
            </GlowButton>
          </div>
        </ModernCard>
      )}

      <AnimatePresence>
        {showCreateModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-6">Create Ticket</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Subject</label>
                  <input type="text" value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} placeholder="Ticket subject" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-pink-500/50" />
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-2 block">User Name</label>
                  <input type="text" value={formData.user} onChange={(e) => setFormData({...formData, user: e.target.value})} placeholder="User name" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-pink-500/50" />
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Email</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="user@example.com" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-pink-500/50" />
                </div>
                <div>
                  <label className="text-sm text-white/60 mb-2 block">Priority</label>
                  <select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none cursor-pointer">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10">Cancel</button>
                <button onClick={handleCreateTicket} className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium">Create Ticket</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteModal && selectedTicket && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-4">Delete Ticket</h3>
              <p className="text-white/60 mb-6">Are you sure you want to delete ticket {selectedTicket.id}? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10">Cancel</button>
                <button onClick={handleDelete} className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-medium">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showReplyModal && selectedTicket && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowReplyModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedTicket.subject}</h3>
                  <p className="text-sm text-white/50">{selectedTicket.user} • {selectedTicket.email}</p>
                </div>
                <button onClick={() => setShowReplyModal(false)} className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"><FaTimes className="w-5 h-5" /></button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs">{selectedTicket.user.charAt(0)}</div>
                  <div className="flex-1 p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-white text-sm">{selectedTicket.subject} - Please help me resolve this issue as soon as possible.</p>
                    <p className="text-xs text-white/30 mt-2">{selectedTicket.created}</p>
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <div className="flex-1 p-4 rounded-xl bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/20">
                    <p className="text-white text-sm">Thank you for reaching out. Our team is looking into this and will get back to you shortly.</p>
                    <p className="text-xs text-white/30 mt-2">Admin • Just now</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold text-xs">A</div>
                </div>
              </div>
              <div className="border-t border-white/10 pt-4">
                <div className="flex gap-3">
                  <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type your reply..." className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-pink-500/50" onKeyDown={(e) => e.key === 'Enter' && handleSendReply()} />
                  <GlowButton onClick={handleSendReply}><FiSend className="w-4 h-4" /> Send</GlowButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const SuperAdmin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const { initTheme } = useThemeStore()
  const navigate = useNavigate()

  useEffect(() => {
    initTheme()
    const token = localStorage.getItem('token')
    const currentPath = window.location.pathname
    
    if (token) {
      const decoded = decodeToken(token)
      const isSuperAdmin = decoded?.role === 'superadmin' || decoded?.role === 'admin'
      
      if (isSuperAdmin) {
        setIsLoggedIn(true)
      } else {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
      }
    }
    setAuthChecked(true)
  }, [initTheme])

  const handleLogin = async (credentials) => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/superadmin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      })
      if (res.ok) {
        const data = await res.json()
        localStorage.setItem('token', data.token)
        setIsLoggedIn(true)
        navigate('/superadmin', { replace: true })
      }
    } catch (error) {
      console.error('Login failed:', error)
    }
    setIsLoading(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    setIsLoggedIn(false)
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {isLoggedIn ? (
        <DashboardPage onLogout={handleLogout} />
      ) : (
        <LoginPage onLogin={handleLogin} isLoading={isLoading} />
      )}
    </div>
  )
}

const TradeSettingsTab = ({ showNotification }) => {
  const { theme } = useThemeStore()
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeSection, setActiveSection] = useState('durations')

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/superadmin/trade-settings', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      if (res.ok) {
        const data = await res.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleSave = async (updatedSettings) => {
    setSaving(true)
    try {
      const res = await fetch('/api/superadmin/trade-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updatedSettings)
      })
      if (res.ok) {
        const data = await res.json()
        setSettings(data.settings)
        showNotification('Settings saved successfully!')
      } else {
        showNotification('Failed to save settings', 'error')
      }
    } catch (error) {
      showNotification('Failed to save settings', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDurationSave = async (durations) => {
    setSaving(true)
    try {
      const res = await fetch('/api/superadmin/trade-settings/durations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ durations })
      })
      if (res.ok) {
        const data = await res.json()
        setSettings(prev => ({ ...prev, durations: data.durations }))
        showNotification('Durations saved successfully!')
      } else {
        showNotification('Failed to save durations', 'error')
      }
    } catch (error) {
      showNotification('Failed to save durations', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  const sections = [
    { id: 'durations', label: 'Durations', icon: FiClock },
    { id: 'leverage', label: 'Leverage', icon: FiZap },
    { id: 'fees', label: 'Fees', icon: FaDollarSign },
    { id: 'limits', label: 'Limits', icon: FiActivity },
    { id: 'status', label: 'Status', icon: FaShieldAlt },
  ]

  const DurationEditor = () => {
    const [durations, setDurations] = useState(settings?.durations || [])

    const updateDuration = (index, field, value) => {
      const updated = [...durations]
      updated[index] = { ...updated[index], [field]: value }
      setDurations(updated)
    }

    const addDuration = () => {
      setDurations([...durations, { value: 60, label: '1m', returnPercent: 1.5, risk: 'low', isActive: true }])
    }

    const removeDuration = (index) => {
      setDurations(durations.filter((_, i) => i !== index))
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-white">Trade Durations</h4>
          <GlowButton onClick={addDuration} size="sm">
            <FaPlus className="w-4 h-4" />
            Add Duration
          </GlowButton>
        </div>
        <div className="space-y-4">
          {durations.map((d, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl border ${
                theme === 'dark' ? 'bg-[var(--bg-tertiary)]/50 border-white/10' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="grid grid-cols-5 gap-4">
                <div>
                  <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Seconds</label>
                  <input
                    type="number"
                    value={d.value}
                    onChange={(e) => updateDuration(i, 'value', parseInt(e.target.value) || 0)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Label</label>
                  <input
                    type="text"
                    value={d.label}
                    onChange={(e) => updateDuration(i, 'label', e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
                    }`}
                    placeholder="30s"
                  />
                </div>
                <div>
                  <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Return %</label>
                  <input
                    type="number"
                    step="0.01"
                    value={d.returnPercent}
                    onChange={(e) => updateDuration(i, 'returnPercent', parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Risk</label>
                  <select
                    value={d.risk}
                    onChange={(e) => updateDuration(i, 'risk', e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
                    }`}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="flex items-end gap-2">
                  <label className={`flex items-center gap-2 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    <input
                      type="checkbox"
                      checked={d.isActive}
                      onChange={(e) => updateDuration(i, 'isActive', e.target.checked)}
                      className="w-4 h-4 rounded"
                    />
                    Active
                  </label>
                  <button
                    onClick={() => removeDuration(i)}
                    className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="flex justify-end">
          <GlowButton onClick={() => handleDurationSave(durations)} disabled={saving}>
            {saving ? 'Saving...' : 'Save Durations'}
          </GlowButton>
        </div>
      </div>
    )
  }

  const LeverageEditor = () => {
    const [leverage, setLeverage] = useState(settings?.leverage || { min: 1, max: 10, default: 1, steps: [1, 2, 5, 10] })

    return (
      <div className="space-y-6">
        <h4 className="text-lg font-semibold text-white">Leverage Settings</h4>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className={`block text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Minimum Leverage</label>
            <input
              type="number"
              value={leverage.min}
              onChange={(e) => setLeverage({ ...leverage, min: parseInt(e.target.value) || 1 })}
              className={`w-full px-4 py-3 rounded-xl border ${
                theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
              }`}
            />
          </div>
          <div>
            <label className={`block text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Maximum Leverage</label>
            <input
              type="number"
              value={leverage.max}
              onChange={(e) => setLeverage({ ...leverage, max: parseInt(e.target.value) || 10 })}
              className={`w-full px-4 py-3 rounded-xl border ${
                theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
              }`}
            />
          </div>
          <div>
            <label className={`block text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Default Leverage</label>
            <input
              type="number"
              value={leverage.default}
              onChange={(e) => setLeverage({ ...leverage, default: parseInt(e.target.value) || 1 })}
              className={`w-full px-4 py-3 rounded-xl border ${
                theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
              }`}
            />
          </div>
          <div>
            <label className={`block text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Leverage Steps (comma-separated)</label>
            <input
              type="text"
              value={leverage.steps?.join(', ') || '1, 2, 5, 10'}
              onChange={(e) => setLeverage({ ...leverage, steps: e.target.value.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n)) })}
              className={`w-full px-4 py-3 rounded-xl border ${
                theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
              }`}
              placeholder="1, 2, 5, 10"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <GlowButton onClick={() => handleSave({ leverage })} disabled={saving}>
            {saving ? 'Saving...' : 'Save Leverage'}
          </GlowButton>
        </div>
      </div>
    )
  }

  const FeesEditor = () => {
    const [fees, setFees] = useState(settings?.fees || { tradingFee: 0.1, withdrawalFee: 0, depositFee: 0 })

    return (
      <div className="space-y-6">
        <h4 className="text-lg font-semibold text-white">Fee Settings</h4>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className={`block text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Trading Fee (%)</label>
            <input
              type="number"
              step="0.01"
              value={fees.tradingFee}
              onChange={(e) => setFees({ ...fees, tradingFee: parseFloat(e.target.value) || 0 })}
              className={`w-full px-4 py-3 rounded-xl border ${
                theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
              }`}
            />
          </div>
          <div>
            <label className={`block text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Withdrawal Fee (%)</label>
            <input
              type="number"
              step="0.01"
              value={fees.withdrawalFee}
              onChange={(e) => setFees({ ...fees, withdrawalFee: parseFloat(e.target.value) || 0 })}
              className={`w-full px-4 py-3 rounded-xl border ${
                theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
              }`}
            />
          </div>
          <div>
            <label className={`block text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Deposit Fee (%)</label>
            <input
              type="number"
              step="0.01"
              value={fees.depositFee}
              onChange={(e) => setFees({ ...fees, depositFee: parseFloat(e.target.value) || 0 })}
              className={`w-full px-4 py-3 rounded-xl border ${
                theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
              }`}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <GlowButton onClick={() => handleSave({ fees })} disabled={saving}>
            {saving ? 'Saving...' : 'Save Fees'}
          </GlowButton>
        </div>
      </div>
    )
  }

  const LimitsEditor = () => {
    const [limits, setLimits] = useState(settings?.limits || { minTradeAmount: 10, maxTradeAmount: 10000, maxDailyTrades: 100 })

    return (
      <div className="space-y-6">
        <h4 className="text-lg font-semibold text-white">Trade Limits</h4>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className={`block text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Minimum Trade Amount ($)</label>
            <input
              type="number"
              value={limits.minTradeAmount}
              onChange={(e) => setLimits({ ...limits, minTradeAmount: parseFloat(e.target.value) || 0 })}
              className={`w-full px-4 py-3 rounded-xl border ${
                theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
              }`}
            />
          </div>
          <div>
            <label className={`block text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Maximum Trade Amount ($)</label>
            <input
              type="number"
              value={limits.maxTradeAmount}
              onChange={(e) => setLimits({ ...limits, maxTradeAmount: parseFloat(e.target.value) || 0 })}
              className={`w-full px-4 py-3 rounded-xl border ${
                theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
              }`}
            />
          </div>
          <div>
            <label className={`block text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Max Daily Trades</label>
            <input
              type="number"
              value={limits.maxDailyTrades}
              onChange={(e) => setLimits({ ...limits, maxDailyTrades: parseInt(e.target.value) || 0 })}
              className={`w-full px-4 py-3 rounded-xl border ${
                theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
              }`}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <GlowButton onClick={() => handleSave({ limits })} disabled={saving}>
            {saving ? 'Saving...' : 'Save Limits'}
          </GlowButton>
        </div>
      </div>
    )
  }

  const StatusEditor = () => {
    const [isEnabled, setIsEnabled] = useState(settings?.isEnabled ?? true)
    const [maintenanceMode, setMaintenanceMode] = useState(settings?.maintenanceMode ?? false)

    return (
      <div className="space-y-6">
        <h4 className="text-lg font-semibold text-white">Trading Status</h4>
        <div className="space-y-4">
          <div className={`p-6 rounded-xl border ${
            theme === 'dark' ? 'bg-[var(--bg-tertiary)]/50 border-white/10' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h5 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Enable Trading</h5>
                <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Allow users to place trades
                </p>
              </div>
              <button
                onClick={() => {
                  setIsEnabled(!isEnabled)
                  handleSave({ isEnabled: !isEnabled })
                }}
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  isEnabled ? 'bg-emerald-500' : 'bg-gray-500'
                }`}
              >
                <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-transform ${
                  isEnabled ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>
          </div>
          
          <div className={`p-6 rounded-xl border ${
            theme === 'dark' ? 'bg-[var(--bg-tertiary)]/50 border-white/10' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h5 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Maintenance Mode</h5>
                <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Put trading under maintenance (users cannot trade)
                </p>
              </div>
              <button
                onClick={() => {
                  setMaintenanceMode(!maintenanceMode)
                  handleSave({ maintenanceMode: !maintenanceMode })
                }}
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  maintenanceMode ? 'bg-amber-500' : 'bg-gray-500'
                }`}
              >
                <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-transform ${
                  maintenanceMode ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Trade Settings</h2>
          <p className="text-sm text-white/50">Configure trading parameters and limits</p>
        </div>
        <button
          onClick={fetchSettings}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
        >
          <FiRefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-1">
          <ModernCard className="p-4" hover={false}>
            <nav className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeSection === section.id
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                      : theme === 'dark' ? 'text-white/60 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <section.icon className="w-5 h-5" />
                  <span className="font-medium">{section.label}</span>
                </button>
              ))}
            </nav>
          </ModernCard>
        </div>

        <div className="col-span-4">
          <ModernCard className="p-6" hover={false}>
            {activeSection === 'durations' && <DurationEditor />}
            {activeSection === 'leverage' && <LeverageEditor />}
            {activeSection === 'fees' && <FeesEditor />}
            {activeSection === 'limits' && <LimitsEditor />}
            {activeSection === 'status' && <StatusEditor />}
          </ModernCard>
        </div>
      </div>
    </motion.div>
  )
}

export default SuperAdmin
