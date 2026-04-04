import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useTransactionStore = create(
  persist(
    (set, get) => ({
      transactions: [],

      addTransaction: (transaction) => {
        const newTransaction = {
          ...transaction,
          _id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          status: transaction.status || 'pending',
          createdAt: new Date().toISOString(),
        }
        set((state) => ({
          transactions: [newTransaction, ...state.transactions]
        }))
        return newTransaction
      },

      updateTransactionStatus: (transactionId, newStatus) => {
        set((state) => ({
          transactions: state.transactions.map((tx) =>
            tx._id === transactionId ? { ...tx, status: newStatus } : tx
          )
        }))
      },

      removeTransaction: (transactionId) => {
        set((state) => ({
          transactions: state.transactions.filter((tx) => tx._id !== transactionId)
        }))
      },

      getTransaction: (transactionId) => {
        return get().transactions.find((tx) => tx._id === transactionId)
      },

      getPendingTransactions: () => {
        return get().transactions.filter((tx) => tx.status === 'pending')
      },

      getCompletedTransactions: () => {
        return get().transactions.filter((tx) => tx.status === 'completed')
      },

      clearAllTransactions: () => {
        set({ transactions: [] })
      },
    }),
    {
      name: 'transaction-storage',
      partialize: (state) => ({ transactions: state.transactions })
    }
  )
)
