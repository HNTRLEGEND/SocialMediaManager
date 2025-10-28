import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios, { AxiosRequestConfig } from 'axios';

@Injectable()
export class N8nService {
  private get baseUrl(): string {
    const v = process.env.N8N_BASE_URL;
    if (!v) throw new InternalServerErrorException('N8N_BASE_URL not configured');
    return v.replace(/\/$/, '');
  }

  private get apiKey(): string {
    const v = process.env.N8N_API_KEY;
    if (!v) throw new InternalServerErrorException('N8N_API_KEY not configured');
    return v;
  }

  private headers() {
    // For n8n REST API you can use X-N8N-API-KEY; for webhooks it's not required.
    return {
      'Content-Type': 'application/json',
      'X-N8N-API-KEY': this.apiKey,
    } as Record<string, string>;
  }

  async post(path: string, body: any, config?: AxiosRequestConfig) {
    const url = `${this.baseUrl}${path}`;
    const res = await axios.post(url, body, {
      headers: this.headers(),
      validateStatus: () => true, // don't throw on non-2xx so controller can handle gracefully
      ...(config || {}),
    });
    return { status: res.status, data: res.data };
  }

  async triggerLeadAgent(payload: any) {
    // If absolute URL is provided, prefer it
    const absolute = process.env.N8N_LEAD_WEBHOOK_URL;
    if (absolute && /^https?:\/\//i.test(absolute)) {
      const res = await axios.post(absolute, payload, {
        headers: { 'Content-Type': 'application/json' },
        validateStatus: () => true,
      });
      return { status: res.status, data: res.data };
    }

    // Otherwise, build from base URL and path
    const path = (process.env.N8N_LEAD_WEBHOOK_PATH || 'lead-agent').replace(/^\//, '');
    const primary = await this.post(`/webhook/${path}`, payload);
    if (primary.status >= 200 && primary.status < 300) return primary;
    const fallback = await this.post(`/webhook-test/${path}`, payload);
    return fallback;
  }

  async triggerMaster(payload: any) {
    const absolute = process.env.N8N_MASTER_WEBHOOK_URL;
    if (absolute && /^https?:\/\//i.test(absolute)) {
      const res = await axios.post(absolute, payload, {
        headers: { 'Content-Type': 'application/json' },
        validateStatus: () => true,
      });
      return { status: res.status, data: res.data };
    }
    const path = (process.env.N8N_MASTER_WEBHOOK_PATH || 'wieslogic-master').replace(/^\//, '');
    const primary = await this.post(`/webhook/${path}`, payload);
    if (primary.status >= 200 && primary.status < 300) return primary;
    const fallback = await this.post(`/webhook-test/${path}`, payload);
    return fallback;
  }
}
