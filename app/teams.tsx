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
import { Users, Plus, Trash2 } from 'lucide-react-native';

export default function TeamsScreen() {
  const router = useRouter();
  const { selectedWarehouseId, selectedWarehouse } = useWarehouse();
  const [teamName, setTeamName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const teamsQuery = trpc.teams.list.useQuery(
    { warehouseId: selectedWarehouseId! },
    { enabled: !!selectedWarehouseId }
  );

  const createTeamMutation = trpc.teams.create.useMutation();

  const handleCreateTeam = async () => {
    if (!selectedWarehouseId) {
      Alert.alert('خطا', 'لطفاً ابتدا انبار را انتخاب کنید');
      router.push('/select-warehouse');
      return;
    }

    if (!teamName.trim()) {
      Alert.alert('خطا', 'لطفاً نام تیم را وارد کنید');
      return;
    }

    setIsCreating(true);
    try {
      await createTeamMutation.mutateAsync({
        warehouseId: selectedWarehouseId,
        name: teamName.trim(),
        memberIds: [],
      });

      Alert.alert('موفق', 'تیم با موفقیت ایجاد شد');
      setTeamName('');
      teamsQuery.refetch();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'خطایی رخ داد';
      Alert.alert('خطا', message);
    } finally {
      setIsCreating(false);
    }
  };

  if (!selectedWarehouse) {
    return (
      <>
        <Stack.Screen options={{ title: 'مدیریت تیم‌ها' }} />
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
      <Stack.Screen options={{ title: 'مدیریت تیم‌ها' }} />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Users size={32} color="#673AB7" />
          <Text style={styles.headerTitle}>مدیریت تیم‌ها</Text>
          <Text style={styles.headerSubtitle}>{selectedWarehouse.name}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>ایجاد تیم جدید</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>نام تیم</Text>
              <TextInput
                style={styles.input}
                value={teamName}
                onChangeText={setTeamName}
                placeholder="مثلاً: تیم انبار 1"
                placeholderTextColor="#999"
                editable={!isCreating}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleCreateTeam}
              disabled={isCreating}
            >
              {isCreating ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Plus size={20} color="#ffffff" />
                  <Text style={styles.buttonText}>ایجاد تیم</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>تیم‌های موجود</Text>
          </View>

          {teamsQuery.isLoading ? (
            <ActivityIndicator color="#673AB7" style={styles.loader} />
          ) : (
            <View style={styles.teamsList}>
              {teamsQuery.data && teamsQuery.data.length > 0 ? (
                teamsQuery.data.map((team: { id: string; name: string; memberIds: string[] }) => (
                  <View key={team.id} style={styles.teamCard}>
                    <View style={styles.teamInfo}>
                      <Text style={styles.teamName}>{team.name}</Text>
                      <Text style={styles.teamMeta}>
                        {team.memberIds.length} عضو
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyList}>
                  <Text style={styles.emptyText}>هیچ تیمی تعریف نشده است</Text>
                </View>
              )}
            </View>
          )}
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
  button: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: '#673AB7',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  loader: {
    marginVertical: 24,
  },
  teamsList: {
    gap: 12,
  },
  teamCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  teamInfo: {
    flex: 1,
    gap: 4,
  },
  teamName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1A1A1A',
  },
  teamMeta: {
    fontSize: 14,
    color: '#666',
  },
  emptyList: {
    padding: 48,
    alignItems: 'center',
  },
});
