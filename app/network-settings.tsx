import { useState, useEffect } from 'react';
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
  ScrollView,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, Wifi, WifiOff, CheckCircle } from 'lucide-react-native';
import { useSettings } from '@/contexts/SettingsContext';
import { getBaseUrl } from '@/lib/trpc';

export default function NetworkSettingsScreen() {
  const router = useRouter();
  const { settings, saveSettings } = useSettings();
  const [serverUrl, setServerUrl] = useState(settings.serverUrl);
  const [serverPort, setServerPort] = useState(settings.serverPort);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setServerUrl(settings.serverUrl);
    setServerPort(settings.serverPort);
  }, [settings]);

  const testConnection = async () => {
    if (!serverUrl.trim()) {
      Alert.alert('خطا', 'لطفا آدرس سرور را وارد کنید');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const port = serverPort === '80' || serverPort === '' ? '' : `:${serverPort}`;
      const baseUrl = `http://${serverUrl}${port}`;
      
      console.log('[NetworkSettings] Testing connection to:', baseUrl);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${baseUrl}/api/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        setTestResult('success');
        Alert.alert('موفقیت', 'اتصال به سرور با موفقیت برقرار شد');
      } else {
        throw new Error(`خطای سرور: ${response.status}`);
      }
    } catch (error) {
      console.error('[NetworkSettings] Connection test failed:', error);
      setTestResult('error');
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          Alert.alert('خطا', 'زمان اتصال به سرور به پایان رسید. لطفا آدرس و پورت را بررسی کنید.');
        } else if (error.message.includes('Network request failed')) {
          Alert.alert('خطا', 'امکان اتصال به سرور وجود ندارد.\nلطفا موارد زیر را بررسی کنید:\n- آدرس IP و پورت صحیح باشد\n- سرور در حال اجرا باشد\n- فایروال اجازه اتصال را بدهد');
        } else {
          Alert.alert('خطا', `خطا در اتصال: ${error.message}`);
        }
      } else {
        Alert.alert('خطا', 'خطای ناشناخته در اتصال به سرور');
      }
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    if (!serverUrl.trim()) {
      Alert.alert('خطا', 'لطفا آدرس سرور را وارد کنید');
      return;
    }

    setIsSaving(true);
    try {
      await saveSettings({
        serverUrl: serverUrl.trim(),
        serverPort: serverPort.trim(),
      });
      
      await getBaseUrl();
      
      Alert.alert('موفقیت', 'تنظیمات با موفقیت ذخیره شد', [
        {
          text: 'باشه',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('[NetworkSettings] Save failed:', error);
      Alert.alert('خطا', 'خطا در ذخیره تنظیمات');
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefault = () => {
    Alert.alert(
      'بازگردانی به تنظیمات پیش‌فرض',
      'آیا می‌خواهید تنظیمات را به حالت پیش‌فرض بازگردانید؟',
      [
        { text: 'انصراف', style: 'cancel' },
        {
          text: 'بله',
          onPress: () => {
            setServerUrl('185.120.251.246');
            setServerPort('80');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Stack.Screen 
        options={{ 
          title: 'تنظیمات شبکه',
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '600' as const,
          },
        }} 
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Settings size={40} color="#007AFF" strokeWidth={2} />
            </View>
            <Text style={styles.title}>تنظیمات اتصال به سرور</Text>
            <Text style={styles.description}>
              برای اتصال به سرور، آدرس IP و پورت سرور خود را وارد کنید
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>آدرس سرور (IP)</Text>
              <TextInput
                style={styles.input}
                value={serverUrl}
                onChangeText={setServerUrl}
                placeholder="مثال: 185.120.251.246"
                placeholderTextColor="#999"
                keyboardType="numeric"
                editable={!isSaving}
              />
              <Text style={styles.hint}>آدرس IP استاتیک سرور خود را وارد کنید</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>پورت</Text>
              <TextInput
                style={styles.input}
                value={serverPort}
                onChangeText={setServerPort}
                placeholder="مثال: 80 یا 3000"
                placeholderTextColor="#999"
                keyboardType="numeric"
                editable={!isSaving}
              />
              <Text style={styles.hint}>
                پورت پیش‌فرض: 80 (برای پورت 80 می‌توانید خالی بگذارید)
              </Text>
            </View>

            <View style={styles.exampleBox}>
              <Text style={styles.exampleTitle}>مثال تنظیمات شما:</Text>
              <Text style={styles.exampleText}>
                آدرس سرور: {serverUrl || '(خالی)'}
              </Text>
              <Text style={styles.exampleText}>
                پورت: {serverPort || '80 (پیش‌فرض)'}
              </Text>
              <Text style={styles.exampleUrl}>
                URL کامل: http://{serverUrl || 'IP'}
                {serverPort && serverPort !== '80' ? `:${serverPort}` : ''}
              </Text>
            </View>

            {testResult && (
              <View
                style={[
                  styles.testResult,
                  testResult === 'success' ? styles.testSuccess : styles.testError,
                ]}
              >
                {testResult === 'success' ? (
                  <>
                    <CheckCircle size={20} color="#10B981" strokeWidth={2} />
                    <Text style={styles.testSuccessText}>اتصال موفق</Text>
                  </>
                ) : (
                  <>
                    <WifiOff size={20} color="#EF4444" strokeWidth={2} />
                    <Text style={styles.testErrorText}>اتصال ناموفق</Text>
                  </>
                )}
              </View>
            )}

            <TouchableOpacity
              style={[styles.button, styles.testButton, isTesting && styles.buttonDisabled]}
              onPress={testConnection}
              disabled={isTesting || isSaving}
            >
              {isTesting ? (
                <ActivityIndicator color="#007AFF" />
              ) : (
                <>
                  <Wifi size={20} color="#007AFF" strokeWidth={2} />
                  <Text style={styles.testButtonText}>تست اتصال</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.saveButton, isSaving && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={isTesting || isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.saveButtonText}>ذخیره تنظیمات</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resetButton}
              onPress={resetToDefault}
              disabled={isTesting || isSaving}
            >
              <Text style={styles.resetButtonText}>بازگردانی به تنظیمات پیش‌فرض</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>راهنما:</Text>
            <Text style={styles.infoText}>
              • آدرس IP استاتیک سرور خود را وارد کنید
            </Text>
            <Text style={styles.infoText}>
              • اگر سرور شما روی پورت 80 است، پورت را خالی بگذارید
            </Text>
            <Text style={styles.infoText}>
              • برای پورت‌های دیگر (مثل 3000 یا 2223)، پورت را وارد کنید
            </Text>
            <Text style={styles.infoText}>
              • حتما قبل از ذخیره، تست اتصال را انجام دهید
            </Text>
            <Text style={styles.infoText}>
              • مطمئن شوید سرور در حال اجرا است
            </Text>
          </View>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
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
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
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
  hint: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  exampleBox: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  exampleTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#0369A1',
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 13,
    color: '#075985',
    marginBottom: 4,
    textAlign: 'right',
  },
  exampleUrl: {
    fontSize: 13,
    color: '#0369A1',
    fontWeight: '600' as const,
    marginTop: 8,
    textAlign: 'right',
  },
  testResult: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  testSuccess: {
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  testError: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  testSuccessText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#10B981',
  },
  testErrorText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#EF4444',
  },
  button: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  testButton: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#007AFF',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  resetButton: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 14,
    color: '#666',
    textDecorationLine: 'underline',
  },
  infoBox: {
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#FDBA74',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#C2410C',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#9A3412',
    marginBottom: 4,
    textAlign: 'right',
    lineHeight: 18,
  },
});
