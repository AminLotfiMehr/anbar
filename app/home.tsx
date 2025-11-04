import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter, Stack, Href } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Package, LogOut, Upload, FileSpreadsheet, FileText, ClipboardList, TrendingDown, Settings } from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { logout, username } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const menuItems = [
    {
      title: 'شمارش کالا',
      icon: Package,
      color: '#4CAF50',
      onPress: () => router.push('/count' as Href),
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

  return (
    <>
      <Stack.Screen
        options={{
          title: 'صفحه اصلی',
          headerRight: () => (
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <LogOut size={22} color="#FF5722" />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>خوش آمدید</Text>
          <Text style={styles.username}>{username}</Text>
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
