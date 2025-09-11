import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { getSimpleDatabase, isWebPlatform, SimpleDatabase } from './db-simple';

let database: SQLite.SQLiteDatabase | null = null;
let webDatabase: SimpleDatabase | null = null;

export function getDatabase(): SQLite.SQLiteDatabase | SimpleDatabase {
	if (isWebPlatform()) {
		if (!webDatabase) {
			webDatabase = getSimpleDatabase();
		}
		return webDatabase;
	} else {
		if (!database) {
			database = SQLite.openDatabase('agriden.db');
		}
		return database;
	}
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

	// Inventory items
	await executeSqlAsync(
		db,
		`CREATE TABLE IF NOT EXISTS inventory_items (
			id INTEGER PRIMARY KEY NOT NULL,
			type TEXT, -- seed|fertilizer|equipment|other
			name TEXT NOT NULL,
			sku TEXT,
			unit TEXT,
			quantity_on_hand REAL DEFAULT 0,
			reorder_point REAL DEFAULT 0,
			location TEXT,
			supplier TEXT,
			cost_per_unit REAL,
			expiry_date TEXT,
			notes TEXT,
			created_at TEXT DEFAULT (datetime('now'))
		)`
	);

	await executeSqlAsync(
		db,
		`CREATE TABLE IF NOT EXISTS inventory_adjustments (
			id INTEGER PRIMARY KEY NOT NULL,
			item_id INTEGER NOT NULL,
			delta_qty REAL NOT NULL,
			reason TEXT,
			created_at TEXT DEFAULT (datetime('now')),
			FOREIGN KEY (item_id) REFERENCES inventory_items(id)
		)`
	);

	// Budgets for expenses
	await executeSqlAsync(
		db,
		`CREATE TABLE IF NOT EXISTS budgets (
			id INTEGER PRIMARY KEY NOT NULL,
			period_month INTEGER,
			period_year INTEGER,
			category TEXT,
			planned_amount REAL DEFAULT 0,
			actual_amount REAL DEFAULT 0,
			UNIQUE(period_month, period_year, category)
		)`
	);

	// QuickBooks connection metadata (placeholder)
	await executeSqlAsync(
		db,
		`CREATE TABLE IF NOT EXISTS qb_meta (
			id INTEGER PRIMARY KEY NOT NULL,
			access_token TEXT,
			refresh_token TEXT,
			realm_id TEXT,
			last_synced_at TEXT
		)`
	);

	// Documents
	await executeSqlAsync(
		db,
		`CREATE TABLE IF NOT EXISTS documents (
			id INTEGER PRIMARY KEY NOT NULL,
			title TEXT,
			type TEXT, -- pdf|image|other
			tags TEXT, -- comma-separated
			file_uri TEXT,
			uploaded_by TEXT,
			uploaded_at TEXT DEFAULT (datetime('now')),
			linked_crop_id INTEGER,
			linked_asset_id INTEGER
		)`
	);

	// Team & roles
	await executeSqlAsync(
		db,
		`CREATE TABLE IF NOT EXISTS team_members (
			id INTEGER PRIMARY KEY NOT NULL,
			name TEXT,
			email TEXT,
			phone TEXT,
			role TEXT -- admin|manager|worker|viewer
		)`
	);

	await executeSqlAsync(
		db,
		`CREATE TABLE IF NOT EXISTS permissions (
			id INTEGER PRIMARY KEY NOT NULL,
			member_id INTEGER,
			page TEXT,
			can_read INTEGER DEFAULT 1,
			can_write INTEGER DEFAULT 0,
			data_scope TEXT DEFAULT 'farm-wide', -- own|farm-wide
			FOREIGN KEY (member_id) REFERENCES team_members(id)
		)`
	);

	await executeSqlAsync(
		db,
		`CREATE TABLE IF NOT EXISTS task_assignments (
			id INTEGER PRIMARY KEY NOT NULL,
			task_id INTEGER,
			assignee_id INTEGER,
			status TEXT DEFAULT 'assigned',
			created_at TEXT DEFAULT (datetime('now')),
			FOREIGN KEY (task_id) REFERENCES tasks(id),
			FOREIGN KEY (assignee_id) REFERENCES team_members(id)
		)`
	);

	// Weather thresholds and alerts
	await executeSqlAsync(
		db,
		`CREATE TABLE IF NOT EXISTS weather_thresholds (
			id INTEGER PRIMARY KEY NOT NULL,
			crop_id INTEGER,
			field TEXT,
			source TEXT, -- open-meteo|noaa
			param TEXT, -- temperature, rainfall, wind, frost, etc.
			operator TEXT, -- gt|lt|gte|lte
			value REAL,
			recommendation TEXT
		)`
	);

	await executeSqlAsync(
		db,
		`CREATE TABLE IF NOT EXISTS weather_alerts (
			id INTEGER PRIMARY KEY NOT NULL,
			source TEXT,
			type TEXT,
			severity TEXT,
			start_at TEXT,
			end_at TEXT,
			message TEXT,
			recommendation TEXT,
			created_at TEXT DEFAULT (datetime('now'))
		)`
	);

	// Analytics metrics storage
	await executeSqlAsync(
		db,
		`CREATE TABLE IF NOT EXISTS analytics_metrics (
			id INTEGER PRIMARY KEY NOT NULL,
			metric TEXT, -- yieldPerAcre, costPerAcre, etc.
			value REAL,
			crop TEXT,
			field TEXT,
			season TEXT,
			month INTEGER,
			captured_at TEXT DEFAULT (datetime('now'))
		)`
	);

	// Sync scaffolding
	await executeSqlAsync(
		db,
		`CREATE TABLE IF NOT EXISTS sync_meta (
			id INTEGER PRIMARY KEY NOT NULL,
			client_uuid TEXT,
			last_updated_at TEXT
		)`
	);

	await executeSqlAsync(
		db,
		`CREATE TABLE IF NOT EXISTS sync_queue (
			id INTEGER PRIMARY KEY NOT NULL,
			entity TEXT,
			operation TEXT, -- insert|update|delete
			payload TEXT,
			status TEXT DEFAULT 'pending', -- pending|synced|failed
			attempts INTEGER DEFAULT 0,
			created_at TEXT DEFAULT (datetime('now'))
		)`
	);

	await executeSqlAsync(
		db,
		`CREATE TABLE IF NOT EXISTS tombstones (
			id INTEGER PRIMARY KEY NOT NULL,
			entity TEXT,
			entity_id TEXT,
			deleted_at TEXT DEFAULT (datetime('now'))
		)`
	);

	// UI overrides for admin-controlled text/labels/etc
	await executeSqlAsync(
		db,
		`CREATE TABLE IF NOT EXISTS ui_overrides (
			key TEXT PRIMARY KEY,
			value TEXT,
			updated_at TEXT DEFAULT (datetime('now'))
		)`
	);
}

function executeSqlAsync(db: SQLite.SQLiteDatabase | SimpleDatabase, sql: string, params: any[] = []): Promise<void> {
	if (isWebPlatform()) {
		// Use web database implementation
		return (db as SimpleDatabase).executeSql(sql, params).then(() => {});
	} else {
		// Use SQLite implementation
		return new Promise((resolve, reject) => {
			(db as SQLite.SQLiteDatabase).transaction(tx => {
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
}

export function executeAsync(sql: string, params: any[] = []): Promise<any> {
	const db = getDatabase();
	
	if (isWebPlatform()) {
		// Use simple database implementation for web
		return (db as SimpleDatabase).executeSql(sql, params);
	} else {
		// Use SQLite implementation for mobile
		return new Promise((resolve, reject) => {
			(db as SQLite.SQLiteDatabase).transaction(tx => {
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
}


