/**
 * Auth API - Login
 */
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { initDatabase, now } from '@/lib/database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email und Passwort erforderlich' },
        { status: 400 }
      );
    }

    const db = await initDatabase();

    // User suchen
    const result = db.exec(
      'SELECT id, email, password_hash, name FROM users WHERE email = ?',
      [email]
    );

    if (result.length === 0 || result[0].values.length === 0) {
      return NextResponse.json(
        { error: 'Ungültige Anmeldedaten' },
        { status: 401 }
      );
    }

    const user = result[0].values[0];
    const [userId, userEmail, passwordHash, userName] = user;

    // Passwort prüfen
    const isValid = await bcrypt.compare(password, passwordHash as string);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Ungültige Anmeldedaten' },
        { status: 401 }
      );
    }

    // Last login aktualisieren
    db.run('UPDATE users SET last_login = ? WHERE id = ?', [now(), userId]);

    // Revier-ID holen
    const revierResult = db.exec(
      'SELECT id FROM reviere WHERE user_id = ? LIMIT 1',
      [userId]
    );
    const revierId = revierResult[0]?.values[0]?.[0] || null;

    // JWT Token generieren
    const token = jwt.sign({ userId, email: userEmail }, JWT_SECRET, {
      expiresIn: '30d',
    });

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: userId,
        email: userEmail,
        name: userName || '',
        revierId,
      },
    });
  } catch (error: any) {
    console.error('[API] Login error:', error);
    return NextResponse.json(
      { error: 'Login fehlgeschlagen', details: error.message },
      { status: 500 }
    );
  }
}
