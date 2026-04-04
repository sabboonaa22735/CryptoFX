import { motion } from 'framer-motion'
import { useThemeStore } from '../../store/themeStore'

export const MiniLineChart = ({ data = [], height = 60, color = '#10b981' }) => {
  if (!data || data.length < 2) return null
  
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 100
    const y = 100 - ((val - min) / range) * 100
    return `${x},${y}`
  }).join(' ')
  
  const areaPoints = `0,100 ${points} 100,100`
  
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ height, width: '100%' }}>
      <defs>
        <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#gradient-${color.replace('#', '')})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

export const BarChart = ({ data = [], height = 120, color = '#3b82f6' }) => {
  if (!data || data.length === 0) return null
  
  const max = Math.max(...data.map(d => d.value))
  
  return (
    <div className="flex items-end gap-1" style={{ height }}>
      {data.map((item, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${(item.value / max) * 100}%` }}
          transition={{ delay: i * 0.05, duration: 0.5 }}
          className="flex-1 rounded-t"
          style={{ backgroundColor: color, opacity: 0.8 }}
          title={`${item.label}: ${item.value}`}
        />
      ))}
    </div>
  )
}

export const DonutChart = ({ data = [], size = 100, strokeWidth = 20 }) => {
  const { theme } = useThemeStore()
  if (!data || data.length === 0) return null
  
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  
  let offset = 0
  const segments = data.map((item, i) => {
    const percentage = (item.value / total) * 100
    const dashLength = (percentage / 100) * circumference
    const segment = {
      ...item,
      percentage,
      dashArray: `${dashLength} ${circumference - dashLength}`,
      dashOffset: -offset,
      color: item.color || ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][i % 5]
    }
    offset += dashLength
    return segment
  })
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
        {segments.map((segment, i) => (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={segment.color}
            strokeWidth={strokeWidth}
            strokeDasharray={segment.dashArray}
            strokeDashoffset={segment.dashOffset}
            className="transition-all duration-500"
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {total.toLocaleString()}
        </span>
      </div>
    </div>
  )
}

export const Sparkline = ({ data = [], width = 80, height = 30, positive = true }) => {
  if (!data || data.length < 2) return null
  
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const color = positive ? '#10b981' : '#ef4444'
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((val - min) / range) * height
    return `${x},${y}`
  })
  
  const pathD = points.reduce((acc, point, i) => {
    if (i === 0) return `M ${point}`
    return `${acc} L ${point}`
  }, '')
  
  return (
    <svg width={width} height={height}>
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" />
    </svg>
  )
}

export const StatCard = ({ label, value, change, changeType = 'neutral', icon: Icon, color = 'blue' }) => {
  const { theme } = useThemeStore()
  const colorMap = {
    blue: 'from-blue-400 to-blue-600',
    green: 'from-emerald-400 to-emerald-600',
    purple: 'from-violet-400 to-violet-600',
    orange: 'from-amber-400 to-amber-600',
    red: 'from-rose-400 to-rose-600'
  }
  
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`rounded-3xl p-6 border ${
        theme === 'dark' 
          ? 'bg-white/5 border-white/10' 
          : 'bg-white border-white/50 shadow-lg'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{label}</span>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center shadow-lg`}>
          {Icon && <Icon className="w-5 h-5 text-white" />}
        </div>
      </div>
      <p className={`text-2xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{value}</p>
      {change !== undefined && (
        <p className={`text-sm font-medium ${
          changeType === 'positive' ? 'text-emerald-400' : 
          changeType === 'negative' ? 'text-rose-400' : 
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          {changeType === 'positive' && '+'}
          {change}
        </p>
      )}
    </motion.div>
  )
}

export const AreaChart = ({ data = [], height = 200, color = '#3b82f6', label = 'Value' }) => {
  const { theme } = useThemeStore()
  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center h-${height} ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
        No data available
      </div>
    )
  }
  
  const values = data.map(d => d.value)
  const labels = data.map(d => d.label)
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = max - min || 1
  
  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * 100,
    y: 100 - ((d.value - min) / range) * 100
  }))
  
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = `${linePath} L 100 100 L 0 100 Z`
  
  return (
    <div style={{ height }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
        <defs>
          <linearGradient id={`area-gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#area-gradient-${color.replace('#', '')})`} />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="2"
            fill={color}
            className="opacity-0 hover:opacity-100 transition-opacity"
          />
        ))}
      </svg>
    </div>
  )
}
