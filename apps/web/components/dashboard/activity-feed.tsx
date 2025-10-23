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

function formatTime(value: string) {
  return new Intl.DateTimeFormat('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit'
  }).format(new Date(value));
}

export function ActivityFeed({ events }: { events: ActivityItem[] }) {
  return (
    <div className="rounded-3xl border border-white/5 bg-background/60 p-6">
      <h3 className="text-lg font-semibold text-white">Letzte Aktivitäten</h3>
      <ul className="mt-5 space-y-4 text-sm text-slate-300">
        {events.length === 0 ? (
          <li className="rounded-2xl border border-white/5 bg-white/5 p-4 text-center text-slate-400">
            Noch keine Webhook-Events vorhanden.
          </li>
        ) : (
          events.map((activity) => (
            <li key={activity.id} className="rounded-2xl border border-white/5 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-[0.3rem] text-primary/70">{formatTime(activity.createdAt)}</div>
              <p className="mt-2 text-white/90">{activity.message}</p>
              {activity.customer ? (
                <div className="mt-2 text-xs text-slate-400">
                  {activity.customer.name} · {activity.customer.company}
                </div>
              ) : null}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
