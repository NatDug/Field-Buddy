import * as SQLite from 'expo-sqlite';

let database: SQLite.SQLiteDatabase | null = null;

export function getDatabase(): SQLite.SQLiteDatabase {
	if (!database) {
		database = SQLite.openDatabase('field_buddy.db');
	}
	return database;
}

export async function initializeDatabase(): Promise<void> {
	const db = getDatabase();

	await executeSqlAsync(
		db,
		`CREATE TABLE IF NOT EXISTS profile (
			id INTEGER PRIMARY KEY NOT NULL,
			name TEXT,
			farm_name TEXT,
			location TEXT,
			created_at TEXT DEFAULT (datetime('now'))
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


