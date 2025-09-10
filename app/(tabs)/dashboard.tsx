import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';

export default function DashboardScreen() {
	return (
		<View style={styles.container}>
			<Text style={styles.title}>Field Buddy</Text>
			<Text>Simple dashboards for tasks, weather, and finances coming soon.</Text>
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


