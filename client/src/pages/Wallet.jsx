import { useState, useEffect, useMemo, useCallback } from 'react'
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
import { api, useAuthStore } from '../store/authStore'
import { LoadingSkeleton, ErrorState, EmptyState } from '../components/ui/StatusComponents'
import { useThemeStore } from '../store/themeStore'
import { useAdminUpdates } from '../hooks/useAdminUpdates'

const COIN_CONFIG = {
  BTC: { name: 'Bitcoin', symbol: 'BTC', color: 'from-orange-400 to-yellow-500', bgColor: 'bg-orange-500/10', textColor: 'text-orange-400', borderColor: 'border-orange-500/30', icon: '₿', network: 'Bitcoin Network', fees: '~0.0001 BTC', confirmations: '3 confirmations' },
  ETH: { name: 'Ethereum', symbol: 'ETH', color: 'from-purple-500 to-blue-500', bgColor: 'bg-purple-500/10', textColor: 'text-purple-400', borderColor: 'border-purple-500/30', icon: 'Ξ', network: 'Ethereum (ERC-20)', fees: '~0.005 ETH', confirmations: '12 confirmations' },
  USDT: { name: 'Tether', symbol: 'USDT', color: 'from-green-500 to-emerald-500', bgColor: 'bg-green-500/10', textColor: 'text-green-400', borderColor: 'border-green-500/30', icon: '₮', network: 'TRC-20 / ERC-20', fees: '~1 USDT', confirmations: '6 confirmations' },
  SOL: { name: 'Solana', symbol: 'SOL', color: 'from-purple-400 via-pink-500 to-orange-400', bgColor: 'bg-purple-500/10', textColor: 'text-purple-400', borderColor: 'border-purple-500/30', icon: '◎', network: 'Solana Network', fees: '~0.00025 SOL', confirmations: '1 confirmation' },
  XRP: { name: 'XRP', symbol: 'XRP', color: 'from-gray-500 to-slate-600', bgColor: 'bg-gray-500/10', textColor: 'text-gray-400', borderColor: 'border-gray-500/30', icon: '✕', network: 'XRP Network', fees: '~0.01 XRP', confirmations: '1 confirmation' },
  BNB: { name: 'BNB', symbol: 'BNB', color: 'from-yellow-400 to-amber-500', bgColor: 'bg-yellow-500/10', textColor: 'text-yellow-400', borderColor: 'border-yellow-500/30', icon: '◈', network: 'BNB Chain', fees: '~0.001 BNB', confirmations: '1 confirmation' },
  ADA: { name: 'Cardano', symbol: 'ADA', color: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-500/10', textColor: 'text-blue-400', borderColor: 'border-blue-500/30', icon: '₳', network: 'Cardano', fees: '~0.2 ADA', confirmations: '1 confirmation' },
  DOGE: { name: 'Dogecoin', symbol: 'DOGE', color: 'from-yellow-300 to-yellow-500', bgColor: 'bg-yellow-500/10', textColor: 'text-yellow-400', borderColor: 'border-yellow-500/30', icon: 'Ð', network: 'Dogecoin', fees: '~1 DOGE', confirmations: '1 confirmation' },
}

const DEFAULT_COINS = ['BTC', 'ETH', 'USDT', 'XRP', 'BNB', 'SOL', 'ADA', 'DOGE']

const CopyButton = ({ text, onCopy }) => {
  const [copied, setCopied] = useState(false)
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      if (onCopy) onCopy()
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }
  
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleCopy}
      className="p-2 rounded-lg hover:bg-white/10 transition-colors"
    >
      {copied ? (
        <FaCheck className="w-4 h-4 text-green-500" />
      ) : (
        <FaCopyIcon className="w-4 h-4 text-gray-400 hover:text-white" />
      )}
    </motion.button>
  )
}

export default function Wallet() {
  const { theme } = useThemeStore()
  const { user, refreshWallet } = useAuthStore()
  
  const [walletData, setWalletData] = useState({
    balance: 0,
    totalDeposit: 0,
    totalWithdraw: 0,
    totalProfit: 0
  })
  const [transactions, setTransactions] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [selectedCoin, setSelectedCoin] = useState(null)
  const [depositAddresses, setDepositAddresses] = useState({})
  const [depositSettings, setDepositSettings] = useState(null)
  const [depositModalLoading, setDepositModalLoading] = useState(false)
  
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawAddress, setWithdrawAddress] = useState('')
  const [withdrawLoading, setWithdrawLoading] = useState(false)
  
  const [depositAmount, setDepositAmount] = useState('')
  const [depositProof, setDepositProof] = useState(null)
  const [depositLoading, setDepositLoading] = useState(false)
  
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState('success')
  
  const [currentStep, setCurrentStep] = useState(1)

  const fetchWalletData = useCallback(async () => {
    console.log('Fetching wallet data...')
    
    try {
      console.log('Fetching user data...')
      const userRes = await api.get('/users/me')
      const userData = userRes.data
      console.log('User response:', userData)
      console.log('User wallet from API:', userData.wallet)
      console.log('User walletStats from API:', userData.walletStats)
      
      const userBalance = userData.wallet?.balance ?? 0
      const userDeposits = userData.walletStats?.totalDeposit ?? userData.wallet?.deposits ?? 0
      const userWithdrawals = userData.walletStats?.totalWithdraw ?? userData.wallet?.withdrawals ?? 0
      const userProfit = userData.walletStats?.totalProfit ?? 0
      
      console.log('Computed from user data:', { balance: userBalance, deposits: userDeposits, withdrawals: userWithdrawals, profit: userProfit })
      
      console.log('Fetching transactions...')
      const transactionsRes = await api.get('/wallet/transactions')
      console.log('Transactions response:', transactionsRes.data)
      
      console.log('Fetching history...')
      const historyRes = await api.get('/wallet/history')
      console.log('History response:', historyRes.data)

      const newTransactions = transactionsRes.data?.transactions || []
      setTransactions(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(newTransactions)) {
          return newTransactions
        }
        return prev
      })

      const newHistory = historyRes.data?.history || []
      setHistory(newHistory)

      setWalletData({
        balance: userBalance,
        totalDeposit: userDeposits,
        totalWithdraw: userWithdrawals,
        totalProfit: userProfit
      })

      refreshWallet()
      setLoading(false)
    } catch (err) {
      console.error('Failed to fetch wallet data:', err)
      setLoading(false)
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.')
      }
    }
}, [refreshWallet])

  useEffect(() => {
    fetchWalletData()
  }, [fetchWalletData])

  useEffect(() => {
    const interval = setInterval(() => {
      fetchWalletData()
    }, 60000)
    
    return () => clearInterval(interval)
  }, [fetchWalletData])

  useAdminUpdates({
    enabled: true,
    specificEvents: [
      'deposit_approved', 
      'deposit_rejected', 
      'transaction_updated', 
      'transaction_approved', 
      'transaction_rejected',
      'user_updated',
      'wallet_stats_updated',
      'wallet_updated',
      'global_wallet_stats_updated',
      'trade_updated',
      'trade_created',
      'trade_deleted'
    ],
    onUpdate: () => {
      fetchWalletData()
    }
  })

  const displayTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0)
      const dateB = new Date(b.createdAt || 0)
      return dateB - dateA
    })
  }, [transactions])

  const displayHistory = useMemo(() => {
    return [...history].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0)
      const dateB = new Date(b.createdAt || 0)
      return dateB - dateA
    })
  }, [history])

  const fetchDepositData = useCallback(async () => {
    setDepositModalLoading(true)
    try {
      const [addressesRes, settingsRes] = await Promise.all([
        api.get('/deposits/deposit-addresses'),
        api.get('/deposits/settings')
      ])
      
      const addresses = addressesRes.data || []
      const addressMap = {}
      addresses.forEach(addr => {
        addressMap[addr.symbol] = addr
      })
      setDepositAddresses(addressMap)
      setDepositSettings(settingsRes.data || null)
    } catch (err) {
      console.error('Failed to fetch deposit data:', err)
    } finally {
      setDepositModalLoading(false)
    }
  }, [])

  useEffect(() => {
    if (showDepositModal) {
      fetchDepositData()
    }
  }, [showDepositModal, fetchDepositData])

  const notify = useCallback((message, type = 'success') => {
    setToastMessage(message)
    setToastType(type)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 4000)
  }, [])

  const handleWithdraw = async (e) => {
    e.preventDefault()
    
    const amount = parseFloat(withdrawAmount)
    if (!amount || amount <= 0) {
      notify('Please enter a valid amount', 'error')
      return
    }
    
    if (amount > walletData.balance) {
      notify('Insufficient balance', 'error')
      return
    }
    
    setWithdrawLoading(true)
    try {
      await api.post('/wallet/withdraw', {
        amount,
        method: 'crypto',
        walletAddress: withdrawAddress
      })
      
      notify('Withdrawal request submitted successfully!', 'success')
      setShowWithdrawModal(false)
      setWithdrawAmount('')
      setWithdrawAddress('')
      fetchWalletData()
    } catch (err) {
      notify(err.response?.data?.message || 'Withdrawal failed', 'error')
    } finally {
      setWithdrawLoading(false)
    }
  }

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount)
    
    if (!amount || amount < 10) {
      notify('Minimum deposit is $10', 'error')
      return
    }
    
    if (!selectedCoin) {
      notify('Please select a coin', 'error')
      return
    }
    
    setDepositLoading(true)
    try {
      await api.post('/deposits', {
        amount,
        coin: selectedCoin.symbol,
        address: selectedCoin.address
      })
      
      notify('Deposit submitted! Awaiting admin approval.', 'success')
      setShowDepositModal(false)
      setCurrentStep(1)
      setSelectedCoin(null)
      setDepositAmount('')
      setDepositProof(null)
      fetchWalletData()
    } catch (err) {
      notify(err.response?.data?.message || 'Deposit failed', 'error')
    } finally {
      setDepositLoading(false)
    }
  }

  const openCoinDeposit = (coinSymbol) => {
    const config = COIN_CONFIG[coinSymbol] || { 
      color: 'from-gray-500 to-gray-600', 
      icon: coinSymbol[0], 
      name: coinSymbol 
    }
    const addressData = depositAddresses[coinSymbol] || {}
    
    setSelectedCoin({
      symbol: coinSymbol,
      ...config,
      ...addressData
    })
    setCurrentStep(2)
  }

  const closeDepositModal = () => {
    setShowDepositModal(false)
    setCurrentStep(1)
    setSelectedCoin(null)
    setDepositAmount('')
    setDepositProof(null)
  }

  const getCoinList = () => {
    const activeCoins = Object.keys(depositAddresses).filter(
      symbol => depositAddresses[symbol]?.isActive
    )
    return activeCoins.length > 0 ? activeCoins : DEFAULT_COINS
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value || 0)
  }

  const stats = [
    { label: 'Available Balance', value: formatCurrency(walletData.balance), icon: FiDollarSign, color: 'primary' },
    { label: 'Total Deposits', value: formatCurrency(walletData.totalDeposit), icon: FiArrowDown, color: 'emerald' },
    { label: 'Total Withdrawals', value: formatCurrency(walletData.totalWithdraw), icon: FiArrowUp, color: 'red' },
    { label: 'Total Profit', value: formatCurrency(walletData.totalProfit), icon: FiTrendingUp, color: walletData.totalProfit >= 0 ? 'amber' : 'red' },
  ]

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              My Wallet
            </h1>
            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Manage your funds and assets
            </p>
          </div>
          <button
            onClick={fetchWalletData}
            className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'} shadow-sm`}
          >
            <FiRefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''} ${theme === 'dark' ? 'text-white' : 'text-gray-600'}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`rounded-2xl p-6 ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} shadow-sm`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {stat.label}
                </span>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  stat.color === 'primary' ? 'bg-yellow-500/20 text-yellow-500' :
                  stat.color === 'emerald' ? 'bg-green-500/20 text-green-500' :
                  stat.color === 'red' ? 'bg-red-500/20 text-red-500' :
                  'bg-amber-500/20 text-amber-500'
                }`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className={`lg:col-span-2 rounded-2xl ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Recent Transactions & Trades
                </h2>
              </div>
            </div>
            <div className="p-6">
              {loading ? (
                <LoadingSkeleton count={3} />
              ) : error ? (
                <ErrorState message={error} onRetry={fetchWalletData} />
              ) : displayHistory.length === 0 ? (
                <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <FiDollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No transactions yet</p>
                  <p className="text-sm mt-1">Make a deposit or trade to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {displayHistory.slice(0, 15).map((item) => {
                    const isTransaction = item.source === 'transaction'
                    const isDeposit = isTransaction && item.type === 'deposit'
                    const isWithdrawal = isTransaction && item.type === 'withdrawal'
                    const isTrade = item.source === 'trade'
                    const isProfit = isTrade && item.profit > 0
                    const isLoss = isTrade && item.profit < 0
                    const isPending = item.status === 'pending'
                    
                    return (
                      <div
                        key={item._id}
                        className={`flex items-center justify-between p-4 rounded-xl ${
                          isPending 
                            ? theme === 'dark' ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-yellow-50 border border-yellow-200'
                            : isProfit
                              ? theme === 'dark' ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50 border border-green-200'
                              : isLoss
                                ? theme === 'dark' ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'
                                : isDeposit
                                  ? theme === 'dark' ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50 border border-green-200'
                                  : theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            isTrade 
                              ? isProfit ? 'bg-green-500/20' : isLoss ? 'bg-red-500/20' : 'bg-blue-500/20'
                              : isDeposit 
                                ? isPending ? 'bg-yellow-500/20' : 'bg-green-500/20'
                                : 'bg-red-500/20'
                          }`}>
                            {isTrade ? (
                              isProfit 
                                ? <FiTrendingUp className="w-5 h-5 text-green-500" />
                                : isLoss 
                                  ? <FiTrendingDown className="w-5 h-5 text-red-500" />
                                  : <FaExchangeAlt className="w-5 h-5 text-blue-500" />
                            ) : isDeposit ? (
                              <FiArrowDown className={`w-5 h-5 ${isPending ? 'text-yellow-500' : 'text-green-500'}`} />
                            ) : (
                              <FiArrowUp className="w-5 h-5 text-red-500" />
                            )}
                          </div>
                          <div>
                            <p className={`font-medium capitalize ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {isTransaction ? item.type : `Trade ${item.symbol} (${item.tradeType})`}
                            </p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {new Date(item.createdAt).toLocaleDateString()}
                              {isTrade && ` • ${item.returnPercent?.toFixed(2)}%`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${
                            isProfit 
                              ? 'text-green-500'
                              : isLoss
                                ? 'text-red-500'
                                : isDeposit
                                  ? isPending ? 'text-yellow-500' : 'text-green-500'
                                  : theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {isTrade 
                              ? (isProfit ? '+' : '') + formatCurrency(item.profit || 0)
                              : (isDeposit ? '+' : '-') + formatCurrency(item.amount)
                            }
                          </p>
                          {isTrade && (
                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                              isProfit
                                ? theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'
                                : isLoss
                                  ? theme === 'dark' ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'
                                  : theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
                            }`}>
                              {isProfit ? 'Profit' : isLoss ? 'Loss' : 'Trade'}
                            </span>
                          )}
                          {isTransaction && (
                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                              item.status === 'completed'
                                ? theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'
                                : item.status === 'pending'
                                  ? theme === 'dark' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-600'
                                  : theme === 'dark' ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'
                            }`}>
                              {item.status}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className={`rounded-2xl ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Quick Actions
              </h2>
            </div>
            <div className="p-6 space-y-3">
              <button
                onClick={() => setShowDepositModal(true)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl transition ${
                  theme === 'dark' ? 'bg-green-500/10 hover:bg-green-500/20 border border-green-500/20' : 'bg-green-50 hover:bg-green-100 border border-green-200'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <FiDownload className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Deposit</p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Add funds</p>
                </div>
              </button>

              <button
                onClick={() => setShowWithdrawModal(true)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl transition ${
                  theme === 'dark' ? 'bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20' : 'bg-blue-50 hover:bg-blue-100 border border-blue-200'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                  <FiUpload className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Withdraw</p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Send funds</p>
                </div>
              </button>

              <button
                className={`w-full flex items-center gap-4 p-4 rounded-xl transition ${
                  theme === 'dark' ? 'bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20' : 'bg-purple-50 hover:bg-purple-100 border border-purple-200'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <FiRepeat className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Swap</p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Exchange assets</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className={`rounded-2xl ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Crypto Assets
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
              {getCoinList().map((symbol) => {
                const config = COIN_CONFIG[symbol] || { color: 'from-gray-500 to-gray-600', icon: symbol[0], name: symbol }
                const hasAddress = !!depositAddresses[symbol]
                
                return (
                  <div
                    key={symbol}
                    onClick={() => openCoinDeposit(symbol)}
                    className={`p-4 rounded-xl text-center cursor-pointer transition ${
                      theme === 'dark' ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center text-white text-xl font-bold mx-auto mb-2`}>
                      {config.icon}
                    </div>
                    <p className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{symbol}</p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {hasAddress ? 'Active' : 'Soon'}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-lg z-50 ${
              toastType === 'success' 
                ? theme === 'dark' ? 'bg-green-500 text-white' : 'bg-green-500 text-white'
                : toastType === 'error'
                  ? theme === 'dark' ? 'bg-red-500 text-white' : 'bg-red-500 text-white'
                  : theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-800 text-white'
            }`}
          >
            <p className="font-medium">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDepositModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${theme === 'dark' ? 'bg-black/70' : 'bg-black/50'}`}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-md rounded-2xl ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} shadow-2xl`}
            >
              <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {currentStep === 1 ? 'Select Cryptocurrency' : 'Deposit Details'}
                  </h3>
                  <button onClick={closeDepositModal} className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                    <FaTimes className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {depositModalLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <FiLoader className="w-8 h-8 animate-spin text-yellow-500" />
                    <span className="ml-3 text-gray-400">Loading...</span>
                  </div>
                ) : currentStep === 1 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {getCoinList().map((symbol) => {
                      const config = COIN_CONFIG[symbol] || { color: 'from-gray-500 to-gray-600', icon: symbol[0] }
                      return (
                        <button
                          key={symbol}
                          onClick={() => openCoinDeposit(symbol)}
                          className={`p-4 rounded-xl border transition ${
                            theme === 'dark' 
                              ? 'border-gray-600 hover:border-yellow-500 bg-gray-700/50' 
                              : 'border-gray-300 hover:border-yellow-500 bg-gray-50'
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center text-white text-xl font-bold mx-auto mb-2`}>
                            {config.icon}
                          </div>
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{symbol}</p>
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${selectedCoin?.color || 'from-gray-500 to-gray-600'} flex items-center justify-center text-white text-lg font-bold`}>
                          {selectedCoin?.icon || '?'}
                        </div>
                        <div>
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedCoin?.symbol}</p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{selectedCoin?.network}</p>
                        </div>
                      </div>
                      
                      {selectedCoin?.address ? (
                        <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-600/50' : 'bg-white'}`}>
                          <p className={`text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Deposit Address</p>
                          <div className="flex items-center gap-2">
                            <p className={`font-mono text-sm flex-1 break-all ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {selectedCoin.address}
                            </p>
                            <CopyButton text={selectedCoin.address} />
                          </div>
                        </div>
                      ) : (
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          Address not available. Please contact support.
                        </p>
                      )}
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Amount (USD)
                      </label>
                      <input
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="Enter amount"
                        min="10"
                        className={`w-full px-4 py-3 rounded-xl border ${
                          theme === 'dark' 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                        } outline-none focus:border-yellow-500`}
                      />
                      <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Minimum deposit: $10
                      </p>
                    </div>

                    {selectedCoin?.address && depositAmount && parseFloat(depositAmount) >= 10 && (
                      <div className="flex justify-center">
                        <QRCodeSVG 
                          value={selectedCoin.address} 
                          size={150}
                          bgColor="transparent"
                          fgColor={theme === 'dark' ? '#ffffff' : '#000000'}
                        />
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => setCurrentStep(1)}
                        className={`flex-1 py-3 rounded-xl font-medium ${
                          theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                        }`}
                      >
                        Back
                      </button>
                      <button
                        onClick={handleDeposit}
                        disabled={!depositAmount || parseFloat(depositAmount) < 10 || depositLoading}
                        className={`flex-1 py-3 rounded-xl font-medium ${
                          depositAmount && parseFloat(depositAmount) >= 10
                            ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                            : theme === 'dark' ? 'bg-gray-600 text-gray-400' : 'bg-gray-300 text-gray-500'
                        } disabled:opacity-50`}
                      >
                        {depositLoading ? 'Processing...' : 'Submit Deposit'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showWithdrawModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${theme === 'dark' ? 'bg-black/70' : 'bg-black/50'}`}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-md rounded-2xl ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} shadow-2xl`}
            >
              <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Withdraw Funds
                  </h3>
                  <button 
                    onClick={() => { setShowWithdrawModal(false); setWithdrawAmount(''); setWithdrawAddress(''); }}
                    className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <FaTimes className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                  </button>
                </div>
                <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Available: {formatCurrency(walletData.balance)}
                </p>
              </div>

              <form onSubmit={handleWithdraw} className="p-6 space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Amount (USD)
                  </label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Enter amount"
                    className={`w-full px-4 py-3 rounded-xl border ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    } outline-none focus:border-blue-500`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Wallet Address
                  </label>
                  <input
                    type="text"
                    value={withdrawAddress}
                    onChange={(e) => setWithdrawAddress(e.target.value)}
                    placeholder="Enter your wallet address"
                    className={`w-full px-4 py-3 rounded-xl border ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    } outline-none focus:border-blue-500`}
                  />
                </div>

                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                  <p className={`text-sm ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                    A 1% withdrawal fee will be applied
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowWithdrawModal(false); setWithdrawAmount(''); setWithdrawAddress(''); }}
                    className={`flex-1 py-3 rounded-xl font-medium ${
                      theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={withdrawLoading || !withdrawAmount || !withdrawAddress}
                    className={`flex-1 py-3 rounded-xl font-medium ${
                      withdrawAmount && withdrawAddress
                        ? 'bg-blue-500 hover:bg-blue-600 text-white'
                        : theme === 'dark' ? 'bg-gray-600 text-gray-400' : 'bg-gray-300 text-gray-500'
                    } disabled:opacity-50`}
                  >
                    {withdrawLoading ? 'Processing...' : 'Withdraw'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
