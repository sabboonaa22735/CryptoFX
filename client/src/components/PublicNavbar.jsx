import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMenu, FiX } from 'react-icons/fi'
import { FaExchangeAlt } from 'react-icons/fa'
import { useThemeStore } from '../store/themeStore'
import { useAuthStore } from '../store/authStore'
import ThemeToggle from './ui/ThemeToggle'

const defaultNavLinks = [
  { label: 'Prices', path: '/prices' },
  { label: 'About', path: '/about' },
]

export default function PublicNavbar({ navLinks = defaultNavLinks }) {
  const { theme, initTheme } = useThemeStore()
  const { user, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    initTheme()
  }, [initTheme])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const loggedIn = Boolean(user) || isAuthenticated()

  const desktopLinkClass = ({ isActive }) => {
    if (isActive) {
      return theme === 'dark'
        ? 'px-5 py-3 rounded-2xl font-semibold text-white bg-white/10 backdrop-blur-md border border-white/20 shadow-lg'
        : 'px-5 py-3 rounded-2xl font-semibold text-gray-900 bg-white/80 backdrop-blur-md border border-gray-200/50 shadow-lg'
    }

    return theme === 'dark'
      ? 'px-5 py-3 rounded-2xl font-medium text-gray-300 hover:text-white hover:bg-white/5 backdrop-blur-md transition-all duration-300'
      : 'px-5 py-3 rounded-2xl font-medium text-gray-600 hover:text-gray-900 hover:bg-white/70 backdrop-blur-md transition-all duration-300'
  }

  const mobileLinkClass = ({ isActive }) => {
    if (isActive) {
      return theme === 'dark'
        ? 'block px-5 py-4 rounded-2xl font-semibold text-white bg-white/10 backdrop-blur-md border border-white/20 shadow-lg'
        : 'block px-5 py-4 rounded-2xl font-semibold text-gray-900 bg-white/80 backdrop-blur-md border border-gray-200/50 shadow-lg'
    }

    return theme === 'dark'
      ? 'block px-5 py-4 rounded-2xl font-medium text-gray-300 hover:text-white hover:bg-white/10 backdrop-blur-md transition-all duration-300'
      : 'block px-5 py-4 rounded-2xl font-medium text-gray-600 hover:text-gray-900 hover:bg-white/70 backdrop-blur-md transition-all duration-300'
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? theme === 'dark'
            ? 'bg-gray-950/70 backdrop-blur-2xl border-b border-white/10 shadow-2xl shadow-black/20'
            : 'bg-white/70 backdrop-blur-2xl shadow-xl shadow-gray-200/50 border-b border-gray-200/30'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 md:h-24">
          <Link to="/" className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-blue-500/30 backdrop-blur-md"
            >
              <FaExchangeAlt className="w-7 h-7 text-white" />
            </motion.div>
            <span className={`text-2xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              CryptoFX
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-3">
            {navLinks.map((link) => (
              <NavLink key={link.path} to={link.path} className={desktopLinkClass}>
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle />

            {loggedIn ? (
              <Link
                to="/dashboard"
                className={`px-6 py-3.5 rounded-2xl font-semibold transition-all duration-300 backdrop-blur-md ${
                  theme === 'dark'
                    ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20 shadow-lg'
                    : 'bg-gray-100/80 hover:bg-gray-200/90 text-gray-900 border border-gray-200/50 shadow-lg'
                }`}
              >
                Dashboard
              </Link>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/login')}
                  className={`px-8 py-4 rounded-2xl font-bold text-base transition-all duration-300 backdrop-blur-md border-2 ${
                    theme === 'dark'
                      ? 'bg-transparent hover:bg-white/5 border-white/30 text-white hover:border-white/50'
                      : 'bg-transparent hover:bg-gray-50 border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  Log in
                </motion.button>
                <Link
                  to="/register"
                  className={`px-8 py-4 rounded-2xl font-bold text-base transition-all duration-300 shadow-lg bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white hover:shadow-blue-500/40`}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-3 rounded-2xl backdrop-blur-md bg-white/5 hover:bg-white/10 transition-all duration-300">
            {mobileMenuOpen ? (
              <FiX className={`w-6 h-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} />
            ) : (
              <FiMenu className={`w-6 h-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={`lg:hidden ${theme === 'dark' ? 'bg-gray-950/95 backdrop-blur-2xl' : 'bg-white/95 backdrop-blur-2xl'} border-t ${
              theme === 'dark' ? 'border-white/10' : 'border-gray-200/30'
            }`}
          >
            <div className="px-5 py-6 space-y-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={mobileLinkClass}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </NavLink>
              ))}

              <div className="flex items-center justify-between pt-4 border-t border-inherit">
                <ThemeToggle />
              </div>

              {loggedIn ? (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full py-4 rounded-2xl font-semibold text-center bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white shadow-xl backdrop-blur-md"
                >
                  Dashboard
                </Link>
              ) : (
                <div className="space-y-3 pt-2">
                  <button
                    onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                    className={`block w-full py-4 rounded-2xl font-bold text-center backdrop-blur-md border-2 shadow-lg ${
                      theme === 'dark' ? 'bg-transparent border-white/30 text-white' : 'bg-transparent border-gray-300 text-gray-700'
                    }`}
                  >
                    Log in
                  </button>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full py-4 rounded-2xl font-bold text-center bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white shadow-lg"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
