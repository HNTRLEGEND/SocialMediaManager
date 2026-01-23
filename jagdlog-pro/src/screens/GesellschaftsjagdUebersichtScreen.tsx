/**
 * GESELLSCHAFTSJAGD ÜBERSICHT SCREEN
 * Phase 6: Group Hunting Management
 * HNTR LEGEND Pro
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Gesellschaftsjagd } from '../types/gesellschaftsjagd';
import { GesellschaftsjagdService } from '../services/gesellschaftsjagdService';
import { databaseService } from '../services/databaseService';

type FilterStatus = 'alle' | 'geplant' | 'aktiv' | 'abgeschlossen';

export default function GesellschaftsjagdUebersichtScreen() {
  const navigation = useNavigation();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('alle');
  
  const jagdService = new GesellschaftsjagdService(databaseService.db!);
  
  // Load Jagden for current user
  const { data: jagden = [], isLoading, refetch } = useQuery({
    queryKey: ['gesellschaftsjagden', filterStatus],
    queryFn: async () => {
      const userId = 'user-001'; // TODO: Get from auth
      const allJagden = await jagdService.getJagdenForUser(userId);
      
      if (filterStatus === 'alle') {
        return allJagden;
      }
      return allJagden.filter(j => j.status === filterStatus);
    }
  });
  
  const handleCreateJagd = () => {
    navigation.navigate('JagdErstellen' as never);
  };
  
  const handleJagdPress = (jagd: Gesellschaftsjagd) => {
    navigation.navigate('JagdDetails' as never, { jagdId: jagd.id } as never);
  };
  
  const renderJagdCard = ({ item }: { item: Gesellschaftsjagd }) => {
    return <JagdCard jagd={item} onPress={() => handleJagdPress(item)} />;
  };
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gesellschaftsjagden</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleCreateJagd}>
          <Ionicons name="add-circle" size={32} color="#2E7D32" />
        </TouchableOpacity>
      </View>
      
      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <FilterButton
          label="Alle"
          active={filterStatus === 'alle'}
          onPress={() => setFilterStatus('alle')}
        />
        <FilterButton
          label="Geplant"
          active={filterStatus === 'geplant'}
          onPress={() => setFilterStatus('geplant')}
          count={jagden.filter(j => j.status === 'geplant').length}
        />
        <FilterButton
          label="Aktiv"
          active={filterStatus === 'aktiv'}
          onPress={() => setFilterStatus('aktiv')}
          count={jagden.filter(j => j.status === 'aktiv').length}
        />
        <FilterButton
          label="Abgeschlossen"
          active={filterStatus === 'abgeschlossen'}
          onPress={() => setFilterStatus('abgeschlossen')}
          count={jagden.filter(j => j.status === 'abgeschlossen').length}
        />
      </View>
      
      {/* Jagd Liste */}
      <FlatList
        data={jagden}
        renderItem={renderJagdCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#999" />
            <Text style={styles.emptyText}>Keine Gesellschaftsjagden</Text>
            <Text style={styles.emptySubtext}>
              Erstelle deine erste Gesellschaftsjagd
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={handleCreateJagd}>
              <Text style={styles.emptyButtonText}>Jagd erstellen</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

// ============================================================================
// JAGD CARD COMPONENT
// ============================================================================

interface JagdCardProps {
  jagd: Gesellschaftsjagd;
  onPress: () => void;
}

function JagdCard({ jagd, onPress }: JagdCardProps) {
  const getBadge = () => {
    const heute = new Date();
    heute.setHours(0, 0, 0, 0);
    
    const jagdDatum = new Date(jagd.datum);
    jagdDatum.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((jagdDatum.getTime() - heute.getTime()) / (1000 * 60 * 60 * 24));
    
    if (jagd.status === 'aktiv') {
      return { label: 'LÄUFT', color: '#FF5722' };
    }
    if (diffDays === 0) {
      return { label: 'HEUTE', color: '#FF5722' };
    }
    if (diffDays === 1) {
      return { label: 'MORGEN', color: '#FF9800' };
    }
    if (diffDays <= 7 && diffDays > 0) {
      return { label: 'BALD', color: '#FFC107' };
    }
    
    const erstelltVor = Math.floor((heute.getTime() - new Date(jagd.erstelltAm).getTime()) / (1000 * 60 * 60 * 24));
    if (erstelltVor <= 2) {
      return { label: 'NEU', color: '#4CAF50' };
    }
    
    return null;
  };
  
  const badge = getBadge();
  
  const getTypIcon = (typ: string) => {
    switch (typ) {
      case 'drueckjagd': return 'paw';
      case 'treibjagd': return 'walk';
      case 'bewegungsjagd': return 'trending-up';
      case 'ansitzjagd_gruppe': return 'people';
      default: return 'rifle';
    }
  };
  
  const getTypLabel = (typ: string) => {
    switch (typ) {
      case 'drueckjagd': return 'Drückjagd';
      case 'treibjagd': return 'Treibjagd';
      case 'bewegungsjagd': return 'Bewegungsjagd';
      case 'ansitzjagd_gruppe': return 'Gemeinschaftsansitz';
      case 'riegeljagd': return 'Riegeljagd';
      default: return 'Gesellschaftsjagd';
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'geplant': return '#2196F3';
      case 'aktiv': return '#FF5722';
      case 'abgeschlossen': return '#4CAF50';
      case 'abgesagt': return '#9E9E9E';
      default: return '#666';
    }
  };
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('de-DE', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(date));
  };
  
  const teilnehmerZugesagt = jagd.teilnehmer.filter(
    t => t.anmeldung.status === 'zugesagt'
  ).length;
  
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {/* Badge */}
      {badge && (
        <View style={[styles.badge, { backgroundColor: badge.color }]}>
          <Text style={styles.badgeText}>{badge.label}</Text>
        </View>
      )}
      
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Ionicons
            name={getTypIcon(jagd.typ) as any}
            size={24}
            color="#2E7D32"
          />
          <View style={styles.cardHeaderText}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {jagd.name}
            </Text>
            <Text style={styles.cardTyp}>{getTypLabel(jagd.typ)}</Text>
          </View>
        </View>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: getStatusColor(jagd.status) }
          ]}
        />
      </View>
      
      {/* Info Row */}
      <View style={styles.cardInfo}>
        <View style={styles.infoItem}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.infoText}>{formatDate(jagd.datum)}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.infoText}>
            {new Date(jagd.zeitplan.jagdBeginn).toLocaleTimeString('de-DE', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
      </View>
      
      {/* Quick Stats */}
      <View style={styles.cardStats}>
        <View style={styles.statItem}>
          <Ionicons name="people" size={18} color="#2E7D32" />
          <Text style={styles.statText}>
            {teilnehmerZugesagt}/{jagd.maxTeilnehmer}
          </Text>
          <Text style={styles.statLabel}>Teilnehmer</Text>
        </View>
        
        <View style={styles.statDivider} />
        
        <View style={styles.statItem}>
          <Ionicons name="location" size={18} color="#2E7D32" />
          <Text style={styles.statText}>{jagd.standorte.length}</Text>
          <Text style={styles.statLabel}>Standorte</Text>
        </View>
        
        {jagd.strecke.zusammenfassung.gesamt > 0 && (
          <>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="trophy" size={18} color="#FFB300" />
              <Text style={styles.statText}>
                {jagd.strecke.zusammenfassung.gesamt}
              </Text>
              <Text style={styles.statLabel}>Strecke</Text>
            </View>
          </>
        )}
      </View>
      
      {/* Actions */}
      <View style={styles.cardActions}>
        {jagd.status === 'geplant' && (
          <>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="create-outline" size={18} color="#2196F3" />
              <Text style={styles.actionText}>Bearbeiten</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share-social-outline" size={18} color="#2196F3" />
              <Text style={styles.actionText}>Einladen</Text>
            </TouchableOpacity>
          </>
        )}
        
        {jagd.status === 'aktiv' && (
          <TouchableOpacity style={[styles.actionButton, styles.actionButtonPrimary]}>
            <Ionicons name="log-in-outline" size={18} color="#fff" />
            <Text style={[styles.actionText, { color: '#fff' }]}>Teilnehmen</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="information-circle-outline" size={18} color="#666" />
          <Text style={styles.actionText}>Details</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

// ============================================================================
// FILTER BUTTON COMPONENT
// ============================================================================

interface FilterButtonProps {
  label: string;
  active: boolean;
  onPress: () => void;
  count?: number;
}

function FilterButton({ label, active, onPress, count }: FilterButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.filterButton, active && styles.filterButtonActive]}
      onPress={onPress}
    >
      <Text style={[styles.filterText, active && styles.filterTextActive]}>
        {label}
      </Text>
      {count !== undefined && count > 0 && (
        <View style={styles.filterBadge}>
          <Text style={styles.filterBadgeText}>{count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B5E20'
  },
  addButton: {
    padding: 4
  },
  
  // Filter
  filterContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    gap: 8
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4
  },
  filterButtonActive: {
    backgroundColor: '#2E7D32'
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666'
  },
  filterTextActive: {
    color: '#fff'
  },
  filterBadge: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center'
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#2E7D32'
  },
  
  // List
  listContent: {
    padding: 16,
    gap: 12
  },
  
  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative'
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 1
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingRight: 60
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1
  },
  cardHeaderText: {
    flex: 1
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 2
  },
  cardTyp: {
    fontSize: 13,
    color: '#666'
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4
  },
  
  cardInfo: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  infoText: {
    fontSize: 14,
    color: '#666'
  },
  
  cardStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  statItem: {
    alignItems: 'center',
    gap: 4
  },
  statText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B5E20'
  },
  statLabel: {
    fontSize: 11,
    color: '#999'
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0'
  },
  
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 8
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F5'
  },
  actionButtonPrimary: {
    backgroundColor: '#2E7D32'
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666'
  },
  
  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4
  },
  emptyButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#2E7D32',
    borderRadius: 8
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff'
  }
});
