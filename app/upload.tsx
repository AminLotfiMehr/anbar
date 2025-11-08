import { useState } from 'react';
import * as XLSX from 'xlsx';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { trpc } from '@/lib/trpc';
import { useWarehouse } from '@/contexts/WarehouseContext';
import * as DocumentPicker from 'expo-document-picker';
import { Upload } from 'lucide-react-native';

export default function UploadScreen() {
  const router = useRouter();
  const { selectedWarehouseId, selectedWarehouse } = useWarehouse();
  const [fileName, setFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const uploadMutation = trpc.products.uploadExcel.useMutation();

  const handleFilePick = async () => {
    if (!selectedWarehouseId) {
      Alert.alert('خطا', 'لطفاً ابتدا انبار را انتخاب کنید', [
        { text: 'باشه', onPress: () => router.push('/select-warehouse') },
      ]);
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/csv',
        ],
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const file = result.assets[0];
      setFileName(file.name);

      setIsProcessing(true);

      try {
        const response = await fetch(file.uri);
        const arrayBuffer = await response.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellText: false, cellDates: true });
        
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1, raw: false, defval: '' }) as string[][];
        
        console.log('[Upload] Total rows:', jsonData.length);
        
        const products = jsonData.slice(1).map((row, index) => {
          const rowNumber = row[0];
          const code = row[1]?.toString().trim() || '';
          const name = row[2]?.toString().trim() || '';
          
          console.log(`[Upload] Row ${index + 1}:`, { rowNumber, code, name });
          
          return { code, name };
        }).filter(p => p.code && p.name);

        console.log('[Upload] Valid products:', products.length);

        if (products.length === 0) {
          throw new Error('فایل خالی است یا فرمت آن صحیح نمی‌باشد');
        }

        await uploadMutation.mutateAsync({ 
          warehouseId: selectedWarehouseId,
          products 
        });

        Alert.alert('موفق', `${products.length} کالا با موفقیت آپلود شد`, [
          {
            text: 'بازگشت',
            onPress: () => router.back(),
          },
        ]);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'خطایی رخ داد';
        console.error('[Upload] Error:', error);
        Alert.alert('خطا', message);
      } finally {
        setIsProcessing(false);
      }

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'خطایی رخ داد';
      Alert.alert('خطا', message);
      setIsProcessing(false);
    }
  };

  if (!selectedWarehouse) {
    return (
      <>
        <Stack.Screen options={{ title: 'آپلود فایل اکسل' }} />
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.errorText}>لطفاً ابتدا انبار را انتخاب کنید</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push('/select-warehouse')}
            >
              <Text style={styles.buttonText}>انتخاب انبار</Text>
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: `آپلود فایل اکسل - ${selectedWarehouse.name}` }} />
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Upload size={48} color="#FF9800" strokeWidth={2} />
          </View>

          <Text style={styles.title}>آپلود لیست کالاها</Text>
          <Text style={styles.warehouseInfo}>انبار: {selectedWarehouse.name}</Text>
          <Text style={styles.description}>
            فایل Excel (xls, xlsx) خود را انتخاب کنید. فایل باید شامل ستون‌های: ردیف، کد کالا، نام کالا باشد.
          </Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>فرمت فایل:</Text>
            <Text style={styles.infoText}>• ردیف (A): شماره ردیف</Text>
            <Text style={styles.infoText}>• کد کالا (B): کد یکتای کالا</Text>
            <Text style={styles.infoText}>• نام کالا (C): نام کالا</Text>
          </View>

          {fileName ? (
            <View style={styles.fileInfo}>
              <Text style={styles.fileLabel}>فایل انتخاب شده:</Text>
              <Text style={styles.fileName}>{fileName}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.button, isProcessing && styles.buttonDisabled]}
            onPress={handleFilePick}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>انتخاب فایل</Text>
            )}
          </TouchableOpacity>
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
    backgroundColor: '#FFF3E0',
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
    marginBottom: 24,
    lineHeight: 24,
  },
  infoBox: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1A1A1A',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  fileInfo: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 24,
  },
  fileLabel: {
    fontSize: 14,
    color: '#1976D2',
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#0D47A1',
  },
  button: {
    height: 52,
    backgroundColor: '#FF9800',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  warehouseInfo: {
    fontSize: 16,
    color: '#FF9800',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '600' as const,
  },
});
