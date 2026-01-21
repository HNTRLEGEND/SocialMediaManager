import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PrivacyMode } from '../types';
import { useTheme } from '@react-navigation/native';

interface PrivacySelectorProps {
  value: PrivacyMode;
  onChange: (value: PrivacyMode) => void;
}

const options: { label: string; value: PrivacyMode }[] = [
  { label: 'Privat', value: 'privat' },
  { label: 'Freunde', value: 'freunde' },
  { label: 'Öffentlich', value: 'oeffentlich' },
];

export function PrivacySelector({ value, onChange }: PrivacySelectorProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[
              styles.option,
              { borderColor: colors.border, backgroundColor: isActive ? colors.primary : colors.card },
            ]}
          >
            <Text style={{ color: isActive ? '#fff' : colors.text }}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
  },
  option: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
});
