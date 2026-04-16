import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { 
  FiArrowRight, FiTrendingUp, FiTrendingDown, 
  FiChevronRight, FiShield, FiDollarSign, FiClock, FiLock,
  FiCheckCircle, FiZap, FiUsers, FiGlobe, FiCreditCard, FiSmartphone,
  FiPlay, FiTarget, FiServer, FiCode, FiAward
} from 'react-icons/fi'
import { FaAppStore, FaGooglePlay, FaExchangeAlt, FaBitcoin, FaShieldAlt, FaUserShield } from 'react-icons/fa'
import { useThemeStore } from '../store/themeStore'
import { useAuthStore } from '../store/authStore'
import { api } from '../store/authStore'
import PublicNavbar from '../components/PublicNavbar'

const sectionVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  }
}

const ScaleIn = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
)

const SlideIn = ({ children, direction = 'left', delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, x: direction === 'left' ? -60 : 60 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
)

const AnimatedCounter = ({ value, suffix = '', duration = 2 }) => {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    let start = 0
    const end = parseInt(value.replace(/[^0-9]/g, ''))
    const incrementTime = (duration * 1000) / end
    const timer = setInterval(() => {
      start += Math.ceil(end / 100)
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(start)
      }
    }, incrementTime)
    return () => clearInterval(timer)
  }, [isInView, value, duration])

  const displayValue = value.includes('€') 
    ? `€${count.toLocaleString()}${value.includes('+') ? '+' : ''}`
    : value.includes('K') 
    ? `${count}K+`
    : `${count}`

  return <span ref={ref}>{displayValue}</span>
}

const CryptoPriceCard = ({ coin, delay = 0 }) => {
  const { theme } = useThemeStore()
  const isPositive = coin.price_change_percentage_24h >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.02, y: -4 }}
      className={`group relative rounded-2xl p-4 transition-all duration-300 cursor-pointer ${
        theme === 'dark'
          ? 'bg-white/5 backdrop-blur-xl border border-white/10 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10'
          : 'bg-white/80 backdrop-blur-xl border border-gray-200 hover:border-blue-400 hover:shadow-lg'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <img src={coin.image} alt={coin.name} className="w-10 h-10 rounded-full" />
          <div>
            <p className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {coin.symbol.toUpperCase()}
            </p>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {coin.name}
            </p>
          </div>
        </div>
        <motion.div
          whileHover={{ scale: 1.1 }}
          className={`px-2 py-1 rounded-lg text-xs font-semibold ${
            isPositive 
              ? 'bg-blue-500/10 text-blue-400' 
              : 'bg-red-500/10 text-red-400'
          }`}
        >
          {isPositive ? <FiTrendingUp className="w-4 h-4" /> : <FiTrendingDown className="w-4 h-4" />}
        </motion.div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            €{coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className={`text-sm ${isPositive ? 'text-blue-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}{coin.price_change_percentage_24h?.toFixed(2)}%
          </p>
        </div>
        <Link
          to="/prices"
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all"
        >
          Buy
        </Link>
      </div>
    </motion.div>
  )
}

const FeatureCard = ({ icon: Icon, title, description, delay = 0, highlighted = false }) => {
  const { theme } = useThemeStore()

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6 }}
      whileHover={{ y: -8, scale: highlighted ? 1.02 : 1 }}
      className={`relative rounded-3xl p-8 transition-all duration-500 ${
        highlighted 
          ? theme === 'dark'
            ? 'bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-2 border-blue-500/30 shadow-2xl shadow-blue-500/10'
            : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 shadow-2xl shadow-blue-500/10'
          : theme === 'dark'
            ? 'bg-white/5 backdrop-blur-xl border border-white/10 hover:border-blue-500/20'
            : 'bg-white backdrop-blur-xl border border-gray-200 hover:border-blue-300'
      }`}
    >
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-semibold">
          Most Popular
        </div>
      )}
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
        theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-100'
      }`}>
        <Icon className={`w-7 h-7 ${highlighted ? 'text-blue-400' : theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
      </div>
      <h3 className={`text-xl font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        {title}
      </h3>
      <p className={`mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
        {description}
      </p>
      <Link to="/about" className="inline-flex items-center gap-2 text-blue-400 font-medium hover:text-blue-300 transition-colors">
        Find out more <FiArrowRight className="w-4 h-4" />
      </Link>
    </motion.div>
  )
}

const StatCard = ({ value, label, delay = 0 }) => {
  const { theme } = useThemeStore()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6 }}
      className="text-center"
    >
      <p className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
        <AnimatedCounter value={value} />
      </p>
      <p className={`mt-2 text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
        {label}
      </p>
    </motion.div>
  )
}

const SecurityFeature = ({ icon: Icon, title, description, delay = 0 }) => {
  const { theme } = useThemeStore()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className={`p-6 rounded-2xl ${
        theme === 'dark'
          ? 'bg-white/5 backdrop-blur-xl border border-white/10'
          : 'bg-white shadow-lg border border-gray-200'
      }`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
        theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-100'
      }`}>
        <Icon className={`w-6 h-6 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
      </div>
      <h4 className={`text-lg font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        {title}
      </h4>
      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
        {description}
      </p>
    </motion.div>
  )
}

const MediaLogo = ({ name }) => {
  const { theme } = useThemeStore()
  
  const logos = {
    Forbes: '',
    TechCrunch: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/TechCrunch_logo.svg/200px-TechCrunch_logo.svg.png',
    Bloomberg: '',
    CNBC: '',
    Reuters: '',
    WSJ: '',
  }

  const logoTextStyles = {
    Forbes: 'font-serif font-bold text-2xl',
    Bloomberg: 'font-bold text-xl tracking-tight',
    CNBC: 'font-bold text-lg tracking-wider',
    Reuters: 'font-serif font-bold text-xl italic',
    WSJ: 'font-serif font-bold text-xl',
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -4 }}
      className={`flex items-center justify-center p-6 rounded-2xl h-24 ${
        theme === 'dark'
          ? 'bg-white/5 hover:bg-white/10 border border-white/10'
          : 'bg-gray-50 hover:bg-white shadow-sm border border-gray-200'
      }`}
    >
      {logos[name] ? (
        <img 
          src={logos[name]} 
          alt={name} 
          className={`h-8 w-auto object-contain transition-all duration-300 ${
            theme === 'dark' ? 'grayscale opacity-60 hover:grayscale-0 hover:opacity-100' : ''
          }`}
        />
      ) : (
        <span className={`${logoTextStyles[name]} ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          {name}
        </span>
      )}
    </motion.div>
  )
}

export default function Landing() {
  const { theme } = useThemeStore()
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const [cryptoData, setCryptoData] = useState([])
  const [loading, setLoading] = useState(true)
  const [converterAmount, setConverterAmount] = useState('1000')
  const [fromType, setFromType] = useState('fiat')
  const [toType, setToType] = useState('crypto')
  const [fromCurrency, setFromCurrency] = useState('USD')
  const [toCurrency, setToCurrency] = useState('bitcoin')
  const heroRef = useRef(null)

  const fiatCurrencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
    { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
    { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
    { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
    { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
    { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
    { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
    { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
    { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
    { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
    { code: 'THB', name: 'Thai Baht', symbol: '฿' },
    { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
    { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
    { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
    { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč' },
    { code: 'ILS', name: 'Israeli Shekel', symbol: '₪' },
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
    { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼' },
  ]

  const fiatToUSD = {
    USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149.50, AUD: 1.53, CAD: 1.36, CHF: 0.88,
    CNY: 7.24, INR: 83.12, KRW: 1320.50, BRL: 4.97, MXN: 17.15, SGD: 1.34,
    HKD: 7.82, NOK: 10.65, SEK: 10.42, DKK: 6.87, NZD: 1.63, ZAR: 18.65,
    RUB: 91.50, TRY: 32.15, PLN: 3.98, THB: 35.80, IDR: 15650, MYR: 4.72,
    PHP: 56.20, CZK: 23.15, ILS: 3.68, AED: 3.67, SAR: 3.75,
  }

  const getCryptoPrice = (coinId) => {
    const crypto = cryptoData.find(c => c.id === coinId)
    return crypto?.current_price || 0
  }

  const getCryptoSymbol = (coinId) => {
    const crypto = cryptoData.find(c => c.id === coinId)
    return crypto?.symbol?.toUpperCase() || coinId.toUpperCase()
  }

  const handleProtectedNavigate = (path) => {
    if (isAuthenticated) {
      navigate(path)
    } else {
      navigate('/login')
    }
  }

  const convertCurrency = () => {
    if (!converterAmount || parseFloat(converterAmount) <= 0) return { value: '0.00', symbol: toType === 'crypto' ? getCryptoSymbol(toCurrency) : toCurrency }

    const amount = parseFloat(converterAmount)
    const targetSymbol = toType === 'crypto' ? getCryptoSymbol(toCurrency) : toCurrency

    if (fromType === 'fiat' && toType === 'crypto') {
      const cryptoPrice = getCryptoPrice(toCurrency)
      const amountInUSD = amount / fiatToUSD[fromCurrency]
      return { value: (amountInUSD / cryptoPrice).toFixed(8), symbol: targetSymbol }
    }

    if (fromType === 'crypto' && toType === 'fiat') {
      const cryptoPrice = getCryptoPrice(fromCurrency)
      const amountInUSD = amount * cryptoPrice
      return { value: (amountInUSD * fiatToUSD[toCurrency]).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), symbol: targetSymbol }
    }

    if (fromType === 'crypto' && toType === 'crypto') {
      const fromPrice = getCryptoPrice(fromCurrency)
      const toPrice = getCryptoPrice(toCurrency)
      const amountInUSD = amount * fromPrice
      return { value: (amountInUSD / toPrice).toFixed(8), symbol: targetSymbol }
    }

    if (fromType === 'fiat' && toType === 'fiat') {
      const amountInUSD = amount / fiatToUSD[fromCurrency]
      return { value: (amountInUSD * fiatToUSD[toCurrency]).toFixed(2), symbol: targetSymbol }
    }

    return { value: '0.00', symbol: targetSymbol }
  }

  const conversionResult = convertCurrency()

  useEffect(() => {
    fetchCryptoData()
    const interval = setInterval(fetchCryptoData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchCryptoData = async () => {
    try {
      const { data } = await api.get('/markets/coins?per_page=8')
      setCryptoData(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-950 via-blue-950/30 to-indigo-950/50' 
        : 'bg-gradient-to-br from-gray-50 via-blue-50/50 to-indigo-50/50'
    }`}>
      <PublicNavbar />

      <main className="pt-20 md:pt-24 relative overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ 
              x: [0, 50, 0],
              y: [0, -30, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="orb orb-primary w-[600px] h-[600px] -top-64 -left-64"
          />
          <motion.div 
            animate={{ 
              x: [0, -40, 0],
              y: [0, 40, 0],
              scale: [1, 0.9, 1]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="orb orb-secondary w-[500px] h-[500px] top-1/2 -right-48"
          />
          <motion.div 
            animate={{ 
              x: [0, 30, 0],
              y: [0, 50, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="orb orb-primary w-[400px] h-[400px] bottom-0 left-1/3"
          />
        </div>

        {/* ===== SECTION 1: HERO ===== */}
        <section ref={heroRef} className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative z-10"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 backdrop-blur-xl"
                >
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                    Trusted by 500K+ Worlds
                  </span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className={`text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Safe World
                  <br />
                  <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent">
                    crypto exchange
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className={`text-lg md:text-xl mb-8 max-w-lg ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Buy, sell and store <span className="font-semibold text-blue-400">euros</span> and{' '}
                  <span className="font-semibold text-blue-400">CZK</span> with low fees. 
                  Regulated by EU laws with full KYC compliance.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-col sm:flex-row gap-5 mb-8"
                >
                  <Link
                    to="/register"
                    className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 rounded-2xl font-bold text-lg text-white overflow-hidden shadow-2xl shadow-blue-500/40 hover:shadow-blue-500/60 transition-all duration-300 backdrop-blur-md"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600" />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <span className="relative">
                      Get started
                    </span>
                  </Link>

                  <div className="flex gap-4">
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center gap-3 px-5 py-4 rounded-2xl font-medium backdrop-blur-md border transition-all duration-300 ${
                        theme === 'dark'
                          ? 'bg-white/10 border-white/20 hover:bg-white/15 text-white shadow-lg shadow-black/20'
                          : 'bg-white/80 border-gray-200/50 hover:bg-white/90 text-gray-900 shadow-lg shadow-gray-200/50'
                      }`}
                    >
                      <FaAppStore className="w-6 h-6" />
                      <div className="text-left">
                        <p className="text-[10px] opacity-70">Download on the</p>
                        <p className="text-sm font-semibold">App Store</p>
                      </div>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center gap-3 px-5 py-4 rounded-2xl font-medium backdrop-blur-md border transition-all duration-300 ${
                        theme === 'dark'
                          ? 'bg-white/10 border-white/20 hover:bg-white/15 text-white shadow-lg shadow-black/20'
                          : 'bg-white/80 border-gray-200/50 hover:bg-white/90 text-gray-900 shadow-lg shadow-gray-200/50'
                      }`}
                    >
                      <FaGooglePlay className="w-6 h-6" />
                      <div className="text-left">
                        <p className="text-[10px] opacity-70">Get it on</p>
                        <p className="text-sm font-semibold">Google Play</p>
                      </div>
                    </motion.button>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="flex items-center gap-6"
                >
                  <div className="flex -space-x-3">
                    {['🇩🇪', '🇫🇷', '🇮🇹', '🇪🇸', '🇳🇱'].map((flag, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.8 + i * 0.1, type: 'spring' }}
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border-2 border-gray-900 flex items-center justify-center text-lg"
                      >
                        {flag}
                      </motion.div>
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      4.9/5 from 10K+ reviews
                    </p>
                  </div>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="relative z-10"
              >
                <div className="space-y-4">
                  {loading ? (
                    [...Array(4)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + i * 0.1 }}
                        className={`rounded-2xl p-5 h-32 ${
                          theme === 'dark' ? 'bg-white/5' : 'bg-white shadow-xl'
                        } animate-pulse`}
                      />
                    ))
                  ) : (
                    <>
                      <div className="space-y-4">
                        <h3 className={`text-sm font-semibold uppercase tracking-wider ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          Live Prices
                        </h3>
                        {cryptoData.slice(0, 3).map((coin, i) => (
                          <CryptoPriceCard key={coin.id} coin={coin} delay={0.7 + i * 0.1} />
                        ))}
                      </div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 }}
                        className={`rounded-2xl p-4 ${
                          theme === 'dark'
                            ? 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20'
                            : 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'
                          }`}>
                            <FiZap className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                          </div>
                          <div className="flex-1">
                            <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              +19 new cryptocurrencies added
                            </p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              Check out the latest listings
                            </p>
                          </div>
                          <FiChevronRight className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                        </div>
                      </motion.div>
                    </>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ===== SECTION 2: SOCIAL PROOF / MEDIA MENTIONS ===== */}
        <section className="py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          >
            <p className={`text-center text-sm font-semibold uppercase tracking-wider mb-8 ${
              theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
            }`}>
              They talk about us
            </p>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {['Forbes', 'TechCrunch', 'Bloomberg', 'CNBC', 'Reuters', 'WSJ'].map((name, i) => (
                <MediaLogo key={name} name={name} />
              ))}
            </div>
          </motion.div>
        </section>

        {/* ===== SECTION 3: FEATURES (3 CARDS) ===== */}
        <section className="py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Why choose CryptoFX?
              </h2>
              <p className={`text-lg max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Join thousands of World users who trust us for their crypto investments
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={FiGlobe}
                title="Czech company with long-time tradition"
                description="Based in Prague, we've been serving World customers since 2014 with reliable and secure services."
                delay={0}
              />
              <FeatureCard
                icon={FiDollarSign}
                title="Crypto market in EUR & CZK"
                description="Trade directly with euros and Czech koruna without conversion fees. True World experience."
                delay={0.1}
                highlighted
              />
              <FeatureCard
                icon={FiZap}
                title="Start with two euros"
                description="No minimum deposit required. Start your crypto journey with as little as €2 and grow from there."
                delay={0.2}
              />
            </div>
          </div>
        </section>

        {/* ===== SECTION 4: BUY CRYPTO (INTERACTIVE WIDGET) ===== */}
        <section className="py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <SlideIn direction="left">
                <div className={`rounded-3xl p-8 ${
                  theme === 'dark'
                    ? 'bg-white/5 backdrop-blur-xl border border-white/10'
                    : 'bg-white shadow-2xl border border-gray-200'
                }`}>
                  <h3 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Currency Converter
                  </h3>
                   
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Amount
                      </label>
                      <input
                        type="number"
                        value={converterAmount}
                        onChange={(e) => setConverterAmount(e.target.value)}
                        placeholder="Enter amount"
                        className={`w-full rounded-xl px-4 py-4 text-xl font-bold ${
                          theme === 'dark'
                            ? 'bg-white/5 border border-white/10 text-white'
                            : 'bg-gray-50 border border-gray-200 text-gray-900'
                        } focus:outline-none focus:border-blue-500 transition-colors`}
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            From
                          </label>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setFromType('fiat')}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                fromType === 'fiat'
                                  ? 'bg-blue-500 text-white'
                                  : theme === 'dark' ? 'bg-white/10 text-gray-300' : 'bg-gray-200 text-gray-600'
                              }`}
                            >
                              Fiat
                            </button>
                            <button
                              onClick={() => setFromType('crypto')}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                fromType === 'crypto'
                                  ? 'bg-blue-500 text-white'
                                  : theme === 'dark' ? 'bg-white/10 text-gray-300' : 'bg-gray-200 text-gray-600'
                              }`}
                            >
                              Crypto
                            </button>
                          </div>
                          {fromType === 'fiat' ? (
                            <select
                              value={fromCurrency}
                              onChange={(e) => setFromCurrency(e.target.value)}
                              className={`w-full rounded-xl px-4 py-3 mt-2 font-medium ${
                                theme === 'dark'
                                  ? 'bg-white/5 border border-white/10 text-white'
                                  : 'bg-gray-50 border border-gray-200 text-gray-900'
                              } focus:outline-none focus:border-blue-500 transition-colors cursor-pointer`}
                            >
                              {fiatCurrencies.map(fiat => (
                                <option key={fiat.code} value={fiat.code}>
                                  {fiat.code} - {fiat.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <select
                              value={fromCurrency}
                              onChange={(e) => setFromCurrency(e.target.value)}
                              className={`w-full rounded-xl px-4 py-3 mt-2 font-medium ${
                                theme === 'dark'
                                  ? 'bg-white/5 border border-white/10 text-white'
                                  : 'bg-gray-50 border border-gray-200 text-gray-900'
                              } focus:outline-none focus:border-blue-500 transition-colors cursor-pointer`}
                            >
                              {cryptoData.map(coin => (
                                <option key={coin.id} value={coin.id}>
                                  {coin.symbol?.toUpperCase()} - {coin.name}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>

                        <div className="flex items-center justify-center pt-8">
                          <motion.div
                            whileHover={{ rotate: 180 }}
                            transition={{ duration: 0.3 }}
                            className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer ${
                              theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'
                            }`}
                            onClick={() => {
                              const tempType = fromType
                              const tempCurrency = fromCurrency
                              setFromType(toType)
                              setFromCurrency(toCurrency)
                              setToType(tempType)
                              setToCurrency(tempCurrency)
                            }}
                          >
                            <FiTrendingDown className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                          </motion.div>
                        </div>

                        <div className="flex-1">
                          <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            To
                          </label>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setToType('fiat')}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                toType === 'fiat'
                                  ? 'bg-blue-500 text-white'
                                  : theme === 'dark' ? 'bg-white/10 text-gray-300' : 'bg-gray-200 text-gray-600'
                              }`}
                            >
                              Fiat
                            </button>
                            <button
                              onClick={() => setToType('crypto')}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                toType === 'crypto'
                                  ? 'bg-blue-500 text-white'
                                  : theme === 'dark' ? 'bg-white/10 text-gray-300' : 'bg-gray-200 text-gray-600'
                              }`}
                            >
                              Crypto
                            </button>
                          </div>
                          {toType === 'fiat' ? (
                            <select
                              value={toCurrency}
                              onChange={(e) => setToCurrency(e.target.value)}
                              className={`w-full rounded-xl px-4 py-3 mt-2 font-medium ${
                                theme === 'dark'
                                  ? 'bg-white/5 border border-white/10 text-white'
                                  : 'bg-gray-50 border border-gray-200 text-gray-900'
                              } focus:outline-none focus:border-blue-500 transition-colors cursor-pointer`}
                            >
                              {fiatCurrencies.map(fiat => (
                                <option key={fiat.code} value={fiat.code}>
                                  {fiat.code} - {fiat.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <select
                              value={toCurrency}
                              onChange={(e) => setToCurrency(e.target.value)}
                              className={`w-full rounded-xl px-4 py-3 mt-2 font-medium ${
                                theme === 'dark'
                                  ? 'bg-white/5 border border-white/10 text-white'
                                  : 'bg-gray-50 border border-gray-200 text-gray-900'
                              } focus:outline-none focus:border-blue-500 transition-colors cursor-pointer`}
                            >
                              {cryptoData.map(coin => (
                                <option key={coin.id} value={coin.id}>
                                  {coin.symbol?.toUpperCase()} - {coin.name}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>

                      <div className={`mt-6 p-6 rounded-2xl ${
                        theme === 'dark'
                          ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-500/30'
                          : 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200'
                      }`}>
                        <p className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Converted Amount
                        </p>
                        <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                          {conversionResult.value} {conversionResult.symbol}
                        </p>
                        <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                          {converterAmount || 0} {fromType === 'fiat' ? fromCurrency : getCryptoSymbol(fromCurrency)} = {conversionResult.value} {conversionResult.symbol}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </SlideIn>

              <SlideIn direction="right" delay={0.2}>
                <div className="space-y-6">
                  <h2 className={`text-3xl md:text-4xl font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Buy quickly and easily
                  </h2>
                  <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Purchase cryptocurrency in minutes with our simple and secure platform. 
                    Multiple payment options available for your convenience.
                  </p>
                  <ul className="space-y-3">
                    {[
                      'Instant verification process',
                      'Secure transactions with 2FA',
                      '24/7 customer support',
                      ' Competitive exchange rates'
                    ].map((item, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-3"
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'
                        }`}>
                          <FiCheckCircle className={`w-4 h-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                        </div>
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                  <Link
                    to="/register"
                    className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-white overflow-hidden shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600" />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative">
                      Sign up
                    </span>
                  </Link>
                </div>
              </SlideIn>
            </div>
          </div>
        </section>

        {/* ===== SECTION 5: RECURRING BUY (DCA) ===== */}
        <section className="py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <SlideIn direction="left">
                <div className="space-y-6">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                    theme === 'dark' ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-100 text-blue-600'
                  }`}>
                    <FiClock className="w-4 h-4" />
                    <span className="text-sm font-semibold">Dollar Cost Averaging</span>
                  </div>
                  <h2 className={`text-3xl md:text-4xl font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Invest regularly, stress less
                  </h2>
                  <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Set up recurring buys to automatically invest a fixed amount at regular intervals. 
                    This strategy helps reduce the impact of market volatility and removes emotional decision-making.
                  </p>
                  <ul className="space-y-3">
                    {[
                      'Automated weekly or monthly purchases',
                      'Average out your purchase price over time',
                      'Build wealth systematically',
                      'Pause or cancel anytime'
                    ].map((item, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-3"
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          theme === 'dark' ? 'bg-indigo-500/20' : 'bg-indigo-100'
                        }`}>
                          <FiCheckCircle className={`w-4 h-4 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} />
                        </div>
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </SlideIn>

              <SlideIn direction="right" delay={0.2}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`relative rounded-3xl p-8 ${
                    theme === 'dark'
                      ? 'bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20'
                      : 'bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200'
                  }`}
                >
                  <motion.div
                    animate={{ 
                      boxShadow: [
                        '0 0 20px rgba(59, 130, 246, 0.2)',
                        '0 0 40px rgba(59, 130, 246, 0.4)',
                        '0 0 20px rgba(59, 130, 246, 0.2)'
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-0 rounded-3xl"
                  />
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-12 h-12 rounded-xl ${
                        theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'
                      }`}>
                        <FiSmartphone className={`w-6 h-6 m-3 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                      </div>
                      <div>
                        <h4 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          Recurring Order
                        </h4>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          Active • Next purchase in 3 days
                        </p>
                      </div>
                    </div>

                    <div className={`p-4 rounded-2xl mb-6 ${
                      theme === 'dark' ? 'bg-white/5' : 'bg-white'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Amount</span>
                        <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>€50/month</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Asset</span>
                        <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>BTC</span>
                      </div>
                    </div>

                    <div className={`p-4 rounded-2xl text-center ${
                      theme === 'dark' ? 'bg-white/5' : 'bg-white'
                    }`}>
                      <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Scan to set up on mobile
                      </p>
                      <div className="w-32 h-32 mx-auto bg-white rounded-xl p-2">
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                          <FaBitcoin className="w-12 h-12 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </SlideIn>
            </div>
          </div>
        </section>

        {/* ===== SECTION 6: TRADING PLATFORM PREVIEW ===== */}
        <section className="py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <SlideIn direction="left">
                <div className={`relative rounded-3xl overflow-hidden ${
                  theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'
                }`}>
                  <div className={`absolute top-0 left-0 right-0 h-12 flex items-center gap-4 px-4 ${
                    theme === 'dark' ? 'bg-gray-950' : 'bg-gray-200'
                  }`}>
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <div className="flex-1" />
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      BTC/EUR • TradingView
                    </span>
                  </div>
                  
                  <div className="pt-12 p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        €{cryptoData[0]?.current_price?.toLocaleString() || '45,230.50'}
                      </span>
                      <span className="px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-sm font-medium">
                        +2.34%
                      </span>
                    </div>
                    
                    <div className="h-48 relative">
                      <svg className="w-full h-full" viewBox="0 0 400 150" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M0,120 Q50,100 100,90 T200,70 T300,80 T400,40 L400,150 L0,150 Z"
                          fill="url(#chartGradient)"
                        />
                        <path
                          d="M0,120 Q50,100 100,90 T200,70 T300,80 T400,40"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>

                    <div className="flex justify-between mt-4">
                      {['9:00', '12:00', '15:00', '18:00', '21:00'].map((time, i) => (
                        <span key={i} className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </SlideIn>

              <SlideIn direction="right" delay={0.2}>
                <div className="space-y-6">
                  <h2 className={`text-3xl md:text-4xl font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Professional trading tools
                  </h2>
                  <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Advanced charts, multiple order types, and real-time market data powered by TradingView. 
                    Everything you need to make informed trading decisions.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { icon: FiTrendingUp, label: 'Advanced Charts' },
                      { icon: FiTarget, label: 'Limit Orders' },
                      { icon: FiZap, label: 'Instant Execution' },
                      { icon: FiGlobe, label: '50+ Markets' }
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className={`p-4 rounded-xl ${
                          theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'
                        }`}
                      >
                        <item.icon className={`w-6 h-6 mb-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                        <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {item.label}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                  <button
                    onClick={() => handleProtectedNavigate('/markets')}
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all"
                  >
                    Discover platform <FiArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </SlideIn>
            </div>
          </div>
        </section>

        {/* ===== SECTION 7: API & AUTOMATION ===== */}
        <section className="py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <SlideIn direction="left">
                <div className="space-y-6">
                  <h2 className={`text-3xl md:text-4xl font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    From robots to API
                  </h2>
                  <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Build your own trading bots, integrate with third-party services, or create 
                    custom solutions with our powerful REST and WebSocket APIs.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {['REST API', 'WebSocket', 'Python', 'Node.js', 'Go', 'Java'].map((tag, i) => (
                      <span
                        key={i}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          theme === 'dark'
                            ? 'bg-white/10 text-gray-300'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Link
                    to="/api"
                    className="inline-flex items-center gap-2 text-blue-400 font-medium hover:text-blue-300 transition-colors"
                  >
                    View API documentation <FiArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </SlideIn>

              <SlideIn direction="right" delay={0.2}>
                <div className={`rounded-3xl p-8 ${
                  theme === 'dark'
                    ? 'bg-gray-900 border border-white/10'
                    : 'bg-gray-900'
                }`}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <pre className="text-sm font-mono">
                    <code className="text-gray-400">
                      <span className="text-blue-400">fetch</span>(<span className="text-green-400">'https://api.cryptofx.com/v1/ticker'</span>)
                      {'\n'}  .then(res {'=>'} res.json())
                      {'\n'}  .then(data {'=>'} {'{'}
                      {'\n'}    console.log(data.<span className="text-blue-400">BTC</span>);
                      {'\n'}  {'}'})
                    </code>
                  </pre>
                </div>
              </SlideIn>
            </div>
          </div>
        </section>

        {/* ===== SECTION 8: STATS SECTION ===== */}
        <section className="py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`mx-4 md:mx-8 lg:mx-auto max-w-7xl rounded-3xl p-12 md:p-20 ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/20'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600'
            }`}
          >
            <div className="grid md:grid-cols-3 gap-12">
              <StatCard value="2014" label="Founded" delay={0} />
              <StatCard value="€4B+" label="Trading Volume" delay={0.1} />
              <StatCard value="120k+" label="Users" delay={0.2} />
            </div>
          </motion.div>
        </section>

        {/* ===== SECTION 9: HOW IT WORKS ===== */}
        <section className="py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Buy in two simple steps
              </h2>
              <p className={`text-lg max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Getting started with CryptoFX is quick and easy
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <SlideIn direction="left">
                <div className="space-y-8">
                  <div className="flex gap-6">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shrink-0 ${
                      theme === 'dark'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      1
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Create your account
                      </h3>
                      <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                        Sign up in minutes with your email. Complete quick identity verification to start trading.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shrink-0 ${
                      theme === 'dark'
                        ? 'bg-indigo-500/20 text-indigo-400'
                        : 'bg-indigo-100 text-indigo-600'
                    }`}>
                      2
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Start buying crypto
                      </h3>
                      <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                        Deposit euros or CZK and instantly buy Bitcoin, Ethereum, or any of our 50+ supported cryptocurrencies.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-blue-500/30 transition-all"
                    >
                      Sign up <FiArrowRight className="w-4 h-4" />
                    </Link>
                    <button className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold ${
                      theme === 'dark'
                        ? 'bg-white/10 hover:bg-white/20 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    } transition-all`}>
                      <FiPlay className="w-4 h-4" /> Watch video
                    </button>
                  </div>
                </div>
              </SlideIn>

              <SlideIn direction="right" delay={0.2}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`relative rounded-3xl overflow-hidden cursor-pointer ${
                    theme === 'dark' ? 'bg-gray-900' : 'bg-gray-800'
                  }`}
                >
                  <div className="aspect-video flex items-center justify-center">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className={`w-20 h-20 rounded-full flex items-center justify-center ${
                        theme === 'dark' ? 'bg-blue-500/20' : 'bg-white/20'
                      }`}
                    >
                      <FiPlay className={`w-8 h-8 ml-1 ${theme === 'dark' ? 'text-blue-400' : 'text-white'}`} />
                    </motion.div>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-300'}`}>
                      How it works • 2:30
                    </span>
                  </div>
                </motion.div>
              </SlideIn>
            </div>
          </div>
        </section>

        {/* ===== SECTION 10: SECURITY SECTION ===== */}
        <section className="py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Safety means everything
              </h2>
              <p className={`text-lg max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Bank-grade security measures to protect your assets and data
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <SecurityFeature icon={FaShieldAlt} title="Advanced Custody" description="Multi-signature cold storage with bank-grade encryption" delay={0} />
              <SecurityFeature icon={FiLock} title="Two-Factor Auth" description="Additional security layer with SMS, Authenticator, or Hardware keys" delay={0.1} />
              <SecurityFeature icon={FiUsers} title="Separated Accounts" description="Customer funds stored separately from operational funds" delay={0.2} />
              <SecurityFeature icon={FiAward} title="Local Institutions" description="Regulated by Czech National Bank and EU compliance" delay={0.3} />
            </div>
          </div>
        </section>

        {/* ===== SECTION 11: PARTNERSHIPS & CERTIFICATIONS ===== */}
        <section className="py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`mx-4 md:mx-8 lg:mx-auto max-w-7xl rounded-3xl p-12 md:p-20 ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-blue-900/50 to-indigo-900/50 border border-blue-500/20'
                : 'bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200'
            }`}
          >
            <div className="text-center mb-12">
              <h3 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Collaborating with
              </h3>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                Leading institutions and certifications
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {['Tipsport', 'Web3Hub', 'ISO 27001', 'PCI DSS'].map((name, i) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`p-6 rounded-2xl text-center ${
                    theme === 'dark' ? 'bg-white/5' : 'bg-white'
                  }`}
                >
                  <span className={`text-lg font-bold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {name}
                  </span>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              {['Collaborating with', 'Members of', 'Certificate'].map((label, i) => (
                <span
                  key={label}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    theme === 'dark'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-blue-100 text-blue-600'
                  }`}
                >
                  {label}
                </span>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ===== SECTION 12: SUPPORT / HELP ===== */}
        <section className="py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`p-8 rounded-3xl cursor-pointer transition-all duration-300 ${
                  theme === 'dark'
                    ? 'bg-white/5 backdrop-blur-xl border border-white/10 hover:border-blue-500/30'
                    : 'bg-white shadow-lg border border-gray-200 hover:border-blue-300 hover:shadow-xl'
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
                  theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-100'
                }`}>
                  <FiUsers className={`w-7 h-7 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <h3 className={`text-xl font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Customer Support
                </h3>
                <p className={`mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Our support team is available 24/7 to help you with any questions or issues.
                </p>
                <span className="text-blue-400 font-medium flex items-center gap-2">
                  Get in touch <FiArrowRight className="w-4 h-4" />
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`p-8 rounded-3xl cursor-pointer transition-all duration-300 ${
                  theme === 'dark'
                    ? 'bg-white/5 backdrop-blur-xl border border-white/10 hover:border-indigo-500/30'
                    : 'bg-white shadow-lg border border-gray-200 hover:border-indigo-300 hover:shadow-xl'
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
                  theme === 'dark' ? 'bg-indigo-500/10' : 'bg-indigo-100'
                }`}>
                  <FiPlay className={`w-7 h-7 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} />
                </div>
                <h3 className={`text-xl font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Video Guide
                </h3>
                <p className={`mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Watch our tutorials to learn how to use all features of the platform.
                </p>
                <span className="text-indigo-400 font-medium flex items-center gap-2">
                  Play video <FiArrowRight className="w-4 h-4" />
                </span>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ===== SECTION 13: FINAL CTA ===== */}
        <section className="py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          >
            <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Start your crypto journey today
            </h2>
            <p className={`text-xl mb-10 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Join over 120,000 Worlds who trust CryptoFX for their crypto investments
            </p>
            <Link
              to="/register"
              className="group relative inline-flex items-center justify-center gap-4 px-14 py-6 rounded-2xl font-bold text-xl text-white overflow-hidden shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/70 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
              <span className="relative">
                Sign up free
              </span>
            </Link>
            <p className={`mt-6 text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
              No credit card required • Start in under 2 minutes
            </p>
          </motion.div>
        </section>

        {/* ===== SECTION 14: FOOTER ===== */}
        <footer className={`border-t ${theme === 'dark' ? 'border-white/10 bg-gray-950' : 'border-gray-200 bg-gray-50'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-12">
              <div>
                <Link to="/" className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <FaExchangeAlt className="w-6 h-6 text-white" />
                  </div>
                  <span className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    CryptoFX
                  </span>
                </Link>
                <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Safe World crypto exchange since 2014. Buy, sell, and store cryptocurrency securely.
                </p>
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                      theme === 'dark'
                        ? 'bg-white/5 hover:bg-white/10 text-white'
                        : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-900'
                    }`}
                  >
                    <FaAppStore className="w-4 h-4" />
                    <span>App Store</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                      theme === 'dark'
                        ? 'bg-white/5 hover:bg-white/10 text-white'
                        : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-900'
                    }`}
                  >
                    <FaGooglePlay className="w-4 h-4" />
                    <span>Google Play</span>
                  </motion.button>
                </div>
              </div>

              <div>
                <h4 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Services
                </h4>
                <ul className="space-y-2">
                  {['Buy Crypto', 'Trading', 'Staking', 'API', 'Affiliate'].map((link) => (
                    <li key={link}>
                      <Link to="#" className={`text-sm ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Company
                </h4>
                <ul className="space-y-2">
                  {['About Us', 'Careers', 'Press', 'Contact', 'Blog'].map((link) => (
                    <li key={link}>
                      <Link to="#" className={`text-sm ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Legal
                </h4>
                <ul className="space-y-2">
                  {['Terms of Service', 'Privacy Policy', 'Cookie Policy', 'KYC/AML'].map((link) => (
                    <li key={link}>
                      <Link to="#" className={`text-sm ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className={`pt-8 border-t ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                  © 2024 CryptoFX. All rights reserved. Regulated by Czech National Bank.
                </p>
                <div className="flex items-center gap-4">
                  <select className={`px-3 py-1 rounded-lg text-sm ${
                    theme === 'dark'
                      ? 'bg-white/5 border border-white/10 text-gray-400'
                      : 'bg-white border border-gray-200 text-gray-600'
                  }`}>
                    <option>English</option>
                    <option>Deutsch</option>
                    <option>Čeština</option>
                  </select>
                </div>
              </div>
              <p className={`text-xs mt-4 text-center ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>
                CFDs are complex instruments and come with a high risk of losing money rapidly due to leverage. 
                74% of retail investor accounts lose money when trading CFDs. You should consider whether you understand 
                how CFDs work and whether you can afford to take the high risk of losing your money.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
