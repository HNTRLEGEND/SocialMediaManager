import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { getAssistantReply } from '../services/ai/openaiClient';

interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function AssistantScreen() {
  const { colors } = useTheme();
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Waidmannsheil! Wie kann ich heute unterstützen?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const chatMessages = useMemo(
    () => messages.map((message) => ({ role: message.role, content: message.content })),
    [messages],
  );

  async function handleSend() {
    if (!input.trim()) {
      return;
    }

    const newMessage: AssistantMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput('');
    setIsLoading(true);

    const reply = await getAssistantReply([...chatMessages, newMessage]);
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-assistant`,
        role: 'assistant',
        content: reply,
      },
    ]);
    setIsLoading(false);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>KI-Begleiter</Text>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              {
                alignSelf: item.role === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor: item.role === 'user' ? colors.primary : colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={{ color: item.role === 'user' ? '#fff' : colors.text }}>{item.content}</Text>
          </View>
        )}
        contentContainerStyle={styles.chat}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          placeholder="Frage an den KI-Begleiter"
          placeholderTextColor={colors.textLight}
          value={input}
          onChangeText={setInput}
        />
        <Pressable
          style={[styles.sendButton, { backgroundColor: colors.primary }]}
          onPress={handleSend}
          disabled={isLoading}
        >
          <Text style={styles.sendText}>{isLoading ? '...' : 'Senden'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  chat: {
    gap: 12,
    paddingBottom: 16,
  },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
  },
  sendButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  sendText: {
    color: '#fff',
    fontWeight: '600',
  },
});
