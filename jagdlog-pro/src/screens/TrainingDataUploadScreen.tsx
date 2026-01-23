import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Picker } from '@react-native-picker/picker';
import { trainingDataService } from '../services/trainingDataService';
import type { TrainingDataType, BloodColor, HairType, TissueType } from '../types/analytics';

/**
 * CROWDSOURCING FEATURE - Training Data Upload
 * 
 * User können Anschussfotos hochladen um die Community-KI zu trainieren.
 * 
 * Features:
 * - Foto-Upload (Blut, Haare, Wildpret)
 * - Metadata-Input (Labels, GPS, Timestamp)
 * - Gamification (Punkte + Badges)
 * - Rewards (Premium-Features freischalten)
 * - Quality Validation (Blur-Detection, Min-Resolution)
 * 
 * Ziel: 15.000+ Bilder Year 1
 */

interface UploadStats {
  uploads_gesamt: number;
  punkte_gesamt: number;
  badges: string[];
  naechster_reward: string;
  punkte_bis_reward: number;
}

export default function TrainingDataUploadScreen() {
  const navigation = useNavigation();

  // Upload State
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Metadata
  const [dataType, setDataType] = useState<TrainingDataType>('blood');
  const [bloodColor, setBloodColor] = useState<BloodColor>('Hellrot');
  const [hairType, setHairType] = useState<HairType>('Decke');
  const [tissueType, setTissueType] = useState<TissueType>('Lungenstücke');
  const [wildart, setWildart] = useState<string>('Rehwild');
  const [trefferlage, setTrefferlage] = useState<string>('Blattschuss');
  const [notes, setNotes] = useState<string>('');

  // Gamification
  const [stats, setStats] = useState<UploadStats>({
    uploads_gesamt: 0,
    punkte_gesamt: 0,
    badges: [],
    naechster_reward: 'Shot Analysis Premium (10 Uploads)',
    punkte_bis_reward: 10,
  });

  /**
   * Foto aufnehmen oder aus Galerie wählen
   */
  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Berechtigung erforderlich', 'Kamera-Zugriff wird benötigt.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8, // Kompression für Upload
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handlePickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Berechtigung erforderlich', 'Galerie-Zugriff wird benötigt.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  /**
   * Upload mit Metadata
   */
  const handleUpload = async () => {
    if (!photoUri) {
      Alert.alert('Kein Foto', 'Bitte Foto aufnehmen oder auswählen.');
      return;
    }

    try {
      setUploading(true);

      // GPS-Position (optional)
      const { status } = await Location.requestForegroundPermissionsAsync();
      let location: { latitude: number; longitude: number } | undefined;
      
      if (status === 'granted') {
        const pos = await Location.getCurrentPositionAsync({});
        location = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
      }

      // Upload via Service
      const upload = await trainingDataService.uploadTrainingData({
        data_type: dataType,
        image_uri: photoUri,
        labels: {
          blood_color: dataType === 'blood' ? bloodColor : undefined,
          hair_type: dataType === 'hair' ? hairType : undefined,
          tissue_type: dataType === 'tissue' ? tissueType : undefined,
          wildart,
          trefferlage,
        },
        location,
        notes: notes || undefined,
      });

      // Stats aktualisieren
      const newStats = await trainingDataService.getUserUploadStats();
      setStats(newStats);

      // Success + Gamification
      Alert.alert(
        '🎉 Upload erfolgreich!',
        `+${upload.punkte_verdient} Punkte\n\nGesamt: ${newStats.punkte_gesamt} Punkte\nUploads: ${newStats.uploads_gesamt}\n\n${getBadgeMessage(upload)}`,
        [
          {
            text: 'Noch eins hochladen',
            onPress: () => {
              setPhotoUri(null);
              setNotes('');
            },
          },
          {
            text: 'Zurück',
            onPress: () => navigation.goBack(),
          },
        ]
      );

    } catch (error) {
      console.error('Upload failed:', error);
      Alert.alert('Upload fehlgeschlagen', 'Bitte später erneut versuchen.');
    } finally {
      setUploading(false);
    }
  };

  /**
   * Badge-Message für Gamification
   */
  const getBadgeMessage = (upload: any): string => {
    const messages: string[] = [];

    // Badges
    if (upload.badge_unlocked) {
      messages.push(`🏆 Neues Badge: "${upload.badge_unlocked}"`);
    }

    // Rewards
    if (upload.reward_unlocked) {
      messages.push(`🎁 Belohnung freigeschaltet: ${upload.reward_unlocked}`);
    }

    // Milestones
    if (stats.uploads_gesamt === 10) {
      messages.push('🎯 10 Uploads erreicht - Shot Analysis Premium freigeschaltet!');
    } else if (stats.uploads_gesamt === 50) {
      messages.push('🔥 50 Uploads - Community-Champion Badge!');
    } else if (stats.uploads_gesamt === 100) {
      messages.push('💎 100 Uploads - Lifetime Premium Unlocked!');
    }

    return messages.length > 0 ? messages.join('\n\n') : 'Danke für deinen Beitrag! 🙏';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🤝 Community-KI trainieren</Text>
        <Text style={styles.subtitle}>
          Hilf uns, die beste Jagd-KI zu entwickeln!
        </Text>
      </View>

      {/* Stats Card */}
      <View style={styles.statsCard}>
        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.uploads_gesamt}</Text>
            <Text style={styles.statLabel}>Uploads</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.punkte_gesamt}</Text>
            <Text style={styles.statLabel}>Punkte</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.badges.length}</Text>
            <Text style={styles.statLabel}>Badges</Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <Text style={styles.progressLabel}>Nächste Belohnung:</Text>
          <Text style={styles.progressReward}>{stats.naechster_reward}</Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${
                    ((stats.uploads_gesamt % 10) / 10) * 100
                  }%`,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            Noch {stats.punkte_bis_reward} Uploads
          </Text>
        </View>
      </View>

      {/* Photo Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📸 Foto</Text>

        {photoUri ? (
          <View style={styles.photoPreviewContainer}>
            <Image source={{ uri: photoUri }} style={styles.photoPreview} />
            <TouchableOpacity
              style={styles.removePhotoButton}
              onPress={() => setPhotoUri(null)}
            >
              <Text style={styles.removePhotoText}>❌ Entfernen</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.photoButtons}>
            <TouchableOpacity style={styles.photoButton} onPress={handleTakePhoto}>
              <Text style={styles.photoButtonText}>📷 Foto aufnehmen</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.photoButton}
              onPress={handlePickFromGallery}
            >
              <Text style={styles.photoButtonText}>🖼️ Aus Galerie</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Metadata Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏷️ Informationen</Text>

        <Text style={styles.label}>Datentyp:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={dataType}
            onValueChange={(value) => setDataType(value as TrainingDataType)}
          >
            <Picker.Item label="🩸 Blut/Schweiß" value="blood" />
            <Picker.Item label="🦌 Haare" value="hair" />
            <Picker.Item label="🥩 Wildpret/Gewebe" value="tissue" />
            <Picker.Item label="👣 Fährte/Spur" value="tracks" />
            <Picker.Item label="🎯 Nachsuche-Route" value="recovery_route" />
          </Picker>
        </View>

        {dataType === 'blood' && (
          <>
            <Text style={styles.label}>Blutfarbe:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={bloodColor}
                onValueChange={(value) => setBloodColor(value as BloodColor)}
              >
                <Picker.Item label="Hellrot (Lungenblut)" value="Hellrot" />
                <Picker.Item label="Dunkelrot (Lebertreffer)" value="Dunkelrot" />
                <Picker.Item label="Bräunlich (Pansenschuss)" value="Bräunlich" />
                <Picker.Item label="Schaumig (Lungenblut)" value="Schaumig" />
              </Picker>
            </View>
          </>
        )}

        {dataType === 'hair' && (
          <>
            <Text style={styles.label}>Haartyp:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={hairType}
                onValueChange={(value) => setHairType(value as HairType)}
              >
                <Picker.Item label="Decke (Rumpf)" value="Decke" />
                <Picker.Item label="Grannen (Rücken)" value="Grannen" />
                <Picker.Item label="Winterhaar" value="Winterhaar" />
                <Picker.Item label="Sommerhaar" value="Sommerhaar" />
              </Picker>
            </View>
          </>
        )}

        {dataType === 'tissue' && (
          <>
            <Text style={styles.label}>Gewebeart:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={tissueType}
                onValueChange={(value) => setTissueType(value as TissueType)}
              >
                <Picker.Item label="Lungenstücke" value="Lungenstücke" />
                <Picker.Item label="Pansenfetzen" value="Pansenfetzen" />
                <Picker.Item label="Knochensplitter" value="Knochensplitter" />
              </Picker>
            </View>
          </>
        )}

        <Text style={styles.label}>Wildart:</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={wildart} onValueChange={setWildart}>
            <Picker.Item label="🦌 Rehwild" value="Rehwild" />
            <Picker.Item label="🦌 Rotwild" value="Rotwild" />
            <Picker.Item label="🐗 Schwarzwild" value="Schwarzwild" />
            <Picker.Item label="🦌 Damwild" value="Damwild" />
            <Picker.Item label="🦌 Sikawild" value="Sikawild" />
            <Picker.Item label="🦌 Muffelwild" value="Muffelwild" />
          </Picker>
        </View>

        <Text style={styles.label}>Trefferlage:</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={trefferlage} onValueChange={setTrefferlage}>
            <Picker.Item label="🎯 Blattschuss (Herz/Lunge)" value="Blattschuss" />
            <Picker.Item label="🫁 Lebertreffer" value="Lebertreffer" />
            <Picker.Item label="🫀 Herztreffer" value="Herztreffer" />
            <Picker.Item label="🍖 Keulenschuss" value="Keulenschuss" />
            <Picker.Item label="🦴 Laufschuss" value="Laufschuss" />
            <Picker.Item label="🌿 Pansenschuss" value="Pansenschuss" />
            <Picker.Item label="🎗️ Streifschuss" value="Streifschuss" />
            <Picker.Item label="🦴 Knochen" value="Knochen" />
          </Picker>
        </View>
      </View>

      {/* Quality Guidelines */}
      <View style={styles.guidelinesCard}>
        <Text style={styles.guidelinesTitle}>✅ Gute Foto-Qualität:</Text>
        <Text style={styles.guidelineItem}>• Gut beleuchtet (natürliches Licht)</Text>
        <Text style={styles.guidelineItem}>• Scharf (nicht verwackelt)</Text>
        <Text style={styles.guidelineItem}>• Nahaufnahme (Detail erkennbar)</Text>
        <Text style={styles.guidelineItem}>• Neutrale Hintergrund wenn möglich</Text>
        <Text style={styles.guidelineItem}>• Min. 800x600 Pixel</Text>
        <Text style={styles.guidelinesNote}>
          💡 Hochwertige Fotos = Bessere KI = Mehr Punkte!
        </Text>
      </View>

      {/* Upload Button */}
      <TouchableOpacity
        style={[
          styles.uploadButton,
          (!photoUri || uploading) && styles.uploadButtonDisabled,
        ]}
        onPress={handleUpload}
        disabled={!photoUri || uploading}
      >
        {uploading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.uploadButtonText}>
            🚀 Jetzt hochladen
          </Text>
        )}
      </TouchableOpacity>

      {/* Rewards Overview */}
      <View style={styles.rewardsCard}>
        <Text style={styles.rewardsTitle}>🎁 Belohnungen</Text>
        <View style={styles.rewardItem}>
          <Text style={styles.rewardCount}>10 Uploads</Text>
          <Text style={styles.rewardName}>Shot Analysis Premium (1 Monat)</Text>
        </View>
        <View style={styles.rewardItem}>
          <Text style={styles.rewardCount}>25 Uploads</Text>
          <Text style={styles.rewardName}>Community-Contributor Badge</Text>
        </View>
        <View style={styles.rewardItem}>
          <Text style={styles.rewardCount}>50 Uploads</Text>
          <Text style={styles.rewardName}>Fundort-Prediction Premium (1 Monat)</Text>
        </View>
        <View style={styles.rewardItem}>
          <Text style={styles.rewardCount}>100 Uploads</Text>
          <Text style={styles.rewardName}>🏆 Lifetime Premium Access</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          🙏 Danke, dass du die Community-KI unterstützt!
        </Text>
        <Text style={styles.footerSubtext}>
          Alle Daten werden anonymisiert und nur für ML-Training verwendet.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#2E7D32',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#E0E0E0',
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  progressContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 16,
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  progressReward: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  photoButton: {
    flex: 1,
    backgroundColor: '#2E7D32',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  photoButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  photoPreviewContainer: {
    alignItems: 'center',
  },
  photoPreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  removePhotoButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  removePhotoText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    overflow: 'hidden',
  },
  guidelinesCard: {
    backgroundColor: '#E8F5E9',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  guidelinesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 12,
  },
  guidelineItem: {
    fontSize: 14,
    color: '#333',
    marginBottom: 6,
  },
  guidelinesNote: {
    fontSize: 12,
    color: '#2E7D32',
    marginTop: 8,
    fontStyle: 'italic',
  },
  uploadButton: {
    backgroundColor: '#4CAF50',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  uploadButtonDisabled: {
    backgroundColor: '#BDBDBD',
    elevation: 0,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  rewardsCard: {
    backgroundColor: '#FFF3E0',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  rewardsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E65100',
    marginBottom: 12,
  },
  rewardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE0B2',
  },
  rewardCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E65100',
  },
  rewardName: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    marginLeft: 12,
  },
  footer: {
    padding: 16,
    marginBottom: 32,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
