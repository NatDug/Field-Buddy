import { useState } from 'react';
import { StyleSheet, FlatList, TextInput, Button, Linking, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listDocuments, addDocument, deleteDocument } from '@/lib/repos';

export default function DocumentsScreen() {
	const qc = useQueryClient();
	const [title, setTitle] = useState('');
	const [type, setType] = useState('pdf');
	const [tags, setTags] = useState('');
	const [uri, setUri] = useState('');

	const docs = useQuery({ queryKey: ['documents'], queryFn: listDocuments });
	const create = useMutation({ mutationFn: () => addDocument({ title: title.trim(), type: type.trim(), tags: tags.split(',').map(t => t.trim()).filter(Boolean), file_uri: uri.trim() }), onSuccess: () => { setTitle(''); setType('pdf'); setTags(''); setUri(''); qc.invalidateQueries({ queryKey: ['documents'] }); } });
	const remove = useMutation({ mutationFn: (id: number) => deleteDocument(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }) });

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Documents</Text>
			<View style={styles.row}>
				<TextInput placeholder="Title" value={title} onChangeText={setTitle} style={styles.input} />
				<TextInput placeholder="Type (pdf/image/other)" value={type} onChangeText={setType} style={styles.input} />
			</View>
			<View style={styles.row}>
				<TextInput placeholder="Tags (comma-separated)" value={tags} onChangeText={setTags} style={styles.input} />
				<TextInput placeholder="File URI (http:// or file://)" value={uri} onChangeText={setUri} style={styles.input} />
				<Button title="Add" onPress={() => { if (!title.trim() || !uri.trim()) return; create.mutate(); }} />
			</View>

			<FlatList
				data={docs.data}
				keyExtractor={(item) => String(item.id)}
				refreshing={docs.isFetching}
				onRefresh={() => qc.invalidateQueries({ queryKey: ['documents'] })}
				renderItem={({ item }) => (
					<View style={styles.listRow}>
						<View style={{ flex: 1 }}>
							<Text style={{ fontWeight: '600' }}>{item.title}</Text>
							<Text style={{ color: '#555' }}>{item.type} • {item.tags}</Text>
						</View>
						<View style={{ flexDirection: 'row', gap: 6 }}>
							<TouchableOpacity style={styles.btn} onPress={() => Linking.openURL(item.file_uri)}>
								<Text style={styles.btnText}>Open</Text>
							</TouchableOpacity>
							<Button title="Delete" onPress={() => remove.mutate(item.id)} />
						</View>
					</View>
				)}
				ListEmptyComponent={<Text>No documents yet.</Text>}
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
	btn: { backgroundColor: '#22e055', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 },
	btnText: { color: '#fff', fontWeight: '600' },
});
