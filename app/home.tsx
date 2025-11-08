import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter, Stack, Href, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useWarehouse } from '@/contexts/WarehouseContext';
import { useOfflineSync } from '@/contexts/OfflineSyncContext';
import { Package, LogOut, Upload, FileSpreadsheet, FileText, ClipboardList, TrendingDown, Settings, Warehouse, Wifi, WifiOff, Users, UserCog, ArrowRight } from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const mode = (params.mode as string) || 'count';
  const { logout, username } = useAuth();
  const { selectedWarehouse, activeAuditSession } = useWarehouse();
  const { isOnline, pendingCount } = useOfflineSync();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const handleNavigateToCount = () => {
    if (!selectedWarehouse) {
      Alert.alert('هشدار', 'لطفاً ابتدا انبار را انتخاب کنید', [
        { text: 'انتخاب انبار', onPress: () => router.push('/select-warehouse' as Href) },
        { text: 'انصراف', style: 'cancel' },
      ]);
      return;
    }
    router.push('/count' as Href);
  };

  const countMenuItems = [
    {
      title: 'انتخاب انبار',
      icon: Warehouse,
      color: '#FF9800',
      onPress: () => router.push('/select-warehouse' as Href),
    },
    {
      title: 'شمارش کالا',
      icon: Package,
      color: '#4CAF50',
      onPress: handleNavigateToCount,
    },
    {
      title: 'خروج کالا',
      icon: TrendingDown,
      color: '#FF5722',
      onPress: () => router.push('/outflow' as Href),
    },
    {
      title: 'لیست کالاها',
      icon: ClipboardList,
      color: '#2196F3',
      onPress: () => router.push('/products' as Href),
    },
    {
      title: 'تاریخچه تراکنش‌ها',
      icon: FileText,
      color: '#9C27B0',
      onPress: () => router.push('/transactions' as Href),
    },
    {
      title: 'آپلود اکسل',
      icon: Upload,
      color: '#FF9800',
      onPress: () => router.push('/upload' as Href),
    },
    {
      title: 'خروجی اکسل',
      icon: FileSpreadsheet,
      color: '#00BCD4',
      onPress: () => router.push('/export' as Href),
    },
    {
      title: 'تنظیمات',
      icon: Settings,
      color: '#607D8B',
      onPress: () => router.push('/settings' as Href),
    },
  ];

  const auditMenuItems = [
    {
      title: 'انتخاب انبار',
      icon: Warehouse,
      color: '#FF9800',
      onPress: () => router.push('/select-warehouse' as Href),
    },
    {
      title: 'انبارگردانی',
      icon: Users,
      color: '#9C27B0',
      onPress: () => router.push('/audit' as Href),
    },
    {
      title: 'مدیریت تیم‌ها',
      icon: UserCog,
      color: '#673AB7',
      onPress: () => router.push('/teams' as Href),
    },
    {
      title: 'لیست کالاها',
      icon: ClipboardList,
      color: '#2196F3',
      onPress: () => router.push('/products' as Href),
    },
    {
      title: 'تاریخچه تراکنش‌ها',
      icon: FileText,
      color: '#9C27B0',
      onPress: () => router.push('/transactions' as Href),
    },
    {
      title: 'خروجی اکسل',
      icon: FileSpreadsheet,
      color: '#00BCD4',
      onPress: () => router.push('/export' as Href),
    },
    {
      title: 'تنظیمات',
      icon: Settings,
      color: '#607D8B',
      onPress: () => router.push('/settings' as Href),
    },
  ];

  const menuItems = mode === 'audit' ? auditMenuItems : countMenuItems;

  const connectionIcon = isOnline ? Wifi : WifiOff;
  const ConnectionIcon = connectionIcon;

  return (
    <>
      <Stack.Screen
        options={{
          title: mode === 'audit' ? 'انبارگردانی' : 'شمارش کالا',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.push('/mode-selection' as Href)} style={styles.backButton}>
              <ArrowRight size={22} color="#007AFF" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <LogOut size={22} color="#FF5722" />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.welcomeText}>خوش آمدید</Text>
              <Text style={styles.username}>{username}</Text>
            </View>
            <View style={styles.statusContainer}>
              <ConnectionIcon 
                size={20} 
                color={isOnline ? '#4CAF50' : '#FF5722'} 
              />
              {pendingCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{pendingCount}</Text>
                </View>
              )}
            </View>
          </View>
          {selectedWarehouse && (
            <View style={styles.warehouseInfo}>
              <Warehouse size={16} color="#666" />
              <Text style={styles.warehouseText}>{selectedWarehouse.name}</Text>
            </View>
          )}
          {activeAuditSession && (
            <View style={styles.auditInfo}>
              <Users size={16} color="#9C27B0" />
              <Text style={styles.auditText}>انبارگردانی: {activeAuditSession.name}</Text>
            </View>
          )}
        </View>

        <View style={styles.grid}>
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={index}
                style={styles.card}
                onPress={item.onPress}
              >
                <View style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}>
                  <Icon size={32} color={item.color} strokeWidth={2} />
                </View>
                <Text style={styles.cardTitle}>{item.title}</Text>
              </TouchableOpacity>
            );
          })}
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
  header: {
    padding: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    gap: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: '#FF5722',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700' as const,
  },
  warehouseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  warehouseText: {
    fontSize: 14,
    color: '#666',
  },
  auditInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F3E5F5',
    padding: 8,
    borderRadius: 8,
  },
  auditText: {
    fontSize: 14,
    color: '#9C27B0',
    fontWeight: '600' as const,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  username: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#1A1A1A',
  },
  logoutButton: {
    padding: 8,
    marginRight: 8,
  },
  backButton: {
    padding: 8,
    marginLeft: 8,
  },
  grid: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  card: {
    width: '47%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#333',
    textAlign: 'center',
  },
});
