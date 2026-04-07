import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaBitcoin, FaEthereum, FaWallet, FaCopy, FaCheck, FaTimes, 
  FaExclamationTriangle, FaQuestionCircle, FaQrcode, FaUpload,
  FaImage, FaFileAlt, FaCheckCircle, FaClock, FaSpinner,
  FaInfoCircle, FaChevronRight, FaChevronLeft, FaRedo,
  FaEye, FaEyeSlash, FaCloudUploadAlt, FaTrash, FaDownload,
  FaCog, FaHeadset, FaLock
} from 'react-icons/fa'
import { 
  FiActivity, FiAlertTriangle, FiCheck, FiX, FiClock, 
  FiUpload, FiDownload, FiRefreshCw, FiHelpCircle, FiCopy
} from 'react-icons/fi'
import { useThemeStore } from '../store/themeStore'
import { QRCodeSVG } from 'qrcode.react'
import { api } from '../store/authStore'

const COIN_CONFIG = {
  BTC: { 
    name: 'Bitcoin', 
    symbol: 'BTC', 
    color: 'from-orange-400 to-yellow-500',
    bgColor: 'bg-orange-500/10',
    textColor: 'text-orange-400',
    borderColor: 'border-orange-500/30',
    icon: '₿',
    network: 'Bitcoin Network',
    fees: '~0.0001 BTC',
    confirmations: '3 confirmations'
  },
  ETH: { 
    name: 'Ethereum', 
    symbol: 'ETH', 
    color: 'from-purple-500 to-blue-500',
    bgColor: 'bg-purple-500/10',
    textColor: 'text-purple-400',
    borderColor: 'border-purple-500/30',
    icon: 'Ξ',
    network: 'Ethereum (ERC-20)',
    fees: '~0.005 ETH',
    confirmations: '12 confirmations'
  },
  USDT: { 
    name: 'Tether', 
    symbol: 'USDT', 
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/10',
    textColor: 'text-green-400',
    borderColor: 'border-green-500/30',
    icon: '₮',
    network: 'TRC-20 / ERC-20',
    fees: '~1 USDT',
    confirmations: '6 confirmations'
  },
  SOL: { 
    name: 'Solana', 
    symbol: 'SOL', 
    color: 'from-purple-400 via-pink-500 to-orange-400',
    bgColor: 'bg-purple-500/10',
    textColor: 'text-purple-400',
    borderColor: 'border-purple-500/30',
    icon: '◎',
    network: 'Solana Network',
    fees: '~0.00025 SOL',
    confirmations: '1 confirmation'
  },
}

const ProgressStepper = ({ currentStep, theme }) => {
  const steps = [
    { id: 1, label: 'Select Network', icon: FaCog },
    { id: 2, label: 'Confirm Deposit', icon: FaWallet },
  ]

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
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center"
                >
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

const CountdownTimer = ({ expiresAt, onExpire, theme }) => {
  const [timeLeft, setTimeLeft] = useState({ minutes: 30, seconds: 0 })

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime()
      const distance = expiresAt - now
      
      if (distance < 0) {
        clearInterval(interval)
        onExpire()
        return
      }

      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)
      setTimeLeft({ minutes, seconds })
    }, 1000)

    return () => clearInterval(interval)
  }, [expiresAt, onExpire])

  const isLow = timeLeft.minutes < 5

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl ${
        isLow 
          ? 'bg-red-500/10 border border-red-500/30' 
          : theme === 'dark'
            ? 'bg-white/5 border border-white/10'
            : 'bg-gray-100 border border-gray-200'
      }`}
    >
      <FiClock className={`w-4 h-4 ${isLow ? 'text-red-400' : theme === 'dark' ? 'text-white/60' : 'text-gray-500'}`} />
      <span className={`text-sm font-medium ${isLow ? 'text-red-400' : theme === 'dark' ? 'text-white/80' : 'text-gray-600'}`}>
        Time remaining: {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
      </span>
    </motion.div>
  )
}

const CopyButton = ({ text, successMessage = 'Copied!', theme }) => {
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

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleCopy}
      className={`p-2 rounded-lg transition-all ${
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
          <motion.div
            key="check"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <FaCheck className="w-4 h-4" />
          </motion.div>
        ) : (
          <motion.div
            key="copy"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <FiCopy className="w-4 h-4" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

const NetworkBadge = ({ coin, theme }) => {
  const config = COIN_CONFIG[coin] || COIN_CONFIG.BTC
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${config.bgColor} border ${config.borderColor}`}
    >
      <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center text-white text-xs font-bold`}>
        {config.icon}
      </div>
      <span className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        {config.name} ({config.symbol})
      </span>
    </motion.div>
  )
}

const DepositAmountCard = ({ amount, coin, rate, theme }) => {
  const config = COIN_CONFIG[coin] || COIN_CONFIG.BTC
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-3xl p-6 ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-yellow-500/10 to-amber-500/5 border border-yellow-500/20'
          : 'bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 shadow-lg'
      }`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-500/20 to-transparent rounded-full blur-2xl" />
      
      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center`}>
            <span className="text-white font-bold text-sm">{config.icon}</span>
          </div>
          <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white/60' : 'text-gray-500'}`}>
            Deposit Amount
          </span>
        </div>
        
        <div className="flex items-baseline gap-3 mb-3">
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`text-4xl md:text-5xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
          >
            {amount}
          </motion.span>
          <span className={`text-xl font-bold ${config.textColor}`}>{coin}</span>
        </div>
        
        <div className={`flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-white/50' : 'text-gray-500'}`}>
          <span>≈</span>
          <span className="font-semibold">${(amount * rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</span>
        </div>
        
        <div className="mt-4 pt-4 border-t border-yellow-500/10">
          <div className="flex items-center justify-between">
            <span className={`text-xs ${theme === 'dark' ? 'text-white/40' : 'text-gray-400'}`}>
              Network Fee: {config.fees}
            </span>
            <span className={`text-xs ${theme === 'dark' ? 'text-white/40' : 'text-gray-400'}`}>
              Min: 0.0001 {coin}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const WalletAddressCard = ({ address, coin, theme }) => {
  const [showQR, setShowQR] = useState(false)
  const config = COIN_CONFIG[coin] || COIN_CONFIG.BTC
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className={`rounded-2xl p-5 ${
        theme === 'dark'
          ? 'bg-white/5 border border-white/10'
          : 'bg-gray-50 border border-gray-200'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FaWallet className={`w-4 h-4 ${config.textColor}`} />
          <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Wallet Address
          </span>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowQR(!showQR)}
          className={`p-2 rounded-lg ${
            showQR
              ? 'bg-yellow-500/20 text-yellow-400'
              : theme === 'dark'
                ? 'bg-white/5 text-white/60 hover:bg-white/10'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          <FaQrcode className="w-4 h-4" />
        </motion.button>
      </div>
      
      <AnimatePresence mode="wait">
        {showQR ? (
          <motion.div
            key="qr"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center justify-center py-4"
          >
            <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-white' : 'bg-white border border-gray-200'}`}>
              <QRCodeSVG
                value={address}
                size={160}
                level="H"
                bgColor={theme === 'dark' ? '#ffffff' : '#ffffff'}
                fgColor={theme === 'dark' ? '#000000' : '#000000'}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="address"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className={`flex items-center gap-2 p-3 rounded-xl ${
              theme === 'dark' ? 'bg-black/20' : 'bg-white border border-gray-200'
            }`}>
              <code className={`flex-1 font-mono text-sm break-all ${theme === 'dark' ? 'text-white/80' : 'text-gray-700'}`}>
                {address}
              </code>
              <CopyButton text={address} theme={theme} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className={`mt-4 p-3 rounded-xl ${
          theme === 'dark'
            ? 'bg-amber-500/10 border border-amber-500/20'
            : 'bg-amber-50 border border-amber-200'
        }`}
      >
        <div className="flex items-start gap-2">
          <FaExclamationTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <p className={`text-xs ${theme === 'dark' ? 'text-amber-300' : 'text-amber-700'}`}>
            Only send <span className="font-bold">{coin}</span> to this address. Sending other assets may result in permanent loss.
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

const FileUpload = ({ onUpload, theme }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const fileInputRef = useRef(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragIn = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragOut = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }

  const handleFile = (file) => {
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      return
    }
    setFile(file)
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target.result)
      reader.readAsDataURL(file)
    }
    onUpload(file)
  }

  const removeFile = () => {
    setFile(null)
    setPreview(null)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={`rounded-2xl p-5 ${
        theme === 'dark'
          ? 'bg-white/5 border border-white/10'
          : 'bg-gray-50 border border-gray-200'
      }`}
    >
      <div className="flex items-center gap-2 mb-4">
        <FaImage className={`w-4 h-4 ${config?.textColor || 'text-yellow-400'}`} />
        <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Proof of Payment
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
        className="hidden"
      />

      {!file ? (
        <motion.div
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          animate={{
            scale: isDragging ? 1.02 : 1,
            borderColor: isDragging 
              ? 'rgba(234, 179, 8, 0.5)' 
              : theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(209, 213, 219, 1)'
          }}
          className={`relative overflow-hidden rounded-xl border-2 border-dashed cursor-pointer transition-all ${
            isDragging
              ? 'border-yellow-500 bg-yellow-500/5'
              : theme === 'dark'
                ? 'border-white/10 hover:border-white/20 bg-white/5'
                : 'border-gray-200 hover:border-gray-300 bg-gray-50'
          }`}
        >
          <div className="py-12 px-6 text-center">
            <motion.div
              animate={{ y: isDragging ? -10 : 0 }}
              className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                theme === 'dark'
                  ? 'bg-white/10'
                  : 'bg-gray-100'
              }`}
            >
              <FaCloudUploadAlt className={`w-8 h-8 ${theme === 'dark' ? 'text-white/60' : 'text-gray-400'}`} />
            </motion.div>
            <p className={`font-medium mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {isDragging ? 'Drop file here' : 'Drag & drop or click to upload'}
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-white/40' : 'text-gray-400'}`}>
              PNG, JPG, PDF up to 10MB
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`rounded-xl overflow-hidden ${
            theme === 'dark'
              ? 'bg-black/20 border border-white/10'
              : 'bg-white border border-gray-200'
          }`}
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
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                theme === 'dark' ? 'bg-white/10' : 'bg-gray-100'
              }`}>
                <FaFileAlt className={`w-6 h-6 ${theme === 'dark' ? 'text-white/60' : 'text-gray-400'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {file.name}
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-white/40' : 'text-gray-400'}`}>
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={removeFile}
                className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
              >
                <FaTimes className="w-4 h-4" />
              </motion.button>
            </div>
          )}
        </motion.div>
      )}

      <p className={`mt-3 text-xs ${theme === 'dark' ? 'text-white/40' : 'text-gray-400'}`}>
        Upload a screenshot of your transaction for verification
      </p>
    </motion.div>
  )
}

const TransactionStatusTracker = ({ status, theme }) => {
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
                animate={isActive ? { rotate: step.id === 'confirming' ? 360 : 0 } : {}}
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

const WarningAlert = ({ message, type = 'warning', theme }) => {
  const config = {
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
    info: {
      bg: theme === 'dark' ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-200',
      icon: FaInfoCircle,
      iconColor: 'text-blue-500',
      textColor: theme === 'dark' ? 'text-blue-300' : 'text-blue-800',
    },
  }

  const { bg, icon: Icon, iconColor, textColor } = config[type]

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

const Toast = ({ message, type = 'success', onClose }) => {
  const config = {
    success: {
      bg: 'bg-emerald-500',
      icon: FaCheck,
    },
    error: {
      bg: 'bg-red-500',
      icon: FaTimes,
    },
    info: {
      bg: 'bg-blue-500',
      icon: FaInfoCircle,
    },
  }

  const { bg, icon: Icon } = config[type]

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

export default function DepositConfirmation({ coin = 'BTC' }) {
  const { theme, initTheme } = useThemeStore()
  const [currentStep, setCurrentStep] = useState(2)
  const [isLoading, setIsLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState('success')
  const [isExpired, setIsExpired] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [transactionStatus, setTransactionStatus] = useState('pending')
  const [depositSettings, setDepositSettings] = useState(null)
  const [currentAddress, setCurrentAddress] = useState('')
  const [currentMemo, setCurrentMemo] = useState('')

  useEffect(() => {
    initTheme()
    fetchDepositSettings()
  }, [initTheme])

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const upperCoin = coin.toUpperCase()
        const res = await api.get(`/api/deposits/deposit-addresses/${upperCoin}`).catch(() => ({ data: null }))
        if (res.data) {
          setCurrentAddress(res.data.address || '')
          setCurrentMemo(res.data.memo || '')
        } else {
          const allRes = await api.get('/api/deposits/deposit-addresses').catch(() => ({ data: null }))
          if (allRes.data && Array.isArray(allRes.data)) {
            const addr = allRes.data.find(a => a.symbol === upperCoin)
            if (addr) {
              setCurrentAddress(addr.address || '')
              setCurrentMemo(addr.memo || '')
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch deposit address:', error)
      }
    }
    if (coin) {
      fetchAddress()
    }
  }, [coin])

  const fetchDepositSettings = async () => {
    try {
      const res = await api.get('/api/deposits/settings').catch(() => ({ data: null }))
      if (res.data) {
        setDepositSettings(res.data)
      }
    } catch (error) {
      console.error('Failed to fetch deposit settings:', error)
    }
  }

  const config = COIN_CONFIG[coin] || COIN_CONFIG.BTC
  const timeoutMinutes = depositSettings?.general?.paymentTimeoutMinutes || 30
  const expiresAt = new Date().getTime() + timeoutMinutes * 60 * 1000

  const depositData = {
    amount: '0.025',
    address: currentAddress,
    rate: 67500,
  }

  const notify = (message, type = 'success') => {
    setToastMessage(message)
    setToastType(type)
    setShowToast(true)
  }

  const handleExpire = () => {
    setIsExpired(true)
    notify('Payment window expired', 'error')
  }

  const handleConfirm = async () => {
    if (!uploadedFile) {
      notify('Please upload proof of payment', 'error')
      return
    }

    setIsLoading(true)
    setTransactionStatus('pending')
    notify('Deposit submitted! Waiting for admin approval...', 'info')
    
    let transactionId = null
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: depositData.amount,
          coin: coin,
          transactionHash: 'demo-tx-' + Date.now()
        })
      })
      
      if (res.ok) {
        const data = await res.json()
        transactionId = data.transaction?._id || data.id
        if (transactionId) {
          startPollingStatus(transactionId)
        }
      }
    } catch (error) {
      console.log('Deposit API call failed, using demo mode')
    }
    
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsLoading(false)
  }

  const startPollingStatus = (transactionId) => {
    const pollInterval = setInterval(async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`/api/wallet/${transactionId}/status`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        if (res.ok) {
          const data = await res.json()
          if (data.status === 'completed') {
            setTransactionStatus('completed')
            clearInterval(pollInterval)
            notify('Deposit approved and completed!', 'success')
          } else if (data.status === 'confirm' || data.status === 'confirmed') {
            setTransactionStatus('confirm')
            clearInterval(pollInterval)
            notify('Deposit confirmed by admin!', 'success')
          } else if (data.status === 'rejected') {
            setTransactionStatus('rejected')
            clearInterval(pollInterval)
            notify('Deposit was rejected by admin', 'error')
          }
        }
      } catch (error) {
        console.log('Status poll failed:', error)
      }
    }, 3000)
  }

  const handleFileUpload = (file) => {
    setUploadedFile(file)
    notify('File uploaded successfully')
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950'
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
    }`}>
      <AnimatePresence>
        {showToast && (
          <Toast message={toastMessage} type={toastType} onClose={() => setShowToast(false)} />
        )}
      </AnimatePresence>

      <div className="max-w-lg mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-3xl overflow-hidden ${
            theme === 'dark'
              ? 'bg-gray-900/80 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50'
              : 'bg-white border border-gray-200 shadow-2xl shadow-gray-200/50'
          }`}
        >
          <div className={`p-6 ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-yellow-500/10 to-amber-500/5 border-b border-white/5'
              : 'bg-gradient-to-r from-yellow-50 to-amber-50 border-b border-gray-100'
          }`}>
            <ProgressStepper currentStep={currentStep} theme={theme} />
          </div>

          <div className="p-6 space-y-6">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${config.color} flex items-center justify-center shadow-xl`}
                style={{ boxShadow: `0 20px 40px -10px ${config.textColor}40` }}
              >
                <span className="text-white text-2xl font-bold">{config.icon}</span>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
              >
                {depositSettings?.messages?.welcomeTitle?.replace('{amount}', depositData.amount).replace('{symbol}', config.symbol) || `Confirm ${config.name} (${config.symbol}) Payment`}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-gray-500'}`}
              >
                {depositSettings?.messages?.welcomeSubtitle || 'Send the exact amount to complete your deposit'}
              </motion.p>
            </div>

            {!isExpired && depositSettings?.ui?.showTimer !== false && (
              <CountdownTimer 
                expiresAt={expiresAt} 
                onExpire={handleExpire}
                theme={theme}
              />
            )}

            {isExpired && (
              <WarningAlert 
                message="Payment window has expired. Please generate a new deposit address."
                type="danger"
                theme={theme}
              />
            )}

            <WarningAlert 
              message={depositSettings?.messages?.warningText?.replace('{symbol}', config.symbol) || 'Transactions may take 10-30 minutes to confirm depending on network congestion.'}
              type="warning"
              theme={theme}
            />

            <DepositAmountCard 
              amount={depositData.amount}
              coin={coin}
              rate={depositData.rate}
              theme={theme}
            />

            <div className="flex items-center justify-center gap-2">
              <NetworkBadge coin={coin} theme={theme} />
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs ${
                theme === 'dark' ? 'bg-white/5 text-white/60' : 'bg-gray-100 text-gray-500'
              }`}>
                <FaLock className="w-3 h-3" />
                <span>Secure</span>
              </div>
            </div>

            <WalletAddressCard 
              address={depositData.address}
              coin={coin}
              theme={theme}
            />

            <FileUpload 
              onUpload={handleFileUpload}
              theme={theme}
            />

            <div className={`p-4 rounded-xl ${
              theme === 'dark' ? 'bg-white/5' : 'bg-gray-50'
            }`}>
              <p className={`text-xs font-medium mb-3 ${theme === 'dark' ? 'text-white/60' : 'text-gray-500'}`}>
                Transaction Status
              </p>
              <TransactionStatusTracker status={transactionStatus} theme={theme} />
            </div>

            <motion.button
              whileHover={!isExpired && !isLoading && transactionStatus === 'pending' ? { scale: 1.02, boxShadow: '0 20px 40px -10px rgba(234, 179, 8, 0.4)' } : {}}
              whileTap={!isExpired && !isLoading && transactionStatus === 'pending' ? { scale: 0.98 } : {}}
              onClick={handleConfirm}
              disabled={isExpired || isLoading || transactionStatus !== 'pending'}
              className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                isExpired || transactionStatus !== 'pending'
                  ? theme === 'dark' ? 'bg-white/10 text-white/40' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-xl shadow-yellow-500/30 hover:shadow-yellow-500/50'
              }`}
            >
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                  />
                  Processing...
                </>
              ) : transactionStatus === 'completed' ? (
                <>
                  <FaCheckCircle className="w-6 h-6" />
                  Deposit Complete
                </>
              ) : transactionStatus === 'confirm' ? (
                <>
                  <FaCheck className="w-6 h-6" />
                  Confirmed - Processing
                </>
              ) : transactionStatus === 'pending' ? (
                <>
                  <FaClock className="w-6 h-6 animate-pulse" />
                  {depositSettings?.messages?.pendingTitle || 'Waiting for Approval'}
                </>
              ) : (
                <>
                  <FaWallet className="w-6 h-6" />
                  {depositSettings?.ui?.confirmButtonText || 'Confirm Deposit'}
                </>
              )}
            </motion.button>

            <div className={`flex items-center justify-center gap-4 pt-4 border-t ${
              theme === 'dark' ? 'border-white/5' : 'border-gray-100'
            }`}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${
                  theme === 'dark'
                    ? 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900'
                }`}
              >
                <FaRedo className="w-4 h-4" />
                Generate New Address
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${
                  theme === 'dark'
                    ? 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900'
                }`}
              >
                <FaHeadset className="w-4 h-4" />
                Get Help
              </motion.button>
            </div>
          </div>

          <AnimatePresence>
            {transactionStatus === 'pending' && (
              <PendingStatusCircle 
                amount={depositData.amount} 
                coin={coin}
                theme={theme}
              />
            )}
            {transactionStatus === 'confirm' && (
              <ConfirmStatusCircle 
                amount={depositData.amount} 
                coin={coin}
                theme={theme}
              />
            )}
            {transactionStatus === 'completed' && (
              <CompletedStatusCircle 
                amount={depositData.amount} 
                coin={coin}
                theme={theme}
              />
            )}
          </AnimatePresence>

          <div className={`px-6 py-4 text-center ${
            theme === 'dark' ? 'bg-black/20' : 'bg-gray-50'
          }`}>
            <p className={`text-xs ${theme === 'dark' ? 'text-white/30' : 'text-gray-400'}`}>
              © 2026 CryptoFX. All rights reserved. Secured with 256-bit encryption.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

const PendingStatusCircle = ({ amount, coin, theme }) => {
  const config = COIN_CONFIG[coin] || COIN_CONFIG.BTC
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50 rounded-3xl"
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0, rotate: 180 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        className={`relative w-48 h-48 rounded-full flex flex-col items-center justify-center ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-4 border-yellow-500/50 shadow-2xl shadow-yellow-500/30'
            : 'bg-gradient-to-br from-white to-gray-100 border-4 border-yellow-400/50 shadow-2xl shadow-yellow-400/30'
        }`}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className={`absolute inset-2 rounded-full border-4 border-dashed ${
            theme === 'dark' ? 'border-yellow-500/30' : 'border-yellow-400/30'
          }`}
        />
        
        <motion.div
          className={`w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-yellow-500 to-amber-500 shadow-lg`}
          animate={{ 
            boxShadow: [
              '0 0 30px rgba(234, 179, 8, 0.5)',
              '0 0 60px rgba(234, 179, 8, 0.8)',
              '0 0 30px rgba(234, 179, 8, 0.5)'
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <FaClock className="w-8 h-8 text-white" />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4 text-center"
        >
          <p className={`text-lg font-bold ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>
            PENDING
          </p>
          <p className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-gray-500'}`}>
            {amount} {config.symbol}
          </p>
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={`absolute -bottom-12 text-xs text-center ${
            theme === 'dark' ? 'text-white/50' : 'text-gray-400'
          }`}
        >
          Waiting for admin approval...
        </motion.p>
      </motion.div>
    </motion.div>
  )
}

const CompletedStatusCircle = ({ amount, coin, theme }) => {
  const config = COIN_CONFIG[coin] || COIN_CONFIG.BTC
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50 rounded-3xl"
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0, rotate: 180 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        className={`relative w-48 h-48 rounded-full flex flex-col items-center justify-center ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-emerald-900 to-emerald-800 border-4 border-emerald-500/50 shadow-2xl shadow-emerald-500/30'
            : 'bg-gradient-to-br from-emerald-100 to-emerald-50 border-4 border-emerald-400/50 shadow-2xl shadow-emerald-400/30'
        }`}
      >
        <motion.div
          className={`w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-emerald-500 to-green-500 shadow-lg`}
          animate={{ 
            boxShadow: [
              '0 0 30px rgba(16, 185, 129, 0.5)',
              '0 0 60px rgba(16, 185, 129, 0.8)',
              '0 0 30px rgba(16, 185, 129, 0.5)'
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <FaCheckCircle className="w-8 h-8 text-white" />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4 text-center"
        >
          <p className={`text-lg font-bold ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
            COMPLETED
          </p>
          <p className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-gray-500'}`}>
            {amount} {config.symbol}
          </p>
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={`absolute -bottom-12 text-xs text-center ${
            theme === 'dark' ? 'text-white/50' : 'text-gray-400'
          }`}
        >
          Deposit approved successfully!
        </motion.p>
      </motion.div>
    </motion.div>
  )
}

const ConfirmStatusCircle = ({ amount, coin, theme }) => {
  const config = COIN_CONFIG[coin] || COIN_CONFIG.BTC
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50 rounded-3xl"
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0, rotate: 180 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        className={`relative w-48 h-48 rounded-full flex flex-col items-center justify-center ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-blue-900 to-blue-800 border-4 border-blue-500/50 shadow-2xl shadow-blue-500/30'
            : 'bg-gradient-to-br from-blue-100 to-blue-50 border-4 border-blue-400/50 shadow-2xl shadow-blue-400/30'
        }`}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className={`absolute inset-2 rounded-full border-4 border-dashed ${
            theme === 'dark' ? 'border-blue-500/30' : 'border-blue-400/30'
          }`}
        />
        
        <motion.div
          className={`w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg`}
          animate={{ 
            boxShadow: [
              '0 0 30px rgba(59, 130, 246, 0.5)',
              '0 0 60px rgba(59, 130, 246, 0.8)',
              '0 0 30px rgba(59, 130, 246, 0.5)'
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <FaCheck className="w-8 h-8 text-white" />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4 text-center"
        >
          <p className={`text-lg font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
            CONFIRMED
          </p>
          <p className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-gray-500'}`}>
            {amount} {config.symbol}
          </p>
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={`absolute -bottom-12 text-xs text-center ${
            theme === 'dark' ? 'text-white/50' : 'text-gray-400'
          }`}
        >
          Deposit confirmed, processing...
        </motion.p>
      </motion.div>
    </motion.div>
  )
}

export { DepositConfirmation, COIN_CONFIG }
