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
import { TrendingDown, ScanBarcode, X } from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function OutflowScreen() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [productName, setProductName] = useState('');
  const [currentStock, setCurrentStock] = useState(0);
  const [quantity, setQuantity] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const getProductQuery = trpc.products.getByCode.useQuery({ code: code.trim() }, { enabled: false });
  const outflowMutation = trpc.inventory.outflow.useMutation();

  const handleCodeSubmit = async () => {
    if (!code.trim()) {
      Alert.alert('خطا', 'لطفا کد کالا را وارد کنید');
      return;
    }

    try {
      const result = await getProductQuery.refetch();
      if (result.data) {
        setProductName(result.data.name);
        setCurrentStock(result.data.currentStock);
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

  const handleOutflowSubmit = async () => {
    if (!productName) {
      Alert.alert('خطا', 'ابتدا کد کالا را وارد کنید');
      return;
    }

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('خطا', 'لطفا تعداد معتبر وارد کنید');
      return;
    }

    try {
      await outflowMutation.mutateAsync({ code, quantity: qty });
      Alert.alert('موفق', 'خروج کالا با موفقیت ثبت شد', [
        {
          text: 'بازگشت',
          onPress: () => router.back(),
        },
        {
          text: 'خروج جدید',
          onPress: () => {
            setCode('');
            setProductName('');
            setCurrentStock(0);
            setQuantity('');
          },
        },
      ]);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'خطایی رخ داد';
      Alert.alert('خطا', message);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'خروج کالا' }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <TrendingDown size={48} color="#FF5722" strokeWidth={2} />
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
                  editable={!outflowMutation.isPending}
                />
                <TouchableOpacity
                  style={styles.scanButton}
                  onPress={openScanner}
                  disabled={outflowMutation.isPending}
                >
                  <ScanBarcode size={20} color="#ffffff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.searchButton}
                  onPress={handleCodeSubmit}
                  disabled={outflowMutation.isPending || !code.trim()}
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
                  <Text style={styles.stockLabel}>موجودی فعلی:</Text>
                  <Text style={styles.stockValue}>{currentStock} عدد</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>تعداد خروجی</Text>
                  <TextInput
                    style={styles.input}
                    value={quantity}
                    onChangeText={setQuantity}
                    placeholder="تعداد"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    editable={!outflowMutation.isPending}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.submitButton, outflowMutation.isPending && styles.buttonDisabled]}
                  onPress={handleOutflowSubmit}
                  disabled={outflowMutation.isPending}
                >
                  {outflowMutation.isPending ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.submitButtonText}>ثبت خروج</Text>
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
    backgroundColor: '#FFEBEE',
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
    marginBottom: 8,
  },
  stockLabel: {
    fontSize: 14,
    color: '#666',
  },
  stockValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#4CAF50',
  },
  submitButton: {
    height: 52,
    backgroundColor: '#FF5722',
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
    borderColor: '#FF5722',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  scannerText: {
    marginTop: 24,
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
  },
});
