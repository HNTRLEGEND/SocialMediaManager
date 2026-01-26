/**
 * GESELLSCHAFTSJAGD SERVICE - Web Version
 * Phase 6.1: Critical Fixes
 * HNTR LEGEND Pro
 */

import { 
  Gesellschaftsjagd, 
  GesellschaftsjagdSchema,
  Teilnehmer,
  TeilnehmerSchema,
  Standort,
  StandortSchema,
} from '@/lib/types/gesellschaftsjagd';

// ============================================================================
// JAGD MANAGEMENT
// ============================================================================

/**
 * Neue Gesellschaftsjagd erstellen
 * @param data - Jagd-Daten (ohne id, erstelltAm, etc.)
 * @param userId - ID des erstellenden Users
 * @param userName - Name des erstellenden Users
 */
export async function createGesellschaftsjagd(
  data: Omit<Gesellschaftsjagd, 'id' | 'erstelltAm' | 'aktualisiertAm' | 'organisatorId' | 'organisatorName' | 'erstellerId'>,
  userId: string,
  userName: string
): Promise<Gesellschaftsjagd> {
  const jagd: Gesellschaftsjagd = {
    ...data,
    id: crypto.randomUUID(),
    organisatorId: userId,
    organisatorName: userName,
    erstellerId: userId,
    erstelltAm: new Date(),
    aktualisiertAm: new Date(),
  };
  
  // Validate
  const validated = GesellschaftsjagdSchema.parse(jagd);
  
  // In MVP: Store in localStorage
  // Later: Send to API
  const stored = getStoredJagden();
  stored.push(validated);
  localStorage.setItem('gesellschaftsjagden', JSON.stringify(stored));
  
  return validated;
}

/**
 * Jagd laden
 */
export async function getGesellschaftsjagd(id: string): Promise<Gesellschaftsjagd | null> {
  const jagden = getStoredJagden();
  return jagden.find(j => j.id === id) || null;
}

/**
 * Alle Jagden für ein Revier
 */
export async function getJagdenForRevier(
  revierId: string, 
  userId: string
): Promise<Gesellschaftsjagd[]> {
  const jagden = getStoredJagden();
  return jagden.filter(j => 
    j.revierId === revierId && 
    (j.organisatorId === userId || j.erstellerId === userId)
  );
}

/**
 * Alle Jagden für einen User
 */
export async function getJagdenForUser(userId: string): Promise<Gesellschaftsjagd[]> {
  const jagden = getStoredJagden();
  return jagden.filter(j => 
    j.organisatorId === userId || j.erstellerId === userId
  );
}

/**
 * Jagd aktualisieren
 */
export async function updateGesellschaftsjagd(
  id: string,
  updates: Partial<Gesellschaftsjagd>,
  userId: string
): Promise<void> {
  const jagden = getStoredJagden();
  const index = jagden.findIndex(j => j.id === id);
  
  if (index === -1) {
    throw new Error('Jagd nicht gefunden');
  }
  
  // Check permissions
  if (jagden[index].organisatorId !== userId && jagden[index].erstellerId !== userId) {
    throw new Error('Keine Berechtigung');
  }
  
  jagden[index] = {
    ...jagden[index],
    ...updates,
    aktualisiertAm: new Date(),
  };
  
  localStorage.setItem('gesellschaftsjagden', JSON.stringify(jagden));
}

/**
 * Jagd löschen
 */
export async function deleteGesellschaftsjagd(id: string, userId: string): Promise<void> {
  const jagden = getStoredJagden();
  const jagd = jagden.find(j => j.id === id);
  
  if (!jagd) {
    throw new Error('Jagd nicht gefunden');
  }
  
  // Check permissions
  if (jagd.organisatorId !== userId && jagd.erstellerId !== userId) {
    throw new Error('Keine Berechtigung');
  }
  
  const filtered = jagden.filter(j => j.id !== id);
  localStorage.setItem('gesellschaftsjagden', JSON.stringify(filtered));
}

// ============================================================================
// TEILNEHMER MANAGEMENT
// ============================================================================

/**
 * Teilnehmer hinzufügen
 */
export async function addTeilnehmer(
  teilnehmer: Omit<Teilnehmer, 'id'>,
  userId: string
): Promise<Teilnehmer> {
  // Validate
  const validated = TeilnehmerSchema.parse({
    ...teilnehmer,
    id: crypto.randomUUID(),
  });
  
  // Store
  const stored = getStoredTeilnehmer();
  stored.push(validated);
  localStorage.setItem('jagd_teilnehmer', JSON.stringify(stored));
  
  return validated;
}

/**
 * Teilnehmer laden
 */
export async function getTeilnehmer(jagdId: string): Promise<Teilnehmer[]> {
  const teilnehmer = getStoredTeilnehmer();
  return teilnehmer.filter(t => t.jagdId === jagdId);
}

/**
 * Teilnehmer entfernen
 */
export async function removeTeilnehmer(
  teilnehmerId: string,
  userId: string
): Promise<void> {
  const teilnehmer = getStoredTeilnehmer();
  const filtered = teilnehmer.filter(t => t.id !== teilnehmerId);
  localStorage.setItem('jagd_teilnehmer', JSON.stringify(filtered));
}

// ============================================================================
// STANDORT MANAGEMENT
// ============================================================================

/**
 * Standort erstellen
 */
export async function createStandort(
  standort: Omit<Standort, 'id'>,
  userId: string
): Promise<Standort> {
  // Validate
  const validated = StandortSchema.parse({
    ...standort,
    id: crypto.randomUUID(),
  });
  
  // Store
  const stored = getStoredStandorte();
  stored.push(validated);
  localStorage.setItem('jagd_standorte', JSON.stringify(stored));
  
  return validated;
}

/**
 * Standorte laden
 */
export async function getStandorte(jagdId: string): Promise<Standort[]> {
  const standorte = getStoredStandorte();
  return standorte.filter(s => s.jagdId === jagdId);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getStoredJagden(): Gesellschaftsjagd[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('gesellschaftsjagden');
  if (!stored) return [];
  
  try {
    const parsed = JSON.parse(stored);
    // Convert date strings back to Date objects
    return parsed.map((j: any) => ({
      ...j,
      datum: new Date(j.datum),
      erstelltAm: new Date(j.erstelltAm),
      aktualisiertAm: new Date(j.aktualisiertAm),
    }));
  } catch (e) {
    console.error('Error parsing jagden:', e);
    return [];
  }
}

function getStoredTeilnehmer(): Teilnehmer[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('jagd_teilnehmer');
  return stored ? JSON.parse(stored) : [];
}

function getStoredStandorte(): Standort[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('jagd_standorte');
  return stored ? JSON.parse(stored) : [];
}
