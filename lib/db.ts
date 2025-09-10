import * as SQLite from 'expo-sqlite';

let database: SQLite.SQLiteDatabase | null = null;

export function getDatabase(): SQLite.SQLiteDatabase {
	if (!database) {
		database = SQLite.openDatabase('agriden.db');
	}
	return database;
}

export async function initializeDatabase(): Promise<void> {
	const db = getDatabase();

	await executeSqlAsync(
		db,
		`CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY NOT NULL,
			email TEXT UNIQUE,
			phone TEXT UNIQUE,
			name TEXT NOT NULL,
			provider TEXT, -- 'google', 'apple', 'microsoft', 'email'
			provider_id TEXT,
			avatar_url TEXT,
			is_active INTEGER DEFAULT 1,
			created_at TEXT DEFAULT (datetime('now')),
			updated_at TEXT DEFAULT (datetime('now'))
		)`
	);

	await executeSqlAsync(
		db,
		`CREATE TABLE IF NOT EXISTS profile (
			id INTEGER PRIMARY KEY NOT NULL,
			user_id INTEGER,
			name TEXT,
			farm_name TEXT,
			location TEXT,
			latitude REAL,
			longitude REAL,
			state TEXT,
			county TEXT,
			zip_code TEXT,
			address TEXT,
			farm_type TEXT,
			efficiency_score REAL,
			usda_strata_id TEXT,
			created_at TEXT DEFAULT (datetime('now')),
			FOREIGN KEY (user_id) REFERENCES users(id)
		)`
	);

	await executeSqlAsync(
		db,
		`CREATE TABLE IF NOT EXISTS crops (
			id INTEGER PRIMARY KEY NOT NULL,
			name TEXT NOT NULL,
			variety TEXT,
			acreage REAL,
			season TEXT,
			notes TEXT,
			created_at TEXT DEFAULT (datetime('now'))
		)`
	);

	await executeSqlAsync(
		db,
		`CREATE TABLE IF NOT EXISTS tasks (
			id INTEGER PRIMARY KEY NOT NULL,
			crop_id INTEGER,
			title TEXT NOT NULL,
			description TEXT,
			status TEXT DEFAULT 'pending',
			assigned_to TEXT,
			scheduled_for TEXT,
			completed_at TEXT,
			created_at TEXT DEFAULT (datetime('now')),
			FOREIGN KEY (crop_id) REFERENCES crops(id)
		)`
	);

	await executeSqlAsync(
		db,
		`CREATE TABLE IF NOT EXISTS expenses (
			id INTEGER PRIMARY KEY NOT NULL,
			crop_id INTEGER,
			category TEXT,
			amount REAL NOT NULL,
			currency TEXT DEFAULT 'USD',
			incurred_on TEXT,
			notes TEXT,
			created_at TEXT DEFAULT (datetime('now')),
			FOREIGN KEY (crop_id) REFERENCES crops(id)
		)`
	);
}

function executeSqlAsync(db: SQLite.SQLiteDatabase, sql: string, params: any[] = []): Promise<void> {
	return new Promise((resolve, reject) => {
		db.transaction(tx => {
			tx.executeSql(
				sql,
				params,
				() => resolve(),
				(_tx, error) => {
					reject(error);
					return false;
				}
			);
		});
	});
}

export function executeAsync(sql: string, params: any[] = []): Promise<SQLite.SQLResultSet> {
	const db = getDatabase();
	return new Promise((resolve, reject) => {
		db.transaction(tx => {
			tx.executeSql(
				sql,
				params,
				(_tx, result) => resolve(result),
				(_tx, error) => {
					reject(error);
					return false;
				}
			);
		});
	});
}


