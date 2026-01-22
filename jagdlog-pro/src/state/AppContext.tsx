/**
 * HNTR LEGEND Pro - App Context
 * Globaler App-State (aktives Revier, Einstellungen, etc.)
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Revier, Einstellungen, Plan, RevierMitglied } from '../types';
import { getReviere, saveRevier as saveRevierDB, getRevier } from '../services/storageService';
import { getDatabase } from '../data/db';
import { getCurrentPlan, setCurrentPlan } from '../services/featureFlagService';

// Storage Keys
const AKTIVES_REVIER_KEY = '@jagdlog_aktives_revier';
const BUNDESLAND_KEY = '@jagdlog_bundesland';

// Context Interface
interface AppContextType {
  // Datenbank-Status
  isDbReady: boolean;

  // Reviere
  reviere: Revier[];
  aktivesRevier: Revier | null;
  setAktivesRevier: (revier: Revier | null) => void;
  ladeReviere: () => Promise<void>;
  erstelleRevier: (name: string, bundesland: string) => Promise<Revier>;

  // Plan
  aktuellerPlan: Plan;
  setzePlan: (plan: Plan) => Promise<void>;

  // Einstellungen
  bundesland: string;
  setzeBundesland: (bundesland: string) => void;

  // Lade-Status
  isLoading: boolean;
}

// Default Context
const AppContext = createContext<AppContextType>({
  isDbReady: false,
  reviere: [],
  aktivesRevier: null,
  setAktivesRevier: () => {},
  ladeReviere: async () => {},
  erstelleRevier: async () => ({} as Revier),
  aktuellerPlan: 'revier_m',
  setzePlan: async () => {},
  bundesland: 'nordrhein-westfalen',
  setzeBundesland: () => {},
  isLoading: true,
});

// Hook
export const useApp = () => useContext(AppContext);

// Provider Props
interface AppProviderProps {
  children: ReactNode;
}

/**
 * App Provider Component
 */
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [isDbReady, setIsDbReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [reviere, setReviere] = useState<Revier[]>([]);
  const [aktivesRevier, setAktivesRevierState] = useState<Revier | null>(null);
  const [aktuellerPlan, setAktuellerPlan] = useState<Plan>('revier_m');
  const [bundesland, setBundeslandState] = useState('nordrhein-westfalen');

  // Datenbank initialisieren
  useEffect(() => {
    const initDb = async () => {
      try {
        console.log('[App] Initialisiere Datenbank...');
        await getDatabase();
        setIsDbReady(true);
        console.log('[App] Datenbank bereit');
      } catch (error) {
        console.error('[App] Datenbankfehler:', error);
      }
    };

    initDb();
  }, []);

  // Einstellungen und Daten laden wenn DB bereit
  useEffect(() => {
    if (!isDbReady) return;

    const loadData = async () => {
      try {
        setIsLoading(true);

        // Plan laden
        const plan = await getCurrentPlan();
        setAktuellerPlan(plan);

        // Bundesland laden
        const gespeichertesBundesland = await AsyncStorage.getItem(BUNDESLAND_KEY);
        if (gespeichertesBundesland) {
          setBundeslandState(gespeichertesBundesland);
        }

        // Reviere laden
        const alleReviere = await getReviere();
        setReviere(alleReviere);

        // Aktives Revier laden
        const aktivesRevierId = await AsyncStorage.getItem(AKTIVES_REVIER_KEY);
        if (aktivesRevierId && alleReviere.length > 0) {
          const revier = alleReviere.find((r) => r.id === aktivesRevierId) || alleReviere[0];
          setAktivesRevierState(revier);
        } else if (alleReviere.length > 0) {
          setAktivesRevierState(alleReviere[0]);
        }

        console.log('[App] Daten geladen:', alleReviere.length, 'Reviere');
      } catch (error) {
        console.error('[App] Fehler beim Laden:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isDbReady]);

  // Aktives Revier setzen und speichern
  const setAktivesRevier = useCallback(async (revier: Revier | null) => {
    setAktivesRevierState(revier);
    if (revier) {
      await AsyncStorage.setItem(AKTIVES_REVIER_KEY, revier.id);
    } else {
      await AsyncStorage.removeItem(AKTIVES_REVIER_KEY);
    }
  }, []);

  // Reviere neu laden
  const ladeReviere = useCallback(async () => {
    const alleReviere = await getReviere();
    setReviere(alleReviere);
  }, []);

  // Neues Revier erstellen
  const erstelleRevier = useCallback(async (name: string, bundeslandParam: string): Promise<Revier> => {
    const id = await saveRevierDB({
      name,
      bundesland: bundeslandParam,
      plan: aktuellerPlan,
    });

    const neuesRevier = await getRevier(id);
    if (!neuesRevier) {
      throw new Error('Revier konnte nicht erstellt werden');
    }

    // Liste aktualisieren
    setReviere((prev) => [...prev, neuesRevier]);

    // Als aktives Revier setzen wenn erstes
    if (reviere.length === 0) {
      await setAktivesRevier(neuesRevier);
    }

    return neuesRevier;
  }, [aktuellerPlan, reviere.length, setAktivesRevier]);

  // Plan setzen
  const setzePlan = useCallback(async (plan: Plan) => {
    await setCurrentPlan(plan);
    setAktuellerPlan(plan);
  }, []);

  // Bundesland setzen
  const setzeBundesland = useCallback(async (bl: string) => {
    setBundeslandState(bl);
    await AsyncStorage.setItem(BUNDESLAND_KEY, bl);
  }, []);

  return (
    <AppContext.Provider
      value={{
        isDbReady,
        reviere,
        aktivesRevier,
        setAktivesRevier,
        ladeReviere,
        erstelleRevier,
        aktuellerPlan,
        setzePlan,
        bundesland,
        setzeBundesland,
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
