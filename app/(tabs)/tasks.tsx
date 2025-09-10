import { useState } from 'react';
import { StyleSheet, Button, FlatList, TextInput, Switch } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listTasks, addTask, deleteTask, toggleTaskDone } from '@/lib/repos';

export default function TasksScreen() {
	const qc = useQueryClient();
	const [listening, setListening] = useState(false);
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');

	const tasks = useQuery({ queryKey: ['tasks'], queryFn: listTasks });
	const create = useMutation({ mutationFn: () => addTask(title.trim(), description.trim() || undefined), onSuccess: () => { setTitle(''); setDescription(''); qc.invalidateQueries({ queryKey: ['tasks'] }); } });
	const remove = useMutation({ mutationFn: (id: number) => deleteTask(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }) });
	const toggle = useMutation({ mutationFn: ({ id, done }: { id: number, done: boolean }) => toggleTaskDone(id, done), onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }) });

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Tasks</Text>
			<View style={styles.row}>
				<TextInput placeholder="Title" value={title} onChangeText={setTitle} style={styles.input} />
				<TextInput placeholder="Description" value={description} onChangeText={setDescription} style={styles.input} />
				<Button title="Add" onPress={() => { if (!title.trim()) return; create.mutate(); }} />
			</View>
			<Button title={listening ? 'Listening…' : 'Voice input (placeholder)'} onPress={() => setListening(v => !v)} />
			<FlatList
				style={{ marginTop: 12 }}
				data={tasks.data}
				keyExtractor={(item) => String(item.id)}
				refreshing={tasks.isFetching}
				onRefresh={() => qc.invalidateQueries({ queryKey: ['tasks'] })}
				renderItem={({ item }) => (
					<View style={styles.listRow}>
						<Switch value={item.status === 'done'} onValueChange={(v) => toggle.mutate({ id: item.id, done: v })} />
						<Text style={{ flex: 1, marginLeft: 8 }}>{item.title}</Text>
						<Button title="Delete" onPress={() => remove.mutate(item.id)} />
					</View>
				)}
				ListEmptyComponent={<Text>No tasks yet.</Text>}
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


