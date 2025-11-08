import { useState, useCallback, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { trpc } from '@/lib/trpc';

const SELECTED_WAREHOUSE_KEY = 'selected_warehouse_id';

interface Warehouse {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

interface AuditSession {
  id: string;
  warehouseId: string;
  name: string;
  status: 'active' | 'completed';
  allowOutflow: boolean;
}

interface CountSession {
  id: string;
  auditSessionId: string;
  teamId: string;
  name: string;
  status: 'active' | 'completed';
}

export const [WarehouseProvider, useWarehouse] = createContextHook(() => {
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(null);
  const [selectedAuditSessionId, setSelectedAuditSessionId] = useState<string | null>(null);
  const [selectedCountSessionId, setSelectedCountSessionId] = useState<string | null>(null);

  const warehousesQuery = trpc.warehouses.list.useQuery();
  const activeAuditQuery = trpc.auditSessions.getActive.useQuery(
    { warehouseId: selectedWarehouseId! },
    { enabled: !!selectedWarehouseId }
  );

  const loadSelectedWarehouse = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(SELECTED_WAREHOUSE_KEY);
      if (stored) {
        setSelectedWarehouseId(stored);
        console.log('[Warehouse] Loaded selected warehouse:', stored);
      }
    } catch (error) {
      console.error('[Warehouse] Failed to load selected warehouse:', error);
    }
  }, []);

  useEffect(() => {
    loadSelectedWarehouse();
  }, [loadSelectedWarehouse]);

  const selectWarehouse = useCallback(async (warehouseId: string) => {
    try {
      await AsyncStorage.setItem(SELECTED_WAREHOUSE_KEY, warehouseId);
      setSelectedWarehouseId(warehouseId);
      setSelectedAuditSessionId(null);
      setSelectedCountSessionId(null);
      console.log('[Warehouse] Selected warehouse:', warehouseId);
    } catch (error) {
      console.error('[Warehouse] Failed to select warehouse:', error);
    }
  }, []);

  const selectedWarehouse = useMemo(() => {
    if (!selectedWarehouseId || !warehousesQuery.data) return null;
    return warehousesQuery.data.find((w: Warehouse) => w.id === selectedWarehouseId) ?? null;
  }, [selectedWarehouseId, warehousesQuery.data]);

  const activeAuditSession = useMemo(() => {
    return activeAuditQuery.data ?? null;
  }, [activeAuditQuery.data]);

  return useMemo(() => ({
    warehouses: warehousesQuery.data ?? [],
    isLoadingWarehouses: warehousesQuery.isLoading,
    selectedWarehouseId,
    selectedWarehouse,
    selectWarehouse,
    activeAuditSession,
    selectedAuditSessionId,
    setSelectedAuditSessionId,
    selectedCountSessionId,
    setSelectedCountSessionId,
    refetchWarehouses: warehousesQuery.refetch,
  }), [
    warehousesQuery.data,
    warehousesQuery.isLoading,
    warehousesQuery.refetch,
    selectedWarehouseId,
    selectedWarehouse,
    selectWarehouse,
    activeAuditSession,
    selectedAuditSessionId,
    selectedCountSessionId,
  ]);
});
