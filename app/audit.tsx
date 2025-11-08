import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useWarehouse } from '@/contexts/WarehouseContext';
import { trpc } from '@/lib/trpc';
import { Users, Plus, CheckCircle, XCircle } from 'lucide-react-native';

export default function AuditScreen() {
  const router = useRouter();
  const { selectedWarehouseId, selectedWarehouse, activeAuditSession, setSelectedAuditSessionId } = useWarehouse();
  const [sessionName, setSessionName] = useState('');
  const [allowOutflow, setAllowOutflow] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const auditSessionsQuery = trpc.auditSessions.list.useQuery(
    { warehouseId: selectedWarehouseId! },
    { enabled: !!selectedWarehouseId }
  );

  const countSessionsQuery = trpc.countSessions.list.useQuery(
    { auditSessionId: activeAuditSession?.id! },
    { enabled: !!activeAuditSession }
  );

  const teamsQuery = trpc.teams.list.useQuery(
    { warehouseId: selectedWarehouseId! },
    { enabled: !!selectedWarehouseId }
  );

  const createAuditMutation = trpc.auditSessions.create.useMutation();
  const createCountMutation = trpc.countSessions.create.useMutation();
  const completeAuditMutation = trpc.auditSessions.complete.useMutation();

  const handleCreateAudit = async () => {
    if (!selectedWarehouseId) {
      Alert.alert('خطا', 'لطفاً ابتدا انبار را انتخاب کنید');
      router.push('/select-warehouse');
      return;
    }

    if (!sessionName.trim()) {
      Alert.alert('خطا', 'لطفاً نام جلسه را وارد کنید');
      return;
    }

    setIsCreating(true);
    try {
      const result = await createAuditMutation.mutateAsync({
        warehouseId: selectedWarehouseId,
        name: sessionName.trim(),
        allowOutflow,
      });

      setSelectedAuditSessionId(result.session.id);
      Alert.alert('موفق', 'جلسه انبارگردانی ایجاد شد');
      setSessionName('');
      auditSessionsQuery.refetch();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'خطایی رخ داد';
      Alert.alert('خطا', message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateCountSession = async (teamId: string, teamName: string) => {
    if (!activeAuditSession) {
      Alert.alert('خطا', 'هیچ جلسه انبارگردانی فعالی وجود ندارد');
      return;
    }

    const countNumber = (countSessionsQuery.data?.length ?? 0) + 1;
    const name = `شمارش ${countNumber} - ${teamName}`;

    try {
      await createCountMutation.mutateAsync({
        auditSessionId: activeAuditSession.id,
        teamId,
        name,
      });

      Alert.alert('موفق', `${name} ایجاد شد`);
      countSessionsQuery.refetch();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'خطایی رخ داد';
      Alert.alert('خطا', message);
    }
  };

  const handleCompleteAudit = () => {
    if (!activeAuditSession) return;

    Alert.alert(
      'تایید',
      'آیا مطمئن هستید که می‌خواهید جلسه انبارگردانی را پایان دهید؟',
      [
        { text: 'انصراف', style: 'cancel' },
        {
          text: 'پایان',
          style: 'destructive',
          onPress: async () => {
            try {
              await completeAuditMutation.mutateAsync({ id: activeAuditSession.id });
              setSelectedAuditSessionId(null);
              Alert.alert('موفق', 'جلسه انبارگردانی پایان یافت');
              auditSessionsQuery.refetch();
            } catch (error: unknown) {
              const message = error instanceof Error ? error.message : 'خطایی رخ داد';
              Alert.alert('خطا', message);
            }
          },
        },
      ]
    );
  };

  if (!selectedWarehouse) {
    return (
      <>
        <Stack.Screen options={{ title: 'انبارگردانی' }} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>لطفاً ابتدا انبار را انتخاب کنید</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/select-warehouse')}
          >
            <Text style={styles.buttonText}>انتخاب انبار</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'انبارگردانی' }} />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Users size={32} color="#9C27B0" />
          <Text style={styles.headerTitle}>مدیریت انبارگردانی</Text>
          <Text style={styles.headerSubtitle}>{selectedWarehouse.name}</Text>
        </View>

        {activeAuditSession ? (
          <View style={styles.section}>
            <View style={styles.activeSessionCard}>
              <View style={styles.sessionHeader}>
                <Text style={styles.sessionTitle}>{activeAuditSession.name}</Text>
                <View style={[styles.statusBadge, styles.activeBadge]}>
                  <Text style={styles.statusText}>فعال</Text>
                </View>
              </View>
              <Text style={styles.sessionInfo}>
                خروج کالا: {activeAuditSession.allowOutflow ? 'فعال' : 'غیرفعال'}
              </Text>
              <TouchableOpacity
                style={[styles.button, styles.dangerButton]}
                onPress={handleCompleteAudit}
                disabled={completeAuditMutation.isPending}
              >
                {completeAuditMutation.isPending ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.buttonText}>پایان جلسه</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>شمارش‌های فعال</Text>
            </View>

            {countSessionsQuery.isLoading ? (
              <ActivityIndicator color="#9C27B0" />
            ) : (
              <View style={styles.countsList}>
                {countSessionsQuery.data?.map((session: { id: string; name: string; status: string }) => (
                  <View key={session.id} style={styles.countCard}>
                    <Text style={styles.countName}>{session.name}</Text>
                    <View style={[styles.statusBadge, styles.activeBadge]}>
                      <Text style={styles.statusText}>{session.status === 'active' ? 'فعال' : 'تکمیل شده'}</Text>
                    </View>
                  </View>
                ))}
                {(!countSessionsQuery.data || countSessionsQuery.data.length === 0) && (
                  <Text style={styles.emptyText}>هیچ شمارشی ایجاد نشده</Text>
                )}
              </View>
            )}

            <View style={styles.divider} />

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>افزودن شمارش جدید</Text>
            </View>

            {teamsQuery.isLoading ? (
              <ActivityIndicator color="#9C27B0" />
            ) : (
              <View style={styles.teamsList}>
                {teamsQuery.data?.map((team: { id: string; name: string }) => (
                  <TouchableOpacity
                    key={team.id}
                    style={styles.teamCard}
                    onPress={() => handleCreateCountSession(team.id, team.name)}
                    disabled={createCountMutation.isPending}
                  >
                    <Text style={styles.teamName}>{team.name}</Text>
                    <Plus size={20} color="#9C27B0" />
                  </TouchableOpacity>
                ))}
                {(!teamsQuery.data || teamsQuery.data.length === 0) && (
                  <Text style={styles.emptyText}>هیچ تیمی تعریف نشده</Text>
                )}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>ایجاد جلسه انبارگردانی</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>نام جلسه</Text>
                <TextInput
                  style={styles.input}
                  value={sessionName}
                  onChangeText={setSessionName}
                  placeholder="مثلاً: انبارگردانی آذر 1403"
                  placeholderTextColor="#999"
                  editable={!isCreating}
                />
              </View>

              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setAllowOutflow(!allowOutflow)}
                disabled={isCreating}
              >
                <View style={styles.checkbox}>
                  {allowOutflow ? (
                    <CheckCircle size={24} color="#4CAF50" />
                  ) : (
                    <XCircle size={24} color="#E0E0E0" />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>اجازه خروج کالا در حین انبارگردانی</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={handleCreateAudit}
                disabled={isCreating}
              >
                {isCreating ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.buttonText}>ایجاد جلسه</Text>
                )}
              </TouchableOpacity>
            </View>

            {auditSessionsQuery.data && auditSessionsQuery.data.length > 0 && (
              <>
                <View style={styles.divider} />
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>تاریخچه جلسات</Text>
                </View>
                <View style={styles.historyList}>
                  {auditSessionsQuery.data.map((session: { id: string; name: string; status: string }) => (
                    <View key={session.id} style={styles.historyCard}>
                      <Text style={styles.historyName}>{session.name}</Text>
                      <View style={[
                        styles.statusBadge,
                        session.status === 'active' ? styles.activeBadge : styles.completedBadge
                      ]}>
                        <Text style={styles.statusText}>
                          {session.status === 'active' ? 'فعال' : 'تکمیل شده'}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 24,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  header: {
    padding: 24,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#1A1A1A',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    padding: 16,
    gap: 16,
  },
  sectionHeader: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1A1A1A',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
  },
  activeSessionCard: {
    backgroundColor: '#F3E5F5',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 2,
    borderColor: '#9C27B0',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#9C27B0',
    flex: 1,
  },
  sessionInfo: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: '#4CAF50',
  },
  completedBadge: {
    backgroundColor: '#9E9E9E',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  countsList: {
    gap: 8,
  },
  countCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  countName: {
    fontSize: 16,
    color: '#1A1A1A',
    flex: 1,
  },
  teamsList: {
    gap: 8,
  },
  teamCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  teamName: {
    fontSize: 16,
    color: '#1A1A1A',
    flex: 1,
  },
  form: {
    gap: 16,
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
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  button: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: '#9C27B0',
  },
  dangerButton: {
    backgroundColor: '#FF5722',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  historyList: {
    gap: 8,
  },
  historyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  historyName: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
});
