import React, { useContext, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import { getEntries } from '../services/storageService';
import { JagdEintrag } from '../types';
import { EntryCard } from '../components/EntryCard';
import { StatCard } from '../components/StatCard';
import { isSchonzeit } from '../constants/schonzeiten';
import { ThemeContext } from '../../App';

export function DashboardScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { mode, setMode } = useContext(ThemeContext);
  const [entries, setEntries] = useState<JagdEintrag[]>([]);

  useEffect(() => {
    getEntries().then(setEntries);
  }, []);

  const lastEntries = useMemo(() => entries.slice(0, 3), [entries]);
  const stats = useMemo(() => {
    const revierSet = new Set(entries.map((entry) => entry.revier));
    const wildartenSet = new Set(entries.map((entry) => entry.wildart).filter(Boolean));
    const abschuesse = entries.filter((entry) => entry.typ === 'abschuss').length;
    return {
      total: entries.length,
      abschuesse,
      wildarten: wildartenSet.size,
      reviere: revierSet.size,
    };
  }, [entries]);

  const schonzeitWarnung = useMemo(() => {
    if (!entries.length) {
      return null;
    }
    const entry = entries[0];
    if (!entry.wildart) {
      return null;
    }
    return isSchonzeit('nordrhein-westfalen', entry.wildart.toLowerCase());
  }, [entries]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>HNTR LEGEND Pro</Text>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() =>
              setMode(mode === 'system' ? 'dark' : mode === 'dark' ? 'light' : 'system')
            }
          >
            <Text style={{ color: colors.primary }}>🌓 Theme</Text>
          </Pressable>
          <Pressable onPress={() => navigation.navigate('Assistant' as never)}>
            <Text style={{ color: colors.primary }}>🤖 KI</Text>
          </Pressable>
        </View>
      </View>

      {schonzeitWarnung ? (
        <View style={[styles.warning, { borderColor: colors.secondary }]}> 
          <Text style={{ color: colors.text }}>⚠️ {schonzeitWarnung.beschreibung}</Text>
        </View>
      ) : null}

      <View style={styles.statGrid}>
        <StatCard label="Einträge" value={stats.total} />
        <StatCard label="Abschüsse" value={stats.abschuesse} />
        <StatCard label="Wildarten" value={stats.wildarten} />
        <StatCard label="Reviere" value={stats.reviere} />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Letzte Aktivitäten</Text>
      </View>

      <FlatList
        data={lastEntries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <EntryCard entry={item} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={{ color: colors.textLight }}>Noch keine Einträge vorhanden.</Text>
        }
      />

      <Pressable
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('NewEntry' as never)}
      >
        <Text style={styles.fabText}>＋</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  warning: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  sectionHeader: {
    marginTop: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    paddingBottom: 120,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  fabText: {
    fontSize: 28,
    color: '#fff',
    marginTop: -2,
  },
});
