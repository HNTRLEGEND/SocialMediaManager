import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  Image,
  Platform,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { GesellschaftsjagdService } from '../services/gesellschaftsjagdService';
import type { StreckenAbschuss, Wildart, Geschlecht, Altersklasse } from '../types/gesellschaftsjagd';

// Navigation Types
type RootStackParamList = {
  AbschussErfassen: { jagdId: string };
  LiveJagd: { jagdId: string };
};

type AbschussErfassenScreenRouteProp = RouteProp<RootStackParamList, 'AbschussErfassen'>;
type AbschussErfassenScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AbschussErfassen'
>;

const { width } = Dimensions.get('window');

// Form Data Interface
interface AbschussFormData {
  wildart: Wildart | '';
  geschlecht: Geschlecht | '';
  altersklasse: Altersklasse | '';
  anzahl: number;
  standortId?: string;
  treibenNummer?: number;
  details: {
    schussEntfernung?: number;
    schussPlatzierung?: string;
    gewicht?: number;
    besonderheiten?: string;
  };
  fotos: string[];
}

export default function AbschussErfassenScreen() {
  const route = useRoute<AbschussErfassenScreenRouteProp>();
  const navigation = useNavigation<AbschussErfassenScreenNavigationProp>();
  const queryClient = useQueryClient();
  const { jagdId } = route.params;

  const [formData, setFormData] = useState<AbschussFormData>({
    wildart: '',
    geschlecht: '',
    altersklasse: '',
    anzahl: 1,
    details: {},
    fotos: [],
  });

  // TODO: Get database instance from context
  const db = null as any;
  const jagdService = new GesellschaftsjagdService(db);

  // Load Jagd data
  const { data: jagd } = useQuery({
    queryKey: ['gesellschaftsjagd', jagdId],
    queryFn: () => jagdService.getJagd(jagdId),
  });

  // Create Abschuss Mutation
  const createAbschussMutation = useMutation({
    mutationFn: async (abschuss: Partial<StreckenAbschuss>) => {
      // Get current location
      let location = null;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          location = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          };
        }
      } catch (error) {
        console.warn('Could not get location:', error);
      }

      return jagdService.createAbschuss({
        id: '',
        jagdId,
        schuetzeId: 'user-001', // TODO: Get from auth
        standortId: formData.standortId,
        treibenNummer: formData.treibenNummer,
        wildart: formData.wildart as Wildart,
        geschlecht: formData.geschlecht as Geschlecht,
        altersklasse: formData.altersklasse as Altersklasse,
        anzahl: formData.anzahl,
        zeitpunkt: new Date().toISOString(),
        gps: location || undefined,
        details: formData.details,
        verwertung: { status: 'offen', planung: {} },
        wildmarke: '',
        fotos: formData.fotos,
        erfasstVon: 'user-001', // TODO: Get from auth
        erfasstAm: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strecken-abschuesse', jagdId] });
      queryClient.invalidateQueries({ queryKey: ['jagd-live-events', jagdId] });
      queryClient.invalidateQueries({ queryKey: ['gesellschaftsjagd', jagdId] });

      Alert.alert(
        'Erfolg',
        'Abschuss wurde erfasst und an alle Teilnehmer gemeldet.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    },
  });

  const handleSubmit = () => {
    // Validation
    if (!formData.wildart) {
      Alert.alert('Fehler', 'Bitte Wildart auswählen.');
      return;
    }
    if (!formData.geschlecht) {
      Alert.alert('Fehler', 'Bitte Geschlecht auswählen.');
      return;
    }
    if (!formData.altersklasse) {
      Alert.alert('Fehler', 'Bitte Altersklasse auswählen.');
      return;
    }

    createAbschussMutation.mutate({});
  };

  const handleTakeFoto = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Fehler', 'Kamera-Berechtigung wurde verweigert.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setFormData((prev) => ({
        ...prev,
        fotos: [...prev.fotos, result.assets[0].uri],
      }));
    }
  };

  const handlePickFoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Fehler', 'Galerie-Berechtigung wurde verweigert.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const uris = result.assets.map((asset) => asset.uri);
      setFormData((prev) => ({
        ...prev,
        fotos: [...prev.fotos, ...uris],
      }));
    }
  };

  const handleRemoveFoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      fotos: prev.fotos.filter((_, i) => i !== index),
    }));
  };

  const currentTreiben = jagd?.treiben?.find((t) => t.status === 'aktiv');
  const currentTeilnehmer = jagd?.teilnehmer?.find((t) => t.id === 'user-001'); // TODO: Get from auth
  const autoStandort = currentTeilnehmer?.zugewiesenerStandort;

  // Auto-fill standort and treiben if available
  if (!formData.standortId && autoStandort) {
    setFormData((prev) => ({ ...prev, standortId: autoStandort.id }));
  }
  if (!formData.treibenNummer && currentTreiben) {
    setFormData((prev) => ({ ...prev, treibenNummer: currentTreiben.nummer }));
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="close" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Abschuss erfassen</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Form */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Wildart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wildart *</Text>
          <View style={styles.gridContainer}>
            {(jagd?.regeln.wildarten || [
              'Rehwild',
              'Schwarzwild',
              'Rotwild',
              'Damwild',
              'Fuchs',
              'Hase',
            ]).map((wildart) => (
              <WildartButton
                key={wildart}
                wildart={wildart as Wildart}
                selected={formData.wildart === wildart}
                onPress={() => setFormData((prev) => ({ ...prev, wildart: wildart as Wildart }))}
              />
            ))}
          </View>
        </View>

        {/* Geschlecht */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Geschlecht *</Text>
          <View style={styles.row}>
            <OptionButton
              label="Männlich"
              icon="male"
              selected={formData.geschlecht === 'maennlich'}
              onPress={() => setFormData((prev) => ({ ...prev, geschlecht: 'maennlich' }))}
            />
            <OptionButton
              label="Weiblich"
              icon="female"
              selected={formData.geschlecht === 'weiblich'}
              onPress={() => setFormData((prev) => ({ ...prev, geschlecht: 'weiblich' }))}
            />
          </View>
        </View>

        {/* Altersklasse */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Altersklasse *</Text>
          <View style={styles.row}>
            <OptionButton
              label="Jungtier"
              icon="sparkles"
              selected={formData.altersklasse === 'jungtier'}
              onPress={() => setFormData((prev) => ({ ...prev, altersklasse: 'jungtier' }))}
            />
            <OptionButton
              label="Mittelalter"
              icon="star-half"
              selected={formData.altersklasse === 'mittelalter'}
              onPress={() => setFormData((prev) => ({ ...prev, altersklasse: 'mittelalter' }))}
            />
            <OptionButton
              label="Alt"
              icon="star"
              selected={formData.altersklasse === 'alt'}
              onPress={() => setFormData((prev) => ({ ...prev, altersklasse: 'alt' }))}
            />
          </View>
        </View>

        {/* Anzahl */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Anzahl</Text>
          <View style={styles.counterContainer}>
            <TouchableOpacity
              style={styles.counterButton}
              onPress={() =>
                setFormData((prev) => ({ ...prev, anzahl: Math.max(1, prev.anzahl - 1) }))
              }
            >
              <Ionicons name="remove" size={24} color="#2ecc71" />
            </TouchableOpacity>
            <Text style={styles.counterValue}>{formData.anzahl}</Text>
            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => setFormData((prev) => ({ ...prev, anzahl: prev.anzahl + 1 }))}
            >
              <Ionicons name="add" size={24} color="#2ecc71" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details (optional)</Text>

          {/* Schussentfernung */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Schussentfernung (Meter)</Text>
            <TextInput
              style={styles.input}
              placeholder="z.B. 80"
              keyboardType="number-pad"
              value={formData.details.schussEntfernung?.toString() || ''}
              onChangeText={(text) =>
                setFormData((prev) => ({
                  ...prev,
                  details: { ...prev.details, schussEntfernung: parseInt(text) || undefined },
                }))
              }
            />
          </View>

          {/* Schussplatzierung */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Schussplatzierung</Text>
            <TextInput
              style={styles.input}
              placeholder="z.B. Blattschuss, Kammerschuss"
              value={formData.details.schussPlatzierung || ''}
              onChangeText={(text) =>
                setFormData((prev) => ({
                  ...prev,
                  details: { ...prev.details, schussPlatzierung: text },
                }))
              }
            />
          </View>

          {/* Gewicht */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Gewicht (kg)</Text>
            <TextInput
              style={styles.input}
              placeholder="z.B. 25"
              keyboardType="decimal-pad"
              value={formData.details.gewicht?.toString() || ''}
              onChangeText={(text) =>
                setFormData((prev) => ({
                  ...prev,
                  details: { ...prev.details, gewicht: parseFloat(text) || undefined },
                }))
              }
            />
          </View>

          {/* Besonderheiten */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Besonderheiten</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="z.B. Auffälligkeiten, Beschädigungen"
              multiline
              numberOfLines={3}
              value={formData.details.besonderheiten || ''}
              onChangeText={(text) =>
                setFormData((prev) => ({
                  ...prev,
                  details: { ...prev.details, besonderheiten: text },
                }))
              }
            />
          </View>
        </View>

        {/* Fotos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fotos</Text>
          <View style={styles.fotoContainer}>
            {formData.fotos.map((uri, index) => (
              <View key={index} style={styles.fotoWrapper}>
                <Image source={{ uri }} style={styles.foto} />
                <TouchableOpacity
                  style={styles.fotoRemoveButton}
                  onPress={() => handleRemoveFoto(index)}
                >
                  <Ionicons name="close-circle" size={24} color="#e74c3c" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.fotoAddButton} onPress={handleTakeFoto}>
              <Ionicons name="camera" size={32} color="#2ecc71" />
              <Text style={styles.fotoAddText}>Foto aufnehmen</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.fotoAddButton} onPress={handlePickFoto}>
              <Ionicons name="images" size={32} color="#2ecc71" />
              <Text style={styles.fotoAddText}>Aus Galerie</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Context Info */}
        <View style={styles.section}>
          <View style={styles.contextCard}>
            <View style={styles.contextRow}>
              <Ionicons name="location" size={16} color="#2ecc71" />
              <Text style={styles.contextText}>
                Standort: {autoStandort ? `${autoStandort.nummer} - ${autoStandort.name}` : 'Auto-Detect'}
              </Text>
            </View>
            {currentTreiben && (
              <View style={styles.contextRow}>
                <Ionicons name="walk" size={16} color="#f39c12" />
                <Text style={styles.contextText}>
                  Treiben {currentTreiben.nummer}: {currentTreiben.name}
                </Text>
              </View>
            )}
            <View style={styles.contextRow}>
              <Ionicons name="time" size={16} color="#3498db" />
              <Text style={styles.contextText}>
                {new Date().toLocaleTimeString('de-DE', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </View>
        </View>

        {/* Spacer for bottom button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            createAbschussMutation.isPending && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={createAbschussMutation.isPending}
        >
          <Ionicons name="checkmark-circle" size={24} color="#fff" />
          <Text style={styles.submitButtonText}>
            {createAbschussMutation.isPending ? 'Wird erfasst...' : 'Abschuss erfassen'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ============================================================================
// Wildart Button Component
// ============================================================================

interface WildartButtonProps {
  wildart: Wildart;
  selected: boolean;
  onPress: () => void;
}

function WildartButton({ wildart, selected, onPress }: WildartButtonProps) {
  const icon = getWildartIcon(wildart);

  return (
    <TouchableOpacity
      style={[styles.wildartButton, selected && styles.wildartButtonSelected]}
      onPress={onPress}
    >
      <Ionicons
        name={icon}
        size={32}
        color={selected ? '#fff' : '#2ecc71'}
      />
      <Text style={[styles.wildartButtonText, selected && styles.wildartButtonTextSelected]}>
        {wildart}
      </Text>
    </TouchableOpacity>
  );
}

// ============================================================================
// Option Button Component
// ============================================================================

interface OptionButtonProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  selected: boolean;
  onPress: () => void;
}

function OptionButton({ label, icon, selected, onPress }: OptionButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.optionButton, selected && styles.optionButtonSelected]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={24} color={selected ? '#fff' : '#2ecc71'} />
      <Text style={[styles.optionButtonText, selected && styles.optionButtonTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

function getWildartIcon(wildart: Wildart): keyof typeof Ionicons.glyphMap {
  switch (wildart) {
    case 'Rehwild':
    case 'Rotwild':
    case 'Damwild':
      return 'paw';
    case 'Schwarzwild':
      return 'leaf';
    case 'Fuchs':
      return 'flame';
    case 'Hase':
      return 'footsteps';
    default:
      return 'paw';
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

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {},
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },

  // Content
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },

  // Grid
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  wildartButton: {
    width: (width - 56) / 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  wildartButtonSelected: {
    backgroundColor: '#2ecc71',
    borderColor: '#2ecc71',
  },
  wildartButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 8,
  },
  wildartButtonTextSelected: {
    color: '#fff',
  },

  // Row
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  optionButtonSelected: {
    backgroundColor: '#2ecc71',
    borderColor: '#2ecc71',
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 8,
  },
  optionButtonTextSelected: {
    color: '#fff',
  },

  // Counter
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
  },
  counterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a1a1a',
    marginHorizontal: 32,
    minWidth: 60,
    textAlign: 'center',
  },

  // Input
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 14,
    color: '#1a1a1a',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },

  // Fotos
  fotoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  fotoWrapper: {
    position: 'relative',
  },
  foto: {
    width: (width - 56) / 3,
    height: (width - 56) / 3,
    borderRadius: 12,
  },
  fotoRemoveButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  fotoAddButton: {
    width: (width - 56) / 3,
    height: (width - 56) / 3,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fotoAddText: {
    fontSize: 10,
    color: '#2ecc71',
    marginTop: 4,
    textAlign: 'center',
  },

  // Context Card
  contextCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2ecc71',
  },
  contextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contextText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },

  // Footer
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2ecc71',
    paddingVertical: 16,
    borderRadius: 12,
  },
  submitButtonDisabled: {
    backgroundColor: '#95a5a6',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
});
