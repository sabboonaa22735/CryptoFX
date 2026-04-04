import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiDollarSign, FiArrowUp, FiArrowDown, FiCopy, FiArrowLeft, 
  FiCheck, FiAlertCircle, FiRefreshCw, FiClock, FiHelpCircle,
  FiUpload, FiCheckCircle, FiDownload, FiRepeat, FiShoppingCart, FiShoppingBag,
  FiArrowRight, FiLoader, FiTrendingUp, FiActivity, FiAlertTriangle, FiX
} from 'react-icons/fi'
import { 
  FaBitcoin, FaEthereum, FaWallet, FaCopy as FaCopyIcon, FaCheck, FaTimes, 
  FaExclamationTriangle, FaQuestionCircle, FaQrcode, FaUpload,
  FaImage, FaFileAlt, FaCheckCircle, FaClock, FaSpinner,
  FaInfoCircle, FaChevronRight, FaChevronLeft, FaRedo,
  FaEye, FaEyeSlash, FaCloudUploadAlt, FaTrash, FaDownload,
  FaCog, FaHeadset, FaLock
} from 'react-icons/fa'
import { QRCodeSVG } from 'qrcode.react'
import { api } from '../store/authStore'
import { LoadingSkeleton, ErrorState, EmptyState } from '../components/ui/StatusComponents'
import { useThemeStore } from '../store/themeStore'
import { useTransactionStore } from '../store/transactionStore'

const COIN_CONFIG = {
  BTC: { 
    name: 'Bitcoin', 
    symbol: 'BTC', 
    color: 'from-orange-400 to-yellow-500',
    bgColor: 'bg-orange-500/10',
    textColor: 'text-orange-400',
    borderColor: 'border-orange-500/30',
    icon: '₿',
    network: 'Bitcoin Network',
    fees: '~0.0001 BTC',
    confirmations: '3 confirmations'
  },
  ETH: { 
    name: 'Ethereum', 
    symbol: 'ETH', 
    color: 'from-purple-500 to-blue-500',
    bgColor: 'bg-purple-500/10',
    textColor: 'text-purple-400',
    borderColor: 'border-purple-500/30',
    icon: 'Ξ',
    network: 'Ethereum (ERC-20)',
    fees: '~0.005 ETH',
    confirmations: '12 confirmations'
  },
  USDT: { 
    name: 'Tether', 
    symbol: 'USDT', 
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/10',
    textColor: 'text-green-400',
    borderColor: 'border-green-500/30',
    icon: '₮',
    network: 'TRC-20 / ERC-20',
    fees: '~1 USDT',
    confirmations: '6 confirmations'
  },
  SOL: { 
    name: 'Solana', 
    symbol: 'SOL', 
    color: 'from-purple-400 via-pink-500 to-orange-400',
    bgColor: 'bg-purple-500/10',
    textColor: 'text-purple-400',
    borderColor: 'border-purple-500/30',
    icon: '◎',
    network: 'Solana Network',
    fees: '~0.00025 SOL',
    confirmations: '1 confirmation'
  },
}

const COIN_COLORS = {
  BTC: { color: 'from-orange-500 to-yellow-500', icon: '₿' },
  ETH: { color: 'from-purple-500 to-blue-500', icon: 'Ξ' },
  USDT: { color: 'from-green-500 to-emerald-500', icon: '₮' },
  XRP: { color: 'from-gray-500 to-slate-600', icon: '✕' },
  BNB: { color: 'from-yellow-400 to-amber-500', icon: '◈' },
  SOL: { color: 'from-purple-400 via-pink-500 to-orange-400', icon: '◎' },
  ADA: { color: 'from-blue-500 to-cyan-500', icon: '₳' },
  DOGE: { color: 'from-yellow-300 to-yellow-500', icon: 'Ð' },
  DOT: { color: 'from-pink-500 to-rose-500', icon: '●' },
  AVAX: { color: 'from-red-500 to-red-600', icon: '▲' },
  MATIC: { color: 'from-purple-600 to-indigo-600', icon: '⬡' },
  LINK: { color: 'from-blue-400 to-cyan-400', icon: '⬡' },
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

const DEFAULT_COINS = ['BTC', 'ETH', 'USDT', 'XRP', 'BNB', 'SOL', 'ADA', 'DOGE', 'DOT', 'AVAX', 'MATIC', 'LINK']

export default function Wallet() {
  const { theme } = useThemeStore()
  const { transactions: pendingTransactions, updateTransactionStatus } = useTransactionStore()
  const [wallet, setWallet] = useState({ balance: 0, deposits: 0, withdrawals: 0 })
  const [globalStats, setGlobalStats] = useState({ availableBalance: 0, totalDeposit: 0, totalWithdraw: 0, totalProfit: 0 })
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [selectedCoin, setSelectedCoin] = useState(null)
  const [depositAddresses, setDepositAddresses] = useState({})
  const [copied, setCopied] = useState(false)
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('crypto')
  const [processing, setProcessing] = useState(false)
  const [loadingAddresses, setLoadingAddresses] = useState(false)
  const [addressError, setAddressError] = useState(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState('success')
  const [isExpired, setIsExpired] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [transactionStatus, setTransactionStatus] = useState('pending')
  const [isConfirming, setIsConfirming] = useState(false)
  const [timeLeft, setTimeLeft] = useState({ minutes: 30, seconds: 0 })

  useEffect(() => {
    const timer = setTimeout(fetchData, 500)
    const interval = setInterval(fetchData, 5000)
    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    const handleFocus = () => {
      fetchData()
    }
    const handleTradeExecuted = () => {
      fetchData()
    }
    window.addEventListener('focus', handleFocus)
    window.addEventListener('trade-executed', handleTradeExecuted)
    return () => {
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('trade-executed', handleTradeExecuted)
    }
  }, [])

  useEffect(() => {
    if (showDepositModal && Object.keys(depositAddresses).length === 0) {
      fetchDepositAddresses()
    }
  }, [showDepositModal])

  useEffect(() => {
    if (!showDepositModal || currentStep !== 2) return

    let timerInterval
    const expiresAt = new Date().getTime() + 30 * 60 * 1000
    
    timerInterval = setInterval(() => {
      const now = new Date().getTime()
      const distance = expiresAt - now
      
      if (distance < 0) {
        clearInterval(timerInterval)
        setIsExpired(true)
        setToastMessage('Payment window expired')
        setToastType('error')
        setShowToast(true)
        return
      }

      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)
      setTimeLeft({ minutes, seconds })
    }, 1000)

    return () => clearInterval(timerInterval)
  }, [showDepositModal, currentStep])

  const notify = (message, type = 'success') => {
    setToastMessage(message)
    setToastType(type)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [walletRes, globalStatsRes, transactionsRes] = await Promise.all([
        api.get('/wallet/balance').catch((err) => {
          if (err.response?.status === 401) {
            return { data: { balance: 0, deposits: 0, withdrawals: 0 }, unauthenticated: true }
          }
          return { data: { balance: 0, deposits: 0, withdrawals: 0 } }
        }),
        api.get('/wallet/global-stats').catch(() => ({ data: { availableBalance: 0, totalDeposit: 0, totalWithdraw: 0, totalProfit: 0 } })),
        api.get('/wallet/transactions').catch(() => ({ data: { transactions: [] } }))
      ])
      
      if (walletRes.unauthenticated) {
        setWallet({ balance: 0, deposits: 0, withdrawals: 0 })
        setGlobalStats({ availableBalance: 0, totalDeposit: 0, totalWithdraw: 0, totalProfit: 0 })
        setTransactions([])
        setLoading(false)
        return
      }
      
      console.log('Wallet global-stats response:', globalStatsRes.data);
      setWallet(walletRes.data || { balance: 0, deposits: 0, withdrawals: 0 })
      setGlobalStats(globalStatsRes.data || { availableBalance: 0, totalDeposit: 0, totalWithdraw: 0, totalProfit: 0 })
      setTransactions(transactionsRes.data?.transactions || [])
    } catch (error) {
      console.error('Failed to fetch wallet:', error)
      setError('Failed to load wallet data')
      setWallet({ balance: 0, deposits: 0, withdrawals: 0 })
      setGlobalStats({ availableBalance: 0, totalDeposit: 0, totalWithdraw: 0, totalProfit: 0 })
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  const fetchDepositAddresses = async () => {
    setLoadingAddresses(true)
    setAddressError(null)
    try {
      const res = await api.get('/deposits/deposit-addresses').catch(() => ({ data: [] }))
      const addresses = res.data || []
      const addressMap = {}
      addresses.forEach(addr => {
        addressMap[addr.symbol] = addr
      })
      setDepositAddresses(addressMap)
    } catch (error) {
      console.error('Failed to fetch deposit addresses:', error)
      setAddressError('Failed to load deposit addresses')
    } finally {
      setLoadingAddresses(false)
    }
  }

  const handleWithdraw = async (e) => {
    e.preventDefault()
    setProcessing(true)
    try {
      await api.post('/wallet/withdraw', { amount: parseFloat(amount), method })
      fetchData()
      setShowWithdrawModal(false)
      setAmount('')
    } catch (error) {
      console.error('Withdraw failed:', error)
      alert(error.response?.data?.message || 'Withdrawal failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const copyAddress = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const openCoinDeposit = (coinSymbol) => {
    const config = COIN_CONFIG[coinSymbol] || { color: 'from-gray-500 to-gray-600', icon: coinSymbol[0], name: coinSymbol }
    const addressData = depositAddresses[coinSymbol] || {}
    setSelectedCoin({
      symbol: coinSymbol,
      ...config,
      ...addressData
    })
    setCurrentStep(2)
    setIsExpired(false)
    setUploadedFile(null)
  }

  const handleFileUpload = (file) => {
    setUploadedFile(file)
    notify('Screenshot uploaded successfully')
  }

  const handleConfirm = async () => {
    if (!uploadedFile) {
      notify('Please upload proof of payment', 'error')
      return
    }

    if (!amount || parseFloat(amount) < 10) {
      notify('Minimum deposit is $10', 'error')
      return
    }

    setIsConfirming(true)
    try {
      await api.post('/deposits', {
        amount: parseFloat(amount),
        coin: selectedCoin?.symbol,
        address: selectedCoin?.address,
        proofImage: uploadedFile?.name
      })
      notify('Deposit submitted successfully! Waiting for admin approval.')
      setTransactionStatus('pending')
    } catch (error) {
      notify('Failed to submit deposit. Please try again.', 'error')
    } finally {
      setIsConfirming(false)
    }
  }

  const resetDeposit = () => {
    setCurrentStep(1)
    setSelectedCoin(null)
    setIsExpired(false)
    setUploadedFile(null)
    setTransactionStatus('pending')
  }

  const getCoinList = () => {
    const activeCoins = Object.keys(depositAddresses).filter(symbol => depositAddresses[symbol]?.isActive)
    if (activeCoins.length > 0) {
      return activeCoins.sort((a, b) => {
        const indexA = DEFAULT_COINS.indexOf(a)
        const indexB = DEFAULT_COINS.indexOf(b)
        if (indexA === -1 && indexB === -1) return a.localeCompare(b)
        if (indexA === -1) return 1
        if (indexB === -1) return -1
        return indexA - indexB
      })
    }
    return DEFAULT_COINS
  }

  const stats = [
    { label: 'Available Balance', value: `$${((globalStats?.availableBalance || wallet?.balance) || 0).toLocaleString()}`, icon: FiDollarSign, color: 'primary' },
    { label: 'Total Deposits', value: `$${((globalStats?.totalDeposit || wallet?.deposits) || 0).toLocaleString()}`, icon: FiArrowDown, color: 'emerald' },
    { label: 'Total Withdrawals', value: `$${((globalStats?.totalWithdraw || wallet?.withdrawals) || 0).toLocaleString()}`, icon: FiArrowUp, color: 'red' },
    { label: 'Total Profit', value: `$${((globalStats?.totalProfit || 0) || 0).toLocaleString()}`, icon: FiTrendingUp, color: 'amber' },
  ]

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-dark-950' : 'bg-gray-50'}`}>
      <div className="relative">
        <div className={`absolute inset-0 h-72 ${
          theme === 'dark' 
            ? 'bg-gradient-to-br from-yellow-500/10 via-amber-500/5 to-transparent' 
            : 'bg-gradient-to-br from-yellow-500/20 via-amber-100/10 to-transparent'
        }`} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-yellow-500/5 blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-12 h-12 rounded-2xl ${
                    theme === 'dark' 
                      ? 'bg-gradient-to-br from-yellow-500 to-amber-500' 
                      : 'bg-gradient-to-br from-yellow-400 to-amber-500'
                  } flex items-center justify-center shadow-lg shadow-yellow-500/30`}>
                    <FaWallet className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      My Wallet
                    </h1>
                    <p className={`text-sm ${theme === 'dark' ? 'text-white/50' : 'text-gray-500'}`}>
                      Manage your funds & assets
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => { console.log('Manual refresh clicked'); fetchData(); }}
                className={`p-3 rounded-2xl transition-all ${
                  theme === 'dark' 
                    ? 'bg-white/10 hover:bg-white/20 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                title="Refresh data"
              >
                <FiRefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>

            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative overflow-hidden rounded-3xl p-6 ${
                  theme === 'dark'
                    ? 'bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/10'
                    : 'bg-white border border-gray-100 shadow-xl shadow-gray-200/30'
                }`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br from-yellow-500/10 to-transparent blur-2xl" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white/60' : 'text-gray-500'}`}>
                      {stat.label}
                    </span>
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                      stat.color === 'primary' 
                        ? 'bg-gradient-to-br from-yellow-500 to-amber-500 shadow-lg shadow-yellow-500/30'
                        : stat.color === 'emerald'
                          ? 'bg-gradient-to-br from-emerald-500 to-green-500 shadow-lg shadow-emerald-500/30'
                          : 'bg-gradient-to-br from-red-500 to-rose-500 shadow-lg shadow-red-500/30'
                    }`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <p className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {stat.value}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`lg:col-span-2 rounded-3xl overflow-hidden ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-white/5 to-white/5 backdrop-blur-xl border border-white/10'
                  : 'bg-white border border-gray-100 shadow-xl'
              }`}
            >
              <div className={`p-6 ${theme === 'dark' ? 'border-b border-white/10' : 'border-b border-gray-100'}`}>
                <div className="flex items-center justify-between">
                  <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Recent Transactions
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-yellow-400 hover:text-yellow-300' : 'text-amber-600 hover:text-amber-500'
                    }`}
                  >
                    View All
                  </motion.button>
                </div>
              </div>
              <div className="p-6">
                {loading ? (
                  <LoadingSkeleton count={5} />
                ) : error ? (
                  <ErrorState message={error} onRetry={fetchData} />
                ) : transactions.length === 0 && pendingTransactions.length === 0 ? (
                  <div className={`text-center py-12 ${theme === 'dark' ? 'text-white/40' : 'text-gray-400'}`}>
                    <FiDollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">No transactions yet</p>
                    <p className="text-sm mt-1">Start by making a deposit</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingTransactions.length > 0 && (
                      <>
                        <div className={`flex items-center gap-2 mb-3 ${
                          theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
                        }`}>
                          <FiLoader className="w-4 h-4 animate-spin" />
                          <span className="text-sm font-medium">Pending Transactions</span>
                        </div>
                        {pendingTransactions.map((tx, index) => (
                          <motion.div
                            key={tx._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`flex items-center justify-between p-4 rounded-2xl transition-all border border-yellow-500/20 ${
                              theme === 'dark'
                                ? 'bg-yellow-500/5 hover:bg-yellow-500/10'
                                : 'bg-yellow-50 hover:bg-yellow-100'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                tx.type === 'deposit' 
                                  ? 'bg-gradient-to-br from-yellow-500/20 to-amber-500/20' 
                                  : tx.type === 'withdrawal' 
                                    ? 'bg-gradient-to-br from-red-500/20 to-rose-500/20' 
                                    : 'bg-gradient-to-br from-yellow-500/20 to-amber-500/20'
                              }`}>
                                {tx.type === 'deposit' ? (
                                  <FiArrowDown className="w-5 h-5 text-yellow-400" />
                                ) : tx.type === 'withdrawal' ? (
                                  <FiArrowUp className="w-5 h-5 text-red-400" />
                                ) : (
                                  <FiDollarSign className="w-5 h-5 text-yellow-400" />
                                )}
                              </div>
                              <div>
                                <p className={`font-semibold capitalize ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  {tx.type}
                                </p>
                                <p className={`text-sm ${theme === 'dark' ? 'text-white/50' : 'text-gray-500'}`}>
                                  {tx.method || tx.type} • {new Date(tx.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-bold text-lg ${
                                tx.type === 'deposit' ? 'text-yellow-400' : theme === 'dark' ? 'text-white' : 'text-gray-900'
                              }`}>
                                {tx.type === 'deposit' ? '+' : '-'}{tx.amount} {tx.symbol}
                              </p>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                tx.status === 'completed'
                                  ? theme === 'dark' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
                                  : tx.status === 'pending'
                                    ? theme === 'dark' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-600'
                                    : theme === 'dark' ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'
                              }`}>
                                {tx.status === 'pending' && <FiLoader className="w-3 h-3 animate-spin" />}
                                {tx.status || 'pending'}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </>
                    )}
                    {transactions.map((tx, index) => (
                      <motion.div
                        key={tx._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex items-center justify-between p-4 rounded-2xl transition-all ${
                          theme === 'dark'
                            ? 'bg-white/5 hover:bg-white/10'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                            tx.type === 'deposit' 
                              ? 'bg-gradient-to-br from-emerald-500/20 to-green-500/20' 
                              : tx.type === 'withdrawal' 
                                ? 'bg-gradient-to-br from-red-500/20 to-rose-500/20' 
                                : 'bg-gradient-to-br from-yellow-500/20 to-amber-500/20'
                          }`}>
                            {tx.type === 'deposit' ? (
                              <FiArrowDown className="w-5 h-5 text-emerald-400" />
                            ) : tx.type === 'withdrawal' ? (
                              <FiArrowUp className="w-5 h-5 text-red-400" />
                            ) : (
                              <FiDollarSign className="w-5 h-5 text-yellow-400" />
                            )}
                          </div>
                          <div>
                            <p className={`font-semibold capitalize ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {tx.type}
                            </p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-white/50' : 'text-gray-500'}`}>
                              {tx.method || tx.type} • {new Date(tx.createdAt || Date.now()).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold text-lg ${
                            tx.type === 'deposit' ? 'text-emerald-400' : theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toFixed(2)}
                          </p>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            tx.status === 'completed'
                              ? theme === 'dark' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
                              : tx.status === 'pending'
                                ? theme === 'dark' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-600'
                                : theme === 'dark' ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'
                          }`}>
                            {tx.status || 'pending'}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className={`rounded-3xl overflow-hidden ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-white/5 to-white/5 backdrop-blur-xl border border-white/10'
                  : 'bg-white border border-gray-100 shadow-xl'
              }`}
            >
              <div className={`p-6 ${theme === 'dark' ? 'border-b border-white/10' : 'border-b border-gray-100'}`}>
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Quick Actions
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { icon: FiDownload, label: 'Buy Crypto', desc: 'Instant purchase', color: 'from-emerald-500 to-green-500', bg: 'bg-emerald-500/10' },
                  { icon: FiUpload, label: 'Send Crypto', desc: 'Transfer funds', color: 'from-blue-500 to-indigo-500', bg: 'bg-blue-500/10' },
                  { icon: FiRepeat, label: 'Swap Assets', desc: 'Exchange coins', color: 'from-purple-500 to-pink-500', bg: 'bg-purple-500/10' },
                  { icon: FiShoppingCart, label: 'Sell Crypto', desc: 'Convert to cash', color: 'from-orange-500 to-amber-500', bg: 'bg-orange-500/10' },
                ].map((action, i) => (
                  <motion.button
                    key={action.label}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                      theme === 'dark'
                        ? 'bg-white/5 hover:bg-white/10 border border-white/5'
                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-100'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg`}>
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left flex-1">
                      <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {action.label}
                      </p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-white/50' : 'text-gray-500'}`}>
                        {action.desc}
                      </p>
                    </div>
                    <FiArrowRight className={`w-5 h-5 ${theme === 'dark' ? 'text-white/30' : 'text-gray-400'}`} />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`rounded-3xl overflow-hidden ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-white/5 to-white/5 backdrop-blur-xl border border-white/10'
                : 'bg-white border border-gray-100 shadow-xl'
            }`}
          >
            <div className={`p-6 ${theme === 'dark' ? 'border-b border-white/10' : 'border-b border-gray-100'}`}>
              <div className="flex items-center justify-between">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Crypto Assets
                </h2>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
                  theme === 'dark' ? 'bg-white/5' : 'bg-gray-100'
                }`}>
                  <FaBitcoin className={`w-5 h-5 ${theme === 'dark' ? 'text-yellow-400' : 'text-amber-500'}`} />
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {getCoinList().length} Assets
                  </span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {getCoinList().slice(0, 6).map((coinSymbol, i) => {
                  const config = COIN_CONFIG[coinSymbol] || { color: 'from-gray-500 to-gray-600', icon: coinSymbol[0], name: coinSymbol }
                  const hasAddress = !!depositAddresses[coinSymbol]
                  return (
                    <motion.div
                      key={coinSymbol}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + i * 0.05 }}
                      className={`relative p-4 rounded-2xl text-center cursor-pointer transition-all ${
                        theme === 'dark'
                          ? 'bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10'
                          : 'bg-gray-50 hover:bg-gray-100 border border-gray-100'
                      }`}
                    >
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${config.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                        className={`w-14 h-14 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center text-white text-xl font-bold shadow-lg mx-auto mb-3`}
                      >
                        {config.icon}
                      </motion.div>
                      <p className={`font-semibold text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {coinSymbol}
                      </p>
                      <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-white/50' : 'text-gray-500'}`}>
                        {hasAddress ? 'Available' : 'Soon'}
                      </p>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showDepositModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4 ${
              theme === 'dark' ? 'bg-black/70' : 'bg-black/50'
            }`}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl ${
                theme === 'dark'
                  ? 'bg-gray-900/95 backdrop-blur-xl border border-white/10'
                  : 'bg-white border border-gray-200 shadow-xl'
              }`}
            >
              <AnimatePresence mode="wait">
                {currentStep === 1 ? (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="p-6"
                  >
                    <div className={`p-6 ${
                      theme === 'dark'
                        ? 'bg-gradient-to-r from-yellow-500/10 to-amber-500/5 border-b border-white/5'
                        : 'bg-gradient-to-r from-yellow-50 to-amber-50 border-b border-gray-100'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            Deposit Crypto
                          </h2>
                          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-white/60' : 'text-gray-500'}`}>
                            Select cryptocurrency to deposit
                          </p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => { setShowDepositModal(false); resetDeposit(); }}
                          className={`p-2 rounded-xl ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                        >
                          <FaTimes className={`w-6 h-6 ${theme === 'dark' ? 'text-white/60' : 'text-gray-500'}`} />
                        </motion.button>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {['BTC', 'ETH', 'USDT', 'SOL'].map((coin) => (
                          <motion.button
                            key={coin}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => openCoinDeposit(coin)}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              theme === 'dark'
                                ? 'border-white/10 bg-white/5 hover:border-primary/50 hover:bg-white/10'
                                : 'border-gray-200 bg-gray-50 hover:border-primary/50'
                            }`}
                          >
                            <div className={`w-12 h-12 mx-auto rounded-full bg-gradient-to-br ${COIN_CONFIG[coin]?.color || 'from-gray-500 to-gray-600'} flex items-center justify-center text-white text-xl font-bold mb-2`}>
                              {COIN_CONFIG[coin]?.icon || coin[0]}
                            </div>
                            <p className={`font-semibold text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{coin}</p>
                            <p className={`text-xs text-center mt-1 ${theme === 'dark' ? 'text-white/50' : 'text-gray-500'}`}>{COIN_CONFIG[coin]?.name || coin}</p>
                          </motion.button>
                        ))}
                      </div>
                      <p className={`text-sm text-center ${theme === 'dark' ? 'text-white/40' : 'text-gray-400'}`}>
                        Minimum deposit: $10.00
                      </p>
                    </div>
                  </motion.div>
                ) : currentStep === 2 ? (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-6"
                  >
                    <div className={`p-4 rounded-xl mb-4 ${
                      theme === 'dark' ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-yellow-50 border border-yellow-200'
                    }`}>
                      <p className={`text-sm ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-700'}`}>
                        Send the exact amount to complete your deposit
                      </p>
                    </div>
                    {selectedCoin?.address && (
                      <div className={`p-4 rounded-xl mb-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'}`}>
                        <p className={`text-xs mb-2 ${theme === 'dark' ? 'text-white/50' : 'text-gray-500'}`}>Network Address</p>
                        <div className="flex items-center gap-2">
                          <p className={`font-mono text-sm flex-1 break-all ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {selectedCoin.address}
                          </p>
                          <CopyButton text={selectedCoin.address} theme={theme} />
                        </div>
                      </div>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setShowDepositModal(false); resetDeposit(); }}
                      className={`w-full py-3 rounded-xl font-semibold ${
                        theme === 'dark'
                          ? 'bg-white/10 hover:bg-white/15 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                      }`}
                    >
                      Done
                    </motion.button>
                  </motion.div>
                ) : null}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </div>
  )
}
