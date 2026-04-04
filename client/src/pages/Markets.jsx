import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiSearch, FiStar, FiTrendingUp, FiGrid, FiList } from 'react-icons/fi'
import { api } from '../store/authStore'

export default function Markets() {
  const [coins, setCoins] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [view, setView] = useState('grid')
  const [category, setCategory] = useState('all')

  useEffect(() => {
    fetchCoins()
  }, [])

  const fetchCoins = async () => {
    try {
      const { data } = await api.get('/markets/coins?per_page=50')
      setCoins(data)
    } catch (error) {
      console.error('Failed to fetch coins:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = ['all', 'favorites', 'gainers', 'losers']

  const filteredCoins = coins.filter(coin => {
    const matchesSearch = coin.name.toLowerCase().includes(search.toLowerCase()) ||
                         coin.symbol.toLowerCase().includes(search.toLowerCase())
    
    if (category === 'all') return matchesSearch
    if (category === 'favorites') return matchesSearch && Math.random() > 0.7
    if (category === 'gainers') return matchesSearch && coin.price_change_percentage_24h > 0
    if (category === 'losers') return matchesSearch && coin.price_change_percentage_24h < 0
    return matchesSearch
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Markets</h1>
          <p className="text-gray-400 mt-1">Explore cryptocurrency markets</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search coins..."
            className="input-field pl-12"
          />
        </div>
        <div className="flex gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-xl font-medium capitalize transition-all ${
                category === cat
                  ? 'bg-primary text-dark-950'
                  : 'bg-dark-800 text-gray-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex gap-2 bg-dark-800 p-1 rounded-xl">
          <button
            onClick={() => setView('grid')}
            className={`p-2 rounded-lg ${view === 'grid' ? 'bg-dark-700 text-white' : 'text-gray-400'}`}
          >
            <FiGrid />
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-2 rounded-lg ${view === 'list' ? 'bg-dark-700 text-white' : 'text-gray-400'}`}
          >
            <FiList />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-dark-800" />
                <div className="space-y-2">
                  <div className="w-16 h-4 bg-dark-800 rounded" />
                  <div className="w-10 h-3 bg-dark-800 rounded" />
                </div>
              </div>
              <div className="w-full h-8 bg-dark-800 rounded" />
            </div>
          ))}
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCoins.map((coin, i) => (
            <motion.div
              key={coin.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
            >
              <Link to={`/trade/${coin.symbol}`} className="card-hover block">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img src={coin.image} alt={coin.name} className="w-10 h-10 rounded-full" />
                    <div>
                      <p className="font-semibold text-white">{coin.symbol.toUpperCase()}</p>
                      <p className="text-xs text-gray-400">{coin.name}</p>
                    </div>
                  </div>
                  <button className="p-1.5 rounded-lg hover:bg-dark-700 text-gray-400">
                    <FiStar />
                  </button>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white">
                      ${coin.current_price.toLocaleString()}
                    </p>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                    coin.price_change_percentage_24h >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                  }`}>
                    <FiTrendingUp className={`w-3 h-3 ${coin.price_change_percentage_24h < 0 ? 'rotate-180' : ''}`} />
                    <span className="text-sm font-medium">
                      {coin.price_change_percentage_24h >= 0 ? '+' : ''}
                      {coin.price_change_percentage_24h?.toFixed(2)}%
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-dark-700 flex justify-between text-sm">
                  <span className="text-gray-400">Market Cap</span>
                  <span className="text-white">${(coin.market_cap / 1e9).toFixed(2)}B</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="text-left py-4 px-4 text-gray-400 font-medium">Asset</th>
                <th className="text-right py-4 px-4 text-gray-400 font-medium">Price</th>
                <th className="text-right py-4 px-4 text-gray-400 font-medium">24h Change</th>
                <th className="text-right py-4 px-4 text-gray-400 font-medium">Market Cap</th>
                <th className="text-right py-4 px-4 text-gray-400 font-medium">Volume</th>
                <th className="text-right py-4 px-4 text-gray-400 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCoins.map((coin) => (
                <tr key={coin.id} className="border-b border-dark-800 hover:bg-dark-800/30">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                      <div>
                        <p className="font-medium text-white">{coin.symbol.toUpperCase()}</p>
                        <p className="text-xs text-gray-400">{coin.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-right py-4 px-4 text-white font-medium">
                    ${coin.current_price.toLocaleString()}
                  </td>
                  <td className={`text-right py-4 px-4 font-medium ${
                    coin.price_change_percentage_24h >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {coin.price_change_percentage_24h >= 0 ? '+' : ''}
                    {coin.price_change_percentage_24h?.toFixed(2)}%
                  </td>
                  <td className="text-right py-4 px-4 text-gray-300">
                    ${(coin.market_cap / 1e9).toFixed(2)}B
                  </td>
                  <td className="text-right py-4 px-4 text-gray-300">
                    ${(coin.total_volume / 1e9).toFixed(2)}B
                  </td>
                  <td className="text-right py-4 px-4">
                    <Link
                      to={`/trade/${coin.symbol}`}
                      className="btn-primary py-2 px-4 text-sm"
                    >
                      Trade
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
