import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { trpc } from '@/lib/trpc';
import { FileSpreadsheet, Download } from 'lucide-react-native';

export default function ExportScreen() {
  const productsQuery = trpc.products.list.useQuery();

  const handleExportCSV = () => {
    if (!productsQuery.data || productsQuery.data.length === 0) {
      Alert.alert('خطا', 'هیچ کالایی برای خروجی وجود ندارد');
      return;
    }

    const csvHeader = 'ردیف,کد کالا,نام کالا,موجودی\n';
    const csvRows = productsQuery.data
      .map((product, index) => 
        `${index + 1},${product.code},${product.name},${product.currentStock}`
      )
      .join('\n');
    
    const csvContent = csvHeader + csvRows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `products_${new Date().getTime()}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    Alert.alert('موفق', 'فایل CSV با موفقیت دانلود شد');
  };

  const handleExportExcel = () => {
    Alert.alert('در حال توسعه', 'این قابلیت به زودی اضافه خواهد شد');
  };

  return (
    <>
      <Stack.Screen options={{ title: 'خروجی فایل' }} />
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <FileSpreadsheet size={48} color="#00BCD4" strokeWidth={2} />
          </View>

          <Text style={styles.title}>دریافت خروجی</Text>
          <Text style={styles.description}>
            لیست کالاها و موجودی آن‌ها را به صورت فایل دریافت کنید
          </Text>

          <View style={styles.statsCard}>
            <Text style={styles.statsLabel}>تعداد کل کالاها:</Text>
            <Text style={styles.statsValue}>
              {productsQuery.data?.length || 0} کالا
            </Text>
          </View>

          <TouchableOpacity
            style={styles.exportButton}
            onPress={handleExportCSV}
            disabled={productsQuery.isLoading}
          >
            <Download size={20} color="#ffffff" />
            <Text style={styles.exportButtonText}>دانلود فایل CSV</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.exportButton, styles.excelButton]}
            onPress={handleExportExcel}
            disabled={productsQuery.isLoading}
          >
            <Download size={20} color="#ffffff" />
            <Text style={styles.exportButtonText}>دانلود فایل Excel</Text>
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
    backgroundColor: '#E0F7FA',
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
  statsCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  statsLabel: {
    fontSize: 14,
    color: '#666',
  },
  statsValue: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#00BCD4',
  },
  exportButton: {
    flexDirection: 'row',
    height: 52,
    backgroundColor: '#00BCD4',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  excelButton: {
    backgroundColor: '#4CAF50',
  },
  exportButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
});
