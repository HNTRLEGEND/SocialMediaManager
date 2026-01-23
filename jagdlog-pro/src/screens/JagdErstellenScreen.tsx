/**
 * JAGD ERSTELLEN SCREEN (5-Step Wizard)
 * Phase 6: Group Hunting Management
 * HNTR LEGEND Pro
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Gesellschaftsjagd, JagdTyp } from '../types/gesellschaftsjagd';
import { GesellschaftsjagdService } from '../services/gesellschaftsjagdService';
import { databaseService } from '../services/databaseService';

type Step = 1 | 2 | 3 | 4 | 5;

interface JagdFormData {
  // Step 1: Basis-Informationen
  name: string;
  typ: JagdTyp;
  revierId: string;
  datum: Date;
  zeitplan: {
    sammeln: Date;
    ansprechen: Date;
    jagdBeginn: Date;
    jagdEnde: Date;
    streckeZeigen: Date;
  };
  
  // Step 2: Teilnehmer
  maxTeilnehmer: number;
  anmeldeschluss?: Date;
  
  // Step 3: Standorte (handled separately)
  
  // Step 4: Regeln & Sicherheit
  wildarten: string[];
  schussrichtungen: string[];
  schussEntfernung: number;
  besondereVorschriften: string;
  notfallkontakt: string;
  sammelplatzLat: number;
  sammelplatzLng: number;
  notfallplan: string;
}

export default function JagdErstellenScreen() {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerField, setDatePickerField] = useState<string>('datum');
  
  const [formData, setFormData] = useState<JagdFormData>({
    name: '',
    typ: 'drueckjagd',
    revierId: 'revier-001', // TODO: Get from context
    datum: new Date(),
    zeitplan: {
      sammeln: new Date(),
      ansprechen: new Date(),
      jagdBeginn: new Date(),
      jagdEnde: new Date(),
      streckeZeigen: new Date()
    },
    maxTeilnehmer: 20,
    wildarten: ['Rehwild', 'Schwarzwild'],
    schussrichtungen: ['Nord', 'Ost', 'Süd', 'West'],
    schussEntfernung: 150,
    besondereVorschriften: '',
    notfallkontakt: '112',
    sammelplatzLat: 48.7758,
    sammelplatzLng: 9.1829,
    notfallplan: 'Sammelplatz am Waldparkplatz'
  });
  
  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep((currentStep + 1) as Step);
    }
  };
  
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    } else {
      navigation.goBack();
    }
  };
  
  const handleCreate = async () => {
    try {
      const jagdService = new GesellschaftsjagdService(databaseService.db!);
      
      const jagd = await jagdService.createJagd({
        name: formData.name,
        typ: formData.typ,
        revierId: formData.revierId,
        datum: formData.datum,
        zeitplan: formData.zeitplan,
        jagdleiter: 'user-001', // TODO: Get from auth
        maxTeilnehmer: formData.maxTeilnehmer,
        anmeldeschluss: formData.anmeldeschluss,
        sicherheit: {
          notfallkontakt: formData.notfallkontakt,
          sammelplatz: {
            latitude: formData.sammelplatzLat,
            longitude: formData.sammelplatzLng
          },
          notfallplan: formData.notfallplan
        },
        regeln: {
          wildarten: formData.wildarten,
          schussrichtungen: formData.schussrichtungen,
          schussEntfernung: formData.schussEntfernung,
          besondereVorschriften: formData.besondereVorschriften
        },
        status: 'geplant',
        erstelltVon: 'user-001'
      });
      
      Alert.alert('Erfolg', 'Gesellschaftsjagd wurde erstellt!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]);
    } catch (error) {
      Alert.alert('Fehler', 'Jagd konnte nicht erstellt werden');
      console.error(error);
    }
  };
  
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1BasisInfo formData={formData} setFormData={setFormData} />;
      case 2:
        return <Step2Teilnehmer formData={formData} setFormData={setFormData} />;
      case 3:
        return <Step3Standorte formData={formData} setFormData={setFormData} />;
      case 4:
        return <Step4Regeln formData={formData} setFormData={setFormData} />;
      case 5:
        return <Step5Ueberpruefung formData={formData} />;
      default:
        return null;
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1B5E20" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Jagd erstellen</Text>
        <View style={{ width: 40 }} />
      </View>
      
      {/* Progress Steps */}
      <View style={styles.progressContainer}>
        {[1, 2, 3, 4, 5].map(step => (
          <View key={step} style={styles.progressStep}>
            <View
              style={[
                styles.progressDot,
                currentStep >= step && styles.progressDotActive
              ]}
            >
              <Text
                style={[
                  styles.progressNumber,
                  currentStep >= step && styles.progressNumberActive
                ]}
              >
                {step}
              </Text>
            </View>
            {step < 5 && (
              <View
                style={[
                  styles.progressLine,
                  currentStep > step && styles.progressLineActive
                ]}
              />
            )}
          </View>
        ))}
      </View>
      
      {/* Step Labels */}
      <View style={styles.stepLabels}>
        <Text style={[styles.stepLabel, currentStep === 1 && styles.stepLabelActive]}>
          Basis
        </Text>
        <Text style={[styles.stepLabel, currentStep === 2 && styles.stepLabelActive]}>
          Teilnehmer
        </Text>
        <Text style={[styles.stepLabel, currentStep === 3 && styles.stepLabelActive]}>
          Standorte
        </Text>
        <Text style={[styles.stepLabel, currentStep === 4 && styles.stepLabelActive]}>
          Regeln
        </Text>
        <Text style={[styles.stepLabel, currentStep === 5 && styles.stepLabelActive]}>
          Prüfen
        </Text>
      </View>
      
      {/* Step Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        {renderStep()}
      </ScrollView>
      
      {/* Navigation Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={handleBack}
        >
          <Text style={styles.buttonSecondaryText}>
            {currentStep === 1 ? 'Abbrechen' : 'Zurück'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary]}
          onPress={currentStep === 5 ? handleCreate : handleNext}
        >
          <Text style={styles.buttonPrimaryText}>
            {currentStep === 5 ? 'Erstellen' : 'Weiter'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ============================================================================
// STEP 1: BASIS-INFORMATIONEN
// ============================================================================

interface StepProps {
  formData: JagdFormData;
  setFormData: React.Dispatch<React.SetStateAction<JagdFormData>>;
}

function Step1BasisInfo({ formData, setFormData }: StepProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const jagdTypen: { value: JagdTyp; label: string; icon: string }[] = [
    { value: 'drueckjagd', label: 'Drückjagd', icon: 'paw' },
    { value: 'treibjagd', label: 'Treibjagd', icon: 'walk' },
    { value: 'bewegungsjagd', label: 'Bewegungsjagd', icon: 'trending-up' },
    { value: 'ansitzjagd_gruppe', label: 'Gemeinschaftsansitz', icon: 'people' },
    { value: 'riegeljagd', label: 'Riegeljagd', icon: 'shield' }
  ];
  
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Basis-Informationen</Text>
      
      {/* Name */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Name der Jagd *</Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={text => setFormData({ ...formData, name: text })}
          placeholder="z.B. Winterdrückjagd Hauptrevier 2026"
          placeholderTextColor="#999"
        />
      </View>
      
      {/* Typ */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Jagdtyp *</Text>
        <View style={styles.typeGrid}>
          {jagdTypen.map(typ => (
            <TouchableOpacity
              key={typ.value}
              style={[
                styles.typeButton,
                formData.typ === typ.value && styles.typeButtonActive
              ]}
              onPress={() => setFormData({ ...formData, typ: typ.value })}
            >
              <Ionicons
                name={typ.icon as any}
                size={24}
                color={formData.typ === typ.value ? '#fff' : '#2E7D32'}
              />
              <Text
                style={[
                  styles.typeText,
                  formData.typ === typ.value && styles.typeTextActive
                ]}
              >
                {typ.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {/* Datum */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Datum *</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="calendar-outline" size={20} color="#666" />
          <Text style={styles.dateText}>
            {formData.datum.toLocaleDateString('de-DE', {
              weekday: 'long',
              day: '2-digit',
              month: 'long',
              year: 'numeric'
            })}
          </Text>
        </TouchableOpacity>
        
        {showDatePicker && (
          <DateTimePicker
            value={formData.datum}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setFormData({ ...formData, datum: selectedDate });
              }
            }}
          />
        )}
      </View>
      
      {/* Zeitplan Quick Setup */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Zeitplan</Text>
        <View style={styles.timeRow}>
          <View style={styles.timeItem}>
            <Text style={styles.timeLabel}>Sammeln</Text>
            <Text style={styles.timeValue}>07:00</Text>
          </View>
          <Ionicons name="arrow-forward" size={16} color="#999" />
          <View style={styles.timeItem}>
            <Text style={styles.timeLabel}>Jagdbeginn</Text>
            <Text style={styles.timeValue}>08:00</Text>
          </View>
          <Ionicons name="arrow-forward" size={16} color="#999" />
          <View style={styles.timeItem}>
            <Text style={styles.timeLabel}>Jagdende</Text>
            <Text style={styles.timeValue}>13:00</Text>
          </View>
        </View>
        <Text style={styles.hint}>Zeiten können später angepasst werden</Text>
      </View>
    </View>
  );
}

// ============================================================================
// STEP 2: TEILNEHMER
// ============================================================================

function Step2Teilnehmer({ formData, setFormData }: StepProps) {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Teilnehmer</Text>
      
      {/* Max Teilnehmer */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Maximale Teilnehmeranzahl *</Text>
        <View style={styles.counterContainer}>
          <TouchableOpacity
            style={styles.counterButton}
            onPress={() =>
              setFormData({
                ...formData,
                maxTeilnehmer: Math.max(2, formData.maxTeilnehmer - 5)
              })
            }
          >
            <Ionicons name="remove" size={24} color="#2E7D32" />
          </TouchableOpacity>
          
          <Text style={styles.counterValue}>{formData.maxTeilnehmer}</Text>
          
          <TouchableOpacity
            style={styles.counterButton}
            onPress={() =>
              setFormData({
                ...formData,
                maxTeilnehmer: Math.min(100, formData.maxTeilnehmer + 5)
              })
            }
          >
            <Ionicons name="add" size={24} color="#2E7D32" />
          </TouchableOpacity>
        </View>
        <Text style={styles.hint}>Empfohlen: 15-30 Teilnehmer</Text>
      </View>
      
      {/* Rollen-Verteilung Vorschau */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Rollen-Verteilung (Empfehlung)</Text>
        <View style={styles.rollenContainer}>
          <RolleItem
            icon="person"
            label="Schützen"
            count={Math.floor(formData.maxTeilnehmer * 0.6)}
          />
          <RolleItem
            icon="walk"
            label="Treiber"
            count={Math.floor(formData.maxTeilnehmer * 0.3)}
          />
          <RolleItem
            icon="paw"
            label="Hundeführer"
            count={Math.floor(formData.maxTeilnehmer * 0.1)}
          />
        </View>
      </View>
      
      {/* Anmeldeschluss Optional */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Anmeldeschluss (optional)</Text>
        <Text style={styles.hint}>
          Lege einen Termin fest, bis wann Teilnehmer zu-/absagen können
        </Text>
      </View>
    </View>
  );
}

function RolleItem({ icon, label, count }: { icon: string; label: string; count: number }) {
  return (
    <View style={styles.rolleItem}>
      <Ionicons name={icon as any} size={20} color="#2E7D32" />
      <Text style={styles.rolleLabel}>{label}</Text>
      <View style={styles.rolleBadge}>
        <Text style={styles.rolleBadgeText}>{count}</Text>
      </View>
    </View>
  );
}

// ============================================================================
// STEP 3: STANDORTE
// ============================================================================

function Step3Standorte({ formData, setFormData }: StepProps) {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Standorte</Text>
      
      <View style={styles.placeholderContainer}>
        <Ionicons name="map-outline" size={64} color="#999" />
        <Text style={styles.placeholderText}>Standorte festlegen</Text>
        <Text style={styles.placeholderSubtext}>
          Wähle Standorte aus deinen POIs oder erstelle neue
        </Text>
        
        <TouchableOpacity style={styles.placeholderButton}>
          <Ionicons name="add-circle-outline" size={20} color="#2E7D32" />
          <Text style={styles.placeholderButtonText}>Standorte hinzufügen</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.hint}>
        Du kannst Standorte auch später hinzufügen und zuweisen
      </Text>
    </View>
  );
}

// ============================================================================
// STEP 4: REGELN & SICHERHEIT
// ============================================================================

function Step4Regeln({ formData, setFormData }: StepProps) {
  const wildarten = ['Rehwild', 'Schwarzwild', 'Rotwild', 'Damwild', 'Fuchs'];
  
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Regeln & Sicherheit</Text>
      
      {/* Wildarten */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Bejagbare Wildarten *</Text>
        <View style={styles.checkboxGroup}>
          {wildarten.map(wildart => (
            <TouchableOpacity
              key={wildart}
              style={styles.checkboxItem}
              onPress={() => {
                const newWildarten = formData.wildarten.includes(wildart)
                  ? formData.wildarten.filter(w => w !== wildart)
                  : [...formData.wildarten, wildart];
                setFormData({ ...formData, wildarten: newWildarten });
              }}
            >
              <Ionicons
                name={
                  formData.wildarten.includes(wildart)
                    ? 'checkbox'
                    : 'square-outline'
                }
                size={24}
                color="#2E7D32"
              />
              <Text style={styles.checkboxLabel}>{wildart}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {/* Schussentfernung */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Max. Schussentfernung: {formData.schussEntfernung}m</Text>
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>50m</Text>
          <View style={styles.slider}>
            {/* Simplified slider - in production use @react-native-community/slider */}
            <View style={styles.sliderTrack} />
            <View style={[styles.sliderThumb, { left: `${(formData.schussEntfernung - 50) / 3.5}%` }]} />
          </View>
          <Text style={styles.sliderLabel}>400m</Text>
        </View>
      </View>
      
      {/* Notfallkontakt */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Notfallkontakt *</Text>
        <TextInput
          style={styles.input}
          value={formData.notfallkontakt}
          onChangeText={text => setFormData({ ...formData, notfallkontakt: text })}
          placeholder="112"
          keyboardType="phone-pad"
        />
      </View>
    </View>
  );
}

// ============================================================================
// STEP 5: ÜBERPRÜFUNG
// ============================================================================

function Step5Ueberpruefung({ formData }: { formData: JagdFormData }) {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Überprüfung</Text>
      
      <View style={styles.summaryCard}>
        <SummaryRow
          icon="document-text"
          label="Name"
          value={formData.name || 'Nicht festgelegt'}
        />
        <SummaryRow
          icon="paw"
          label="Typ"
          value={formData.typ}
        />
        <SummaryRow
          icon="calendar"
          label="Datum"
          value={formData.datum.toLocaleDateString('de-DE')}
        />
        <SummaryRow
          icon="people"
          label="Max. Teilnehmer"
          value={`${formData.maxTeilnehmer} Personen`}
        />
        <SummaryRow
          icon="paw"
          label="Wildarten"
          value={formData.wildarten.join(', ')}
        />
        <SummaryRow
          icon="call"
          label="Notfallkontakt"
          value={formData.notfallkontakt}
        />
      </View>
      
      <View style={styles.checklistCard}>
        <Text style={styles.checklistTitle}>✅ Checkliste</Text>
        <Text style={styles.checklistItem}>✓ Jagd-Informationen vollständig</Text>
        <Text style={styles.checklistItem}>✓ Sicherheitsregeln festgelegt</Text>
        <Text style={styles.checklistItem}>✓ Notfallplan vorhanden</Text>
      </View>
    </View>
  );
}

function SummaryRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Ionicons name={icon as any} size={20} color="#2E7D32" />
      <View style={styles.summaryText}>
        <Text style={styles.summaryLabel}>{label}</Text>
        <Text style={styles.summaryValue}>{value}</Text>
      </View>
    </View>
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
  backButton: {
    width: 40
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5E20'
  },
  
  // Progress
  progressContainer: {
    flexDirection: 'row',
    padding: 24,
    backgroundColor: '#fff',
    justifyContent: 'center'
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  progressDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center'
  },
  progressDotActive: {
    backgroundColor: '#2E7D32'
  },
  progressNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666'
  },
  progressNumberActive: {
    color: '#fff'
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4
  },
  progressLineActive: {
    backgroundColor: '#2E7D32'
  },
  stepLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  stepLabel: {
    fontSize: 12,
    color: '#999'
  },
  stepLabelActive: {
    fontWeight: 'bold',
    color: '#2E7D32'
  },
  
  // Content
  content: {
    flex: 1
  },
  contentInner: {
    padding: 16
  },
  stepContainer: {
    gap: 24
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 8
  },
  
  // Form
  formGroup: {
    gap: 8
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333'
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333'
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4
  },
  
  // Type Grid
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  typeButton: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 8
  },
  typeButtonActive: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32'
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333'
  },
  typeTextActive: {
    color: '#fff'
  },
  
  // Date
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12
  },
  dateText: {
    fontSize: 16,
    color: '#333'
  },
  
  // Time Row
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16
  },
  timeItem: {
    alignItems: 'center',
    gap: 4
  },
  timeLabel: {
    fontSize: 12,
    color: '#666'
  },
  timeValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32'
  },
  
  // Counter
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    gap: 24
  },
  counterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center'
  },
  counterValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1B5E20',
    minWidth: 60,
    textAlign: 'center'
  },
  
  // Rollen
  rollenContainer: {
    gap: 8
  },
  rolleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8
  },
  rolleLabel: {
    flex: 1,
    fontSize: 14,
    color: '#333'
  },
  rolleBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12
  },
  rolleBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32'
  },
  
  // Placeholder
  placeholderContainer: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#fff',
    borderRadius: 8,
    gap: 12
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666'
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center'
  },
  placeholderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#E8F5E9',
    borderRadius: 8
  },
  placeholderButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32'
  },
  
  // Checkbox
  checkboxGroup: {
    gap: 12
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333'
  },
  
  // Slider
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8
  },
  slider: {
    flex: 1,
    height: 40,
    justifyContent: 'center'
  },
  sliderTrack: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2
  },
  sliderThumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2E7D32',
    top: 8
  },
  sliderLabel: {
    fontSize: 14,
    color: '#666'
  },
  
  // Summary
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    gap: 16
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12
  },
  summaryText: {
    flex: 1,
    gap: 4
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666'
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  
  // Checklist
  checklistCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 16,
    gap: 8
  },
  checklistTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8
  },
  checklistItem: {
    fontSize: 14,
    color: '#1B5E20'
  },
  
  // Footer
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0'
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonSecondary: {
    backgroundColor: '#F5F5F5'
  },
  buttonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666'
  },
  buttonPrimary: {
    backgroundColor: '#2E7D32'
  },
  buttonPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff'
  }
});
