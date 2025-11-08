import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useWarehouse } from '@/contexts/WarehouseContext';
import { Warehouse, CheckCircle } from 'lucide-react-native';

export default function SelectWarehouseScreen() {
  const router = useRouter();
  const { warehouses, isLoadingWarehouses, selectedWarehouseId, selectWarehouse } = useWarehouse();

  const handleSelectWarehouse = async (warehouseId: string) => {
    await selectWarehouse(warehouseId);
    router.back();
  };

  if (isLoadingWarehouses) {
    return (
      <>
        <Stack.Screen options={{ title: 'انتخاب انبار' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>در حال بارگذاری...</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'انتخاب انبار' }} />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Warehouse size={32} color="#4CAF50" />
          <Text style={styles.headerTitle}>انتخاب انبار</Text>
          <Text style={styles.headerSubtitle}>لطفاً انبار مورد نظر را انتخاب کنید</Text>
        </View>

        <View style={styles.list}>
          {warehouses.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>هیچ انباری یافت نشد</Text>
              <Text style={styles.emptySubtext}>لطفاً از پنل مدیریت انبار ایجاد کنید</Text>
            </View>
          ) : (
            warehouses.map((warehouse: { id: string; name: string; description?: string; isActive: boolean }) => {
              const isSelected = warehouse.id === selectedWarehouseId;
              const isActive = warehouse.isActive;

              return (
                <TouchableOpacity
                  key={warehouse.id}
                  style={[
                    styles.warehouseCard,
                    isSelected && styles.selectedCard,
                    !isActive && styles.inactiveCard,
                  ]}
                  onPress={() => isActive && handleSelectWarehouse(warehouse.id)}
                  disabled={!isActive}
                >
                  <View style={styles.cardContent}>
                    <View style={styles.cardLeft}>
                      <Text style={[styles.warehouseName, !isActive && styles.inactiveText]}>
                        {warehouse.name}
                      </Text>
                      {warehouse.description && (
                        <Text style={[styles.warehouseDescription, !isActive && styles.inactiveText]}>
                          {warehouse.description}
                        </Text>
                      )}
                      {!isActive && (
                        <Text style={styles.inactiveLabel}>غیرفعال</Text>
                      )}
                    </View>
                    <View style={styles.cardRight}>
                      {isSelected && (
                        <CheckCircle size={24} color="#4CAF50" />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 24,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#1A1A1A',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  list: {
    padding: 16,
    gap: 12,
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#666',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  warehouseCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedCard: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  inactiveCard: {
    opacity: 0.5,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLeft: {
    flex: 1,
    gap: 4,
  },
  cardRight: {
    width: 32,
    alignItems: 'center',
  },
  warehouseName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1A1A1A',
  },
  warehouseDescription: {
    fontSize: 14,
    color: '#666',
  },
  inactiveText: {
    color: '#999',
  },
  inactiveLabel: {
    fontSize: 12,
    color: '#FF5722',
    marginTop: 4,
  },
});
