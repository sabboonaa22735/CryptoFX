import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { 
  FiTrendingUp, FiTrendingDown, FiArrowRight, FiActivity, FiDollarSign, 
  FiPieChart, FiPlus, FiRefreshCw, FiZap, FiTarget, FiBarChart2, 
  FiClock, FiGlobe, FiAward, FiStar, FiUsers,
  FiChevronRight, FiArrowUpRight, FiArrowDownRight, FiMaximize2, FiCopy,
  FiBell, FiSettings, FiCpu, FiX, FiSend, FiDownload, FiRepeat, FiUpload,
  FiShoppingCart, FiShoppingBag, FiCheckCircle, FiAlertCircle, FiLoader,
  FiSearch, FiFilter, FiGrid, FiList, FiMoreVertical, FiEdit2, FiTrash2,
  FiCreditCard, FiUser, FiLock, FiKey, FiMail, FiArrowUp, FiArrowDown
} from 'react-icons/fi'
import { FaChartLine, FaCoins, FaWallet, FaExchangeAlt, FaRobot, FaShieldAlt, FaBitcoin, FaEthereum, FaLock, FaCcVisa, FaCcMastercard, FaUniversity, FaCog, FaQrcode, FaCopy, FaRedo, FaHeadset, FaCheck, FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaCloudUploadAlt, FaImage, FaClock } from 'react-icons/fa'
import { useAuthStore, api, API_URL } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'
import { useTransactionStore } from '../store/transactionStore'
import { LoadingSkeleton, ErrorState, EmptyState } from '../components/ui/StatusComponents'
import { useAdminUpdates } from '../hooks/useAdminUpdates'

const DASHBOARD_TABS = [
  { id: 'overview', label: 'Overview', icon: FiBarChart2 },
  { id: 'transfer', label: 'Transfer', icon: FiSend },
  { id: 'deposit', label: 'Deposit', icon: FiDownload },
  { id: 'swap', label: 'Swap', icon: FiRepeat },
  { id: 'withdraw', label: 'Withdraw', icon: FiUpload },
  { id: 'buy', label: 'Buy', icon: FiShoppingCart },
  { id: 'sell', label: 'Sell', icon: FiShoppingBag },
]

const CRYPTO_ASSETS = [
  { symbol: 'BTC', name: 'Bitcoin', icon: FaBitcoin, balance: 0.025, color: 'from-amber-500 to-orange-500' },
  { symbol: 'ETH', name: 'Ethereum', icon: FaEthereum, balance: 0.5, color: 'from-blue-500 to-purple-500' },
  { symbol: 'USDT', name: 'Tether', icon: FaCoins, balance: 2500, color: 'from-emerald-500 to-teal-500' },
  { symbol: 'USDC', name: 'USD Coin', icon: FaCoins, balance: 1200, color: 'from-blue-400 to-cyan-400' },
  { symbol: 'SOL', name: 'Solana', icon: FaCoins, balance: 25, color: 'from-violet-500 to-purple-500' },
  { symbol: 'XRP', name: 'Ripple', icon: FaCoins, balance: 1000, color: 'from-gray-400 to-gray-600' },
]

const FIAT_CURRENCIES = [
  { symbol: 'USD', name: 'US Dollar', icon: FaCcVisa, flag: '🇺🇸' },
  { symbol: 'EUR', name: 'Euro', icon: FaCcMastercard, flag: '🇪🇺' },
  { symbol: 'GBP', name: 'British Pound', icon: FaUniversity, flag: '🇬🇧' },
]

const PAYMENT_METHODS = [
  { id: 'bank', name: 'Bank Transfer', icon: FaUniversity, desc: '2-3 business days', fee: '0%' },
  { id: 'card', name: 'Debit/Credit Card', icon: FaCcVisa, desc: 'Instant', fee: '2.5%' },
  { id: 'crypto', name: 'Crypto Wallet', icon: FaWallet, desc: 'Instant', fee: '0%' },
]

const NetworkOptions = [
  { id: 'bitcoin', name: 'Bitcoin (BTC)', symbol: 'BTC', fee: '0.0001', time: '~30 min' },
  { id: 'ethereum', name: 'Ethereum (ERC-20)', symbol: 'ETH', fee: '0.005', time: '~5 min' },
  { id: 'bsc', name: 'BNB Smart Chain (BEP-20)', symbol: 'BNB', fee: '0.002', time: '~1 min' },
  { id: 'solana', name: 'Solana (SOL)', symbol: 'SOL', fee: '0.00025', time: '~1 min' },
]

const FloatingOrb = ({ size, color, delay, duration, top, left }) => {
  const { theme } = useThemeStore()
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl ${theme === 'dark' ? '' : 'opacity-30'}`}
      style={{
        width: size,
        height: size,
        background: color,
        top,
        left,
      }}
      animate={{
        y: [0, -30, 0],
        x: [0, 15, 0],
        scale: [1, 1.1, 1],
        opacity: [0.3, 0.5, 0.3]
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  )
}

const TiltCard = ({ children, className = '' }) => {
  const ref = useRef(null)
  const { theme } = useThemeStore()
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 })
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 })

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"])

  const handleMouseMove = (e) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const AnimatedNumber = ({ value, duration = 2000 }) => {
  const [displayValue, setDisplayValue] = useState(0)
  
  useEffect(() => {
    let start = 0
    const end = parseFloat(value)
    const increment = end / (duration / 16)
    
    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setDisplayValue(end)
        clearInterval(timer)
      } else {
        setDisplayValue(start)
      }
    }, 16)
    
    return () => clearInterval(timer)
  }, [value, duration])

  return <span>{typeof value === 'number' ? displayValue.toLocaleString() : value}</span>
}

const MarketCard = ({ coin, index }) => {
  const { theme } = useThemeStore()
  const isPositive = coin.price_change_percentage_24h >= 0
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateX: 10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      whileHover={{ 
        scale: 1.03, 
        y: -5,
        boxShadow: theme === 'dark' 
          ? "0 25px 50px -12px rgba(0, 255, 255, 0.15)" 
          : "0 25px 50px -12px rgba(0, 0, 0, 0.15)"
      }}
      className={`group relative rounded-3xl p-5 transition-all duration-300 cursor-pointer overflow-hidden ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-white/8 to-white/5 backdrop-blur-xl border border-white/10 hover:border-cyan-500/30' 
          : 'bg-white/90 backdrop-blur-xl border border-white/50 shadow-lg hover:shadow-xl'
      }`}
    >
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${isPositive ? 'from-emerald-500/5 to-cyan-500/5' : 'from-red-500/5 to-rose-500/5'} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
      />
      
      <Link to={`/trade/${coin.symbol}`} className="relative z-10 block">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className={`absolute inset-0 rounded-full blur-md ${isPositive ? 'bg-emerald-500/30' : 'bg-red-500/30'}`} />
              <img src={coin.image} alt={coin.name} className="relative w-12 h-12 rounded-full" />
            </motion.div>
            <div>
              <motion.p 
                className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                whileHover={{ x: 3 }}
              >
                {coin.symbol.toUpperCase()}
              </motion.p>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {coin.name}
              </p>
            </div>
          </div>
          
          <motion.div
            whileHover={{ scale: 1.2, rotate: 5 }}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              isPositive ? 'bg-gradient-to-br from-emerald-500/20 to-cyan-500/20' : 'bg-gradient-to-br from-red-500/20 to-rose-500/20'
            }`}
          >
            {isPositive ? (
              <FiTrendingUp className="w-5 h-5 text-emerald-400" />
            ) : (
              <FiTrendingDown className="w-5 h-5 text-red-400" />
            )}
          </motion.div>
        </div>
        
        <div className="flex items-end justify-between">
          <div>
            <motion.p 
              className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
              whileHover={{ scale: 1.02 }}
            >
              ${coin.current_price.toLocaleString()}
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-sm font-semibold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}
            >
              {isPositive ? '+' : ''}{coin.price_change_percentage_24h?.toFixed(2)}%
            </motion.p>
          </div>
          <div className={`text-right ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            <p className="text-xs">Market Cap</p>
            <p className="text-sm font-medium">${(coin.market_cap / 1000000000).toFixed(1)}B</p>
          </div>
        </div>
        
        <div className={`mt-4 h-2 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-100'}`}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(Math.abs(coin.price_change_percentage_24h) * 15, 100)}%` }}
            transition={{ delay: index * 0.08 + 0.3, duration: 0.8, ease: "easeOut" }}
            className={`h-full rounded-full ${
              isPositive 
                ? 'bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500' 
                : 'bg-gradient-to-r from-red-500 via-rose-500 to-red-500'
            }`}
          />
        </div>
      </Link>
    </motion.div>
  )
}

const StatCard = ({ stat, index }) => {
  const { theme } = useThemeStore()
  
  return (
    <TiltCard>
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: index * 0.1, duration: 0.6, type: "spring" }}
        whileHover={{ y: -8, scale: 1.02 }}
        className={`relative rounded-3xl p-6 overflow-hidden ${
          theme === 'dark' 
            ? 'bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 shadow-xl' 
            : 'bg-white/90 backdrop-blur-xl border border-white/50 shadow-xl'
        }`}
        style={{ transformStyle: "preserve-3d" }}
      >
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`}
          animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        
        <div className="relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 + 0.2 }}
            className="flex items-center justify-between mb-4"
          >
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              {stat.label}
            </span>
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: index * 0.1 + 0.3, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.1, rotate: 10 }}
              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}
              style={{ boxShadow: `0 10px 30px -5px ${stat.shadow}` }}
            >
              <stat.icon className="w-7 h-7 text-white" />
            </motion.div>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.1 }}
            className={`text-4xl font-black mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
          >
            {stat.value}
          </motion.p>
          
          {stat.change && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.4 }}
              className="flex items-center gap-2"
            >
              <motion.span 
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                  stat.changeType === 'positive' 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}
                whileHover={{ scale: 1.05 }}
              >
                {stat.changeType === 'positive' ? <FiArrowUpRight className="w-3 h-3" /> : <FiArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </motion.span>
              <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                vs last week
              </span>
            </motion.div>
          )}
          
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
            className={`h-1.5 mt-4 rounded-full bg-gradient-to-r ${stat.color}`}
            style={{ transformOrigin: "left" }}
          />
        </div>
      </motion.div>
    </TiltCard>
  )
}

const QuickAction = ({ action, index }) => {
  const { theme } = useThemeStore()
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.5 + index * 0.1, type: "spring", stiffness: 200 }}
      whileHover={{ scale: 1.08, y: -5 }}
      whileTap={{ scale: 0.95 }}
    >
      <Link
        to={action.path}
        className={`flex flex-col items-center gap-3 p-5 rounded-2xl transition-all duration-300 ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-white/10 to-white/5 hover:from-white/15 hover:to-white/10 border border-white/10 hover:border-white/20 backdrop-blur-xl'
            : `bg-gradient-to-br ${
                action.color === 'emerald' ? 'from-emerald-50 to-emerald-100' :
                action.color === 'blue' ? 'from-blue-50 to-blue-100' :
                action.color === 'violet' ? 'from-violet-50 to-violet-100' :
                action.color === 'amber' ? 'from-amber-50 to-amber-100' :
                'from-rose-50 to-rose-100'
              } border border-gray-200 shadow-lg hover:shadow-xl`
        }`}
      >
        <motion.div
          whileHover={{ rotate: 360, scale: 1.1 }}
          transition={{ duration: 0.5 }}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
            action.color === 'emerald' ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' :
            action.color === 'blue' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
            action.color === 'violet' ? 'bg-gradient-to-br from-violet-500 to-violet-600' :
            action.color === 'amber' ? 'bg-gradient-to-br from-amber-500 to-amber-600' :
            'bg-gradient-to-br from-rose-500 to-rose-600'
          }`}
          style={{ boxShadow: `0 10px 25px -5px ${
            action.color === 'emerald' ? 'rgba(16, 185, 129, 0.4)' :
            action.color === 'blue' ? 'rgba(59, 130, 246, 0.4)' :
            action.color === 'violet' ? 'rgba(139, 92, 246, 0.4)' :
            action.color === 'amber' ? 'rgba(245, 158, 11, 0.4)' :
            'rgba(244, 63, 94, 0.4)'
          }` }}
        >
          <action.icon className="w-7 h-7 text-white" />
        </motion.div>
        <span className={`font-bold text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
          {action.label}
        </span>
      </Link>
    </motion.div>
  )
}

const TransferTab = ({ theme, onComplete }) => {
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [selectedAsset, setSelectedAsset] = useState(CRYPTO_ASSETS[0])
  const [memo, setMemo] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [recentRecipients] = useState([
    { name: 'John Smith', address: '0x742d35Cc6634C0532...', avatar: 'JS' },
    { name: 'Sarah Connor', address: 'bc1qxy2kgdygjrsqtzq2n0...', avatar: 'SC' },
    { name: 'Mike Johnson', address: '0x8ba1f109551bD432...', avatar: 'MJ' },
  ])

  useEffect(() => {
    fetchBalance()
    const interval = setInterval(fetchBalance, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchBalance = async () => {
    try {
      const res = await api.get('/wallet/balance')
      if (res.data?.balance !== undefined) {
        setSelectedAsset(prev => ({
          ...prev,
          balance: res.data.balance > 0 ? res.data.balance : prev.balance
        }))
      }
    } catch (err) {
      console.log('Failed to fetch balance')
    }
  }

  const handleTransfer = async () => {
    if (!recipient) {
      setError('Please enter recipient address')
      return
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount')
      return
    }
    if (parseFloat(amount) > selectedAsset.balance) {
      setError('Insufficient balance')
      return
    }

    setLoading(true)
    setError('')
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setLoading(false)
    setShowSuccess(true)
    
    setTimeout(() => {
      setShowSuccess(false)
      setRecipient('')
      setAmount('')
      setMemo('')
      onComplete?.()
    }, 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-3xl p-6 ${theme === 'dark' ? 'bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10' : 'bg-white/90 backdrop-blur-xl border border-white/50 shadow-xl'}`}
    >
      <div className="flex items-center gap-3 mb-6">
        <motion.div
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
          className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg"
        >
          <FiSend className="w-6 h-6 text-white" />
        </motion.div>
        <div>
          <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Transfer Crypto</h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Send crypto to another wallet</p>
        </div>
      </div>

      {showSuccess ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center mb-4"
          >
            <FiCheckCircle className="w-10 h-10 text-white" />
          </motion.div>
          <h3 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Transfer Successful!</h3>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
            {amount} {selectedAsset.symbol} sent to {recipient.slice(0, 10)}...
          </p>
        </motion.div>
      ) : (
        <>
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Recent Recipients
            </label>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {recentRecipients.map((r, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setRecipient(r.address)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap ${
                    theme === 'dark' ? 'bg-white/5 hover:bg-white/10 border border-white/10' : 'bg-gray-100 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold">
                    {r.avatar}
                  </div>
                  <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{r.name}</span>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Recipient Address
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="Enter wallet address or username"
                  className={`w-full px-4 py-3 pr-12 rounded-xl ${
                    theme === 'dark' ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500' : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400'
                  } focus:outline-none focus:ring-2 focus:ring-primary/50`}
                />
                <FiUser className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Asset
              </label>
              <div className="grid grid-cols-3 gap-2">
                {CRYPTO_ASSETS.slice(0, 3).map((asset) => (
                  <motion.button
                    key={asset.symbol}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedAsset(asset)}
                    className={`p-3 rounded-xl border ${
                      selectedAsset.symbol === asset.symbol
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : theme === 'dark' ? 'border-white/10 bg-white/5 hover:bg-white/10' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <asset.icon className={`w-5 h-5 ${
                        asset.symbol === 'BTC' ? 'text-amber-500' :
                        asset.symbol === 'ETH' ? 'text-blue-500' : 'text-emerald-500'
                      }`} />
                      <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{asset.symbol}</span>
                    </div>
                    <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {asset.balance} {asset.symbol}
                    </p>
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Amount
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className={`w-full px-4 py-3 pr-20 rounded-xl ${
                    theme === 'dark' ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500' : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400'
                  } focus:outline-none focus:ring-2 focus:ring-primary/50`}
                />
                <span className={`absolute right-4 top-1/2 -translate-y-1/2 font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {selectedAsset.symbol}
                </span>
              </div>
              <div className="flex justify-between mt-2">
                <button
                  onClick={() => setAmount((selectedAsset.balance * 0.25).toString())}
                  className={`text-xs px-2 py-1 rounded ${
                    theme === 'dark' ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  25%
                </button>
                <button
                  onClick={() => setAmount((selectedAsset.balance * 0.50).toString())}
                  className={`text-xs px-2 py-1 rounded ${
                    theme === 'dark' ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  50%
                </button>
                <button
                  onClick={() => setAmount((selectedAsset.balance * 0.75).toString())}
                  className={`text-xs px-2 py-1 rounded ${
                    theme === 'dark' ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  75%
                </button>
                <button
                  onClick={() => setAmount(selectedAsset.balance.toString())}
                  className={`text-xs px-2 py-1 rounded ${
                    theme === 'dark' ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  Max
                </button>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Memo (Optional)
              </label>
              <input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="Add a note for this transfer"
                className={`w-full px-4 py-3 rounded-xl ${
                  theme === 'dark' ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500' : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-primary/50`}
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20"
              >
                <FiAlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-sm text-red-400">{error}</span>
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98, y: 0 }}
              onClick={handleTransfer}
              disabled={loading}
              className={`
                relative w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 overflow-hidden
                disabled:opacity-50 transition-all duration-300
                ${theme === 'dark'
                  ? 'bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-500 text-white shadow-xl shadow-purple-500/30 backdrop-blur-md'
                  : 'bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 text-white shadow-xl shadow-purple-400/40'
                }
              `}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-600 via-fuchsia-500 to-violet-600 opacity-0 hover:opacity-100 transition-opacity duration-300"
              />
              <div className="absolute inset-0 bg-white/10" style={{ backdropFilter: 'blur(10px)' }} />
              <motion.div
                className="absolute -inset-1 rounded-2xl opacity-0"
                style={{
                  background: 'linear-gradient(135deg, rgba(167,139,250,0.3), transparent, rgba(139,92,246,0.3))',
                }}
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
              {loading ? (
                <>
                  <motion.div
                    className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <span className="relative">Processing...</span>
                </>
              ) : (
                <>
                  <motion.div
                    whileHover={{ x: [0, 5, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <FiSend className="w-6 h-6 relative" />
                  </motion.div>
                  <span className="relative">
                    Transfer {amount || '0'} {selectedAsset.symbol}
                  </span>
                </>
              )}
            </motion.button>
          </div>
        </>
      )}
    </motion.div>
  )
}

const COIN_CONFIG_DEPOSIT = {
  BTC: { name: 'Bitcoin', symbol: 'BTC', color: 'from-orange-400 to-yellow-500', textColor: 'text-orange-400', icon: '₿', network: 'Bitcoin Network', fees: '~0.0001 BTC' },
  ETH: { name: 'Ethereum', symbol: 'ETH', color: 'from-purple-500 to-blue-500', textColor: 'text-purple-400', icon: 'Ξ', network: 'Ethereum (ERC-20)', fees: '~0.005 ETH' },
  USDT: { name: 'Tether', symbol: 'USDT', color: 'from-green-500 to-emerald-500', textColor: 'text-green-400', icon: '₮', network: 'TRC-20 / ERC-20', fees: '~1 USDT' },
  SOL: { name: 'Solana', symbol: 'SOL', color: 'from-purple-400 to-pink-500', textColor: 'text-purple-400', icon: '◎', network: 'Solana Network', fees: '~0.00025 SOL' },
}

const ProgressStepperDeposit = ({ currentStep, theme }) => {
  const steps = [
    { id: 1, label: 'Select', icon: FaCog },
    { id: 2, label: 'Confirm', icon: FaWallet },
  ]

  return (
    <div className="flex items-center justify-center gap-4 py-4">
      {steps.map((step, index) => {
        const isActive = currentStep === step.id
        const isCompleted = currentStep > step.id
        const Icon = step.icon
        
        return (
          <div key={step.id} className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: isActive ? 1.1 : 1 }}
              className={`flex items-center gap-3 px-4 py-2 rounded-full transition-all ${
                isActive 
                  ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg shadow-yellow-500/30' 
                  : isCompleted
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : theme === 'dark'
                      ? 'bg-white/5 text-white/40 border border-white/10'
                      : 'bg-gray-100 text-gray-400 border border-gray-200'
              }`}
            >
              {isCompleted ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                  <FaCheck className="w-3 h-3 text-white" />
                </motion.div>
              ) : (
                <Icon className="w-5 h-5" />
              )}
              <span className="font-medium text-sm hidden sm:inline">{step.label}</span>
            </motion.div>
            
            {index < steps.length - 1 && (
              <motion.div
                animate={{ scaleX: isCompleted ? 1 : 0 }}
                className={`w-12 h-0.5 rounded-full ${
                  isCompleted ? 'bg-emerald-500' : theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

const DepositTab = ({ theme, onComplete, depositCoins }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedCoin, setSelectedCoin] = useState('BTC')
  const [amount, setAmount] = useState('')
  const [showQR, setShowQR] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [transactionStatus, setTransactionStatus] = useState('pending')
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState('success')
  const { addTransaction } = useTransactionStore()
  const [depositAddresses, setDepositAddresses] = useState({})
  const [coinSettings, setCoinSettings] = useState({})
  const [loadingAddress, setLoadingAddress] = useState(false)

  useEffect(() => {
    const fetchDepositData = async () => {
      setLoadingAddress(true)
      try {
        const [addressesRes, settingsRes] = await Promise.all([
          api.get('/deposits/deposit-addresses'),
          api.get('/deposits/settings')
        ])
        
        const addresses = addressesRes.data
        if (addresses && Array.isArray(addresses)) {
          const addrMap = {}
          addresses.forEach(addr => {
            addrMap[addr.symbol] = addr
          })
          setDepositAddresses(addrMap)
          
          if (Object.keys(addrMap).length > 0) {
            const firstCoin = Object.keys(addrMap)[0]
            setSelectedCoin(firstCoin)
          }
        }
        
        if (settingsRes.data && settingsRes.data.coins) {
          setCoinSettings(settingsRes.data.coins)
        }
      } catch (error) {
        console.error('Failed to fetch deposit data:', error)
      } finally {
        setLoadingAddress(false)
      }
    }
    
    fetchDepositData()
  }, [])

  useEffect(() => {
    if (depositCoins && Object.keys(depositCoins).length > 0) {
      const fetchFreshData = async () => {
        try {
          const [addressesRes, settingsRes] = await Promise.all([
            api.get('/deposits/deposit-addresses'),
            api.get('/deposits/settings')
          ])
          
          if (addressesRes.data && Array.isArray(addressesRes.data)) {
            const addrMap = {}
            addressesRes.data.forEach(addr => {
              addrMap[addr.symbol] = addr
            })
            setDepositAddresses(addrMap)
          }
          
          if (settingsRes.data && settingsRes.data.coins) {
            setCoinSettings(settingsRes.data.coins)
          }
        } catch (error) {
          console.error('Failed to refresh deposit data:', error)
        }
      }
      
      fetchFreshData()
    }
  }, [depositCoins])

  const getAvailableCoins = () => {
    if (depositAddresses && Object.keys(depositAddresses).length > 0) {
      const coins = {}
      Object.entries(depositAddresses).forEach(([symbol, addr]) => {
        coins[symbol] = {
          name: symbol,
          symbol: symbol,
          color: COIN_CONFIG_DEPOSIT[symbol]?.color || 'from-gray-500 to-gray-600',
          textColor: COIN_CONFIG_DEPOSIT[symbol]?.textColor || 'text-gray-400',
          icon: COIN_CONFIG_DEPOSIT[symbol]?.icon || '●',
          network: addr.network || 'MAINNET',
          fees: coinSettings[symbol]?.networkFee ? `~${coinSettings[symbol].networkFee} ${symbol}` : COIN_CONFIG_DEPOSIT[symbol]?.fees || '',
          minDeposit: coinSettings[symbol]?.minDeposit || addr.minDeposit || 0,
          ...COIN_CONFIG_DEPOSIT[symbol]
        }
      })
      return coins
    }
    return depositCoins && Object.keys(depositCoins).length > 0 ? depositCoins : COIN_CONFIG_DEPOSIT
  }

  const availableCoins = getAvailableCoins()
  const coinConfig = availableCoins[selectedCoin] || Object.values(availableCoins)[0] || COIN_CONFIG_DEPOSIT.BTC
  const expiresAt = new Date().getTime() + 30 * 60 * 1000
  const currentAddress = depositAddresses[selectedCoin]?.address || ''
  const currentMemo = depositAddresses[selectedCoin]?.memo || ''

  const notify = (message, type = 'success') => {
    setToastMessage(message)
    setToastType(type)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleFileUpload = (file) => {
    setUploadedFile(file)
    notify('Screenshot uploaded successfully')
  }

  const handleConfirm = async () => {
    if (!uploadedFile) {
      notify('Please upload proof of payment screenshot', 'error')
      return
    }
    if (!amount || parseFloat(amount) <= 0) {
      notify('Please enter an amount', 'error')
      return
    }

    setLoading(true)
    setTransactionStatus('pending')
    notify('Uploading proof of payment...', 'info')
    
    try {
      let proofUrl = null
      let proofFilename = uploadedFile?.name || 'proof-of-payment'
      
      if (uploadedFile && uploadedFile instanceof File) {
        const formData = new FormData()
        formData.append('proofFilename', uploadedFile.name)
        formData.append('file', uploadedFile)
        
        const uploadRes = await fetch(`${API_URL}/wallet/upload-proof`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        })
        
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json()
          proofUrl = uploadData.proofUrl
          proofFilename = uploadData.filename
        }
      }
      
      const res = await api.post('/wallet/deposit', {
        amount: parseFloat(amount),
        currency: 'USD',
        method: 'crypto',
        walletAddress: currentAddress,
        coinSymbol: selectedCoin,
        transactionHash: 'demo-tx-' + Date.now(),
        proofOfPaymentUrl: proofUrl,
        proofFilename: proofFilename
      })
      
      if (res.data?.transaction?._id) {
        console.log('[Dashboard] Deposit created with ID:', res.data.transaction._id)
        addTransaction({
          _id: res.data.transaction._id,
          type: 'deposit',
          amount: parseFloat(amount),
          symbol: selectedCoin,
          method: 'Crypto Wallet',
          status: 'pending',
        })
        notify('Deposit submitted! Waiting for admin approval...', 'success')
      } else {
        notify('Deposit submitted! Waiting for admin approval...', 'success')
      }
    } catch (error) {
      console.log('API call failed, using demo mode')
      notify('Deposit submitted! Waiting for admin approval...', 'info')
    }
    
    await new Promise(resolve => setTimeout(resolve, 1500))
    setLoading(false)
    setCurrentStep(2)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-3xl overflow-hidden ${
        theme === 'dark'
          ? 'bg-gray-900/80 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50'
          : 'bg-white border border-gray-200 shadow-2xl shadow-gray-200/50'
      }`}
    >
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl ${
              toastType === 'success' ? 'bg-emerald-500' : toastType === 'error' ? 'bg-red-500' : 'bg-blue-500'
            } text-white shadow-2xl flex items-center gap-3`}
          >
            {toastType === 'success' && <FaCheckCircle className="w-5 h-5" />}
            {toastType === 'error' && <FaExclamationTriangle className="w-5 h-5" />}
            {toastType === 'info' && <FaInfoCircle className="w-5 h-5" />}
            <span className="font-medium">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`p-6 ${
        theme === 'dark'
          ? 'bg-gradient-to-r from-yellow-500/10 to-amber-500/5 border-b border-white/5'
          : 'bg-gradient-to-r from-yellow-50 to-amber-50 border-b border-gray-100'
      }`}>
        <ProgressStepperDeposit currentStep={currentStep} theme={theme} />
      </div>

      <div className="p-6 space-y-6">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${coinConfig.color} flex items-center justify-center shadow-xl`}
            style={{ boxShadow: `0 20px 40px -10px ${coinConfig.textColor}40` }}
          >
            <span className="text-white text-2xl font-bold">{coinConfig.icon}</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
          >
            Deposit {coinConfig.name} ({coinConfig.symbol})
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-gray-500'}`}
          >
            Send the exact amount to complete your deposit
          </motion.p>
        </div>

        <div className={`p-4 rounded-xl ${
          theme === 'dark' ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'
        }`}>
          <div className="flex items-center gap-2">
            <FaExclamationTriangle className="w-4 h-4 text-amber-500" />
            <p className={`text-sm ${theme === 'dark' ? 'text-amber-300' : 'text-amber-700'}`}>
              Transactions may take 10-30 minutes to confirm depending on network.
            </p>
          </div>
        </div>

        {currentStep === 1 ? (
          <>
            <div>
              <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-white/80' : 'text-gray-700'}`}>
                Select Cryptocurrency
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(availableCoins).map(([key, coin]) => (
                  <motion.button
                    key={key}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedCoin(key)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedCoin === key
                        ? `border-${coin.textColor?.replace('text-', '')} bg-gradient-to-br ${coin.color} bg-opacity-10`
                        : theme === 'dark' ? 'border-white/10 bg-white/5 hover:bg-white/10' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className={`w-10 h-10 mx-auto rounded-xl bg-gradient-to-br ${coin.color} flex items-center justify-center mb-2`}>
                      <span className="text-white font-bold">{coin.icon}</span>
                    </div>
                    <p className={`font-medium text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{key}</p>
                    <p className={`text-xs text-center ${theme === 'dark' ? 'text-white/50' : 'text-gray-500'}`}>{coin.name}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-white/80' : 'text-gray-700'}`}>
                Amount ({selectedCoin})
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className={`w-full px-4 py-4 rounded-xl text-lg ${
                  theme === 'dark' 
                    ? 'bg-white/5 border border-white/10 text-white focus:border-yellow-500' 
                    : 'bg-gray-50 border border-gray-200 text-gray-900 focus:border-yellow-500'
                } focus:outline-none focus:ring-2 focus:ring-yellow-500/50`}
              />
              <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-white/50' : 'text-gray-500'}`}>
                Network Fee: {coinConfig.fees}
              </p>
            </div>

            <div className={`rounded-xl p-4 ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Wallet Address</span>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowQR(!showQR)}
                  className={`p-2 rounded-lg ${showQR ? 'bg-yellow-500/20 text-yellow-400' : theme === 'dark' ? 'bg-white/10 text-white/60' : 'bg-gray-200 text-gray-600'}`}
                >
                  <FaQrcode className="w-4 h-4" />
                </motion.button>
              </div>
              
              {showQR ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <div className={`w-40 h-40 mx-auto rounded-xl ${theme === 'dark' ? 'bg-white' : 'bg-white border border-gray-200'} flex items-center justify-center mb-3`}>
                    <FaQrcode className="w-32 h-32 text-black" />
                  </div>
                  <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-black/20' : 'bg-white border border-gray-200'}`}>
                    <p className={`text-xs font-mono break-all ${theme === 'dark' ? 'text-white/80' : 'text-gray-700'}`}>
                      {loadingAddress ? 'Loading...' : currentAddress || 'No address available'}
                    </p>
                    {currentMemo && (
                      <p className={`text-xs font-mono break-all mt-1 ${theme === 'dark' ? 'text-white/60' : 'text-gray-500'}`}>
                        Memo: {currentMemo}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => { navigator.clipboard.writeText(currentAddress); notify('Address copied!') }}
                    className="mt-3 text-sm text-yellow-500 font-medium"
                  >
                    Copy Address
                  </button>
                </motion.div>
              ) : (
                <div className={`flex items-center gap-2 p-3 rounded-xl ${theme === 'dark' ? 'bg-black/20' : 'bg-white border border-gray-200'}`}>
                  <code className={`flex-1 font-mono text-sm break-all ${theme === 'dark' ? 'text-white/80' : 'text-gray-700'}`}>
                    {loadingAddress ? 'Loading...' : currentAddress || 'No address available'}
                  </code>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { navigator.clipboard.writeText(currentAddress); notify('Address copied!') }}
                    className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-white/10 text-white/60' : 'bg-gray-200 text-gray-600'}`}
                  >
                    <FaCopy className="w-4 h-4" />
                  </motion.button>
                </div>
              )}
            </div>

            <div className={`rounded-xl p-4 ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
              <div className="flex items-center gap-2 mb-3">
                <FaImage className={`w-4 h-4 ${coinConfig.textColor}`} />
                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Proof of Payment
                </span>
              </div>
              <div
                onClick={() => document.getElementById('deposit-file-input')?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  uploadedFile
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : theme === 'dark' ? 'border-white/20 hover:border-white/30' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {uploadedFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <FaCheckCircle className="w-8 h-8 text-emerald-500" />
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Screenshot uploaded</span>
                  </div>
                ) : (
                  <>
                    <FaCloudUploadAlt className={`w-10 h-10 mx-auto mb-2 ${theme === 'dark' ? 'text-white/40' : 'text-gray-400'}`} />
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Click or drag to upload</p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-white/40' : 'text-gray-400'}`}>PNG, JPG, PDF up to 10MB</p>
                  </>
                )}
              </div>
              <input
                id="deposit-file-input"
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
                className="hidden"
              />
              <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-white/40' : 'text-gray-400'}`}>
                Upload a screenshot of your transaction for verification
              </p>
            </div>

            <motion.button
              whileHover={!loading && amount ? { scale: 1.02, boxShadow: '0 20px 40px -10px rgba(234, 179, 8, 0.4)' } : {}}
              whileTap={!loading && amount ? { scale: 0.98 } : {}}
              onClick={handleConfirm}
              disabled={loading || !amount}
              className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                !amount
                  ? theme === 'dark' ? 'bg-white/10 text-white/40' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-xl shadow-yellow-500/30 hover:shadow-yellow-500/50'
              }`}
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                  />
                  Processing...
                </>
              ) : (
                <>
                  <FaWallet className="w-6 h-6" />
                  Confirm Deposit
                </>
              )}
            </motion.button>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <motion.div
              animate={{ 
                boxShadow: transactionStatus === 'pending' 
                  ? ['0 0 30px rgba(234, 179, 8, 0.5)', '0 0 60px rgba(234, 179, 8, 0.8)', '0 0 30px rgba(234, 179, 8, 0.5)']
                  : ['0 0 30px rgba(16, 185, 129, 0.5)', '0 0 60px rgba(16, 185, 129, 0.8)', '0 0 30px rgba(16, 185, 129, 0.5)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`w-32 h-32 mx-auto rounded-full flex flex-col items-center justify-center mb-6 ${
                transactionStatus === 'pending'
                  ? 'bg-gradient-to-br from-amber-500 to-orange-500'
                  : 'bg-gradient-to-br from-emerald-500 to-green-500'
              }`}
            >
              {transactionStatus === 'pending' ? (
                <>
                  <FaClock className="w-10 h-10 text-white animate-pulse" />
                  <span className="text-white font-bold text-sm mt-1">PENDING</span>
                </>
              ) : (
                <>
                  <FaCheckCircle className="w-10 h-10 text-white" />
                  <span className="text-white font-bold text-sm mt-1">DONE</span>
                </>
              )}
            </motion.div>

            <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {transactionStatus === 'pending' ? 'Deposit Submitted!' : 'Deposit Complete!'}
            </h3>
            <p className={`mb-4 ${theme === 'dark' ? 'text-white/60' : 'text-gray-500'}`}>
              {amount} {selectedCoin} - Waiting for admin approval
            </p>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => { setCurrentStep(1); setTransactionStatus('pending'); setAmount(''); setUploadedFile(null); }}
              className={`px-6 py-3 rounded-xl font-medium ${
                theme === 'dark' ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Make Another Deposit
            </motion.button>
          </motion.div>
        )}

        <div className={`flex items-center justify-center gap-4 pt-4 border-t ${theme === 'dark' ? 'border-white/5' : 'border-gray-100'}`}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${
              theme === 'dark' ? 'bg-white/5 hover:bg-white/10 text-white/60' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
          >
            <FaRedo className="w-4 h-4" />
            Generate New Address
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${
              theme === 'dark' ? 'bg-white/5 hover:bg-white/10 text-white/60' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
          >
            <FaHeadset className="w-4 h-4" />
            Get Help
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

const SwapTab = ({ theme, onComplete }) => {
  const [fromAsset, setFromAsset] = useState(CRYPTO_ASSETS[0])
  const [toAsset, setToAsset] = useState(CRYPTO_ASSETS[1])
  const [fromAmount, setFromAmount] = useState('')
  const [rate, setRate] = useState(0)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchBalance()
    const interval = setInterval(fetchBalance, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchBalance = async () => {
    try {
      const res = await api.get('/wallet/balance')
      if (res.data?.balance !== undefined) {
        setFromAsset(prev => {
          if (prev.symbol === 'USDT') {
            return { ...prev, balance: res.data.balance > 0 ? res.data.balance : prev.balance }
          }
          return prev
        })
      }
    } catch (err) {
      console.log('Failed to fetch balance')
    }
  }

  useEffect(() => {
    const rates = { BTC: 1, ETH: 15.2, USDT: 65000, USDC: 65000, SOL: 2500, XRP: 15000 }
    setRate((rates[toAsset.symbol] || 1) / (rates[fromAsset.symbol] || 1))
  }, [fromAsset, toAsset])

  const handleSwap = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) return
    if (fromAsset.symbol === toAsset.symbol) return
    
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setLoading(false)
    setSuccess(true)
    
    setTimeout(() => {
      setSuccess(false)
      setFromAmount('')
      onComplete?.()
    }, 2000)
  }

  const handleSwapAssets = () => {
    const temp = fromAsset
    setFromAsset(toAsset)
    setToAsset(temp)
  }

  const toAmount = fromAmount ? (parseFloat(fromAmount) * rate).toFixed(6) : '0.000000'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-3xl p-6 ${theme === 'dark' ? 'bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10' : 'bg-white/90 backdrop-blur-xl border border-white/50 shadow-xl'}`}
    >
      <div className="flex items-center gap-3 mb-6">
        <motion.div
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
          className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg"
        >
          <FiRepeat className="w-6 h-6 text-white" />
        </motion.div>
        <div>
          <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Swap Crypto</h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Exchange cryptocurrencies instantly</p>
        </div>
      </div>

      {success ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center mb-4"
          >
            <FiCheckCircle className="w-10 h-10 text-white" />
          </motion.div>
          <h3 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Swap Successful!</h3>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
            {fromAmount} {fromAsset.symbol} → {toAmount} {toAsset.symbol}
          </p>
        </motion.div>
      ) : (
        <>
          <div className={`p-4 rounded-xl mb-2 ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
            <label className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>You Pay</label>
            <div className="flex items-center gap-3 mt-2">
              <input
                type="number"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                placeholder="0.00"
                className={`flex-1 bg-transparent text-2xl font-bold outline-none ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const modal = document.getElementById('from-asset-modal')
                  if (modal) modal.classList.remove('hidden')
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl ${
                  theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'
                }`}
              >
                <fromAsset.icon className={`w-5 h-5 ${
                  fromAsset.symbol === 'BTC' ? 'text-amber-500' :
                  fromAsset.symbol === 'ETH' ? 'text-blue-500' : 'text-emerald-500'
                }`} />
                <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{fromAsset.symbol}</span>
              </motion.button>
            </div>
            <div className="flex justify-between mt-2">
              <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                Balance: {fromAsset.balance} {fromAsset.symbol}
              </span>
              <button
                onClick={() => setFromAmount(fromAsset.balance.toString())}
                className="text-xs text-violet-500 font-medium"
              >
                Max
              </button>
            </div>
          </div>

          <div className="flex justify-center -my-2 relative z-10">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSwapAssets}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center shadow-lg"
            >
              <FiRepeat className="w-5 h-5 text-white" />
            </motion.button>
          </div>

          <div className={`p-4 rounded-xl mt-2 ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
            <label className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>You Receive</label>
            <div className="flex items-center gap-3 mt-2">
              <span className={`flex-1 text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {toAmount}
              </span>
              <motion.button
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl ${
                  theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'
                }`}
              >
                <toAsset.icon className={`w-5 h-5 ${
                  toAsset.symbol === 'BTC' ? 'text-amber-500' :
                  toAsset.symbol === 'ETH' ? 'text-blue-500' : 'text-emerald-500'
                }`} />
                <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{toAsset.symbol}</span>
              </motion.button>
            </div>
          </div>

          <div className={`mt-4 p-3 rounded-xl flex justify-between ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Rate</span>
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              1 {fromAsset.symbol} = {rate.toFixed(6)} {toAsset.symbol}
            </span>
          </div>

          <div className={`mt-2 p-3 rounded-xl flex justify-between ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Fee (0.1%)</span>
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              ~{(parseFloat(fromAmount) * 0.001 || 0).toFixed(6)} {fromAsset.symbol}
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98, y: 0 }}
            onClick={handleSwap}
            disabled={loading || !fromAmount}
            className={`
              relative w-full py-5 mt-6 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 overflow-hidden
              disabled:opacity-50 transition-all duration-300
              ${theme === 'dark'
                ? 'bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 text-white shadow-xl shadow-blue-500/30 backdrop-blur-md'
                : 'bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 text-white shadow-xl shadow-blue-400/40'
              }
            `}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 opacity-0 hover:opacity-100 transition-opacity duration-300"
            />
            {loading ? (
              <>
                <motion.div
                  className="w-6 h-6 border-2 border-white border-t-transparent rounded-full relative"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <span className="relative">Swapping...</span>
              </>
            ) : (
              <>
                <motion.div
                  animate={{ rotate: [0, 180, 360] }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <FiRepeat className="w-6 h-6 relative" />
                </motion.div>
                <span className="relative">Swap {fromAmount || '0'} {fromAsset.symbol}</span>
              </>
            )}
          </motion.button>
        </>
      )}
    </motion.div>
  )
}

const WithdrawTab = ({ theme, onComplete }) => {
  const [withdrawType, setWithdrawType] = useState('crypto')
  const [selectedAsset, setSelectedAsset] = useState(CRYPTO_ASSETS[0])
  const [selectedNetwork, setSelectedNetwork] = useState(NetworkOptions[0])
  const [amount, setAmount] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  useEffect(() => {
    fetchBalance()
    const interval = setInterval(fetchBalance, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchBalance = async () => {
    try {
      const res = await api.get('/wallet/balance')
      if (res.data?.balance !== undefined) {
        setSelectedAsset(prev => ({
          ...prev,
          balance: res.data.balance > 0 ? res.data.balance : prev.balance
        }))
      }
    } catch (err) {
      console.log('Failed to fetch balance')
    }
  }

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0 || !address) return
    
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setLoading(false)
    setSuccess(true)
    
    setTimeout(() => {
      setSuccess(false)
      setAmount('')
      setAddress('')
      setShowConfirmation(false)
      onComplete?.()
    }, 2000)
  }

  const networkFee = parseFloat(selectedNetwork.fee) || 0
  const totalAmount = parseFloat(amount) + networkFee

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-3xl p-6 ${theme === 'dark' ? 'bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10' : 'bg-white/90 backdrop-blur-xl border border-white/50 shadow-xl'}`}
    >
      <div className="flex items-center gap-3 mb-6">
        <motion.div
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
          className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg"
        >
          <FiUpload className="w-6 h-6 text-white" />
        </motion.div>
        <div>
          <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Withdraw</h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Withdraw to wallet or bank</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {[
          { id: 'crypto', label: 'Crypto', icon: FaCoins },
          { id: 'fiat', label: 'Fiat', icon: FiCreditCard },
        ].map((type) => (
          <motion.button
            key={type.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => setWithdrawType(type.id)}
            className={`flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 ${
              withdrawType === type.id
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                : theme === 'dark' ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <type.icon className="w-5 h-5" />
            {type.label}
          </motion.button>
        ))}
      </div>

      {success ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-4"
          >
            <FiCheckCircle className="w-10 h-10 text-white" />
          </motion.div>
          <h3 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Withdrawal Submitted!</h3>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
            {amount} {selectedAsset.symbol} will be sent shortly
          </p>
        </motion.div>
      ) : showConfirmation ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-6"
        >
          <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
            theme === 'dark' ? 'bg-amber-500/20' : 'bg-amber-100'
          }`}>
            <FiLock className="w-8 h-8 text-amber-500" />
          </div>
          <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Confirm Withdrawal</h3>
          <div className={`p-4 rounded-xl mb-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
            <div className="flex justify-between mb-2">
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Amount</span>
              <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{amount} {selectedAsset.symbol}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Network Fee</span>
              <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{networkFee} {selectedNetwork.symbol}</span>
            </div>
            <div className={`pt-2 border-t ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
              <div className="flex justify-between">
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Total</span>
                <span className="font-bold text-amber-500">{totalAmount.toFixed(6)} {selectedAsset.symbol}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowConfirmation(false)}
              className={`flex-1 py-3 rounded-xl font-medium ${
                theme === 'dark' ? 'bg-white/5 text-white' : 'bg-gray-100 text-gray-900'
              }`}
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98, y: 0 }}
              onClick={handleWithdraw}
              disabled={loading}
              className={`
                relative flex-1 py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 overflow-hidden
                disabled:opacity-50 transition-all duration-300
                ${theme === 'dark'
                  ? 'bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white shadow-xl shadow-green-500/30 backdrop-blur-md'
                  : 'bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white shadow-xl shadow-green-400/40'
                }
              `}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-green-600 via-teal-500 to-emerald-500 opacity-0 hover:opacity-100 transition-opacity duration-300"
              />
              {loading ? (
                <>
                  <motion.div
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full relative"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <span className="relative">Processing...</span>
                </>
              ) : (
                <>
                  <FiCheckCircle className="w-5 h-5 relative" />
                  <span className="relative">Confirm</span>
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      ) : withdrawType === 'crypto' ? (
        <>
          <div className="mb-4">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Cryptocurrency
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CRYPTO_ASSETS.slice(0, 3).map((asset) => (
                <motion.button
                  key={asset.symbol}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedAsset(asset)}
                  className={`p-3 rounded-xl border ${
                    selectedAsset.symbol === asset.symbol
                      ? 'border-amber-500 bg-amber-500/10'
                      : theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{asset.symbol}</span>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Network
            </label>
            <select
              value={selectedNetwork.id}
              onChange={(e) => setSelectedNetwork(NetworkOptions.find(n => n.id === e.target.value))}
              className={`w-full px-4 py-3 rounded-xl ${
                theme === 'dark' ? 'bg-white/5 border border-white/10 text-white' : 'bg-gray-50 border border-gray-200 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-amber-500/50`}
            >
              {NetworkOptions.map((net) => (
                <option key={net.id} value={net.id}>{net.name}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Recipient Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter wallet address"
              className={`w-full px-4 py-3 rounded-xl ${
                theme === 'dark' ? 'bg-white/5 border border-white/10 text-white' : 'bg-gray-50 border border-gray-200 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-amber-500/50`}
            />
          </div>

          <div className="mb-4">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Amount ({selectedAsset.symbol})
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className={`w-full px-4 py-3 rounded-xl ${
                theme === 'dark' ? 'bg-white/5 border border-white/10 text-white' : 'bg-gray-50 border border-gray-200 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-amber-500/50`}
            />
            <div className="flex justify-between mt-2">
              <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                Available: {selectedAsset.balance} {selectedAsset.symbol}
              </span>
              <button
                onClick={() => setAmount((selectedAsset.balance - networkFee).toString())}
                className="text-xs text-amber-500 font-medium"
              >
                Max (minus fee)
              </button>
            </div>
          </div>

          <div className={`p-3 rounded-xl mb-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
            <div className="flex justify-between mb-1">
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Network Fee</span>
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {networkFee} {selectedNetwork.symbol}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Est. Time</span>
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {selectedNetwork.time}
              </span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98, y: 0 }}
            onClick={() => setShowConfirmation(true)}
            disabled={!amount || !address}
            className={`
              relative w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 overflow-hidden
              disabled:opacity-50 transition-all duration-300
              ${theme === 'dark'
                ? 'bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white shadow-xl shadow-green-500/30 backdrop-blur-md'
                : 'bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white shadow-xl shadow-green-400/40'
              }
            `}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-green-600 via-teal-500 to-emerald-500 opacity-0 hover:opacity-100 transition-opacity duration-300"
            />
            <span className="relative">Continue to Review</span>
            <motion.div
              whileHover={{ x: [0, 5, 0] }}
              transition={{ duration: 0.5 }}
            >
              <FiArrowRight className="w-5 h-5 relative" />
            </motion.div>
          </motion.button>
        </>
      ) : (
        <>
          <div className="mb-4">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Bank Account
            </label>
            <div className={`p-4 rounded-xl border ${
              theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center gap-3">
                <FaUniversity className="w-8 h-8 text-gray-400" />
                <div>
                  <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Chase Bank ****4532</p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Checking Account</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Amount (USD)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className={`w-full px-4 py-3 rounded-xl ${
                theme === 'dark' ? 'bg-white/5 border border-white/10 text-white' : 'bg-gray-50 border border-gray-200 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-amber-500/50`}
            />
          </div>

          <div className={`p-3 rounded-xl mb-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
            <div className="flex justify-between mb-1">
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Processing Time</span>
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>2-3 Business Days</span>
            </div>
            <div className="flex justify-between">
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Fee</span>
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>$0.00</span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98, y: 0 }}
            onClick={() => setShowConfirmation(true)}
            disabled={!amount}
            className={`
              relative w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 overflow-hidden
              disabled:opacity-50 transition-all duration-300
              ${theme === 'dark'
                ? 'bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white shadow-xl shadow-green-500/30 backdrop-blur-md'
                : 'bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white shadow-xl shadow-green-400/40'
              }
            `}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-green-600 via-teal-500 to-emerald-500 opacity-0 hover:opacity-100 transition-opacity duration-300"
            />
            <span className="relative">Continue to Review</span>
            <motion.div
              whileHover={{ x: [0, 5, 0] }}
              transition={{ duration: 0.5 }}
            >
              <FiArrowRight className="w-5 h-5 relative" />
            </motion.div>
          </motion.button>
        </>
      )}
    </motion.div>
  )
}

const BuyTab = ({ theme, onComplete }) => {
  const [selectedAsset, setSelectedAsset] = useState(CRYPTO_ASSETS[0])
  const [selectedPayment, setSelectedPayment] = useState('card')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleBuy = async () => {
    if (!amount || parseFloat(amount) <= 0) return
    
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setLoading(false)
    setSuccess(true)
    
    setTimeout(() => {
      setSuccess(false)
      setAmount('')
      onComplete?.()
    }, 2000)
  }

  const estimatedAmount = amount ? (parseFloat(amount) / 65000).toFixed(6) : '0.000000'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-3xl p-6 ${theme === 'dark' ? 'bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10' : 'bg-white/90 backdrop-blur-xl border border-white/50 shadow-xl'}`}
    >
      <div className="flex items-center gap-3 mb-6">
        <motion.div
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
          className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg"
        >
          <FiShoppingCart className="w-6 h-6 text-white" />
        </motion.div>
        <div>
          <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Buy Crypto</h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Purchase crypto with fiat currency</p>
        </div>
      </div>

      {success ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center mb-4"
          >
            <FiCheckCircle className="w-10 h-10 text-white" />
          </motion.div>
          <h3 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Purchase Complete!</h3>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
            {estimatedAmount} {selectedAsset.symbol} added to your wallet
          </p>
        </motion.div>
      ) : (
        <>
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              You Buy
            </label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {CRYPTO_ASSETS.slice(0, 3).map((asset) => (
                <motion.button
                  key={asset.symbol}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedAsset(asset)}
                  className={`p-3 rounded-xl border ${
                    selectedAsset.symbol === asset.symbol
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <asset.icon className={`w-4 h-4 ${
                      asset.symbol === 'BTC' ? 'text-amber-500' :
                      asset.symbol === 'ETH' ? 'text-blue-500' : 'text-emerald-500'
                    }`} />
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{asset.symbol}</span>
                  </div>
                </motion.button>
              ))}
            </div>
            <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className={`flex-1 bg-transparent text-2xl font-bold outline-none ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                />
                <span className={`text-xl font-bold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>USD</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Payment Method
            </label>
            <div className="space-y-2">
              {[
                { id: 'card', name: 'Visa ****4532', icon: FaCcVisa },
                { id: 'bank', name: 'Bank Account', icon: FaUniversity },
                { id: 'balance', name: 'USD Balance', icon: FaWallet },
              ].map((method) => (
                <motion.button
                  key={method.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedPayment(method.id)}
                  className={`w-full p-4 rounded-xl border flex items-center gap-4 ${
                    selectedPayment === method.id
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <method.icon className={`w-6 h-6 ${selectedPayment === method.id ? 'text-emerald-500' : 'text-gray-400'}`} />
                  <span className={`flex-1 text-left font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{method.name}</span>
                  {selectedPayment === method.id && <FiCheckCircle className="w-5 h-5 text-emerald-500" />}
                </motion.button>
              ))}
            </div>
          </div>

          <div className={`p-4 rounded-xl mb-6 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
            <div className="flex justify-between mb-2">
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>You'll receive</span>
              <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                ≈ {estimatedAmount} {selectedAsset.symbol}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Rate</span>
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>1 {selectedAsset.symbol} ≈ $65,000</span>
            </div>
            <div className="flex justify-between">
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Fee</span>
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {selectedPayment === 'card' ? '2.5%' : '0%'}
              </span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98, y: 0 }}
            onClick={handleBuy}
            disabled={loading || !amount}
            className={`
              relative w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 overflow-hidden
              disabled:opacity-50 transition-all duration-300
              ${theme === 'dark'
                ? 'bg-gradient-to-r from-lime-500 via-green-500 to-emerald-500 text-white shadow-xl shadow-green-500/30 backdrop-blur-md'
                : 'bg-gradient-to-r from-lime-500 via-green-500 to-emerald-500 text-white shadow-xl shadow-green-400/40'
              }
            `}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-green-600 via-emerald-500 to-lime-500 opacity-0 hover:opacity-100 transition-opacity duration-300"
            />
            {loading ? (
              <>
                <motion.div
                  className="w-6 h-6 border-2 border-white border-t-transparent rounded-full relative"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <span className="relative">Processing...</span>
              </>
            ) : (
              <>
                <motion.div
                  animate={loading ? {} : { y: [0, -3, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <FiShoppingCart className="w-6 h-6 relative" />
                </motion.div>
                <span className="relative">Buy ${amount || '0'} USD of {selectedAsset.symbol}</span>
              </>
            )}
          </motion.button>
        </>
      )}
    </motion.div>
  )
}

const SellTab = ({ theme, onComplete }) => {
  const [selectedAsset, setSelectedAsset] = useState(CRYPTO_ASSETS[0])
  const [selectedPayout, setSelectedPayout] = useState('bank')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSell = async () => {
    if (!amount || parseFloat(amount) <= 0) return
    if (parseFloat(amount) > selectedAsset.balance) return
    
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setLoading(false)
    setSuccess(true)
    
    setTimeout(() => {
      setSuccess(false)
      setAmount('')
      onComplete?.()
    }, 2000)
  }

  const estimatedPayout = amount ? (parseFloat(amount) * 65000).toFixed(2) : '0.00'
  const fee = amount ? (parseFloat(estimatedPayout) * 0.01).toFixed(2) : '0.00'
  const totalPayout = amount ? (parseFloat(estimatedPayout) - parseFloat(fee)).toFixed(2) : '0.00'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-3xl p-6 ${theme === 'dark' ? 'bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10' : 'bg-white/90 backdrop-blur-xl border border-white/50 shadow-xl'}`}
    >
      <div className="flex items-center gap-3 mb-6">
        <motion.div
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
          className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg"
        >
          <FiShoppingBag className="w-6 h-6 text-white" />
        </motion.div>
        <div>
          <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Sell Crypto</h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Convert crypto to fiat currency</p>
        </div>
      </div>

      {success ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center mb-4"
          >
            <FiCheckCircle className="w-10 h-10 text-white" />
          </motion.div>
          <h3 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Sale Complete!</h3>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
            ${totalPayout} will be sent to your {selectedPayout === 'bank' ? 'bank account' : 'wallet'}
          </p>
        </motion.div>
      ) : (
        <>
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              You Sell
            </label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {CRYPTO_ASSETS.slice(0, 3).map((asset) => (
                <motion.button
                  key={asset.symbol}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedAsset(asset)}
                  className={`p-3 rounded-xl border ${
                    selectedAsset.symbol === asset.symbol
                      ? 'border-rose-500 bg-rose-500/10'
                      : theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <asset.icon className={`w-4 h-4 ${
                      asset.symbol === 'BTC' ? 'text-amber-500' :
                      asset.symbol === 'ETH' ? 'text-blue-500' : 'text-emerald-500'
                    }`} />
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{asset.symbol}</span>
                  </div>
                </motion.button>
              ))}
            </div>
            <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className={`flex-1 bg-transparent text-2xl font-bold outline-none ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                />
                <span className={`text-xl font-bold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{selectedAsset.symbol}</span>
              </div>
              <div className="flex justify-between mt-2">
                <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  Balance: {selectedAsset.balance} {selectedAsset.symbol}
                </span>
                <button
                  onClick={() => setAmount(selectedAsset.balance.toString())}
                  className="text-xs text-rose-500 font-medium"
                >
                  Max
                </button>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Payout Method
            </label>
            <div className="space-y-2">
              {[
                { id: 'bank', name: 'Bank Account', icon: FaUniversity, desc: '2-3 days' },
                { id: 'card', name: 'Debit Card', icon: FaCcVisa, desc: 'Instant' },
                { id: 'balance', name: 'USD Balance', icon: FaWallet, desc: 'Instant' },
              ].map((method) => (
                <motion.button
                  key={method.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedPayout(method.id)}
                  className={`w-full p-4 rounded-xl border flex items-center gap-4 ${
                    selectedPayout === method.id
                      ? 'border-rose-500 bg-rose-500/10'
                      : theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <method.icon className={`w-6 h-6 ${selectedPayout === method.id ? 'text-rose-500' : 'text-gray-400'}`} />
                  <div className="flex-1 text-left">
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{method.name}</p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{method.desc}</p>
                  </div>
                  {selectedPayout === method.id && <FiCheckCircle className="w-5 h-5 text-rose-500" />}
                </motion.button>
              ))}
            </div>
          </div>

          <div className={`p-4 rounded-xl mb-6 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
            <div className="flex justify-between mb-2">
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Estimated Payout</span>
              <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>${estimatedPayout} USD</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Rate</span>
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>1 {selectedAsset.symbol} ≈ $65,000</span>
            </div>
            <div className="flex justify-between">
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Fee (1%)</span>
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>${fee}</span>
            </div>
            <div className={`pt-2 mt-2 border-t ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
              <div className="flex justify-between">
                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>You'll receive</span>
                <span className="font-bold text-rose-500">${totalPayout} USD</span>
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98, y: 0 }}
            onClick={handleSell}
            disabled={loading || !amount || parseFloat(amount) > selectedAsset.balance}
            className={`
              relative w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 overflow-hidden
              disabled:opacity-50 transition-all duration-300
              ${theme === 'dark'
                ? 'bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 text-white shadow-xl shadow-rose-500/30 backdrop-blur-md'
                : 'bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 text-white shadow-xl shadow-rose-400/40'
              }
            `}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-pink-600 via-fuchsia-500 to-rose-500 opacity-0 hover:opacity-100 transition-opacity duration-300"
            />
            {loading ? (
              <>
                <motion.div
                  className="w-6 h-6 border-2 border-white border-t-transparent rounded-full relative"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <span className="relative">Processing...</span>
              </>
            ) : (
              <>
                <motion.div
                  animate={loading ? {} : { y: [0, 3, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <FiShoppingBag className="w-6 h-6 relative" />
                </motion.div>
                <span className="relative">Sell {amount || '0'} {selectedAsset.symbol}</span>
              </>
            )}
          </motion.button>
        </>
      )}
    </motion.div>
  )
}

const DashboardTabNav = ({ tabs, activeTab, setActiveTab, theme }) => {
  const [hoveredTab, setHoveredTab] = useState(null)
  
  const cardStyles = {
    transfer: { 
      gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
      glow: 'rgba(167, 139, 250, 0.5)',
      shadow: 'rgba(139, 92, 246, 0.4)',
      icon: 'text-white',
    },
    deposit: { 
      gradient: 'from-amber-500 via-orange-500 to-red-500',
      glow: 'rgba(251, 191, 36, 0.5)',
      shadow: 'rgba(249, 115, 22, 0.4)',
      icon: 'text-white',
    },
    swap: { 
      gradient: 'from-cyan-500 via-blue-500 to-indigo-500',
      glow: 'rgba(34, 211, 238, 0.5)',
      shadow: 'rgba(59, 130, 246, 0.4)',
      icon: 'text-white',
    },
    withdraw: { 
      gradient: 'from-emerald-500 via-green-500 to-teal-500',
      glow: 'rgba(52, 211, 153, 0.5)',
      shadow: 'rgba(34, 197, 94, 0.4)',
      icon: 'text-white',
    },
    buy: { 
      gradient: 'from-lime-500 via-green-500 to-emerald-500',
      glow: 'rgba(132, 204, 22, 0.5)',
      shadow: 'rgba(34, 197, 94, 0.4)',
      icon: 'text-white',
    },
    sell: { 
      gradient: 'from-rose-500 via-pink-500 to-fuchsia-500',
      glow: 'rgba(251, 113, 133, 0.5)',
      shadow: 'rgba(244, 63, 94, 0.4)',
      icon: 'text-white',
    },
  }
  
  const filteredTabs = tabs.filter(tab => 
    ['swap', 'transfer', 'deposit', 'withdraw', 'buy', 'sell'].includes(tab.id)
  )
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
        className="grid grid-cols-3 md:grid-cols-6 gap-4"
      >
        {filteredTabs.map((tab, index) => {
          const style = cardStyles[tab.id] || cardStyles.swap
          const isActive = activeTab === tab.id
          const isHovered = hoveredTab === tab.id
          
          return (
            <motion.div
              key={tab.id}
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: index * 0.08, type: "spring", stiffness: 100, damping: 15 }}
              whileHover={{ y: -8, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onHoverStart={() => setHoveredTab(tab.id)}
              onHoverEnd={() => setHoveredTab(null)}
              onClick={() => setActiveTab(tab.id)}
              className="relative cursor-pointer"
              style={{ perspective: '1000px' }}
            >
              <motion.div
                className={`
                  relative p-4 rounded-2xl overflow-hidden
                  ${theme === 'dark' 
                    ? 'bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 shadow-xl' 
                    : 'bg-white/80 backdrop-blur-2xl border border-white/50 shadow-xl shadow-gray-200/50'
                  }
                `}
                animate={{
                  rotateX: isHovered ? -5 : 0,
                  rotateY: isHovered ? 5 : 0,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                style={{
                  transformStyle: 'preserve-3d',
                  boxShadow: isActive || isHovered 
                    ? `0 20px 40px -10px ${style.shadow}, 0 0 30px -5px ${style.glow}`
                    : `0 10px 20px -5px ${theme === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)'}`,
                }}
              >
                <motion.div
                  className="absolute inset-0 opacity-0"
                  animate={{ opacity: isHovered ? 1 : 0 }}
                  style={{
                    background: `linear-gradient(135deg, ${style.glow}20 0%, transparent 50%, ${style.glow}10 100%)`,
                  }}
                  transition={{ duration: 0.3 }}
                />
                
                <motion.div
                  className={`absolute -inset-px rounded-2xl opacity-0 ${isActive ? 'opacity-100' : ''}`}
                  style={{
                    background: `linear-gradient(135deg, ${style.shadow}, transparent, ${style.shadow})`,
                  }}
                  animate={{ opacity: isActive ? 0.3 : 0 }}
                />
                
                <div className="relative z-10 flex flex-col items-center gap-3">
                  <motion.div
                    className={`
                      relative w-12 h-12 rounded-2xl flex items-center justify-center
                      bg-gradient-to-br ${style.gradient}
                    `}
                    animate={{
                      scale: isActive || isHovered ? [1, 1.15, 1] : 1,
                      rotate: isHovered ? [0, -10, 10, 0] : 0,
                    }}
                    transition={{ 
                      scale: { duration: 0.8, repeat: isActive || isHovered ? Infinity : 0 },
                      rotate: { duration: 0.5 }
                    }}
                    style={{
                      boxShadow: `0 8px 20px -5px ${style.shadow}`,
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <motion.div
                      animate={isActive ? { rotate: [0, 360] } : {}}
                      transition={{ duration: 1, repeat: isActive ? Infinity : 0, ease: "linear" }}
                    >
                      <tab.icon className={`w-6 h-6 ${style.icon}`} />
                    </motion.div>
                    
                    {isActive && (
                      <motion.div
                        className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-white"
                        initial={{ scale: 0 }}
                        animate={{ 
                          scale: [1, 1.3, 1],
                          boxShadow: [
                            '0 0 0 0 rgba(255,255,255,0.4)',
                            '0 0 0 4px rgba(255,255,255,0)',
                          ]
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                  </motion.div>
                  
                  <span className={`
                    text-xs font-bold tracking-wide
                    ${isActive 
                      ? `bg-gradient-to-r ${style.gradient} bg-clip-text text-transparent` 
                      : theme === 'dark' ? 'text-white' : 'text-gray-700'
                    }
                  `}>
                    {tab.label}
                  </span>
                </div>
                
                {isActive && (
                  <motion.div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${style.shadow}, ${style.glow}, ${style.shadow})`,
                    }}
                    initial={{ scaleX: 0, width: 0 }}
                    animate={{ scaleX: 1, width: '2rem' }}
                    transition={{ type: "spring", stiffness: 300 }}
                  />
                )}
              </motion.div>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}

const PriceTicker = ({ coins }) => {
  const { theme } = useThemeStore()
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`overflow-hidden rounded-2xl ${
        theme === 'dark' 
          ? 'bg-gradient-to-r from-black/50 to-transparent border-b border-white/10' 
          : 'bg-gradient-to-r from-gray-100 to-transparent border-b border-gray-200'
      }`}
    >
      <motion.div
        className="flex gap-8 py-3 px-4"
        animate={{ x: [0, -1000] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        {[...coins, ...coins].map((coin, i) => (
          <Link
            key={`${coin.id}-${i}`}
            to={`/trade/${coin.symbol}`}
            className="flex items-center gap-3 whitespace-nowrap"
          >
            <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" />
            <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {coin.symbol.toUpperCase()}
            </span>
            <span className={`font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              ${coin.current_price.toLocaleString()}
            </span>
            <span className={coin.price_change_percentage_24h >= 0 ? 'text-emerald-400' : 'text-red-400'}>
              {coin.price_change_percentage_24h >= 0 ? '+' : ''}{coin.price_change_percentage_24h?.toFixed(2)}%
            </span>
          </Link>
        ))}
      </motion.div>
    </motion.div>
  )
}

const PortfolioChart = ({ theme }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.6 }}
      className={`rounded-3xl p-6 ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10' 
          : 'bg-white/90 backdrop-blur-xl border border-white/50 shadow-xl'
      }`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
            <FiPieChart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Portfolio Allocation
            </h3>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Distribution across assets
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke={theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#e5e7eb'} strokeWidth="12" />
            <motion.circle
              cx="50" cy="50" r="40"
              fill="none"
              stroke="url(#gradient1)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray="251.2"
              initial={{ strokeDashoffset: 251.2 }}
              animate={{ strokeDashoffset: 100 }}
              transition={{ duration: 1.5, delay: 0.8 }}
            />
            <motion.circle
              cx="50" cy="50" r="40"
              fill="none"
              stroke="url(#gradient2)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray="251.2"
              strokeDashoffset="251.2"
              initial={{ strokeDashoffset: 251.2 }}
              animate={{ strokeDashoffset: 150 }}
              transition={{ duration: 1.5, delay: 1 }}
            />
            <motion.circle
              cx="50" cy="50" r="40"
              fill="none"
              stroke="url(#gradient3)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray="251.2"
              strokeDashoffset="251.2"
              initial={{ strokeDashoffset: 251.2 }}
              animate={{ strokeDashoffset: 180 }}
              transition={{ duration: 1.5, delay: 1.2 }}
            />
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
              <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
              <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>
          </svg>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.5, type: "spring" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="text-center">
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Total</p>
              <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>$10K</p>
            </div>
          </motion.div>
        </div>
        
        <div className="flex-1 space-y-3">
          {[
            { name: 'Bitcoin', color: 'from-emerald-500 to-cyan-500', percent: 45, value: '$4,500' },
            { name: 'Ethereum', color: 'from-violet-500 to-purple-500', percent: 30, value: '$3,000' },
            { name: 'Others', color: 'from-amber-500 to-red-500', percent: 25, value: '$2,500' },
          ].map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + i * 0.1 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${item.color}`} />
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{item.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-20 h-2 rounded-full ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'}`}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percent}%` }}
                    transition={{ delay: 1 + i * 0.1, duration: 0.8 }}
                    className={`h-full rounded-full bg-gradient-to-r ${item.color}`}
                  />
                </div>
                <span className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {item.value}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

const RecentActivity = ({ recentTransactions, theme }) => {
  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit': return { icon: FiArrowDown, class: 'from-emerald-500/20 to-cyan-500/20', color: 'text-emerald-400' }
      case 'withdrawal': return { icon: FiArrowUp, class: 'from-red-500/20 to-rose-500/20', color: 'text-red-400' }
      case 'transfer': return { icon: FiRepeat, class: 'from-blue-500/20 to-indigo-500/20', color: 'text-blue-400' }
      case 'buy': return { icon: FiTrendingUp, class: 'from-emerald-500/20 to-cyan-500/20', color: 'text-emerald-400' }
      case 'sell': return { icon: FiTrendingDown, class: 'from-red-500/20 to-rose-500/20', color: 'text-red-400' }
      default: return { icon: FiDollarSign, class: 'from-amber-500/20 to-orange-500/20', color: 'text-amber-400' }
    }
  }

  const getTimeAgo = (date) => {
    const now = new Date()
    const then = new Date(date)
    const diffMs = now - then
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  }

  const formatAmount = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.7 }}
      className={`rounded-3xl p-6 ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10' 
          : 'bg-white/90 backdrop-blur-xl border border-white/50 shadow-xl'
      }`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
            <FiClock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Recent Activity
            </h3>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Your latest transactions
            </p>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        {recentTransactions.length === 0 ? (
          <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            No transactions yet
          </p>
        ) : (
          recentTransactions.map((tx, i) => {
            const { icon: Icon, class: iconClass, color } = getTransactionIcon(tx.type)
            const isPositive = tx.type === 'deposit' || tx.type === 'buy'
            return (
              <motion.div
                key={tx._id || i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + i * 0.1 }}
                whileHover={{ x: 5 }}
                className={`flex items-center justify-between p-4 rounded-2xl ${
                  theme === 'dark' ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'
                } transition-all cursor-pointer`}
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${iconClass}`}
                  >
                    <Icon className={`w-5 h-5 ${color}`} />
                  </motion.div>
                  <div>
                    <p className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                      {tx.coinSymbol ? ` ${tx.coinSymbol}` : ''}
                    </p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {tx.status === 'pending' ? 'Processing' : tx.status}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isPositive ? '+' : '-'}{formatAmount(tx.amount)}
                  </p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    {getTimeAgo(tx.createdAt)}
                  </p>
                </div>
              </motion.div>
            )
          })
        )}
      </div>
    </motion.div>
  )
}

const SentimentIndicator = ({ theme }) => {
  const [sentiment, setSentiment] = useState(72)
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.8 }}
      className={`rounded-3xl p-6 ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10' 
          : 'bg-white/90 backdrop-blur-xl border border-white/50 shadow-xl'
      }`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
          <FiActivity className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Market Sentiment
          </h3>
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Based on social & news
          </p>
        </div>
      </div>
      
      <div className="flex items-center justify-center mb-4">
        <motion.div
          className="relative w-28 h-28"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke={theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#e5e7eb'} strokeWidth="8" />
            <motion.circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke="url(#sentimentGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="264"
              initial={{ strokeDashoffset: 264 }}
              animate={{ strokeDashoffset: 264 - (264 * sentiment / 100) }}
              transition={{ duration: 2, delay: 1 }}
            />
            <defs>
              <linearGradient id="sentimentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#f43f5e" />
              </linearGradient>
            </defs>
          </svg>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.5, type: "spring" }}
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            <span className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {sentiment}%
            </span>
            <span className="text-xs text-emerald-400 font-medium">Bullish</span>
          </motion.div>
        </motion.div>
      </div>
      
      <div className="flex justify-between text-center">
        <div>
          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>2.4K</p>
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Posts</p>
        </div>
        <div>
          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>87%</p>
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Positive</p>
        </div>
        <div>
          <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>High</p>
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Activity</p>
        </div>
      </div>
    </motion.div>
  )
}

const NotificationPanel = ({ isOpen, onClose, theme }) => {
  const { token } = useAuthStore()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && token) {
      setLoading(true)
      fetch(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          const formatted = (data.notifications || []).map(n => ({
            id: n._id,
            title: n.title,
            message: n.message,
            type: n.type,
            unread: !n.read,
            time: formatTimeAgo(n.createdAt)
          }))
          setNotifications(formatted)
        })
        .catch(err => console.error('Failed to fetch notifications:', err))
        .finally(() => setLoading(false))
    }
  }, [isOpen, token])

  const formatTimeAgo = (date) => {
    const now = new Date()
    const past = new Date(date)
    const diff = Math.floor((now - past) / 1000)
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)} hour ago`
    return `${Math.floor(diff / 86400)} day ago`
  }

  const markAsRead = async (id) => {
    try {
      await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      })
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, unread: false } : n
      ))
    } catch (err) {
      console.error('Failed to mark as read:', err)
    }
  }

  const clearAll = async () => {
    try {
      await fetch(`${API_URL}/notifications/clear-all`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      setNotifications([])
    } catch (err) {
      console.error('Failed to clear notifications:', err)
    }
  }

  const unreadCount = notifications.filter(n => n.unread).length

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`fixed top-20 right-6 w-96 rounded-2xl overflow-hidden z-50 shadow-2xl ${
              theme === 'dark'
                ? 'bg-gray-900/95 backdrop-blur-xl border border-white/10'
                : 'bg-white/95 backdrop-blur-xl border border-gray-200'
            }`}
          >
            <div className={`p-4 border-b ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500 text-white"
                    >
                      {unreadCount}
                    </motion.span>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className={`p-2 rounded-xl ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-100'} transition-colors`}
                >
                  <FiX className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`} />
                </button>
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`w-16 h-16 mx-auto mb-4 rounded-full ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-100'} flex items-center justify-center`}
                  >
                    <FiBell className={`w-8 h-8 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                  </motion.div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    All caught up! No new notifications.
                  </p>
                </div>
              ) : (
                notifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => markAsRead(notification.id)}
                    className={`p-4 border-b last:border-b-0 cursor-pointer transition-all ${
                      notification.unread
                        ? theme === 'dark' ? 'bg-emerald-500/5' : 'bg-emerald-50/50'
                        : theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <motion.div
                        whileHover={{ rotate: 10, scale: 1.1 }}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          notification.type === 'price' ? 'bg-emerald-500/20' :
                          notification.type === 'trade' ? 'bg-blue-500/20' :
                          notification.type === 'ai' ? 'bg-purple-500/20' :
                          'bg-amber-500/20'
                        }`}
                      >
                        {notification.type === 'price' ? <FiTrendingUp className="w-5 h-5 text-emerald-400" /> :
                         notification.type === 'trade' ? <FaExchangeAlt className="w-5 h-5 text-blue-400" /> :
                         notification.type === 'ai' ? <FaRobot className="w-5 h-5 text-purple-400" /> :
                         <FiPieChart className="w-5 h-5 text-amber-400" />}
                      </motion.div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className={`font-semibold text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {notification.title}
                          </p>
                          {notification.unread && (
                            <motion.span
                              layoutId="unreadDot"
                              className="w-2 h-2 rounded-full bg-emerald-500"
                            />
                          )}
                        </div>
                        <p className={`text-sm mt-0.5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                            {notification.time}
                          </p>
                          {notification.unread && (
                            <span className="text-xs text-emerald-500 font-medium">Click to mark read</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
            <div className={`p-4 border-t ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={clearAll}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                    theme === 'dark'
                      ? 'bg-white/5 hover:bg-white/10 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  Clear All
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/20">
                  View All
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

const SettingsPanel = ({ isOpen, onClose, theme }) => {
  const [activeTab, setActiveTab] = useState('general')
  const [settings, setSettings] = useState({
    currency: 'USD',
    tradingView: '1h',
    priceAlerts: true,
    tradeUpdates: true,
    aiSignals: false,
    marketNews: false,
  })
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const { setTheme } = useThemeStore()

  const tabs = [
    { id: 'general', label: 'General', icon: FiActivity },
    { id: 'security', label: 'Security', icon: FaShieldAlt },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
    { id: 'appearance', label: 'Appearance', icon: FiSettings },
  ]

  const showNotification = (message) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleCurrencyChange = (value) => {
    setSettings({ ...settings, currency: value })
    showNotification(`Currency changed to ${value}`)
  }

  const handleTradingViewChange = (value) => {
    setSettings({ ...settings, tradingView: value })
    showNotification(`Chart timeframe set to ${value}`)
  }

  const toggleSetting = (key) => {
    setSettings({ ...settings, [key]: !settings[key] })
    showNotification(`${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} ${!settings[key] ? 'enabled' : 'disabled'}`)
  }

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme)
    showNotification(`Theme changed to ${newTheme}`)
  }

  return (
    <AnimatePresence>
      {showToast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-6 right-6 z-[100] px-4 py-2 rounded-xl bg-emerald-500 text-white font-medium text-sm shadow-lg"
        >
          {toastMessage}
        </motion.div>
      )}
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, x: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`fixed top-20 right-6 w-[500px] rounded-2xl overflow-hidden z-50 shadow-2xl ${
              theme === 'dark'
                ? 'bg-gray-900/95 backdrop-blur-xl border border-white/10'
                : 'bg-white/95 backdrop-blur-xl border border-gray-200'
            }`}
          >
            <div className={`p-4 border-b ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <h3 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Settings
                </h3>
                <button
                  onClick={onClose}
                  className={`p-2 rounded-xl ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-100'} transition-colors`}
                >
                  <FiX className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`} />
                </button>
              </div>
              <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                {tabs.map((tab) => (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                      activeTab === tab.id
                        ? theme === 'dark'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-emerald-100 text-emerald-600'
                        : theme === 'dark'
                          ? 'text-gray-400 hover:text-white hover:bg-white/5'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </motion.button>
                ))}
              </div>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto">
              {activeTab === 'general' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 cursor-pointer"
                    onClick={() => document.getElementById('currency-select').focus()}
                  >
                    <div>
                      <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Currency</p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Select your preferred currency</p>
                    </div>
                    <select
                      id="currency-select"
                      value={settings.currency}
                      onChange={(e) => handleCurrencyChange(e.target.value)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium cursor-pointer ${
                        theme === 'dark'
                          ? 'bg-white/10 border border-white/20 text-white'
                          : 'bg-white border border-gray-200 text-gray-900'
                      }`}
                    >
                      <option value="USD">🇺🇸 USD</option>
                      <option value="EUR">🇪🇺 EUR</option>
                      <option value="GBP">🇬🇧 GBP</option>
                      <option value="BTC">₿ BTC</option>
                    </select>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 cursor-pointer"
                    onClick={() => document.getElementById('trading-select').focus()}
                  >
                    <div>
                      <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Trading View</p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Default chart timeframe</p>
                    </div>
                    <select
                      id="trading-select"
                      value={settings.tradingView}
                      onChange={(e) => handleTradingViewChange(e.target.value)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium cursor-pointer ${
                        theme === 'dark'
                          ? 'bg-white/10 border border-white/20 text-white'
                          : 'bg-white border border-gray-200 text-gray-900'
                      }`}
                    >
                      <option value="1m">1 Minute</option>
                      <option value="5m">5 Minutes</option>
                      <option value="1h">1 Hour</option>
                      <option value="4h">4 Hours</option>
                      <option value="1d">1 Day</option>
                    </select>
                  </motion.div>
                </motion.div>
              )}
              {activeTab === 'security' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20"
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                        className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center"
                      >
                        <FaShieldAlt className="w-5 h-5 text-amber-400" />
                      </motion.div>
                      <div>
                        <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Two-Factor Auth</p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Add extra security</p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => showNotification('2FA setup would open here')}
                      className="px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/20"
                    >
                      Enable
                    </motion.button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20"
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                        className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center"
                      >
                        <FaLock className="w-5 h-5 text-blue-400" />
                      </motion.div>
                      <div>
                        <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Change Password</p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Update your password</p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => showNotification('Password change modal would open')}
                      className={`px-4 py-2 rounded-xl text-sm font-medium ${
                        theme === 'dark'
                          ? 'bg-white/10 hover:bg-white/20 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                      }`}
                    >
                      Update
                    </motion.button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20"
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                        className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center"
                      >
                        <FaRobot className="w-5 h-5 text-purple-400" />
                      </motion.div>
                      <div>
                        <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>API Keys</p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Manage API access</p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => showNotification('API management page would open')}
                      className={`px-4 py-2 rounded-xl text-sm font-medium ${
                        theme === 'dark'
                          ? 'bg-white/10 hover:bg-white/20 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                      }`}
                    >
                      Manage
                    </motion.button>
                  </motion.div>
                </motion.div>
              )}
              {activeTab === 'notifications' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {[
                    { key: 'priceAlerts', label: 'Price Alerts', desc: 'Get notified of price changes', icon: FiTrendingUp },
                    { key: 'tradeUpdates', label: 'Trade Updates', desc: 'Receive trade execution alerts', icon: FaExchangeAlt },
                    { key: 'aiSignals', label: 'AI Signals', desc: 'Get AI trading recommendations', icon: FaRobot },
                    { key: 'marketNews', label: 'Market News', desc: 'Stay updated with market news', icon: FiActivity },
                  ].map((item) => (
                    <motion.div
                      key={item.key}
                      whileHover={{ scale: 1.01 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-purple-500/5 to-pink-500/5 border border-purple-500/10"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          item.key === 'priceAlerts' ? 'bg-emerald-500/20' :
                          item.key === 'tradeUpdates' ? 'bg-blue-500/20' :
                          item.key === 'aiSignals' ? 'bg-purple-500/20' :
                          'bg-amber-500/20'
                        }`}>
                          <item.icon className={`w-5 h-5 ${
                            item.key === 'priceAlerts' ? 'text-emerald-400' :
                            item.key === 'tradeUpdates' ? 'text-blue-400' :
                            item.key === 'aiSignals' ? 'text-purple-400' :
                            'text-amber-400'
                          }`} />
                        </div>
                        <div>
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.label}</p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{item.desc}</p>
                        </div>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleSetting(item.key)}
                        className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer ${
                          settings[item.key] ? 'bg-gradient-to-r from-emerald-500 to-cyan-500' : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
                        }`}
                      >
                        <motion.div
                          animate={{ x: settings[item.key] ? 24 : 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className="w-6 h-6 rounded-full bg-white shadow-lg flex items-center justify-center"
                        >
                          {settings[item.key] && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-2 h-2 rounded-full bg-emerald-500"
                            />
                          )}
                        </motion.div>
                      </motion.button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
              {activeTab === 'appearance' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="p-4 rounded-xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20">
                    <p className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Theme</p>
                    <div className="grid grid-cols-3 gap-3">
                      {['dark', 'light', 'system'].map((t) => (
                        <motion.button
                          key={t}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleThemeChange(t)}
                          className={`p-3 rounded-xl text-sm font-medium capitalize transition-all flex flex-col items-center gap-2 ${
                            theme === t
                              ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/20'
                              : theme === 'dark'
                                ? 'bg-white/10 text-white hover:bg-white/20'
                                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                          }`}
                        >
                          <span className="text-xl">{t === 'dark' ? '🌙' : t === 'light' ? '☀️' : '💻'}</span>
                          <span>{t}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-r from-pink-500/10 to-rose-500/10 border border-pink-500/20">
                    <p className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Accent Color</p>
                    <div className="flex gap-3">
                      {[
                        { gradient: 'from-emerald-500 to-cyan-500', name: 'Emerald' },
                        { gradient: 'from-blue-500 to-purple-500', name: 'Ocean' },
                        { gradient: 'from-pink-500 to-rose-500', name: 'Rose' },
                        { gradient: 'from-amber-500 to-orange-500', name: 'Amber' },
                      ].map((color, i) => (
                        <motion.button
                          key={i}
                          whileHover={{ scale: 1.15, y: -3 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => showNotification(`${color.name} accent color selected`)}
                          title={color.name}
                          className={`w-12 h-12 rounded-xl bg-gradient-to-r ${color.gradient} ${
                            i === 0 ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900' : ''
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Compact Mode</p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Reduce spacing in dashboard</p>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer bg-gray-300`}
                      >
                        <motion.div
                          className="w-6 h-6 rounded-full bg-white shadow-lg"
                        />
                      </motion.button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default function Dashboard() {
  const { user, refreshWallet } = useAuthStore()
  const { theme } = useThemeStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const tabFromUrl = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'overview')
  const [wallet, setWallet] = useState({ balance: 0, deposits: 0, withdrawals: 0 })
  const [portfolioStats, setPortfolioStats] = useState({ totalBalance: 0, totalPL: 0, totalVolume: 0, totalTrades: 0 })
  const [globalStats, setGlobalStats] = useState({ availableBalance: 0, totalDeposit: 0, totalWithdraw: 0, totalProfit: 0 })
  const [trades, setTrades] = useState([])
  const [marketData, setMarketData] = useState([])
  const [recentTransactions, setRecentTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [depositCoins, setDepositCoins] = useState({})

  useAdminUpdates({
    specificEvents: [
      'wallet_updated', 'wallet_stats_updated', 'deposit_approved', 'transaction_approved', 'all_balances_reset',
      'trade_created', 'trade_updated', 'trade_deleted', 'portfolio_stats_updated',
      'user_updated', 'global_wallet_stats_updated'
    ],
    onUpdate: async (type, data) => {
      console.log('[Dashboard] Received update:', type, data)
      await fetchData()
      await refreshWallet()
    }
  })

  const fetchDepositData = async () => {
    try {
      const [addressesRes, settingsRes] = await Promise.all([
        api.get('/deposits/deposit-addresses').catch(() => ({ data: [] })),
        api.get('/deposits/settings').catch(() => ({ data: {} }))
      ])
      
      if (addressesRes.data && Array.isArray(addressesRes.data)) {
        const addrMap = {}
        addressesRes.data.forEach(addr => {
          addrMap[addr.symbol] = addr
        })
        setDepositCoins(addrMap)
      } else if (settingsRes.data?.coins) {
        setDepositCoins(settingsRes.data.coins)
      }
    } catch (error) {
      console.log('Failed to fetch deposit data')
    }
  }

  const dynamicAssets = CRYPTO_ASSETS.map((asset, index) => {
    if (asset.symbol === 'USDT') {
      return { ...asset, balance: wallet.balance > 0 ? wallet.balance : 2500 }
    }
    return asset
  })

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl)
    }
  }, [tabFromUrl])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [userBalanceRes, globalStatsRes, tradesRes, marketsRes, transactionsRes] = await Promise.all([
        api.get('/wallet/balance').catch(() => ({ data: { balance: 0, deposits: 0, withdrawals: 0 } })),
        api.get('/wallet/global-stats').catch(() => ({ data: { availableBalance: 0, totalDeposit: 0, totalWithdraw: 0, totalProfit: 0 } })),
        api.get('/trades?limit=5').catch(() => ({ data: { trades: [] } })),
        api.get('/markets/coins?per_page=8').catch(() => ({ data: [] })),
        api.get('/wallet/transactions?limit=5').catch(() => ({ data: { transactions: [] } }))
      ])
      
      const statsData = globalStatsRes.data || { availableBalance: 0, totalDeposit: 0, totalWithdraw: 0, totalProfit: 0 }
      
      setWallet(userBalanceRes.data || { balance: 0, deposits: 0, withdrawals: 0 })
      setGlobalStats(statsData)
      setTrades(tradesRes.data?.trades || [])
      setMarketData(marketsRes.data || [])
      setRecentTransactions(transactionsRes.data?.transactions || [])
      
      useAuthStore.setState((state) => ({
        user: {
          ...state.user,
          wallet: {
            balance: statsData.availableBalance || statsData.balance || userBalanceRes.data?.balance || 0,
            deposits: statsData.totalDeposit || 0,
            withdrawals: statsData.totalWithdraw || 0,
            currency: 'USD'
          },
          walletStats: {
            availableBalance: statsData.availableBalance || 0,
            totalDeposit: statsData.totalDeposit || 0,
            totalWithdraw: statsData.totalWithdraw || 0,
            totalProfit: statsData.totalProfit || 0
          }
        }
      }))
      
      setPortfolioStats({ 
        totalBalance: statsData.availableBalance || statsData.balance || 0, 
        totalPL: statsData.totalProfit || 0, 
        totalVolume: 0, 
        totalTrades: 0 
      })
    } catch (err) {
      console.error('Failed to fetch data:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const userWalletStats = user?.walletStats || {}
  const totalPL = userWalletStats.totalProfit ?? portfolioStats?.totalPL ?? 0
  const totalPLIsNegative = totalPL < 0
  
  const stats = [
    { 
      label: 'Portfolio Balance', 
      value: `$${(portfolioStats?.totalBalance || 0).toLocaleString()}`, 
      icon: FiDollarSign, 
      color: 'from-emerald-400 to-cyan-500',
      shadow: 'rgba(16, 185, 129, 0.4)',
      change: '+12.5%',
      changeType: 'positive'
    },
    { 
      label: 'Total P/L', 
      value: `${totalPLIsNegative ? '-' : ''}$${Math.abs(totalPL).toLocaleString()}`, 
      icon: FiTrendingUp, 
      color: totalPLIsNegative ? 'from-red-400 to-rose-500' : 'from-blue-400 to-indigo-500',
      shadow: totalPLIsNegative ? 'rgba(244, 63, 94, 0.4)' : 'rgba(59, 130, 246, 0.4)',
      change: totalPL >= 0 ? '+8.3%' : '-8.3%',
      changeType: totalPL >= 0 ? 'positive' : 'negative'
    },
    { 
      label: 'Total Volume', 
      value: `$${(portfolioStats?.totalVolume || 0).toLocaleString()}`, 
      icon: FiActivity, 
      color: 'from-violet-400 to-purple-500',
      shadow: 'rgba(139, 92, 246, 0.4)',
      change: '+23%',
      changeType: 'positive'
    },
    {
      label: 'Total Trades', 
      value: (portfolioStats?.totalTrades || 0).toLocaleString(), 
      icon: FiTrendingUp, 
      color: 'from-amber-400 to-orange-500',
      shadow: 'rgba(245, 158, 11, 0.4)',
      change: '+5.2%',
      changeType: 'positive'
    },
  ]

  const quickActions = [
    { label: 'Buy Crypto', path: '/markets', icon: FiPlus, color: 'emerald' },
    { label: 'AI Trading', path: '/ai-chat', icon: FaRobot, color: 'violet' },
    { label: 'Copy Trade', path: '/copytrading', icon: FiUsers, color: 'blue' },
    { label: 'Portfolio', path: '/portfolio', icon: FiPieChart, color: 'amber' },
  ]

  const handleOperationComplete = () => {
    fetchData()
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`relative min-h-screen overflow-hidden ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-gray-950 via-blue-950/30 to-gray-950' 
          : 'bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50'
      }`}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <FloatingOrb size="400px" color="rgba(16, 185, 129, 0.15)" delay={0} duration={8} top="10%" left="-10%" />
        <FloatingOrb size="300px" color="rgba(59, 130, 246, 0.12)" delay={2} duration={10} top="40%" right="-5%" />
        <FloatingOrb size="350px" color="rgba(139, 92, 246, 0.1)" delay={4} duration={12} bottom="10%" left="20%" />
        <FloatingOrb size="250px" color="rgba(245, 158, 11, 0.08)" delay={1} duration={9} top="60%" left="50%" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
        >
          <div>
            <motion.h1 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className={`text-4xl lg:text-5xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
            >
              Welcome back,{' '}
              <motion.span 
                className="bg-gradient-to-r from-emerald-400 via-cyan-500 to-blue-500 bg-clip-text text-transparent"
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{ duration: 5, repeat: Infinity }}
                style={{ backgroundSize: '200% 200%' }}
              >
                {user?.name?.split(' ')[0] || 'Trader'}
              </motion.span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className={`mt-3 text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
            >
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} • Your portfolio is performing well
            </motion.p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
            className="flex items-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setShowNotifications(!showNotifications); setShowSettings(false); }}
              className={`p-3 rounded-2xl ${theme === 'dark' ? 'bg-white/10 hover:bg-white/15' : 'bg-white hover:bg-gray-100'} backdrop-blur-xl border ${theme === 'dark' ? 'border-white/10' : 'border-white/50'} shadow-lg relative`}
            >
              <FiBell className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`} />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setShowSettings(!showSettings); setShowNotifications(false); }}
              className={`p-3 rounded-2xl ${theme === 'dark' ? 'bg-white/10 hover:bg-white/15' : 'bg-white hover:bg-gray-100'} backdrop-blur-xl border ${theme === 'dark' ? 'border-white/10' : 'border-white/50'} shadow-lg`}
            >
              <FiSettings className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`} />
            </motion.button>
            <Link 
              to="/markets" 
              className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 text-white font-bold shadow-xl hover:shadow-2xl hover:shadow-emerald-500/30 transition-all overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-white/20"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.6 }}
              />
              <FiZap className="relative z-10" />
              <span className="relative z-10">Start Trading</span>
              <motion.span
                initial={{ x: 0 }}
                whileHover={{ x: 5 }}
                className="relative z-10"
              >
                <FiArrowRight className="w-5 h-5" />
              </motion.span>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <DashboardTabNav
            tabs={DASHBOARD_TABS}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            theme={theme}
          />
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' ? (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <NotificationPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} theme={theme} />
              <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} theme={theme} />

              {marketData.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <PriceTicker coins={marketData.slice(0, 8)} />
                </motion.div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {stats.map((stat, i) => (
                  <StatCard key={stat.label} stat={stat} index={i} />
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div 
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className={`lg:col-span-2 rounded-3xl p-6 ${
                    theme === 'dark' 
                      ? 'bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10' 
                      : 'bg-white/90 backdrop-blur-xl border border-white/50 shadow-xl'
                  }`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <motion.div
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                        className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg"
                        style={{ boxShadow: '0 10px 30px -5px rgba(16, 185, 129, 0.4)' }}
                      >
                        <FaChartLine className="w-6 h-6 text-white" />
                      </motion.div>
                      <div>
                        <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          Market Overview
                        </h2>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          Live cryptocurrency prices
                        </p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ rotate: 180, scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ duration: 0.5 }}
                      onClick={fetchData}
                      className={`p-3 rounded-2xl ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'} transition-all`}
                    >
                      <FiRefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''} ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`} />
                    </motion.button>
                  </div>
                  
                  {loading ? (
                    <LoadingSkeleton count={6} />
                  ) : error ? (
                    <ErrorState message={error} onRetry={fetchData} />
                  ) : marketData.length === 0 ? (
                    <EmptyState message="No market data available" />
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {marketData.slice(0, 6).map((coin, i) => (
                        <MarketCard key={coin.id} coin={coin} index={i} />
                      ))}
                    </div>
                  )}
                  
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className={`mt-6 pt-5 ${theme === 'dark' ? 'border-t border-white/10' : 'border-t border-gray-200'}`}
                  >
                    <Link 
                      to="/markets" 
                      className="flex items-center justify-center gap-2 text-emerald-500 font-bold hover:text-emerald-400 transition-colors group"
                    >
                      View All Markets 
                      <motion.span
                        initial={{ x: 0 }}
                        whileHover={{ x: 8 }}
                        className="group-hover:translate-x-1 transition-transform"
                      >
                        <FiChevronRight className="w-5 h-5" />
                      </motion.span>
                    </Link>
                  </motion.div>
                </motion.div>

                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                    className={`rounded-3xl p-6 ${
                      theme === 'dark' 
                        ? 'bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10' 
                        : 'bg-white/90 backdrop-blur-xl border border-white/50 shadow-xl'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                        className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg"
                        style={{ boxShadow: '0 10px 30px -5px rgba(139, 92, 246, 0.4)' }}
                      >
                        <FiZap className="w-6 h-6 text-white" />
                      </motion.div>
                      <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Quick Actions
                      </h2>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {quickActions.map((action, i) => (
                        <QuickAction key={action.label} action={action} index={i} />
                      ))}
                    </div>
                  </motion.div>

                  <PortfolioChart theme={theme} />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RecentActivity recentTransactions={recentTransactions} theme={theme} />
                <SentimentIndicator theme={theme} />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className={`rounded-3xl p-8 ${
                  theme === 'dark' 
                    ? 'bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 backdrop-blur-xl border border-emerald-500/20' 
                    : 'bg-gradient-to-br from-emerald-50 to-cyan-50 border border-emerald-200 shadow-xl'
                }`}
              >
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-xl"
                    style={{ boxShadow: '0 20px 40px -10px rgba(16, 185, 129, 0.4)' }}
                  >
                    <FaRobot className="w-10 h-10 text-white" />
                  </motion.div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      AI Trading Assistant
                    </h3>
                    <p className={`mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      Get personalized trading signals and market analysis powered by advanced AI.
                    </p>
                    <Link
                      to="/ai-chat"
                      className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold hover:shadow-xl hover:shadow-emerald-500/30 transition-all"
                    >
                      Try AI Assistant <FiArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              {activeTab === 'transfer' && (
                <TransferTab theme={theme} onComplete={handleOperationComplete} />
              )}
              {activeTab === 'deposit' && (
                <DepositTab theme={theme} onComplete={handleOperationComplete} depositCoins={depositCoins} />
              )}
              {activeTab === 'swap' && (
                <SwapTab theme={theme} onComplete={handleOperationComplete} />
              )}
              {activeTab === 'withdraw' && (
                <WithdrawTab theme={theme} onComplete={handleOperationComplete} />
              )}
              {activeTab === 'buy' && (
                <BuyTab theme={theme} onComplete={handleOperationComplete} />
              )}
              {activeTab === 'sell' && (
                <SellTab theme={theme} onComplete={handleOperationComplete} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
