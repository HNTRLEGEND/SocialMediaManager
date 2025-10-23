// Utility-Funktionen für das Frontend.
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  // Kombiniert Tailwind-Klassen und entfernt Konflikte
  return twMerge(clsx(inputs));
}
