import { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { StyleSheet, Button } from 'react-native';
import { Text, View } from '@/components/Themed';

Notifications.setNotificationHandler({
	handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: false, shouldSetBadge: false }),
});

export default function AlertsScreen() {
	const [permission, setPermission] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');

	useEffect(() => {
		Notifications.getPermissionsAsync().then(({ status }) => setPermission(status));
	}, []);

	async function requestAndSchedule() {
		const { status } = await Notifications.requestPermissionsAsync();
		setPermission(status);
		if (status !== 'granted') return;
		await Notifications.scheduleNotificationAsync({
			content: {
				title: 'Weather alert (demo)',
				body: 'Frost risk tonight. Consider protecting tender crops.',
			},
			trigger: null,
		});
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Alerts</Text>
			<Text>Weather notifications prototype.</Text>
			<Button title={permission === 'granted' ? 'Send test alert' : 'Enable notifications'} onPress={requestAndSchedule} />
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


