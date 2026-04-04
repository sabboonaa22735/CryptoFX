import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiUsers, FiActivity, FiTrendingUp, FiSettings, FiCheck, FiX, FiAlertCircle, FiDollarSign } from 'react-icons/fi'
import { api } from '../store/authStore'

export default function Admin() {
  const [activeTab, setActiveTab] = useState('users')
  const [users, setUsers] = useState([])
  const [transactions, setTransactions] = useState([])
  const [tickets, setTickets] = useState([])
  const [stats, setStats] = useState({ totalUsers: 0, totalDeposits: 0, totalWithdrawals: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'users') {
        const { data } = await api.get('/users')
        setUsers(data.users)
      } else if (activeTab === 'transactions') {
        const { data } = await api.get('/wallet/all')
        setTransactions(data.transactions)
        setStats(data.stats)
      } else if (activeTab === 'tickets') {
        const { data } = await api.get('/support/all')
        setTickets(data.tickets)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyUser = async (userId) => {
    try {
      await api.put(`/users/${userId}/verify`, { isVerified: true })
      fetchData()
    } catch (error) {
      console.error('Failed to verify user:', error)
    }
  }

  const handleApproveTransaction = async (txId) => {
    try {
      await api.put(`/wallet/${txId}/approve`)
      fetchData()
    } catch (error) {
      console.error('Failed to approve transaction:', error)
    }
  }

  const handleRejectTransaction = async (txId) => {
    try {
      await api.put(`/wallet/${txId}/reject`)
      fetchData()
    } catch (error) {
      console.error('Failed to reject transaction:', error)
    }
  }

  const tabs = [
    { id: 'users', label: 'Users', icon: FiUsers },
    { id: 'transactions', label: 'Transactions', icon: FiDollarSign },
    { id: 'tickets', label: 'Support Tickets', icon: FiActivity },
  ]

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers || users.length, icon: FiUsers, color: 'primary' },
    { label: 'Total Deposits', value: `$${(stats.totalDeposits || 0).toFixed(2)}`, icon: FiTrendingUp, color: 'emerald' },
    { label: 'Total Withdrawals', value: `$${(stats.totalWithdrawals || 0).toFixed(2)}`, icon: FiDollarSign, color: 'red' },
    { label: 'Open Tickets', value: tickets.filter(t => t.status !== 'closed').length, icon: FiAlertCircle, color: 'secondary' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center">
              <FiSettings className="w-5 h-5 text-white" />
            </div>
            Admin Panel
          </h1>
          <p className="text-gray-400 mt-1">Manage platform operations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card-hover"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-sm">{stat.label}</span>
              <div className={`w-10 h-10 rounded-xl bg-${stat.color}/10 flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-2 border-b border-dark-700 pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-primary text-dark-950'
                : 'text-gray-400 hover:text-white hover:bg-dark-800'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'users' && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="text-left py-4 px-4 text-gray-400 font-medium">User</th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium">Email</th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium">Role</th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium">Verified</th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium">Joined</th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-dark-800">
                    <td colSpan={6} className="py-4 px-4"><div className="h-8 bg-dark-800 rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">No users found</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="border-b border-dark-800 hover:bg-dark-800/30">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold text-sm">
                          {user.name?.charAt(0) || 'U'}
                        </div>
                        <span className="text-white font-medium">{user.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-300">{user.email}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded text-xs capitalize ${
                        user.role === 'admin' ? 'bg-secondary/20 text-secondary' : 'bg-dark-700 text-gray-300'
                      }`}>
                        {user.role || 'user'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {user.isVerified ? (
                        <span className="text-emerald-400">✓ Verified</span>
                      ) : (
                        <button
                          onClick={() => handleVerifyUser(user._id)}
                          className="text-primary hover:underline text-sm"
                        >
                          Verify
                        </button>
                      )}
                    </td>
                    <td className="py-4 px-4 text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <button className="text-gray-400 hover:text-white text-sm">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="text-left py-4 px-4 text-gray-400 font-medium">User</th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium">Type</th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium">Amount</th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium">Method</th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium">Status</th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium">Date</th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-dark-800">
                    <td colSpan={7} className="py-4 px-4"><div className="h-8 bg-dark-800 rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">No transactions found</td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx._id} className="border-b border-dark-800 hover:bg-dark-800/30">
                    <td className="py-4 px-4 text-gray-300">{tx.user?.name || 'Unknown'}</td>
                    <td className="py-4 px-4 capitalize">
                      <span className={`${
                        tx.type === 'deposit' ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-white font-medium">${tx.amount.toFixed(2)}</td>
                    <td className="py-4 px-4 text-gray-300 capitalize">{tx.method || '-'}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded text-xs capitalize ${
                        tx.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                        tx.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-400">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      {tx.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApproveTransaction(tx._id)}
                            className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                          >
                            <FiCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRejectTransaction(tx._id)}
                            className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'tickets' && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="text-left py-4 px-4 text-gray-400 font-medium">Subject</th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium">User</th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium">Category</th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium">Priority</th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium">Status</th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-dark-800">
                    <td colSpan={6} className="py-4 px-4"><div className="h-8 bg-dark-800 rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">No tickets found</td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket._id} className="border-b border-dark-800 hover:bg-dark-800/30">
                    <td className="py-4 px-4 text-white font-medium">{ticket.subject}</td>
                    <td className="py-4 px-4 text-gray-300">{ticket.user?.name || 'Unknown'}</td>
                    <td className="py-4 px-4 text-gray-300 capitalize">{ticket.category}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded text-xs capitalize ${
                        ticket.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                        ticket.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-dark-700 text-gray-300'
                      }`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded text-xs capitalize ${
                        ticket.status === 'open' ? 'bg-yellow-500/20 text-yellow-400' :
                        ticket.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-400">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
