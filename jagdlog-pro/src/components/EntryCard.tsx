import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { JagdEintrag } from '../types';
import { formatTime } from '../utils/dateHelpers';
import { useTheme } from '@react-navigation/native';

interface EntryCardProps {
  entry: JagdEintrag;
}

export function EntryCard({ entry }: EntryCardProps) {
  const { colors } = useTheme();
  const icon = entry.typ === 'abschuss' ? '🎯' : '👁️';

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}> 
      <View style={styles.header}>
        <Text style={[styles.icon, { color: colors.text }]}>{icon}</Text>
        <Text style={[styles.time, { color: colors.text }]}>{formatTime(entry.datum)}</Text>
        {entry.wildart ? (
          <Text style={[styles.pill, { backgroundColor: colors.primary, color: '#fff' }]}>
            {entry.wildart}
          </Text>
        ) : null}
        {entry.fotos?.length ? <Text style={styles.camera}>📸</Text> : null}
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{entry.revier}</Text>
      {entry.notizen ? (
        <Text style={[styles.notes, { color: colors.text }]} numberOfLines={2}>
          {entry.notizen}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 18,
  },
  time: {
    fontSize: 12,
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    fontSize: 12,
  },
  camera: {
    marginLeft: 'auto',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  notes: {
    fontSize: 13,
  },
});
