import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useQuery } from '@tanstack/react-query';
import { getProfile } from '@/lib/repos';
import { signOut } from '@/lib/auth';
import { useAuth } from '@/lib/auth-context';
import { router } from 'expo-router';

export default function DashboardScreen() {
	const profile = useQuery({ queryKey: ['profile'], queryFn: getProfile });
	const { refreshUser } = useAuth();

	const handleLogout = async () => {
		try {
			await signOut();
			await refreshUser();
			router.replace('/auth/login');
		} catch {}
	};

	return (
		<ScrollView style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.brand}>FarmMaster Pro</Text>
				<TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
					<Text style={styles.logoutText}>Log Out</Text>
				</TouchableOpacity>
			</View>

			<View style={styles.cardRow}>
				<View style={styles.card}>
					<Text style={styles.cardTitle}>Yield Progress</Text>
					<View style={styles.barGroup}>
						<View style={[styles.bar, { width: '20%', backgroundColor: '#eafbea' }]} />
						<View style={[styles.bar, { width: '45%', backgroundColor: '#bff5bf' }]} />
						<View style={[styles.bar, { width: '75%', backgroundColor: '#22e055' }]} />
					</View>
					<Text style={styles.smallText}>Current yield is at 75% compared to last season's average.</Text>
					<TouchableOpacity style={styles.ctaBtn}>
						<Text style={styles.ctaText}>Crop Management</Text>
					</TouchableOpacity>
				</View>

				<View style={styles.card}>
					<Text style={styles.cardTitle}>Weather Alerts</Text>
					<View style={{ height: 80, justifyContent: 'center' }}>
						<Text style={styles.smallText}>Severe thunderstorm warning in the northern fields.</Text>
					</View>
				</View>

				<View style={styles.card}>
					<Text style={styles.cardTitle}>Upcoming Tasks</Text>
					<Text style={styles.smallText}>Irrigation check - 10 AM{"\n"}Fertilizer application - 2 PM{"\n"}Pest control assessment - 4 PM</Text>
					<TouchableOpacity style={styles.ctaBtn}>
						<Text style={styles.ctaText}>Compliance & Reports</Text>
					</TouchableOpacity>
				</View>
			</View>

			{profile.data && (
				<View style={styles.metaCard}>
					<Text style={styles.metaTitle}>Welcome, {profile.data.name || 'Farmer'}</Text>
					<Text style={styles.metaText}>Farm: {profile.data.farm_name || 'Unnamed Farm'}</Text>
					{profile.data.farm_type && (
						<Text style={styles.metaText}>Type: {profile.data.farm_type} · Efficiency {profile.data.efficiency_score?.toFixed(1)}%</Text>
					)}
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
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 16,
	},
	brand: {
		fontSize: 18,
		fontWeight: 'bold',
	},
	logoutBtn: {
		backgroundColor: '#22e055',
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 16,
	},
	logoutText: {
		color: '#fff',
		fontWeight: '600',
	},
	cardRow: {
		flexDirection: 'row',
		gap: 12,
		marginBottom: 16,
	},
	card: {
		flex: 1,
		backgroundColor: '#fff',
		borderRadius: 12,
		padding: 16,
		shadowColor: '#000',
		shadowOpacity: 0.05,
		shadowRadius: 8,
		borderWidth: 1,
		borderColor: '#f0f0f0',
	},
	cardTitle: {
		fontSize: 16,
		fontWeight: 'bold',
		marginBottom: 8,
	},
	barGroup: {
		gap: 6,
		marginVertical: 8,
	},
	bar: {
		height: 10,
		borderRadius: 4,
	},
	ctaBtn: {
		alignSelf: 'flex-start',
		marginTop: 12,
		backgroundColor: '#22e055',
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 16,
	},
	ctaText: {
		color: '#fff',
		fontWeight: '600',
	},
	smallText: {
		color: '#444',
	},
	metaCard: {
		marginTop: 8,
		padding: 16,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: '#f0f0f0',
		backgroundColor: '#f8f9fa',
	},
	metaTitle: {
		fontWeight: 'bold',
		marginBottom: 4,
	},
	metaText: {
		color: '#555',
	},
});


