import { useState } from 'react';
import { StyleSheet, FlatList, TextInput, Button } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listCrops, addCrop, deleteCrop } from '@/lib/repos';

export default function CropsScreen() {
	const qc = useQueryClient();
	const [name, setName] = useState('');
	const [variety, setVariety] = useState('');

	const crops = useQuery({ queryKey: ['crops'], queryFn: listCrops });
	const create = useMutation({ mutationFn: () => addCrop(name.trim(), variety.trim() || undefined), onSuccess: () => { setName(''); setVariety(''); qc.invalidateQueries({ queryKey: ['crops'] }); } });
	const remove = useMutation({ mutationFn: (id: number) => deleteCrop(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['crops'] }) });

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Crops</Text>
			<View style={styles.row}>
				<TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} />
				<TextInput placeholder="Variety" value={variety} onChangeText={setVariety} style={styles.input} />
				<Button title="Add" onPress={() => { if (!name.trim()) return; create.mutate(); }} />
			</View>
			<FlatList
				data={crops.data}
				keyExtractor={(item) => String(item.id)}
				refreshing={crops.isFetching}
				onRefresh={() => qc.invalidateQueries({ queryKey: ['crops'] })}
				renderItem={({ item }) => (
					<View style={styles.listRow}>
						<Text style={{ flex: 1 }}>{item.name} {item.variety ? `(${item.variety})` : ''}</Text>
						<Button title="Delete" onPress={() => remove.mutate(item.id)} />
					</View>
				)}
				ListEmptyComponent={<Text>No crops yet.</Text>}
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


