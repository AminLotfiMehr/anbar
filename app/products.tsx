import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Stack } from 'expo-router';
import { trpc } from '@/lib/trpc';
import { Search } from 'lucide-react-native';

export default function ProductsScreen() {
  const [search, setSearch] = useState('');
  const productsQuery = trpc.products.list.useQuery();

  const filteredProducts = productsQuery.data?.filter(
    (p) =>
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <>
      <Stack.Screen options={{ title: 'لیست کالاها' }} />
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="جستجو بر اساس کد یا نام کالا"
            placeholderTextColor="#999"
          />
        </View>

        {productsQuery.isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        ) : filteredProducts.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>
              {search ? 'کالایی یافت نشد' : 'هنوز کالایی ثبت نشده است'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.productCard}>
                <View style={styles.productHeader}>
                  <Text style={styles.productCode}>کد: {item.code}</Text>
                  <Text style={styles.productStock}>{item.currentStock} عدد</Text>
                </View>
                <Text style={styles.productName}>{item.name}</Text>
              </View>
            )}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    textAlign: 'right',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  productCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productCode: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500' as const,
  },
  productStock: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#4CAF50',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1A1A1A',
  },
});
