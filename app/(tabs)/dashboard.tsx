import { StyleSheet, ScrollView } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useQuery } from '@tanstack/react-query';
import { getProfile } from '@/lib/repos';

export default function DashboardScreen() {
	const profile = useQuery({ queryKey: ['profile'], queryFn: getProfile });

	return (
		<ScrollView style={styles.container}>
			<Text style={styles.title}>Agriden Dashboard</Text>
			
			{profile.data ? (
				<View>
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Farm Overview</Text>
						<Text style={styles.farmName}>{profile.data.farm_name || 'Unnamed Farm'}</Text>
						<Text style={styles.farmerName}>Farmer: {profile.data.name || 'Not set'}</Text>
					</View>

					{profile.data.farm_type && (
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>USDA Classification</Text>
							<View style={styles.classificationCard}>
								<Text style={styles.classificationType}>{profile.data.farm_type}</Text>
								<Text style={styles.efficiencyScore}>
									Efficiency Score: {profile.data.efficiency_score?.toFixed(1)}%
								</Text>
								{profile.data.usda_strata_id && (
									<Text style={styles.strataId}>Strata ID: {profile.data.usda_strata_id}</Text>
								)}
							</View>
						</View>
					)}

					{profile.data.latitude && profile.data.longitude && (
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>Location</Text>
							<Text style={styles.coordinates}>
								{profile.data.latitude.toFixed(4)}, {profile.data.longitude.toFixed(4)}
							</Text>
							{profile.data.address && (
								<Text style={styles.address}>{profile.data.address}</Text>
							)}
						</View>
					)}

					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Quick Actions</Text>
						<Text style={styles.actionText}>• Add crops and track varieties</Text>
						<Text style={styles.actionText}>• Log daily tasks and expenses</Text>
						<Text style={styles.actionText}>• Monitor weather alerts</Text>
						<Text style={styles.actionText}>• Generate compliance reports</Text>
					</View>
				</View>
			) : (
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Welcome to Agriden!</Text>
					<Text style={styles.welcomeText}>
						Get started by setting up your farm profile in the Profile tab. 
						Add your location to unlock USDA data integration and farm classification.
					</Text>
				</View>
			)}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 20,
		textAlign: 'center',
	},
	section: {
		marginBottom: 20,
		padding: 16,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: '#ddd',
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 12,
	},
	farmName: {
		fontSize: 20,
		fontWeight: 'bold',
		marginBottom: 4,
	},
	farmerName: {
		fontSize: 16,
		color: '#666',
	},
	classificationCard: {
		padding: 12,
		backgroundColor: '#f0f8ff',
		borderRadius: 6,
	},
	classificationType: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#0066cc',
		marginBottom: 8,
	},
	efficiencyScore: {
		fontSize: 16,
		marginBottom: 4,
	},
	strataId: {
		fontSize: 14,
		color: '#666',
	},
	coordinates: {
		fontSize: 16,
		fontFamily: 'monospace',
		marginBottom: 4,
	},
	address: {
		fontSize: 14,
		color: '#666',
	},
	actionText: {
		fontSize: 16,
		marginBottom: 8,
	},
	welcomeText: {
		fontSize: 16,
		lineHeight: 24,
		textAlign: 'center',
	},
});


