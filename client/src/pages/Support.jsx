import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMessageSquare, FiPlus, FiSend, FiCheck, FiClock, FiAlertCircle, FiMail, FiPhone, FiHelpCircle, FiTrash2 } from 'react-icons/fi'
import { FaHeadset, FaTicketAlt, FaComments, FaFileAlt, FaExclamationTriangle } from 'react-icons/fa'
import { api } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'

const mockTickets = [
  {
    _id: 'TKT001',
    subject: 'Unable to withdraw funds',
    category: 'withdrawal',
    priority: 'high',
    status: 'open',
    createdAt: new Date(Date.now() - 86400000),
    messages: [
      { sender: 'me', message: 'I tried to withdraw my funds but the transaction keeps failing. Please help!', timestamp: new Date(Date.now() - 86400000), isAdmin: false },
      { sender: 'support', message: 'Hello! I\'m sorry to hear you\'re experiencing issues. Let me look into this for you.', timestamp: new Date(Date.now() - 82800000), isAdmin: true },
      { sender: 'me', message: 'Thank you! I\'ve been trying for 2 hours now.', timestamp: new Date(Date.now() - 79200000), isAdmin: false },
    ]
  },
  {
    _id: 'TKT002',
    subject: 'KYC verification pending',
    category: 'technical',
    priority: 'medium',
    status: 'in_progress',
    createdAt: new Date(Date.now() - 172800000),
    messages: [
      { sender: 'me', message: 'I submitted my KYC documents yesterday but the status is still pending.', timestamp: new Date(Date.now() - 172800000), isAdmin: false },
      { sender: 'support', message: 'Thank you for submitting. Our team is reviewing your documents. This usually takes 24-48 hours.', timestamp: new Date(Date.now() - 169200000), isAdmin: true },
    ]
  },
  {
    _id: 'TKT003',
    subject: 'API integration issue',
    category: 'technical',
    priority: 'low',
    status: 'closed',
    createdAt: new Date(Date.now() - 604800000),
    messages: [
      { sender: 'me', message: 'I\'m getting rate limit errors when using the API.', timestamp: new Date(Date.now() - 604800000), isAdmin: false },
      { sender: 'support', message: 'The rate limit is 100 requests per minute. I\'ve increased it to 500 for your account.', timestamp: new Date(Date.now() - 601200000), isAdmin: true },
      { sender: 'me', message: 'Perfect! It\'s working now. Thank you!', timestamp: new Date(Date.now() - 597600000), isAdmin: false },
    ]
  }
]

const faqData = [
  { question: 'How do I deposit funds?', answer: 'Go to Wallet > Deposit, select your preferred cryptocurrency, copy the address or scan the QR code, and send funds.' },
  { question: 'How long do withdrawals take?', answer: 'Withdrawals are processed within 10-30 minutes depending on network congestion.' },
  { question: 'What are the trading fees?', answer: 'Maker fee: 0.1%, Taker fee: 0.1%. VIP users get discounted rates.' },
  { question: 'How to enable 2FA?', answer: 'Go to Settings > Security > Two-Factor Authentication and follow the setup instructions.' },
]

export default function Support() {
  const { theme } = useThemeStore()
  const [tickets, setTickets] = useState(mockTickets)
  const [loading, setLoading] = useState(false)
  const [showNewTicket, setShowNewTicket] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [reply, setReply] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [activeTab, setActiveTab] = useState('tickets')
  const [expandedFaq, setExpandedFaq] = useState(null)

  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: 'general',
    priority: 'medium',
    message: ''
  })

  const notify = (message) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      const { data } = await api.get('/support')
      if (data.tickets && data.tickets.length > 0) {
        setTickets(data.tickets)
      }
    } catch (error) {
      // Use mock data if API fails
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTicket = (e) => {
    e.preventDefault()
    if (!newTicket.subject || !newTicket.message) return
    
    setSubmitting(true)
    const ticket = {
      _id: 'TKT' + Date.now(),
      subject: newTicket.subject,
      category: newTicket.category,
      priority: newTicket.priority,
      status: 'open',
      createdAt: new Date(),
      messages: [{ sender: 'me', message: newTicket.message, timestamp: new Date(), isAdmin: false }]
    }
    
    setTimeout(() => {
      setTickets([ticket, ...tickets])
      setShowNewTicket(false)
      setNewTicket({ subject: '', category: 'general', priority: 'medium', message: '' })
      setSubmitting(false)
      setSelectedTicket(ticket)
      notify('Ticket created successfully!')
    }, 500)
  }

  const handleSendReply = (e) => {
    e.preventDefault()
    if (!selectedTicket || !reply.trim()) return
    
    setSubmitting(true)
    const newMessage = { sender: 'me', message: reply, timestamp: new Date(), isAdmin: false }
    
    setTimeout(() => {
      const updatedTickets = tickets.map(t => 
        t._id === selectedTicket._id 
          ? { ...t, messages: [...t.messages, newMessage] }
          : t
      )
      setTickets(updatedTickets)
      setSelectedTicket({ ...selectedTicket, messages: [...selectedTicket.messages, newMessage] })
      setReply('')
      setSubmitting(false)
      notify('Reply sent!')
    }, 300)
  }

  const handleDeleteTicket = (ticketId) => {
    setTickets(tickets.filter(t => t._id !== ticketId))
    if (selectedTicket?._id === ticketId) {
      setSelectedTicket(null)
    }
    notify('Ticket deleted')
  }

  const categories = ['general', 'trading', 'deposit', 'withdrawal', 'technical', 'other']
  const priorities = ['low', 'medium', 'high', 'urgent']

  const getStatusConfig = (status) => {
    switch (status) {
      case 'open': return { icon: FiClock, color: 'text-yellow-400', bg: 'bg-yellow-500/20', label: 'Open' }
      case 'in_progress': return { icon: FiAlertCircle, color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'In Progress' }
      case 'closed': return { icon: FiCheck, color: 'text-green-400', bg: 'bg-green-500/20', label: 'Closed' }
      default: return { icon: FiClock, color: 'text-gray-400', bg: 'bg-gray-500/20', label: status }
    }
  }

  const getPriorityConfig = (priority) => {
    switch (priority) {
      case 'urgent': return { color: 'text-red-400', bg: 'bg-red-500/20' }
      case 'high': return { color: 'text-orange-400', bg: 'bg-orange-500/20' }
      case 'medium': return { color: 'text-yellow-400', bg: 'bg-yellow-500/20' }
      case 'low': return { color: 'text-blue-400', bg: 'bg-blue-500/20' }
      default: return { color: 'text-gray-400', bg: 'bg-gray-500/20' }
    }
  }

  const stats = {
    open: tickets.filter(t => t.status === 'open').length,
    in_progress: tickets.filter(t => t.status === 'in_progress').length,
    closed: tickets.filter(t => t.status === 'closed').length,
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-6 right-6 z-[100] px-6 py-3 rounded-xl bg-emerald-500 text-white shadow-2xl flex items-center gap-3"
          >
            <FiCheck className="w-5 h-5" />
            <span className="font-medium">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Support Center</h1>
          <p className={`mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>We're here to help 24/7</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowNewTicket(true)}
          className="self-start flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow-lg shadow-emerald-500/30"
        >
          <FiPlus className="w-5 h-5" />
          New Ticket
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          whileHover={{ y: -4 }}
          className={`p-5 rounded-2xl ${theme === 'dark' ? 'bg-gradient-to-br from-yellow-500/10 to-amber-500/5 border border-yellow-500/20' : 'bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200'}`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <FiClock className="w-6 h-6 text-yellow-400" />
            </div>
            <span className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-gray-500'}`}>Open Tickets</span>
          </div>
          <p className="text-3xl font-bold text-yellow-400">{stats.open}</p>
        </motion.div>
        <motion.div
          whileHover={{ y: -4 }}
          className={`p-5 rounded-2xl ${theme === 'dark' ? 'bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20' : 'bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200'}`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <FiAlertCircle className="w-6 h-6 text-blue-400" />
            </div>
            <span className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-gray-500'}`}>In Progress</span>
          </div>
          <p className="text-3xl font-bold text-blue-400">{stats.in_progress}</p>
        </motion.div>
        <motion.div
          whileHover={{ y: -4 }}
          className={`p-5 rounded-2xl ${theme === 'dark' ? 'bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20' : 'bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200'}`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <FiCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <span className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-gray-500'}`}>Resolved</span>
          </div>
          <p className="text-3xl font-bold text-emerald-400">{stats.closed}</p>
        </motion.div>
      </div>

      <div className="flex gap-2">
        {['tickets', 'faq', 'contact'].map((tab) => (
          <motion.button
            key={tab}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
              activeTab === tab
                ? theme === 'dark'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-emerald-100 text-emerald-600 border border-emerald-200'
                : theme === 'dark'
                  ? 'bg-white/5 text-white/60 hover:bg-white/10'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab === 'tickets' && <FaTicketAlt className="w-4 h-4 mr-2 inline" />}
            {tab === 'faq' && <FiHelpCircle className="w-4 h-4 mr-2 inline" />}
            {tab === 'contact' && <FaHeadset className="w-4 h-4 mr-2 inline" />}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </motion.button>
        ))}
      </div>

      {activeTab === 'tickets' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className={`rounded-2xl p-5 ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
              <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Your Tickets</h2>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 rounded-xl animate-pulse bg-gray-200 dark:bg-gray-700" />
                  ))}
                </div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-12">
                  <FaTicketAlt className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} />
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>No tickets yet</p>
                  <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Create a new ticket to get help</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {tickets.map((ticket) => {
                    const statusConfig = getStatusConfig(ticket.status)
                    const StatusIcon = statusConfig.icon
                    return (
                      <motion.div
                        key={ticket._id}
                        whileHover={{ scale: 1.02, x: 4 }}
                        onClick={() => setSelectedTicket(ticket)}
                        className={`p-4 rounded-xl cursor-pointer transition-all border ${
                          selectedTicket?._id === ticket._id
                            ? theme === 'dark'
                              ? 'bg-emerald-500/10 border-emerald-500/30'
                              : 'bg-emerald-50 border-emerald-200'
                            : theme === 'dark'
                              ? 'bg-white/5 hover:bg-white/10 border-transparent'
                              : 'bg-gray-50 hover:bg-gray-100 border-transparent'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className={`font-medium text-sm line-clamp-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {ticket.subject}
                          </span>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => { e.stopPropagation(); handleDeleteTicket(ticket._id); }}
                            className="p-1 rounded-lg hover:bg-red-500/20 text-red-400"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${statusConfig.bg} ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                          <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                            {ticket.messages?.length || 0} msgs
                          </span>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className={`rounded-2xl h-[600px] flex flex-col ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
              {selectedTicket ? (
                <>
                  <div className={`p-5 border-b ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {selectedTicket.subject}
                        </h2>
                        <div className="flex items-center gap-3 mt-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${getPriorityConfig(selectedTicket.priority).bg} ${getPriorityConfig(selectedTicket.priority).color}`}>
                            {selectedTicket.priority}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${getStatusConfig(selectedTicket.status).bg} ${getStatusConfig(selectedTicket.status).color}`}>
                            {getStatusConfig(selectedTicket.status).label}
                          </span>
                          <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                            {selectedTicket.category}
                          </span>
                        </div>
                      </div>
                      <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                        {new Date(selectedTicket.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {selectedTicket.messages?.map((msg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] p-4 rounded-2xl ${
                          msg.sender === 'me'
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                            : msg.isAdmin
                              ? theme === 'dark'
                                ? 'bg-purple-500/20 text-white border border-purple-500/30'
                                : 'bg-purple-50 text-gray-900 border border-purple-200'
                              : theme === 'dark'
                                ? 'bg-white/10 text-white'
                                : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p className="text-sm">{msg.message}</p>
                          <p className={`text-xs mt-2 ${msg.sender === 'me' ? 'text-white/70' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {new Date(msg.timestamp).toLocaleString()}
                            {msg.isAdmin && ' • Support Team'}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {selectedTicket.status !== 'closed' && (
                    <form onSubmit={handleSendReply} className={`p-5 border-t ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={reply}
                          onChange={(e) => setReply(e.target.value)}
                          placeholder="Type your message..."
                          className={`flex-1 px-4 py-3 rounded-xl transition-all outline-none ${
                            theme === 'dark'
                              ? 'bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-500/50'
                              : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500/50'
                          }`}
                        />
                        <motion.button
                          type="submit"
                          disabled={submitting || !reply.trim()}
                          whileHover={reply.trim() ? { scale: 1.02 } : {}}
                          whileTap={reply.trim() ? { scale: 0.98 } : {}}
                          className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                            reply.trim()
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30'
                              : theme === 'dark'
                                ? 'bg-white/10 text-white/40 cursor-not-allowed'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {submitting ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity }}
                              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                            />
                          ) : (
                            <FiSend className="w-5 h-5" />
                          )}
                        </motion.button>
                      </div>
                    </form>
                  )}
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <FaComments className={`w-20 h-20 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`} />
                    <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Select a ticket to view conversation
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'faq' && (
        <div className={`rounded-2xl p-6 ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <h2 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqData.map((faq, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.01 }}
                className={`rounded-xl overflow-hidden ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full p-4 text-left flex items-center justify-between"
                >
                  <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: expandedFaq === i ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FiChevron className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {expandedFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className={`px-4 pb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'contact' && (
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <motion.div
            whileHover={{ y: -4 }}
            className={`rounded-2xl p-6 text-center ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}
          >
            <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
              <FiMail className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Email Support</h3>
            <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Get help via email</p>
            <a href="mailto:support@cryptofx.com" className="text-blue-400 hover:text-blue-300 font-medium">
              support@cryptofx.com
            </a>
          </motion.div>
          <motion.div
            whileHover={{ y: -4 }}
            className={`rounded-2xl p-6 text-center ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}
          >
            <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
              <FaComments className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Live Chat</h3>
            <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Chat with an agent</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.location.href = '/ai-chat'}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium"
            >
              Start Chat
            </motion.button>
          </motion.div>
        </div>
      )}

      <AnimatePresence>
        {showNewTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => setShowNewTicket(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-lg rounded-2xl p-6 ${theme === 'dark' ? 'bg-gray-900 border border-white/10' : 'bg-white border border-gray-200 shadow-xl'}`}
            >
              <h2 className={`text-xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Create New Ticket
              </h2>
              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl transition-all outline-none ${
                      theme === 'dark'
                        ? 'bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-500/50'
                        : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500/50'
                    }`}
                    placeholder="Brief description of your issue"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Category
                    </label>
                    <select
                      value={newTicket.category}
                      onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl outline-none cursor-pointer ${
                        theme === 'dark'
                          ? 'bg-white/5 border border-white/10 text-white'
                          : 'bg-gray-50 border border-gray-200 text-gray-900'
                      }`}
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Priority
                    </label>
                    <select
                      value={newTicket.priority}
                      onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl outline-none cursor-pointer ${
                        theme === 'dark'
                          ? 'bg-white/5 border border-white/10 text-white'
                          : 'bg-gray-50 border border-gray-200 text-gray-900'
                      }`}
                    >
                      {priorities.map(p => (
                        <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Message *
                  </label>
                  <textarea
                    value={newTicket.message}
                    onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                    rows={4}
                    className={`w-full px-4 py-3 rounded-xl transition-all outline-none resize-none ${
                      theme === 'dark'
                        ? 'bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-500/50'
                        : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500/50'
                    }`}
                    placeholder="Describe your issue in detail..."
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowNewTicket(false)}
                    className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                      theme === 'dark'
                        ? 'bg-white/5 hover:bg-white/10 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }`}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={submitting || !newTicket.subject || !newTicket.message}
                    whileHover={newTicket.subject && newTicket.message ? { scale: 1.02 } : {}}
                    whileTap={newTicket.subject && newTicket.message ? { scale: 0.98 } : {}}
                    className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                      newTicket.subject && newTicket.message
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30'
                        : theme === 'dark'
                          ? 'bg-white/10 text-white/40 cursor-not-allowed'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {submitting ? 'Creating...' : 'Create Ticket'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const FiChevron = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9" />
  </svg>
)
