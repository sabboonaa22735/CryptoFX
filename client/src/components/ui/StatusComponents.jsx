import { motion } from 'framer-motion'
import { FiAlertCircle, FiRefreshCw, FiInbox } from 'react-icons/fi'

export const LoadingSpinner = ({ size = 24, className = '' }) => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    className={className}
  >
    <FiRefreshCw size={size} />
  </motion.div>
)

export const LoadingSkeleton = ({ count = 1, className = '' }) => (
  <div className={`space-y-4 ${className}`}>
    {[...Array(count)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.05 }}
        className="h-16 rounded-2xl bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 animate-pulse"
      />
    ))}
  </div>
)

export const ErrorState = ({ 
  message = 'Something went wrong', 
  onRetry, 
  icon: Icon = FiAlertCircle,
  className = '' 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mb-4"
      >
        <Icon className="w-8 h-8 text-rose-500" />
      </motion.div>
      <p className="text-gray-400 font-medium mb-2">{message}</p>
      {onRetry && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRetry}
          className="mt-2 px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center gap-2"
        >
          <FiRefreshCw className="w-4 h-4" />
          Try Again
        </motion.button>
      )}
    </motion.div>
  )
}

export const EmptyState = ({ 
  message = 'No data found', 
  icon: Icon = FiInbox,
  action,
  actionLabel,
  className = ''
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
  >
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      className="w-16 h-16 rounded-full bg-gray-500/10 flex items-center justify-center mb-4"
    >
      <Icon className="w-8 h-8 text-gray-500" />
    </motion.div>
    <p className="text-gray-400 font-medium">{message}</p>
    {action && actionLabel && (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={action}
        className="mt-4 px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold shadow-lg"
      >
        {actionLabel}
      </motion.button>
    )}
  </motion.div>
)

export const StatusWrapper = ({ 
  loading, 
  error, 
  children, 
  onRetry,
  empty = false,
  emptyMessage = 'No data found',
  className = ''
}) => {
  if (loading) {
    return (
      <div className={className}>
        <LoadingSkeleton />
      </div>
    )
  }
  
  if (error) {
    return (
      <div className={className}>
        <ErrorState message={error} onRetry={onRetry} />
      </div>
    )
  }
  
  if (empty) {
    return (
      <div className={className}>
        <EmptyState message={emptyMessage} />
      </div>
    )
  }
  
  return children
}

export default StatusWrapper
