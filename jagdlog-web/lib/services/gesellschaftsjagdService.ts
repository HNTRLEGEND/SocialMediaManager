/**
 * GESELLSCHAFTSJAGD SERVICE - Web Version
 * Phase 6.2: Extended Features
 * HNTR LEGEND Pro
 */

import { 
  Gesellschaftsjagd, 
  GesellschaftsjagdSchema,
  Teilnehmer,
  TeilnehmerSchema,
  Standort,
  StandortSchema,
  StandortZuweisung,
  StandortZuweisungSchema,
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

/**
 * Teilnehmer aktualisieren
 */
export async function updateTeilnehmer(
  teilnehmerId: string,
  updates: Partial<Teilnehmer>,
  userId: string
): Promise<void> {
  const teilnehmer = getStoredTeilnehmer();
  const index = teilnehmer.findIndex(t => t.id === teilnehmerId);
  
  if (index === -1) {
    throw new Error('Teilnehmer nicht gefunden');
  }
  
  teilnehmer[index] = {
    ...teilnehmer[index],
    ...updates,
  };
  
  localStorage.setItem('jagd_teilnehmer', JSON.stringify(teilnehmer));
}

/**
 * Teilnehmer-Status aktualisieren
 */
export async function updateTeilnehmerStatus(
  teilnehmerId: string,
  status: 'eingeladen' | 'zugesagt' | 'abgesagt' | 'warteliste',
  kommentar?: string,
  userId?: string
): Promise<void> {
  const teilnehmer = getStoredTeilnehmer();
  const index = teilnehmer.findIndex(t => t.id === teilnehmerId);
  
  if (index === -1) {
    throw new Error('Teilnehmer nicht gefunden');
  }
  
  teilnehmer[index].anmeldung = {
    status,
    angemeldetAm: new Date(),
    kommentar,
  };
  
  localStorage.setItem('jagd_teilnehmer', JSON.stringify(teilnehmer));
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

/**
 * Standort aktualisieren
 */
export async function updateStandort(
  standortId: string,
  updates: Partial<Standort>,
  userId: string
): Promise<void> {
  const standorte = getStoredStandorte();
  const index = standorte.findIndex(s => s.id === standortId);
  
  if (index === -1) {
    throw new Error('Standort nicht gefunden');
  }
  
  standorte[index] = {
    ...standorte[index],
    ...updates,
  };
  
  localStorage.setItem('jagd_standorte', JSON.stringify(standorte));
}

/**
 * Standort löschen
 */
export async function deleteStandort(
  standortId: string,
  userId: string
): Promise<void> {
  const standorte = getStoredStandorte();
  const filtered = standorte.filter(s => s.id !== standortId);
  localStorage.setItem('jagd_standorte', JSON.stringify(filtered));
}

// ============================================================================
// STANDORT-ZUWEISUNG MANAGEMENT
// ============================================================================

/**
 * Standort einem Teilnehmer zuweisen
 */
export async function assignStandort(
  jagdId: string,
  standortId: string,
  teilnehmerId: string,
  zugewiesenVon: string,
  prioritaet: number = 1,
  notizen?: string
): Promise<StandortZuweisung> {
  const zuweisung: StandortZuweisung = {
    id: crypto.randomUUID(),
    jagdId,
    standortId,
    teilnehmerId,
    zugewiesenVon,
    zugewiesenAm: new Date(),
    prioritaet,
    bestaetigt: false,
    notizen,
  };
  
  // Validate
  const validated = StandortZuweisungSchema.parse(zuweisung);
  
  // Store
  const stored = getStoredZuweisungen();
  stored.push(validated);
  localStorage.setItem('jagd_standort_zuweisungen', JSON.stringify(stored));
  
  // Update Teilnehmer
  const teilnehmer = getStoredTeilnehmer();
  const teilnehmerIndex = teilnehmer.findIndex(t => t.id === teilnehmerId);
  if (teilnehmerIndex !== -1) {
    teilnehmer[teilnehmerIndex].zugewiesenerStandort = standortId;
    localStorage.setItem('jagd_teilnehmer', JSON.stringify(teilnehmer));
  }
  
  // Update Standort
  const standorte = getStoredStandorte();
  const standortIndex = standorte.findIndex(s => s.id === standortId);
  if (standortIndex !== -1) {
    if (!standorte[standortIndex].zugewiesenePersonen.includes(teilnehmerId)) {
      standorte[standortIndex].zugewiesenePersonen.push(teilnehmerId);
      standorte[standortIndex].status = 'besetzt';
      localStorage.setItem('jagd_standorte', JSON.stringify(standorte));
    }
  }
  
  return validated;
}

/**
 * Standort-Zuweisungen laden
 */
export async function getStandortZuweisungen(jagdId: string): Promise<StandortZuweisung[]> {
  const zuweisungen = getStoredZuweisungen();
  return zuweisungen.filter(z => z.jagdId === jagdId);
}

/**
 * Standort-Zuweisung bestätigen
 */
export async function confirmStandortZuweisung(
  zuweisungId: string,
  userId: string
): Promise<void> {
  const zuweisungen = getStoredZuweisungen();
  const index = zuweisungen.findIndex(z => z.id === zuweisungId);
  
  if (index === -1) {
    throw new Error('Zuweisung nicht gefunden');
  }
  
  zuweisungen[index].bestaetigt = true;
  zuweisungen[index].bestaetigtAm = new Date();
  
  localStorage.setItem('jagd_standort_zuweisungen', JSON.stringify(zuweisungen));
}

/**
 * Standort-Zuweisung aufheben
 */
export async function unassignStandort(
  zuweisungId: string,
  userId: string
): Promise<void> {
  const zuweisungen = getStoredZuweisungen();
  const zuweisung = zuweisungen.find(z => z.id === zuweisungId);
  
  if (!zuweisung) {
    throw new Error('Zuweisung nicht gefunden');
  }
  
  // Remove from zuweisungen
  const filtered = zuweisungen.filter(z => z.id !== zuweisungId);
  localStorage.setItem('jagd_standort_zuweisungen', JSON.stringify(filtered));
  
  // Update Teilnehmer
  const teilnehmer = getStoredTeilnehmer();
  const teilnehmerIndex = teilnehmer.findIndex(t => t.id === zuweisung.teilnehmerId);
  if (teilnehmerIndex !== -1) {
    teilnehmer[teilnehmerIndex].zugewiesenerStandort = undefined;
    localStorage.setItem('jagd_teilnehmer', JSON.stringify(teilnehmer));
  }
  
  // Update Standort
  const standorte = getStoredStandorte();
  const standortIndex = standorte.findIndex(s => s.id === zuweisung.standortId);
  if (standortIndex !== -1) {
    standorte[standortIndex].zugewiesenePersonen = standorte[standortIndex].zugewiesenePersonen.filter(
      (p: string) => p !== zuweisung.teilnehmerId
    );
    
    // Update status if no more assignments
    if (standorte[standortIndex].zugewiesenePersonen.length === 0) {
      standorte[standortIndex].status = 'verfuegbar';
    }
    
    localStorage.setItem('jagd_standorte', JSON.stringify(standorte));
  }
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
    if (!Array.isArray(parsed)) {
      console.error('Stored jagden is not an array');
      return [];
    }
    
    // Convert date strings back to Date objects with validation
    return parsed.map((j: any) => {
      try {
        return {
          ...j,
          datum: j.datum ? new Date(j.datum) : new Date(),
          erstelltAm: j.erstelltAm ? new Date(j.erstelltAm) : new Date(),
          aktualisiertAm: j.aktualisiertAm ? new Date(j.aktualisiertAm) : new Date(),
        };
      } catch (e) {
        console.error('Error parsing jagd dates:', e);
        // Return with default dates if parsing fails
        return {
          ...j,
          datum: new Date(),
          erstelltAm: new Date(),
          aktualisiertAm: new Date(),
        };
      }
    });
  } catch (e) {
    console.error('Error parsing jagden:', e);
    return [];
  }
}

function getStoredTeilnehmer(): Teilnehmer[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('jagd_teilnehmer');
  if (!stored) return [];
  
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error parsing teilnehmer:', e);
    return [];
  }
}

function getStoredStandorte(): Standort[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('jagd_standorte');
  if (!stored) return [];
  
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error parsing standorte:', e);
    return [];
  }
}

function getStoredZuweisungen(): StandortZuweisung[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('jagd_standort_zuweisungen');
  if (!stored) return [];
  
  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    
    // Convert date strings back to Date objects
    return parsed.map((z: any) => ({
      ...z,
      zugewiesenAm: z.zugewiesenAm ? new Date(z.zugewiesenAm) : new Date(),
      bestaetigtAm: z.bestaetigtAm ? new Date(z.bestaetigtAm) : undefined,
    }));
  } catch (e) {
    console.error('Error parsing zuweisungen:', e);
    return [];
  }
}
