import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FaSearch, FaChartLine, FaArrowUp, FaArrowDown, FaStar, FaFilter } from 'react-icons/fa'
import { useSocket } from '../contexts/SocketContext'

const Stocks = () => {
  const [stocks, setStocks] = useState([])
  const [sectors, setSectors] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSector, setSelectedSector] = useState('')
  const [sortBy, setSortBy] = useState('market_cap')
  const [sortOrder, setSortOrder] = useState('desc')
  const [realtimeData, setRealtimeData] = useState({})

  const { data: stocksData, isLoading } = useQuery({
    queryKey: ['stocks', selectedSector, sortBy, sortOrder],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (selectedSector) params.append('sector', selectedSector)
      params.append('sort', sortBy)
      params.append('order', sortOrder)
      const res = await fetch(`/api/stocks?${params}`)
      return res.json()
    },
    refetchInterval: 30000
  })

  const { data: sectorsData } = useQuery({
    queryKey: ['stock-sectors'],
    queryFn: async () => {
      const res = await fetch('/api/stocks/sectors')
      return res.json()
    }
  })

  useEffect(() => {
    if (stocksData) {
      setStocks(Array.isArray(stocksData) ? stocksData : [])
    }
    if (sectorsData) {
      setSectors(sectorsData)
    }
  }, [stocksData, sectorsData])

  const { subscribe, unsubscribe, on } = useSocket()

  useEffect(() => {
    subscribe(['stocks'])
    
    const handleUpdate = (data) => {
      const dataMap = {}
      data.forEach(item => {
        dataMap[item.symbol] = item
      })
      setRealtimeData(dataMap)
    }

    const unsubscribeHandler = on('stocks-update', handleUpdate)

    return () => {
      unsubscribe(['stocks'])
      unsubscribeHandler()
    }
  }, [subscribe, unsubscribe, on])

  const filteredStocks = stocks.filter(stock => {
    const searchLower = searchTerm.toLowerCase()
    return stock.symbol.toLowerCase().includes(searchLower) ||
           stock.name?.toLowerCase().includes(searchLower)
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

  const formatMarketCap = (marketCap) => {
    if (!marketCap) return '$0'
    if (marketCap >= 1e12) return '$' + (marketCap / 1e12).toFixed(2) + 'T'
    if (marketCap >= 1e9) return '$' + (marketCap / 1e9).toFixed(2) + 'B'
    if (marketCap >= 1e6) return '$' + (marketCap / 1e6).toFixed(2) + 'M'
    return '$' + marketCap.toString()
  }

  const getRealtimePrice = (symbol) => {
    return realtimeData[symbol]?.price || stocks.find(s => s.symbol === symbol)?.price || 0
  }

  const getRealtimeChange = (symbol) => {
    return realtimeData[symbol]?.changePercent || stocks.find(s => s.symbol === symbol)?.changePercent || 0
  }

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <FaChartLine className="text-green-500" />
              Stock Markets
            </h1>
            <p className="text-gray-400 mt-1">Trade real stocks from major exchanges</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search stocks by symbol or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-green-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
            >
              <option value="">All Sectors</option>
              {sectors.map(sector => (
                <option key={sector.id} value={sector.id}>{sector.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Symbol</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
                  <th 
                    className="px-6 py-4 text-right text-sm font-semibold cursor-pointer hover:text-green-400"
                    onClick={() => handleSort('price')}
                  >
                    Price {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-6 py-4 text-right text-sm font-semibold cursor-pointer hover:text-green-400"
                    onClick={() => handleSort('change')}
                  >
                    24h Change {sortBy === 'change' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-6 py-4 text-right text-sm font-semibold cursor-pointer hover:text-green-400 hidden md:table-cell"
                    onClick={() => handleSort('volume')}
                  >
                    Volume {sortBy === 'volume' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-6 py-4 text-right text-sm font-semibold cursor-pointer hover:text-green-400 hidden lg:table-cell"
                    onClick={() => handleSort('market_cap')}
                  >
                    Market Cap {sortBy === 'market_cap' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold hidden lg:table-cell">Sector</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Trade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {isLoading ? (
                  [...Array(10)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 bg-gray-700 rounded w-16"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-700 rounded w-32"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-700 rounded w-20 ml-auto"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-700 rounded w-16 ml-auto"></div></td>
                      <td className="px-6 py-4 hidden md:table-cell"><div className="h-4 bg-gray-700 rounded w-20 ml-auto"></div></td>
                      <td className="px-6 py-4 hidden lg:table-cell"><div className="h-4 bg-gray-700 rounded w-24 ml-auto"></div></td>
                      <td className="px-6 py-4 hidden lg:table-cell"><div className="h-4 bg-gray-700 rounded w-24 mx-auto"></div></td>
                      <td className="px-6 py-4"><div className="h-8 bg-gray-700 rounded w-16 mx-auto"></div></td>
                    </tr>
                  ))
                ) : filteredStocks.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                      No stocks found matching your criteria
                    </td>
                  </tr>
                ) : (
                  filteredStocks.map((stock) => {
                    const price = getRealtimePrice(stock.symbol)
                    const change = getRealtimeChange(stock.symbol)
                    const isPositive = change >= 0

                    return (
                      <tr key={stock.symbol} className="hover:bg-gray-750 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-green-400">{stock.symbol}</span>
                            {stock.exchange && (
                              <span className="text-xs text-gray-500">{stock.exchange}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-300">{stock.name}</td>
                        <td className="px-6 py-4 text-right font-semibold">${formatPrice(price)}</td>
                        <td className={`px-6 py-4 text-right font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                          <div className="flex items-center justify-end gap-1">
                            {isPositive ? <FaArrowUp /> : <FaArrowDown />}
                            {isPositive ? '+' : ''}{change.toFixed(2)}%
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-gray-400 hidden md:table-cell">
                          {formatVolume(stock.volume)}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-400 hidden lg:table-cell">
                          {formatMarketCap(stock.marketCap)}
                        </td>
                        <td className="px-6 py-4 text-center hidden lg:table-cell">
                          <span className="text-xs bg-gray-700 px-2 py-1 rounded">
                            {stock.sector}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            to={`/trade/${stock.symbol}?type=stock`}
                            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-semibold transition block text-center"
                          >
                            Trade
                          </Link>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Stocks
