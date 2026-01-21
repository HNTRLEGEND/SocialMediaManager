export function formatDate(date: Date) {
  return date.toLocaleDateString('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });
}

export function formatTime(date: Date) {
  return date.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function groupByDate<T extends { datum: Date }>(entries: T[]) {
  return entries.reduce<Record<string, T[]>>((acc, entry) => {
    const key = formatDate(entry.datum);
    acc[key] = acc[key] ? [...acc[key], entry] : [entry];
    return acc;
  }, {});
}
