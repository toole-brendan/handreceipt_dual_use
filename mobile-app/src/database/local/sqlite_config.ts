import SQLite from 'react-native-sqlite-storage';
import { Platform } from 'react-native';

export const DB_NAME = 'asset_tracker.db';

// Enable encryption for Android
const dbConfig = Platform.select({
  android: {
    name: DB_NAME,
    location: 'default',
    createFromLocation: 1,
    key: process.env.DB_ENCRYPTION_KEY // Will be used with SQLCipher
  },
  ios: {
    name: DB_NAME,
    location: 'Library',
    createFromLocation: 1
  }
});

export const initDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  try {
    SQLite.enablePromise(true);
    
    // Open or create database
    const db = await SQLite.openDatabase(dbConfig);
    
    // Run initial migrations
    await runMigrations(db);
    
    return db;
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};

const runMigrations = async (db: SQLite.SQLiteDatabase) => {
  // Will be implemented in initial_schema.ts
  const { migrations } = await import('./migrations/initial_schema');
  
  for (const migration of migrations) {
    await db.executeSql(migration);
  }
};

export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  return await SQLite.openDatabase(dbConfig);
};
