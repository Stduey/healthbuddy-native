import * as SQLite from "expo-sqlite";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  HealthProfile,
  ChatSession,
  DEFAULT_HEALTH_PROFILE,
} from "../types/health";

const ASYNC_STORAGE_KEYS = {
  PIN: "healthbuddy_pin",
  HEALTH_PROFILE: "healthbuddy_health_profile",
  CHAT_SESSION: "healthbuddy_chat_session",
};

const MIGRATION_FLAG = "healthbuddy_db_migrated_v1";

let _db: SQLite.SQLiteDatabase | null = null;

export async function getDB(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;
  _db = await SQLite.openDatabaseAsync("healthbuddy.db");
  await _db.execAsync(`
    CREATE TABLE IF NOT EXISTS health_profile (
      id INTEGER PRIMARY KEY NOT NULL,
      data TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS chat_sessions (
      id TEXT PRIMARY KEY NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY NOT NULL,
      session_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      timestamp INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);
  await _runMigration(_db);
  return _db;
}

async function _runMigration(db: SQLite.SQLiteDatabase): Promise<void> {
  const flagRow = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM meta WHERE key = ?",
    [MIGRATION_FLAG]
  );
  if (flagRow) return;

  // Migrate health profile
  try {
    const profileData = await AsyncStorage.getItem(
      ASYNC_STORAGE_KEYS.HEALTH_PROFILE
    );
    if (profileData) {
      const profile: HealthProfile = JSON.parse(profileData);
      await db.runAsync(
        "INSERT OR REPLACE INTO health_profile (id, data) VALUES (1, ?)",
        [JSON.stringify(profile)]
      );
      await AsyncStorage.removeItem(ASYNC_STORAGE_KEYS.HEALTH_PROFILE);
    }
  } catch (_) {
    // Non-fatal: migration best-effort
  }

  // Migrate chat session
  try {
    const sessionData = await AsyncStorage.getItem(
      ASYNC_STORAGE_KEYS.CHAT_SESSION
    );
    if (sessionData) {
      const session: ChatSession = JSON.parse(sessionData);
      await db.runAsync(
        "INSERT OR REPLACE INTO chat_sessions (id, created_at, updated_at) VALUES (?, ?, ?)",
        [session.id, session.createdAt, session.updatedAt]
      );
      for (const msg of session.messages) {
        await db.runAsync(
          "INSERT OR REPLACE INTO chat_messages (id, session_id, role, content, timestamp) VALUES (?, ?, ?, ?, ?)",
          [msg.id, session.id, msg.role, msg.content, msg.timestamp]
        );
      }
      await AsyncStorage.removeItem(ASYNC_STORAGE_KEYS.CHAT_SESSION);
    }
  } catch (_) {
    // Non-fatal: migration best-effort
  }

  // PIN migration is handled in storage.ts since it goes to SecureStore, not SQLite

  await db.runAsync("INSERT INTO meta (key, value) VALUES (?, ?)", [
    MIGRATION_FLAG,
    "1",
  ]);
}
