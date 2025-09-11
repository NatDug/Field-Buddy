import { executeAsync } from './db';

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


