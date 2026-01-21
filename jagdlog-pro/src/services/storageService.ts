import AsyncStorage from '@react-native-async-storage/async-storage';
import { JagdEintrag } from '../types';

const STORAGE_KEY = 'jagdlog_entries';

function serialize(entries: JagdEintrag[]) {
  return JSON.stringify(
    entries.map((entry) => ({
      ...entry,
      datum: entry.datum.toISOString(),
    })),
  );
}

function deserialize(value: string): JagdEintrag[] {
  const parsed = JSON.parse(value) as Array<Omit<JagdEintrag, 'datum'> & { datum: string }>;
  return parsed.map((entry) => ({
    ...entry,
    datum: new Date(entry.datum),
  }));
}

export async function getEntries(): Promise<JagdEintrag[]> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }
    return deserialize(stored);
  } catch (error) {
    console.warn('AsyncStorage Lesen fehlgeschlagen', error);
    return [];
  }
}

export async function saveEntry(entry: JagdEintrag) {
  try {
    const entries = await getEntries();
    const updated = [entry, ...entries];
    await AsyncStorage.setItem(STORAGE_KEY, serialize(updated));
  } catch (error) {
    console.warn('AsyncStorage Speichern fehlgeschlagen', error);
  }
}

export async function updateEntry(id: string, entry: JagdEintrag) {
  try {
    const entries = await getEntries();
    const updated = entries.map((item) => (item.id === id ? entry : item));
    await AsyncStorage.setItem(STORAGE_KEY, serialize(updated));
  } catch (error) {
    console.warn('AsyncStorage Update fehlgeschlagen', error);
  }
}

export async function deleteEntry(id: string) {
  try {
    const entries = await getEntries();
    const updated = entries.filter((item) => item.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, serialize(updated));
  } catch (error) {
    console.warn('AsyncStorage Löschen fehlgeschlagen', error);
  }
}
