const agents = [
  {
    name: 'Voice Concierge',
    type: 'VOICE',
    status: 'LIVE',
    project: 'Customer Care',
    usage: '428 calls'
  },
  {
    name: 'Sales Navigator',
    type: 'CHAT',
    status: 'LIVE',
    project: 'Revenue Ops',
    usage: '1.203 chats'
  },
  {
    name: 'Invoice Automator',
    type: 'BACKOFFICE',
    status: 'PAUSED',
    project: 'Finance',
    usage: '2.938 tasks'
  }
];

export function AgentTable() {
  return (
    <div className="rounded-3xl border border-white/5 bg-white/5 p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Aktive Agents</h3>
        <span className="text-xs text-primary">Realtime aktualisiert</span>
      </div>
      <table className="mt-6 w-full text-left text-sm text-slate-300">
        <thead className="text-xs uppercase tracking-[0.2rem] text-primary/70">
          <tr>
            <th className="pb-3">Agent</th>
            <th className="pb-3">Typ</th>
            <th className="pb-3">Status</th>
            <th className="pb-3">Projekt</th>
            <th className="pb-3 text-right">Usage</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {agents.map((agent) => (
            <tr key={agent.name} className="transition hover:bg-white/5">
              <td className="py-4 font-medium text-white">{agent.name}</td>
              <td className="py-4 text-xs text-primary">{agent.type}</td>
              <td className="py-4">
                <span className="rounded-full bg-primary/20 px-3 py-1 text-xs text-primary">{agent.status}</span>
              </td>
              <td className="py-4">{agent.project}</td>
              <td className="py-4 text-right text-white/80">{agent.usage}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
