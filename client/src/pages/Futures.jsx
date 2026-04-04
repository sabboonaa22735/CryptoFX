import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FaSearch, FaChartLine, FaArrowUp, FaArrowDown, FaSync, FaInfoCircle, FaPercentage } from 'react-icons/fa'
import { io } from 'socket.io-client'

const Futures = () => {
  const [futures, setFutures] = useState([])
  const [categories, setCategories] = useState([])
  const [category, setCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [realtimeData, setRealtimeData] = useState({})

  const { data: futuresData, isLoading, refetch } = useQuery({
    queryKey: ['futures', category],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (category !== 'all') params.append('category', category)
      const res = await fetch(`/api/futures?${params}`)
      return res.json()
    },
    refetchInterval: 15000
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['futures-categories'],
    queryFn: async () => {
      const res = await fetch('/api/futures/categories')
      return res.json()
    }
  })

  useEffect(() => {
    if (futuresData) {
      setFutures(Array.isArray(futuresData) ? futuresData : [])
    }
    if (categoriesData) {
      setCategories(categoriesData)
    }
  }, [futuresData, categoriesData])

  useEffect(() => {
    const socket = io()
    socket.emit('subscribe', ['futures'])
    
    socket.on('futures-update', (data) => {
      const dataMap = {}
      data.forEach(item => {
        dataMap[item.symbol] = item
      })
      setRealtimeData(prev => ({ ...prev, ...dataMap }))
    })

    return () => {
      socket.emit('unsubscribe', ['futures'])
      socket.disconnect()
    }
  }, [])

  const filteredFutures = futures.filter(future => {
    const searchLower = searchTerm.toLowerCase()
    return future.symbol.toLowerCase().includes(searchLower) ||
           future.name?.toLowerCase().includes(searchLower)
  })

  const formatPrice = (price) => {
    if (!price) return '0.00'
    if (price < 1) {
      return price.toFixed(6)
    }
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price)
  }

  const formatVolume = (volume) => {
    if (!volume) return '0'
    if (volume >= 1e9) return (volume / 1e9).toFixed(2) + 'B'
    if (volume >= 1e6) return (volume / 1e6).toFixed(2) + 'M'
    if (volume >= 1e3) return (volume / 1e3).toFixed(2) + 'K'
    return volume.toString()
  }

  const getRealtimePrice = (symbol) => {
    return realtimeData[symbol]?.price || futures.find(f => f.symbol === symbol)?.price || 0
  }

  const getRealtimeChange = (symbol) => {
    return realtimeData[symbol]?.changePercent || futures.find(f => f.symbol === symbol)?.changePercent || 0
  }

  const getFundingRate = (symbol) => {
    return realtimeData[symbol]?.fundingRate || futures.find(f => f.symbol === symbol)?.fundingRate || 0
  }

  const getMaxLeverage = (symbol) => {
    return realtimeData[symbol]?.maxLeverage || futures.find(f => f.symbol === symbol)?.maxLeverage || 125
  }

  const getAssetIcon = (assetType) => {
    switch (assetType) {
      case 'crypto': return '₿'
      case 'index': return '📊'
      case 'commodity': return '🛢️'
      default: return '📈'
    }
  }

  const getCategoryColor = (assetType) => {
    switch (assetType) {
      case 'crypto': return 'bg-orange-600'
      case 'index': return 'bg-purple-600'
      case 'commodity': return 'bg-yellow-600'
      default: return 'bg-blue-600'
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <FaChartLine className="text-purple-500" />
              Futures Trading
            </h1>
            <p className="text-gray-400 mt-1">Trade perpetual futures with up to 125x leverage</p>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition"
          >
            <FaSync className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-lg p-6 mb-8 border border-purple-800/30">
          <div className="flex items-start gap-4">
            <FaInfoCircle className="text-purple-400 text-2xl mt-1" />
            <div>
              <h3 className="font-semibold text-lg mb-2">Perpetual Futures Trading</h3>
              <p className="text-gray-300 text-sm">
                Trade perpetual futures contracts with up to 125x leverage. No expiration dates, 
                continuous trading. Funding rates are settled every 8 hours.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search futures contracts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-purple-500"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setCategory('all')}
              className={`px-4 py-2 rounded-lg transition ${
                category === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                  category === cat.id ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span>{cat.icon}</span>
                {cat.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-lg p-5 animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-1/2 mb-3"></div>
                <div className="h-6 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredFutures.map((future) => {
              const price = getRealtimePrice(future.symbol)
              const change = getRealtimeChange(future.symbol)
              const fundingRate = getFundingRate(future.symbol)
              const maxLeverage = getMaxLeverage(future.symbol)
              const isPositive = change >= 0

              return (
                <Link
                  key={future.symbol}
                  to={`/trade/${future.symbol}?type=futures`}
                  className="bg-gray-800 rounded-lg p-5 hover:bg-gray-750 transition group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{getAssetIcon(future.assetType)}</span>
                    <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(future.assetType)}`}>
                      {future.assetType}
                    </span>
                  </div>
                  
                  <div className="mb-3">
                    <h3 className="font-bold text-lg">{future.symbol}</h3>
                    <p className="text-gray-400 text-sm">{future.name}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Price</span>
                      <span className="font-semibold">${formatPrice(price)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">24h Change</span>
                      <span className={`font-semibold flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {isPositive ? <FaArrowUp /> : <FaArrowDown />}
                        {isPositive ? '+' : ''}{change.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm flex items-center gap-1">
                        <FaPercentage className="text-xs" /> Funding
                      </span>
                      <span className={`text-sm ${fundingRate > 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {fundingRate > 0 ? '+' : ''}{fundingRate.toFixed(4)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Max Leverage</span>
                      <span className="text-purple-400 font-semibold">{maxLeverage}x</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <button className="w-full bg-purple-600 hover:bg-purple-700 py-2 rounded-lg font-semibold transition group-hover:scale-105">
                      Trade {future.symbol}
                    </button>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {filteredFutures.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-400">
            No futures contracts found
          </div>
        )}
      </div>
    </div>
  )
}

export default Futures
