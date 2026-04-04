import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { 
  FiArrowRight, FiLinkedin, FiTwitter, FiChevronLeft, FiChevronRight,
  FiMapPin, FiCalendar, FiArrowUpRight
} from 'react-icons/fi'
import { FaAppStore, FaGooglePlay, FaExchangeAlt, FaLinkedin, FaTwitter } from 'react-icons/fa'
import { useThemeStore } from '../store/themeStore'
import PublicNavbar from '../components/PublicNavbar'

const FadeIn = ({ children, delay = 0, direction = null }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  
  const variants = {
    hidden: { 
      opacity: 0, 
      y: direction === 'up' ? 40 : direction === 'down' ? -40 : 0,
      x: direction === 'left' ? 40 : direction === 'right' ? -40 : 0
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      x: 0,
      transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }
    }
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
    >
      {children}
    </motion.div>
  )
}

const StatCard = ({ value, label, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className="text-center"
  >
    <p className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
      {value}
    </p>
    <p className="mt-2 text-gray-400">{label}</p>
  </motion.div>
)

const TimelineItem = ({ year, title, description, image, isLast, delay = 0 }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -30 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex gap-8 pb-16 last:pb-0"
    >
      <div className="flex flex-col items-center">
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/30 z-10"
        >
          {year}
        </motion.div>
        {!isLast && (
          <div className="w-0.5 h-full bg-gradient-to-b from-blue-500/50 to-transparent absolute top-16 left-1/2 -translate-x-1/2" />
        )}
      </div>
      
      <motion.div
        whileHover={{ y: -5 }}
        className="flex-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-all duration-300"
      >
        {image && (
          <div className="mb-4 rounded-xl overflow-hidden h-40">
            <img src={image} alt={title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </div>
        )}
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
      </motion.div>
    </motion.div>
  )
}

const PressCard = ({ source, title, description, image, delay = 0 }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -8 }}
      className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all duration-300"
    >
      <div className="h-48 overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
        />
      </div>
      <div className="p-6">
        <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-semibold mb-3">
          {source}
        </span>
        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
          {title}
        </h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{description}</p>
        <button className="flex items-center gap-2 text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors">
          Read More <FiArrowUpRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}

const TeamCard = ({ name, role, description, image, socials, delay = 0 }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -8 }}
      className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-all duration-300"
    >
      <div className="relative w-24 h-24 mx-auto mb-4">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl rotate-6 group-hover:rotate-12 transition-transform duration-300" />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl -rotate-6 group-hover:-rotate-12 transition-transform duration-300" />
        <img 
          src={image} 
          alt={name} 
          className="relative w-24 h-24 rounded-2xl object-cover border-2 border-white/20" 
        />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-bold text-white">{name}</h3>
        <p className="text-blue-400 text-sm font-medium mb-3">{role}</p>
        <p className="text-gray-400 text-sm mb-4">{description}</p>
        <div className="flex justify-center gap-3">
          {socials?.linkedin && (
            <a href={socials.linkedin} className="p-2 rounded-lg bg-white/5 hover:bg-blue-500/20 text-gray-400 hover:text-blue-400 transition-all">
              <FaLinkedin className="w-4 h-4" />
            </a>
          )}
          {socials?.twitter && (
            <a href={socials.twitter} className="p-2 rounded-lg bg-white/5 hover:bg-blue-500/20 text-gray-400 hover:text-blue-400 transition-all">
              <FaTwitter className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  )
}

const ScrollProgress = () => {
  const { scrollYProgress } = useScroll()
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 origin-left z-[60]"
      style={{ scaleX }}
    />
  )
}

export default function About() {
  const { theme } = useThemeStore()
  const containerRef = useRef(null)
  const [teamScroll, setTeamScroll] = useState(0)

  const timelineItems = [
    { year: '2013', title: 'Beer for bitcoins', description: 'Our journey began with a simple idea - making cryptocurrency accessible to everyone. Started as a fun experiment trading beer for bitcoins.', image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=250&fit=crop' },
    { year: '2014', title: 'First crypto exchange', description: 'Launched our first cryptocurrency exchange platform, one of the earliest in Central Europe.', image: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400&h=250&fit=crop' },
    { year: '2015-2019', title: 'Growth phase', description: 'Expanded our services across Europe, added support for 50+ cryptocurrencies, and reached 100,000 users.', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop' },
    { year: '2020', title: 'One billion surpassed', description: 'Reached $1 billion in trading volume. Introduced advanced trading features and mobile apps.', image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=250&fit=crop' },
    { year: '2021', title: 'Investment milestone', description: 'Secured major investment from institutional investors. Launched our NFT marketplace.', image: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400&h=250&fit=crop' },
    { year: '2024', title: 'Partnership', description: 'Strategic partnerships with leading financial institutions and blockchain projects.', image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=250&fit=crop' },
    { year: '2025', title: 'Certification & licensing', description: 'Achieved full regulatory certification and licensing. Now operating in 100+ countries worldwide.', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=250&fit=crop' },
  ]

  const pressItems = [
    { source: 'TechCrunch', title: 'CryptoFX Raises $50M in Series B Funding', description: 'The European crypto exchange continues its expansion across the continent.', image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&h=400&fit=crop' },
    { source: 'Forbes', title: 'The Future of Crypto Trading in Europe', description: 'How CryptoFX is leading the charge in regulated cryptocurrency trading.', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop' },
    { source: 'Bloomberg', title: 'One Million Users Trust CryptoFX', description: 'Milestone achievement as platform reaches major user growth.', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop' },
    { source: 'CNBC', title: 'Interview: The Future of Digital Assets', description: 'CEO discusses the roadmap for cryptocurrency adoption.', image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=400&fit=crop' },
  ]

  const teamMembers = [
    { name: 'Martin Škoda', role: 'CEO & Founder', description: '15+ years in fintech. Former Goldman Sachs.', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop', socials: { linkedin: '#', twitter: '#' } },
    { name: 'Anna Novotná', role: 'CTO', description: 'Blockchain pioneer. Ex-Ethereum Foundation.', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop', socials: { linkedin: '#', twitter: '#' } },
    { name: 'Jakub Horák', role: 'Head of Trading', description: '10+ years algorithmic trading experience.', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop', socials: { linkedin: '#', twitter: '#' } },
    { name: 'Eva Procházková', role: 'Head of Compliance', description: 'Former regulator. Legal expert in crypto.', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop', socials: { linkedin: '#' } },
  ]

  const scrollTeam = (direction) => {
    const newScroll = teamScroll + (direction === 'left' ? -300 : 300)
    setTeamScroll(Math.max(0, Math.min(newScroll, 900)))
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white overflow-x-hidden">
      <ScrollProgress />
      <PublicNavbar />

      {/* ===== SECTION 1: HERO ===== */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B0F19] via-blue-950/30 to-[#0B0F19]" />
        
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] -top-40 -left-40"
          />
          <motion.div 
            animate={{ x: [0, -40, 0], y: [0, 30, 0], scale: [1, 0.9, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] bottom-0 right-0"
          />
        </div>

        {/* Floating visual elements */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-full hidden lg:block">
          <motion.div
            animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute right-20 top-20 w-64 h-64 bg-gradient-to-br from-blue-500/30 to-indigo-500/30 rounded-3xl backdrop-blur-xl border border-blue-500/20"
          />
          <motion.div
            animate={{ y: [0, 30, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute right-40 top-1/2 w-48 h-48 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full backdrop-blur-xl border border-purple-500/20"
          />
          <motion.div
            animate={{ y: [0, -15, 0], rotate: [0, 3, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute right-16 bottom-32 w-40 h-40 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 rounded-2xl backdrop-blur-xl border border-cyan-500/20"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="max-w-3xl">
            <FadeIn>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6"
              >
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                About CryptoFX
              </motion.div>
            </FadeIn>

            <FadeIn delay={0.1} direction="up">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
                We're <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">CryptoFX</span>, your guide to the world of crypto and investments
              </h1>
            </FadeIn>

            <FadeIn delay={0.2} direction="up">
              <p className="text-xl text-gray-400 mb-8 max-w-2xl leading-relaxed">
                A trusted global platform for buying, selling, and trading cryptocurrency. 
                Built with security, transparency, and innovation at its core.
              </p>
            </FadeIn>

            <FadeIn delay={0.3} direction="up">
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all"
                >
                  Sign up
                  <FiArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/markets"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all"
                >
                  Explore Platform
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>

        {/* Glow effect */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-blue-500/20 blur-[100px] pointer-events-none" />
      </section>

      {/* ===== SECTION 2: TRUST / EXPERIENCE ===== */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FadeIn direction="left">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-3xl blur-3xl" />
                <div className="relative rounded-3xl overflow-hidden h-[500px]">
                  <img 
                    src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=1000&fit=crop" 
                    alt="Team meeting" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent" />
                </div>
              </div>
            </FadeIn>

            <FadeIn direction="right">
              <div className="space-y-8">
                <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                  We've been around this fast world for <span className="text-blue-400">over 10 years</span>
                </h2>
                <p className="text-lg text-gray-400 leading-relaxed">
                  Since 2013, we've been at the forefront of the cryptocurrency revolution. 
                  From humble beginnings to becoming a globally recognized platform, our commitment 
                  to innovation and security has never wavered.
                </p>
                
                <div className="grid grid-cols-3 gap-8 pt-8 border-t border-white/10">
                  <StatCard value="10+" label="Years" delay={0.1} />
                  <StatCard value="1M+" label="Users" delay={0.2} />
                  <StatCard value="$1B+" label="Volume" delay={0.3} />
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ===== SECTION 3: TIMELINE ===== */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Journey</h2>
              <p className="text-gray-400 text-lg">From beer for bitcoins to global crypto platform</p>
            </div>
          </FadeIn>

          <div className="space-y-4">
            {timelineItems.map((item, index) => (
              <TimelineItem
                key={item.year}
                {...item}
                isLast={index === timelineItems.length - 1}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECTION 4: MEDIA / PRESS ===== */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">They wrote about us</h2>
              <p className="text-gray-400 text-lg">See what the media says about CryptoFX</p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-6">
            {pressItems.map((item, index) => (
              <PressCard key={index} {...item} delay={index * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECTION 5: TEAM / LOCATION ===== */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 via-transparent to-purple-950/20" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <FadeIn>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-4">
                <FiMapPin className="w-4 h-4" />
                Prague, Czech Republic
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">You'll find us in Prague</h2>
              <p className="text-gray-400 text-lg">Meet the team behind CryptoFX</p>
            </div>
          </FadeIn>

          <div className="relative">
            <div className="flex gap-6 overflow-x-hidden pb-4" style={{ transform: `translateX(-${teamScroll}px)` }}>
              {teamMembers.map((member, index) => (
                <div key={index} className="flex-none w-80">
                  <TeamCard {...member} delay={index * 0.1} />
                </div>
              ))}
            </div>

            <button 
              onClick={() => scrollTeam('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-blue-500/20 hover:border-blue-500/30 transition-all"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => scrollTeam('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-blue-500/20 hover:border-blue-500/30 transition-all"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* ===== SECTION 6: FOOTER ===== */}
      <footer className="border-t border-white/10 bg-[#0B0F19]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <Link to="/" className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <FaExchangeAlt className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">CryptoFX</span>
              </Link>
              <p className="text-sm text-gray-400 mb-4">
                Your guide to the world of crypto and investments. Safe, secure, and trusted by millions worldwide.
              </p>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-white/5 hover:bg-white/10 text-white transition-all"
                >
                  <FaAppStore className="w-4 h-4" />
                  <span>App Store</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-white/5 hover:bg-white/10 text-white transition-all"
                >
                  <FaGooglePlay className="w-4 h-4" />
                  <span>Google Play</span>
                </motion.button>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Services</h4>
              <ul className="space-y-2">
                {['Sign up', 'Buy & Sell', 'Trading Platform', 'API'].map((link) => (
                  <li key={link}>
                    <Link to="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2">
                {['About', 'Legal', 'Contact'].map((link) => (
                  <li key={link}>
                    <Link to="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Stay updated</h4>
              <p className="text-sm text-gray-400 mb-4">Subscribe to our newsletter</p>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Email" 
                  className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all">
                  →
                </button>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-500 text-center md:text-left">
              CryptoFX is a registered trademark. All rights reserved. Cryptocurrency investments carry risk.
            </p>
            <div className="flex items-center gap-4">
              <select className="bg-transparent text-gray-400 text-sm focus:outline-none">
                <option className="bg-gray-900">English</option>
                <option className="bg-gray-900">Čeština</option>
                <option className="bg-gray-900">Deutsch</option>
              </select>
            </div>
          </div>
          
          <div className="mt-8 text-center text-xs text-gray-600">
            © 2025 CryptoFX. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
