import { Audio } from 'expo-av';

export interface VoiceRecordingSession {
  recording: Audio.Recording;
}

export async function startVoiceRecording(): Promise<VoiceRecordingSession | null> {
  try {
    const permission = await Audio.requestPermissionsAsync();
    if (!permission.granted) {
      throw new Error('Audio-Berechtigung verweigert');
    }

    await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY,
    );

    return { recording };
  } catch (error) {
    console.warn('Audio Aufnahme Fehler', error);
    return null;
  }
}

export async function stopVoiceRecording(session: VoiceRecordingSession) {
  try {
    await session.recording.stopAndUnloadAsync();
    const uri = session.recording.getURI();
    return uri ?? null;
  } catch (error) {
    console.warn('Audio Stop Fehler', error);
    return null;
  }
}
