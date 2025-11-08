# مراحل بعدی پروژه

## ✅ آنچه تکمیل شده است

### Backend
- ✅ سیستم چند انباره کامل
- ✅ API های انبارگردانی و شمارش گروهی
- ✅ مدیریت تیم‌ها
- ✅ API های ادمین (کاربران، گزارشات)
- ✅ پشتیبانی warehouse در تمام عملیات

### Mobile App
- ✅ انتخاب انبار
- ✅ شمارش کالا با warehouse
- ✅ خروج کالا با کنترل مجوز انبارگردانی
- ✅ مدیریت جلسات انبارگردانی
- ✅ مدیریت تیم‌ها
- ✅ نمایش وضعیت آنلاین/آفلاین

### Infrastructure  
- ✅ Context ها برای Warehouse و Offline Sync
- ✅ TypeScript types کامل
- ✅ tRPC برای type-safety

## 🔨 کارهای باقیمانده

### 1. پنل ادمین وب (اولویت بالا)

#### چرا نیاز است؟
- مدیریت کاربران از طریق وب راحت‌تر است
- نمایش گزارشات تفصیلی
- مدیریت انبارها و جلسات
- خروجی اکسل

#### چگونه پیاده‌سازی شود؟

**گام 1**: ایجاد ساختار
```bash
mkdir -p app/admin
```

**گام 2**: ایجاد layout با authentication:
```typescript
// app/admin/_layout.tsx
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function AdminLayout() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.replace('/login');
    }
  }, [isAuthenticated, user]);

  return <Stack />;
}
```

**گام 3**: صفحات پنل:

`app/admin/index.tsx` - داشبورد:
```typescript
import { trpc } from '@/lib/trpc';

export default function AdminDashboard() {
  const usersQuery = trpc.admin.listUsers.useQuery();
  const warehousesQuery = trpc.warehouses.list.useQuery();
  
  return (
    <View>
      <Text>کل کاربران: {usersQuery.data?.length}</Text>
      <Text>کل انبارها: {warehousesQuery.data?.length}</Text>
      {/* آمار بیشتر */}
    </View>
  );
}
```

`app/admin/users.tsx` - مدیریت کاربران:
```typescript
export default function UsersPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const usersQuery = trpc.admin.listUsers.useQuery();
  const createMutation = trpc.admin.createUser.useMutation();
  
  const handleCreate = async () => {
    await createMutation.mutateAsync({
      username,
      password,
      role: 'user',
    });
    usersQuery.refetch();
  };
  
  return (
    <View>
      {/* فرم ایجاد کاربر */}
      {/* لیست کاربران */}
    </View>
  );
}
```

### 2. بهبود Upload Excel

**مشکل فعلی**: محصولات بدون warehouseId آپلود می‌شوند.

**راه حل**:

```typescript
// app/upload.tsx - تغییرات مورد نیاز:

// اضافه کردن انتخاب انبار
const { selectedWarehouseId } = useWarehouse();

// در handleUpload:
const uploadMutation = trpc.products.uploadExcel.useMutation();
await uploadMutation.mutateAsync({
  warehouseId: selectedWarehouseId,
  products: parsedProducts,
});
```

```typescript
// backend/trpc/routes/products/upload-excel.ts - تغییرات:

export const uploadExcelProcedure = protectedProcedure
  .input(
    z.object({
      warehouseId: z.string(), // اضافه شود
      products: z.array(
        z.object({
          code: z.string(),
          name: z.string(),
        })
      ),
    })
  )
  .mutation(async ({ input }) => {
    // حذف محصولات قبلی این انبار
    await db.products.clear(input.warehouseId);
    
    const products = input.products.map(product => ({
      id: generateId(),
      code: product.code,
      name: product.name,
      warehouseId: input.warehouseId, // اضافه
      currentStock: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    
    await db.products.bulkCreate(products);
    return { count: products.length };
  });
```

### 3. صفحه همگام‌سازی (Sync)

**نیاز**: صفحه‌ای برای مشاهده و همگام‌سازی تراکنش‌های آفلاین

```typescript
// app/sync.tsx
import { useOfflineSync } from '@/contexts/OfflineSyncContext';
import { trpc } from '@/lib/trpc';

export default function SyncScreen() {
  const { 
    pendingTransactions, 
    syncPendingTransactions,
    isSyncing,
    isOnline 
  } = useOfflineSync();
  
  const countMutation = trpc.inventory.count.useMutation();
  
  const handleSync = async () => {
    await syncPendingTransactions(async (transaction) => {
      // ارسال تراکنش به سرور
      await countMutation.mutateAsync({
        code: transaction.productCode,
        quantity: transaction.quantity,
        warehouseId: transaction.warehouseId,
        auditSessionId: transaction.auditSessionId,
        countSessionId: transaction.countSessionId,
      });
    });
    
    Alert.alert('موفق', 'همگام‌سازی انجام شد');
  };
  
  return (
    <View>
      <Text>تراکنش‌های در انتظار: {pendingTransactions.length}</Text>
      <Text>وضعیت: {isOnline ? 'آنلاین' : 'آفلاین'}</Text>
      
      <FlatList
        data={pendingTransactions}
        renderItem={({ item }) => (
          <View>
            <Text>{item.transaction.productName}</Text>
            <Text>{item.transaction.quantity} عدد</Text>
          </View>
        )}
      />
      
      <TouchableOpacity 
        onPress={handleSync}
        disabled={!isOnline || isSyncing}
      >
        <Text>همگام‌سازی</Text>
      </TouchableOpacity>
    </View>
  );
}
```

سپس اضافه کردن به منو:
```typescript
// app/home.tsx
{
  title: 'همگام‌سازی',
  icon: RefreshCw,
  color: '#009688',
  onPress: () => router.push('/sync'),
},
```

### 4. فیلترهای پیشرفته در گزارشات

**فایل**: `app/transactions.tsx`

```typescript
export default function TransactionsScreen() {
  const { selectedWarehouseId } = useWarehouse();
  const [filterType, setFilterType] = useState<'all' | 'count' | 'out'>('all');
  const [filterDate, setFilterDate] = useState<Date | null>(null);
  
  const transactionsQuery = trpc.transactions.list.useQuery({
    warehouseId: selectedWarehouseId,
  });
  
  const filteredTransactions = useMemo(() => {
    let filtered = transactionsQuery.data || [];
    
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }
    
    if (filterDate) {
      filtered = filtered.filter(t => 
        isSameDay(new Date(t.createdAt), filterDate)
      );
    }
    
    return filtered;
  }, [transactionsQuery.data, filterType, filterDate]);
  
  return (
    <View>
      {/* Filter UI */}
      <View style={styles.filters}>
        <Picker
          selectedValue={filterType}
          onValueChange={setFilterType}
        >
          <Picker.Item label="همه" value="all" />
          <Picker.Item label="شمارش" value="count" />
          <Picker.Item label="خروج" value="out" />
        </Picker>
      </View>
      
      {/* Transactions List */}
      <FlatList data={filteredTransactions} ... />
    </View>
  );
}
```

### 5. خروجی Excel با تفکیک

**فایل**: `app/export.tsx`

```typescript
import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function ExportScreen() {
  const { selectedWarehouseId, selectedWarehouse } = useWarehouse();
  const reportsQuery = trpc.admin.getReports.useQuery({
    warehouseId: selectedWarehouseId,
  });
  
  const handleExport = async () => {
    const data = reportsQuery.data;
    
    // ایجاد Workbook
    const wb = XLSX.utils.book_new();
    
    // شیت خلاصه
    const summaryData = [
      ['گزارش انبار', selectedWarehouse?.name],
      ['تاریخ', new Date().toLocaleDateString('fa-IR')],
      ['کل محصولات', data?.summary.totalProducts],
      ['محصولات شمارش شده', data?.summary.countedProducts],
      ['موجودی کل', data?.summary.totalStock],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summarySheet, 'خلاصه');
    
    // شیت تراکنش‌ها
    const transactionsData = data?.transactions.map(t => ({
      'کد کالا': t.productCode,
      'نام کالا': t.productName,
      'نوع': t.type === 'count' ? 'شمارش' : 'خروج',
      'تعداد': t.quantity,
      'موجودی قبل': t.previousStock,
      'موجودی جدید': t.newStock,
      'کاربر': t.username,
      'تاریخ': new Date(t.createdAt).toLocaleDateString('fa-IR'),
    }));
    const transSheet = XLSX.utils.json_to_sheet(transactionsData || []);
    XLSX.utils.book_append_sheet(wb, transSheet, 'تراکنش‌ها');
    
    // ذخیره فایل
    const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
    const uri = FileSystem.documentDirectory + 'report.xlsx';
    await FileSystem.writeAsStringAsync(uri, wbout, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    // اشتراک‌گذاری
    await Sharing.shareAsync(uri);
  };
  
  return (
    <View>
      <TouchableOpacity onPress={handleExport}>
        <Text>خروجی Excel</Text>
      </TouchableOpacity>
    </View>
  );
}
```

نصب کتابخانه‌های مورد نیاز:
```bash
bun add xlsx expo-file-system expo-sharing
```

### 6. گزارش مقایسه شمارش‌ها

برای مقایسه شمارش‌های مختلف یک تیم در انبارگردانی:

```typescript
// app/audit/[id]/compare.tsx
export default function CompareCountsScreen() {
  const { id } = useLocalSearchParams();
  const countSessionsQuery = trpc.countSessions.list.useQuery({
    auditSessionId: id as string,
  });
  
  // گروه‌بندی تراکنش‌ها بر اساس countSessionId
  const transactionsBySession = useMemo(() => {
    // logic for grouping
  }, [countSessionsQuery.data]);
  
  return (
    <View>
      {/* نمایش مقایسه شمارش‌ها */}
      {/* نمایش اختلافات */}
    </View>
  );
}
```

## 🎯 اولویت‌بندی

### فوری (این هفته):
1. ✅ ~~بهبود Upload Excel~~ - تکمیل شد
2. صفحه همگام‌سازی
3. تست کامل offline mode

### مهم (هفته آینده):
4. پنل ادمین وب (حداقل: users + warehouses)
5. فیلترها در گزارشات
6. خروجی Excel پیشرفته

### آینده:
7. گزارش مقایسه شمارش‌ها
8. نمودارها و آمار
9. بهینه‌سازی performance

## 📚 منابع مفید

### مستندات
- [tRPC](https://trpc.io/docs)
- [React Query](https://tanstack.com/query/latest)
- [Expo Router](https://docs.expo.dev/router/introduction/)

### مشکلات رایج و راه‌حل

**مشکل 1**: تراکنش‌ها بدون warehouseId ذخیره می‌شوند
- **راه‌حل**: همیشه warehouseId را از context بگیرید و به mutation پاس دهید

**مشکل 2**: CORS error در وب
- **راه‌حل**: فایل `backend/hono.ts` تنظیمات CORS دارد، مطمئن شوید سرور restart شده

**مشکل 3**: Offline sync کار نمی‌کند
- **راه‌حل**: مطمئن شوید که `@react-native-community/netinfo` نصب است و OfflineSyncProvider wrap شده

## ✅ Checklist تکمیل

- [x] سیستم چند انباره
- [x] API های انبارگردانی
- [x] مدیریت تیم‌ها
- [x] UI موبایل اصلی
- [ ] صفحه همگام‌سازی
- [ ] پنل ادمین وب
- [ ] فیلترها و گزارشات پیشرفته
- [ ] خروجی Excel کامل
- [ ] تست کامل

## 🚀 آماده برای تحویل

قبل از تحویل نهایی:
1. تست تمام صفحات در موبایل و وب
2. تست offline mode
3. تست با چند انبار
4. backup از database
5. مستندسازی API
6. تهیه راهنمای کاربری

---

**نکته**: فایل `IMPLEMENTATION-STATUS.md` برای جزئیات بیشتر مطالعه شود.
