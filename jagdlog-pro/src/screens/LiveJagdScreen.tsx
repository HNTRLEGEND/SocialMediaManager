import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Animated,
  Dimensions,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import MapView, { Marker, Circle, PROVIDER_DEFAULT } from 'react-native-maps';
import { GesellschaftsjagdService } from '../services/gesellschaftsjagdService';
import type { Gesellschaftsjagd, Teilnehmer, JagdStandort, LiveEvent, LiveEventTyp } from '../types/gesellschaftsjagd';

// Navigation Types
type RootStackParamList = {
  LiveJagd: { jagdId: string };
  AbschussErfassen: { jagdId: string };
  JagdDetails: { jagdId: string };
};

type LiveJagdScreenRouteProp = RouteProp<RootStackParamList, 'LiveJagd'>;
type LiveJagdScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'LiveJagd'>;

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.02;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default function LiveJagdScreen() {
  const route = useRoute<LiveJagdScreenRouteProp>();
  const navigation = useNavigation<LiveJagdScreenNavigationProp>();
  const queryClient = useQueryClient();
  const { jagdId } = route.params;

  const mapRef = useRef<MapView>(null);
  const [showEvents, setShowEvents] = useState(true);
  const [selectedStandort, setSelectedStandort] = useState<JagdStandort | null>(null);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showNotfallDialog, setShowNotfallDialog] = useState(false);
  const slideAnim = useRef(new Animated.Value(300)).current;

  // TODO: Get database instance from context
  const db = null as any;
  const jagdService = new GesellschaftsjagdService(db);

  // Load Jagd data
  const { data: jagd, isLoading } = useQuery({
    queryKey: ['gesellschaftsjagd', jagdId],
    queryFn: () => jagdService.getJagd(jagdId),
  });

  // Load Live Events (refresh every 3 seconds)
  const { data: liveEvents = [] } = useQuery({
    queryKey: ['jagd-live-events', jagdId],
    queryFn: () => jagdService.getLiveEvents(jagdId, 20),
    refetchInterval: 3000, // Refresh every 3s
  });

  // Load Teilnehmer
  const { data: teilnehmer = [] } = useQuery({
    queryKey: ['jagd-teilnehmer', jagdId],
    queryFn: () => jagdService.getTeilnehmer(jagdId),
    refetchInterval: 5000, // Refresh every 5s
  });

  // Create Live Event Mutation
  const createEventMutation = useMutation({
    mutationFn: (event: { typ: LiveEventTyp; daten?: any }) =>
      jagdService.createLiveEvent({
        id: '',
        jagdId,
        typ: event.typ,
        zeitpunkt: new Date().toISOString(),
        von: 'user-001', // TODO: Get from auth
        daten: event.daten,
        sichtbarFuer: 'alle',
        gelesen: [],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jagd-live-events', jagdId] });
    },
  });

  // Animate event panel
  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: showEvents ? 0 : 300,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  }, [showEvents]);

  // Center map on first load
  useEffect(() => {
    if (jagd?.standorte && jagd.standorte.length > 0 && mapRef.current) {
      const coordinates = jagd.standorte
        .filter((s) => s.gps)
        .map((s) => ({
          latitude: s.gps!.latitude,
          longitude: s.gps!.longitude,
        }));

      if (coordinates.length > 0) {
        mapRef.current.fitToCoordinates(coordinates, {
          edgePadding: { top: 100, right: 50, bottom: 300, left: 50 },
          animated: true,
        });
      }
    }
  }, [jagd]);

  if (isLoading || !jagd) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Lade Live-Jagd...</Text>
      </View>
    );
  }

  const currentTreiben = jagd.treiben?.find((t) => t.status === 'aktiv');

  const handleQuickAction = (action: 'abschuss' | 'sichtung' | 'notfall' | 'nachsuche') => {
    setShowQuickActions(false);

    switch (action) {
      case 'abschuss':
        navigation.navigate('AbschussErfassen', { jagdId });
        break;
      case 'sichtung':
        createEventMutation.mutate({
          typ: 'wildsichtung',
          daten: { zeitpunkt: new Date().toISOString() },
        });
        Alert.alert('Gemeldet', 'Wildsichtung wurde gemeldet.');
        break;
      case 'nachsuche':
        createEventMutation.mutate({
          typ: 'nachsuche',
          daten: { zeitpunkt: new Date().toISOString() },
        });
        Alert.alert('Gemeldet', 'Nachsuche wurde gemeldet.');
        break;
      case 'notfall':
        setShowNotfallDialog(true);
        break;
    }
  };

  const handleNotfall = () => {
    createEventMutation.mutate({
      typ: 'notfall',
      daten: {
        zeitpunkt: new Date().toISOString(),
        schweregrad: 'hoch',
      },
    });
    setShowNotfallDialog(false);
    Alert.alert(
      'NOTFALL GEMELDET',
      'Alle Teilnehmer wurden benachrichtigt. Jagdleitung wurde informiert.',
      [{ text: 'OK', style: 'cancel' }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={{
          latitude: jagd.standorte?.[0]?.gps?.latitude || 51.1657,
          longitude: jagd.standorte?.[0]?.gps?.longitude || 10.4515,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
      >
        {/* Standorte Markers */}
        {jagd.standorte?.map((standort) => {
          if (!standort.gps) return null;

          const assignedTeilnehmer = teilnehmer.find(
            (t) => t.zugewiesenerStandort?.id === standort.id
          );

          return (
            <Marker
              key={standort.id}
              coordinate={{
                latitude: standort.gps.latitude,
                longitude: standort.gps.longitude,
              }}
              onPress={() => setSelectedStandort(standort)}
            >
              <View style={styles.markerContainer}>
                <View
                  style={[
                    styles.marker,
                    assignedTeilnehmer?.liveStatus?.status === 'auf_standort' &&
                      styles.markerActive,
                    !assignedTeilnehmer && styles.markerEmpty,
                  ]}
                >
                  <Text style={styles.markerNumber}>{standort.nummer}</Text>
                </View>
                {assignedTeilnehmer?.liveStatus?.status === 'auf_standort' && (
                  <View style={styles.markerPulse} />
                )}
              </View>
              {/* Schussrichtungen als Kreise */}
              {standort.sicherheit?.schussrichtungen && (
                <Circle
                  center={{
                    latitude: standort.gps.latitude,
                    longitude: standort.gps.longitude,
                  }}
                  radius={jagd.regeln.schussEntfernung || 300}
                  strokeColor="rgba(46, 204, 113, 0.3)"
                  fillColor="rgba(46, 204, 113, 0.1)"
                />
              )}
            </Marker>
          );
        })}

        {/* Treibgebiet (wenn aktives Treiben) */}
        {currentTreiben?.treibgebiet && (
          <Circle
            center={{
              latitude: currentTreiben.treibgebiet.center.latitude,
              longitude: currentTreiben.treibgebiet.center.longitude,
            }}
            radius={currentTreiben.treibgebiet.radius || 500}
            strokeColor="rgba(231, 76, 60, 0.5)"
            fillColor="rgba(231, 76, 60, 0.1)"
          />
        )}
      </MapView>

      {/* Header Overlay */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{jagd.name}</Text>
          <View style={styles.headerStatus}>
            <View style={styles.statusDot} />
            <Text style={styles.headerSubtitle}>LIVE</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.navigate('JagdDetails', { jagdId })}
        >
          <Ionicons name="information-circle" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Treiben Info (wenn aktiv) */}
      {currentTreiben && (
        <View style={styles.treibenBanner}>
          <Ionicons name="walk" size={20} color="#fff" />
          <Text style={styles.treibenText}>
            Treiben {currentTreiben.nummer}: {currentTreiben.name}
          </Text>
          <Text style={styles.treibenTime}>
            {new Date(currentTreiben.start!).toLocaleTimeString('de-DE', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      )}

      {/* Standort Info Card */}
      {selectedStandort && (
        <View style={styles.standortInfoCard}>
          <TouchableOpacity
            style={styles.standortInfoClose}
            onPress={() => setSelectedStandort(null)}
          >
            <Ionicons name="close" size={20} color="#666" />
          </TouchableOpacity>
          <View style={styles.standortInfoHeader}>
            <View style={styles.standortInfoBadge}>
              <Text style={styles.standortInfoNumber}>{selectedStandort.nummer}</Text>
            </View>
            <View style={styles.standortInfoContent}>
              <Text style={styles.standortInfoName}>{selectedStandort.name}</Text>
              <Text style={styles.standortInfoTyp}>{getStandortTypLabel(selectedStandort.typ)}</Text>
            </View>
          </View>
          {selectedStandort.beschreibung && (
            <Text style={styles.standortInfoBeschreibung}>{selectedStandort.beschreibung}</Text>
          )}
          {/* Zugewiesene Person */}
          {(() => {
            const assignedTeilnehmer = teilnehmer.find(
              (t) => t.zugewiesenerStandort?.id === selectedStandort.id
            );
            if (!assignedTeilnehmer) return null;

            return (
              <View style={styles.standortInfoTeilnehmer}>
                <Ionicons name="person" size={16} color="#2ecc71" />
                <Text style={styles.standortInfoTeilnehmerName}>
                  {assignedTeilnehmer.name}
                </Text>
                {assignedTeilnehmer.liveStatus && (
                  <View
                    style={[
                      styles.standortInfoStatus,
                      getLiveStatusStyle(assignedTeilnehmer.liveStatus.status),
                    ]}
                  >
                    <Text style={styles.standortInfoStatusText}>
                      {getLiveStatusLabel(assignedTeilnehmer.liveStatus.status)}
                    </Text>
                  </View>
                )}
              </View>
            );
          })()}
        </View>
      )}

      {/* Live Events Panel */}
      <Animated.View
        style={[
          styles.eventsPanel,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Toggle Button */}
        <TouchableOpacity
          style={styles.eventsPanelToggle}
          onPress={() => setShowEvents(!showEvents)}
        >
          <Ionicons
            name={showEvents ? 'chevron-down' : 'chevron-up'}
            size={24}
            color="#666"
          />
          <Text style={styles.eventsPanelToggleText}>
            Live Events ({liveEvents.length})
          </Text>
        </TouchableOpacity>

        {/* Events List */}
        <FlatList
          data={liveEvents}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <LiveEventCard event={item} />}
          contentContainerStyle={styles.eventsList}
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>

      {/* Quick Actions FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowQuickActions(!showQuickActions)}
      >
        <Ionicons
          name={showQuickActions ? 'close' : 'add'}
          size={28}
          color="#fff"
        />
      </TouchableOpacity>

      {/* Quick Actions Menu */}
      {showQuickActions && (
        <View style={styles.quickActionsMenu}>
          <QuickActionButton
            icon="ribbon"
            label="Abschuss"
            color="#2ecc71"
            onPress={() => handleQuickAction('abschuss')}
          />
          <QuickActionButton
            icon="eye"
            label="Sichtung"
            color="#3498db"
            onPress={() => handleQuickAction('sichtung')}
          />
          <QuickActionButton
            icon="search"
            label="Nachsuche"
            color="#f39c12"
            onPress={() => handleQuickAction('nachsuche')}
          />
          <QuickActionButton
            icon="warning"
            label="NOTFALL"
            color="#e74c3c"
            onPress={() => handleQuickAction('notfall')}
          />
        </View>
      )}

      {/* Notfall Dialog */}
      <Modal visible={showNotfallDialog} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.notfallDialog}>
            <View style={styles.notfallHeader}>
              <Ionicons name="warning" size={48} color="#e74c3c" />
              <Text style={styles.notfallTitle}>NOTFALL MELDEN</Text>
            </View>
            <Text style={styles.notfallText}>
              Möchten Sie einen Notfall melden? Alle Teilnehmer werden sofort benachrichtigt.
            </Text>
            <View style={styles.notfallButtons}>
              <TouchableOpacity
                style={styles.notfallCancelButton}
                onPress={() => setShowNotfallDialog(false)}
              >
                <Text style={styles.notfallCancelText}>Abbrechen</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.notfallConfirmButton} onPress={handleNotfall}>
                <Text style={styles.notfallConfirmText}>NOTFALL MELDEN</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ============================================================================
// Quick Action Button Component
// ============================================================================

interface QuickActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
}

function QuickActionButton({ icon, label, color, onPress }: QuickActionButtonProps) {
  return (
    <TouchableOpacity style={styles.quickActionButton} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={24} color="#fff" />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

// ============================================================================
// Live Event Card Component
// ============================================================================

interface LiveEventCardProps {
  event: LiveEvent;
}

function LiveEventCard({ event }: LiveEventCardProps) {
  const { icon, color, label } = getEventTypeInfo(event.typ);
  const isRecent = new Date().getTime() - new Date(event.zeitpunkt).getTime() < 60000; // < 1 min

  return (
    <View style={[styles.eventCard, isRecent && styles.eventCardRecent]}>
      <View style={[styles.eventIconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.eventCardContent}>
        <View style={styles.eventCardHeader}>
          <Text style={[styles.eventCardTyp, { color }]}>{label}</Text>
          <Text style={styles.eventCardTime}>
            {new Date(event.zeitpunkt).toLocaleTimeString('de-DE', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
        <Text style={styles.eventCardVon}>{event.von}</Text>
        {event.daten && renderEventData(event.typ, event.daten)}
      </View>
      {isRecent && <View style={styles.eventCardNewBadge} />}
    </View>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

function getStandortTypLabel(typ: string): string {
  const labels: Record<string, string> = {
    hochsitz: 'Hochsitz',
    kanzel: 'Kanzel',
    ansitz: 'Ansitz',
    stand: 'Stand',
    schirm: 'Schirm',
  };
  return labels[typ] || typ;
}

function getLiveStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    auf_standort: 'Auf Standort',
    unterwegs: 'Unterwegs',
    nicht_bereit: 'Nicht bereit',
  };
  return labels[status] || status;
}

function getLiveStatusStyle(status: string) {
  switch (status) {
    case 'auf_standort':
      return { backgroundColor: '#2ecc71' };
    case 'unterwegs':
      return { backgroundColor: '#f39c12' };
    case 'nicht_bereit':
      return { backgroundColor: '#e74c3c' };
    default:
      return { backgroundColor: '#95a5a6' };
  }
}

function getEventTypeInfo(typ: string): {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  label: string;
} {
  switch (typ) {
    case 'abschuss':
      return { icon: 'ribbon', color: '#2ecc71', label: 'Abschuss' };
    case 'nachsuche':
      return { icon: 'search', color: '#f39c12', label: 'Nachsuche' };
    case 'wildsichtung':
      return { icon: 'eye', color: '#3498db', label: 'Wildsichtung' };
    case 'standort_erreicht':
      return { icon: 'checkmark-circle', color: '#2ecc71', label: 'Standort erreicht' };
    case 'treiben_start':
      return { icon: 'play-circle', color: '#3498db', label: 'Treiben Start' };
    case 'treiben_ende':
      return { icon: 'stop-circle', color: '#95a5a6', label: 'Treiben Ende' };
    case 'notfall':
      return { icon: 'warning', color: '#e74c3c', label: 'NOTFALL' };
    case 'nachricht':
      return { icon: 'chatbubble', color: '#3498db', label: 'Nachricht' };
    case 'pause':
      return { icon: 'pause-circle', color: '#95a5a6', label: 'Pause' };
    case 'jagd_ende':
      return { icon: 'flag', color: '#2ecc71', label: 'Jagd Ende' };
    default:
      return { icon: 'information-circle', color: '#95a5a6', label: 'Info' };
  }
}

function renderEventData(typ: string, daten: any): React.ReactNode {
  switch (typ) {
    case 'abschuss':
      return (
        <Text style={styles.eventCardData}>
          {daten.wildart} • {daten.geschlecht} • {daten.altersklasse}
        </Text>
      );
    case 'wildsichtung':
      return (
        <Text style={styles.eventCardData}>
          {daten.wildart ? `${daten.wildart} gesichtet` : 'Wild gesichtet'}
        </Text>
      );
    case 'notfall':
      return (
        <Text style={[styles.eventCardData, { color: '#e74c3c', fontWeight: '600' }]}>
          {daten.beschreibung || 'Notfall gemeldet - Jagd unterbrochen'}
        </Text>
      );
    default:
      return null;
  }
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingText: {
    fontSize: 16,
    color: '#fff',
  },

  // Map
  map: {
    ...StyleSheet.absoluteFillObject,
  },

  // Marker
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  marker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#95a5a6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerActive: {
    borderColor: '#2ecc71',
  },
  markerEmpty: {
    borderColor: '#e74c3c',
  },
  markerNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  markerPulse: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(46, 204, 113, 0.3)',
  },

  // Header
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backButton: {
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  headerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e74c3c',
    marginRight: 6,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#e74c3c',
  },
  headerButton: {
    marginLeft: 12,
  },

  // Treiben Banner
  treibenBanner: {
    position: 'absolute',
    top: 100,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f39c12',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  treibenText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  treibenTime: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },

  // Standort Info Card
  standortInfoCard: {
    position: 'absolute',
    top: 160,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  standortInfoClose: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },
  standortInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  standortInfoBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2ecc71',
    justifyContent: 'center',
    alignItems: 'center',
  },
  standortInfoNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  standortInfoContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 24,
  },
  standortInfoName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  standortInfoTyp: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  standortInfoBeschreibung: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  standortInfoTeilnehmer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  standortInfoTeilnehmerName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2ecc71',
    marginLeft: 6,
    flex: 1,
  },
  standortInfoStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  standortInfoStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },

  // Events Panel
  eventsPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 300,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  eventsPanelToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  eventsPanelToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 8,
  },
  eventsList: {
    padding: 16,
    paddingBottom: 100,
  },

  // Event Card
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  eventCardRecent: {
    backgroundColor: '#e8f5e9',
    borderWidth: 1,
    borderColor: '#2ecc71',
  },
  eventIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventCardContent: {
    flex: 1,
  },
  eventCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventCardTyp: {
    fontSize: 14,
    fontWeight: '600',
  },
  eventCardTime: {
    fontSize: 11,
    color: '#666',
  },
  eventCardVon: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  eventCardData: {
    fontSize: 12,
    color: '#1a1a1a',
  },
  eventCardNewBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2ecc71',
    position: 'absolute',
    top: 12,
    right: 12,
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 320,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2ecc71',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },

  // Quick Actions Menu
  quickActionsMenu: {
    position: 'absolute',
    bottom: 390,
    right: 20,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  quickActionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },

  // Notfall Dialog
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notfallDialog: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  notfallHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  notfallTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#e74c3c',
    marginTop: 12,
  },
  notfallText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  notfallButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  notfallCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  notfallCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  notfallConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#e74c3c',
    alignItems: 'center',
  },
  notfallConfirmText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});
