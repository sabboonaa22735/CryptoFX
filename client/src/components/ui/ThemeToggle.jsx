import { motion, AnimatePresence } from 'framer-motion'
import { useThemeStore } from '../../store/themeStore'
import { useState } from 'react'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore()
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.button
      onClick={toggleTheme}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative w-24 h-12 cursor-pointer"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
    >
      <div className={`absolute inset-0 rounded-full overflow-hidden transition-all duration-500 ${
        theme === 'dark'
          ? 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 shadow-[0_0_40px_rgba(99,102,241,0.3),inset_0_0_60px_rgba(0,0,0,0.5)]'
          : 'bg-gradient-to-r from-amber-100 via-orange-100 to-yellow-100 shadow-[0_0_40px_rgba(251,191,36,0.2),inset_0_0_60px_rgba(255,255,255,0.8)]'
      }`}>
        <motion.div 
          className="absolute inset-0"
          animate={{
            background: theme === 'dark'
              ? ['radial-gradient(circle at 20% 50%, rgba(99,102,241,0.15) 0%, transparent 50%)', 'radial-gradient(circle at 80% 50%, rgba(139,92,246,0.15) 0%, transparent 50%)']
              : ['radial-gradient(circle at 20% 50%, rgba(251,191,36,0.2) 0%, transparent 50%)', 'radial-gradient(circle at 80% 50%, rgba(249,115,22,0.2) 0%, transparent 50%)']
          }}
          transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
        />

        <div className={`absolute inset-[3px] rounded-full transition-all duration-500 ${
          theme === 'dark'
            ? 'bg-gradient-to-b from-slate-800/90 to-slate-950/95'
            : 'bg-gradient-to-b from-orange-50/90 to-amber-50/95'
        }`} />

        <AnimatePresence>
          {theme === 'dark' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white/30 rounded-full"
                  style={{
                    left: `${20 + i * 15}%`,
                    top: `${20 + (i % 2) * 50}%`
                  }}
                  animate={{
                    opacity: [0.2, 0.6, 0.2],
                    scale: [1, 1.5, 1]
                  }}
                  transition={{
                    duration: 2 + i * 0.5,
                    repeat: Infinity,
                    delay: i * 0.3
                  }}
                />
              ))}
            </motion.div>
          )}

          {theme === 'light' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 overflow-hidden rounded-full"
            >
              <motion.div
                className="absolute w-3 h-3 bg-yellow-300/40 rounded-full blur-sm"
                style={{ top: '-10px', right: '10px' }}
                animate={{
                  opacity: [0.4, 0.8, 0.4],
                  scale: [1, 1.2, 1],
                  x: [0, 5, 0],
                  y: [0, -3, 0]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <motion.div
                className="absolute w-2 h-2 bg-orange-300/30 rounded-full blur-sm"
                style={{ bottom: '-5px', left: '15px' }}
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.3, 1]
                }}
                transition={{ duration: 2.5, repeat: Infinity }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div
        className="absolute top-[4px] left-[4px] w-[40px] h-[40px] rounded-full z-10"
        animate={{
          x: theme === 'dark' ? 0 : 56,
          rotate: theme === 'dark' ? 0 : 360,
          scale: isHovered ? 1.1 : 1
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 20
        }}
      >
        <div className={`absolute inset-0 rounded-full transition-all duration-500 ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-600 shadow-[0_8px_30px_rgba(99,102,241,0.6),inset_0_2px_10px_rgba(255,255,255,0.2)]'
            : 'bg-gradient-to-br from-yellow-300 via-orange-400 to-amber-500 shadow-[0_8px_30px_rgba(251,191,36,0.6),inset_0_2px_10px_rgba(255,255,255,0.3)]'
        }`}>
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent"
              animate={{ opacity: isHovered ? 0.6 : 0.3 }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <motion.div
            className="absolute inset-[3px] rounded-full"
            animate={{
              background: theme === 'dark'
                ? 'linear-gradient(135deg, rgba(139,92,246,0.3) 0%, transparent 50%)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, transparent 50%)'
            }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {theme === 'dark' ? (
              <motion.div
                key="moon"
                initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.3, type: 'spring' }}
              >
                <svg className="w-6 h-6 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                </svg>
              </motion.div>
            ) : (
              <motion.div
                key="sun"
                initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.3, type: 'spring' }}
              >
                <svg className="w-6 h-6 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
                </svg>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div
          className="absolute -inset-1 rounded-full opacity-0"
          animate={{
            opacity: isHovered ? [0, 0.3, 0] : 0,
            scale: isHovered ? [1, 1.3, 1] : 1
          }}
          transition={{ duration: 0.8 }}
        >
          <div className={`w-full h-full rounded-full ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-indigo-500 to-purple-500'
              : 'bg-gradient-to-r from-yellow-400 to-orange-400'
          }`} />
        </motion.div>
      </motion.div>

      <div className="absolute inset-0 flex items-center justify-between px-[18px] pointer-events-none z-20">
        <motion.div
          animate={{ 
            opacity: theme === 'dark' ? 0.9 : 0.3,
            scale: theme === 'dark' ? 1 : 0.7,
            x: theme === 'dark' ? 0 : 2
          }}
          transition={{ duration: 0.4, type: 'spring' }}
        >
          <svg className="w-4 h-4 text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
          </svg>
        </motion.div>
        
        <motion.div
          animate={{ 
            opacity: theme === 'dark' ? 0.3 : 0.9,
            scale: theme === 'dark' ? 0.7 : 1,
            x: theme === 'dark' ? -2 : 0
          }}
          transition={{ duration: 0.4, type: 'spring' }}
        >
          <svg className="w-4 h-4 text-amber-500 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0z"/>
          </svg>
        </motion.div>
      </div>

      <motion.div
        className={`absolute inset-0 rounded-full pointer-events-none transition-all duration-500 ${
          isHovered
            ? theme === 'dark'
              ? 'shadow-[inset_0_0_30px_rgba(99,102,241,0.2)]'
              : 'shadow-[inset_0_0_30px_rgba(251,191,36,0.2)]'
            : ''
        }`}
      />

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`absolute -bottom-10 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
              theme === 'dark'
                ? 'bg-indigo-900/90 text-indigo-200'
                : 'bg-orange-100/90 text-orange-800'
            } backdrop-blur-sm shadow-lg`}
          >
            {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
