import { backendFetch } from '../../../lib/backend';
import { ActivityFeed } from '../../../components/dashboard/activity-feed';
import { CustomerTable } from '../../../components/dashboard/customer-table';
import { KpiGrid } from '../../../components/dashboard/kpi-grid';
import { ConfigPanels } from '../../../components/dashboard/config-panels';

interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  status: string;
  projectType?: string | null;
  interest?: string | null;
  workflowStatus: string;
  callCount: number;
  voiceMinutes: number;
  automationCoverage: number;
  csat: number;
  lastActivity?: string | null;
  createdAt: string;
}

interface MetricsSummary {
  customers: number;
  totalCalls: number;
  totalVoiceMinutes: number;
  automationCoverage: number;
  csat: number;
  leadCount: number;
  activeWorkflows: number;
}

interface ActivityItem {
  id: string;
  source: string;
  message: string;
  createdAt: string;
  customer?: {
    id: string;
    name: string;
    company: string;
  } | null;
}

interface IntegrationConfigResponse {
  id: string;
  type: string;
  data: Record<string, unknown>;
}

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [customers, metrics, activity, n8nConfig, elevenConfig] = await Promise.all([
    backendFetch<Customer[]>('/customers', { cache: 'no-store' }),
    backendFetch<MetricsSummary>('/metrics/overview', { cache: 'no-store' }),
    backendFetch<ActivityItem[]>('/metrics/activity', { cache: 'no-store' }),
    backendFetch<IntegrationConfigResponse>('/config/n8n', { cache: 'no-store' }),
    backendFetch<IntegrationConfigResponse>('/config/elevenlabs', { cache: 'no-store' })
  ]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-display text-white">Organisations-Dashboard</h1>
        <p className="mt-2 text-sm text-slate-300">
          Echtzeit-Kennzahlen, Lead-Status und Integrations-Configs für Ihre KI-Automation.
        </p>
      </div>
      <KpiGrid metrics={metrics} />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <CustomerTable customers={customers} />
        <ActivityFeed events={activity} />
      </div>
      <ConfigPanels n8nConfig={n8nConfig.data ?? {}} elevenConfig={elevenConfig.data ?? {}} />
    </div>
  );
}
