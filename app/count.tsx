import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { trpc } from '@/lib/trpc';
import { useWarehouse } from '@/contexts/WarehouseContext';
import { useOfflineSync } from '@/contexts/OfflineSyncContext';
import { Package, ScanBarcode, X } from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function CountScreen() {
  const router = useRouter();
  const { selectedWarehouseId, selectedWarehouse, activeAuditSession, selectedCountSessionId } = useWarehouse();
  const { isOnline, addPendingTransaction } = useOfflineSync();
  const [code, setCode] = useState('');
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const getProductQuery = trpc.products.getByCode.useQuery({ code: code.trim() }, { enabled: false });
  const countMutation = trpc.inventory.count.useMutation();
  const confirmMutation = trpc.inventory.confirmCount.useMutation();

  const handleCodeSubmit = async () => {
    if (!code.trim()) {
      Alert.alert('خطا', 'لطفا کد کالا را وارد کنید');
      return;
    }

    try {
      const result = await getProductQuery.refetch();
      if (result.data) {
        setProductName(result.data.name);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'خطایی رخ داد';
      Alert.alert('خطا', message);
    }
  };

  const handleBarcodeScanned = (data: string) => {
    console.log('[Barcode] Scanned:', data);
    setCode(data);
    setShowScanner(false);
    setTimeout(() => {
      handleCodeSubmit();
    }, 100);
  };

  const openScanner = async () => {
    if (!permission) {
      return;
    }

    if (!permission.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('خطا', 'دسترسی به دوربین رد شد');
        return;
      }
    }

    setShowScanner(true);
  };

  const handleCountSubmit = async () => {
    if (!selectedWarehouseId) {
      Alert.alert('خطا', 'لطفاً ابتدا انبار را انتخاب کنید');
      return;
    }

    if (!productName) {
      Alert.alert('خطا', 'ابتدا کد کالا را وارد کنید');
      return;
    }

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('خطا', 'لطفا تعداد معتبر وارد کنید');
      return;
    }

    setIsLoading(true);
    try {
      const result = await countMutation.mutateAsync({ 
        code, 
        quantity: qty,
        warehouseId: selectedWarehouseId,
        auditSessionId: activeAuditSession?.id,
        countSessionId: selectedCountSessionId || undefined,
      });

      if ('needsConfirmation' in result && result.needsConfirmation && 'message' in result) {
        Alert.alert('توجه', result.message, [
          {
            text: 'انصراف',
            style: 'cancel',
            onPress: () => setIsLoading(false),
          },
          {
            text: 'تایید',
            onPress: async () => {
              try {
                await confirmMutation.mutateAsync({ 
                  code, 
                  quantity: qty,
                  warehouseId: selectedWarehouseId,
                  auditSessionId: activeAuditSession?.id,
                  countSessionId: selectedCountSessionId || undefined,
                });
                Alert.alert('موفق', 'شمارش با موفقیت ثبت شد', [
                  {
                    text: 'بازگشت',
                    onPress: () => router.back(),
                  },
                  {
                    text: 'شمارش جدید',
                    onPress: () => {
                      setCode('');
                      setProductName('');
                      setQuantity('');
                    },
                  },
                ]);
              } catch (error: unknown) {
                const message = error instanceof Error ? error.message : 'خطایی رخ داد';
                Alert.alert('خطا', message);
              } finally {
                setIsLoading(false);
              }
            },
          },
        ]);
      } else {
        Alert.alert('موفق', 'شمارش با موفقیت ثبت شد', [
          {
            text: 'بازگشت',
            onPress: () => router.back(),
          },
          {
            text: 'شمارش جدید',
            onPress: () => {
              setCode('');
              setProductName('');
              setQuantity('');
            },
          },
        ]);
        setIsLoading(false);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'خطایی رخ داد';
      Alert.alert('خطا', message);
      setIsLoading(false);
    }
  };

  if (!selectedWarehouse) {
    return (
      <>
        <Stack.Screen options={{ title: 'شمارش کالا' }} />
        <View style={styles.container}>
          <Text style={styles.errorText}>لطفاً ابتدا انبار را انتخاب کنید</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ 
        title: `شمارش کالا - ${selectedWarehouse.name}`,
      }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Package size={48} color="#4CAF50" strokeWidth={2} />
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>کد کالا</Text>
              <View style={styles.row}>
                <TextInput
                  style={styles.inputFlex}
                  value={code}
                  onChangeText={setCode}
                  placeholder="کد کالا"
                  placeholderTextColor="#999"
                  editable={!isLoading}
                  keyboardType="default"
                />
                <TouchableOpacity
                  style={styles.scanButton}
                  onPress={openScanner}
                  disabled={isLoading}
                >
                  <ScanBarcode size={20} color="#ffffff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.searchButton}
                  onPress={handleCodeSubmit}
                  disabled={isLoading || !code.trim()}
                >
                  <Text style={styles.searchButtonText}>جستجو</Text>
                </TouchableOpacity>
              </View>
            </View>

            {productName ? (
              <>
                <View style={styles.productInfo}>
                  <Text style={styles.productLabel}>نام کالا:</Text>
                  <Text style={styles.productName}>{productName}</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>تعداد شمارش</Text>
                  <TextInput
                    style={styles.input}
                    value={quantity}
                    onChangeText={setQuantity}
                    placeholder="تعداد"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    editable={!isLoading}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.submitButton, isLoading && styles.buttonDisabled]}
                  onPress={handleCountSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.submitButtonText}>ثبت شمارش</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : null}
          </View>
        </View>

        <Modal
          visible={showScanner}
          animationType="slide"
          onRequestClose={() => setShowScanner(false)}
        >
          <View style={styles.scannerContainer}>
            <View style={styles.scannerHeader}>
              <Text style={styles.scannerTitle}>اسکن بارکد</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowScanner(false)}
              >
                <X size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
            <CameraView
              style={styles.camera}
              facing="back"
              barcodeScannerSettings={{
                barcodeTypes: ['qr', 'ean13', 'ean8', 'code128', 'code39'],
              }}
              onBarcodeScanned={(result: { data?: string }) => {
                if (result.data) {
                  handleBarcodeScanned(result.data);
                }
              }}
            >
              <View style={styles.scannerOverlay}>
                <View style={styles.scannerBox} />
                <Text style={styles.scannerText}>بارکد را در چارچوب قرار دهید</Text>
              </View>
            </CameraView>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 32,
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
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  inputFlex: {
    flex: 1,
    height: 52,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    textAlign: 'right',
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
  searchButton: {
    height: 52,
    paddingHorizontal: 24,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  scanButton: {
    height: 52,
    width: 52,
    backgroundColor: '#9C27B0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  scannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  scannerTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
  },
  scannerOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  scannerBox: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  scannerText: {
    marginTop: 24,
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
  },
  productInfo: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  productLabel: {
    fontSize: 14,
    color: '#666',
  },
  productName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1A1A1A',
  },
  submitButton: {
    height: 52,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
