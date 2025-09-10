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
export async function getProfile() {
	const res = await executeAsync('SELECT * FROM profile LIMIT 1');
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
}) {
	const existing = await getProfile();
	
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
		// Create new profile
		const fields = Object.keys(profile).filter(key => profile[key as keyof typeof profile] !== undefined);
		const values = fields.map(key => profile[key as keyof typeof profile]);
		const placeholders = fields.map(() => '?').join(', ');
		
		await executeAsync(
			`INSERT INTO profile (${fields.join(', ')}) VALUES (${placeholders})`,
			values
		);
	}
}


