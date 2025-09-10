import { useState, useEffect } from 'react';
import { StyleSheet, TextInput, Button, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, updateProfile } from '@/lib/repos';
import { getCurrentLocation, geocodeAddress, classifyFarm, FarmLocation } from '@/lib/usda-api';
import { useAuth } from '@/lib/auth-context';
import { signOut } from '@/lib/auth';
import { router } from 'expo-router';

export default function ProfileScreen() {
	const qc = useQueryClient();
	const { user, refreshUser } = useAuth();
	const [name, setName] = useState('');
	const [farmName, setFarmName] = useState('');
	const [address, setAddress] = useState('');
	const [isLoadingLocation, setIsLoadingLocation] = useState(false);
	const [isClassifying, setIsClassifying] = useState(false);

	const profile = useQuery({ queryKey: ['profile'], queryFn: getProfile });
	const update = useMutation({ 
		mutationFn: updateProfile, 
		onSuccess: () => qc.invalidateQueries({ queryKey: ['profile'] }) 
	});

	useEffect(() => {
		if (profile.data) {
			setName(profile.data.name || '');
			setFarmName(profile.data.farm_name || '');
			setAddress(profile.data.address || '');
		}
	}, [profile.data]);

	const handleGetCurrentLocation = async () => {
		setIsLoadingLocation(true);
		try {
			const location = await getCurrentLocation();
			await update.mutateAsync({
				latitude: location.latitude,
				longitude: location.longitude,
			});
			Alert.alert('Success', `Location set: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`);
		} catch (error) {
			Alert.alert('Error', 'Failed to get current location. Please check permissions.');
		} finally {
			setIsLoadingLocation(false);
		}
	};

	const handleGeocodeAddress = async () => {
		if (!address.trim()) {
			Alert.alert('Error', 'Please enter an address');
			return;
		}

		setIsLoadingLocation(true);
		try {
			const location = await geocodeAddress(address);
			await update.mutateAsync({
				latitude: location.latitude,
				longitude: location.longitude,
				address: location.address,
			});
			Alert.alert('Success', `Address geocoded: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`);
		} catch (error) {
			Alert.alert('Error', 'Failed to geocode address. Please check the address and try again.');
		} finally {
			setIsLoadingLocation(false);
		}
	};

	const handleClassifyFarm = async () => {
		if (!profile.data?.latitude || !profile.data?.longitude) {
			Alert.alert('Error', 'Please set farm location first');
			return;
		}

		setIsClassifying(true);
		try {
			const location: FarmLocation = {
				latitude: profile.data.latitude,
				longitude: profile.data.longitude,
				state: profile.data.state,
				county: profile.data.county,
				address: profile.data.address,
			};

			const classification = await classifyFarm(location);
			
			await update.mutateAsync({
				farm_type: classification.farmType,
				efficiency_score: classification.efficiencyScore,
				usda_strata_id: classification.landUseStrata?.strataId,
			});

			Alert.alert(
				'Farm Classified', 
				`Farm Type: ${classification.farmType}\nEfficiency Score: ${classification.efficiencyScore?.toFixed(1)}%\nCrop Data Points: ${classification.cropData.length}`
			);
		} catch (error) {
			Alert.alert('Error', 'Failed to classify farm. Please try again.');
		} finally {
			setIsClassifying(false);
		}
	};

	const handleSaveProfile = async () => {
		await update.mutateAsync({
			name: name.trim(),
			farm_name: farmName.trim(),
		});
		Alert.alert('Success', 'Profile saved successfully');
	};

	const handleSignOut = async () => {
		Alert.alert(
			'Sign Out',
			'Are you sure you want to sign out?',
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Sign Out',
					style: 'destructive',
					onPress: async () => {
						try {
							await signOut();
							await refreshUser();
							router.replace('/auth/login');
						} catch (error) {
							Alert.alert('Error', 'Failed to sign out');
						}
					},
				},
			]
		);
	};

	return (
		<ScrollView style={styles.container}>
			<Text style={styles.title}>Farm Profile</Text>
			
			{user && (
				<View style={styles.userSection}>
					<Text style={styles.userName}>{user.name}</Text>
					<Text style={styles.userEmail}>{user.email || user.phone}</Text>
					<Text style={styles.userProvider}>Signed in with {user.provider || 'email'}</Text>
				</View>
			)}
			
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Basic Information</Text>
				<TextInput
					placeholder="Farmer Name"
					value={name}
					onChangeText={setName}
					style={styles.input}
				/>
				<TextInput
					placeholder="Farm Name"
					value={farmName}
					onChangeText={setFarmName}
					style={styles.input}
				/>
				<Button title="Save Profile" onPress={handleSaveProfile} />
			</View>

			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Farm Location</Text>
				<TextInput
					placeholder="Enter farm address"
					value={address}
					onChangeText={setAddress}
					style={styles.input}
					multiline
				/>
				<View style={styles.buttonRow}>
					<Button 
						title={isLoadingLocation ? "Getting..." : "Use GPS"} 
						onPress={handleGetCurrentLocation}
						disabled={isLoadingLocation}
					/>
					<Button 
						title={isLoadingLocation ? "Geocoding..." : "Geocode Address"} 
						onPress={handleGeocodeAddress}
						disabled={isLoadingLocation}
					/>
				</View>
			</View>

			<View style={styles.section}>
				<Text style={styles.sectionTitle}>USDA Data Integration</Text>
				<Button 
					title={isClassifying ? "Classifying..." : "Classify Farm"} 
					onPress={handleClassifyFarm}
					disabled={isClassifying || !profile.data?.latitude}
				/>
				
				{profile.data?.farm_type && (
					<View style={styles.classificationInfo}>
						<Text style={styles.infoTitle}>Farm Classification:</Text>
						<Text>Type: {profile.data.farm_type}</Text>
						<Text>Efficiency Score: {profile.data.efficiency_score?.toFixed(1)}%</Text>
						<Text>USDA Strata ID: {profile.data.usda_strata_id || 'Not available'}</Text>
					</View>
				)}
			</View>

			{profile.data?.latitude && profile.data?.longitude && (
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Current Location</Text>
					<Text>Latitude: {profile.data.latitude.toFixed(6)}</Text>
					<Text>Longitude: {profile.data.longitude.toFixed(6)}</Text>
					{profile.data.address && <Text>Address: {profile.data.address}</Text>}
				</View>
			)}

			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Account</Text>
				<Button title="Sign Out" onPress={handleSignOut} color="#ff4444" />
			</View>
		</ScrollView>
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
		marginBottom: 16,
		textAlign: 'center',
	},
	section: {
		marginBottom: 24,
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
	input: {
		borderWidth: 1,
		borderColor: '#ccc',
		padding: 12,
		borderRadius: 6,
		marginBottom: 12,
		fontSize: 16,
	},
	buttonRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		gap: 8,
	},
	classificationInfo: {
		marginTop: 12,
		padding: 12,
		backgroundColor: '#f0f8ff',
		borderRadius: 6,
	},
	infoTitle: {
		fontWeight: 'bold',
		marginBottom: 8,
	},
	userSection: {
		marginBottom: 20,
		padding: 16,
		backgroundColor: '#f8f9fa',
		borderRadius: 8,
		alignItems: 'center',
	},
	userName: {
		fontSize: 20,
		fontWeight: 'bold',
		marginBottom: 4,
	},
	userEmail: {
		fontSize: 16,
		color: '#666',
		marginBottom: 4,
	},
	userProvider: {
		fontSize: 14,
		color: '#999',
	},
});


