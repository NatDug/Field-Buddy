import { useMemo, useState } from 'react';
import { StyleSheet, FlatList, TextInput, Button, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listExpenses, addExpense, deleteExpense, listBudgets, upsertBudget, getQbMeta, saveQbMeta } from '@/lib/repos';

export default function ExpensesScreen() {
	const qc = useQueryClient();
	const [amount, setAmount] = useState('');
	const [category, setCategory] = useState('');
	const now = new Date();
	const month = now.getMonth() + 1;
	const year = now.getFullYear();
	const [planCategory, setPlanCategory] = useState('General');
	const [planAmount, setPlanAmount] = useState('0');

	const expenses = useQuery({ queryKey: ['expenses'], queryFn: listExpenses });
	const budgets = useQuery({ queryKey: ['budgets', month, year], queryFn: () => listBudgets(month, year) });
	const qb = useQuery({ queryKey: ['qb_meta'], queryFn: getQbMeta });

	const create = useMutation({ mutationFn: () => addExpense(parseFloat(amount), category.trim() || undefined), onSuccess: () => { setAmount(''); setCategory(''); qc.invalidateQueries({ queryKey: ['expenses'] }); } });
	const remove = useMutation({ mutationFn: (id: number) => deleteExpense(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }) });
	const saveBudget = useMutation({ mutationFn: () => upsertBudget(month, year, planCategory.trim() || 'General', parseFloat(planAmount) || 0), onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets', month, year] }) });
	const connectQb = useMutation({ mutationFn: () => saveQbMeta({ access_token: 'sandbox-placeholder', realm_id: 'sandbox' }), onSuccess: () => qc.invalidateQueries({ queryKey: ['qb_meta'] }) });

	const totalThisMonth = useMemo(() => {
		const d0 = new Date(year, month - 1, 1).toISOString().slice(0, 10);
		const d1 = new Date(year, month, 0).toISOString().slice(0, 10);
		return (expenses.data || [])
			.filter((e: any) => !e.incurred_on || (e.incurred_on >= d0 && e.incurred_on <= d1))
			.reduce((s: number, e: any) => s + (e.amount || 0), 0);
	}, [expenses.data, month, year]);

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Expenses</Text>

			{/* QuickBooks connect */}
			<View style={styles.card}>
				<Text style={styles.cardTitle}>QuickBooks</Text>
				<Text>Status: {qb.data?.access_token ? 'Connected (sandbox)' : 'Not connected'}</Text>
				<TouchableOpacity style={styles.btn} onPress={() => connectQb.mutate()}>
					<Text style={styles.btnText}>{qb.data?.access_token ? 'Reconnect' : 'Connect (sandbox)'} </Text>
				</TouchableOpacity>
			</View>

			{/* Budget card */}
			<View style={styles.card}>
				<Text style={styles.cardTitle}>Budget ({month}/{year})</Text>
				<Text>Total spent this month: ${totalThisMonth.toFixed(2)}</Text>
				<View style={styles.row}>
					<TextInput placeholder="Category" value={planCategory} onChangeText={setPlanCategory} style={styles.input} />
					<TextInput placeholder="Planned amount" keyboardType="decimal-pad" value={planAmount} onChangeText={setPlanAmount} style={styles.input} />
					<Button title={saveBudget.isPending ? 'Saving…' : 'Save Plan'} onPress={() => saveBudget.mutate()} />
				</View>
				{(budgets.data || []).map((b: any) => (
					<View key={b.id} style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
						<Text>{b.category}</Text>
						<Text>${Number(b.planned_amount || 0).toFixed(2)}</Text>
					</View>
				))}
			</View>

			{/* Add expense */}
			<View style={styles.row}>
				<TextInput placeholder="Amount" keyboardType="decimal-pad" value={amount} onChangeText={setAmount} style={styles.input} />
				<TextInput placeholder="Category" value={category} onChangeText={setCategory} style={styles.input} />
				<Button title="Add" onPress={() => { const n = parseFloat(amount); if (isNaN(n) || n <= 0) return; create.mutate(); }} />
			</View>

			<FlatList
				data={expenses.data}
				keyExtractor={(item) => String(item.id)}
				refreshing={expenses.isFetching}
				onRefresh={() => qc.invalidateQueries({ queryKey: ['expenses'] })}
				renderItem={({ item }) => (
					<View style={styles.listRow}>
						<Text style={{ flex: 1 }}>${item.amount?.toFixed ? item.amount.toFixed(2) : item.amount} {item.category ? `• ${item.category}` : ''}</Text>
						<Button title="Delete" onPress={() => remove.mutate(item.id)} />
					</View>
				)}
				ListEmptyComponent={<Text>No expenses yet.</Text>}
			/>

			{/* Export placeholder */}
			<View style={{ marginTop: 12, alignItems: 'flex-start' }}>
				<TouchableOpacity style={styles.btnSecondary} onPress={() => { /* TODO: implement CSV export */ }}>
					<Text style={styles.btnSecondaryText}>Export CSV</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
	},
	title: {
		fontSize: 22,
		fontWeight: 'bold',
		marginBottom: 12,
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		marginBottom: 12,
	},
	input: {
		flex: 1,
		borderWidth: 1,
		borderColor: '#ccc',
		padding: 8,
		borderRadius: 6,
		marginRight: 8,
	},
	listRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 8,
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
	},
	card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#f0f0f0', marginBottom: 16 },
	cardTitle: { fontWeight: 'bold', marginBottom: 6 },
	btn: { backgroundColor: '#22e055', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, alignSelf: 'flex-start', marginTop: 8 },
	btnText: { color: '#fff', fontWeight: '600' },
	btnSecondary: { backgroundColor: '#eafbea', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 },
	btnSecondaryText: { color: '#0e8f2b', fontWeight: '600' },
});


