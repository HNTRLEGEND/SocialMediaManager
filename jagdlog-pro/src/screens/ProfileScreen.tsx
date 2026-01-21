import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@react-navigation/native';

export function ProfileScreen() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <Text style={[styles.title, { color: colors.text }]}>Profil</Text>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}> 
        <Text style={{ color: colors.text }}>Jäger: Max Mustermann</Text>
        <Text style={{ color: colors.textLight }}>Premium Status: Aktiv</Text>
        <Text style={{ color: colors.textLight }}>Offline-Modus: Aktiv</Text>
      </View>
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
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
});
