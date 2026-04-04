import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiBell, FiMoon, FiGlobe, FiShield, FiDollarSign, FiCheck, FiX, FiTrash2, FiDownload } from 'react-icons/fi'
import { useThemeStore } from '../store/themeStore'
import { useAuthStore } from '../store/authStore'

const ACCENT_COLORS = [
  { id: 'blue', name: 'Blue', color: '#3b82f6' },
  { id: 'purple', name: 'Purple', color: '#8b5cf6' },
  { id: 'emerald', name: 'Emerald', color: '#10b981' },
  { id: 'amber', name: 'Amber', color: '#f59e0b' },
  { id: 'rose', name: 'Rose', color: '#f43f5e' },
  { id: 'cyan', name: 'Cyan', color: '#06b6d4' },
]

export default function Settings() {
  const { theme, setTheme, accentColor, setAccentColor, compactMode, setCompactMode } = useThemeStore()
  const { logout } = useAuthStore()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [showAccentPicker, setShowAccentPicker] = useState(false)

  const showNotification = (message) => {
    setSuccessMessage(message)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const settingSections = [
    {
      title: 'Appearance',
      icon: FiMoon,
      settings: [
        {
          label: 'Dark Mode',
          description: 'Toggle dark mode theme',
          type: 'toggle',
          value: theme === 'dark',
          onChange: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
        },
        {
          label: 'Accent Color',
          description: 'Choose your preferred accent color',
          type: 'colorPicker',
          value: accentColor,
          onChange: (color) => {
            setAccentColor(color)
            showNotification(`Accent color changed to ${color}`)
          },
        },
        {
          label: 'Compact View',
          description: 'Show more content on screen',
          type: 'toggle',
          value: compactMode,
          onChange: () => {
            setCompactMode(!compactMode)
            showNotification(`Compact mode ${!compactMode ? 'enabled' : 'disabled'}`)
          },
        },
      ],
    },
    {
      title: 'Trading Display',
      icon: FiDollarSign,
      settings: [
        {
          label: 'Default View',
          description: 'Candlestick or Line chart',
          type: 'select',
          options: ['Candlestick', 'Line', 'Area'],
          value: 'Candlestick',
        },
        {
          label: 'Price Alerts',
          description: 'Desktop notifications for price changes',
          type: 'toggle',
          value: true,
          onChange: () => showNotification('Price alerts toggled'),
        },
        {
          label: 'Confirm Trades',
          description: 'Require confirmation before trading',
          type: 'toggle',
          value: true,
          onChange: () => showNotification('Trade confirmation toggled'),
        },
      ],
    },
    {
      title: 'Security',
      icon: FiShield,
      settings: [
        {
          label: 'Biometric Login',
          description: 'Use fingerprint or face ID',
          type: 'toggle',
          value: false,
          onChange: () => showNotification('Biometric login toggled'),
        },
        {
          label: 'Auto-lock',
          description: 'Lock after inactivity',
          type: 'select',
          options: ['1 minute', '5 minutes', '15 minutes', 'Never'],
          value: '5 minutes',
        },
      ],
    },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-4 right-4 z-50 px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-2xl shadow-emerald-500/30 flex items-center gap-3"
          >
            <FiCheck className="w-6 h-6" />
            <span className="font-semibold">{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Settings
        </h1>
        <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Customize your trading experience
        </p>
      </motion.div>

      <div className="space-y-6">
        {settingSections.map((section, index) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.01 }}
            className={`rounded-3xl p-6 ${
              theme === 'dark' ? 'bg-[var(--bg-secondary)] border border-[var(--border-color)]' : 'bg-white border border-gray-200 shadow-xl shadow-gray-200/50'
            }`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                theme === 'dark' ? 'bg-primary/20' : 'bg-primary/10'
              }`}>
                <section.icon className="w-6 h-6 text-primary" />
              </div>
              <h2 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {section.title}
              </h2>
            </div>

            <div className="space-y-4">
              {section.settings.map((setting, i) => (
                <div
                  key={setting.label}
                  className={`flex items-center justify-between py-3 ${
                    i !== section.settings.length - 1
                      ? theme === 'dark' ? 'border-b border-[var(--border-color)]' : 'border-b border-gray-100'
                      : ''
                  }`}
                >
                  <div>
                    <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {setting.label}
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {setting.description}
                    </p>
                  </div>

              {setting.type === 'toggle' && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={setting.onChange}
                  className={`relative w-14 h-7 rounded-full transition-colors cursor-pointer ${
                    setting.value ? 'bg-gradient-to-r from-primary to-secondary' : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                  }`}
                >
                  <motion.div
                    animate={{ x: setting.value ? 28 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-lg"
                  />
                </motion.button>
              )}

                  {setting.type === 'select' && (
                    <motion.select
                      whileHover={{ scale: 1.05 }}
                      whileFocus={{ scale: 1.05 }}
                      onChange={(e) => showNotification(`${setting.label} updated to ${e.target.value}`)}
                      className={`px-4 py-2 rounded-xl border cursor-pointer ${
                        theme === 'dark' 
                          ? 'bg-[var(--bg-tertiary)] border-[var(--border-color)] text-white' 
                          : 'bg-gray-50 border-gray-200 text-gray-900'
                      } focus:outline-none focus:border-primary`}
                    >
                      {setting.options?.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </motion.select>
                  )}

                  {setting.type === 'colorPicker' && (
                    <div className="relative">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowAccentPicker(!showAccentPicker)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer transition-all ${
                          theme === 'dark' 
                            ? 'bg-[var(--bg-tertiary)] border-[var(--border-color)] text-white' 
                            : 'bg-gray-50 border-gray-200 text-gray-900'
                        }`}
                      >
                        <div 
                          className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                          style={{ backgroundColor: ACCENT_COLORS.find(c => c.id === setting.value)?.color || '#3b82f6' }}
                        />
                        <span className="text-sm">{ACCENT_COLORS.find(c => c.id === setting.value)?.name || 'Blue'}</span>
                      </motion.button>
                      
                      <AnimatePresence>
                        {showAccentPicker && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className={`absolute right-0 mt-2 p-3 rounded-xl border shadow-xl z-50 ${
                              theme === 'dark' 
                                ? 'bg-[var(--bg-secondary)] border-[var(--border-color)]' 
                                : 'bg-white border-gray-200'
                            }`}
                          >
                            <div className="grid grid-cols-3 gap-2">
                              {ACCENT_COLORS.map((color) => (
                                <motion.button
                                  key={color.id}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => {
                                    setting.onChange(color.id)
                                    setShowAccentPicker(false)
                                  }}
                                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                    setting.value === color.id ? 'ring-2 ring-offset-2 ring-primary' : ''
                                  }`}
                                  style={{ backgroundColor: color.color }}
                                >
                                  {setting.value === color.id && (
                                    <FiCheck className="w-5 h-5 text-white" />
                                  )}
                                </motion.button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.01 }}
          className={`rounded-3xl p-6 ${
            theme === 'dark' ? 'bg-[var(--bg-secondary)] border border-[var(--border-color)]' : 'bg-white border border-gray-200 shadow-xl shadow-gray-200/50'
          }`}
        >
          <h2 className={`text-lg font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Data Management
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowExportModal(true)}
              className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer ${
                theme === 'dark' ? 'bg-[var(--bg-tertiary)]/50 hover:bg-blue-500/10' : 'bg-gray-50 hover:bg-blue-50'
              } transition-all border border-transparent hover:border-blue-500/20`}
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center"
              >
                <FiDownload className="w-6 h-6 text-blue-400" />
              </motion.div>
              <div className="text-left">
                <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Export Data
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Download your account data
                </p>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowDeleteModal(true)}
              className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer ${
                theme === 'dark' ? 'bg-[var(--bg-tertiary)]/50 hover:bg-red-500/10' : 'bg-gray-50 hover:bg-red-50'
              } transition-all border border-transparent hover:border-red-500/20`}
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center"
              >
                <FiTrash2 className="w-6 h-6 text-red-400" />
              </motion.div>
              <div className="text-left">
                <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Delete Account
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Permanently delete your account
                </p>
              </div>
            </motion.button>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showExportModal && (
          <ExportModal theme={theme} onClose={() => setShowExportModal(false)} onSuccess={() => showNotification('Data export started!')} />
        )}
        {showDeleteModal && (
          <DeleteModal theme={theme} onClose={() => setShowDeleteModal(false)} onConfirm={() => { logout(); }} />
        )}
      </AnimatePresence>
    </div>
  )
}

function ExportModal({ theme, onClose, onSuccess }) {
  const [exportType, setExportType] = useState('all')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md rounded-3xl p-6 ${
          theme === 'dark' ? 'bg-[var(--bg-secondary)] border border-[var(--border-color)]' : 'bg-white'
        }`}
      >
        <h3 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Export Your Data
        </h3>
        <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Choose what data you want to export
        </p>
        <div className="space-y-3 mb-6">
          {['all', 'trades', 'transactions', 'profile'].map((type) => (
            <label
              key={type}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer ${
                exportType === type 
                  ? theme === 'dark' ? 'bg-primary/20 border border-primary/30' : 'bg-primary/5 border border-primary/20'
                  : theme === 'dark' ? 'bg-[var(--bg-tertiary)]/50' : 'bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="exportType"
                checked={exportType === type}
                onChange={() => setExportType(type)}
                className="w-4 h-4 accent-primary"
              />
              <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                {type === 'all' && 'All Data'}
                {type === 'trades' && 'Trade History'}
                {type === 'transactions' && 'Transaction History'}
                {type === 'profile' && 'Profile Information'}
              </span>
            </label>
          ))}
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className={`flex-1 py-3 rounded-xl font-medium cursor-pointer ${
              theme === 'dark' ? 'bg-[var(--bg-tertiary)] text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, y: -2, boxShadow: '0 10px 30px rgba(99, 102, 241, 0.3)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { onSuccess(); onClose(); }}
            className="flex-1 py-3 rounded-xl font-medium bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/20 cursor-pointer"
          >
            Export
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function DeleteModal({ theme, onClose, onConfirm }) {
  const [confirmText, setConfirmText] = useState('')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md rounded-3xl p-6 ${
          theme === 'dark' ? 'bg-[var(--bg-secondary)] border border-[var(--border-color)]' : 'bg-white'
        }`}
      >
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
          <FiTrash2 className="w-8 h-8 text-red-400" />
        </div>
        <h3 className={`text-xl font-bold mb-2 text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Delete Account?
        </h3>
        <p className={`text-sm mb-4 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          This action cannot be undone. All your data will be permanently deleted.
        </p>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="Type 'DELETE' to confirm"
          className={`w-full px-4 py-3 rounded-xl border mb-4 ${
            theme === 'dark' 
              ? 'bg-[var(--bg-tertiary)] border-[var(--border-color)] text-white placeholder-gray-500' 
              : 'bg-gray-50 border-gray-200 text-gray-900'
          } focus:outline-none focus:border-red-500`}
        />
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className={`flex-1 py-3 rounded-xl font-medium cursor-pointer ${
              theme === 'dark' ? 'bg-[var(--bg-tertiary)] text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={confirmText === 'DELETE' ? { scale: 1.05, y: -2, boxShadow: '0 10px 30px rgba(239, 68, 68, 0.3)' } : {}}
            whileTap={{ scale: 0.95 }}
            onClick={onConfirm}
            disabled={confirmText !== 'DELETE'}
            className={`flex-1 py-3 rounded-xl font-medium cursor-pointer ${
              confirmText === 'DELETE'
                ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/20'
                : 'bg-red-500/20 text-red-400 cursor-not-allowed'
            }`}
          >
            Delete Forever
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
