// CustomersPage: fokussiert auf Lead- und Kundenpflege innerhalb des Dashboards.
import { backendFetch } from '../../../lib/backend';
import { CustomerManager } from '../../../components/dashboard/customer-manager';

interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  status: string;
  projectType?: string | null;
  interest?: string | null;
}

// Force-Dynamic, damit neue Leads sofort angezeigt werden
export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
  // Kundendaten serverseitig abrufen
  const customers = await backendFetch<Customer[]>('/customers', { cache: 'no-store' });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display text-white">Kundenverwaltung</h1>
        <p className="mt-2 text-sm text-slate-300">
          Leads erfassen, Status aktualisieren und Konfigurationen für Automationen dokumentieren.
        </p>
      </div>
      <CustomerManager initialCustomers={customers} />
    </div>
  );
}
