import React, { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { AutoCaptureData, AutoCapturePanel } from '../components/AutoCapturePanel';
import { PrivacySelector } from '../components/PrivacySelector';
import { JagdEintrag, PrivacyMode } from '../types';
import { saveEntry } from '../services/storageService';
import { WILDARTEN } from '../constants/wildarten';
import { extractEntryFromTranscript, transcribeAudioAsync } from '../services/ai/openaiClient';
import { startVoiceRecording, stopVoiceRecording, VoiceRecordingSession } from '../services/ai/voiceService';

const reviere = ['Revier Nord', 'Revier Süd', 'Hochsitz 12'];
const jagdartOptions: JagdEintrag['jagdart'][] = ['ansitz', 'pirsch', 'drueckjagd', 'einzeljagd'];

export function NewEntryScreen() {
  const { colors } = useTheme();
  const [typ, setTyp] = useState<JagdEintrag['typ']>('beobachtung');
  const [revier, setRevier] = useState(reviere[0]);
  const [jagdart, setJagdart] = useState<JagdEintrag['jagdart']>('ansitz');
  const [wildart, setWildart] = useState('');
  const [notizen, setNotizen] = useState('');
  const [privacy, setPrivacy] = useState<PrivacyMode>('privat');
  const [autoData, setAutoData] = useState<AutoCaptureData | null>(null);
  const [fotos, setFotos] = useState<string[]>([]);
  const [recordingSession, setRecordingSession] = useState<VoiceRecordingSession | null>(null);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);

  const suggestions = useMemo(() => {
    if (!wildart) {
      return [];
    }
    return WILDARTEN.filter((item) => item.toLowerCase().includes(wildart.toLowerCase()));
  }, [wildart]);

  async function pickImage(fromCamera: boolean) {
    try {
      const permissionResult = fromCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        return;
      }

      const result = fromCamera
        ? await ImagePicker.launchCameraAsync({ quality: 0.7 })
        : await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });

      if (!result.canceled && result.assets.length) {
        setFotos((prev) => [...prev, result.assets[0].uri]);
      }
    } catch (error) {
      console.warn('ImagePicker Fehler', error);
    }
  }

  async function handleSave() {
    if (!autoData) {
      return;
    }

    const entry: JagdEintrag = {
      id: Date.now().toString(),
      typ,
      datum: autoData.datum,
      revier,
      jagdart,
      gps: autoData.gps,
      temperatur: autoData.temperatur,
      wind: autoData.wind,
      wildart: wildart || undefined,
      notizen: notizen || undefined,
      fotos,
      sichtbarkeit: privacy,
    };

    await saveEntry(entry);
  }

  async function handleVoiceCapture() {
    if (recordingSession) {
      setIsProcessingVoice(true);
      const uri = await stopVoiceRecording(recordingSession);
      setRecordingSession(null);
      if (!uri) {
        setIsProcessingVoice(false);
        return;
      }

      const transcript = await transcribeAudioAsync(uri);
      if (transcript) {
        const extracted = await extractEntryFromTranscript(transcript);
        if (extracted?.typ) {
          setTyp(extracted.typ);
        }
        if (extracted?.revier) {
          setRevier(extracted.revier);
        }
        if (extracted?.jagdart) {
          setJagdart(extracted.jagdart);
        }
        if (extracted?.wildart) {
          setWildart(extracted.wildart);
        }
        if (extracted?.notizen) {
          setNotizen(extracted.notizen);
        }
      }
      setIsProcessingVoice(false);
      return;
    }

    const session = await startVoiceRecording();
    if (session) {
      setRecordingSession(session);
    }
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.tabRow}>
        {(['beobachtung', 'abschuss'] as JagdEintrag['typ'][]).map((item) => {
          const active = item === typ;
          return (
            <Pressable
              key={item}
              onPress={() => setTyp(item)}
              style={[
                styles.tab,
                { backgroundColor: active ? colors.primary : colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={{ color: active ? '#fff' : colors.text }}>{item}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.voiceRow}>
        <Pressable
          style={[
            styles.voiceButton,
            {
              backgroundColor: recordingSession ? colors.secondary : colors.primary,
            },
          ]}
          onPress={handleVoiceCapture}
        >
          <Text style={styles.voiceText}>
            {recordingSession ? 'Aufnahme stoppen' : 'KI Voice starten'}
          </Text>
        </Pressable>
        <Text style={{ color: colors.textLight }}>
          {isProcessingVoice ? 'KI analysiert...' : 'Sprich deine Beobachtung ein.'}
        </Text>
      </View>

      <AutoCapturePanel onChange={setAutoData} />

      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>Revier</Text>
        <View style={styles.rowButtons}>
          {reviere.map((item) => (
            <Pressable
              key={item}
              onPress={() => setRevier(item)}
              style={[
                styles.chip,
                {
                  backgroundColor: item === revier ? colors.secondary : colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={{ color: item === revier ? '#fff' : colors.text }}>{item}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>Jagdart</Text>
        <View style={styles.rowButtons}>
          {jagdartOptions.map((item) => (
            <Pressable
              key={item}
              onPress={() => setJagdart(item)}
              style={[
                styles.chip,
                {
                  backgroundColor: item === jagdart ? colors.secondary : colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={{ color: item === jagdart ? '#fff' : colors.text }}>{item}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>Wildart</Text>
        <TextInput
          value={wildart}
          onChangeText={setWildart}
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          placeholder="Wildart eingeben"
          placeholderTextColor={colors.textLight}
        />
        {suggestions.length ? (
          <View style={styles.suggestions}>
            {suggestions.map((item) => (
              <Pressable key={item} onPress={() => setWildart(item)}>
                <Text style={{ color: colors.primary }}>{item}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>Notizen</Text>
        <TextInput
          value={notizen}
          onChangeText={setNotizen}
          style={[styles.textArea, { borderColor: colors.border, color: colors.text }]}
          placeholder="Beobachtungen, Besonderheiten ..."
          placeholderTextColor={colors.textLight}
          multiline
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>Fotos</Text>
        <View style={styles.rowButtons}>
          <Pressable
            style={[styles.chip, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => pickImage(true)}
          >
            <Text style={{ color: colors.text }}>Kamera</Text>
          </Pressable>
          <Pressable
            style={[styles.chip, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => pickImage(false)}
          >
            <Text style={{ color: colors.text }}>Galerie</Text>
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoRow}>
          {fotos.map((uri) => (
            <Image key={uri} source={{ uri }} style={styles.photo} />
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>Sichtbarkeit</Text>
        <PrivacySelector value={privacy} onChange={setPrivacy} />
      </View>

      <Pressable style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={handleSave}>
        <Text style={styles.saveText}>Speichern</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  voiceRow: {
    marginBottom: 16,
    gap: 8,
  },
  voiceButton: {
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  voiceText: {
    color: '#fff',
    fontWeight: '600',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  section: {
    marginTop: 16,
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  rowButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  suggestions: {
    gap: 6,
  },
  photoRow: {
    marginTop: 8,
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 8,
  },
  saveButton: {
    marginTop: 24,
    marginBottom: 32,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontWeight: '600',
  },
});
