import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Package, Users, LogOut } from 'lucide-react-native';

export default function ModeSelectionScreen() {
  const router = useRouter();
  const { logout, username } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const modes = [
    {
      title: 'شمارش کالا',
      description: 'شمارش، خروج کالا، مدیریت موجودی',
      icon: Package,
      color: '#4CAF50',
      onPress: () => router.push('/home?mode=count'),
    },
    {
      title: 'انبارگردانی',
      description: 'مدیریت جلسات انبارگردانی و شمارش‌های گروهی',
      icon: Users,
      color: '#9C27B0',
      onPress: () => router.push('/home?mode=audit'),
    },
  ];

  return (
    <>
      <Stack.Screen
        options={{
          title: 'انتخاب حالت',
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
          <Text style={styles.subtitle}>لطفاً حالت کاری خود را انتخاب کنید</Text>
        </View>

        <View style={styles.modesContainer}>
          {modes.map((mode, index) => {
            const Icon = mode.icon;
            return (
              <TouchableOpacity
                key={index}
                style={styles.modeCard}
                onPress={mode.onPress}
              >
                <View style={[styles.iconContainer, { backgroundColor: `${mode.color}15` }]}>
                  <Icon size={48} color={mode.color} strokeWidth={2} />
                </View>
                <View style={styles.modeInfo}>
                  <Text style={styles.modeTitle}>{mode.title}</Text>
                  <Text style={styles.modeDescription}>{mode.description}</Text>
                </View>
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
    padding: 32,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
  },
  username: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#1A1A1A',
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  logoutButton: {
    padding: 8,
    marginRight: 8,
  },
  modesContainer: {
    padding: 24,
    gap: 16,
  },
  modeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeInfo: {
    flex: 1,
    gap: 8,
  },
  modeTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1A1A1A',
  },
  modeDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
