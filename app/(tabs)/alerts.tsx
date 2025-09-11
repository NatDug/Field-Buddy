import { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { StyleSheet, Button, TextInput, Picker } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listThresholds, upsertThreshold, listWeatherAlerts } from '@/lib/repos';

Notifications.setNotificationHandler({
	handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: false, shouldSetBadge: false }),
});

export default function AlertsScreen() {
	const qc = useQueryClient();
	const [source, setSource] = useState<'open-meteo' | 'noaa'>('open-meteo');
	const [param, setParam] = useState('temperature');
	const [operator, setOperator] = useState('lt');
	const [value, setValue] = useState('0');
	const [recommendation, setRecommendation] = useState('Protect tender crops');

	const thresholds = useQuery({ queryKey: ['thresholds'], queryFn: listThresholds });
	const alerts = useQuery({ queryKey: ['wx_alerts'], queryFn: listWeatherAlerts });
	const save = useMutation({ mutationFn: () => upsertThreshold({ source, param, operator, value: parseFloat(value) || 0, recommendation }), onSuccess: () => qc.invalidateQueries({ queryKey: ['thresholds'] }) });

	async function requestNotif() {
		const { status } = await Notifications.requestPermissionsAsync();
		if (status !== 'granted') return;
		await Notifications.scheduleNotificationAsync({
			content: { title: 'Weather alert (demo)', body: 'Frost risk tonight. Consider protecting tender crops.' },
			trigger: null,
		});
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Weather & Alerts</Text>

			<View style={styles.card}>
				<Text style={styles.cardTitle}>Source</Text>
				<TextInput value={source} onChangeText={(t) => setSource(t as any)} style={styles.input} />
				<Text style={styles.cardTitle}>Threshold</Text>
				<View style={styles.row}>
					<TextInput placeholder="param (e.g., temperature)" value={param} onChangeText={setParam} style={styles.input} />
					<TextInput placeholder="operator (lt|gt|lte|gte)" value={operator} onChangeText={setOperator} style={styles.input} />
					<TextInput placeholder="value" keyboardType="decimal-pad" value={value} onChangeText={setValue} style={styles.input} />
				</View>
				<TextInput placeholder="recommendation" value={recommendation} onChangeText={setRecommendation} style={styles.input} />
				<Button title={save.isPending ? 'Saving…' : 'Save'} onPress={() => save.mutate()} />
			</View>

			<View style={styles.card}>
				<Text style={styles.cardTitle}>Saved thresholds</Text>
				{(thresholds.data || []).map((t: any) => (
					<Text key={t.id}>{t.source} • {t.param} {t.operator} {t.value} → {t.recommendation}</Text>
				))}
			</View>

			<View style={styles.card}>
				<Text style={styles.cardTitle}>Recent alerts</Text>
				{(alerts.data || []).map((a: any) => (
					<Text key={a.id}>{a.severity} • {a.type}: {a.message}</Text>
				))}
				<Button title="Send test notification" onPress={requestNotif} />
			</View>
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
	row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
	input: { flex: 1, borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 6, marginBottom: 12 },
	card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#f0f0f0', marginBottom: 16 },
	cardTitle: { fontWeight: 'bold', marginBottom: 6 },
});


