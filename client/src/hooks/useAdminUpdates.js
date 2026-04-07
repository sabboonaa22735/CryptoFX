import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '../contexts/SocketContext';
import { api } from '../store/authStore';

const ADMIN_UPDATE_QUERY_KEYS = {
  user_updated: ['user-data', 'wallet-stats', 'portfolio'],
  user_deleted: ['user-data', 'users-list'],
  user_created: ['users-list'],
  all_balances_reset: ['user-data', 'wallet-stats', 'dashboard-stats', 'portfolio', 'transactions'],
  wallet_updated: ['wallet-stats', 'user-data', 'portfolio'],
  wallet_stats_updated: ['wallet-stats', 'user-data'],
  global_wallet_stats_updated: ['wallet-stats', 'dashboard-stats'],
  deposit_approved: ['deposits', 'transactions', 'wallet-stats', 'dashboard-stats'],
  deposit_rejected: ['deposits', 'transactions', 'dashboard-stats'],
  deposit_settings_updated: ['deposit-settings', 'deposit-addresses'],
  deposit_coin_settings_updated: ['deposit-settings', 'deposit-addresses'],
  deposit_settings_reset: ['deposit-settings', 'deposit-addresses'],
  transaction_updated: ['transactions', 'wallet-stats', 'dashboard-stats'],
  transaction_approved: ['transactions', 'wallet-stats', 'dashboard-stats'],
  transaction_rejected: ['transactions', 'dashboard-stats'],
  trade_updated: ['trades', 'dashboard-stats'],
  trade_created: ['trades', 'dashboard-stats', 'wallet-stats'],
  trade_deleted: ['trades', 'dashboard-stats'],
  trade_settings_updated: ['trade-settings'],
  trade_durations_updated: ['trade-settings'],
  portfolio_stats_updated: ['portfolio', 'dashboard-stats'],
};

const ADMIN_UPDATE_FETCH_PATHS = {
  user_updated: (data) => [`/users/${data.userId}`],
  user_deleted: () => ['/users'],
  user_created: () => ['/users'],
  all_balances_reset: () => ['/users', '/wallet/balance', '/portfolio'],
  wallet_updated: (data) => [`/wallet/balance`, `/users/${data.userId}`],
  wallet_stats_updated: (data) => [`/wallet/stats?userId=${data.userId}`, `/users/${data.userId}`],
  global_wallet_stats_updated: () => ['/wallet/stats'],
  deposit_approved: (data) => ['/superadmin/deposits', '/wallet/balance'],
  deposit_rejected: () => ['/superadmin/deposits'],
  deposit_settings_updated: () => ['/deposits/settings'],
  deposit_coin_settings_updated: () => ['/deposits/settings'],
  deposit_settings_reset: () => ['/deposits/settings'],
  transaction_updated: (data) => ['/wallet/transactions', `/transactions/${data.transactionId}`],
  transaction_approved: (data) => ['/wallet/transactions', `/users/${data.userId}`],
  transaction_rejected: () => ['/wallet/transactions'],
  trade_updated: (data) => [`/trades/${data.tradeId}`],
  trade_created: (data) => ['/trades', '/wallet/balance', `/users/${data.userId}`],
  trade_deleted: () => ['/trades'],
  trade_settings_updated: () => ['/trade/settings'],
  trade_durations_updated: () => ['/trade/settings'],
  portfolio_stats_updated: (data) => [`/portfolio${data.userId ? `?userId=${data.userId}` : ''}`],
};

export const useAdminUpdates = (options = {}) => {
  const { 
    enabled = true, 
    onUpdate, 
    subscribeToAll = true,
    specificEvents = []
  } = options;
  
  const queryClient = useQueryClient();
  const debounceTimerRef = useRef(null);
  const pendingUpdateRef = useRef(null);

  const invalidateAndRefetch = useCallback(async (eventType, data) => {
    pendingUpdateRef.current = { eventType, data };
    
    if (debounceTimerRef.current) {
      return;
    }
    
    debounceTimerRef.current = setTimeout(() => {
      const update = pendingUpdateRef.current;
      if (!update) {
        debounceTimerRef.current = null;
        return;
      }
      
      const { eventType: type, data: updateData } = update;
      pendingUpdateRef.current = null;
      debounceTimerRef.current = null;
      
      const keysToInvalidate = ADMIN_UPDATE_QUERY_KEYS[type] || [];
      
      keysToInvalidate.forEach(key => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });

      const fetchPaths = ADMIN_UPDATE_FETCH_PATHS[type];
      if (fetchPaths) {
        const paths = fetchPaths(updateData) || [];
        Promise.all(
          paths.map(async (path) => {
            try {
              const response = await api.get(path);
              return response.data;
            } catch (error) {
              return null;
            }
          })
        ).catch(() => {});
      }

      queryClient.invalidateQueries();

      if (onUpdate) {
        onUpdate(type, updateData);
      }
    }, 500);
  }, [queryClient, onUpdate]);

  const { subscribe, unsubscribe, on, isConnected } = useSocket();

  useEffect(() => {
    if (!enabled) return;

    subscribe(['admin-updates']);

    const handleAdminUpdate = (update) => {
      const { type, data, timestamp } = update;
      
      if (specificEvents.length > 0 && !specificEvents.includes(type)) {
        return;
      }

      console.log('[AdminUpdates] Received update:', type, data);
      invalidateAndRefetch(type, data);
    };

    const unsubHandler = on('admin-update', handleAdminUpdate);

    return () => {
      unsubscribe(['admin-updates']);
      unsubHandler();
    };
  }, [enabled, subscribeToAll, specificEvents, invalidateAndRefetch, subscribe, unsubscribe, on]);

  const refetchAll = useCallback(() => {
    queryClient.invalidateQueries();
  }, [queryClient]);

  const refetchSpecific = useCallback((queryKey) => {
    queryClient.invalidateQueries({ queryKey: [queryKey] });
  }, [queryClient]);

  return {
    refetchAll,
    refetchSpecific,
    isConnected,
  };
};

export const invalidateAllCaches = (queryClient) => {
  queryClient.invalidateQueries();
};

export default useAdminUpdates;
