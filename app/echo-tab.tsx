import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, TextInput, Button, Platform } from 'react-native';
import { Text, View } from '@/components/Themed';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUiOverrides, setUiOverride, deleteUiOverride } from '@/lib/repos';

function isLocalhost(): boolean {
	// Web: check origin host. Native dev: allow in development only.
	if (Platform.OS === 'web') {
		try {
			const host = window.location.hostname;
			return host === 'localhost' || host === '127.0.0.1' || host === '::1';
		} catch { return false; }
	}
	const isDev = !!Constants.expoConfig?.extra || __DEV__;
	return isDev;
}

export default function EchoTab() {
	const allowed = isLocalhost();
	const qc = useQueryClient();
	const overrides = useQuery({ queryKey: ['ui_overrides'], queryFn: getUiOverrides, enabled: allowed });
	const save = useMutation({ mutationFn: ({ key, value }: { key: string, value: string }) => setUiOverride(key, value), onSuccess: () => qc.invalidateQueries({ queryKey: ['ui_overrides'] }) });
	const del = useMutation({ mutationFn: (key: string) => deleteUiOverride(key), onSuccess: () => qc.invalidateQueries({ queryKey: ['ui_overrides'] }) });

	const [keyName, setKeyName] = useState('brand.name');
	const [value, setValue] = useState('FarmMaster Pro');

	if (!allowed) {
		return (
			<View style={styles.blocked}>
				<Text style={styles.blockedTitle}>Restricted</Text>
				<Text>This admin tool is only available on localhost or in development builds.</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Echo Tab — Admin Overrides</Text>
			<Text style={styles.help}>Edit UI text/labels via key/value. Examples: brand.name, dashboard.banner, reports.title</Text>

			<View style={styles.row}>
				<TextInput placeholder="key (e.g. brand.name)" value={keyName} onChangeText={setKeyName} style={styles.input} />
				<TextInput placeholder="value" value={value} onChangeText={setValue} style={styles.input} />
			</View>
			<View style={styles.row}>
				<Button title={save.isPending ? 'Saving...' : 'Save'} onPress={() => save.mutate({ key: keyName.trim(), value })} />
				<Button title="Delete" color="#d9534f" onPress={() => del.mutate(keyName.trim())} />
			</View>

			<View style={styles.card}>
				<Text style={styles.cardTitle}>Current Overrides</Text>
				{overrides.data && Object.keys(overrides.data).length === 0 && <Text>None yet.</Text>}
				{overrides.data && Object.entries(overrides.data).map(([k, v]) => (
					<View key={k} style={styles.kvRow}>
						<Text style={styles.kvKey}>{k}</Text>
						<Text style={styles.kvVal}>{v as string}</Text>
					</View>
				))}
			</View>

			<View style={styles.card}>
				<Text style={styles.cardTitle}>Preview</Text>
				<Text>Brand: {(overrides.data?.['brand.name'] as string) || 'FarmMaster Pro'}</Text>
				<Text>Dashboard banner: {(overrides.data?.['dashboard.banner'] as string) || 'Welcome to your dashboard'}</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 16 },
	title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
	help: { color: '#666', marginBottom: 12 },
	row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
	input: { flex: 1, borderWidth: 1, borderColor: '#e5e5e5', padding: 10, borderRadius: 8, backgroundColor: '#fff' },
	card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#f0f0f0', marginBottom: 16 },
	cardTitle: { fontWeight: 'bold', marginBottom: 8 },
	kvRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f3f3f3' },
	kvKey: { fontWeight: '600' },
	kvVal: { color: '#333' },
	blocked: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
	blockedTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
});
