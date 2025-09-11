import { useState } from 'react';
import { StyleSheet, FlatList, TextInput, Button, Switch } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listTeam, addTeamMember, deleteTeamMember, listPermissions, setPermission } from '@/lib/repos';

export default function TeamScreen() {
	const qc = useQueryClient();
	const [name, setName] = useState('');
	const [role, setRole] = useState('worker');
	const [email, setEmail] = useState('');
	const [phone, setPhone] = useState('');
	const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);

	const team = useQuery({ queryKey: ['team'], queryFn: listTeam });
	const perms = useQuery({ queryKey: ['perms', selectedMemberId], queryFn: () => selectedMemberId ? listPermissions(selectedMemberId) : Promise.resolve([]), enabled: selectedMemberId != null });

	const create = useMutation({ mutationFn: () => addTeamMember({ name: name.trim(), email: email.trim() || undefined, phone: phone.trim() || undefined, role }), onSuccess: () => { setName(''); setEmail(''); setPhone(''); qc.invalidateQueries({ queryKey: ['team'] }); } });
	const remove = useMutation({ mutationFn: (id: number) => deleteTeamMember(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['team'] }); if (selectedMemberId === id) setSelectedMemberId(null); } });
	const updatePerm = useMutation({ mutationFn: ({ page, canRead, canWrite, dataScope }: { page: string; canRead: boolean; canWrite: boolean; dataScope: string; }) => setPermission(selectedMemberId!, page, canRead, canWrite, dataScope), onSuccess: () => qc.invalidateQueries({ queryKey: ['perms', selectedMemberId] }) });

	const pages = ['dashboard','crops','tasks','expenses','inventory','documents','alerts','reports','profile'];

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Team</Text>
			<View style={styles.row}>
				<TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} />
				<TextInput placeholder="Role (admin/manager/worker/viewer)" value={role} onChangeText={setRole} style={styles.input} />
			</View>
			<View style={styles.row}>
				<TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
				<TextInput placeholder="Phone" value={phone} onChangeText={setPhone} style={styles.input} />
				<Button title="Add" onPress={() => { if (!name.trim()) return; create.mutate(); }} />
			</View>

			<View style={{ flexDirection: 'row', gap: 12, flex: 1 }}>
				<View style={[styles.card, { flex: 1 }]}> 
					<Text style={styles.cardTitle}>Members</Text>
					<FlatList
						data={team.data}
						keyExtractor={(item) => String(item.id)}
						renderItem={({ item }) => (
							<View style={styles.listRow}>
								<Text style={{ flex: 1 }} onPress={() => setSelectedMemberId(item.id)}>{item.name} • {item.role}</Text>
								<Button title="Delete" onPress={() => remove.mutate(item.id)} />
							</View>
						)}
						ListEmptyComponent={<Text>No team members.</Text>}
					/>
				</View>

				<View style={[styles.card, { flex: 1 }]}> 
					<Text style={styles.cardTitle}>Permissions {selectedMemberId ? `(member #${selectedMemberId})` : ''}</Text>
					{selectedMemberId == null ? (
						<Text>Select a member to edit permissions.</Text>
					) : (
						<FlatList
							data={pages}
							keyExtractor={(p) => p}
							renderItem={({ item: page }) => {
								const existing = (perms.data || []).find((p: any) => p.page === page) || { can_read: 1, can_write: 0, data_scope: 'farm-wide' };
								return (
									<View style={styles.permRow}>
										<Text style={{ flex: 1 }}>{page}</Text>
										<Switch value={!!existing.can_read} onValueChange={(v) => updatePerm.mutate({ page, canRead: v, canWrite: !!existing.can_write, dataScope: existing.data_scope })} />
										<Switch value={!!existing.can_write} onValueChange={(v) => updatePerm.mutate({ page, canRead: !!existing.can_read, canWrite: v, dataScope: existing.data_scope })} />
									</View>
								);
							}}
						/>
					)}
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16 },
	title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
	row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
	input: { flex: 1, borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 6, marginRight: 8 },
	card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#f0f0f0' },
	cardTitle: { fontWeight: 'bold', marginBottom: 6 },
	listRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
	permRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
});
