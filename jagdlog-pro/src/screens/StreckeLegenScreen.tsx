import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  Alert,
  Share,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { GesellschaftsjagdService } from '../services/gesellschaftsjagdService';
import type { Gesellschaftsjagd, StreckenAbschuss } from '../types/gesellschaftsjagd';

// Navigation Types
type RootStackParamList = {
  StreckeLegen: { jagdId: string };
  JagdDetails: { jagdId: string };
};

type StreckeLegenScreenRouteProp = RouteProp<RootStackParamList, 'StreckeLegen'>;
type StreckeLegenScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'StreckeLegen'
>;

const { width } = Dimensions.get('window');

// View Mode
type ViewMode = 'gallery' | 'list' | 'summary';

export default function StreckeLegenScreen() {
  const route = useRoute<StreckeLegenScreenRouteProp>();
  const navigation = useNavigation<StreckeLegenScreenNavigationProp>();
  const { jagdId } = route.params;

  const [viewMode, setViewMode] = useState<ViewMode>('gallery');
  const [selectedAbschuss, setSelectedAbschuss] = useState<StreckenAbschuss | null>(null);

  // TODO: Get database instance from context
  const db = null as any;
  const jagdService = new GesellschaftsjagdService(db);

  // Load Jagd data
  const { data: jagd, isLoading } = useQuery({
    queryKey: ['gesellschaftsjagd', jagdId],
    queryFn: () => jagdService.getJagd(jagdId),
  });

  // Load Abschüsse
  const { data: abschuesse = [] } = useQuery({
    queryKey: ['strecken-abschuesse', jagdId],
    queryFn: () => jagdService.getStreckenAbschuesse(jagdId),
  });

  // Load Zusammenfassung
  const { data: zusammenfassung } = useQuery({
    queryKey: ['strecke-zusammenfassung', jagdId],
    queryFn: () => jagdService.getStreckenzusammenfassung(jagdId),
  });

  const handleGeneratePDF = async () => {
    if (!jagd || !zusammenfassung) return;

    try {
      const html = generateProtokollHTML(jagd, abschuesse, zusammenfassung);
      const { uri } = await Print.printToFileAsync({ html });

      Alert.alert(
        'PDF erstellt',
        'Das Jagdprotokoll wurde als PDF gespeichert.',
        [
          {
            text: 'Teilen',
            onPress: async () => {
              if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri);
              }
            },
          },
          { text: 'OK', style: 'cancel' },
        ]
      );
    } catch (error) {
      Alert.alert('Fehler', 'PDF konnte nicht erstellt werden.');
      console.error(error);
    }
  };

  const handleShare = async () => {
    try {
      const message = `Streckenbericht ${jagd?.name}\n\nGesamt: ${zusammenfassung?.gesamt || 0} Stück\n\n${
        Object.entries(zusammenfassung?.nachWildart || {})
          .map(([wildart, anzahl]) => `${wildart}: ${anzahl}`)
          .join('\n')
      }`;

      await Share.share({
        message,
        title: `Strecke ${jagd?.name}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading || !jagd) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Lade Strecke...</Text>
      </View>
    );
  }

  // Gruppieren nach Wildart
  const groupedByWildart = abschuesse.reduce((acc, abschuss) => {
    if (!acc[abschuss.wildart]) {
      acc[abschuss.wildart] = [];
    }
    acc[abschuss.wildart].push(abschuss);
    return acc;
  }, {} as Record<string, StreckenAbschuss[]>);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Strecke legen</Text>
          <Text style={styles.headerSubtitle}>{jagd.name}</Text>
        </View>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share-outline" size={24} color="#1a1a1a" />
        </TouchableOpacity>
      </View>

      {/* Stats Banner */}
      <View style={styles.statsBanner}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{zusammenfassung?.gesamt || 0}</Text>
          <Text style={styles.statLabel}>Gesamt</Text>
        </View>
        {Object.entries(zusammenfassung?.nachWildart || {}).map(([wildart, anzahl]) => (
          <View key={wildart} style={styles.statItem}>
            <Text style={styles.statValue}>{anzahl as number}</Text>
            <Text style={styles.statLabel}>{wildart}</Text>
          </View>
        ))}
      </View>

      {/* View Mode Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, viewMode === 'gallery' && styles.tabActive]}
          onPress={() => setViewMode('gallery')}
        >
          <Ionicons
            name="images"
            size={20}
            color={viewMode === 'gallery' ? '#2ecc71' : '#666'}
          />
          <Text style={[styles.tabText, viewMode === 'gallery' && styles.tabTextActive]}>
            Galerie
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, viewMode === 'list' && styles.tabActive]}
          onPress={() => setViewMode('list')}
        >
          <Ionicons name="list" size={20} color={viewMode === 'list' ? '#2ecc71' : '#666'} />
          <Text style={[styles.tabText, viewMode === 'list' && styles.tabTextActive]}>Liste</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, viewMode === 'summary' && styles.tabActive]}
          onPress={() => setViewMode('summary')}
        >
          <Ionicons
            name="document-text"
            size={20}
            color={viewMode === 'summary' ? '#2ecc71' : '#666'}
          />
          <Text style={[styles.tabText, viewMode === 'summary' && styles.tabTextActive]}>
            Protokoll
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {viewMode === 'gallery' && (
        <GalleryView abschuesse={abschuesse} onSelect={setSelectedAbschuss} />
      )}
      {viewMode === 'list' && (
        <ListView groupedByWildart={groupedByWildart} onSelect={setSelectedAbschuss} />
      )}
      {viewMode === 'summary' && (
        <SummaryView jagd={jagd} abschuesse={abschuesse} zusammenfassung={zusammenfassung} />
      )}

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleGeneratePDF}>
          <Ionicons name="document" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>PDF erstellen</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonSecondary]}
          onPress={() => navigation.navigate('JagdDetails', { jagdId })}
        >
          <Ionicons name="list" size={20} color="#2ecc71" />
          <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>Details</Text>
        </TouchableOpacity>
      </View>

      {/* Detail Modal (wenn Abschuss ausgewählt) */}
      {selectedAbschuss && (
        <AbschussDetailModal abschuss={selectedAbschuss} onClose={() => setSelectedAbschuss(null)} />
      )}
    </View>
  );
}

// ============================================================================
// Gallery View
// ============================================================================

interface GalleryViewProps {
  abschuesse: StreckenAbschuss[];
  onSelect: (abschuss: StreckenAbschuss) => void;
}

function GalleryView({ abschuesse, onSelect }: GalleryViewProps) {
  // Alle Fotos sammeln
  const allFotos = abschuesse.flatMap((abschuss) =>
    (abschuss.fotos || []).map((foto) => ({ abschuss, foto }))
  );

  if (allFotos.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="images-outline" size={64} color="#ccc" />
        <Text style={styles.emptyText}>Keine Fotos vorhanden</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={allFotos}
      numColumns={3}
      keyExtractor={(item, index) => `${item.abschuss.id}-${index}`}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.galleryItem}
          onPress={() => onSelect(item.abschuss)}
        >
          <Image source={{ uri: item.foto }} style={styles.galleryImage} />
          <View style={styles.galleryOverlay}>
            <Ionicons name="paw" size={16} color="#fff" />
            <Text style={styles.galleryOverlayText}>{item.abschuss.wildart}</Text>
          </View>
        </TouchableOpacity>
      )}
      contentContainerStyle={styles.galleryContainer}
    />
  );
}

// ============================================================================
// List View
// ============================================================================

interface ListViewProps {
  groupedByWildart: Record<string, StreckenAbschuss[]>;
  onSelect: (abschuss: StreckenAbschuss) => void;
}

function ListView({ groupedByWildart, onSelect }: ListViewProps) {
  if (Object.keys(groupedByWildart).length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="list-outline" size={64} color="#ccc" />
        <Text style={styles.emptyText}>Keine Abschüsse vorhanden</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.listContainer}>
      {Object.entries(groupedByWildart).map(([wildart, abschuesse]) => (
        <View key={wildart} style={styles.listGroup}>
          <View style={styles.listGroupHeader}>
            <Ionicons name="paw" size={20} color="#2ecc71" />
            <Text style={styles.listGroupTitle}>
              {wildart} ({abschuesse.length})
            </Text>
          </View>
          {abschuesse.map((abschuss) => (
            <TouchableOpacity
              key={abschuss.id}
              style={styles.listItem}
              onPress={() => onSelect(abschuss)}
            >
              {abschuss.fotos && abschuss.fotos.length > 0 && (
                <Image source={{ uri: abschuss.fotos[0] }} style={styles.listItemImage} />
              )}
              <View style={styles.listItemContent}>
                <Text style={styles.listItemTitle}>
                  {abschuss.geschlecht} • {abschuss.altersklasse}
                </Text>
                <Text style={styles.listItemSubtitle}>
                  Schütze: {abschuss.schuetzeId}
                </Text>
                <Text style={styles.listItemTime}>
                  {new Date(abschuss.zeitpunkt).toLocaleTimeString('de-DE', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

// ============================================================================
// Summary View (Protokoll)
// ============================================================================

interface SummaryViewProps {
  jagd: Gesellschaftsjagd;
  abschuesse: StreckenAbschuss[];
  zusammenfassung: any;
}

function SummaryView({ jagd, abschuesse, zusammenfassung }: SummaryViewProps) {
  return (
    <ScrollView style={styles.summaryContainer}>
      {/* Jagd-Informationen */}
      <View style={styles.protokollSection}>
        <Text style={styles.protokollTitle}>Jagd-Informationen</Text>
        <View style={styles.protokollCard}>
          <ProtokollRow label="Name" value={jagd.name} />
          <ProtokollRow label="Typ" value={getJagdTypLabel(jagd.typ)} />
          <ProtokollRow
            label="Datum"
            value={new Date(jagd.datum).toLocaleDateString('de-DE', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          />
          <ProtokollRow label="Jagdleiter" value={jagd.jagdleiter.name} />
          <ProtokollRow
            label="Teilnehmer"
            value={`${jagd.teilnehmer?.filter((t) => t.anmeldung.status === 'bestaetigt').length || 0}`}
          />
        </View>
      </View>

      {/* Zeitplan */}
      <View style={styles.protokollSection}>
        <Text style={styles.protokollTitle}>Zeitplan</Text>
        <View style={styles.protokollCard}>
          <ProtokollRow label="Sammeln" value={jagd.zeitplan.sammeln} />
          <ProtokollRow label="Ansprechen" value={jagd.zeitplan.ansprechen} />
          <ProtokollRow label="Jagd-Beginn" value={jagd.zeitplan.jagdBeginn} />
          <ProtokollRow label="Jagd-Ende" value={jagd.zeitplan.jagdEnde} />
          {jagd.zeitplan.streckeZeigen && (
            <ProtokollRow label="Strecke zeigen" value={jagd.zeitplan.streckeZeigen} />
          )}
        </View>
      </View>

      {/* Strecke */}
      <View style={styles.protokollSection}>
        <Text style={styles.protokollTitle}>Strecke</Text>
        <View style={styles.protokollCard}>
          <ProtokollRow
            label="Gesamt"
            value={`${zusammenfassung?.gesamt || 0} Stück`}
            highlight
          />
          {Object.entries(zusammenfassung?.nachWildart || {}).map(([wildart, anzahl]) => (
            <ProtokollRow key={wildart} label={wildart} value={`${anzahl} Stück`} />
          ))}
        </View>
      </View>

      {/* Detaillierte Abschussliste */}
      <View style={styles.protokollSection}>
        <Text style={styles.protokollTitle}>Detaillierte Abschussliste</Text>
        <View style={styles.protokollCard}>
          {abschuesse.map((abschuss, index) => (
            <View key={abschuss.id} style={styles.abschussProtokollItem}>
              <Text style={styles.abschussProtokollNummer}>{index + 1}.</Text>
              <View style={styles.abschussProtokollContent}>
                <Text style={styles.abschussProtokollWildart}>{abschuss.wildart}</Text>
                <Text style={styles.abschussProtokollDetails}>
                  {abschuss.geschlecht} • {abschuss.altersklasse} • {abschuss.anzahl}x
                </Text>
                <Text style={styles.abschussProtokollSchuetze}>
                  Schütze: {abschuss.schuetzeId}
                </Text>
                <Text style={styles.abschussProtokollTime}>
                  {new Date(abschuss.zeitpunkt).toLocaleTimeString('de-DE', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Unterschriften-Bereich */}
      <View style={styles.protokollSection}>
        <Text style={styles.protokollTitle}>Unterschriften</Text>
        <View style={styles.protokollCard}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Jagdleiter</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>{jagd.jagdleiter.name}</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Datum</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>
              {new Date().toLocaleDateString('de-DE')}
            </Text>
          </View>
        </View>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

// ============================================================================
// Abschuss Detail Modal
// ============================================================================

interface AbschussDetailModalProps {
  abschuss: StreckenAbschuss;
  onClose: () => void;
}

function AbschussDetailModal({ abschuss, onClose }: AbschussDetailModalProps) {
  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{abschuss.wildart}</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {/* Fotos */}
          {abschuss.fotos && abschuss.fotos.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.modalFotos}>
              {abschuss.fotos.map((foto, index) => (
                <Image key={index} source={{ uri: foto }} style={styles.modalFoto} />
              ))}
            </ScrollView>
          )}

          {/* Details */}
          <View style={styles.modalDetailsCard}>
            <DetailRow label="Wildart" value={abschuss.wildart} />
            <DetailRow label="Geschlecht" value={abschuss.geschlecht} />
            <DetailRow label="Altersklasse" value={abschuss.altersklasse} />
            <DetailRow label="Anzahl" value={`${abschuss.anzahl} Stück`} />
            <DetailRow label="Schütze" value={abschuss.schuetzeId} />
            <DetailRow
              label="Zeitpunkt"
              value={new Date(abschuss.zeitpunkt).toLocaleString('de-DE')}
            />
            {abschuss.standortId && <DetailRow label="Standort" value={abschuss.standortId} />}
            {abschuss.treibenNummer && (
              <DetailRow label="Treiben" value={`Nr. ${abschuss.treibenNummer}`} />
            )}
          </View>

          {/* Zusatz-Details */}
          {abschuss.details && (
            <View style={styles.modalDetailsCard}>
              <Text style={styles.modalCardTitle}>Zusätzliche Informationen</Text>
              {abschuss.details.schussEntfernung && (
                <DetailRow label="Schussentfernung" value={`${abschuss.details.schussEntfernung}m`} />
              )}
              {abschuss.details.schussPlatzierung && (
                <DetailRow label="Schussplatzierung" value={abschuss.details.schussPlatzierung} />
              )}
              {abschuss.details.gewicht && (
                <DetailRow label="Gewicht" value={`${abschuss.details.gewicht} kg`} />
              )}
              {abschuss.details.besonderheiten && (
                <DetailRow label="Besonderheiten" value={abschuss.details.besonderheiten} />
              )}
            </View>
          )}

          {/* GPS */}
          {abschuss.gps && (
            <View style={styles.modalDetailsCard}>
              <Text style={styles.modalCardTitle}>GPS-Position</Text>
              <DetailRow
                label="Koordinaten"
                value={`${abschuss.gps.latitude.toFixed(5)}, ${abschuss.gps.longitude.toFixed(5)}`}
              />
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

// ============================================================================
// Helper Components
// ============================================================================

interface ProtokollRowProps {
  label: string;
  value: string;
  highlight?: boolean;
}

function ProtokollRow({ label, value, highlight }: ProtokollRowProps) {
  return (
    <View style={[styles.protokollRow, highlight && styles.protokollRowHighlight]}>
      <Text style={[styles.protokollLabel, highlight && styles.protokollLabelHighlight]}>
        {label}
      </Text>
      <Text style={[styles.protokollValue, highlight && styles.protokollValueHighlight]}>
        {value}
      </Text>
    </View>
  );
}

interface DetailRowProps {
  label: string;
  value: string;
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

function getJagdTypLabel(typ: string): string {
  const labels: Record<string, string> = {
    drueckjagd: 'Drückjagd',
    treibjagd: 'Treibjagd',
    bewegungsjagd: 'Bewegungsjagd',
    ansitz_gruppe: 'Ansitzjagd (Gruppe)',
    riegeljagd: 'Riegeljagd',
  };
  return labels[typ] || typ;
}

function generateProtokollHTML(
  jagd: Gesellschaftsjagd,
  abschuesse: StreckenAbschuss[],
  zusammenfassung: any
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Jagdprotokoll ${jagd.name}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          h1 { color: #2ecc71; }
          .section { margin-bottom: 30px; }
          .section-title { font-size: 18px; font-weight: 600; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #2ecc71; color: white; }
          .signature-box { margin-top: 50px; border-top: 1px solid #000; padding-top: 10px; }
        </style>
      </head>
      <body>
        <h1>Jagdprotokoll</h1>
        <div class="section">
          <div class="section-title">Jagd-Informationen</div>
          <table>
            <tr><td>Name</td><td>${jagd.name}</td></tr>
            <tr><td>Typ</td><td>${getJagdTypLabel(jagd.typ)}</td></tr>
            <tr><td>Datum</td><td>${new Date(jagd.datum).toLocaleDateString('de-DE')}</td></tr>
            <tr><td>Jagdleiter</td><td>${jagd.jagdleiter.name}</td></tr>
          </table>
        </div>
        <div class="section">
          <div class="section-title">Strecke</div>
          <table>
            <tr><th>Wildart</th><th>Anzahl</th></tr>
            ${Object.entries(zusammenfassung?.nachWildart || {})
              .map(([wildart, anzahl]) => `<tr><td>${wildart}</td><td>${anzahl}</td></tr>`)
              .join('')}
            <tr><th>Gesamt</th><th>${zusammenfassung?.gesamt || 0}</th></tr>
          </table>
        </div>
        <div class="section">
          <div class="section-title">Detaillierte Abschussliste</div>
          <table>
            <tr><th>Nr.</th><th>Wildart</th><th>Geschlecht</th><th>Alter</th><th>Schütze</th><th>Uhrzeit</th></tr>
            ${abschuesse
              .map(
                (a, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${a.wildart}</td>
                <td>${a.geschlecht}</td>
                <td>${a.altersklasse}</td>
                <td>${a.schuetzeId}</td>
                <td>${new Date(a.zeitpunkt).toLocaleTimeString('de-DE')}</td>
              </tr>
            `
              )
              .join('')}
          </table>
        </div>
        <div class="signature-box">
          <p>Jagdleiter: ________________________ (${jagd.jagdleiter.name})</p>
          <p>Datum: ${new Date().toLocaleDateString('de-DE')}</p>
        </div>
      </body>
    </html>
  `;
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  shareButton: {
    marginLeft: 12,
  },

  // Stats Banner
  statsBanner: {
    flexDirection: 'row',
    backgroundColor: '#2ecc71',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  statLabel: {
    fontSize: 11,
    color: '#fff',
    marginTop: 4,
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#2ecc71',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  tabTextActive: {
    color: '#2ecc71',
    fontWeight: '600',
  },

  // Gallery View
  galleryContainer: {
    padding: 2,
  },
  galleryItem: {
    width: width / 3 - 4,
    height: width / 3 - 4,
    margin: 2,
    position: 'relative',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  galleryOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  galleryOverlayText: {
    fontSize: 10,
    color: '#fff',
    marginLeft: 4,
  },

  // List View
  listContainer: {
    flex: 1,
    padding: 16,
  },
  listGroup: {
    marginBottom: 20,
  },
  listGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  listGroupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  listItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  listItemSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  listItemTime: {
    fontSize: 11,
    color: '#999',
  },

  // Summary/Protokoll View
  summaryContainer: {
    flex: 1,
    padding: 16,
  },
  protokollSection: {
    marginBottom: 24,
  },
  protokollTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  protokollCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  protokollRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  protokollRowHighlight: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  protokollLabel: {
    fontSize: 12,
    color: '#666',
  },
  protokollLabelHighlight: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2ecc71',
  },
  protokollValue: {
    fontSize: 14,
    color: '#1a1a1a',
  },
  protokollValueHighlight: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2ecc71',
  },
  abschussProtokollItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  abschussProtokollNummer: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2ecc71',
    width: 30,
  },
  abschussProtokollContent: {
    flex: 1,
  },
  abschussProtokollWildart: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  abschussProtokollDetails: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  abschussProtokollSchuetze: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  abschussProtokollTime: {
    fontSize: 11,
    color: '#999',
  },
  signatureBox: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  signatureLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 20,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
    marginBottom: 8,
  },
  signatureName: {
    fontSize: 12,
    color: '#666',
  },

  // Actions
  actionsContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2ecc71',
    paddingVertical: 14,
    borderRadius: 12,
  },
  actionButtonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2ecc71',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 6,
  },
  actionButtonTextSecondary: {
    color: '#2ecc71',
  },

  // Modal
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.85,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  modalContent: {
    padding: 20,
  },
  modalFotos: {
    marginBottom: 16,
  },
  modalFoto: {
    width: width - 80,
    height: width - 80,
    borderRadius: 12,
    marginRight: 12,
  },
  modalDetailsCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  modalCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    color: '#1a1a1a',
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
});
