import { useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Text, View } from '@/components/Themed';

export default function ReportsScreen() {
	const [carbonAmount, setCarbonAmount] = useState('138');
	const [date, setDate] = useState('');
	const [carbonUsage, setCarbonUsage] = useState(30);

	return (
		<ScrollView style={styles.container}>
			{/* Header row like mock with brand and logout placeholder kept by layout */}
			<View style={styles.banner}>
				<Text style={styles.bannerTitle}>Generate Reports</Text>
				<View style={styles.bannerActions}>
					<TouchableOpacity style={[styles.btn, styles.btnSecondary]}>
						<Text style={styles.btnSecondaryText}>Export CSV</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.btn}>
						<Text style={styles.btnText}>Export PDF</Text>
					</TouchableOpacity>
				</View>
			</View>

			<View style={styles.card}>
				<Text style={styles.cardTitle}>Carbon Tracking</Text>
				<View style={styles.formRow}> 
					<Text style={styles.label}>Carbon Amount</Text>
					<TextInput value={carbonAmount} onChangeText={setCarbonAmount} style={styles.input} keyboardType="numeric" />
				</View>
				<View style={styles.formRow}>
					<Text style={styles.label}>Date</Text>
					<TextInput value={date} onChangeText={setDate} style={styles.input} placeholder="YYYY-MM-DD" />
				</View>
				<View>
					<Text style={styles.label}>Carbon Usage</Text>
					<View style={styles.sliderTrack}>
						<View style={[styles.sliderFill, { width: `${carbonUsage}%` }]} />
					</View>
				</View>
			</View>

			<View style={styles.card}>
				<Text style={styles.cardTitle}>Pesticide Usage Graph</Text>
				<View style={{ marginTop: 12, gap: 10 }}>
					<View style={styles.graphRow}>
						<View style={styles.axis} />
						<View style={[styles.usageBar, { width: '80%' }]} />
					</View>
					<View style={styles.graphRow}>
						<View style={styles.axis} />
						<View style={[styles.usageBar, { width: '45%' }]} />
					</View>
					<View style={styles.graphRow}>
						<View style={styles.axis} />
						<View style={[styles.usageBar, { width: '60%' }]} />
					</View>
					<View style={styles.graphRow}>
						<View style={styles.axis} />
						<View style={[styles.usageBar, { width: '35%' }]} />
					</View>
				</View>
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
	},
	banner: {
		backgroundColor: '#dff4e3',
		borderRadius: 12,
		padding: 16,
		borderWidth: 1,
		borderColor: '#e6f6ea',
		marginBottom: 16,
	},
	bannerTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 12,
	},
	bannerActions: {
		flexDirection: 'row',
		gap: 12,
	},
	btn: {
		backgroundColor: '#22e055',
		paddingHorizontal: 16,
		paddingVertical: 10,
		borderRadius: 20,
	},
	btnText: { color: '#fff', fontWeight: '600' },
	btnSecondary: { backgroundColor: '#eafbea' },
	btnSecondaryText: { color: '#0e8f2b', fontWeight: '600' },
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
	cardTitle: {
		fontSize: 16,
		fontWeight: 'bold',
	},
	formRow: {
		marginTop: 12,
	},
	label: {
		color: '#444',
		marginBottom: 6,
	},
	input: {
		borderWidth: 1,
		borderColor: '#e5e5e5',
		borderRadius: 8,
		padding: 10,
		backgroundColor: '#fff',
	},
	sliderTrack: {
		height: 4,
		backgroundColor: '#ddd',
		borderRadius: 2,
		marginTop: 8,
	},
	sliderFill: {
		height: 4,
		backgroundColor: '#22e055',
		borderRadius: 2,
	},
	graphRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
	axis: { width: 2, height: 22, backgroundColor: '#222', borderRadius: 1 },
	usageBar: { height: 22, backgroundColor: '#22e055', borderRadius: 4 },
});


