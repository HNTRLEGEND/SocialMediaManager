import { Injectable } from '@nestjs/common';
import { google, sheets_v4 } from 'googleapis';

@Injectable()
export class GoogleSheetsService {
  private sheets?: sheets_v4.Sheets;

  private ensureClient() {
    if (this.sheets) return this.sheets;

    // Prefer explicit env for service account
    let email = process.env.GOOGLE_SA_EMAIL || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    let pkRaw = process.env.GOOGLE_SA_PRIVATE_KEY || process.env.GOOGLE_PRIVATE_KEY;
    let credsJson = process.env.GOOGLE_CREDENTIALS_JSON;
    const credsB64 = process.env.GOOGLE_CREDENTIALS_JSON_BASE64;

    if (!credsJson && credsB64) {
      try {
        const buf = Buffer.from(credsB64, 'base64');
        credsJson = buf.toString('utf8');
      } catch {
        // ignore
      }
    }

    // Prefer full JSON if present (overrides partial envs)
    if (credsJson) {
      try {
        const obj = JSON.parse(credsJson);
        email = obj.client_email || email;
        pkRaw = obj.private_key || pkRaw;
      } catch {
        // ignore JSON parse
      }
    }

    if (!email || !pkRaw) {
      return undefined;
    }

    let privateKey = pkRaw;
    if (!privateKey) return undefined;

    const normalizedKey = privateKey
      .toString()
      .trim()
      .replace(/^"|"$/g, '')
      .replace(/\\n/g, '\n');
    const auth = new google.auth.GoogleAuth({
      credentials: { client_email: email, private_key: normalizedKey },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    this.sheets = google.sheets({ version: 'v4', auth });
    return this.sheets;
  }

  isConfigured(): boolean {
    return !!this.ensureClient();
  }

  async readValues(sheetId: string, rangeA1: string) {
    const client = this.ensureClient();
    if (!client) {
      return { configured: false, rows: [], note: 'Configure GOOGLE_SA_EMAIL and GOOGLE_SA_PRIVATE_KEY (or GOOGLE_CREDENTIALS_JSON) to enable Sheets import.' };
    }
    const res = await client.spreadsheets.values.get({ spreadsheetId: sheetId, range: rangeA1 });
    const rows = res.data.values || [];
    return { configured: true, rows };
  }
}
