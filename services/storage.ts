import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  HealthProfile,
  ChatSession,
  ChatMessage,
  DEFAULT_HEALTH_PROFILE,
} from "../types/health";
import { getDB } from "./db";

const SECURE_KEYS = {
  PIN: "healthbuddy_pin",
};

const ASYNC_KEYS = {
  LANGUAGE: "healthbuddy_language",
  // Legacy PIN key checked once for migration
  LEGACY_PIN: "healthbuddy_pin",
};

// PIN — stored in SecureStore; migrates from AsyncStorage on first read
export async function savePin(pin: string): Promise<void> {
  await SecureStore.setItemAsync(SECURE_KEYS.PIN, pin);
}

export async function getPin(): Promise<string | null> {
  let pin = await SecureStore.getItemAsync(SECURE_KEYS.PIN);
  if (pin === null) {
    // One-time migration from AsyncStorage
    const legacy = await AsyncStorage.getItem(ASYNC_KEYS.LEGACY_PIN);
    if (legacy !== null) {
      await SecureStore.setItemAsync(SECURE_KEYS.PIN, legacy);
      await AsyncStorage.removeItem(ASYNC_KEYS.LEGACY_PIN);
      return legacy;
    }
  }
  return pin;
}

export async function verifyPin(pin: string): Promise<boolean> {
  const stored = await getPin();
  if (stored === null || stored === undefined) {
    // First time — save this PIN
    await savePin(pin);
    return true;
  }
  return stored === pin;
}

// Health Profile — stored in SQLite
export async function getHealthProfile(): Promise<HealthProfile> {
  const db = await getDB();
  const row = await db.getFirstAsync<{ data: string }>(
    "SELECT data FROM health_profile WHERE id = 1"
  );
  if (row) {
    return JSON.parse(row.data) as HealthProfile;
  }
  return { ...DEFAULT_HEALTH_PROFILE };
}

export async function saveHealthProfile(
  profile: HealthProfile
): Promise<void> {
  const db = await getDB();
  await db.runAsync(
    "INSERT OR REPLACE INTO health_profile (id, data) VALUES (1, ?)",
    [JSON.stringify(profile)]
  );
}

export async function updateHealthProfile(
  updates: Partial<HealthProfile>
): Promise<HealthProfile> {
  const current = await getHealthProfile();
  const updated = { ...current, ...updates };
  await saveHealthProfile(updated);
  return updated;
}

// Chat Session — stored in SQLite
export async function getChatSession(): Promise<ChatSession | null> {
  const db = await getDB();
  const session = await db.getFirstAsync<{
    id: string;
    created_at: number;
    updated_at: number;
  }>("SELECT id, created_at, updated_at FROM chat_sessions ORDER BY created_at DESC LIMIT 1");
  if (!session) return null;

  const rows = await db.getAllAsync<{
    id: string;
    role: string;
    content: string;
    timestamp: number;
  }>(
    "SELECT id, role, content, timestamp FROM chat_messages WHERE session_id = ? ORDER BY timestamp ASC",
    [session.id]
  );

  return {
    id: session.id,
    createdAt: session.created_at,
    updatedAt: session.updated_at,
    messages: rows.map((r) => ({
      id: r.id,
      role: r.role as ChatMessage["role"],
      content: r.content,
      timestamp: r.timestamp,
    })),
  };
}

export async function saveChatSession(session: ChatSession): Promise<void> {
  const db = await getDB();
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
}

export async function addMessageToSession(
  message: ChatMessage
): Promise<ChatSession> {
  let session = await getChatSession();
  if (session === null) {
    session = {
      id: Date.now().toString(),
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const db = await getDB();
    await db.runAsync(
      "INSERT OR REPLACE INTO chat_sessions (id, created_at, updated_at) VALUES (?, ?, ?)",
      [session.id, session.createdAt, session.updatedAt]
    );
  }
  const db = await getDB();
  await db.runAsync(
    "INSERT OR REPLACE INTO chat_messages (id, session_id, role, content, timestamp) VALUES (?, ?, ?, ?, ?)",
    [message.id, session.id, message.role, message.content, message.timestamp]
  );
  await db.runAsync(
    "UPDATE chat_sessions SET updated_at = ? WHERE id = ?",
    [Date.now(), session.id]
  );
  session.messages.push(message);
  session.updatedAt = Date.now();
  return session;
}

export async function clearChatSession(): Promise<void> {
  const db = await getDB();
  const session = await db.getFirstAsync<{ id: string }>(
    "SELECT id FROM chat_sessions ORDER BY created_at DESC LIMIT 1"
  );
  if (session) {
    await db.runAsync("DELETE FROM chat_messages WHERE session_id = ?", [
      session.id,
    ]);
    await db.runAsync("DELETE FROM chat_sessions WHERE id = ?", [session.id]);
  }
}

// Language — remains in AsyncStorage (not sensitive, small)
export async function getLanguage(): Promise<string> {
  return (await AsyncStorage.getItem(ASYNC_KEYS.LANGUAGE)) || "en";
}

export async function saveLanguage(lang: string): Promise<void> {
  await AsyncStorage.setItem(ASYNC_KEYS.LANGUAGE, lang);
}
