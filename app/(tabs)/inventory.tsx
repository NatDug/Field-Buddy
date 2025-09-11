import { useState } from 'react';
import { StyleSheet, FlatList, TextInput, Button } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listInventory, addInventory, adjustInventory, deleteInventory } from '@/lib/repos';

export default function InventoryScreen() {
	const qc = useQueryClient();
	const [name, setName] = useState('');
	const [type, setType] = useState('seed');
	const [unit, setUnit] = useState('kg');
	const [qty, setQty] = useState('0');
	const [reorder, setReorder] = useState('0');

	const inventory = useQuery({ queryKey: ['inventory'], queryFn: listInventory });
	const create = useMutation({ mutationFn: () => addInventory({ name: name.trim(), type, unit, quantity_on_hand: parseFloat(qty) || 0, reorder_point: parseFloat(reorder) || 0 }), onSuccess: () => { setName(''); setQty('0'); setReorder('0'); qc.invalidateQueries({ queryKey: ['inventory'] }); } });
	const adjust = useMutation({ mutationFn: ({ id, delta }: { id: number, delta: number }) => adjustInventory(id, delta), onSuccess: () => qc.invalidateQueries({ queryKey: ['inventory'] }) });
	const remove = useMutation({ mutationFn: (id: number) => deleteInventory(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['inventory'] }) });

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Inventory</Text>
			<View style={styles.row}>
				<TextInput placeholder="Type (seed/fertilizer/equipment)" value={type} onChangeText={setType} style={styles.input} />
				<TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} />
				<TextInput placeholder="Unit" value={unit} onChangeText={setUnit} style={styles.input} />
			</View>
			<View style={styles.row}>
				<TextInput placeholder="Quantity" keyboardType="decimal-pad" value={qty} onChangeText={setQty} style={styles.input} />
				<TextInput placeholder="Reorder point" keyboardType="decimal-pad" value={reorder} onChangeText={setReorder} style={styles.input} />
				<Button title="Add Item" onPress={() => { if (!name.trim()) return; create.mutate(); }} />
			</View>

			<FlatList
				data={inventory.data}
				keyExtractor={(item) => String(item.id)}
				refreshing={inventory.isFetching}
				onRefresh={() => qc.invalidateQueries({ queryKey: ['inventory'] })}
				renderItem={({ item }) => {
					const low = item.quantity_on_hand <= item.reorder_point;
					return (
						<View style={styles.listRow}>
							<View style={{ flex: 1 }}>
								<Text style={styles.itemName}>{item.name} {item.unit ? `(${item.unit})` : ''}</Text>
								<Text style={{ color: low ? '#d9534f' : '#555' }}>Stock: {item.quantity_on_hand} • Reorder: {item.reorder_point}{low ? ' • LOW' : ''}</Text>
							</View>
							<View style={{ flexDirection: 'row', gap: 6 }}>
								<Button title="+" onPress={() => adjust.mutate({ id: item.id, delta: 1 })} />
								<Button title="-" onPress={() => adjust.mutate({ id: item.id, delta: -1 })} />
								<Button title="Delete" onPress={() => remove.mutate(item.id)} />
							</View>
						</View>
					);
				}}
				ListEmptyComponent={<Text>No inventory yet.</Text>}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16 },
	title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
	row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
	input: { flex: 1, borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 6, marginRight: 8 },
	listRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
	itemName: { fontWeight: '600' },
});
