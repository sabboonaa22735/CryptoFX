import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaBitcoin, FaEthereum, FaWallet, FaCopy, FaCheck, FaTimes, 
  FaExclamationTriangle, FaQuestionCircle, FaQrcode, FaUpload,
  FaImage, FaFileAlt, FaCheckCircle, FaClock, FaSpinner,
  FaInfoCircle, FaChevronRight, FaChevronLeft, FaRedo,
  FaEye, FaEyeSlash, FaCloudUploadAlt, FaTrash, FaDownload,
  FaLock, FaHeadset
} from 'react-icons/fa'
import { 
  FiActivity, FiAlertTriangle, FiCheck, FiX, FiClock, 
  FiUpload, FiDownload, FiRefreshCw, FiHelpCircle, FiCopy
} from 'react-icons/fi'
import { QRCodeSVG } from 'qrcode.react'

export const COIN_CONFIG = {
  BTC: { 
    name: 'Bitcoin', symbol: 'BTC', color: 'from-orange-400 to-yellow-500',
    bgColor: 'bg-orange-500/10', textColor: 'text-orange-400', borderColor: 'border-orange-500/30',
    icon: '₿', network: 'Bitcoin Network', fees: '~0.0001 BTC', confirmations: '3 confirmations'
  },
  ETH: { 
    name: 'Ethereum', symbol: 'ETH', color: 'from-purple-500 to-blue-500',
    bgColor: 'bg-purple-500/10', textColor: 'text-purple-400', borderColor: 'border-purple-500/30',
    icon: 'Ξ', network: 'Ethereum (ERC-20)', fees: '~0.005 ETH', confirmations: '12 confirmations'
  },
  USDT: { 
    name: 'Tether', symbol: 'USDT', color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/10', textColor: 'text-green-400', borderColor: 'border-green-500/30',
    icon: '₮', network: 'TRC-20 / ERC-20', fees: '~1 USDT', confirmations: '6 confirmations'
  },
  SOL: { 
    name: 'Solana', symbol: 'SOL', color: 'from-purple-400 via-pink-500 to-orange-400',
    bgColor: 'bg-purple-500/10', textColor: 'text-purple-400', borderColor: 'border-purple-500/30',
    icon: '◎', network: 'Solana Network', fees: '~0.00025 SOL', confirmations: '1 confirmation'
  },
  XRP: { 
    name: 'Ripple', symbol: 'XRP', color: 'from-gray-500 to-slate-600',
    bgColor: 'bg-gray-500/10', textColor: 'text-gray-400', borderColor: 'border-gray-500/30',
    icon: '✕', network: 'Ripple Network', fees: '~0.02 XRP', confirmations: '1 confirmation'
  },
  BNB: { 
    name: 'BNB', symbol: 'BNB', color: 'from-yellow-400 to-amber-500',
    bgColor: 'bg-yellow-500/10', textColor: 'text-yellow-400', borderColor: 'border-yellow-500/30',
    icon: '◈', network: 'BNB Chain', fees: '~0.003 BNB', confirmations: '15 confirmations'
  },
  ADA: { 
    name: 'Cardano', symbol: 'ADA', color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10', textColor: 'text-blue-400', borderColor: 'border-blue-500/30',
    icon: '₳', network: 'Cardano Network', fees: '~1 ADA', confirmations: '3 confirmations'
  },
  DOGE: { 
    name: 'Dogecoin', symbol: 'DOGE', color: 'from-yellow-300 to-yellow-500',
    bgColor: 'bg-yellow-500/10', textColor: 'text-yellow-400', borderColor: 'border-yellow-500/30',
    icon: 'Ð', network: 'Dogecoin Network', fees: '~1 DOGE', confirmations: '6 confirmations'
  },
}

export const Button = ({ 
  children, variant = 'primary', size = 'md', isLoading = false, 
  disabled = false, icon: Icon, iconPosition = 'left',
  className = '', onClick, ...props 
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50',
    secondary: 'bg-white/10 hover:bg-white/20 text-white border border-white/20',
    ghost: 'bg-transparent hover:bg-white/10 text-white/80 hover:text-white',
    danger: 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/30',
    success: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-lg',
    md: 'px-4 py-2.5 text-sm rounded-xl',
    lg: 'px-6 py-3 text-base rounded-xl',
    xl: 'px-8 py-4 text-lg rounded-2xl',
  }

  return (
    <motion.button
      whileHover={!disabled && !isLoading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        font-semibold transition-all duration-200 flex items-center justify-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
        />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-5 h-5" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className="w-5 h-5" />}
        </>
      )}
    </motion.button>
  )
}

export const CopyButton = ({ text, successMessage = 'Copied!', theme, size = 'md' }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy')
    }
  }

  const sizes = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  }

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleCopy}
      className={`rounded-lg transition-all ${sizes[size]} ${
        copied
          ? 'bg-emerald-500/20 text-emerald-400'
          : theme === 'dark'
            ? 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700'
      }`}
      title="Copy to clipboard"
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
            <FaCheck className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
          </motion.div>
        ) : (
          <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
            <FiCopy className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

export const NetworkBadge = ({ coin, theme, size = 'md' }) => {
  const config = COIN_CONFIG[coin] || COIN_CONFIG.BTC
  
  const sizes = {
    sm: 'px-2 py-1 gap-1',
    md: 'px-3 py-1.5 gap-2',
    lg: 'px-4 py-2 gap-2',
  }

  const iconSizes = {
    sm: 'w-4 h-4 text-[10px]',
    md: 'w-5 h-5 text-xs',
    lg: 'w-6 h-6 text-sm',
  }

  const textSizes = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`inline-flex items-center rounded-full ${config.bgColor} border ${config.borderColor} ${sizes[size]}`}
    >
      <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center text-white font-bold text-xs ${iconSizes[size].replace('w-', 'text-').replace(' h-5', '')}`}>
        {config.icon}
      </div>
      <span className={`font-medium ${textSizes[size]} ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        {config.name} ({config.symbol})
      </span>
    </motion.div>
  )
}

export const Input = ({ 
  label, error, helper, icon: Icon, rightElement, 
  className = '', theme, ...props 
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-white/80' : 'text-gray-700'}`}>
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-white/40' : 'text-gray-400'}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          className={`
            w-full px-4 py-3 rounded-xl transition-all outline-none
            ${Icon ? 'pl-12' : ''}
            ${rightElement ? 'pr-12' : ''}
            ${theme === 'dark'
              ? 'bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:border-yellow-500/50'
              : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-yellow-500/50'
            }
            ${error ? 'border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {helper && <p className={`text-xs ${theme === 'dark' ? 'text-white/40' : 'text-gray-400'}`}>{helper}</p>}
    </div>
  )
}

export const Select = ({ options, label, value, onChange, theme, className = '' }) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-white/80' : 'text-gray-700'}`}>
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        className={`
          w-full px-4 py-3 rounded-xl transition-all outline-none cursor-pointer
          ${theme === 'dark'
            ? 'bg-white/5 border border-white/10 text-white focus:border-yellow-500/50'
            : 'bg-gray-50 border border-gray-200 text-gray-900 focus:border-yellow-500/50'
          }
          ${className}
        `}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}

export const Card = ({ children, className = '', theme, glow = false, padding = 'md' }) => {
  const paddings = {
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6',
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`
        rounded-2xl transition-all duration-300
        ${theme === 'dark'
          ? glow
            ? 'bg-gradient-to-br from-yellow-500/10 to-amber-500/5 border border-yellow-500/20 shadow-lg shadow-yellow-500/10'
            : 'bg-white/5 border border-white/10'
          : glow
            ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 shadow-lg'
            : 'bg-white border border-gray-200 shadow-sm'
        }
        ${paddings[padding]}
        ${className}
      `}
    >
      {children}
    </motion.div>
  )
}

export const Toggle = ({ checked, onChange, label, theme }) => {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <motion.div
        whileTap={{ scale: 0.95 }}
        onClick={() => onChange(!checked)}
        className={`
          relative w-14 h-8 rounded-full p-1 cursor-pointer transition-colors
          ${checked ? 'bg-gradient-to-r from-yellow-500 to-amber-500' : theme === 'dark' ? 'bg-white/20' : 'bg-gray-300'}
        `}
      >
        <motion.div
          animate={{ x: checked ? 24 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="w-6 h-6 rounded-full bg-white shadow-lg flex items-center justify-center"
        >
          {checked && <FaCheck className="w-3 h-3 text-yellow-500" />}
        </motion.div>
      </motion.div>
      {label && (
        <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
          {label}
        </span>
      )}
    </label>
  )
}

export const CountdownTimer = ({ expiresAt, onExpire, theme, size = 'md' }) => {
  const [timeLeft, setTimeLeft] = useState({ minutes: 30, seconds: 0 })

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime()
      const distance = expiresAt - now
      
      if (distance < 0) {
        clearInterval(interval)
        onExpire?.()
        return
      }

      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)
      setTimeLeft({ minutes, seconds })
    }, 1000)

    return () => clearInterval(interval)
  }, [expiresAt, onExpire])

  const isLow = timeLeft.minutes < 5
  const isCritical = timeLeft.minutes < 2

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center justify-center gap-2 rounded-xl ${
        isCritical 
          ? 'bg-red-500/20 border border-red-500/40 animate-pulse' 
          : isLow 
            ? 'bg-red-500/10 border border-red-500/30' 
            : theme === 'dark'
              ? 'bg-white/5 border border-white/10'
              : 'bg-gray-100 border border-gray-200'
      }`}
    >
      <FiClock className={`w-4 h-4 ${isLow ? 'text-red-400 animate-pulse' : theme === 'dark' ? 'text-white/60' : 'text-gray-500'}`} />
      <span className={`font-mono font-bold ${isCritical ? 'text-red-400' : isLow ? 'text-red-300' : theme === 'dark' ? 'text-white/80' : 'text-gray-600'} ${
        size === 'sm' ? 'text-sm' : 'text-base'
      }`}>
        {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
      </span>
    </motion.div>
  )
}

export const QRCode = ({ value, size = 160, theme, showLabel = true, label }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={{ scale: isHovered ? 1.05 : 1 }}
      className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-white' : 'bg-white border border-gray-200'} shadow-lg`}
    >
      <QRCodeSVG
        value={value}
        size={size}
        level="H"
        bgColor={theme === 'dark' ? '#ffffff' : '#ffffff'}
        fgColor={theme === 'dark' ? '#000000' : '#000000'}
      />
    </motion.div>
  )
}

export const FileUpload = ({ onUpload, theme, accept = 'image/*,.pdf', maxSize = 10 }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const fileInputRef = useRef(null)

  const handleFile = (file) => {
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`)
      return
    }
    setFile(file)
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target.result)
      reader.readAsDataURL(file)
    }
    onUpload?.(file)
  }

  const removeFile = () => {
    setFile(null)
    setPreview(null)
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
        className="hidden"
      />

      {!file ? (
        <motion.div
          onDragEnter={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false) }}
          onDragOver={(e) => { e.preventDefault() }}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); e.dataTransfer.files[0] && handleFile(e.dataTransfer.files[0]) }}
          onClick={() => fileInputRef.current?.click()}
          animate={{
            scale: isDragging ? 1.02 : 1,
            borderColor: isDragging ? 'rgba(234, 179, 8, 0.5)' : undefined
          }}
          className={`
            relative overflow-hidden rounded-xl border-2 border-dashed cursor-pointer transition-all text-center py-12
            ${isDragging
              ? 'border-yellow-500 bg-yellow-500/5'
              : theme === 'dark'
                ? 'border-white/10 hover:border-white/20 bg-white/5'
                : 'border-gray-200 hover:border-gray-300 bg-gray-50'
            }
          `}
        >
          <FaCloudUploadAlt className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-white/40' : 'text-gray-400'}`} />
          <p className={`font-medium mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {isDragging ? 'Drop file here' : 'Drag & drop or click to upload'}
          </p>
          <p className={`text-sm ${theme === 'dark' ? 'text-white/40' : 'text-gray-400'}`}>
            PNG, JPG, PDF up to {maxSize}MB
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`rounded-xl overflow-hidden ${theme === 'dark' ? 'bg-black/20 border border-white/10' : 'bg-white border border-gray-200'}`}
        >
          {preview ? (
            <div className="relative">
              <img src={preview} alt="Preview" className="w-full h-48 object-cover" />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={removeFile}
                className="absolute top-3 right-3 p-2 rounded-lg bg-red-500/80 text-white hover:bg-red-500"
              >
                <FaTrash className="w-4 h-4" />
              </motion.button>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${theme === 'dark' ? 'bg-white/10' : 'bg-gray-100'}`}>
                <FaFileAlt className={`w-6 h-6 ${theme === 'dark' ? 'text-white/60' : 'text-gray-400'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{file.name}</p>
                <p className={`text-sm ${theme === 'dark' ? 'text-white/40' : 'text-gray-400'}`}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={removeFile} className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30">
                <FaTimes className="w-4 h-4" />
              </motion.button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}

export const Alert = ({ message, type = 'info', theme, icon: CustomIcon }) => {
  const configs = {
    warning: {
      bg: theme === 'dark' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200',
      icon: FaExclamationTriangle,
      iconColor: 'text-amber-500',
      textColor: theme === 'dark' ? 'text-amber-300' : 'text-amber-800',
    },
    danger: {
      bg: theme === 'dark' ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200',
      icon: FaExclamationTriangle,
      iconColor: 'text-red-500',
      textColor: theme === 'dark' ? 'text-red-300' : 'text-red-800',
    },
    success: {
      bg: theme === 'dark' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200',
      icon: FaCheckCircle,
      iconColor: 'text-emerald-500',
      textColor: theme === 'dark' ? 'text-emerald-300' : 'text-emerald-800',
    },
    info: {
      bg: theme === 'dark' ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-200',
      icon: FaInfoCircle,
      iconColor: 'text-blue-500',
      textColor: theme === 'dark' ? 'text-blue-300' : 'text-blue-800',
    },
  }

  const { bg, icon, iconColor, textColor } = configs[type]
  const Icon = CustomIcon || icon

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start gap-3 p-4 rounded-xl ${bg}`}
    >
      <Icon className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`} />
      <p className={`text-sm ${textColor}`}>{message}</p>
    </motion.div>
  )
}

export const ProgressStepper = ({ steps, currentStep, theme }) => {
  return (
    <div className="flex items-center justify-center gap-4 py-6">
      {steps.map((step, index) => {
        const isActive = currentStep === step.id
        const isCompleted = currentStep > step.id
        const Icon = step.icon
        
        return (
          <div key={step.id} className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: isActive ? 1.1 : 1 }}
              className={`flex items-center gap-3 px-4 py-2 rounded-full transition-all ${
                isActive 
                  ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg shadow-yellow-500/30' 
                  : isCompleted
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : theme === 'dark'
                      ? 'bg-white/5 text-white/40 border border-white/10'
                      : 'bg-gray-100 text-gray-400 border border-gray-200'
              }`}
            >
              {isCompleted ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                  <FaCheck className="w-3 h-3 text-white" />
                </motion.div>
              ) : (
                <Icon className="w-5 h-5" />
              )}
              <span className="font-medium text-sm hidden sm:inline">{step.label}</span>
            </motion.div>
            
            {index < steps.length - 1 && (
              <motion.div
                animate={{ scaleX: isCompleted ? 1 : 0 }}
                className={`w-12 h-0.5 rounded-full origin-left ${
                  isCompleted ? 'bg-emerald-500' : theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

export const TransactionStatusTracker = ({ status, theme }) => {
  const steps = [
    { id: 'pending', label: 'Pending', icon: FaClock },
    { id: 'confirming', label: 'Confirming', icon: FaSpinner },
    { id: 'completed', label: 'Completed', icon: FaCheckCircle },
  ]

  const currentIndex = steps.findIndex(s => s.id === status)

  return (
    <div className="flex items-center justify-between gap-2">
      {steps.map((step, index) => {
        const isActive = index === currentIndex
        const isCompleted = index < currentIndex
        const Icon = step.icon
        
        return (
          <div key={step.id} className="flex-1 flex items-center">
            <div className="flex flex-col items-center">
              <motion.div
                animate={isActive && step.id === 'confirming' ? { rotate: 360 } : {}}
                transition={step.id === 'confirming' ? { duration: 2, repeat: Infinity, ease: 'linear' } : {}}
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isCompleted
                    ? 'bg-emerald-500 text-white'
                    : isActive
                      ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/30'
                      : theme === 'dark'
                        ? 'bg-white/10 text-white/40'
                        : 'bg-gray-200 text-gray-400'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive && step.id === 'confirming' ? 'animate-spin' : ''}`} />
              </motion.div>
              <span className={`mt-2 text-xs font-medium ${
                isActive || isCompleted
                  ? theme === 'dark' ? 'text-white' : 'text-gray-900'
                  : theme === 'dark' ? 'text-white/40' : 'text-gray-400'
              }`}>
                {step.label}
              </span>
            </div>
            
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 rounded-full ${
                isCompleted
                  ? 'bg-emerald-500'
                  : theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'
              }`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export const Toast = ({ message, type = 'success', onClose }) => {
  const configs = {
    success: { bg: 'bg-emerald-500', icon: FaCheck },
    error: { bg: 'bg-red-500', icon: FaTimes },
    info: { bg: 'bg-blue-500', icon: FaInfoCircle },
  }

  const { bg, icon: Icon } = configs[type]

  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl ${bg} text-white shadow-2xl flex items-center gap-3`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{message}</span>
    </motion.div>
  )
}

export const Tooltip = ({ children, content, theme }) => {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className={`
              absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap
              ${theme === 'dark'
                ? 'bg-gray-800 text-white'
                : 'bg-gray-900 text-white'
              }
              shadow-lg z-50
            `}
          >
            {content}
            <div className={`
              absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 
              border-l-8 border-r-8 border-t-8 border-transparent
              ${theme === 'dark' ? 'border-t-gray-800' : 'border-t-gray-900'}
            `} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
