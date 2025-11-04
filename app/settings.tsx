import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Settings as SettingsIcon, Save, Wifi } from 'lucide-react-native';
import { useSettings } from '@/contexts/SettingsContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { settings, saveSettings } = useSettings();
  
  const [serverUrl, setServerUrl] = useState(settings.serverUrl);
  const [serverPort, setServerPort] = useState(settings.serverPort);
  const [isTesting, setIsTesting] = useState(false);

  const testConnection = useCallback(async () => {
    if (!serverUrl.trim()) {
      Alert.alert('خطا', 'لطفا آدرس سرور را وارد کنید');
      return;
    }

    setIsTesting(true);
    try {
      const port = serverPort === '80' || serverPort === '' ? '' : `:${serverPort}`;
      const testUrl = `http://${serverUrl.trim()}${port}/api`;
      
      console.log('[Settings] Testing connection to:', testUrl);
      
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[Settings] Server response:', data);
        Alert.alert('موفق', 'اتصال به سرور با موفقیت برقرار شد');
      } else {
        throw new Error(`Server returned ${response.status}`);
      }
    } catch (error: unknown) {
      console.error('[Settings] Connection test failed:', error);
      const message = error instanceof Error ? error.message : 'خطای ناشناخته';
      Alert.alert(
        'خطا در اتصال',
        `امکان اتصال به سرور وجود ندارد.\n\nجزئیات: ${message}\n\nلطفا موارد زیر را بررسی کنید:\n• آدرس IP و پورت را بررسی کنید\n• مطمئن شوید سرور در حال اجرا است\n• اتصال اینترنت خود را بررسی کنید`
      );
    } finally {
      setIsTesting(false);
    }
  }, [serverUrl, serverPort]);

  const handleSave = useCallback(async () => {
    if (!serverUrl.trim()) {
      Alert.alert('خطا', 'لطفا آدرس سرور را وارد کنید');
      return;
    }

    try {
      await saveSettings({
        serverUrl: serverUrl.trim(),
        serverPort: serverPort.trim(),
      });
      Alert.alert('موفق', 'تنظیمات با موفقیت ذخیره شد. لطفا اپلیکیشن را مجددا باز کنید.', [
        {
          text: 'باشه',
          onPress: () => router.back(),
        },
      ]);
    } catch {
      Alert.alert('خطا', 'خطا در ذخیره تنظیمات');
    }
  }, [serverUrl, serverPort, saveSettings, router]);

  return (
    <>
      <Stack.Screen options={{ title: 'تنظیمات' }} />
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <SettingsIcon size={48} color="#2196F3" strokeWidth={2} />
          </View>

          <Text style={styles.title}>تنظیمات سرور</Text>
          <Text style={styles.description}>
            برای اتصال به سرور، آدرس IP و پورت را وارد کنید
          </Text>

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
                textAlign="right"
              />
              <Text style={styles.hint}>
                آدرس IP استاتیک سرور خود را وارد کنید
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>پورت سرور</Text>
              <TextInput
                style={styles.input}
                value={serverPort}
                onChangeText={setServerPort}
                placeholder="مثال: 80"
                placeholderTextColor="#999"
                keyboardType="numeric"
                textAlign="right"
              />
              <Text style={styles.hint}>
                پورت پیش‌فرض: 80 (برای HTTP)
              </Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>توجه:</Text>
              <Text style={styles.infoText}>
                • پس از تغییر تنظیمات، اپلیکیشن به سرور جدید متصل می‌شود
              </Text>
              <Text style={styles.infoText}>
                • مطمئن شوید که سرور در حال اجرا است
              </Text>
              <Text style={styles.infoText}>
                • در صورت خطا در اتصال، تنظیمات را بررسی کنید
              </Text>
            </View>

            <View style={styles.currentSettingsBox}>
              <Text style={styles.currentTitle}>آدرس فعلی سرور:</Text>
              <Text style={styles.currentUrl}>
                http://{serverUrl || '---'}
                {serverPort && serverPort !== '80' ? `:${serverPort}` : ''}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.testButton, isTesting && styles.buttonDisabled]}
              onPress={testConnection}
              disabled={isTesting}
            >
              {isTesting ? (
                <ActivityIndicator color="#2196F3" />
              ) : (
                <>
                  <Wifi size={20} color="#2196F3" />
                  <Text style={styles.testButtonText}>تست اتصال</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
            >
              <Save size={20} color="#ffffff" />
              <Text style={styles.saveButtonText}>ذخیره تنظیمات</Text>
            </TouchableOpacity>
          </View>
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
  content: {
    padding: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1A1A1A',
    textAlign: 'right',
  },
  input: {
    height: 52,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  hint: {
    fontSize: 14,
    color: '#999',
    textAlign: 'right',
  },
  infoBox: {
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#E65100',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#EF6C00',
    lineHeight: 22,
    textAlign: 'right',
  },
  currentSettingsBox: {
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  currentTitle: {
    fontSize: 14,
    color: '#2E7D32',
    textAlign: 'right',
  },
  currentUrl: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1B5E20',
    textAlign: 'right',
    fontFamily: 'monospace',
  },
  saveButton: {
    height: 52,
    backgroundColor: '#2196F3',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  testButton: {
    height: 52,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#2196F3',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
