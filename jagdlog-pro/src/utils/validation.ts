/**
 * HNTR LEGEND Pro - Validierungs-Hilfsfunktionen
 */

import { z } from 'zod';
import { JagdEintragBasisSchema, AbschussEintragSchema, BeobachtungsEintragSchema } from '../types';

/**
 * Validiert einen Beobachtungs-Eintrag
 */
export const validateBeobachtung = (data: unknown) => {
  return BeobachtungsEintragSchema.safeParse(data);
};

/**
 * Validiert einen Abschuss-Eintrag
 */
export const validateAbschuss = (data: unknown) => {
  return AbschussEintragSchema.safeParse(data);
};

/**
 * Validiert eine E-Mail-Adresse
 */
export const isValidEmail = (email: string): boolean => {
  const schema = z.string().email();
  return schema.safeParse(email).success;
};

/**
 * Validiert eine Telefonnummer (einfache Prüfung)
 */
export const isValidPhone = (phone: string): boolean => {
  // Erlaubt: +49 170 1234567, 0170-1234567, etc.
  const pattern = /^[+]?[0-9\s\-()]+$/;
  return pattern.test(phone) && phone.replace(/\D/g, '').length >= 6;
};

/**
 * Validiert Koordinaten
 */
export const isValidCoordinates = (lat: number, lon: number): boolean => {
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
};

/**
 * Validiert ein Datum
 */
export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

/**
 * Validiert ein Gewicht (positiv)
 */
export const isValidWeight = (weight: number): boolean => {
  return typeof weight === 'number' && weight > 0 && weight < 1000;
};

/**
 * Bereinigt einen String für die Datenbank
 */
export const sanitizeString = (input: string): string => {
  return input.trim().replace(/\s+/g, ' ');
};

/**
 * Formatiert eine Validierungs-Fehlermeldung
 */
export const formatValidationErrors = (errors: z.ZodError<unknown>): string[] => {
  return errors.issues.map((issue) => {
    const path = issue.path.join('.');
    return path ? `${path}: ${issue.message}` : issue.message;
  });
};
