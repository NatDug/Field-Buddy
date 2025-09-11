import { executeAsync } from './db';

// Weather
export async function listThresholds() {
	const res = await executeAsync('SELECT * FROM weather_thresholds');
	return res.rows._array as any[];
}
export async function upsertThreshold(t: { id?: number; crop_id?: number; field?: string; source?: string; param: string; operator: string; value: number; recommendation?: string; }) {
	if (t.id) {
		await executeAsync('UPDATE weather_thresholds SET crop_id=?, field=?, source=?, param=?, operator=?, value=?, recommendation=? WHERE id=?', [t.crop_id ?? null, t.field ?? null, t.source ?? null, t.param, t.operator, t.value, t.recommendation ?? null, t.id]);
	} else {
		await executeAsync('INSERT INTO weather_thresholds (crop_id, field, source, param, operator, value, recommendation) VALUES (?, ?, ?, ?, ?, ?, ?)', [t.crop_id ?? null, t.field ?? null, t.source ?? null, t.param, t.operator, t.value, t.recommendation ?? null]);
	}
}
export async function logWeatherAlert(a: { source: string; type: string; severity: string; start_at?: string; end_at?: string; message: string; recommendation?: string; }) {
	await executeAsync('INSERT INTO weather_alerts (source, type, severity, start_at, end_at, message, recommendation) VALUES (?, ?, ?, ?, ?, ?, ?)', [a.source, a.type, a.severity, a.start_at ?? null, a.end_at ?? null, a.message, a.recommendation ?? null]);
}
export async function listWeatherAlerts() {
	const res = await executeAsync('SELECT * FROM weather_alerts ORDER BY created_at DESC');
	return res.rows._array as any[];
}

// Analytics
export async function addMetric(m: { metric: string; value: number; crop?: string; field?: string; season?: string; month?: number; }) {
	await executeAsync('INSERT INTO analytics_metrics (metric, value, crop, field, season, month) VALUES (?, ?, ?, ?, ?, ?)', [m.metric, m.value, m.crop ?? null, m.field ?? null, m.season ?? null, m.month ?? null]);
}
export async function listMetrics(filter?: { metric?: string; crop?: string; field?: string; season?: string; month?: number; }) {
	let sql = 'SELECT * FROM analytics_metrics WHERE 1=1';
	const params: any[] = [];
	if (filter?.metric) { sql += ' AND metric = ?'; params.push(filter.metric); }
	if (filter?.crop) { sql += ' AND crop = ?'; params.push(filter.crop); }
	if (filter?.field) { sql += ' AND field = ?'; params.push(filter.field); }
	if (filter?.season) { sql += ' AND season = ?'; params.push(filter.season); }
	if (filter?.month) { sql += ' AND month = ?'; params.push(filter.month); }
	sql += ' ORDER BY captured_at DESC';
	const res = await executeAsync(sql, params);
	return res.rows._array as any[];
}

// Sync scaffolding
export async function enqueue(entity: string, operation: string, payload: any) {
	await executeAsync('INSERT INTO sync_queue (entity, operation, payload) VALUES (?, ?, ?)', [entity, operation, JSON.stringify(payload)]);
}
export async function listQueue(status: string = 'pending') {
	const res = await executeAsync('SELECT * FROM sync_queue WHERE status = ? ORDER BY created_at ASC', [status]);
	return res.rows._array as any[];
}
export async function markQueue(id: number, status: 'pending' | 'synced' | 'failed') {
	await executeAsync('UPDATE sync_queue SET status = ?, attempts = attempts + 1 WHERE id = ?', [status, id]);
}
export async function addTombstone(entity: string, entityId: string) {
	await executeAsync('INSERT INTO tombstones (entity, entity_id) VALUES (?, ?)', [entity, entityId]);
}

// Crops
export async function listCrops() {
	const res = await executeAsync('SELECT * FROM crops ORDER BY created_at DESC');
	return res.rows._array as any[];
}

export async function addCrop(name: string, variety?: string) {
	await executeAsync('INSERT INTO crops (name, variety) VALUES (?, ?)', [name, variety ?? null]);
}

export async function deleteCrop(id: number) {
	await executeAsync('DELETE FROM crops WHERE id = ?', [id]);
}

// Tasks
export async function listTasks() {
	const res = await executeAsync('SELECT * FROM tasks ORDER BY created_at DESC');
	return res.rows._array as any[];
}

export async function addTask(title: string, description?: string) {
	await executeAsync('INSERT INTO tasks (title, description) VALUES (?, ?)', [title, description ?? null]);
}

export async function toggleTaskDone(id: number, done: boolean) {
	await executeAsync('UPDATE tasks SET status = ?, completed_at = CASE WHEN ? = 1 THEN datetime("now") ELSE NULL END WHERE id = ?', [done ? 'done' : 'pending', done ? 1 : 0, id]);
}

export async function deleteTask(id: number) {
	await executeAsync('DELETE FROM tasks WHERE id = ?', [id]);
}

// Task assignments
export async function assignTask(taskId: number, assigneeId: number) {
	await executeAsync('INSERT INTO task_assignments (task_id, assignee_id) VALUES (?, ?)', [taskId, assigneeId]);
}
export async function listAssignmentsForTask(taskId: number) {
	const res = await executeAsync('SELECT * FROM task_assignments WHERE task_id = ?', [taskId]);
	return res.rows._array as any[];
}

// Expenses
export async function listExpenses() {
	const res = await executeAsync('SELECT * FROM expenses ORDER BY incurred_on DESC NULLS LAST, created_at DESC');
	return res.rows._array as any[];
}

export async function addExpense(amount: number, category?: string, incurredOn?: string) {
	await executeAsync('INSERT INTO expenses (amount, category, incurred_on) VALUES (?, ?, ?)', [amount, category ?? null, incurredOn ?? null]);
}

export async function deleteExpense(id: number) {
	await executeAsync('DELETE FROM expenses WHERE id = ?', [id]);
}

// Budgets
export async function upsertBudget(month: number, year: number, category: string, plannedAmount: number) {
	await executeAsync('INSERT INTO budgets (period_month, period_year, category, planned_amount) VALUES (?, ?, ?, ?) ON CONFLICT(period_month, period_year, category) DO UPDATE SET planned_amount = excluded.planned_amount', [month, year, category, plannedAmount]);
}
export async function listBudgets(month: number, year: number) {
	const res = await executeAsync('SELECT * FROM budgets WHERE period_month = ? AND period_year = ? ORDER BY category', [month, year]);
	return res.rows._array as any[];
}

// Inventory
export async function listInventory() {
	const res = await executeAsync('SELECT * FROM inventory_items ORDER BY created_at DESC');
	return res.rows._array as any[];
}
export async function addInventory(item: { type?: string; name: string; sku?: string; unit?: string; quantity_on_hand?: number; reorder_point?: number; location?: string; supplier?: string; cost_per_unit?: number; expiry_date?: string; notes?: string; }) {
	await executeAsync('INSERT INTO inventory_items (type, name, sku, unit, quantity_on_hand, reorder_point, location, supplier, cost_per_unit, expiry_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [item.type ?? null, item.name, item.sku ?? null, item.unit ?? null, item.quantity_on_hand ?? 0, item.reorder_point ?? 0, item.location ?? null, item.supplier ?? null, item.cost_per_unit ?? null, item.expiry_date ?? null, item.notes ?? null]);
}
export async function adjustInventory(itemId: number, deltaQty: number, reason?: string) {
	await executeAsync('INSERT INTO inventory_adjustments (item_id, delta_qty, reason) VALUES (?, ?, ?)', [itemId, deltaQty, reason ?? null]);
	await executeAsync('UPDATE inventory_items SET quantity_on_hand = quantity_on_hand + ? WHERE id = ?', [deltaQty, itemId]);
}
export async function deleteInventory(itemId: number) {
	await executeAsync('DELETE FROM inventory_items WHERE id = ?', [itemId]);
}

// QuickBooks metadata (placeholder only)
export async function getQbMeta() {
	const res = await executeAsync('SELECT * FROM qb_meta LIMIT 1');
	return res.rows._array[0] || null;
}
export async function saveQbMeta(meta: { access_token?: string; refresh_token?: string; realm_id?: string; last_synced_at?: string; }) {
	const existing = await getQbMeta();
	if (existing) {
		await executeAsync('UPDATE qb_meta SET access_token = ?, refresh_token = ?, realm_id = ?, last_synced_at = ?', [meta.access_token ?? existing.access_token, meta.refresh_token ?? existing.refresh_token, meta.realm_id ?? existing.realm_id, meta.last_synced_at ?? existing.last_synced_at]);
	} else {
		await executeAsync('INSERT INTO qb_meta (access_token, refresh_token, realm_id, last_synced_at) VALUES (?, ?, ?, ?)', [meta.access_token ?? null, meta.refresh_token ?? null, meta.realm_id ?? null, meta.last_synced_at ?? null]);
	}
}

// Documents
export async function listDocuments() {
	const res = await executeAsync('SELECT * FROM documents ORDER BY uploaded_at DESC');
	return res.rows._array as any[];
}
export async function addDocument(doc: { title: string; type: string; tags?: string[]; file_uri: string; uploaded_by?: string; linked_crop_id?: number; linked_asset_id?: number; }) {
	const tags = (doc.tags || []).join(',');
	await executeAsync('INSERT INTO documents (title, type, tags, file_uri, uploaded_by, linked_crop_id, linked_asset_id) VALUES (?, ?, ?, ?, ?, ?, ?)', [doc.title, doc.type, tags, doc.file_uri, doc.uploaded_by ?? null, doc.linked_crop_id ?? null, doc.linked_asset_id ?? null]);
}
export async function deleteDocument(id: number) {
	await executeAsync('DELETE FROM documents WHERE id = ?', [id]);
}

// Team & roles
export async function listTeam() {
	const res = await executeAsync('SELECT * FROM team_members ORDER BY name');
	return res.rows._array as any[];
}
export async function addTeamMember(member: { name: string; email?: string; phone?: string; role: string; }) {
	await executeAsync('INSERT INTO team_members (name, email, phone, role) VALUES (?, ?, ?, ?)', [member.name, member.email ?? null, member.phone ?? null, member.role]);
}
export async function deleteTeamMember(id: number) {
	await executeAsync('DELETE FROM team_members WHERE id = ?', [id]);
}
export async function setPermission(memberId: number, page: string, canRead: boolean, canWrite: boolean, dataScope: string) {
	await executeAsync('INSERT INTO permissions (member_id, page, can_read, can_write, data_scope) VALUES (?, ?, ?, ?, ?) ON CONFLICT(member_id, page) DO UPDATE SET can_read = excluded.can_read, can_write = excluded.can_write, data_scope = excluded.data_scope', [memberId, page, canRead ? 1 : 0, canWrite ? 1 : 0, dataScope]);
}
export async function listPermissions(memberId: number) {
	const res = await executeAsync('SELECT * FROM permissions WHERE member_id = ?', [memberId]);
	return res.rows._array as any[];
}

// Profile/Farm Management
export async function getProfile(userId?: number) {
	if (!userId) {
		// Get current user's profile
		const res = await executeAsync('SELECT p.* FROM profile p JOIN users u ON p.user_id = u.id WHERE u.is_active = 1 LIMIT 1');
		return res.rows._array[0] || null;
	}
	
	const res = await executeAsync('SELECT * FROM profile WHERE user_id = ?', [userId]);
	return res.rows._array[0] || null;
}

export async function updateProfile(profile: {
	name?: string;
	farm_name?: string;
	location?: string;
	latitude?: number;
	longitude?: number;
	state?: string;
	county?: string;
	zip_code?: string;
	address?: string;
	farm_type?: string;
	efficiency_score?: number;
	usda_strata_id?: string;
}, userId?: number) {
	const existing = await getProfile(userId);
	
	if (existing) {
		// Update existing profile
		const fields = Object.keys(profile).filter(key => profile[key as keyof typeof profile] !== undefined);
		const values = fields.map(key => profile[key as keyof typeof profile]);
		const setClause = fields.map(field => `${field} = ?`).join(', ');
		
		await executeAsync(
			`UPDATE profile SET ${setClause} WHERE id = ?`,
			[...values, existing.id]
		);
	} else {
		// Create new profile - need to get current user ID
		if (!userId) {
			const userRes = await executeAsync('SELECT id FROM users WHERE is_active = 1 LIMIT 1');
			const user = userRes.rows._array[0];
			if (!user) throw new Error('No authenticated user found');
			userId = user.id;
		}
		
		const fields = ['user_id', ...Object.keys(profile).filter(key => profile[key as keyof typeof profile] !== undefined)];
		const values = [userId, ...fields.slice(1).map(key => profile[key as keyof typeof profile])];
		const placeholders = fields.map(() => '?').join(', ');
		
		await executeAsync(
			`INSERT INTO profile (${fields.join(', ')}) VALUES (${placeholders})`,
			values
		);
	}
}

// UI Overrides (admin)
export async function getUiOverrides() {
	const res = await executeAsync('SELECT key, value FROM ui_overrides');
	const rows = res.rows._array as { key: string, value: string }[];
	const map: Record<string, string> = {};
	rows.forEach(r => { map[r.key] = r.value; });
	return map;
}

export async function setUiOverride(key: string, value: string) {
	await executeAsync('INSERT INTO ui_overrides (key, value, updated_at) VALUES (?, ?, datetime("now")) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at', [key, value]);
}

export async function deleteUiOverride(key: string) {
	await executeAsync('DELETE FROM ui_overrides WHERE key = ?', [key]);
}


