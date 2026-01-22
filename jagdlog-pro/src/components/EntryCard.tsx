/**
 * HNTR LEGEND Pro - EntryCard Komponente
 * Zeigt einen Jagdeintrag in der Timeline
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../state/ThemeContext';
import { JagdEintrag, EintragTyp } from '../types';
import { formatiereZeit, relativeDatum } from '../utils/dateHelpers';

interface EntryCardProps {
  eintrag: JagdEintrag;
  onPress?: () => void;
}

// Icons für Eintragstypen
const EINTRAG_ICONS: Record<EintragTyp, string> = {
  beobachtung: '👁️',
  abschuss: '🎯',
  nachsuche: '🐕',
  revierereignis: '📋',
};

// Farben für Eintragstypen
const EINTRAG_FARBEN: Record<EintragTyp, string> = {
  beobachtung: '#4299E1',
  abschuss: '#48BB78',
  nachsuche: '#805AD5',
  revierereignis: '#ED8936',
};

const EntryCard: React.FC<EntryCardProps> = ({ eintrag, onPress }) => {
  const { colors } = useTheme();

  const typFarbe = EINTRAG_FARBEN[eintrag.typ] || colors.primary;
  const typIcon = EINTRAG_ICONS[eintrag.typ] || '📝';

  // Details je nach Typ
  const getDetails = (): string => {
    if (eintrag.typ === 'abschuss' && 'abschussDetails' in eintrag) {
      const details = eintrag.abschussDetails;
      const teile: string[] = [];
      if (details.geschlecht) teile.push(details.geschlecht);
      if (details.altersklasse) teile.push(details.altersklasse);
      if (details.gewichtAufgebrochenKg) teile.push(`${details.gewichtAufgebrochenKg} kg`);
      return teile.join(' · ') || '';
    }
    if (eintrag.typ === 'beobachtung' && 'verhalten' in eintrag && eintrag.verhalten) {
      return eintrag.verhalten;
    }
    return '';
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
      flexDirection: 'row',
      alignItems: 'flex-start',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 3,
      elevation: 2,
    },
    typIndicator: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: typFarbe + '20', // 20% Opacity
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    typIcon: {
      fontSize: 20,
    },
    content: {
      flex: 1,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    wildartPill: {
      backgroundColor: typFarbe + '20',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    wildartText: {
      fontSize: 13,
      fontWeight: '600',
      color: typFarbe,
    },
    zeitText: {
      fontSize: 12,
      color: colors.textLight,
    },
    detailsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
    },
    detailText: {
      fontSize: 13,
      color: colors.textLight,
    },
    anzahlBadge: {
      backgroundColor: colors.border,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
      marginLeft: 8,
    },
    anzahlText: {
      fontSize: 11,
      color: colors.text,
      fontWeight: '600',
    },
    notizText: {
      fontSize: 12,
      color: colors.textLight,
      marginTop: 6,
      fontStyle: 'italic',
    },
    fotoIndicator: {
      marginTop: 6,
    },
    fotoText: {
      fontSize: 11,
      color: colors.textLight,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
      gap: 8,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    metaIcon: {
      fontSize: 12,
      marginRight: 4,
    },
    metaText: {
      fontSize: 11,
      color: colors.textLight,
    },
  });

  const details = getDetails();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      {/* Typ-Icon */}
      <View style={styles.typIndicator}>
        <Text style={styles.typIcon}>{typIcon}</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Header: Wildart + Zeit */}
        <View style={styles.headerRow}>
          <View style={styles.wildartPill}>
            <Text style={styles.wildartText}>{eintrag.wildartName}</Text>
          </View>
          <Text style={styles.zeitText}>
            {relativeDatum(eintrag.zeitpunkt)} · {formatiereZeit(eintrag.zeitpunkt)}
          </Text>
        </View>

        {/* Details (je nach Typ) */}
        {(details || eintrag.anzahl > 1) && (
          <View style={styles.detailsRow}>
            {details && <Text style={styles.detailText}>{details}</Text>}
            {eintrag.anzahl > 1 && (
              <View style={styles.anzahlBadge}>
                <Text style={styles.anzahlText}>{eintrag.anzahl}×</Text>
              </View>
            )}
          </View>
        )}

        {/* Notizen (gekürzt) */}
        {eintrag.notizen && (
          <Text style={styles.notizText} numberOfLines={1}>
            „{eintrag.notizen}"
          </Text>
        )}

        {/* Meta-Info: Fotos, GPS, Wetter */}
        <View style={styles.metaRow}>
          {eintrag.fotoIds && eintrag.fotoIds.length > 0 && (
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>📷</Text>
              <Text style={styles.metaText}>{eintrag.fotoIds.length}</Text>
            </View>
          )}
          {eintrag.gps && (
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>📍</Text>
              <Text style={styles.metaText}>GPS</Text>
            </View>
          )}
          {eintrag.wetter && (
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>🌡️</Text>
              <Text style={styles.metaText}>{eintrag.wetter.temperatur}°C</Text>
            </View>
          )}
          {eintrag.jagdart && (
            <View style={styles.metaItem}>
              <Text style={styles.metaText}>{eintrag.jagdart}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default EntryCard;
