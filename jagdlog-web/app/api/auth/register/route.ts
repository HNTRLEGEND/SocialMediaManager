/**
 * Auth API - Register
 */
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { initDatabase, generateUUID, now } from '@/lib/database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email und Passwort erforderlich' },
        { status: 400 }
      );
    }

    const db = await initDatabase();

    // Prüfen ob User bereits existiert
    const existing = db.exec('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0 && existing[0].values.length > 0) {
      return NextResponse.json(
        { error: 'Email bereits registriert' },
        { status: 409 }
      );
    }

    // Passwort hashen
    const passwordHash = await bcrypt.hash(password, 10);

    // User erstellen
    const userId = generateUUID();
    const createdAt = now();

    db.run(
      `INSERT INTO users (id, email, password_hash, name, created_at, last_login)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, email, passwordHash, name || '', createdAt, createdAt]
    );

    // Standard-Revier erstellen
    const revierId = generateUUID();
    db.run(
      `INSERT INTO reviere (id, user_id, name, beschreibung, bundesland, erstellt_am, aktualisiert_am)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        revierId,
        userId,
        'Mein Revier',
        'Automatisch erstellt',
        'DE',
        createdAt,
        createdAt,
      ]
    );

    // JWT Token generieren
    const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '30d' });

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: userId,
        email,
        name: name || '',
        revierId,
      },
    });
  } catch (error: any) {
    console.error('[API] Register error:', error);
    return NextResponse.json(
      { error: 'Registrierung fehlgeschlagen', details: error.message },
      { status: 500 }
    );
  }
}
