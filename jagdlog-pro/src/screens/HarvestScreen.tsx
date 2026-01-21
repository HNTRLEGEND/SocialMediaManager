import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { JagdEintrag } from '../types';
import { getEntries } from '../services/storageService';
import { EntryCard } from '../components/EntryCard';

export function HarvestScreen() {
  const { colors } = useTheme();
  const [entries, setEntries] = useState<JagdEintrag[]>([]);

  useEffect(() => {
    getEntries().then(setEntries);
  }, []);

  const harvests = useMemo(
    () => entries.filter((entry) => entry.typ === 'abschuss'),
    [entries],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Abschüsse</Text>
      <FlatList
        data={harvests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <EntryCard entry={item} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={{ color: colors.textLight }}>Noch keine Abschüsse erfasst.</Text>
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
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  list: {
    paddingBottom: 120,
  },
});
