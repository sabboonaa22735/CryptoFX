import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FaChartLine, FaChartBar, FaCoins, FaArrowUp, FaArrowDown, FaSearch, FaFilter } from 'react-icons/fa'
import { useSocket } from '../contexts/SocketContext'
import { LoadingSkeleton, ErrorState, EmptyState } from '../components/ui/StatusComponents'
import { API_URL } from '../store/authStore'

const Indices = () => {
  const [indices, setIndices] = useState([])
  const [commodities, setCommodities] = useState([])
  const [category, setCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [realtimeData, setRealtimeData] = useState({})

  const { data: indicesData, isLoading: loadingIndices, error: indicesError, refetch: refetchIndices } = useQuery({
    queryKey: ['indices'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/indices`)
      if (!res.ok) throw new Error('Failed to fetch indices')
      return res.json()
    },
    refetchInterval: 30000
  })

  const { data: commoditiesData, isLoading: loadingCommodities, error: commoditiesError, refetch: refetchCommodities } = useQuery({
    queryKey: ['commodities'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/indices/commodities`)
      if (!res.ok) throw new Error('Failed to fetch commodities')
      return res.json()
    },
    refetchInterval: 30000
  })

  useEffect(() => {
    if (indicesData?.indices) {
      setIndices(indicesData.indices)
    }
    if (commoditiesData) {
      setCommodities(commoditiesData)
    }
  }, [indicesData, commoditiesData])

  const { subscribe, unsubscribe, on } = useSocket()

  useEffect(() => {
    subscribe(['indices', 'commodities'])
    
    const handleIndicesUpdate = (data) => {
      const dataMap = {}
      data.forEach(item => {
        dataMap[item.symbol] = item
      })
      setRealtimeData(prev => ({ ...prev, ...dataMap }))
    }

    const handleCommoditiesUpdate = (data) => {
      const dataMap = {}
      data.forEach(item => {
        dataMap[item.symbol] = item
      })
      setRealtimeData(prev => ({ ...prev, ...dataMap }))
    }

    const unsubIndices = on('indices-update', handleIndicesUpdate)
    const unsubCommodities = on('commodities-update', handleCommoditiesUpdate)

    return () => {
      unsubscribe(['indices', 'commodities'])
      unsubIndices()
      unsubCommodities()
    }
  }, [subscribe, unsubscribe, on])

  const filteredIndices = indices.filter(item => {
    const searchLower = searchTerm.toLowerCase()
    return item.symbol.toLowerCase().includes(searchLower) ||
           item.name?.toLowerCase().includes(searchLower)
  })

  const filteredCommodities = commodities.filter(item => {
    const searchLower = searchTerm.toLowerCase()
    return item.symbol.toLowerCase().includes(searchLower) ||
           item.name?.toLowerCase().includes(searchLower)
  })

  const formatPrice = (price) => {
    if (!price) return '0.00'
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

  const getRealtimePrice = (symbol, fallbackPrice) => {
    return realtimeData[symbol]?.price || fallbackPrice || 0
  }

  const getRealtimeChange = (symbol) => {
    return realtimeData[symbol]?.changePercent || 0
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <FaChartLine className="text-blue-500" />
              Indices & Commodities
            </h1>
            <p className="text-gray-400 mt-1">Trade global indices and commodities 24/7</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search indices or commodities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCategory('all')}
              className={`px-4 py-2 rounded-lg transition ${
                category === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setCategory('indices')}
              className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                category === 'indices' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <FaChartBar /> Indices
            </button>
            <button
              onClick={() => setCategory('commodities')}
              className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                category === 'commodities' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <FaCoins /> Commodities
            </button>
          </div>
        </div>

        {(category === 'all' || category === 'indices') && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FaChartBar className="text-green-500" />
              Global Indices
            </h2>
            {loadingIndices ? (
              <LoadingSkeleton count={8} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4" />
            ) : indicesError ? (
              <ErrorState message="Failed to load indices" onRetry={refetchIndices} />
            ) : filteredIndices.length === 0 ? (
              <EmptyState message="No indices found" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredIndices.map((index) => {
                  const price = getRealtimePrice(index.symbol, index.price)
                  const change = getRealtimeChange(index.symbol)
                  const isPositive = change >= 0

                  return (
                    <Link
                      key={index.symbol}
                      to={`/trade/${index.symbol}?type=index`}
                      className="bg-gray-800 rounded-lg p-5 hover:bg-gray-750 transition group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-400 text-sm">{index.name}</span>
                        <span className="bg-blue-600 text-xs px-2 py-1 rounded">{index.symbol}</span>
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-2xl font-bold">${formatPrice(price)}</p>
                          <p className={`text-sm flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                            {isPositive ? <FaArrowUp /> : <FaArrowDown />}
                            {isPositive ? '+' : ''}{change.toFixed(2)}%
                          </p>
                        </div>
                        <div className="group-hover:scale-110 transition">
                          <FaChartLine className="text-gray-600 text-2xl" />
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {(category === 'all' || category === 'commodities') && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FaCoins className="text-yellow-500" />
              Commodities
            </h2>
            {loadingCommodities ? (
              <LoadingSkeleton count={5} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4" />
            ) : commoditiesError ? (
              <ErrorState message="Failed to load commodities" onRetry={refetchCommodities} />
            ) : filteredCommodities.length === 0 ? (
              <EmptyState message="No commodities found" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredCommodities.map((commodity) => {
                  const price = getRealtimePrice(commodity.symbol, commodity.price)
                  const change = getRealtimeChange(commodity.symbol)
                  const isPositive = change >= 0

                  return (
                    <Link
                      key={commodity.symbol}
                      to={`/trade/${commodity.symbol}?type=commodity`}
                      className="bg-gray-800 rounded-lg p-5 hover:bg-gray-750 transition group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-400 text-sm">{commodity.name}</span>
                        <span className="bg-yellow-600 text-xs px-2 py-1 rounded">{commodity.symbol}</span>
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-2xl font-bold">${formatPrice(price)}</p>
                          <p className={`text-sm flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                            {isPositive ? <FaArrowUp /> : <FaArrowDown />}
                            {isPositive ? '+' : ''}{change.toFixed(2)}%
                          </p>
                        </div>
                        <div className="group-hover:scale-110 transition">
                          <FaCoins className="text-gray-600 text-2xl" />
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Indices
