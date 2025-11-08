import { useState, useCallback, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import NetInfo from '@react-native-community/netinfo';
import { Transaction } from '@/backend/types/database';

const PENDING_TRANSACTIONS_KEY = 'pending_transactions';

interface PendingTransaction {
  id: string;
  transaction: Transaction;
  createdAt: string;
}

export const [OfflineSyncProvider, useOfflineSync] = createContextHook(() => {
  const [pendingTransactions, setPendingTransactions] = useState<PendingTransaction[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const loadPendingTransactions = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(PENDING_TRANSACTIONS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPendingTransactions(parsed);
        console.log('[OfflineSync] Loaded pending transactions:', parsed.length);
      }
    } catch (error) {
      console.error('[OfflineSync] Failed to load pending transactions:', error);
    }
  }, []);

  const savePendingTransactions = useCallback(async (transactions: PendingTransaction[]) => {
    try {
      await AsyncStorage.setItem(PENDING_TRANSACTIONS_KEY, JSON.stringify(transactions));
      console.log('[OfflineSync] Saved pending transactions:', transactions.length);
    } catch (error) {
      console.error('[OfflineSync] Failed to save pending transactions:', error);
    }
  }, []);

  useEffect(() => {
    loadPendingTransactions();

    const unsubscribe = NetInfo.addEventListener((state: { isConnected: boolean | null }) => {
      console.log('[OfflineSync] Connection status:', state.isConnected);
      setIsOnline(state.isConnected ?? false);
    });

    return () => {
      unsubscribe();
    };
  }, [loadPendingTransactions]);

  const addPendingTransaction = useCallback(async (transaction: Transaction) => {
    const pending: PendingTransaction = {
      id: Math.random().toString(36).substr(2, 9),
      transaction,
      createdAt: new Date().toISOString(),
    };

    const updated = [...pendingTransactions, pending];
    setPendingTransactions(updated);
    await savePendingTransactions(updated);
    console.log('[OfflineSync] Added pending transaction:', pending.id);
  }, [pendingTransactions, savePendingTransactions]);

  const removePendingTransaction = useCallback(async (id: string) => {
    const updated = pendingTransactions.filter(p => p.id !== id);
    setPendingTransactions(updated);
    await savePendingTransactions(updated);
    console.log('[OfflineSync] Removed pending transaction:', id);
  }, [pendingTransactions, savePendingTransactions]);

  const syncPendingTransactions = useCallback(async (
    syncFn: (transaction: Transaction) => Promise<void>
  ) => {
    if (pendingTransactions.length === 0) {
      console.log('[OfflineSync] No pending transactions to sync');
      return { success: true, synced: 0, failed: 0 };
    }

    setIsSyncing(true);
    let synced = 0;
    let failed = 0;

    console.log('[OfflineSync] Starting sync of', pendingTransactions.length, 'transactions');

    for (const pending of pendingTransactions) {
      try {
        await syncFn(pending.transaction);
        await removePendingTransaction(pending.id);
        synced++;
      } catch (error) {
        console.error('[OfflineSync] Failed to sync transaction:', pending.id, error);
        failed++;
      }
    }

    setIsSyncing(false);
    console.log('[OfflineSync] Sync completed. Synced:', synced, 'Failed:', failed);

    return { success: failed === 0, synced, failed };
  }, [pendingTransactions, removePendingTransaction]);

  const clearPendingTransactions = useCallback(async () => {
    setPendingTransactions([]);
    await AsyncStorage.removeItem(PENDING_TRANSACTIONS_KEY);
    console.log('[OfflineSync] Cleared all pending transactions');
  }, []);

  return useMemo(() => ({
    pendingTransactions,
    pendingCount: pendingTransactions.length,
    isOnline,
    isSyncing,
    addPendingTransaction,
    removePendingTransaction,
    syncPendingTransactions,
    clearPendingTransactions,
  }), [
    pendingTransactions,
    isOnline,
    isSyncing,
    addPendingTransaction,
    removePendingTransaction,
    syncPendingTransactions,
    clearPendingTransactions,
  ]);
});
