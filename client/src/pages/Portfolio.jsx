import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiTrendingUp, FiTrendingDown, FiPieChart, FiArrowUpRight, FiArrowDownRight, FiRefreshCw } from 'react-icons/fi'
import { useThemeStore } from '../store/themeStore'
import { api } from '../store/authStore'

export default function Portfolio() {
  const [trades, setTrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [portfolioStats, setPortfolioStats] = useState({
    totalBalance: 0,
    totalPL: 0,
    totalVolume: 0,
    totalTrades: 0,
    todayChange: 0,
    weekChange: 0,
    monthChange: 0,
    allTimeChange: 0,
    assets: []
  })
  const { theme } = useThemeStore()

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [portfolioRes, tradesRes, walletRes] = await Promise.all([
        api.get('/portfolio/stats').catch(() => ({ data: null })),
        api.get('/trades/history').catch(() => ({ data: { trades: [] } })),
        api.get('/wallet/global-stats').catch(() => ({ data: null }))
      ])
      
      if (portfolioRes.data) {
        setPortfolioStats(prev => ({ ...prev, ...portfolioRes.data }))
      }
      setTrades(tradesRes.data?.trades || [])
      
      if (walletRes.data) {
        setPortfolioStats(prev => ({
          ...prev,
          totalBalance: walletRes.data.availableBalance || prev.totalBalance,
          totalPL: walletRes.data.totalProfit || prev.totalPL,
          assets: walletRes.data.assets || []
        }))
      }
    } catch (error) {
      console.error('Failed to fetch portfolio:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { label: 'Total Balance', value: portfolioStats.totalBalance, icon: FiPieChart, color: 'primary', isCurrency: true },
    { label: 'Total P/L', value: portfolioStats.totalPL, icon: portfolioStats.totalPL >= 0 ? FiTrendingUp : FiTrendingDown, color: portfolioStats.totalPL >= 0 ? 'emerald' : 'red', isCurrency: true, showSign: true },
    { label: 'Total Volume', value: portfolioStats.totalVolume, icon: FiArrowUpRight, color: 'secondary', isCurrency: true },
    { label: 'Total Trades', value: portfolioStats.totalTrades, icon: FiPieChart, color: 'primary', isCurrency: false },
  ]

  const performanceMetrics = [
    { label: 'Today', value: portfolioStats.todayChange },
    { label: 'This Week', value: portfolioStats.weekChange },
    { label: 'This Month', value: portfolioStats.monthChange },
    { label: 'All Time', value: portfolioStats.allTimeChange },
  ]

  const formatValue = (value, isCurrency, showSign) => {
    if (isCurrency) {
      const sign = showSign && value >= 0 ? '+' : ''
      return `${sign}$${Math.abs(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
    return Math.abs(value).toLocaleString()
  }

  const formatPercent = (value) => {
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(2)}%`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Portfolio</h1>
          <p className={`mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Track your trading performance</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchData}
          disabled={loading}
          className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'}`}
        >
          <FiRefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''} ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} />
        </motion.button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`rounded-2xl p-5 ${theme === 'dark' ? 'bg-[var(--bg-secondary)] border border-[var(--border-color)]' : 'bg-white border border-gray-200 shadow-lg'}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</span>
              <div className={`w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color === 'emerald' ? 'text-emerald-400' : stat.color === 'red' ? 'text-red-400' : 'text-primary'}`} />
              </div>
            </div>
            <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {formatValue(stat.value, stat.isCurrency, stat.showSign)}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className={`rounded-2xl p-6 ${theme === 'dark' ? 'bg-[var(--bg-secondary)] border border-[var(--border-color)]' : 'bg-white border border-gray-200 shadow-lg'}`}>
            <h2 className={`text-xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Trading History</h2>
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`h-16 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`} />
                ))}
              </div>
            ) : trades.length === 0 ? (
              <div className="text-center py-12">
                <FiPieChart className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} />
                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>No trades yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {trades.slice(0, 10).map((trade) => (
                  <div key={trade._id} className={`flex items-center justify-between p-4 rounded-xl ${theme === 'dark' ? 'bg-[var(--bg-tertiary)]/50 hover:bg-[var(--bg-tertiary)]' : 'bg-gray-50 hover:bg-gray-100'} transition-colors`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${trade.type === 'buy' ? 'bg-primary/10' : 'bg-red-500/10'}`}>
                        {trade.type === 'buy' ? (
                          <FiArrowUpRight className="w-5 h-5 text-primary" />
                        ) : (
                          <FiArrowDownRight className="w-5 h-5 text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{trade.symbol?.toUpperCase() || 'BTC'}</p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} capitalize`}>{trade.orderType || 'Market'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>${trade.amount?.toLocaleString() || '0'}</p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>@ ${trade.price?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${(trade.profit || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {(trade.profit || 0) >= 0 ? '+' : ''}{(trade.profit || 0).toFixed(2) || '0.00'}
                      </p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                        {new Date(trade.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className={`rounded-2xl p-6 ${theme === 'dark' ? 'bg-[var(--bg-secondary)] border border-[var(--border-color)]' : 'bg-white border border-gray-200 shadow-lg'}`}>
            <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Asset Allocation</h2>
            <div className="space-y-4">
              {portfolioStats.assets.length > 0 ? portfolioStats.assets.map((asset, i) => (
                <div key={asset.symbol || i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{asset.symbol?.toUpperCase() || 'BTC'}</span>
                    <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{asset.percentage || 0}%</span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-[var(--bg-tertiary)]' : 'bg-gray-200'}`}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${asset.percentage || 0}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full rounded-full bg-primary"
                    />
                  </div>
                </div>
              )) : [
                { name: 'BTC', percentage: 45, color: '#F7931A' },
                { name: 'ETH', percentage: 30, color: '#627EEA' },
                { name: 'SOL', percentage: 15, color: '#00FFA3' },
                { name: 'Others', percentage: 10, color: '#9e9ea6' },
              ].map((asset) => (
                <div key={asset.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{asset.name}</span>
                    <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{asset.percentage}%</span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-[var(--bg-tertiary)]' : 'bg-gray-200'}`}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${asset.percentage}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: asset.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-2xl p-6 ${theme === 'dark' ? 'bg-[var(--bg-secondary)] border border-[var(--border-color)]' : 'bg-white border border-gray-200 shadow-lg'}`}>
            <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Performance</h2>
            <div className="space-y-4">
              {performanceMetrics.map((metric) => (
                <div key={metric.label} className="flex justify-between items-center">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>{metric.label}</span>
                  <span className={metric.value >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                    {formatPercent(metric.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
