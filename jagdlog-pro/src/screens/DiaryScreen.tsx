import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { JagdEintrag } from '../types';
import { getEntries } from '../services/storageService';
import { EntryCard } from '../components/EntryCard';
import { groupByDate } from '../utils/dateHelpers';

const filters = ['Alle', 'Diese Woche', 'Abschüsse'];

export function DiaryScreen() {
  const { colors } = useTheme();
  const [entries, setEntries] = useState<JagdEintrag[]>([]);
  const [activeFilter, setActiveFilter] = useState(filters[0]);

  useEffect(() => {
    getEntries().then(setEntries);
  }, []);

  const filteredEntries = useMemo(() => {
    if (activeFilter === 'Abschüsse') {
      return entries.filter((entry) => entry.typ === 'abschuss');
    }
    return entries;
  }, [entries, activeFilter]);

  const sections = useMemo(() => {
    const grouped = groupByDate(filteredEntries);
    return Object.entries(grouped).map(([title, data]) => ({ title, data }));
  }, [filteredEntries]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Tagebuch</Text>
        <View style={styles.iconRow}>
          <Text style={styles.icon}>🔍</Text>
          <Text style={styles.icon}>⚙️</Text>
        </View>
      </View>

      <View style={styles.filterRow}>
        {filters.map((filter) => {
          const active = filter === activeFilter;
          return (
            <Pressable
              key={filter}
              onPress={() => setActiveFilter(filter)}
              style={[
                styles.filterPill,
                {
                  backgroundColor: active ? colors.primary : colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={{ color: active ? '#fff' : colors.text }}>{filter}</Text>
            </Pressable>
          );
        })}
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <EntryCard entry={item} />}
        renderSectionHeader={({ section }) => (
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={{ color: colors.textLight }}>Keine Einträge gefunden.</Text>
        }
      />
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
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  iconRow: {
    flexDirection: 'row',
    gap: 12,
  },
  icon: {
    fontSize: 18,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginVertical: 8,
  },
  list: {
    paddingBottom: 120,
  },
});
