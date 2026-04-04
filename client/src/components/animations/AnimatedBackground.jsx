import { motion } from 'framer-motion'
import { useThemeStore } from '../../store/themeStore'

export default function AnimatedBackground() {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="mesh-gradient absolute inset-0" />
      </div>

      <motion.div
        className="orb orb-primary absolute w-[600px] h-[600px]"
        style={{ top: '-20%', left: '-10%' }}
        animate={{
          x: [0, 100, 50, 0],
          y: [0, 50, 100, 0],
          scale: [1, 1.2, 0.9, 1],
          rotate: [0, 90, 180, 270, 360],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="orb orb-secondary absolute w-[500px] h-[500px]"
        style={{ top: '60%', right: '-15%' }}
        animate={{
          x: [0, -80, -40, 0],
          y: [0, -60, -100, 0],
          scale: [1, 0.8, 1.1, 1],
          rotate: [360, 270, 180, 90, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 5,
        }}
      />

      <motion.div
        className="orb orb-primary absolute w-[400px] h-[400px]"
        style={{ bottom: '-10%', left: '30%' }}
        animate={{
          x: [0, -50, 50, 0],
          y: [0, -80, -40, 0],
          scale: [1, 1.1, 0.85, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 10,
        }}
      />

      <motion.div
        className="orb orb-secondary absolute w-[350px] h-[350px]"
        style={{ top: '20%', left: '60%' }}
        animate={{
          x: [0, 60, -30, 0],
          y: [0, 40, 80, 0],
          scale: [1, 0.9, 1.15, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 3,
        }}
      />

      {[...Array(5)].map((_, i) => (
        <motion.div
          key={`cube-${i}`}
          className="absolute"
          style={{
            left: `${15 + i * 20}%`,
            top: `${20 + (i % 3) * 25}%`,
            perspective: '1000px',
          }}
          animate={{
            rotateX: [0, 360],
            rotateY: [0, -360],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 15 + i * 2,
            repeat: Infinity,
            ease: 'linear',
            delay: i * 2,
          }}
        >
          <div 
            className="w-16 h-16 border border-blue-500/20 rounded-lg"
            style={{
              transform: 'rotateY(45deg) rotateX(45deg)',
              boxShadow: '0 0 30px rgba(59, 130, 246, 0.2), inset 0 0 20px rgba(59, 130, 246, 0.1)',
            }}
          />
        </motion.div>
      ))}

      {[...Array(4)].map((_, i) => (
        <motion.div
          key={`ring-${i}`}
          className="absolute border-2 border-purple-500/20 rounded-full"
          style={{
            left: `${10 + i * 25}%`,
            top: `${30 + i * 15}%`,
          }}
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 20 + i * 3,
            repeat: Infinity,
            ease: 'linear',
            delay: i * 3,
          }}
        >
          <div className={`w-${20 + i * 10} h-${20 + i * 10}`} />
        </motion.div>
      ))}

      <motion.div
        className="absolute"
        style={{
          top: '10%',
          right: '10%',
          perspective: '1000px',
        }}
        animate={{
          rotate: [0, 360],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <div 
          className="w-32 h-32 rounded-full border-4 border-blue-500/30"
          style={{
            boxShadow: '0 0 50px rgba(59, 130, 246, 0.3), inset 0 0 30px rgba(59, 130, 246, 0.1)',
          }}
        />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border-4 border-purple-500/30"
        />
      </motion.div>

      <motion.div
        className="absolute"
        style={{
          bottom: '20%',
          left: '5%',
          perspective: '1000px',
        }}
        animate={{
          rotate: [360, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <div 
          className="w-24 h-24 rounded-2xl border-4 border-purple-500/30"
          style={{
            transform: 'rotate(45deg)',
            boxShadow: '0 0 40px rgba(124, 58, 237, 0.3)',
          }}
        />
      </motion.div>

      {[...Array(30)].map((_, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: Math.random() * 3 + 1,
            height: Math.random() * 3 + 1,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: Math.random() * 3,
          }}
        >
          <div className="w-full h-full bg-white rounded-full" />
        </motion.div>
      ))}

      <motion.div
        className="absolute w-96 h-96 border border-blue-500/10"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
        }}
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      <motion.div
        className="absolute w-80 h-80 border border-purple-500/10"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
        }}
        animate={{
          rotate: [360, 0],
          scale: [1, 0.9, 1],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-2 h-2 bg-blue-500/50 rounded-full"
          style={{
            left: `${20 + i * 12}%`,
            top: `${40 + (i % 3) * 20}%`,
          }}
          animate={{
            x: [0, 30, -30, 0],
            y: [0, -20, 20, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 8 + i,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.5,
          }}
        />
      ))}

      <motion.div
        className="floating-shape w-32 h-32 border border-blue-500/20"
        style={{ top: '15%', left: '10%', borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%' }}
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      <motion.div
        className="floating-shape w-24 h-24 border border-purple-500/20"
        style={{ top: '70%', right: '15%', borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' }}
        animate={{
          rotate: [360, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      <motion.div
        className="absolute"
        style={{ top: '30%', right: '20%' }}
        animate={{
          rotate: [0, 360],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        <div className="w-40 h-40 relative">
          <div className="absolute inset-0 border-2 border-blue-500/20 rounded-full" />
          <div className="absolute inset-4 border-2 border-purple-500/20 rounded-full" />
          <div className="absolute inset-8 border-2 border-blue-500/10 rounded-full" />
        </div>
      </motion.div>
    </div>
  )
}
