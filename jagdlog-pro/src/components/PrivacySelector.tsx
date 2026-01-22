/**
 * HNTR LEGEND Pro - PrivacySelector Komponente
 * Auswahl der Sichtbarkeit für Einträge
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../state/ThemeContext';
import { Sichtbarkeit } from '../types';

interface PrivacySelectorProps {
  value: Sichtbarkeit;
  onChange: (value: Sichtbarkeit) => void;
}

const SICHTBARKEITEN: { id: Sichtbarkeit; label: string; icon: string; beschreibung: string }[] = [
  { id: 'privat', label: 'Privat', icon: '🔒', beschreibung: 'Nur für dich sichtbar' },
  { id: 'revier', label: 'Revier', icon: '👥', beschreibung: 'Für Reviermitglieder sichtbar' },
  { id: 'freunde', label: 'Freunde', icon: '🤝', beschreibung: 'Für verknüpfte Kontakte sichtbar' },
  { id: 'oeffentlich', label: 'Öffentlich', icon: '🌐', beschreibung: 'Für alle sichtbar' },
];

const PrivacySelector: React.FC<PrivacySelectorProps> = ({ value, onChange }) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 12,
    },
    row: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: colors.background,
    },
    pillActive: {
      backgroundColor: colors.primary,
    },
    pillIcon: {
      fontSize: 14,
      marginRight: 6,
    },
    pillText: {
      fontSize: 14,
      color: colors.textLight,
    },
    pillTextActive: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {SICHTBARKEITEN.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[styles.pill, value === option.id && styles.pillActive]}
            onPress={() => onChange(option.id)}
          >
            <Text style={styles.pillIcon}>{option.icon}</Text>
            <Text style={[styles.pillText, value === option.id && styles.pillTextActive]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default PrivacySelector;
