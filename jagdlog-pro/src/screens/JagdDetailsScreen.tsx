import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GesellschaftsjagdService } from '../services/gesellschaftsjagdService';
import type { Gesellschaftsjagd, Teilnehmer, JagdStandort, StreckenAbschuss, LiveEvent } from '../types/gesellschaftsjagd';

// Navigation Types
type RootStackParamList = {
  JagdDetails: { jagdId: string };
  LiveJagd: { jagdId: string };
  AbschussErfassen: { jagdId: string };
  StreckeLegen: { jagdId: string };
};

type JagdDetailsScreenRouteProp = RouteProp<RootStackParamList, 'JagdDetails'>;
type JagdDetailsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'JagdDetails'>;

// Tab Type
type Tab = 'uebersicht' | 'teilnehmer' | 'standorte' | 'kommunikation' | 'strecke';

const { width } = Dimensions.get('window');

export default function JagdDetailsScreen() {
  const route = useRoute<JagdDetailsScreenRouteProp>();
  const navigation = useNavigation<JagdDetailsScreenNavigationProp>();
  const queryClient = useQueryClient();
  const { jagdId } = route.params;

  const [activeTab, setActiveTab] = useState<Tab>('uebersicht');

  // TODO: Get database instance from context
  const db = null as any;
  const jagdService = new GesellschaftsjagdService(db);

  // Load Jagd with all details
  const { data: jagd, isLoading, refetch } = useQuery({
    queryKey: ['gesellschaftsjagd', jagdId],
    queryFn: () => jagdService.getJagd(jagdId),
  });

  // Load Live Events
  const { data: liveEvents = [] } = useQuery({
    queryKey: ['jagd-live-events', jagdId],
    queryFn: () => jagdService.getLiveEvents(jagdId, 50),
    refetchInterval: jagd?.status === 'aktiv' ? 5000 : false, // Refresh every 5s if active
  });

  // Teilnehmer bestätigen mutation
  const confirmTeilnehmerMutation = useMutation({
    mutationFn: ({ teilnehmerId }: { teilnehmerId: string }) =>
      jagdService.updateTeilnehmerStatus(teilnehmerId, 'bestaetigt'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gesellschaftsjagd', jagdId] });
      Alert.alert('Erfolg', 'Teilnehmer wurde bestätigt.');
    },
  });

  // Standort-Zuweisung bestätigen mutation
  const confirmZuweisungMutation = useMutation({
    mutationFn: ({ zuweisungId }: { zuweisungId: string }) =>
      jagdService.confirmStandortZuweisung(zuweisungId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gesellschaftsjagd', jagdId] });
      Alert.alert('Erfolg', 'Standort-Zuweisung wurde bestätigt.');
    },
  });

  if (isLoading || !jagd) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Lade Jagd-Details...</Text>
      </View>
    );
  }

  const isActive = jagd.status === 'aktiv';
  const isPlanned = jagd.status === 'geplant';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {jagd.name}
          </Text>
          <Text style={styles.headerSubtitle}>
            {getTypLabel(jagd.typ)} • {getStatusLabel(jagd.status)}
          </Text>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#1a1a1a" />
        </TouchableOpacity>
      </View>

      {/* Quick Action Bar (nur wenn aktiv) */}
      {isActive && (
        <View style={styles.quickActionBar}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('LiveJagd', { jagdId })}
          >
            <Ionicons name="map" size={20} color="#fff" />
            <Text style={styles.quickActionText}>Live Map</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('AbschussErfassen', { jagdId })}
          >
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={styles.quickActionText}>Abschuss</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <Ionicons name="warning" size={20} color="#fff" />
            <Text style={styles.quickActionText}>Notfall</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TabButton
            label="Übersicht"
            icon="information-circle"
            active={activeTab === 'uebersicht'}
            onPress={() => setActiveTab('uebersicht')}
          />
          <TabButton
            label={`Teilnehmer (${jagd.teilnehmer?.length || 0})`}
            icon="people"
            active={activeTab === 'teilnehmer'}
            onPress={() => setActiveTab('teilnehmer')}
          />
          <TabButton
            label={`Standorte (${jagd.standorte?.length || 0})`}
            icon="location"
            active={activeTab === 'standorte'}
            onPress={() => setActiveTab('standorte')}
          />
          <TabButton
            label="Kommunikation"
            icon="chatbubbles"
            active={activeTab === 'kommunikation'}
            onPress={() => setActiveTab('kommunikation')}
            badge={liveEvents.length > 0 ? liveEvents.length : undefined}
          />
          <TabButton
            label={`Strecke (${jagd.strecke?.gesamt || 0})`}
            icon="ribbon"
            active={activeTab === 'strecke'}
            onPress={() => setActiveTab('strecke')}
          />
        </ScrollView>
      </View>

      {/* Tab Content */}
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
      >
        {activeTab === 'uebersicht' && <UebersichtTab jagd={jagd} />}
        {activeTab === 'teilnehmer' && (
          <TeilnehmerTab
            teilnehmer={jagd.teilnehmer || []}
            onConfirm={(id) => confirmTeilnehmerMutation.mutate({ teilnehmerId: id })}
          />
        )}
        {activeTab === 'standorte' && (
          <StandorteTab
            standorte={jagd.standorte || []}
            zuweisungen={jagd.standortZuweisungen || []}
            teilnehmer={jagd.teilnehmer || []}
            onConfirmZuweisung={(id) => confirmZuweisungMutation.mutate({ zuweisungId: id })}
          />
        )}
        {activeTab === 'kommunikation' && <KommunikationTab events={liveEvents} />}
        {activeTab === 'strecke' && (
          <StreckeTab jagdId={jagdId} onNavigateToStreckeLegen={() => navigation.navigate('StreckeLegen', { jagdId })} />
        )}
      </ScrollView>
    </View>
  );
}

// ============================================================================
// Tab Button Component
// ============================================================================

interface TabButtonProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
  badge?: number;
}

function TabButton({ label, icon, active, onPress, badge }: TabButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.tabButton, active && styles.tabButtonActive]}
      onPress={onPress}
    >
      <View style={styles.tabButtonContent}>
        <Ionicons name={icon} size={18} color={active ? '#2ecc71' : '#666'} />
        <Text style={[styles.tabButtonText, active && styles.tabButtonTextActive]}>
          {label}
        </Text>
        {badge !== undefined && (
          <View style={styles.tabBadge}>
            <Text style={styles.tabBadgeText}>{badge > 99 ? '99+' : badge}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ============================================================================
// Übersicht Tab
// ============================================================================

interface UebersichtTabProps {
  jagd: Gesellschaftsjagd;
}

function UebersichtTab({ jagd }: UebersichtTabProps) {
  const zeitplan = jagd.zeitplan;
  const sicherheit = jagd.sicherheit;

  return (
    <View style={styles.tabContent}>
      {/* Basis-Informationen */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basis-Informationen</Text>
        <View style={styles.card}>
          <InfoRow label="Jagdleiter" value={jagd.jagdleiter.name} icon="person" />
          <InfoRow
            label="Datum"
            value={new Date(jagd.datum).toLocaleDateString('de-DE', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
            icon="calendar"
          />
          <InfoRow
            label="Max. Teilnehmer"
            value={`${jagd.teilnehmer?.length || 0} / ${jagd.maxTeilnehmer}`}
            icon="people"
          />
          {jagd.anmeldeschluss && (
            <InfoRow
              label="Anmeldeschluss"
              value={new Date(jagd.anmeldeschluss).toLocaleDateString('de-DE')}
              icon="time"
            />
          )}
        </View>
      </View>

      {/* Zeitplan */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Zeitplan</Text>
        <View style={styles.card}>
          <InfoRow label="Sammeln" value={zeitplan.sammeln} icon="people-circle" />
          <InfoRow label="Ansprechen" value={zeitplan.ansprechen} icon="chatbubbles" />
          <InfoRow label="Jagd-Beginn" value={zeitplan.jagdBeginn} icon="play-circle" />
          <InfoRow label="Jagd-Ende" value={zeitplan.jagdEnde} icon="stop-circle" />
          {zeitplan.streckeZeigen && (
            <InfoRow label="Strecke zeigen" value={zeitplan.streckeZeigen} icon="ribbon" />
          )}
        </View>
      </View>

      {/* Sicherheit */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sicherheit & Notfall</Text>
        <View style={styles.card}>
          <InfoRow label="Notfallkontakt" value={sicherheit.notfallkontakt} icon="medical" />
          {sicherheit.sammelplatz && (
            <InfoRow label="Sammelplatz" value={sicherheit.sammelplatz} icon="flag" />
          )}
          {sicherheit.notfallplan && (
            <View style={styles.infoRowContainer}>
              <Ionicons name="shield-checkmark" size={16} color="#666" />
              <View style={styles.infoRowContent}>
                <Text style={styles.infoLabel}>Notfallplan</Text>
                <Text style={styles.infoValue}>{sicherheit.notfallplan}</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Regeln */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Jagd-Regeln</Text>
        <View style={styles.card}>
          <InfoRow
            label="Wildarten"
            value={jagd.regeln.wildarten.join(', ')}
            icon="paw"
          />
          <InfoRow
            label="Schussentfernung"
            value={`Max. ${jagd.regeln.schussEntfernung}m`}
            icon="navigate"
          />
          {jagd.regeln.besondereVorschriften && (
            <View style={styles.infoRowContainer}>
              <Ionicons name="document-text" size={16} color="#666" />
              <View style={styles.infoRowContent}>
                <Text style={styles.infoLabel}>Besondere Vorschriften</Text>
                <Text style={styles.infoValue}>{jagd.regeln.besondereVorschriften}</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Treiben (falls vorhanden) */}
      {jagd.treiben && jagd.treiben.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Treiben ({jagd.treiben.length})</Text>
          <View style={styles.card}>
            {jagd.treiben.map((treiben, index) => (
              <View key={treiben.id} style={styles.treibenItem}>
                <View style={styles.treibenHeader}>
                  <Text style={styles.treibenNummer}>Treiben {treiben.nummer}</Text>
                  <View
                    style={[
                      styles.treibenStatus,
                      treiben.status === 'aktiv' && styles.treibenStatusActive,
                      treiben.status === 'abgeschlossen' && styles.treibenStatusComplete,
                    ]}
                  >
                    <Text style={styles.treibenStatusText}>{getStatusLabel(treiben.status)}</Text>
                  </View>
                </View>
                <Text style={styles.treibenName}>{treiben.name}</Text>
                {treiben.start && (
                  <Text style={styles.treibenTime}>
                    Start: {new Date(treiben.start).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

// ============================================================================
// Teilnehmer Tab
// ============================================================================

interface TeilnehmerTabProps {
  teilnehmer: Teilnehmer[];
  onConfirm: (teilnehmerId: string) => void;
}

function TeilnehmerTab({ teilnehmer, onConfirm }: TeilnehmerTabProps) {
  // Gruppieren nach Status
  const bestaetigt = teilnehmer.filter((t) => t.anmeldung.status === 'bestaetigt');
  const angemeldet = teilnehmer.filter((t) => t.anmeldung.status === 'angemeldet');
  const abgesagt = teilnehmer.filter((t) => t.anmeldung.status === 'abgesagt');

  return (
    <View style={styles.tabContent}>
      {/* Bestätigt */}
      {bestaetigt.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bestätigt ({bestaetigt.length})</Text>
          {bestaetigt.map((teilnehmer) => (
            <TeilnehmerCard key={teilnehmer.id} teilnehmer={teilnehmer} />
          ))}
        </View>
      )}

      {/* Angemeldet (warten auf Bestätigung) */}
      {angemeldet.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Warten auf Bestätigung ({angemeldet.length})</Text>
          {angemeldet.map((teilnehmer) => (
            <TeilnehmerCard
              key={teilnehmer.id}
              teilnehmer={teilnehmer}
              showConfirmButton
              onConfirm={() => onConfirm(teilnehmer.id)}
            />
          ))}
        </View>
      )}

      {/* Abgesagt */}
      {abgesagt.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Abgesagt ({abgesagt.length})</Text>
          {abgesagt.map((teilnehmer) => (
            <TeilnehmerCard key={teilnehmer.id} teilnehmer={teilnehmer} />
          ))}
        </View>
      )}

      {teilnehmer.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Noch keine Teilnehmer</Text>
        </View>
      )}
    </View>
  );
}

interface TeilnehmerCardProps {
  teilnehmer: Teilnehmer;
  showConfirmButton?: boolean;
  onConfirm?: () => void;
}

function TeilnehmerCard({ teilnehmer, showConfirmButton, onConfirm }: TeilnehmerCardProps) {
  const ausruestung = teilnehmer.ausruestung;
  const erfahrung = teilnehmer.erfahrung;

  return (
    <View style={styles.teilnehmerCard}>
      <View style={styles.teilnehmerHeader}>
        <View style={styles.teilnehmerAvatar}>
          <Text style={styles.teilnehmerAvatarText}>
            {teilnehmer.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()}
          </Text>
        </View>
        <View style={styles.teilnehmerInfo}>
          <Text style={styles.teilnehmerName}>{teilnehmer.name}</Text>
          <View style={styles.teilnehmerMeta}>
            <View style={styles.rolleTag}>
              <Text style={styles.rolleText}>{getRolleLabel(teilnehmer.rolle)}</Text>
            </View>
            {teilnehmer.liveStatus && (
              <View style={[styles.liveStatus, getLiveStatusStyle(teilnehmer.liveStatus.status)]}>
                <View style={styles.liveStatusDot} />
                <Text style={styles.liveStatusText}>{teilnehmer.liveStatus.status}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Kontakt */}
      <View style={styles.teilnehmerDetails}>
        {teilnehmer.telefon && (
          <View style={styles.detailRow}>
            <Ionicons name="call" size={14} color="#666" />
            <Text style={styles.detailText}>{teilnehmer.telefon}</Text>
          </View>
        )}
        {teilnehmer.email && (
          <View style={styles.detailRow}>
            <Ionicons name="mail" size={14} color="#666" />
            <Text style={styles.detailText}>{teilnehmer.email}</Text>
          </View>
        )}
      </View>

      {/* Ausrüstung */}
      <View style={styles.teilnehmerDetails}>
        <Text style={styles.detailTitle}>Ausrüstung</Text>
        <Text style={styles.detailText}>
          {ausruestung.waffe} • {ausruestung.optik} • {ausruestung.munition}
        </Text>
        <View style={styles.ausruestungTags}>
          {ausruestung.signalweste && (
            <View style={styles.ausruestungTag}>
              <Ionicons name="checkmark-circle" size={12} color="#2ecc71" />
              <Text style={styles.ausruestungTagText}>Warnweste</Text>
            </View>
          )}
          {ausruestung.funkgeraet && (
            <View style={styles.ausruestungTag}>
              <Ionicons name="checkmark-circle" size={12} color="#2ecc71" />
              <Text style={styles.ausruestungTagText}>Funkgerät</Text>
            </View>
          )}
        </View>
      </View>

      {/* Erfahrung */}
      <View style={styles.teilnehmerDetails}>
        <Text style={styles.detailTitle}>Erfahrung</Text>
        <Text style={styles.detailText}>
          {erfahrung.jahreSeit} Jahre • {erfahrung.gesellschaftsjagdenAnzahl} Gesellschaftsjagden
        </Text>
        {erfahrung.standortPraeferenz && (
          <Text style={styles.detailText}>Präferenz: {erfahrung.standortPraeferenz}</Text>
        )}
      </View>

      {/* Standort-Zuweisung */}
      {teilnehmer.zugewiesenerStandort && (
        <View style={styles.standortZuweisung}>
          <Ionicons name="location" size={16} color="#2ecc71" />
          <Text style={styles.standortZuweisungText}>
            Standort {teilnehmer.zugewiesenerStandort.nummer}: {teilnehmer.zugewiesenerStandort.name}
          </Text>
        </View>
      )}

      {/* Bestätigen Button */}
      {showConfirmButton && (
        <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
          <Text style={styles.confirmButtonText}>Bestätigen</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ============================================================================
// Standorte Tab
// ============================================================================

interface StandorteTabProps {
  standorte: JagdStandort[];
  zuweisungen: any[];
  teilnehmer: Teilnehmer[];
  onConfirmZuweisung: (zuweisungId: string) => void;
}

function StandorteTab({ standorte, zuweisungen, teilnehmer, onConfirmZuweisung }: StandorteTabProps) {
  return (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Standorte ({standorte.length})</Text>
        {standorte.map((standort) => {
          const zuweisung = zuweisungen.find((z) => z.standortId === standort.id);
          const assignedTeilnehmer = zuweisung
            ? teilnehmer.find((t) => t.id === zuweisung.teilnehmerId)
            : null;

          return (
            <StandortCard
              key={standort.id}
              standort={standort}
              assignedTeilnehmer={assignedTeilnehmer}
              zuweisung={zuweisung}
              onConfirmZuweisung={onConfirmZuweisung}
            />
          );
        })}
      </View>

      {standorte.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="location-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Noch keine Standorte definiert</Text>
        </View>
      )}
    </View>
  );
}

interface StandortCardProps {
  standort: JagdStandort;
  assignedTeilnehmer?: Teilnehmer | null;
  zuweisung?: any;
  onConfirmZuweisung: (zuweisungId: string) => void;
}

function StandortCard({ standort, assignedTeilnehmer, zuweisung, onConfirmZuweisung }: StandortCardProps) {
  return (
    <View style={styles.standortCard}>
      <View style={styles.standortHeader}>
        <View style={styles.standortNummerBadge}>
          <Text style={styles.standortNummer}>{standort.nummer}</Text>
        </View>
        <View style={styles.standortHeaderText}>
          <Text style={styles.standortName}>{standort.name}</Text>
          <Text style={styles.standortTyp}>{getStandortTypLabel(standort.typ)}</Text>
        </View>
        <View
          style={[
            styles.standortStatusDot,
            standort.status === 'besetzt' && styles.standortStatusBesetzt,
            standort.status === 'verfuegbar' && styles.standortStatusVerfuegbar,
          ]}
        />
      </View>

      {standort.beschreibung && (
        <Text style={styles.standortBeschreibung}>{standort.beschreibung}</Text>
      )}

      {/* GPS Koordinaten */}
      {standort.gps && (
        <View style={styles.standortGPS}>
          <Ionicons name="navigate" size={14} color="#666" />
          <Text style={styles.standortGPSText}>
            {standort.gps.latitude.toFixed(5)}, {standort.gps.longitude.toFixed(5)}
          </Text>
        </View>
      )}

      {/* Eigenschaften */}
      {standort.eigenschaften && (
        <View style={styles.eigenschaftenContainer}>
          {standort.eigenschaften.ueberdacht && (
            <View style={styles.eigenschaft}>
              <Ionicons name="umbrella" size={14} color="#2ecc71" />
              <Text style={styles.eigenschaftText}>Überdacht</Text>
            </View>
          )}
          {standort.eigenschaften.beheizt && (
            <View style={styles.eigenschaft}>
              <Ionicons name="flame" size={14} color="#e74c3c" />
              <Text style={styles.eigenschaftText}>Beheizt</Text>
            </View>
          )}
          {standort.eigenschaften.barrierefrei && (
            <View style={styles.eigenschaft}>
              <Ionicons name="accessibility" size={14} color="#3498db" />
              <Text style={styles.eigenschaftText}>Barrierefrei</Text>
            </View>
          )}
          <View style={styles.eigenschaft}>
            <Ionicons name="people" size={14} color="#666" />
            <Text style={styles.eigenschaftText}>Kapazität: {standort.eigenschaften.kapazitaet}</Text>
          </View>
        </View>
      )}

      {/* Zugewiesene Person */}
      {assignedTeilnehmer && (
        <View style={styles.zuweisungContainer}>
          <View style={styles.zuweisungHeader}>
            <Ionicons name="person" size={16} color="#2ecc71" />
            <Text style={styles.zuweisungText}>{assignedTeilnehmer.name}</Text>
          </View>
          {zuweisung && !zuweisung.bestaetigt && (
            <TouchableOpacity
              style={styles.miniConfirmButton}
              onPress={() => onConfirmZuweisung(zuweisung.id)}
            >
              <Ionicons name="checkmark" size={16} color="#fff" />
            </TouchableOpacity>
          )}
          {zuweisung?.bestaetigt && (
            <View style={styles.bestaetigtBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#2ecc71" />
              <Text style={styles.bestaetigtText}>Bestätigt</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

// ============================================================================
// Kommunikation Tab
// ============================================================================

interface KommunikationTabProps {
  events: LiveEvent[];
}

function KommunikationTab({ events }: KommunikationTabProps) {
  return (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Live Events ({events.length})</Text>
        {events.map((event) => (
          <LiveEventCard key={event.id} event={event} />
        ))}
      </View>

      {events.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Noch keine Events</Text>
          <Text style={styles.emptySubtext}>Events erscheinen hier während der Jagd</Text>
        </View>
      )}
    </View>
  );
}

interface LiveEventCardProps {
  event: LiveEvent;
}

function LiveEventCard({ event }: LiveEventCardProps) {
  const { icon, color, label } = getEventTypeInfo(event.typ);

  return (
    <View style={styles.eventCard}>
      <View style={[styles.eventIconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.eventContent}>
        <View style={styles.eventHeader}>
          <Text style={styles.eventTyp}>{label}</Text>
          <Text style={styles.eventTime}>
            {new Date(event.zeitpunkt).toLocaleTimeString('de-DE', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
        <Text style={styles.eventVon}>{event.von}</Text>
        {event.daten && (
          <Text style={styles.eventDaten}>{JSON.stringify(event.daten, null, 2)}</Text>
        )}
      </View>
    </View>
  );
}

// ============================================================================
// Strecke Tab
// ============================================================================

interface StreckeTabProps {
  jagdId: string;
  onNavigateToStreckeLegen: () => void;
}

function StreckeTab({ jagdId, onNavigateToStreckeLegen }: StreckeTabProps) {
  // TODO: Get database instance from context
  const db = null as any;
  const jagdService = new GesellschaftsjagdService(db);

  const { data: abschuesse = [], isLoading } = useQuery({
    queryKey: ['strecken-abschuesse', jagdId],
    queryFn: () => jagdService.getStreckenAbschuesse(jagdId),
  });

  const { data: zusammenfassung } = useQuery({
    queryKey: ['strecke-zusammenfassung', jagdId],
    queryFn: () => jagdService.getStreckenzusammenfassung(jagdId),
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Lade Strecke...</Text>
      </View>
    );
  }

  return (
    <View style={styles.tabContent}>
      {/* Zusammenfassung */}
      {zusammenfassung && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Zusammenfassung</Text>
          <View style={styles.card}>
            <View style={styles.streckeStats}>
              <View style={styles.streckeStat}>
                <Text style={styles.streckeStatValue}>{zusammenfassung.gesamt || 0}</Text>
                <Text style={styles.streckeStatLabel}>Gesamt</Text>
              </View>
              {Object.entries(zusammenfassung.nachWildart || {}).map(([wildart, anzahl]) => (
                <View key={wildart} style={styles.streckeStat}>
                  <Text style={styles.streckeStatValue}>{anzahl as number}</Text>
                  <Text style={styles.streckeStatLabel}>{wildart}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Abschuss-Liste */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Abschüsse ({abschuesse.length})</Text>
          <TouchableOpacity style={styles.streckeLegenButton} onPress={onNavigateToStreckeLegen}>
            <Ionicons name="camera" size={16} color="#fff" />
            <Text style={styles.streckeLegenButtonText}>Strecke legen</Text>
          </TouchableOpacity>
        </View>
        {abschuesse.map((abschuss) => (
          <AbschussCard key={abschuss.id} abschuss={abschuss} />
        ))}
      </View>

      {abschuesse.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="ribbon-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Noch keine Abschüsse</Text>
          <Text style={styles.emptySubtext}>Abschüsse werden hier angezeigt</Text>
        </View>
      )}
    </View>
  );
}

interface AbschussCardProps {
  abschuss: StreckenAbschuss;
}

function AbschussCard({ abschuss }: AbschussCardProps) {
  return (
    <View style={styles.abschussCard}>
      <View style={styles.abschussHeader}>
        <View style={styles.abschussWildart}>
          <Ionicons name="paw" size={16} color="#2ecc71" />
          <Text style={styles.abschussWildartText}>{abschuss.wildart}</Text>
        </View>
        <Text style={styles.abschussTime}>
          {new Date(abschuss.zeitpunkt).toLocaleTimeString('de-DE', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
      <View style={styles.abschussDetails}>
        <Text style={styles.abschussSchuetze}>Schütze: {abschuss.schuetzeId}</Text>
        <Text style={styles.abschussInfo}>
          {abschuss.geschlecht} • {abschuss.altersklasse} • Anzahl: {abschuss.anzahl}
        </Text>
        {abschuss.standortId && (
          <Text style={styles.abschussStandort}>Standort: {abschuss.standortId}</Text>
        )}
      </View>
    </View>
  );
}

// ============================================================================
// Info Row Component
// ============================================================================

interface InfoRowProps {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
}

function InfoRow({ label, value, icon }: InfoRowProps) {
  return (
    <View style={styles.infoRowContainer}>
      <Ionicons name={icon} size={16} color="#666" />
      <View style={styles.infoRowContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

function getTypLabel(typ: string): string {
  const labels: Record<string, string> = {
    drueckjagd: 'Drückjagd',
    treibjagd: 'Treibjagd',
    bewegungsjagd: 'Bewegungsjagd',
    ansitz_gruppe: 'Ansitzjagd (Gruppe)',
    riegeljagd: 'Riegeljagd',
  };
  return labels[typ] || typ;
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    geplant: 'Geplant',
    aktiv: 'Aktiv',
    abgeschlossen: 'Abgeschlossen',
    abgebrochen: 'Abgebrochen',
  };
  return labels[status] || status;
}

function getRolleLabel(rolle: string): string {
  const labels: Record<string, string> = {
    schuetze: 'Schütze',
    treiber: 'Treiber',
    hundefuehrer: 'Hundeführer',
  };
  return labels[rolle] || rolle;
}

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

function getEventTypeInfo(typ: string): { icon: keyof typeof Ionicons.glyphMap; color: string; label: string } {
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
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
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
  moreButton: {
    marginLeft: 12,
  },

  // Quick Action Bar
  quickActionBar: {
    flexDirection: 'row',
    backgroundColor: '#2ecc71',
    padding: 12,
  },
  quickAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
  },
  quickActionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },

  // Tabs
  tabContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#2ecc71',
  },
  tabButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabButtonText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  tabButtonTextActive: {
    color: '#2ecc71',
    fontWeight: '600',
  },
  tabBadge: {
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  tabBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },

  // Content
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },

  // Info Row
  infoRowContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoRowContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: '#1a1a1a',
  },

  // Treiben
  treibenItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  treibenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  treibenNummer: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2ecc71',
  },
  treibenStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: '#95a5a6',
  },
  treibenStatusActive: {
    backgroundColor: '#2ecc71',
  },
  treibenStatusComplete: {
    backgroundColor: '#3498db',
  },
  treibenStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  treibenName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  treibenTime: {
    fontSize: 12,
    color: '#666',
  },

  // Teilnehmer Card
  teilnehmerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  teilnehmerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  teilnehmerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2ecc71',
    justifyContent: 'center',
    alignItems: 'center',
  },
  teilnehmerAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  teilnehmerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  teilnehmerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  teilnehmerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rolleTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: '#e3f2fd',
    marginRight: 8,
  },
  rolleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3498db',
  },
  liveStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  liveStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
    marginRight: 4,
  },
  liveStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  teilnehmerDetails: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  ausruestungTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  ausruestungTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 4,
  },
  ausruestungTagText: {
    fontSize: 11,
    color: '#2ecc71',
    marginLeft: 4,
  },
  standortZuweisung: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  standortZuweisungText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2ecc71',
    marginLeft: 6,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2ecc71',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 6,
  },

  // Standort Card
  standortCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  standortHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  standortNummerBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2ecc71',
    justifyContent: 'center',
    alignItems: 'center',
  },
  standortNummer: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  standortHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  standortName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  standortTyp: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  standortStatusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#95a5a6',
  },
  standortStatusBesetzt: {
    backgroundColor: '#e74c3c',
  },
  standortStatusVerfuegbar: {
    backgroundColor: '#2ecc71',
  },
  standortBeschreibung: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  standortGPS: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  standortGPSText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 6,
  },
  eigenschaftenContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  eigenschaft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  eigenschaftText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
  },
  zuweisungContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  zuweisungHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  zuweisungText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2ecc71',
    marginLeft: 6,
  },
  miniConfirmButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2ecc71',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bestaetigtBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bestaetigtText: {
    fontSize: 11,
    color: '#2ecc71',
    marginLeft: 4,
  },

  // Event Card
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  eventIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventContent: {
    flex: 1,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventTyp: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  eventTime: {
    fontSize: 11,
    color: '#666',
  },
  eventVon: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  eventDaten: {
    fontSize: 11,
    color: '#666',
    fontFamily: 'monospace',
  },

  // Strecke
  streckeStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  streckeStat: {
    width: width / 4 - 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  streckeStatValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2ecc71',
  },
  streckeStatLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },
  streckeLegenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2ecc71',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  streckeLegenButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 6,
  },
  abschussCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  abschussHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  abschussWildart: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  abschussWildartText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2ecc71',
    marginLeft: 6,
  },
  abschussTime: {
    fontSize: 11,
    color: '#666',
  },
  abschussDetails: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8,
  },
  abschussSchuetze: {
    fontSize: 12,
    color: '#1a1a1a',
    marginBottom: 4,
  },
  abschussInfo: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  abschussStandort: {
    fontSize: 11,
    color: '#666',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});
