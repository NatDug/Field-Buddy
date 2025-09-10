import { useState } from 'react';
import { StyleSheet, Button } from 'react-native';
import { Text, View } from '@/components/Themed';

export default function TasksScreen() {
	const [listening, setListening] = useState(false);

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Tasks</Text>
			<Button title={listening ? 'Listening…' : 'Voice input (placeholder)'} onPress={() => setListening(v => !v)} />
			<Text style={{ marginTop: 8 }}>Add tasks and mark them done. Voice logging coming soon.</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		padding: 16,
	},
	title: {
		fontSize: 22,
		fontWeight: 'bold',
		marginBottom: 8,
	},
});


