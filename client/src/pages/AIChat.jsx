import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSend, FiMessageSquare, FiZap, FiTrendingUp, FiActivity, FiHeadphones, FiUser, FiCircle } from 'react-icons/fi'
import { api } from '../store/authStore'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'

export default function AIChat() {
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', content: 'Hello! I\'m your AI trading assistant. I can help you with market analysis, trading strategies, and answer any questions about cryptocurrencies. How can I help you today?', isAI: true }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [chatMode, setChatMode] = useState('ai')
  const [isConnected, setIsConnected] = useState(false)
  const [isAgentTyping, setIsAgentTyping] = useState(false)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [conversationId, setConversationId] = useState(null)
  const messagesEndRef = useRef(null)
  const { user } = useAuthStore()
  const { theme } = useThemeStore()
  const socketRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isAgentTyping])

  useEffect(() => {
    if (chatMode === 'support' && !socketRef.current) {
      initializeSocket()
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [chatMode])

  useEffect(() => {
    if (chatMode === 'support' && unreadMessages > 0) {
      setUnreadMessages(0)
    }
  }, [chatMode, messages])

  const initializeSocket = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const io = (await import('socket.io-client')).default
      
      socketRef.current = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        auth: { token },
        transports: ['websocket', 'polling']
      })

      socketRef.current.on('connect', () => {
        setIsConnected(true)
        socketRef.current.emit('join_support', { userId: user?._id })
      })

      socketRef.current.on('disconnect', () => {
        setIsConnected(false)
      })

      socketRef.current.on('new_message', (message) => {
        if (message.sender === 'agent' || message.sender === 'admin') {
          const agentMessage = {
            id: Date.now(),
            role: 'assistant',
            content: message.content,
            sender: message.senderName || 'Support Agent',
            isAgent: true,
            timestamp: new Date()
          }
          setMessages(prev => [...prev, agentMessage])
          if (chatMode !== 'support') {
            setUnreadMessages(prev => prev + 1)
          }
        }
      })

      socketRef.current.on('agent_typing', () => {
        setIsAgentTyping(true)
      })

      socketRef.current.on('agent_stop_typing', () => {
        setIsAgentTyping(false)
      })

      socketRef.current.on('conversation_started', (data) => {
        setConversationId(data.conversationId)
      })

      socketRef.current.on('agent_joined', (data) => {
        setMessages(prev => [...prev, {
          id: Date.now(),
          role: 'system',
          content: `${data.agentName} has joined the conversation`,
          isSystem: true
        }])
      })

      const previousMessages = await fetchPreviousMessages()
      if (previousMessages.length > 0) {
        setMessages(prev => [...prev, ...previousMessages])
      }

    } catch (error) {
      console.error('Socket connection failed:', error)
      setIsConnected(false)
    }
  }

  const fetchPreviousMessages = async () => {
    try {
      const { data } = await api.get('/support/messages')
      return data.messages || []
    } catch {
      return []
    }
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return

    if (chatMode === 'ai') {
      await sendAIMessage()
    } else {
      await sendSupportMessage()
    }
  }

  const sendAIMessage = async () => {
    const userMessage = { id: Date.now(), role: 'user', content: input, isAI: true }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)
    setSuggestions([])

    try {
      const { data } = await api.post('/ai/chat', { message: input })
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.response,
        suggestions: data.suggestions,
        isAI: true
      }
      setMessages(prev => [...prev, assistantMessage])
      setSuggestions(data.suggestions || [])
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        isAI: true
      }])
    } finally {
      setLoading(false)
    }
  }

  const sendSupportMessage = async () => {
    const userMessage = { id: Date.now(), role: 'user', content: input, sender: user?.name || 'You', timestamp: new Date() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      if (socketRef.current?.connected) {
        socketRef.current.emit('send_message', {
          content: input,
          conversationId
        })
        
        await api.post('/support/messages', {
          content: input,
          sender: 'user'
        })
      } else {
        await api.post('/support/messages', {
          content: input,
          sender: 'user'
        })
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: 'assistant',
        content: 'Failed to send message. Please try again.',
        isAgent: true
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleSuggestion = (suggestion) => {
    setInput(suggestion)
  }

  const handleAnalyze = async (symbol) => {
    if (chatMode !== 'ai') {
      setChatMode('ai')
    }
    setInput(`Analyze ${symbol}`)
    setLoading(true)

    try {
      const { data } = await api.post('/ai/analyze', { symbol })
      const response = `📊 ${symbol.toUpperCase()} Analysis:\n\n` +
        `📈 Trend: ${data.trend} (${data.confidence}% confidence)\n` +
        `💰 Support: $${data.support}\n` +
        `🎯 Resistance: $${data.resistance}\n\n` +
        `📉 Indicators:\n` +
        `- RSI: ${data.indicators.rsi}\n` +
        `- MACD: ${data.indicators.macd}\n\n` +
        `🔮 Prediction:\n` +
        `- Next 24h: ${data.prediction.next24h}\n` +
        `- Next 7d: ${data.prediction.next7d}`

      setMessages(prev => [...prev, 
        { id: Date.now(), role: 'user', content: `Analyze ${symbol}`, isAI: true },
        { id: Date.now() + 1, role: 'assistant', content: response, isAI: true }
      ])
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    { label: 'Analyze BTC', icon: FiTrendingUp, action: () => handleAnalyze('BTC') },
    { label: 'Analyze ETH', icon: FiActivity, action: () => handleAnalyze('ETH') },
    { label: 'Trading Signals', icon: FiZap, action: () => setInput('Show me trading signals') },
    { label: 'Market News', icon: FiMessageSquare, action: () => setInput('What\'s the latest market news?') },
  ]

  const formatTime = (date) => {
    if (!date) return ''
    const d = new Date(date)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className={`h-[calc(100vh-180px)] flex flex-col ${theme === 'dark' ? '' : 'bg-gray-50'}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className={`text-3xl font-bold flex items-center gap-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <FiHeadphones className="w-5 h-5 text-white" />
            </div>
            Support Chat
          </h1>
          <p className={`mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Get help from AI assistant or live support agent</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl p-1 border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setChatMode('ai')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              chatMode === 'ai'
                ? 'bg-primary text-white'
                : theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FiZap className="w-4 h-4" />
            <span className="text-sm font-medium">AI Assistant</span>
          </button>
          <button
            onClick={() => setChatMode('support')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all relative ${
              chatMode === 'support'
                ? 'bg-primary text-white'
                : theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FiHeadphones className="w-4 h-4" />
            <span className="text-sm font-medium">Live Support</span>
            {unreadMessages > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadMessages}
              </span>
            )}
          </button>
        </div>
      </div>

      {chatMode === 'support' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-4 px-4 py-3 rounded-xl flex items-center gap-3 ${
            isConnected
              ? theme === 'dark' ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-emerald-50 border border-emerald-200'
              : theme === 'dark' ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-yellow-50 border border-yellow-200'
          }`}
        >
          <FiCircle className={`w-3 h-3 ${isConnected ? 'text-emerald-400 fill-emerald-400' : 'text-yellow-400 fill-yellow-400'} animate-pulse`} />
          <span className={`text-sm ${isConnected ? 'text-emerald-400' : 'text-yellow-400'}`}>
            {isConnected ? 'Connected to support • An agent will be with you shortly' : 'Connecting to support...'}
          </span>
        </motion.div>
      )}

      <div className="grid md:grid-cols-4 gap-6 flex-1 min-h-0">
        <div className="md:col-span-1 space-y-4">
          <div className={`rounded-2xl p-5 ${theme === 'dark' ? 'bg-[var(--bg-secondary)] border border-[var(--border-color)]' : 'bg-white border border-gray-200 shadow-lg'}`}>
            <h3 className={`text-sm font-medium mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {chatMode === 'ai' ? 'Quick Analysis' : 'Need Help?'}
            </h3>
            <div className="space-y-2">
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  onClick={action.action}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                    theme === 'dark'
                      ? 'bg-[var(--bg-tertiary)]/50 hover:bg-[var(--bg-tertiary)] text-gray-300 hover:text-white'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                  }`}
                >
                  <action.icon className="w-4 h-4 text-primary" />
                  <span className="text-sm">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {chatMode === 'support' && (
            <div className={`rounded-2xl p-5 ${theme === 'dark' ? 'bg-[var(--bg-secondary)] border border-[var(--border-color)]' : 'bg-white border border-gray-200 shadow-lg'}`}>
              <h3 className={`text-sm font-medium mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Common Topics
              </h3>
              <div className="space-y-2">
                {['Account Issues', 'Trading Questions', 'Deposit/Withdrawal', 'Security Concerns'].map((topic) => (
                  <button
                    key={topic}
                    onClick={() => setInput(`I need help with: ${topic}`)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      theme === 'dark' ? 'hover:bg-[var(--bg-tertiary)] text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="md:col-span-3 flex flex-col min-h-0">
          <div className={`rounded-2xl flex-1 flex flex-col min-h-0 ${theme === 'dark' ? 'bg-[var(--bg-secondary)] border border-[var(--border-color)]' : 'bg-white border border-gray-200 shadow-lg'}`}>
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'system' ? (
                    <div className={`w-full text-center py-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} text-sm`}>
                      {msg.content}
                    </div>
                  ) : (
                    <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                      <div className={`px-4 py-3 rounded-2xl ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-primary to-secondary text-white'
                          : msg.isAgent
                            ? theme === 'dark' ? 'bg-purple-500/20 text-white border border-purple-500/30' : 'bg-purple-50 text-gray-900 border border-purple-200'
                            : theme === 'dark' ? 'bg-[var(--bg-tertiary)] text-white' : 'bg-gray-100 text-gray-900'
                      }`}>
                        {msg.sender && (
                          <p className={`text-xs mb-1 font-medium ${
                            msg.role === 'user' 
                              ? 'text-white/70' 
                              : msg.isAgent 
                                ? 'text-purple-400' 
                                : 'text-gray-500'
                          }`}>
                            {msg.isAgent && <FiHeadphones className="w-3 h-3 inline mr-1" />}
                            {msg.sender}
                          </p>
                        )}
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      {msg.timestamp && (
                        <span className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                          {formatTime(msg.timestamp)}
                        </span>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
              
              {isAgentTyping && (
                <div className="flex justify-start">
                  <div className={`px-4 py-3 rounded-2xl ${theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-50'}`}>
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" />
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}
              
              {loading && !isAgentTyping && (
                <div className="flex justify-start">
                  <div className={`px-4 py-3 rounded-2xl ${theme === 'dark' ? 'bg-[var(--bg-tertiary)]' : 'bg-gray-100'}`}>
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
                      <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {(suggestions.length > 0 || (messages.length <= 1 && chatMode === 'ai')) && (
              <div className="px-4 pb-4">
                <AnimatePresence>
                  {suggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex flex-wrap gap-2 mb-4"
                    >
                      {suggestions.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => handleSuggestion(s)}
                          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                            theme === 'dark' ? 'bg-[var(--bg-tertiary)] text-gray-300 hover:bg-[var(--bg-tertiary)]/80' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <div className={`p-4 border-t ${theme === 'dark' ? 'border-[var(--border-color)]' : 'border-gray-200'}`}>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={chatMode === 'ai' ? "Ask me anything about trading..." : "Type your message..."}
                  className={`flex-1 px-4 py-3 rounded-xl outline-none transition-all ${
                    theme === 'dark'
                      ? 'bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-white placeholder-gray-500 focus:border-primary'
                      : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-primary'
                  }`}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className={`px-6 py-3 rounded-xl font-medium transition-all ${
                    input.trim() && !loading
                      ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30'
                      : theme === 'dark' ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  <FiSend className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
