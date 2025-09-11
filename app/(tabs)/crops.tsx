import { useState } from 'react';
import { StyleSheet, FlatList, TextInput, Button, ScrollView, TouchableOpacity, View as RNView } from 'react-native';
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
		<ScrollView style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<Text style={styles.brand}>Crop Management</Text>
				<View style={styles.headerActions}>
					<TextInput placeholder="Search tasks" style={styles.search} />
					<TouchableOpacity style={styles.btnSmall}><Text style={styles.btnSmallText}>Voice Input</Text></TouchableOpacity>
					<TouchableOpacity style={styles.btnSmallPrimary}><Text style={styles.btnSmallPrimaryText}>Add New Task</Text></TouchableOpacity>
				</View>
			</View>

			{/* Calendar strip */}
			<View style={styles.card}>
				<Text style={styles.cardTitle}>Crop Task Calendar</Text>
				<View style={styles.calendarStrip}>
					{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d, i) => (
						<View key={d} style={styles.dayCol}>
							<Text style={styles.dayLabel}>{d}</Text>
							<View style={styles.pill}><Text style={styles.pillText}>{i+1}</Text></View>
							<Text style={styles.pillCaption}>{['Planting','-','Fertilizing','-','Harvesting','-','-'][i]}</Text>
						</View>
					))}
				</View>
			</View>

			{/* Two-column: Labor tracking + Task details */}
			<View style={styles.row}>
				<View style={styles.cardHalf}>
					<Text style={styles.cardTitle}>Labor Tracking</Text>
					{[
						{ name: 'John Doe', hours: 4, pct: 40 },
						{ name: 'Jane Smith', hours: 6, pct: 70 },
						{ name: 'Bill Johnson', hours: 5, pct: 60 },
					].map(worker => (
						<View key={worker.name} style={styles.laborRow}>
							<Text style={styles.laborName}>{worker.name} - {worker.hours} hrs</Text>
							<View style={styles.laborTrack}>
								<View style={[styles.laborFill, { width: `${worker.pct}%` }]} />
							</View>
						</View>
					))}
				</View>

				<View style={styles.cardHalf}>
					<Text style={styles.cardTitle}>Task Details</Text>
					<Text>Task: Planting</Text>
					<Text>Date: March 3, 2023</Text>
					<Text>Details: Plant corn in Field A</Text>
					<TouchableOpacity style={[styles.btn, { marginTop: 12 }]}><Text style={styles.btnText}>Update Task</Text></TouchableOpacity>
				</View>
			</View>

			{/* Existing crops add/list below */}
			<View style={styles.card}>
				<Text style={styles.cardTitle}>Crops</Text>
				<View style={styles.inputRow}>
					<TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} />
					<TextInput placeholder="Variety" value={variety} onChangeText={setVariety} style={styles.input} />
					<Button title="Add" onPress={() => { if (!name.trim()) return; create.mutate(); }} />
				</View>
				<RNView>
					<FlatList
						data={crops.data}
						keyExtractor={(item) => String(item.id)}
						style={{ maxHeight: 260 }}
						renderItem={({ item }) => (
							<View style={styles.listRow}>
								<Text style={{ flex: 1 }}>{item.name} {item.variety ? `(${item.variety})` : ''}</Text>
								<Button title="Delete" onPress={() => remove.mutate(item.id)} />
							</View>
						)}
						ListEmptyComponent={<Text>No crops yet.</Text>}
					/>
				</RNView>
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 12,
	},
	brand: { fontSize: 18, fontWeight: 'bold' },
	headerActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
	search: {
		borderWidth: 1,
		borderColor: '#e5e5e5',
		borderRadius: 16,
		paddingHorizontal: 12,
		paddingVertical: 8,
		minWidth: 140,
		backgroundColor: '#fff',
	},
	btnSmall: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: '#eafbea' },
	btnSmallText: { color: '#0e8f2b', fontWeight: '600' },
	btnSmallPrimary: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: '#22e055' },
	btnSmallPrimaryText: { color: '#fff', fontWeight: '600' },

	card: {
		backgroundColor: '#fff',
		borderRadius: 12,
		padding: 16,
		borderWidth: 1,
		borderColor: '#f0f0f0',
		marginBottom: 16,
		shadowColor: '#000',
		shadowOpacity: 0.05,
		shadowRadius: 8,
	},
	cardHalf: {
		flex: 1,
		backgroundColor: '#fff',
		borderRadius: 12,
		padding: 16,
		borderWidth: 1,
		borderColor: '#f0f0f0',
		shadowColor: '#000',
		shadowOpacity: 0.05,
		shadowRadius: 8,
	},
	cardTitle: {
		fontSize: 16,
		fontWeight: 'bold',
		marginBottom: 8,
	},
	calendarStrip: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 8,
	},
	dayCol: { alignItems: 'center', width: `${100/7}%` },
	dayLabel: { color: '#555', marginBottom: 6 },
	pill: { backgroundColor: '#e6faea', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16 },
	pillText: { color: '#0e8f2b', fontWeight: '600' },
	pillCaption: { fontSize: 12, color: '#7a7a7a', marginTop: 6 },

	row: { flexDirection: 'row', gap: 12, marginBottom: 16 },
	laborRow: { marginBottom: 12 },
	laborName: { marginBottom: 6 },
	laborTrack: { height: 8, backgroundColor: '#eaeaea', borderRadius: 4 },
	laborFill: { height: 8, backgroundColor: '#22e055', borderRadius: 4 },

	inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
	input: { flex: 1, borderWidth: 1, borderColor: '#e5e5e5', padding: 10, borderRadius: 8, backgroundColor: '#fff' },
	btn: { backgroundColor: '#22e055', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
	btnText: { color: '#fff', fontWeight: '600' },
	listRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
});


