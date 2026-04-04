import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion'
import {
  FiActivity,
  FiAlertCircle,
  FiArrowRight,
  FiChevronDown,
  FiClock,
  FiCompass,
  FiCpu,
  FiDollarSign,
  FiGlobe,
  FiLayers,
  FiRefreshCw,
  FiShield,
  FiTrendingUp,
} from 'react-icons/fi'
import { FaAppStore, FaExchangeAlt, FaGooglePlay } from 'react-icons/fa'
import PublicNavbar from '../components/PublicNavbar'
import { api, useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'

const currencyOptions = [
  { code: 'eur', label: 'EUR', rate: 0.92, suffix: ' EUR' },
  { code: 'usd', label: 'USD', rate: 1, suffix: ' USD' },
  { code: 'czk', label: 'CZK', rate: 23.35, suffix: ' CZK' },
]

const marketForces = [
  {
    icon: FiGlobe,
    title: 'Macro events',
    body: 'Interest rates, inflation, regulation, liquidity, and trust in traditional currencies can move digital assets sharply. Crypto reacts fast when the broader economy changes.',
  },
  {
    icon: FiClock,
    title: "Bitcoin's four-year cycle",
    body: 'Halving cycles reduce newly issued supply and often reset market expectations. Traders watch these supply shifts closely because they influence long-term narratives.',
  },
  {
    icon: FiActivity,
    title: 'Crypto world events',
    body: 'ETF approvals, protocol upgrades, exchange failures, security incidents, and major listings can all change how the market prices risk and opportunity.',
  },
  {
    icon: FiTrendingUp,
    title: 'Fear and greed',
    body: 'Momentum buying and panic selling amplify volatility. When emotion leads, markets often overshoot upward and downward before finding balance again.',
  },
]

const valueFactors = [
  {
    number: '01',
    title: 'Limited supply',
    body: 'Some networks build scarcity directly into their tokenomics. When supply is constrained and demand grows, price can respond quickly.',
  },
  {
    number: '02',
    title: 'Trust and use',
    body: 'People assign value when they believe an asset can store wealth, settle payments, power applications, or unlock financial access.',
  },
  {
    number: '03',
    title: 'Technology and innovation',
    body: 'Blockchains, smart contracts, and developer ecosystems create utility. The stronger the network effects, the more durable the valuation can become.',
  },
  {
    number: '04',
    title: 'New opportunities',
    body: 'Fast global transfers, DeFi, tokenized assets, gaming, and AI-native payment rails all create fresh reasons for capital to enter the space.',
  },
  {
    number: '05',
    title: 'Speculation',
    body: 'Narratives matter. Traders price future potential long before outcomes are proven, which is why crypto can move so aggressively in both directions.',
  },
]

const contextPanels = [
  {
    icon: FiLayers,
    title: 'Price vs. market capitalization',
    body: 'The price tells you what one unit costs. Market cap tells you the rough network valuation. A cheap-looking coin can still be expensive if its supply is huge.',
  },
  {
    icon: FiCompass,
    title: 'The future of exchange rates',
    body: 'Long-term value depends on adoption, developer activity, regulation, real utility, and whether the network keeps earning trust through execution.',
  },
  {
    icon: FiShield,
    title: 'A smarter way to read volatility',
    body: 'Short-term moves are noisy. Stronger signals usually come from liquidity, user growth, product momentum, and how resilient a project looks in stressful markets.',
  },
]

const formatMoney = (value, suffix) => {
  const maximumFractionDigits = value >= 0.1 ? 2 : 6

  return `${new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits,
  }).format(value)}${suffix}`
}

const formatCompactMoney = (value, suffix) => {
  return `${new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(value)}${suffix}`
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
}

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.08 },
  },
}

const TiltSurface = ({ children, className = '', depth = 6 }) => {
  const ref = useRef(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springConfig = { damping: 22, stiffness: 260 }
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [depth, -depth]), springConfig)
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-depth, depth]), springConfig)

  const handleMouseMove = (event) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return

    mouseX.set((event.clientX - rect.left) / rect.width - 0.5)
    mouseY.set((event.clientY - rect.top) / rect.height - 0.5)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  return (
    <motion.div
      ref={ref}
      style={{ rotateX, rotateY, transformPerspective: 1800 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const GlassCard = ({ children, theme, className = '' }) => (
  <div
    className={`relative overflow-hidden rounded-[2rem] border backdrop-blur-2xl ${
      theme === 'dark'
        ? 'border-white/10 bg-white/[0.04] shadow-[0_24px_80px_rgba(0,0,0,0.35)]'
        : 'border-white/70 bg-white/[0.85] shadow-[0_24px_80px_rgba(15,23,42,0.12)]'
    } ${className}`}
  >
    <div
      className={`absolute inset-0 ${
        theme === 'dark'
          ? 'bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(129,140,248,0.12),transparent_28%)]'
          : 'bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(129,140,248,0.1),transparent_28%)]'
      }`}
    />
    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
    <div className="relative">{children}</div>
  </div>
)

const InsightCard = ({ icon: Icon, title, body, theme, delay = 0 }) => (
  <motion.div
    variants={fadeUp}
    transition={{ delay }}
  >
    <TiltSurface depth={4}>
      <GlassCard theme={theme} className="h-full">
        <div className="p-6 sm:p-7">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
              theme === 'dark'
                ? 'bg-white/[0.08] text-blue-300'
                : 'bg-blue-100 text-blue-700'
            }`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <h3 className={`mt-5 text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h3>
          <p className={`mt-4 text-base leading-8 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            {body}
          </p>
        </div>
      </GlassCard>
    </TiltSurface>
  </motion.div>
)

export default function Prices() {
  const { theme } = useThemeStore()
  const { user, isAuthenticated } = useAuthStore()
  const [coins, setCoins] = useState([])
  const [selectedCurrency, setSelectedCurrency] = useState('eur')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)

  useEffect(() => {
    fetchPrices()
    const interval = setInterval(fetchPrices, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchPrices = async () => {
    try {
      const { data } = await api.get('/markets/coins?per_page=20')
      setCoins(data)
      setLastUpdated(new Date())
      setError('')
    } catch (err) {
      console.error('Failed to fetch prices:', err)
      setError('Unable to load prices right now. Please try again in a moment.')
    } finally {
      setLoading(false)
    }
  }

  const currency = useMemo(
    () => currencyOptions.find((option) => option.code === selectedCurrency) || currencyOptions[0],
    [selectedCurrency]
  )

  const rows = useMemo(() => {
    return coins
      .filter((coin) => coin?.current_price)
      .sort((a, b) => (a.market_cap_rank || Number.MAX_SAFE_INTEGER) - (b.market_cap_rank || Number.MAX_SAFE_INTEGER))
  }, [coins])

  const marketStats = useMemo(() => {
    if (!rows.length) {
      return {
        supportedAssets: 0,
        topMover: null,
        positiveCount: 0,
        avgChange: 0,
        totalMarketCap: 0,
      }
    }

    const topMover = rows.reduce((best, coin) => {
      if (!best) return coin
      return (coin.price_change_percentage_24h || 0) > (best.price_change_percentage_24h || 0)
        ? coin
        : best
    }, null)

    const totalMarketCap = rows.reduce((sum, coin) => sum + (coin.market_cap || 0), 0) * currency.rate
    const positiveCount = rows.filter((coin) => (coin.price_change_percentage_24h || 0) >= 0).length
    const avgChange =
      rows.reduce((sum, coin) => sum + (coin.price_change_percentage_24h || 0), 0) / rows.length

    return {
      supportedAssets: rows.length,
      topMover,
      positiveCount,
      avgChange,
      totalMarketCap,
    }
  }, [currency.rate, rows])

  const buyPath = (symbol) => {
    if (user || isAuthenticated) {
      return `/trade/${symbol}`
    }

    return '/register'
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        theme === 'dark'
          ? 'bg-[linear-gradient(180deg,#07080b_0%,#0b1020_42%,#090b12_100%)] text-white'
          : 'bg-[linear-gradient(180deg,#f3f6fb_0%,#edf4ff_46%,#f7fbff_100%)] text-gray-900'
      }`}
    >
      <PublicNavbar />

      <main className="relative overflow-hidden pt-24 md:pt-28 pb-28">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ x: [0, 28, 0], y: [0, -18, 0], scale: [1, 1.08, 1] }}
            transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
            className={`absolute -left-40 top-24 h-[34rem] w-[34rem] rounded-full blur-3xl ${
              theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-300/30'
            }`}
          />
          <motion.div
            animate={{ x: [0, -32, 0], y: [0, 24, 0], scale: [1, 0.92, 1] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
            className={`absolute right-[-8rem] top-12 h-[28rem] w-[28rem] rounded-full blur-3xl ${
              theme === 'dark' ? 'bg-indigo-500/10' : 'bg-indigo-300/25'
            }`}
          />
          <motion.div
            animate={{ x: [0, 24, 0], y: [0, -24, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            className={`absolute bottom-[-8rem] left-[24%] h-[24rem] w-[24rem] rounded-full blur-3xl ${
              theme === 'dark' ? 'bg-cyan-500/8' : 'bg-cyan-300/20'
            }`}
          />
          <div
            className={`absolute inset-0 ${
              theme === 'dark'
                ? 'bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_38%)]'
                : 'bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.75),transparent_36%)]'
            }`}
          />
        </div>

        <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr] xl:items-center">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="max-w-3xl"
            >
              <div
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
                  theme === 'dark'
                    ? 'border border-white/10 bg-white/[0.06] text-blue-200'
                    : 'border border-blue-200 bg-white/80 text-blue-700 shadow-sm'
                }`}
              >
                <FiRefreshCw className="h-4 w-4" />
                Premium market view
              </div>

              <h1
                className={`mt-8 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                Prices, context,
                <span className="block bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
                  and market intuition
                </span>
              </h1>

              <p className={`mt-6 max-w-2xl text-lg leading-8 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                A more editorial prices page with live market data, a refined glassmorphism surface, and clearer explanations of what moves value in crypto.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#price-board"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-3 font-semibold text-white shadow-xl shadow-blue-500/25"
                >
                  Open price board
                  <FiArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="#market-context"
                  className={`inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold ${
                    theme === 'dark'
                      ? 'border border-white/10 bg-white/5 text-white'
                      : 'border border-white/80 bg-white/70 text-gray-900 shadow-sm'
                  }`}
                >
                  Why prices move
                </a>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                {[
                  {
                    label: 'Tracked assets',
                    value: marketStats.supportedAssets || '20',
                  },
                  {
                    label: 'Positive movers',
                    value: `${marketStats.positiveCount}`,
                  },
                  {
                    label: 'Avg. 24h move',
                    value: `${marketStats.avgChange >= 0 ? '+' : ''}${marketStats.avgChange.toFixed(2)}%`,
                  },
                ].map((item) => (
                  <GlassCard key={item.label} theme={theme} className="rounded-[1.5rem]">
                    <div className="p-5">
                      <p className={`text-xs uppercase tracking-[0.22em] ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                        {item.label}
                      </p>
                      <p className={`mt-3 text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {item.value}
                      </p>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.12 }}
            >
              <TiltSurface depth={5} className="relative">
                <GlassCard theme={theme}>
                  <div className="p-6 sm:p-8">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className={`text-xs uppercase tracking-[0.24em] ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                          Market pulse
                        </p>
                        <h2 className={`mt-3 text-3xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          Apple-like live board
                        </h2>
                      </div>

                      <div
                        className={`rounded-full px-4 py-2 text-sm ${
                          theme === 'dark'
                            ? 'border border-white/10 bg-white/[0.06] text-gray-300'
                            : 'border border-white/80 bg-white/80 text-gray-700 shadow-sm'
                        }`}
                      >
                        {lastUpdated
                          ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                          : 'Refreshing'}
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      {[
                        {
                          label: 'Top mover',
                          value: marketStats.topMover?.symbol?.toUpperCase() || 'BTC',
                          hint: marketStats.topMover
                            ? `${marketStats.topMover.price_change_percentage_24h >= 0 ? '+' : ''}${marketStats.topMover.price_change_percentage_24h.toFixed(2)}%`
                            : '+4.82%',
                        },
                        {
                          label: 'Tracked market cap',
                          value: formatCompactMoney(marketStats.totalMarketCap || 0, currency.suffix),
                          hint: 'Across visible assets',
                        },
                        {
                          label: 'Display currency',
                          value: currency.label,
                          hint: 'Switch instantly',
                        },
                        {
                          label: 'Board mood',
                          value: marketStats.avgChange >= 0 ? 'Risk-on' : 'Risk-off',
                          hint: `${marketStats.positiveCount}/${marketStats.supportedAssets || 20} green`,
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className={`rounded-[1.5rem] p-5 ${
                            theme === 'dark'
                            ? 'bg-white/[0.04] border border-white/[0.08]'
                              : 'bg-white/70 border border-white/80 shadow-sm'
                          }`}
                        >
                          <p className={`text-xs uppercase tracking-[0.22em] ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                            {item.label}
                          </p>
                          <p className={`mt-3 text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {item.value}
                          </p>
                          <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {item.hint}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 space-y-3">
                      {rows.slice(0, 3).map((coin) => (
                        <div
                          key={coin.id}
                          className={`flex items-center justify-between rounded-[1.35rem] px-4 py-3 ${
                            theme === 'dark'
                              ? 'bg-white/[0.04] border border-white/[0.08]'
                              : 'bg-white/70 border border-white/80 shadow-sm'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <img src={coin.image} alt={coin.name} className="h-10 w-10 rounded-full" />
                            <div>
                              <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {coin.name}
                              </p>
                              <p className={`text-sm uppercase ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                {coin.symbol}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {formatMoney(coin.current_price * currency.rate, currency.suffix)}
                            </p>
                            <p className={`text-sm ${coin.price_change_percentage_24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {coin.price_change_percentage_24h >= 0 ? '+' : ''}
                              {coin.price_change_percentage_24h?.toFixed(2)}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </GlassCard>
              </TiltSurface>
            </motion.div>
          </div>
        </section>

        <section id="price-board" className="relative z-10 mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
          >
            <div>
              <p className={`text-xs uppercase tracking-[0.26em] ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                Price board
              </p>
              <h2 className={`mt-3 text-3xl font-semibold sm:text-4xl ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Supported cryptocurrencies
              </h2>
              <p className={`mt-4 max-w-2xl text-base leading-8 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                A deeper list, cleaner spacing, a softer glass finish, and more motion so the table feels premium instead of flat.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm ${
                  theme === 'dark'
                    ? 'border border-white/10 bg-white/[0.06] text-gray-300'
                    : 'border border-white/80 bg-white/80 text-gray-700 shadow-sm'
                }`}
              >
                <FiClock className="h-4 w-4" />
                Live every 30s
              </div>

              <label className="relative inline-flex">
                <select
                  value={selectedCurrency}
                  onChange={(event) => setSelectedCurrency(event.target.value)}
                  className={`appearance-none rounded-full px-5 py-3 pr-12 text-sm font-semibold outline-none transition-colors ${
                    theme === 'dark'
                      ? 'border border-white/10 bg-[#dce5ff] text-blue-700'
                      : 'border border-blue-200 bg-white text-blue-700 shadow-sm'
                  }`}
                >
                  {currencyOptions.map((option) => (
                    <option key={option.code} value={option.code}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-600" />
              </label>
            </div>
          </motion.div>

          <TiltSurface depth={4} className="relative">
            <GlassCard theme={theme}>
              {error ? (
                <div className="flex flex-col items-center justify-center gap-4 px-6 py-20 text-center">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                      theme === 'dark' ? 'bg-red-500/10 text-red-400' : 'bg-red-100 text-red-600'
                    }`}
                  >
                    <FiAlertCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Price feed unavailable
                    </p>
                    <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{error}</p>
                  </div>
                  <button
                    onClick={fetchPrices}
                    className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-500/20"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <>
                  <div className="hidden md:block p-4 sm:p-5">
                    <div
                      className={`grid grid-cols-[minmax(0,2.2fr)_120px_220px_180px_104px] items-center rounded-[1.5rem] px-5 py-4 text-xs font-semibold uppercase tracking-[0.24em] ${
                        theme === 'dark'
                          ? 'bg-white/[0.04] text-gray-500'
                          : 'bg-white/70 text-gray-500 shadow-sm'
                      }`}
                    >
                      <span>Currency</span>
                      <span className="text-right">Ticker</span>
                      <span className="text-right">Price</span>
                      <span className="text-right">Change</span>
                      <span className="text-right">Action</span>
                    </div>
                  </div>

                  <div className="hidden md:block px-4 pb-4 sm:px-5 sm:pb-5">
                    {loading
                      ? [...Array(10)].map((_, index) => (
                          <div
                            key={index}
                            className={`grid grid-cols-[minmax(0,2.2fr)_120px_220px_180px_104px] items-center gap-4 rounded-[1.6rem] px-5 py-5 ${
                              theme === 'dark'
                                ? 'border border-white/[0.06] bg-white/[0.03] mt-3'
                                : 'border border-white/80 bg-white/75 mt-3 shadow-sm'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`h-11 w-11 rounded-full ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'} animate-pulse`} />
                              <div className="space-y-2">
                                <div className={`h-4 w-28 rounded ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'} animate-pulse`} />
                                <div className={`h-3 w-16 rounded ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'} animate-pulse`} />
                              </div>
                            </div>
                            <div className={`h-4 w-10 justify-self-end rounded ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'} animate-pulse`} />
                            <div className={`h-4 w-36 justify-self-end rounded ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'} animate-pulse`} />
                            <div className={`h-4 w-24 justify-self-end rounded ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'} animate-pulse`} />
                            <div className={`h-10 w-20 justify-self-end rounded-full ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'} animate-pulse`} />
                          </div>
                        ))
                      : rows.map((coin, index) => {
                          const convertedPrice = coin.current_price * currency.rate
                          const isPositive = coin.price_change_percentage_24h >= 0

                          return (
                            <motion.div
                              key={coin.id}
                              initial={{ opacity: 0, y: 18 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.35, delay: index * 0.02 }}
                              whileHover={{ y: -4, scale: 1.005 }}
                              className={`group mt-3 grid grid-cols-[minmax(0,2.2fr)_120px_220px_180px_104px] items-center gap-4 rounded-[1.6rem] px-5 py-5 transition-all ${
                                theme === 'dark'
                                  ? 'border border-white/[0.06] bg-white/[0.03] hover:border-blue-400/20 hover:bg-white/[0.05]'
                                  : 'border border-white/80 bg-white/75 shadow-sm hover:bg-white/95'
                              }`}
                            >
                              <div className="flex items-center gap-4">
                                <div className="relative">
                                  <div className={`absolute inset-0 rounded-full blur-lg ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-200/60'}`} />
                                  <img src={coin.image} alt={coin.name} className="relative h-11 w-11 rounded-full" />
                                </div>
                                <div className="min-w-0">
                                  <p className={`truncate text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {coin.name}
                                  </p>
                                </div>
                              </div>

                              <div className={`text-right text-lg font-medium uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                {coin.symbol}
                              </div>

                              <div className={`text-right text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {formatMoney(convertedPrice, currency.suffix)}
                              </div>

                              <div className={`text-right text-2xl font-semibold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                                {isPositive ? '+' : ''}
                                {coin.price_change_percentage_24h?.toFixed(2)}%
                              </div>

                              <div className="text-right">
                                <Link
                                  to={buyPath(coin.symbol)}
                                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-base font-semibold text-blue-400 transition-all hover:bg-blue-500/10 hover:text-blue-300"
                                >
                                  Buy
                                  <FiArrowRight className="h-4 w-4" />
                                </Link>
                              </div>
                            </motion.div>
                          )
                        })}
                  </div>

                  <div className="space-y-4 p-4 md:hidden">
                    {loading
                      ? [...Array(8)].map((_, index) => (
                          <div
                            key={index}
                            className={`rounded-[1.8rem] p-5 ${
                              theme === 'dark'
                                ? 'bg-white/[0.04] border border-white/[0.08]'
                                : 'bg-white/80 border border-white/80 shadow-sm'
                            }`}
                          >
                            <div className={`h-5 w-32 rounded ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'} animate-pulse`} />
                            <div className={`mt-4 h-4 w-20 rounded ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'} animate-pulse`} />
                            <div className={`mt-6 h-10 w-full rounded-2xl ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'} animate-pulse`} />
                          </div>
                        ))
                      : rows.map((coin, index) => {
                          const convertedPrice = coin.current_price * currency.rate
                          const isPositive = coin.price_change_percentage_24h >= 0

                          return (
                            <motion.div
                              key={coin.id}
                              initial={{ opacity: 0, y: 18 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.35, delay: index * 0.02 }}
                              className={`rounded-[1.8rem] p-5 ${
                                theme === 'dark'
                                  ? 'bg-white/[0.04] border border-white/[0.08]'
                                  : 'bg-white/80 border border-white/80 shadow-sm'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                  <div className="relative">
                                    <div className={`absolute inset-0 rounded-full blur-lg ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-200/60'}`} />
                                    <img src={coin.image} alt={coin.name} className="relative h-11 w-11 rounded-full" />
                                  </div>
                                  <div>
                                    <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                      {coin.name}
                                    </p>
                                    <p className={`text-sm uppercase ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                      {coin.symbol}
                                    </p>
                                  </div>
                                </div>

                                <div className={`rounded-full px-3 py-1 text-sm font-semibold ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                  {isPositive ? '+' : ''}
                                  {coin.price_change_percentage_24h?.toFixed(2)}%
                                </div>
                              </div>

                              <div className="mt-5 flex items-end justify-between gap-4">
                                <div>
                                  <p className={`text-xs uppercase tracking-[0.18em] ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                                    Price
                                  </p>
                                  <p className={`mt-2 text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {formatMoney(convertedPrice, currency.suffix)}
                                  </p>
                                </div>

                                <Link
                                  to={buyPath(coin.symbol)}
                                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20"
                                >
                                  Buy
                                  <FiArrowRight className="h-4 w-4" />
                                </Link>
                              </div>
                            </motion.div>
                          )
                        })}
                  </div>
                </>
              )}
            </GlassCard>
          </TiltSurface>
        </section>

        <section id="market-context" className="relative z-10 mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              className="xl:sticky xl:top-28 xl:self-start"
            >
              <TiltSurface depth={4}>
                <GlassCard theme={theme}>
                  <div className="p-6 sm:p-8">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                        theme === 'dark' ? 'bg-white/[0.08] text-blue-300' : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      <FiTrendingUp className="h-5 w-5" />
                    </div>
                    <h2 className={`mt-6 text-4xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      What influences the prices?
                    </h2>
                    <p className={`mt-5 text-base leading-8 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      Crypto prices are shaped by both hard data and human behavior. Macro conditions, protocol mechanics, ecosystem events, and investor psychology all meet in one fast-moving market.
                    </p>
                    <p className={`mt-4 text-base leading-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      The healthiest way to read a move is to ask what changed underneath it: liquidity, utility, supply, regulation, or simply sentiment.
                    </p>
                  </div>
                </GlassCard>
              </TiltSurface>
            </motion.div>

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              className="grid gap-4 sm:grid-cols-2"
            >
              {marketForces.map((item, index) => (
                <InsightCard
                  key={item.title}
                  icon={item.icon}
                  title={item.title}
                  body={item.body}
                  theme={theme}
                  delay={index * 0.05}
                />
              ))}
            </motion.div>
          </div>
        </section>
      </main>

      <footer className={`border-t ${theme === 'dark' ? 'border-white/10 bg-gray-950' : 'border-gray-200 bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
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
    </div>
  )
}
