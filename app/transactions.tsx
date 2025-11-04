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
import { Search, TrendingUp, TrendingDown, Package } from 'lucide-react-native';

export default function TransactionsScreen() {
  const [search, setSearch] = useState('');
  const transactionsQuery = trpc.transactions.list.useQuery({});

  const filteredTransactions = transactionsQuery.data?.filter(
    (t) =>
      t.productCode.toLowerCase().includes(search.toLowerCase()) ||
      t.productName.toLowerCase().includes(search.toLowerCase()) ||
      t.username.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'count':
        return '#4CAF50';
      case 'in':
        return '#2196F3';
      case 'out':
        return '#FF5722';
      default:
        return '#999';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'count':
        return Package;
      case 'in':
        return TrendingUp;
      case 'out':
        return TrendingDown;
      default:
        return Package;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'count':
        return 'شمارش';
      case 'in':
        return 'ورود';
      case 'out':
        return 'خروج';
      default:
        return type;
    }
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'تاریخچه تراکنش‌ها' }} />
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="جستجو در تراکنش‌ها"
            placeholderTextColor="#999"
          />
        </View>

        {transactionsQuery.isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        ) : filteredTransactions.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>
              {search ? 'تراکنشی یافت نشد' : 'هنوز تراکنشی ثبت نشده است'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredTransactions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const Icon = getTypeIcon(item.type);
              const color = getTypeColor(item.type);

              return (
                <View style={styles.transactionCard}>
                  <View style={styles.transactionHeader}>
                    <View style={styles.transactionTitleRow}>
                      <View style={[styles.iconBadge, { backgroundColor: `${color}15` }]}>
                        <Icon size={20} color={color} strokeWidth={2} />
                      </View>
                      <View style={styles.transactionInfo}>
                        <Text style={styles.productName}>{item.productName}</Text>
                        <Text style={styles.productCode}>کد: {item.productCode}</Text>
                      </View>
                    </View>
                    <View style={styles.typeContainer}>
                      <Text style={[styles.typeLabel, { color }]}>
                        {getTypeLabel(item.type)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailsRow}>
                    <Text style={styles.detailLabel}>تعداد:</Text>
                    <Text style={styles.detailValue}>{item.quantity} عدد</Text>
                  </View>

                  <View style={styles.detailsRow}>
                    <Text style={styles.detailLabel}>موجودی قبل:</Text>
                    <Text style={styles.detailValue}>{item.previousStock} عدد</Text>
                  </View>

                  <View style={styles.detailsRow}>
                    <Text style={styles.detailLabel}>موجودی جدید:</Text>
                    <Text style={[styles.detailValue, { color: '#4CAF50', fontWeight: '700' as const }]}>
                      {item.newStock} عدد
                    </Text>
                  </View>

                  <View style={styles.footer}>
                    <Text style={styles.username}>{item.username}</Text>
                    <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
                  </View>
                </View>
              );
            }}
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
  transactionCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  transactionTitleRow: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
    gap: 4,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1A1A1A',
  },
  productCode: {
    fontSize: 13,
    color: '#666',
  },
  typeContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '500' as const,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  username: {
    fontSize: 13,
    color: '#666',
  },
  date: {
    fontSize: 13,
    color: '#999',
  },
});
