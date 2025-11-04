import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/contexts/AuthContext';
import { Package, Settings } from 'lucide-react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const loginMutation = trpc.auth.login.useMutation();
  const registerMutation = trpc.auth.register.useMutation();

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('خطا', 'لطفا نام کاربری و رمز عبور را وارد کنید');
      return;
    }

    try {
      if (isRegister) {
        const result = await registerMutation.mutateAsync({ username, password });
        await login(result.userId, result.username, result.userId);
        router.replace('/home');
      } else {
        const result = await loginMutation.mutateAsync({ username, password });
        await login(result.userId, result.username, result.token);
        router.replace('/home');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'خطایی رخ داد';
      Alert.alert('خطا', message);
    }
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => router.push('/network-settings')}
      >
        <Settings size={24} color="#007AFF" strokeWidth={2} />
      </TouchableOpacity>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Package size={48} color="#007AFF" strokeWidth={2} />
              </View>
              <Text style={styles.title}>مدیریت انبار</Text>
              <Text style={styles.subtitle}>
                {isRegister ? 'ثبت نام کاربر جدید' : 'ورود به سیستم'}
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>نام کاربری</Text>
                <TextInput
                  style={styles.input}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="نام کاربری خود را وارد کنید"
                  placeholderTextColor="#999"
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>رمز عبور</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="رمز عبور خود را وارد کنید"
                  placeholderTextColor="#999"
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.buttonText}>
                    {isRegister ? 'ثبت نام' : 'ورود'}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setIsRegister(!isRegister)}
                disabled={isLoading}
              >
                <Text style={styles.switchText}>
                  {isRegister
                    ? 'حساب کاربری دارید؟ وارد شوید'
                    : 'حساب کاربری ندارید؟ ثبت نام کنید'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#333',
  },
  input: {
    height: 52,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    textAlign: 'right',
  },
  button: {
    height: 52,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  switchText: {
    fontSize: 14,
    color: '#007AFF',
    textAlign: 'center',
    marginTop: 8,
  },
  settingsButton: {
    position: 'absolute' as const,
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});
