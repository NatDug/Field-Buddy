import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';

export default function ExpensesScreen() {
	return (
		<View style={styles.container}>
			<Text style={styles.title}>Expenses</Text>
			<Text>Track expenses and revenue. CRUD coming soon.</Text>
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


