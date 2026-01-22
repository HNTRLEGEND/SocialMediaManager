/**
 * HNTR LEGEND Pro - StatCard Komponente
 * Zeigt eine Statistik-Karte mit Icon, Wert und Titel
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../state/ThemeContext';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: string;
  color?: string;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, subtitle }) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      minWidth: '47%',
      flex: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    iconRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    icon: {
      fontSize: 24,
    },
    colorDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: color || colors.primary,
    },
    value: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
    },
    title: {
      fontSize: 13,
      color: colors.textLight,
      fontWeight: '500',
    },
    subtitle: {
      fontSize: 11,
      color: colors.textLight,
      marginTop: 4,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.iconRow}>
        <Text style={styles.icon}>{icon}</Text>
        <View style={styles.colorDot} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

export default StatCard;
