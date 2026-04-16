import { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { 
  FiUser, FiMail, FiPhone, FiLock, FiCamera, FiShield, FiCheck, 
  FiEdit2, FiSave, FiX, FiAlertCircle, FiCheckCircle, FiStar,
  FiTrendingUp, FiDollarSign, FiActivity, FiAward, FiSend,
  FiKey, FiSmartphone, FiFileText, FiCamera as FiIdCard, FiGlobe, FiBell
} from 'react-icons/fi'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'

const verificationLevels = [
  { level: 0, name: 'Unverified', color: 'gray', icon: FiAlertCircle, requirements: [] },
  { level: 1, name: 'Basic', color: 'blue', icon: FiCheck, requirements: ['Email verification'] },
  { level: 2, name: 'Intermediate', color: 'purple', icon: FiStar, requirements: ['Email verification', 'Phone verification'] },
  { level: 3, name: 'Advanced', color: 'emerald', icon: FiAward, requirements: ['Email verification', 'Phone verification', 'ID verification'] },
  { level: 4, name: 'Full', color: 'amber', icon: FiShield, requirements: ['Email verification', 'Phone verification', 'ID verification', 'Address verification'] },
]

export default function Profile() {
  const { user, updateUser } = useAuthStore()
  const { theme } = useThemeStore()
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState('overview')
  const [editingField, setEditingField] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const avatarInputRef = useRef(null)
  
  const userVerificationLevel = user?.verificationLevel || 1

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['overview', 'personal', 'security', 'verification', 'preferences'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiUser },
    { id: 'personal', label: 'Personal Info', icon: FiEdit2 },
    { id: 'security', label: 'Security', icon: FiShield },
    { id: 'verification', label: 'Verification', icon: FiIdCard },
    { id: 'preferences', label: 'Preferences', icon: FiGlobe },
  ]

  const showNotification = (message) => {
    setSuccessMessage(message)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const handleEdit = (field, currentValue) => {
    setEditingField(field)
    setEditValue(currentValue || '')
  }

  const handleSave = () => {
    updateUser({ [editingField]: editValue })
    showNotification('Profile updated successfully!')
    setEditingField(null)
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingAvatar(true)
    
    const reader = new FileReader()
    reader.onloadend = () => {
      const avatarUrl = reader.result
      updateUser({ avatar: avatarUrl })
      setUploadingAvatar(false)
      showNotification('Profile photo updated!')
    }
    reader.readAsDataURL(file)
  }

  const tradingStats = [
    { label: 'Total Trades', value: user?.trades || 127, icon: FiTrendingUp, color: 'blue' },
    { label: 'Win Rate', value: user?.winRate || '68.5%', icon: FiActivity, color: 'emerald' },
    { label: 'Total P&L', value: user?.pnl || '+$12,450', icon: FiDollarSign, color: 'amber' },
    { label: 'Trading Level', value: user?.tradingLevel || 'Pro', icon: FiStar, color: 'purple' },
  ]

  const recentActivity = [
    { type: 'trade', text: 'Bought 0.5 BTC', time: '2 hours ago', icon: FiTrendingUp },
    { type: 'deposit', text: 'Deposited $5,000', time: '5 hours ago', icon: FiDollarSign },
    { type: 'verify', text: 'Phone verification completed', time: '1 day ago', icon: FiCheck },
    { type: 'trade', text: 'Sold 2 ETH', time: '2 days ago', icon: FiTrendingUp },
  ]

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-4 right-4 left-4 sm:left-auto z-50 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-2xl shadow-emerald-500/30 flex items-center gap-2 sm:gap-3"
          >
            <FiCheckCircle className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
            <span className="font-semibold text-sm sm:text-base">{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 sm:mb-8"
      >
        <h1 className={`text-2xl sm:text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Profile Settings
        </h1>
        <p className={`mt-1 sm:mt-2 text-sm sm:text-base ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Manage your trading profile and account settings
        </p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:w-72 shrink-0 w-full lg:sticky lg:top-24"
        >
          <div className={`rounded-2xl lg:rounded-3xl p-4 sm:p-6 ${
            theme === 'dark' ? 'bg-[var(--bg-secondary)] border border-[var(--border-color)]' : 'bg-white border border-gray-200 shadow-xl shadow-gray-200/50'
          }`}>
            <div className="text-center mb-4 sm:mb-6">
              <motion.div
                className="relative inline-block"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full bg-gradient-to-br from-primary via-secondary to-purple-500 p-1 shadow-2xl shadow-primary/30">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user?.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <div className={`w-full h-full rounded-full flex items-center justify-center text-3xl sm:text-4xl font-bold ${
                      theme === 'dark' ? 'bg-[var(--bg-secondary)]' : 'bg-white'
                    }`}>
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-primary to-secondary text-white flex items-center justify-center shadow-lg shadow-primary/40 hover:shadow-primary/60 transition-shadow"
                >
                  {uploadingAvatar ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <FiCamera className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </motion.button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </motion.div>
              <h3 className={`text-lg sm:text-xl font-bold mt-3 sm:mt-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {user?.name || 'User'}
              </h3>
              <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {user?.email || 'user@example.com'}
              </p>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`inline-flex items-center gap-1.5 sm:gap-2 mt-2 sm:mt-3 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium bg-gradient-to-r ${
                  verificationLevels[userVerificationLevel].color === 'emerald' ? 'from-emerald-500/20 to-green-500/20 text-emerald-400' :
                  verificationLevels[userVerificationLevel].color === 'amber' ? 'from-amber-500/20 to-orange-500/20 text-amber-400' :
                  verificationLevels[userVerificationLevel].color === 'purple' ? 'from-purple-500/20 to-pink-500/20 text-purple-400' :
                  verificationLevels[userVerificationLevel].color === 'blue' ? 'from-blue-500/20 to-indigo-500/20 text-blue-400' :
                  'from-gray-500/20 to-gray-600/20 text-gray-400'
                }`}
              >
                <FiShield className="w-3 h-3 sm:w-4 sm:h-4" />
                {verificationLevels[userVerificationLevel].name} Verified
              </motion.div>
            </div>

            <div className="space-y-1 sm:space-y-2">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ x: 4, scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30'
                      : theme === 'dark'
                      ? 'text-gray-400 hover:text-white hover:bg-[var(--bg-tertiary)]/50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <motion.div
                    whileHover={{ rotate: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <tab.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.div>
                  <span className="font-medium text-sm sm:text-base">{tab.label}</span>
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="ml-auto"
                    >
                      <FiCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1"
        >
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4 sm:space-y-6"
              >
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {tradingStats.map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ y: -4, scale: 1.02 }}
                      className={`p-4 sm:p-5 rounded-xl sm:rounded-2xl ${
                        theme === 'dark'
                          ? 'bg-[var(--bg-secondary)] border border-[var(--border-color)]'
                          : 'bg-white border border-gray-200 shadow-lg shadow-gray-200/50'
                      }`}
                    >
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-2 sm:mb-3 ${
                        stat.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                        stat.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' :
                        stat.color === 'amber' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-purple-500/20 text-purple-400'
                      }`}>
                        <stat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <p className={`text-lg sm:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {stat.value}
                      </p>
                      <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {stat.label}
                      </p>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl ${
                    theme === 'dark'
                      ? 'bg-[var(--bg-secondary)] border border-[var(--border-color)]'
                      : 'bg-white border border-gray-200 shadow-lg shadow-gray-200/50'
                  }`}
                >
                  <h3 className={`text-base sm:text-lg font-bold mb-3 sm:mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Recent Activity
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    {recentActivity.map((activity, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl ${
                          theme === 'dark' ? 'bg-[var(--bg-tertiary)]/50' : 'bg-gray-50'
                        }`}
                      >
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center ${
                          activity.type === 'trade' ? 'bg-blue-500/20 text-blue-400' :
                          activity.type === 'deposit' ? 'bg-emerald-500/20 text-emerald-400' :
                          'bg-purple-500/20 text-purple-400'
                        }`}>
                          <activity.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium text-sm sm:text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {activity.text}
                          </p>
                          <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {activity.time}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl ${
                    theme === 'dark'
                      ? 'bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20'
                      : 'bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30">
                      <FiAward className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-base sm:text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Upgrade Your Verification Level
                      </h3>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Unlock higher trading limits and features
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveTab('verification')}
                      className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-shadow w-full sm:w-auto text-center"
                    >
                      Verify Now
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {activeTab === 'personal' && (
              <motion.div
                key="personal"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4 sm:space-y-6"
              >
                <div className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl ${
                  theme === 'dark'
                    ? 'bg-[var(--bg-secondary)] border border-[var(--border-color)]'
                    : 'bg-white border border-gray-200 shadow-xl shadow-gray-200/50'
                }`}>
                  <h3 className={`text-base sm:text-lg font-bold mb-4 sm:mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Personal Information
                  </h3>
                  
                  <div className="space-y-4">
                    {[
                      { field: 'name', label: 'Full Name', value: user?.name || '', icon: FiUser },
                      { field: 'email', label: 'Email Address', value: user?.email || '', icon: FiMail },
                      { field: 'phone', label: 'Phone Number', value: user?.phone || 'Not provided', icon: FiPhone },
                      { field: 'country', label: 'Country', value: user?.country || 'Not specified', icon: FiGlobe },
                    ].map((item, i) => (
                      <motion.div
                        key={item.field}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`p-4 rounded-xl ${
                          theme === 'dark' ? 'bg-[var(--bg-tertiary)]/50' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              theme === 'dark' ? 'bg-primary/20' : 'bg-primary/10'
                            }`}>
                              <item.icon className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {item.label}
                              </p>
                              {editingField === item.field ? (
                                <input
                                  type="text"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className={`mt-1 px-3 py-2 rounded-lg border ${
                                    theme === 'dark' 
                                      ? 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-white' 
                                      : 'bg-white border-gray-200 text-gray-900'
                                  } focus:outline-none focus:border-primary`}
                                  autoFocus
                                />
                              ) : (
                                <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  {item.value}
                                </p>
                              )}
                            </div>
                          </div>
                          {editingField === item.field ? (
                            <div className="flex gap-2">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleSave}
                                className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                              >
                                <FiSave className="w-5 h-5" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setEditingField(null)}
                                className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                              >
                                <FiX className="w-5 h-5" />
                              </motion.button>
                            </div>
                          ) : (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleEdit(item.field, item.value)}
                              className={`p-2 rounded-lg ${
                                theme === 'dark' 
                                  ? 'hover:bg-[var(--bg-tertiary)] text-gray-400' 
                                  : 'hover:bg-gray-200 text-gray-600'
                              }`}
                            >
                              <FiEdit2 className="w-5 h-5" />
                            </motion.button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className={`p-6 rounded-2xl border ${
                    theme === 'dark' 
                      ? 'bg-[var(--bg-secondary)] border border-[var(--border-color)]' 
                      : 'bg-white border-gray-200 shadow-xl shadow-gray-200/50'
                  }`}
                >
                  <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Trading Profile
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Trading Experience
                      </label>
                      <select className={`w-full px-4 py-3 rounded-xl border ${
                        theme === 'dark' 
                          ? 'bg-[var(--bg-tertiary)] border-[var(--border-color)] text-white' 
                          : 'bg-gray-50 border-gray-200 text-gray-900'
                      } focus:outline-none focus:border-primary`}>
                        <option>Beginner</option>
                        <option>Intermediate</option>
                        <option selected>Advanced</option>
                        <option>Professional</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Primary Trading Style
                      </label>
                      <select className={`w-full px-4 py-3 rounded-xl border ${
                        theme === 'dark' 
                          ? 'bg-[var(--bg-tertiary)] border-[var(--border-color)] text-white' 
                          : 'bg-gray-50 border-gray-200 text-gray-900'
                      } focus:outline-none focus:border-primary`}>
                        <option>Day Trading</option>
                        <option selected>Swing Trading</option>
                        <option>Long-term Investment</option>
                        <option>Arbitrage</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <SecuritySettings theme={theme} showNotification={showNotification} />
              </motion.div>
            )}

            {activeTab === 'verification' && (
              <motion.div
                key="verification"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <VerificationCenter theme={theme} userVerificationLevel={userVerificationLevel} showNotification={showNotification} />
              </motion.div>
            )}

            {activeTab === 'preferences' && (
              <motion.div
                key="preferences"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <PreferencesSettings theme={theme} showNotification={showNotification} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

function SecuritySettings({ theme, showNotification }) {
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [show2FAModal, setShow2FAModal] = useState(false)
  const [showSessionModal, setShowSessionModal] = useState(false)
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })
  const [sessions] = useState([
    { device: 'Chrome on MacOS', location: 'New York, US', lastActive: 'Active now', current: true },
    { device: 'Safari on iPhone', location: 'New York, US', lastActive: '2 hours ago', current: false },
    { device: 'Firefox on Windows', location: 'London, UK', lastActive: '3 days ago', current: false },
  ])

  const securityItems = [
    {
      title: 'Password',
      description: 'Last changed 30 days ago',
      icon: FiLock,
      action: () => setShowPasswordModal(true),
      status: { text: 'Strong', color: 'emerald' },
    },
    {
      title: 'Two-Factor Authentication',
      description: 'Protect your account with 2FA',
      icon: FiSmartphone,
      action: () => setShow2FAModal(true),
      status: { text: 'Enabled', color: 'emerald' },
    },
    {
      title: 'Active Sessions',
      description: `${sessions.length} devices logged in`,
      icon: FiActivity,
      action: () => setShowSessionModal(true),
      status: { text: 'Secure', color: 'blue' },
    },
    {
      title: 'Login Notifications',
      description: 'Get alerts for new logins',
      icon: FiBell,
      status: { text: 'Enabled', color: 'emerald' },
    },
    {
      title: 'API Keys',
      description: 'Manage your API keys',
      icon: FiKey,
      status: { text: '0 Active', color: 'gray' },
    },
  ]

  return (
    <>
      <div className={`p-6 rounded-2xl ${
        theme === 'dark' 
          ? 'bg-[var(--bg-secondary)] border border-[var(--border-color)]' 
          : 'bg-white border border-gray-200 shadow-xl shadow-gray-200/50'
      }`}>
        <h3 className={`text-lg font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Security Settings
        </h3>
        
        <div className="space-y-4">
          {securityItems.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.01 }}
              className={`p-4 rounded-xl cursor-pointer ${
                theme === 'dark' ? 'bg-[var(--bg-tertiary)]/50 hover:bg-[var(--bg-tertiary)]' : 'bg-gray-50 hover:bg-gray-100'
              } transition-colors`}
              onClick={item.action}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    theme === 'dark' ? 'bg-primary/20' : 'bg-primary/10'
                  }`}>
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {item.title}
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {item.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    item.status.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' :
                    item.status.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {item.status.text}
                  </span>
                  <FiEdit2 className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className={`p-6 rounded-2xl ${
        theme === 'dark' 
          ? 'bg-[var(--bg-secondary)] border border-[var(--border-color)]' 
          : 'bg-white border border-gray-200 shadow-xl shadow-gray-200/50'
      }`}>
        <h3 className={`text-lg font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Recent Security Activity
        </h3>
        <div className="space-y-3">
          {[
            { event: 'Password changed successfully', time: '30 days ago', type: 'success' },
            { event: 'New device logged in', time: '2 days ago', type: 'warning' },
            { event: '2FA enabled', time: '1 week ago', type: 'success' },
          ].map((event, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${
              theme === 'dark' ? 'bg-[var(--bg-tertiary)]/50' : 'bg-gray-50'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                event.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
              }`}>
                <FiCheckCircle className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {event.event}
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {event.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showPasswordModal && (
          <PasswordModal theme={theme} onClose={() => setShowPasswordModal(false)} onSuccess={() => showNotification('Password changed successfully!')} />
        )}
        {show2FAModal && (
          <TwoFAModal theme={theme} onClose={() => setShow2FAModal(false)} onSuccess={() => showNotification('2FA enabled successfully!')} />
        )}
        {showSessionModal && (
          <SessionsModal theme={theme} sessions={sessions} onClose={() => setShowSessionModal(false)} />
        )}
      </AnimatePresence>
    </>
  )
}

function PasswordModal({ theme, onClose, onSuccess }) {
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })
  const [step, setStep] = useState(1)

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
          Change Password
        </h3>
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Current Password
            </label>
            <input
              type="password"
              value={passwords.current}
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              className={`w-full px-4 py-3 rounded-xl border ${
                theme === 'dark' 
                  ? 'bg-[var(--bg-tertiary)] border-[var(--border-color)] text-white' 
                  : 'bg-gray-50 border-gray-200'
              } focus:outline-none focus:border-primary`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              New Password
            </label>
            <input
              type="password"
              value={passwords.new}
              onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
              className={`w-full px-4 py-3 rounded-xl border ${
                theme === 'dark' 
                  ? 'bg-[var(--bg-tertiary)] border-[var(--border-color)] text-white' 
                  : 'bg-gray-50 border-gray-200'
              } focus:outline-none focus:border-primary`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              className={`w-full px-4 py-3 rounded-xl border ${
                theme === 'dark' 
                  ? 'bg-[var(--bg-tertiary)] border-[var(--border-color)] text-white' 
                  : 'bg-gray-50 border-gray-200'
              } focus:outline-none focus:border-primary`}
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className={`flex-1 py-3 rounded-xl font-medium ${
              theme === 'dark' 
                ? 'bg-[var(--bg-tertiary)] text-gray-300' 
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { onSuccess(); onClose(); }}
            className="flex-1 py-3 rounded-xl font-medium bg-gradient-to-r from-primary to-secondary text-white"
          >
            Update Password
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function TwoFAModal({ theme, onClose, onSuccess }) {
  const [step, setStep] = useState(1)
  const [code, setCode] = useState('')

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
          Two-Factor Authentication
        </h3>
        
        {step === 1 && (
          <div className="text-center">
            <div className={`w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4`}>
              <FiSmartphone className="w-10 h-10 text-primary" />
            </div>
            <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Scan this QR code with your authenticator app
            </p>
            <div className={`p-4 rounded-xl mb-6 mx-auto w-fit ${
              theme === 'dark' ? 'bg-white' : 'bg-gray-100'
            }`}>
              <div className="w-32 h-32 bg-gray-200 border-2 border-dashed rounded-xl" />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setStep(2)}
              className="w-full py-3 rounded-xl font-medium bg-gradient-to-r from-primary to-secondary text-white"
            >
              Continue
            </motion.button>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className={`text-sm mb-4 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Enter the 6-digit code from your app
            </p>
            <input
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className={`w-full px-6 py-4 text-center text-2xl tracking-widest rounded-xl border ${
                theme === 'dark' 
                  ? 'bg-[var(--bg-tertiary)] border-[var(--border-color)] text-white' 
                  : 'bg-gray-50 border-gray-200'
              } focus:outline-none focus:border-primary mb-4`}
            />
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className={`flex-1 py-3 rounded-xl font-medium ${
                  theme === 'dark' 
                    ? 'bg-[var(--bg-tertiary)] text-gray-300' 
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { onSuccess(); onClose(); }}
                className="flex-1 py-3 rounded-xl font-medium bg-gradient-to-r from-emerald-500 to-green-500 text-white"
              >
                Verify & Enable
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

function SessionsModal({ theme, sessions, onClose }) {
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
        className={`w-full max-w-lg rounded-3xl p-6 ${
          theme === 'dark' ? 'bg-[var(--bg-secondary)] border border-[var(--border-color)]' : 'bg-white'
        }`}
      >
        <h3 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Active Sessions
        </h3>
        <div className="space-y-3">
          {sessions.map((session, i) => (
            <div key={i} className={`p-4 rounded-xl ${
              theme === 'dark' ? 'bg-[var(--bg-tertiary)]/50' : 'bg-gray-50'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {session.device}
                    {session.current && (
                      <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-emerald-500/20 text-emerald-400">
                        Current
                      </span>
                    )}
                  </p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {session.location} • {session.lastActive}
                  </p>
                </div>
                {!session.current && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-sm font-medium"
                  >
                    Revoke
                  </motion.button>
                )}
              </div>
            </div>
          ))}
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onClose}
          className="w-full mt-4 py-3 rounded-xl font-medium bg-gradient-to-r from-primary to-secondary text-white"
        >
          Close
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

function VerificationCenter({ theme, userVerificationLevel, showNotification }) {
  const levels = [
    { 
      level: 1, 
      name: 'Basic', 
      color: 'blue',
      icon: FiMail,
      features: ['Email verification', 'View market data', 'Deposit up to $1,000'],
      status: userVerificationLevel >= 1 ? 'completed' : 'available'
    },
    { 
      level: 2, 
      name: 'Intermediate', 
      color: 'purple',
      icon: FiSmartphone,
      features: ['Phone verification', 'Trade up to $10,000', 'Withdraw up to $5,000'],
      status: userVerificationLevel >= 2 ? 'completed' : userVerificationLevel >= 1 ? 'available' : 'locked'
    },
    { 
      level: 3, 
      name: 'Advanced', 
      color: 'emerald',
      icon: FiIdCard,
      features: ['ID verification', 'Trade up to $100,000', 'Withdraw up to $50,000'],
      status: userVerificationLevel >= 3 ? 'completed' : userVerificationLevel >= 2 ? 'available' : 'locked'
    },
    { 
      level: 4, 
      name: 'Full', 
      color: 'amber',
      icon: FiShield,
      features: ['Address verification', 'Unlimited trading', 'Instant withdrawals', 'Priority support'],
      status: userVerificationLevel >= 4 ? 'completed' : userVerificationLevel >= 3 ? 'available' : 'locked'
    },
  ]

  return (
    <div className={`p-6 rounded-2xl ${
      theme === 'dark' 
        ? 'bg-[var(--bg-secondary)] border border-[var(--border-color)]' 
        : 'bg-white border border-gray-200 shadow-xl shadow-gray-200/50'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Verification Center
          </h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Complete verification to unlock higher limits
          </p>
        </div>
        <div className={`px-4 py-2 rounded-xl ${
          theme === 'dark' ? 'bg-primary/20' : 'bg-primary/10'
        }`}>
          <span className="text-primary font-semibold">Level {userVerificationLevel}</span>
        </div>
      </div>

      <div className="relative">
        <div className={`absolute left-6 top-0 bottom-0 w-0.5 ${
          theme === 'dark' ? 'bg-[var(--border-color)]' : 'bg-gray-200'
        }`} />
        <div className="space-y-6">
          {levels.map((level, i) => (
            <motion.div
              key={level.level}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              className="relative flex gap-6"
            >
              <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${
                level.status === 'completed' 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40' 
                  : level.status === 'available'
                  ? 'bg-gradient-to-br from-primary to-secondary text-white shadow-lg shadow-primary/40'
                  : theme === 'dark'
                  ? 'bg-[var(--bg-tertiary)] text-gray-500'
                  : 'bg-gray-200 text-gray-400'
              }`}>
                {level.status === 'completed' ? (
                  <FiCheck className="w-6 h-6" />
                ) : (
                  <level.icon className="w-6 h-6" />
                )}
              </div>
              <div className={`flex-1 p-5 rounded-2xl ${
                level.status === 'available'
                  ? theme === 'dark' ? 'bg-primary/10 border border-primary/30' : 'bg-primary/5 border border-primary/20'
                  : theme === 'dark' ? 'bg-[var(--bg-tertiary)]/50' : 'bg-gray-50'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h4 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {level.name} Verification
                    </h4>
                    {level.status === 'available' && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        level.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                        level.color === 'purple' ? 'bg-purple-500/20 text-purple-400' :
                        level.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' :
                        'bg-amber-500/20 text-amber-400'
                      }`}>
                        Available
                      </span>
                    )}
                  </div>
                  {level.status === 'available' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => showNotification(`${level.name} verification started!`)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-medium"
                    >
                      Start
                    </motion.button>
                  )}
                </div>
                <ul className="space-y-2">
                  {level.features.map((feature, j) => (
                    <li key={j} className={`flex items-center gap-2 text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      <FiCheck className={`w-4 h-4 ${
                        level.status === 'completed' ? 'text-emerald-400' : 'text-gray-500'
                      }`} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

function PreferencesSettings({ theme, showNotification }) {
  const [preferences, setPreferences] = useState({
    currency: 'USD',
    language: 'English',
    theme: 'system',
    notifications: {
      email: true,
      push: true,
      trades: true,
      priceAlerts: true,
      security: true,
    }
  })

  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-2xl ${
        theme === 'dark' 
          ? 'bg-[var(--bg-secondary)] border border-[var(--border-color)]' 
          : 'bg-white border border-gray-200 shadow-xl shadow-gray-200/50'
      }`}>
        <h3 className={`text-lg font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Display Preferences
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Default Currency
            </label>
            <select
              value={preferences.currency}
              onChange={(e) => { setPreferences({ ...preferences, currency: e.target.value }); showNotification('Currency updated!'); }}
              className={`w-full px-4 py-3 rounded-xl border ${
                theme === 'dark' 
                  ? 'bg-[var(--bg-tertiary)] border-[var(--border-color)] text-white' 
                  : 'bg-gray-50 border-gray-200'
              } focus:outline-none focus:border-primary`}
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="BTC">BTC - Bitcoin</option>
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Language
            </label>
            <select
              value={preferences.language}
              onChange={(e) => { setPreferences({ ...preferences, language: e.target.value }); showNotification('Language updated!'); }}
              className={`w-full px-4 py-3 rounded-xl border ${
                theme === 'dark' 
                  ? 'bg-[var(--bg-tertiary)] border-[var(--border-color)] text-white' 
                  : 'bg-gray-50 border-gray-200'
              } focus:outline-none focus:border-primary`}
            >
              <option value="English">English</option>
              <option value="Spanish">Español</option>
              <option value="French">Français</option>
              <option value="German">Deutsch</option>
            </select>
          </div>
        </div>
      </div>

      <div className={`p-6 rounded-2xl ${
        theme === 'dark' 
          ? 'bg-[var(--bg-secondary)] border border-[var(--border-color)]' 
          : 'bg-white border border-gray-200 shadow-xl shadow-gray-200/50'
      }`}>
        <h3 className={`text-lg font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Notification Settings
        </h3>
        <div className="space-y-4">
          {Object.entries(preferences.notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between py-3 border-b border-[var(--border-color)] last:border-0">
              <div>
                <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {key === 'email' && 'Email Notifications'}
                  {key === 'push' && 'Push Notifications'}
                  {key === 'trades' && 'Trade Confirmations'}
                  {key === 'priceAlerts' && 'Price Alerts'}
                  {key === 'security' && 'Security Alerts'}
                </p>
              </div>
              <button
                onClick={() => {
                  setPreferences({
                    ...preferences,
                    notifications: { ...preferences.notifications, [key]: !value }
                  })
                  showNotification('Notification preference updated!')
                }}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  value ? 'bg-primary' : theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                }`}
              >
                <motion.div
                  animate={{ x: value ? 24 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-lg"
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
