import { useState, useEffect, useRef } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiHome, FiTrendingUp, FiPieChart, FiCreditCard, FiTrendingDown,
  FiHeadphones, FiSettings, FiUser, FiMoon, FiSun,
  FiMenu, FiBell, FiLogOut, FiBox, FiActivity,
  FiX, FiCheck, FiAlertCircle, FiChevronDown, FiChevronRight,
  FiMail, FiPhone, FiGlobe, FiShield, FiHelpCircle,
  FiDollarSign, FiFileText, FiKey, FiActivity as FiAct
} from 'react-icons/fi'
import { FaChartBar, FaChartLine, FaUsers, FaExchangeAlt, FaBell, FaUserShield } from 'react-icons/fa'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'
import ThemeToggle from './ui/ThemeToggle'

const navItems = [
  { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
  { path: '/portfolio', icon: FiPieChart, label: 'Portfolio' },
  { path: '/trade', icon: FaExchangeAlt, label: 'Trade' },
  { path: '/wallet', icon: FiCreditCard, label: 'Wallet' },
  { path: '/support', icon: FiHeadphones, label: 'Support' },
]

const marketItems = [
  { path: '/markets', icon: FiTrendingUp, label: 'Crypto' },
  { path: '/indices', icon: FaChartBar, label: 'Indices' },
  { path: '/stocks', icon: FaChartLine, label: 'Stocks' },
  { path: '/futures', icon: FiActivity, label: 'Futures' },
  { path: '/copytrading', icon: FaUsers, label: 'Copy Trading' },
]

const mockNotifications = [
  { id: 1, type: 'success', title: 'Deposit Confirmed', message: 'Your deposit of 0.5 BTC has been confirmed', time: '2 min ago', read: false },
  { id: 2, type: 'price', title: 'BTC Price Alert', message: 'Bitcoin is up 5.2% in the last hour', time: '15 min ago', read: false },
  { id: 3, type: 'info', title: 'Copy Trading', message: 'TopTrader just opened a new position', time: '1 hour ago', read: true },
]

const profileMenuItems = [
  { icon: FiUser, label: 'Profile Settings', path: '/profile', color: 'blue' },
  { icon: FiSettings, label: 'Account Settings', path: '/settings', color: 'purple' },
  { icon: FiShield, label: 'Security', path: '/profile?tab=security', color: 'green' },
  { icon: FiDollarSign, label: 'Wallet & Cards', path: '/wallet', color: 'amber' },
  { icon: FiGlobe, label: 'Preferences', path: '/settings', color: 'cyan' },
  { icon: FiHelpCircle, label: 'Help Center', path: '/support', color: 'indigo' },
  { icon: FiFileText, label: 'Transaction History', path: '/portfolio', color: 'pink' },
]

export default function Layout() {
  const [notifications, setNotifications] = useState(mockNotifications.filter(n => !n.read).length)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [marketStatus, setMarketStatus] = useState('open')
  const [marketOpen, setMarketOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, logout, fetchUser } = useAuthStore()
  const { initTheme, theme, setTheme } = useThemeStore()
  const navigate = useNavigate()
  const profileRef = useRef(null)
  const notificationsRef = useRef(null)

  useEffect(() => {
    initTheme()
  }, [initTheme])

  useEffect(() => {
    fetchUser()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    setShowProfile(false)
    logout()
  }

  const toggleMarket = () => {
    setMarketStatus(prev => prev === 'open' ? 'closed' : 'open')
  }

  const markAsRead = (id) => {
    setNotifications(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(0)
    setShowNotifications(false)
  }

  const handleMenuItemClick = (path) => {
    setShowProfile(false)
    navigate(path)
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] transition-colors duration-300">
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-[var(--bg-primary)]/80 border-b border-[var(--border-color)]">
        <div className="flex items-center justify-between px-4 md:px-6 py-3">
          <div className="flex items-center gap-4">
            <NavLink to="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30">
                <FiBox className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text hidden sm:block">CryptoFX</span>
            </NavLink>

            <nav className="hidden md:flex items-center gap-1 ml-8">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]/50'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              ))}
              {user?.role === 'admin' || user?.role === 'superadmin' ? (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]/50'
                    }`
                  }
                >
                  <FaUserShield className="w-4 h-4" />
                  <span className="font-medium">Admin</span>
                </NavLink>
              ) : null}

              <div className="relative">
                <button
                  onClick={() => setMarketOpen(!marketOpen)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                    marketOpen || window.location.pathname.includes('/markets') || window.location.pathname.includes('/indices') || window.location.pathname.includes('/stocks') || window.location.pathname.includes('/futures') || window.location.pathname.includes('/copytrading')
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]/50'
                  }`}
                >
                  <FiTrendingUp className="w-4 h-4" />
                  <span className="font-medium">Market</span>
                  <FiChevronDown className={`w-4 h-4 transition-transform ${marketOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {marketOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full mt-2 left-0 w-56 rounded-xl shadow-2xl border border-[var(--border-color)] overflow-hidden bg-[var(--bg-secondary)] backdrop-blur-xl"
                    >
                      {marketItems.map((item, index) => (
                        <motion.div
                          key={item.path}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <NavLink
                            to={item.path}
                            onClick={() => setMarketOpen(false)}
                            className={({ isActive }) =>
                              `flex items-center gap-3 px-4 py-3 transition-colors ${
                                isActive
                                  ? 'bg-primary/10 text-primary'
                                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]/50'
                              }`
                            }
                          >
                            <item.icon className="w-4 h-4" />
                            <span className="font-medium">{item.label}</span>
                          </NavLink>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <ThemeToggle />
            
            <div className="relative" ref={notificationsRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
                className="relative p-2.5 rounded-xl hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
              >
                <FaBell className="w-5 h-5" />
                {notifications > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-rose-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold shadow-lg"
                  >
                    {notifications}
                  </motion.span>
                )}
              </motion.button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 rounded-2xl shadow-2xl border border-[var(--border-color)] overflow-hidden bg-[var(--bg-secondary)] backdrop-blur-xl z-50"
                  >
                    <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
                      <h3 className="font-bold text-[var(--text-primary)]">Notifications</h3>
                      <button 
                        onClick={markAllAsRead}
                        className="text-xs text-primary hover:text-primary/80 transition-colors font-medium"
                      >
                        Mark all as read
                      </button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {mockNotifications.map((notif) => (
                        <motion.div
                          key={notif.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={`p-4 border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--bg-tertiary)]/50 transition-colors cursor-pointer ${
                            !notif.read ? 'bg-primary/5' : ''
                          }`}
                          onClick={() => markAsRead(notif.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              notif.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
                              notif.type === 'price' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {notif.type === 'success' ? <FiCheck className="w-5 h-5" /> :
                               notif.type === 'price' ? <FiTrendingUp className="w-5 h-5" /> :
                               <FiAlertCircle className="w-5 h-5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-[var(--text-primary)]">{notif.title}</p>
                              <p className="text-xs text-[var(--text-secondary)] mt-0.5">{notif.message}</p>
                              <p className="text-[10px] text-[var(--text-secondary)] opacity-60 mt-1">{notif.time}</p>
                            </div>
                            {!notif.read && (
                              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleMarket}
              className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-full border transition-all text-sm font-medium ${
                marketStatus === 'open' 
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' 
                  : 'border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20'
              }`}
            >
              <motion.div
                animate={{ scale: marketStatus === 'open' ? [1, 1.3, 1] : 1 }}
                transition={{ duration: 2, repeat: marketStatus === 'open' ? Infinity : 0 }}
                className={`w-2 h-2 rounded-full ${marketStatus === 'open' ? 'bg-emerald-400' : 'bg-red-400'}`}
              />
              <span className="hidden lg:inline">
                Market {marketStatus === 'open' ? 'Open' : 'Closed'}
              </span>
            </motion.button>

            <div className="relative" ref={profileRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary via-secondary to-purple-500 p-0.5 shadow-lg shadow-primary/30">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user?.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <div className={`w-full h-full rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        theme === 'dark' ? 'bg-[var(--bg-secondary)]' : 'bg-white'
                      }`}>
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[var(--bg-primary)]" />
                </div>
                <FiChevronDown className={`w-4 h-4 text-[var(--text-secondary)] transition-transform duration-200 ${showProfile ? 'rotate-180' : ''}`} />
              </motion.button>

              <AnimatePresence>
                {showProfile && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-3 w-80 rounded-2xl shadow-2xl border border-[var(--border-color)] overflow-hidden bg-[var(--bg-secondary)] backdrop-blur-xl z-50"
                  >
                    <div className="relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-purple-500/20" />
                      <div className="relative p-5 border-b border-[var(--border-color)]/50">
                        <div className="flex items-center gap-4">
                          <motion.div 
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className="relative"
                          >
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary via-secondary to-purple-500 p-0.5 shadow-xl shadow-primary/30">
                              {user?.avatar ? (
                                <img src={user.avatar} alt={user?.name} className="w-full h-full rounded-full object-cover" />
                              ) : (
                                <div className={`w-full h-full rounded-full flex items-center justify-center text-white font-bold text-xl ${
                                  theme === 'dark' ? 'bg-[var(--bg-secondary)]' : 'bg-white'
                                }`}>
                                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                              )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-[var(--bg-secondary)] flex items-center justify-center">
                              <FiCheck className="w-3 h-3 text-white" />
                            </div>
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-lg text-[var(--text-primary)] truncate">
                              {user?.name || 'User'}
                            </h3>
                            <p className="text-sm text-[var(--text-secondary)] flex items-center gap-1 truncate">
                              <FiMail className="w-3 h-3" />
                              {user?.email || 'user@example.com'}
                            </p>
                            {user?.phone && (
                              <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1 mt-0.5">
                                <FiPhone className="w-3 h-3" />
                                {user.phone}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 mt-4">
                          <div className="flex-1 h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min((user?.verificationLevel || 1) * 25, 100)}%` }}
                              transition={{ delay: 0.2, duration: 0.5 }}
                              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                            />
                          </div>
                          <span className="text-xs font-medium text-primary">Level {user?.verificationLevel || 1}</span>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] mt-1">Complete verification to unlock more features</p>
                      </div>
                    </div>

                    <div className="p-2 max-h-80 overflow-y-auto">
                      {profileMenuItems.map((item, index) => {
                        const IconComponent = item.icon
                        const colorClasses = {
                          blue: 'group-hover:text-blue-400',
                          purple: 'group-hover:text-purple-400',
                          green: 'group-hover:text-emerald-400',
                          amber: 'group-hover:text-amber-400',
                          cyan: 'group-hover:text-cyan-400',
                          indigo: 'group-hover:text-indigo-400',
                          pink: 'group-hover:text-pink-400',
                        }
                        return (
                          <motion.button
                            key={item.label}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleMenuItemClick(item.path)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]/50 transition-all group`}
                          >
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                              theme === 'dark' ? 'bg-[var(--bg-tertiary)]' : 'bg-gray-100'
                            } group-hover:bg-primary/10 transition-colors`}>
                              <IconComponent className={`w-4 h-4 ${colorClasses[item.color]}`} />
                            </div>
                            <span className="flex-1 text-left font-medium">{item.label}</span>
                            <FiChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </motion.button>
                        )
                      })}
                    </div>

                    <div className="p-2 border-t border-[var(--border-color)]">
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all group"
                      >
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
                          <FiLogOut className="w-4 h-4" />
                        </div>
                        <span className="flex-1 text-left font-medium">Sign Out</span>
                        <span className="text-xs px-2 py-1 rounded-full bg-red-500/10 text-red-400">Logout</span>
                      </motion.button>
                    </div>

                    <div className="px-4 py-3 border-t border-[var(--border-color)] bg-gradient-to-r from-primary/5 to-secondary/5">
                      <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                        <span>CryptoFX v1.0.0</span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          All systems operational
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
            >
              {mobileMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-[var(--border-color)]"
            >
              <nav className="px-4 py-4 space-y-1">
                <div className="mb-2">
                  <button
                    onClick={() => setMarketOpen(!marketOpen)}
                    className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]/50"
                  >
                    <span className="font-medium">Market</span>
                    <FiChevronDown className={`w-4 h-4 transition-transform ${marketOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {marketOpen && (
                    <div className="ml-4 mt-1 space-y-1">
                      {marketItems.map((item) => (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]/50"
                        >
                          <item.icon className="w-4 h-4" />
                          <span className="font-medium">{item.label}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]/50'
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  )
}
