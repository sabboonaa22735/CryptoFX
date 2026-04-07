import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiTrendingUp, FiTrendingDown, FiSearch, 
  FiStar, FiArrowRight, FiDollarSign, FiActivity,
  FiChevronDown, FiCheck, FiArrowLeft, FiMaximize2,
  FiZap, FiClock, FiAlertCircle, FiInfo, FiChevronRight,
  FiMinus, FiPlus, FiAlertTriangle, FiRefreshCw
} from 'react-icons/fi'
import { FaExchangeAlt, FaBitcoin, FaEthereum } from 'react-icons/fa'
import { api, useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'

const getRiskColor = (risk, theme) => {
  const colors = {
    low: theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600',
    medium: theme === 'dark' ? 'text-amber-400' : 'text-amber-600',
    high: theme === 'dark' ? 'text-red-400' : 'text-red-600',
  }
  return colors[risk] || colors.low
}

const getRiskBg = (risk) => {
  const colors = {
    low: 'bg-emerald-500/20',
    medium: 'bg-amber-500/20',
    high: 'bg-red-500/20',
  }
  return colors[risk] || colors.low
}

export default function Trade() {
  const { theme } = useThemeStore()
  const { user, updateUser, refreshWallet } = useAuthStore()
  const navigate = useNavigate()
  const { symbol } = useParams()
  
  const [coins, setCoins] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCoin, setSelectedCoin] = useState(null)
  const [orderType, setOrderType] = useState('market')
  const [side, setSide] = useState('buy')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('USDT')
  const [leverage, setLeverage] = useState(1)
  const [showCoinSelect, setShowCoinSelect] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [tradeResult, setTradeResult] = useState(null)
  const [showQuickTrade, setShowQuickTrade] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [favorites, setFavorites] = useState(['bitcoin', 'ethereum'])
  const [chartData, setChartData] = useState([])
  const [viewMode, setViewMode] = useState(symbol ? 'advanced' : 'standard')
  const [selectedDuration, setSelectedDuration] = useState(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [inputFocused, setInputFocused] = useState(false)
  const [error, setError] = useState('')
  const [tradeSettings, setTradeSettings] = useState(null)
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  
  const inputRef = useRef(null)
  const balance = user?.wallet?.balance || 0

  useEffect(() => {
    fetchCoins()
    fetchTradeSettings()
    if (symbol) {
      setViewMode('advanced')
    }
  }, [symbol])

  useEffect(() => {
    if (symbol && coins.length > 0) {
      const coin = coins.find(c => c.symbol.toLowerCase() === symbol.toLowerCase())
      if (coin) {
        setSelectedCoin(coin)
      }
    }
  }, [symbol, coins])

  useEffect(() => {
    if (selectedCoin && viewMode === 'advanced') {
      fetchChartData(selectedCoin.symbol)
    }
  }, [selectedCoin, viewMode])

  useEffect(() => {
    if (tradeSettings?.durations?.length > 0 && !selectedDuration) {
      setSelectedDuration(tradeSettings.durations[1] || tradeSettings.durations[0])
      setLeverage(tradeSettings.leverage?.default || 1)
    }
  }, [tradeSettings, selectedDuration])

  const fetchTradeSettings = async () => {
    try {
      const { data } = await api.get('/markets/trade-settings')
      setTradeSettings(data)
      setMaintenanceMode(data.maintenanceMode || false)
    } catch (err) {
      console.error('Failed to fetch trade settings:', err)
    }
  }

  const fetchCoins = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/markets/coins?per_page=50')
      setCoins(data || [])
      if (data?.length > 0 && !selectedCoin) {
        if (symbol) {
          const coin = data.find(c => c.symbol.toLowerCase() === symbol.toLowerCase())
          setSelectedCoin(coin || data[0])
        } else {
          setSelectedCoin(data[0])
        }
      }
    } catch (err) {
      console.error('Failed to fetch coins:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchChartData = async (coinSymbol) => {
    try {
      const { data } = await api.get(`/markets/coins/${coinSymbol}/chart`)
      setChartData(data || [])
    } catch (err) {
      console.error('Failed to fetch chart data:', err)
      setChartData([])
    }
  }

  const filteredCoins = coins.filter(coin => 
    coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleFavorite = (coinId) => {
    setFavorites(prev => 
      prev.includes(coinId) 
        ? prev.filter(id => id !== coinId)
        : [...prev, coinId]
    )
  }

  const handleQuickAmount = (percentage) => {
    const maxAmount = balance
    if (percentage === 'max') {
      setAmount(maxAmount.toString())
    } else {
      setAmount((maxAmount * percentage).toString())
    }
  }

  const calculatePnL = () => {
    if (!amount || parseFloat(amount) <= 0 || !selectedDuration) return { profit: 0, total: 0 }
    const investAmount = parseFloat(amount)
    const profit = (investAmount * selectedDuration.returnPercent * leverage) / 100
    return { profit, total: side === 'buy' ? investAmount : profit }
  }

  const { profit, total } = calculatePnL()

  const validateTrade = () => {
    if (!selectedCoin) return 'Please select a coin'
    if (!amount || parseFloat(amount) <= 0) return 'Please enter an amount'
    if (balance <= 0) return 'Insufficient balance'
    if (parseFloat(amount) < (tradeSettings?.limits?.minTradeAmount || 10)) {
      return `Minimum trade amount is $${tradeSettings?.limits?.minTradeAmount || 10}`
    }
    if (parseFloat(amount) > (tradeSettings?.limits?.maxTradeAmount || 10000)) {
      return `Maximum trade amount is $${tradeSettings?.limits?.maxTradeAmount || 10000}`
    }
    return null
  }

  const handleQuickTrade = async () => {
    const validationError = validateTrade()
    if (validationError) {
      setError(validationError)
      setTimeout(() => setError(''), 3000)
      return
    }
    
    setSubmitting(true)
    setError('')
    try {
      const tradeAmount = parseFloat(amount)
      const tradeData = {
        symbol: selectedCoin.symbol.toUpperCase(),
        amount: tradeAmount,
        price: selectedCoin.current_price,
        leverage: leverage,
        duration: selectedDuration?.value,
        returnPercent: selectedDuration?.returnPercent || 0,
        side: side
      }

      const endpoint = side === 'buy' ? '/trades/buy' : '/trades/sell'
      const { data } = await api.post(endpoint, tradeData)
      console.log('Trade response:', data);
      
      if (data.balance !== undefined) {
        const currentUser = useAuthStore.getState().user
        console.log('Updating balance from', currentUser?.wallet?.balance, 'to', data.balance);
        updateUser({
          wallet: { ...currentUser?.wallet, balance: data.balance }
        })
      }
      
      const profit = data.profit || (tradeAmount * (selectedDuration?.returnPercent || 0) * leverage) / 100
      const profitPercent = selectedDuration?.returnPercent || 0
      
      setTradeResult({
        symbol: selectedCoin.symbol.toUpperCase(),
        side: side,
        amount: tradeAmount,
        price: selectedCoin.current_price,
        leverage: leverage,
        duration: selectedDuration?.label || 'N/A',
        profit: profit,
        profitPercent: profitPercent,
        newBalance: data.balance,
        status: profit > 0 ? 'profit' : profit < 0 ? 'loss' : 'neutral'
      })
      setShowSuccess(true)
      setAmount('')
      
      refreshWallet()
      window.dispatchEvent(new Event('trade-executed'))
    } catch (err) {
      console.error('Trade error:', err.response?.status, err.response?.data)
      if (err.response?.status === 401) {
        setError('Please login to trade')
      } else {
        const errorMsg = err.response?.data?.message || 'Trade failed. Please try again.'
        setError(errorMsg)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const priceChangeClass = (change) => {
    if (change >= 0) return 'text-emerald-400'
    return 'text-red-400'
  }

  const durations = tradeSettings?.durations || [
    { value: 30, label: '30s', returnPercent: 0.76, risk: 'low' },
    { value: 60, label: '1m', returnPercent: 1.53, risk: 'low' },
    { value: 180, label: '3m', returnPercent: 4.59, risk: 'medium' },
    { value: 300, label: '5m', returnPercent: 7.66, risk: 'medium' },
    { value: 600, label: '10m', returnPercent: 15.35, risk: 'high' },
  ]

  const leverageSettings = tradeSettings?.leverage || { min: 1, max: 10, default: 1, steps: [1, 2, 5, 10] }
  const feePercent = tradeSettings?.fees?.tradingFee || 0.1

  if (maintenanceMode) {
    return (
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`rounded-3xl p-12 text-center ${
            theme === 'dark' 
              ? 'bg-[var(--bg-secondary)] border border-[var(--border-color)]' 
              : 'bg-white border border-gray-200 shadow-xl'
          }`}
        >
          <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-6">
            <FiAlertTriangle className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Trading Under Maintenance
          </h2>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            Trading is temporarily unavailable. Please try again later.
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <AnimatePresence>
        {showSuccess && tradeResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => { setShowSuccess(false); setTradeResult(null); }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md mx-4 rounded-3xl p-6 ${
                theme === 'dark' 
                  ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' 
                  : 'bg-white border border-gray-200 shadow-2xl'
              }`}
            >
              <div className="text-center mb-6">
                <div className={`w-24 h-24 mx-auto rounded-full flex flex-col items-center justify-center mb-4 ${
                  tradeResult.status === 'profit' 
                    ? 'bg-gradient-to-br from-emerald-400 to-green-500' 
                    : tradeResult.status === 'loss'
                    ? 'bg-gradient-to-br from-red-400 to-rose-500'
                    : 'bg-gradient-to-br from-gray-400 to-gray-500'
                }`}>
                  <span className="text-2xl font-bold text-white">
                    {tradeResult.status === 'profit' ? '+' : tradeResult.status === 'loss' ? '-' : ''}${Math.abs(tradeResult.profit) < 10 
                      ? Math.abs(tradeResult.profit).toFixed(2) 
                      : Math.abs(tradeResult.profit).toFixed(0)}
                  </span>
                </div>
                <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Trade Executed Successfully!
                </h2>
                <p className={`mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {tradeResult.side === 'buy' ? 'Long' : 'Short'} Position Opened
                </p>
              </div>

              <div className={`rounded-2xl p-4 mb-4 ${
                theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Asset</span>
                  <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {tradeResult.symbol}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Type</span>
                  <span className={`font-bold ${tradeResult.side === 'buy' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {tradeResult.side === 'buy' ? 'BUY (Long)' : 'SELL (Short)'}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Amount</span>
                  <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    ${tradeResult.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Leverage</span>
                  <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {tradeResult.leverage}x
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Duration</span>
                  <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {tradeResult.duration}
                  </span>
                </div>
              </div>

              <div className={`rounded-2xl p-4 mb-6 ${
                tradeResult.status === 'profit' 
                  ? 'bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/30'
                  : tradeResult.status === 'loss'
                  ? 'bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-red-500/30'
                  : theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Potential {tradeResult.status === 'profit' ? 'Profit' : tradeResult.status === 'loss' ? 'Loss' : 'Result'}
                    </p>
                    <p className={`text-2xl font-bold ${
                      tradeResult.status === 'profit' 
                        ? 'text-emerald-400' 
                        : tradeResult.status === 'loss'
                        ? 'text-red-400'
                        : theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {tradeResult.status === 'profit' ? '+' : tradeResult.status === 'loss' ? '-' : ''}${Math.abs(tradeResult.profit).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Return Rate
                    </p>
                    <p className={`text-lg font-bold ${
                      tradeResult.side === 'buy' ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {tradeResult.side === 'buy' ? '+' : '-'}{tradeResult.profitPercent}%
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => { setShowSuccess(false); setTradeResult(null); }}
                className={`w-full py-3.5 rounded-xl font-bold transition-all ${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90'
                    : 'bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 shadow-lg'
                }`}
              >
                Continue Trading
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Trade
        </h1>
        <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Buy and sell cryptocurrencies with advanced trading tools
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`rounded-2xl p-6 ${
              theme === 'dark' 
                ? 'bg-[var(--bg-secondary)] border border-[var(--border-color)]' 
                : 'bg-white border border-gray-200 shadow-xl shadow-gray-200/50'
            }`}
          >
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => setShowCoinSelect(true)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
                  theme === 'dark' 
                    ? 'bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)]/80' 
                    : 'bg-gray-100 hover:bg-gray-200'
                } transition-colors`}
              >
                {selectedCoin ? (
                  <>
                    <img src={selectedCoin.image} alt={selectedCoin.name} className="w-8 h-8 rounded-full" />
                    <span className="font-bold text-lg">{selectedCoin.symbol.toUpperCase()}</span>
                    <FiChevronDown className="w-5 h-5 text-gray-400" />
                  </>
                ) : (
                  <span className="text-gray-400">Select Coin</span>
                )}
              </button>
              
              {selectedCoin && (
                <div className="flex-1">
                  <div className="flex items-baseline gap-3">
                    <motion.span 
                      key={selectedCoin.current_price}
                      initial={{ scale: 1.05, color: selectedCoin.price_change_percentage_24h >= 0 ? '#34d399' : '#f87171' }}
                      animate={{ scale: 1, color: theme === 'dark' ? '#ffffff' : '#000000' }}
                      transition={{ duration: 0.3 }}
                      className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                    >
                      ${selectedCoin.current_price?.toLocaleString()}
                    </motion.span>
                    <span className={`text-sm font-medium ${priceChangeClass(selectedCoin.price_change_percentage_24h)}`}>
                      {selectedCoin.price_change_percentage_24h >= 0 ? '+' : ''}
                      {selectedCoin.price_change_percentage_24h?.toFixed(2)}%
                    </span>
                  </div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    24h High: ${selectedCoin.high_24h?.toLocaleString()} | 24h Low: ${selectedCoin.low_24h?.toLocaleString()}
                  </p>
                </div>
              )}

              <button
                onClick={fetchCoins}
                className={`p-2 rounded-xl ${
                  theme === 'dark' ? 'hover:bg-[var(--bg-tertiary)]' : 'hover:bg-gray-100'
                } transition-colors`}
              >
                <FiRefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Market Cap', value: `$${(selectedCoin?.market_cap / 1e9).toFixed(2)}B` },
                { label: 'Volume 24h', value: `$${(selectedCoin?.total_volume / 1e9).toFixed(2)}B` },
                { label: 'Circulating', value: `${(selectedCoin?.circulating_supply / 1e6).toFixed(2)}M` },
                { label: 'ATH', value: `$${selectedCoin?.ath?.toLocaleString()}` },
              ].map((stat) => (
                <div key={stat.label} className={`p-3 rounded-xl ${
                  theme === 'dark' ? 'bg-[var(--bg-tertiary)]/50' : 'bg-gray-50'
                }`}>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</p>
                  <p className={`font-semibold mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                if (selectedCoin) {
                  setViewMode(prev => prev === 'advanced' ? 'standard' : 'advanced')
                  if (viewMode === 'standard') {
                    navigate(`/trade/${selectedCoin.symbol}`, { replace: true })
                  } else {
                    navigate('/trade', { replace: true })
                  }
                }
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all flex items-center justify-center gap-2"
            >
              {viewMode === 'advanced' ? (
                <>
                  <FiArrowLeft className="w-4 h-4" />
                  Back to Trade
                </>
              ) : (
                <>
                  <FiMaximize2 className="w-4 h-4" />
                  Open Advanced Chart
                </>
              )}
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`rounded-2xl p-6 ${
              theme === 'dark' 
                ? 'bg-[var(--bg-secondary)] border border-[var(--border-color)]' 
                : 'bg-white border border-gray-200 shadow-xl shadow-gray-200/50'
            }`}
          >
            <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Market Overview
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} border-b border-[var(--border-color)]`}>
                    <th className="text-left py-3 px-2">Coin</th>
                    <th className="text-right py-3 px-2">Price</th>
                    <th className="text-right py-3 px-2">24h %</th>
                    <th className="text-right py-3 px-2">Market Cap</th>
                    <th className="text-right py-3 px-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {coins.slice(0, 10).map((coin) => (
                    <tr 
                      key={coin.id}
                      className={`border-b border-[var(--border-color)] last:border-0 ${
                        theme === 'dark' ? 'hover:bg-[var(--bg-tertiary)]/30' : 'hover:bg-gray-50'
                      } transition-colors cursor-pointer`}
                      onClick={() => setSelectedCoin(coin)}
                    >
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(coin.id); }}
                            className={`p-1 ${favorites.includes(coin.id) ? 'text-amber-400' : 'text-gray-500'}`}
                          >
                            <FiStar className={`w-4 h-4 ${favorites.includes(coin.id) ? 'fill-current' : ''}`} />
                          </button>
                          <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" />
                          <div>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {coin.name}
                            </p>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {coin.symbol.toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className={`text-right py-3 px-2 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        ${coin.current_price?.toLocaleString()}
                      </td>
                      <td className={`text-right py-3 px-2 font-medium ${priceChangeClass(coin.price_change_percentage_24h)}`}>
                        {coin.price_change_percentage_24h >= 0 ? '+' : ''}
                        {coin.price_change_percentage_24h?.toFixed(2)}%
                      </td>
                      <td className={`text-right py-3 px-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        ${(coin.market_cap / 1e9).toFixed(2)}B
                      </td>
                      <td className="text-right py-3 px-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedCoin(coin); }}
                          className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
                        >
                          Trade
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <div className={`rounded-3xl p-6 ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-tertiary)] border border-[var(--border-color)]' 
              : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-xl shadow-gray-200/50'
          }`}>
            <div className="flex items-center justify-between mb-5">
              <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Quick Trade
              </h3>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full transition-all ${
                  showAdvanced 
                    ? 'bg-primary text-white' 
                    : theme === 'dark' ? 'bg-[var(--bg-tertiary)] text-gray-400' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {showAdvanced ? 'Advanced' : 'Basic'}
              </button>
            </div>

            {selectedCoin && (
              <motion.button
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setShowCoinSelect(true)}
                className={`w-full p-4 rounded-2xl mb-5 text-left transition-all hover:opacity-90 ${
                  side === 'buy' 
                    ? 'bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20'
                    : 'bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-red-500/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`relative`}>
                      <img src={selectedCoin.image} alt={selectedCoin.name} className="w-12 h-12 rounded-full" />
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${
                        side === 'buy' ? 'bg-emerald-500' : 'bg-red-500'
                      }`}>
                        {side === 'buy' ? <FiTrendingUp className="w-3 h-3 text-white" /> : <FiTrendingDown className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                    <div>
                      <p className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {selectedCoin.symbol.toUpperCase()}/USDT
                      </p>
                      <motion.p 
                        key={selectedCoin.current_price}
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        className={`text-sm font-medium ${priceChangeClass(selectedCoin.price_change_percentage_24h)}`}
                      >
                        ${selectedCoin.current_price?.toLocaleString()}
                      </motion.p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>24h Change</p>
                    <motion.p 
                      key={selectedCoin.price_change_percentage_24h}
                      initial={{ opacity: 0.5 }}
                      animate={{ opacity: 1 }}
                      className={`font-bold ${priceChangeClass(selectedCoin.price_change_percentage_24h)}`}
                    >
                      {selectedCoin.price_change_percentage_24h >= 0 ? '+' : ''}
                      {selectedCoin.price_change_percentage_24h?.toFixed(2)}%
                    </motion.p>
                  </div>
                  <FiChevronRight className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                </div>
              </motion.button>
            )}

            <div className="flex gap-2 mb-5">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSide('buy')}
                className={`flex-1 py-3.5 rounded-xl font-bold text-base transition-all relative overflow-hidden ${
                  side === 'buy'
                    ? 'bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                    : theme === 'dark' ? 'bg-[var(--bg-tertiary)] text-gray-400 hover:text-white' : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              >
                {side === 'buy' && (
                  <motion.div 
                    layoutId="buyGlow"
                    className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-400 opacity-50"
                  />
                )}
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <FiTrendingUp className="w-4 h-4" />
                  BUY
                </span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSide('sell')}
                className={`flex-1 py-3.5 rounded-xl font-bold text-base transition-all relative overflow-hidden ${
                  side === 'sell'
                    ? 'bg-gradient-to-r from-red-500 via-rose-500 to-red-500 text-white shadow-lg shadow-red-500/30'
                    : theme === 'dark' ? 'bg-[var(--bg-tertiary)] text-gray-400 hover:text-white' : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              >
                {side === 'sell' && (
                  <motion.div 
                    layoutId="sellGlow"
                    className="absolute inset-0 bg-gradient-to-r from-red-400 to-rose-400 opacity-50"
                  />
                )}
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <FiTrendingDown className="w-4 h-4" />
                  SELL
                </span>
              </motion.button>
            </div>

            <div className="mb-5">
              <label className={`flex items-center gap-2 text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <FiClock className="w-4 h-4" />
                Duration
                <div className="relative group ml-auto">
                  <FiInfo className="w-4 h-4 cursor-help" />
                  <div className={`absolute right-0 top-6 px-3 py-2 rounded-lg text-xs whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 ${
                    theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-900 text-white'
                  }`}>
                    Select trade duration and check potential returns
                  </div>
                </div>
              </label>
              <div className="grid grid-cols-5 gap-2">
                {durations.map((d) => (
                  <motion.button
                    key={d.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedDuration(d)}
                    className={`relative p-3 rounded-xl text-center transition-all ${
                      selectedDuration?.value === d.value
                        ? side === 'buy'
                          ? 'bg-emerald-500/20 border-2 border-emerald-500'
                          : 'bg-red-500/20 border-2 border-red-500'
                        : theme === 'dark' ? 'bg-[var(--bg-tertiary)] border-2 border-transparent hover:border-[var(--border-color)]' : 'bg-gray-100 border-2 border-transparent hover:border-gray-300'
                    }`}
                  >
                    <p className={`font-bold text-sm ${selectedDuration?.value === d.value ? (side === 'buy' ? 'text-emerald-400' : 'text-red-400') : (theme === 'dark' ? 'text-white' : 'text-gray-900')}`}>
                      {d.label}
                    </p>
                    <p className={`text-xs mt-1 ${selectedDuration?.value === d.value ? (side === 'buy' ? 'text-emerald-300' : 'text-red-300') : 'text-gray-500'}`}>
                      +{d.returnPercent}%
                    </p>
                    <div className={`absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${getRiskBg(d.risk)} ${getRiskColor(d.risk, theme)}`}>
                      {d.risk}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            <motion.div 
              className={`p-4 rounded-2xl mb-5 ${
                theme === 'dark' 
                  ? 'bg-[var(--bg-tertiary)]/50 border border-[var(--border-color)]' 
                  : 'bg-gray-50 border border-gray-200'
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Available Balance
                </span>
                <motion.span 
                  key={balance}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                >
                  ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </motion.span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className={`w-2 h-2 rounded-full ${balance > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-gray-500'}`} />
                <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}>
                  {balance > 0 ? 'Ready to trade' : 'No balance available'}
                </span>
              </div>
            </motion.div>

            <div className="mb-5">
              <label className={`flex items-center justify-between text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <span className="flex items-center gap-2">
                  Amount
                  <div className="relative group">
                    <FiInfo className="w-3.5 h-3.5 cursor-help" />
                    <div className={`absolute left-0 bottom-6 px-3 py-2 rounded-lg text-xs w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 ${
                      theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-900 text-white'
                    }`}>
                      Enter the amount you want to invest in this trade
                    </div>
                  </div>
                </span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrency(c => c === 'USDT' ? 'USD' : 'USDT')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    theme === 'dark' 
                      ? 'bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)]/80 text-gray-300' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  }`}
                >
                  {currency}
                  <FiChevronRight className="w-3 h-3" />
                </motion.button>
              </label>
              
              <div className="relative">
                <motion.div
                  animate={{ 
                    boxShadow: inputFocused 
                      ? (side === 'buy' ? '0 0 0 3px rgba(16, 185, 129, 0.2)' : '0 0 0 3px rgba(239, 68, 68, 0.2)') 
                      : '0 0 0 1px transparent'
                  }}
                  transition={{ duration: 0.2 }}
                  className={`rounded-xl border ${
                    inputFocused
                      ? (side === 'buy' ? 'border-emerald-500' : 'border-red-500')
                      : (theme === 'dark' ? 'border-[var(--border-color)]' : 'border-gray-200')
                  } overflow-hidden`}
                >
                  <input
                    ref={inputRef}
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    placeholder="0.00"
                    className={`w-full px-4 py-4 text-lg font-semibold bg-transparent outline-none ${
                      theme === 'dark' ? 'text-white placeholder-gray-600' : 'text-gray-900 placeholder-gray-400'
                    }`}
                  />
                  <div className={`px-4 py-3 border-t ${
                    theme === 'dark' ? 'border-[var(--border-color)]' : 'border-gray-200'
                  }`}>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      ≈ ${amount ? (parseFloat(amount) * (selectedCoin?.current_price || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                    </span>
                  </div>
                </motion.div>
                
                <motion.div 
                  className={`absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                  }`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {amount && (
                    <button 
                      onClick={() => setAmount('')}
                      className="p-1 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      <FiMinus className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              </div>

              <div className="flex gap-2 mt-3">
                {[0.25, 0.5, 1].map((val) => (
                  <motion.button
                    key={val}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleQuickAmount(val)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      theme === 'dark' 
                        ? 'bg-[var(--bg-tertiary)] text-gray-400 hover:text-white hover:bg-[var(--bg-tertiary)]/80' 
                        : 'bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    disabled={balance <= 0}
                  >
                    {val * 100}%
                  </motion.button>
                ))}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleQuickAmount('max')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    theme === 'dark' 
                      ? 'bg-[var(--bg-tertiary)] text-gray-400 hover:text-white hover:bg-[var(--bg-tertiary)]/80' 
                      : 'bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  disabled={balance <= 0}
                >
                  MAX
                </motion.button>
              </div>
            </div>

            {showAdvanced && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-5"
              >
                <label className={`flex items-center gap-2 text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  <FiZap className="w-4 h-4" />
                  Leverage
                  <div className="relative group ml-auto">
                    <FiAlertCircle className="w-4 h-4 cursor-help" />
                    <div className={`absolute right-0 top-6 px-3 py-2 rounded-lg text-xs w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 ${
                      theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-900 text-white'
                    }`}>
                      Higher leverage = Higher risk and potential returns
                    </div>
                  </div>
                </label>
                <div className={`flex items-center gap-3 p-3 rounded-xl ${
                  theme === 'dark' ? 'bg-[var(--bg-tertiary)]/50' : 'bg-gray-50'
                }`}>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setLeverage(l => Math.max(leverageSettings.min, l - 1))}
                    className={`p-2 rounded-lg ${
                      theme === 'dark' ? 'bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)]/80' : 'bg-white hover:bg-gray-100'
                    } ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                  >
                    <FiMinus className="w-4 h-4" />
                  </motion.button>
                  <div className="flex-1 text-center">
                    <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {leverage}x
                    </span>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setLeverage(l => Math.min(leverageSettings.max, l + 1))}
                    className={`p-2 rounded-lg ${
                      theme === 'dark' ? 'bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)]/80' : 'bg-white hover:bg-gray-100'
                    } ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                  >
                    <FiPlus className="w-4 h-4" />
                  </motion.button>
                </div>
                <div className="flex gap-1 mt-2">
                  {leverageSettings.steps.map((lev) => (
                    <button
                      key={lev}
                      onClick={() => setLeverage(lev)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        leverage === lev
                          ? 'bg-primary text-white'
                          : theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                      }`}
                    >
                      {lev}x
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            <AnimatePresence>
              {amount && parseFloat(amount) > 0 && selectedDuration && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className={`p-4 rounded-2xl mb-5 ${
                    side === 'buy'
                      ? 'bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20'
                      : 'bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-red-500/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Trade Summary
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      selectedDuration.risk === 'low' ? 'bg-emerald-500/20 text-emerald-400' :
                      selectedDuration.risk === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {selectedDuration.risk.toUpperCase()} RISK
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Entry Price</span>
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        ${selectedCoin?.current_price?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Duration</span>
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {selectedDuration.label}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Potential Return</span>
                      <motion.span 
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        className={`text-sm font-bold ${side === 'buy' ? 'text-emerald-400' : 'text-red-400'}`}
                      >
                        +{(selectedDuration.returnPercent * leverage).toFixed(2)}%
                      </motion.span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Trading Fee</span>
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {feePercent}%
                      </span>
                    </div>
                    <div className={`h-px my-2 ${theme === 'dark' ? 'bg-[var(--border-color)]' : 'bg-gray-200'}`} />
                    <div className="flex justify-between">
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {side === 'buy' ? 'Est. Profit' : 'Est. Payout'}
                      </span>
                      <motion.span 
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        className={`text-lg font-bold ${side === 'buy' ? 'text-emerald-400' : 'text-red-400'}`}
                      >
                        ${profit.toFixed(2)}
                      </motion.span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2"
                >
                  <FiAlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <span className="text-sm text-red-400">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.02, boxShadow: side === 'buy' ? '0 10px 40px rgba(16, 185, 129, 0.4)' : '0 10px 40px rgba(239, 68, 68, 0.4)' }}
              whileTap={{ scale: 0.98 }}
              onClick={handleQuickTrade}
              disabled={!amount || parseFloat(amount) <= 0 || submitting || balance <= 0}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all relative overflow-hidden ${
                side === 'buy'
                  ? 'bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-500 text-white'
                  : 'bg-gradient-to-r from-red-500 via-rose-500 to-red-500 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none`}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  Processing...
                </span>
              ) : balance <= 0 ? (
                'Insufficient Balance'
              ) : !amount || parseFloat(amount) <= 0 ? (
                'Enter Amount'
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {side === 'buy' ? <FiTrendingUp className="w-5 h-5" /> : <FiTrendingDown className="w-5 h-5" />}
                  {side === 'buy' ? 'Buy' : 'Sell'} {selectedCoin?.symbol.toUpperCase() || 'BTC'}
                </span>
              )}
            </motion.button>

            <p className={`text-xs text-center mt-3 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              By trading, you agree to our Terms of Service
            </p>
          </div>

          <div className={`rounded-2xl p-6 ${
            theme === 'dark' 
              ? 'bg-[var(--bg-secondary)] border border-[var(--border-color)]' 
              : 'bg-white border border-gray-200 shadow-xl shadow-gray-200/50'
          }`}>
            <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Recent Trades
            </h3>
            <div className="space-y-3">
              {[
                { type: 'buy', amount: '0.5 BTC', price: '$67,450', time: '2m ago' },
                { type: 'sell', amount: '2 ETH', price: '$3,520', time: '5m ago' },
                { type: 'buy', amount: '100 SOL', price: '$142', time: '8m ago' },
                { type: 'sell', amount: '0.25 BTC', price: '$67,380', time: '12m ago' },
              ].map((trade, i) => (
                <div key={i} className={`flex items-center justify-between p-3 rounded-xl ${
                  theme === 'dark' ? 'bg-[var(--bg-tertiary)]/50' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      trade.type === 'buy' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {trade.type === 'buy' ? <FiTrendingUp className="w-4 h-4" /> : <FiTrendingDown className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {trade.type === 'buy' ? 'Bought' : 'Sold'} {trade.amount}
                      </p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        @ {trade.price}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    {trade.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showCoinSelect && (
          <CoinSelectModal
            coins={filteredCoins}
            loading={loading}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            onSelect={(coin) => { setSelectedCoin(coin); setShowCoinSelect(false); }}
            onClose={() => setShowCoinSelect(false)}
            theme={theme}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function CoinSelectModal({ coins, loading, searchQuery, setSearchQuery, favorites, toggleFavorite, onSelect, onClose, theme }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-lg max-h-[80vh] rounded-3xl overflow-hidden ${
          theme === 'dark' ? 'bg-[var(--bg-secondary)] border border-[var(--border-color)]' : 'bg-white'
        }`}
      >
        <div className="p-4 border-b border-[var(--border-color)]">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
            theme === 'dark' ? 'bg-[var(--bg-tertiary)]' : 'bg-gray-100'
          }`}>
            <FiSearch className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search coins..."
              className={`flex-1 bg-transparent outline-none ${
                theme === 'dark' ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'
              }`}
              autoFocus
            />
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto p-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            coins.map((coin) => (
              <div
                key={coin.id}
                onClick={() => onSelect(coin)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors cursor-pointer ${
                  theme === 'dark' ? 'hover:bg-[var(--bg-tertiary)]' : 'hover:bg-gray-50'
                }`}
              >
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(coin.id); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); toggleFavorite(coin.id); }}}
                  className={`p-1 cursor-pointer ${favorites.includes(coin.id) ? 'text-amber-400' : 'text-gray-500'}`}
                >
                  <FiStar className={`w-4 h-4 ${favorites.includes(coin.id) ? 'fill-current' : ''}`} />
                </span>
                <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                <div className="flex-1 text-left">
                  <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {coin.name}
                  </p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {coin.symbol.toUpperCase()}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    ${coin.current_price?.toLocaleString()}
                  </p>
                  <p className={`text-sm ${coin.price_change_percentage_24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {coin.price_change_percentage_24h >= 0 ? '+' : ''}
                    {coin.price_change_percentage_24h?.toFixed(2)}%
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
