import { motion } from 'framer-motion'

export default function InputField({ 
  icon: Icon, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  required,
  showPasswordToggle,
  onTogglePassword,
  showPassword,
  error,
  label,
  ...props 
}) {
  return (
    <motion.div
      className="space-y-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      <div className="input-wrapper">
        {Icon && (
          <motion.div
            className="input-icon"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Icon className="w-5 h-5" />
          </motion.div>
        )}
        <input
          type={showPasswordToggle ? (showPassword ? 'text' : 'password') : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`input-field-3d ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
          {...props}
        />
        {showPasswordToggle && (
          <motion.button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </motion.button>
        )}
      </div>
      {error && (
        <motion.p
          className="text-red-400 text-xs"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  )
}
