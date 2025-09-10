import { useState } from 'react';
import { StyleSheet, FlatList, TextInput, Button } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listExpenses, addExpense, deleteExpense } from '@/lib/repos';

export default function ExpensesScreen() {
	const qc = useQueryClient();
	const [amount, setAmount] = useState('');
	const [category, setCategory] = useState('');

	const expenses = useQuery({ queryKey: ['expenses'], queryFn: listExpenses });
	const create = useMutation({ mutationFn: () => addExpense(parseFloat(amount), category.trim() || undefined), onSuccess: () => { setAmount(''); setCategory(''); qc.invalidateQueries({ queryKey: ['expenses'] }); } });
	const remove = useMutation({ mutationFn: (id: number) => deleteExpense(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }) });

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Expenses</Text>
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
						<Text style={{ flex: 1 }}>${item.amount.toFixed ? item.amount.toFixed(2) : item.amount} {item.category ? `• ${item.category}` : ''}</Text>
						<Button title="Delete" onPress={() => remove.mutate(item.id)} />
					</View>
				)}
				ListEmptyComponent={<Text>No expenses yet.</Text>}
			/>
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
	}
});


