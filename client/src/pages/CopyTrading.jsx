import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FaUsers, FaStar, FaTrophy, FaChartLine, FaArrowUp, FaArrowDown, FaCrown, FaSearch, FaCheck, FaUserPlus, FaUserMinus } from 'react-icons/fa'
import { useAuthStore, API_URL } from '../store/authStore'

const CopyTrading = () => {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('profit')
  const [showBecomeTrader, setShowBecomeTrader] = useState(false)
  const [selectedTrader, setSelectedTrader] = useState(null)
  const [copyAmount, setCopyAmount] = useState(100)

  const { data: traders, isLoading } = useQuery({
    queryKey: ['copy-traders', sortBy],
    queryFn: async () => {
      const res = await fetch(`/api/copytrading/traders?sort=${sortBy}`)
      return res.json()
    }
  })

  const { data: featuredTraders } = useQuery({
    queryKey: ['featured-traders'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/copytrading/traders/featured`)
      return res.json()
    }
  })

  const { data: mySettings } = useQuery({
    queryKey: ['my-copy-settings'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/copytrading/my-settings`)
      return res.json()
    }
  })

  const followMutation = useMutation({
    mutationFn: async (traderId) => {
      const res = await fetch(`/api/copytrading/follow/${traderId}`, { method: 'POST' })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['copy-traders'])
    }
  })

  const copyMutation = useMutation({
    mutationFn: async ({ traderId, amount }) => {
      const res = await fetch(`/api/copytrading/copy/${traderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-copy-settings'])
      setSelectedTrader(null)
    }
  })

  const becomeTraderMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch(`${API_URL}/copytrading/become-trader`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-copy-settings'])
      setShowBecomeTrader(false)
    }
  })

  const filteredTraders = (traders || []).filter(trader => {
    const searchLower = searchTerm.toLowerCase()
    return trader.username?.toLowerCase().includes(searchLower) ||
           trader.user?.name?.toLowerCase().includes(searchLower)
  })

  const formatMoney = (amount) => {
    if (!amount) return '$0.00'
    const absAmount = Math.abs(amount)
    if (absAmount >= 1e6) return '$' + (amount / 1e6).toFixed(2) + 'M'
    if (absAmount >= 1e3) return '$' + (amount / 1e3).toFixed(2) + 'K'
    return '$' + amount.toFixed(2)
  }

  const renderStars = (rating) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          className={i <= rating ? 'text-yellow-400' : 'text-gray-600'}
          size={14}
        />
      )
    }
    return stars
  }

  const getRankBadge = (index) => {
    if (index === 0) return { icon: <FaCrown className="text-yellow-400" />, bg: 'bg-yellow-500/20' }
    if (index === 1) return { icon: '🥈', bg: 'bg-gray-400/20' }
    if (index === 2) return { icon: '🥉', bg: 'bg-orange-400/20' }
    return { icon: `#${index + 1}`, bg: 'bg-gray-700/50' }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <FaUsers className="text-blue-500" />
              Copy Trading
            </h1>
            <p className="text-gray-400 mt-1">Follow and copy successful traders automatically</p>
          </div>
          {mySettings?.isCopyTrader ? (
            <div className="bg-green-600/20 border border-green-600 px-4 py-2 rounded-lg">
              <span className="text-green-400 font-semibold">You are a Copy Trader</span>
            </div>
          ) : (
            <button
              onClick={() => setShowBecomeTrader(true)}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold transition"
            >
              Become a Trader
            </button>
          )}
        </div>

        {featuredTraders && featuredTraders.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FaTrophy className="text-yellow-500" />
              Top Traders
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featuredTraders.slice(0, 3).map((trader, index) => {
                const rank = getRankBadge(index)
                return (
                  <div key={trader._id} className={`${rank.bg} rounded-lg p-5 border border-gray-700`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-xl">
                        {trader.user?.name?.[0] || trader.username?.[0] || 'T'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{trader.username || trader.user?.name}</h3>
                          {trader.verified && <FaCheck className="text-blue-400" />}
                        </div>
                        <div className="flex items-center gap-1">
                          {renderStars(Math.round(trader.rating || 0))}
                          <span className="text-gray-400 text-sm ml-1">({trader.totalTrades} trades)</span>
                        </div>
                      </div>
                      <div className="text-2xl">{rank.icon}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-gray-400 text-xs">Total P/L</p>
                        <p className={`font-bold ${trader.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatMoney(trader.profitLoss)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Win Rate</p>
                        <p className="font-bold text-white">{trader.winRate?.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Followers</p>
                        <p className="font-bold text-white">{trader.totalFollowers}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedTrader(trader)
                        setCopyAmount(100)
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg font-semibold transition"
                    >
                      Copy
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search traders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
            >
              <option value="profit">Sort by Profit</option>
              <option value="winrate">Sort by Win Rate</option>
              <option value="followers">Sort by Followers</option>
              <option value="rating">Sort by Rating</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-lg p-5 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/3"></div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div className="h-8 bg-gray-700 rounded"></div>
                  <div className="h-8 bg-gray-700 rounded"></div>
                  <div className="h-8 bg-gray-700 rounded"></div>
                  <div className="h-8 bg-gray-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTraders.map((trader, index) => (
              <div key={trader._id} className="bg-gray-800 rounded-lg p-5 hover:bg-gray-750 transition">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center text-xl font-bold">
                      {trader.user?.name?.[0] || trader.username?.[0] || 'T'}
                    </div>
                    {trader.verified && (
                      <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                        <FaCheck size={10} />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {trader.username || trader.user?.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          {renderStars(Math.round(trader.rating || 0))}
                          <span>({trader.winRate?.toFixed(1)}% win rate)</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-xl font-bold ${trader.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {trader.profitLoss >= 0 ? '+' : ''}{formatMoney(trader.profitLoss)}
                        </p>
                        <p className="text-xs text-gray-400">Total P/L</p>
                      </div>
                    </div>

                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {trader.bio || 'No bio available'}
                    </p>

                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-gray-400 text-xs">Trades</p>
                        <p className="font-semibold">{trader.totalTrades}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400 text-xs">Win Rate</p>
                        <p className="font-semibold">{trader.winRate?.toFixed(1)}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400 text-xs">Followers</p>
                        <p className="font-semibold">{trader.totalFollowers}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400 text-xs">Assets</p>
                        <p className="font-semibold">{trader.assetClasses?.length || 0}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => followMutation.mutate(trader._id)}
                        className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                      >
                        <FaUserPlus />
                        Follow
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTrader(trader)
                          setCopyAmount(100)
                        }}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded-lg font-semibold transition"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredTraders.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-400">
            No traders found matching your criteria
          </div>
        )}
      </div>

      {selectedTrader && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Copy {selectedTrader.username || selectedTrader.user?.name}</h2>
            
            <div className="mb-4">
              <label className="block text-gray-400 text-sm mb-2">Amount to Copy ($)</label>
              <input
                type="number"
                value={copyAmount}
                onChange={(e) => setCopyAmount(Number(e.target.value))}
                min="10"
                max="10000"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
              />
              <p className="text-gray-500 text-xs mt-1">Min: $10, Max: $10,000</p>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Trader Win Rate</span>
                <span>{selectedTrader.winRate?.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Trader Profit</span>
                <span className={selectedTrader.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {formatMoney(selectedTrader.profitLoss)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Copy Ratio</span>
                <span>100%</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedTrader(null)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={() => copyMutation.mutate({ traderId: selectedTrader._id, amount: copyAmount })}
                className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold transition"
              >
                Start Copying
              </button>
            </div>
          </div>
        </div>
      )}

      {showBecomeTrader && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Become a Copy Trader</h2>
            <p className="text-gray-400 mb-4">
              Share your trades and earn followers who will automatically copy your positions.
            </p>
            <div className="mb-4">
              <label className="block text-gray-400 text-sm mb-2">Username</label>
              <input
                type="text"
                placeholder="Your trader username"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-400 text-sm mb-2">Bio (optional)</label>
              <textarea
                placeholder="Tell people about your trading strategy..."
                rows={3}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBecomeTrader(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={() => becomeTraderMutation.mutate({})}
                className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold transition"
              >
                Start Trading
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CopyTrading
