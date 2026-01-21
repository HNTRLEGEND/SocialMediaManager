export interface SchonzeitFenster {
  von: string;
  bis: string;
  beschreibung: string;
}

export type SchonzeitenBundesland = Record<string, SchonzeitFenster[]>;

export const SCHONZEITEN: Record<string, SchonzeitenBundesland> = {
  'nordrhein-westfalen': {
    rehbock: [
      { von: '01.02', bis: '30.04', beschreibung: 'Schonzeit Rehbock' },
    ],
    rehwild_weiblich: [
      { von: '01.02', bis: '31.08', beschreibung: 'Schonzeit Ricke/Kitz' },
    ],
    schwarzwild: [
      { von: '01.02', bis: '31.03', beschreibung: 'Schonzeit Keiler' },
    ],
  },
  bayern: {
    rehbock: [
      { von: '16.10', bis: '30.04', beschreibung: 'Schonzeit Rehbock' },
    ],
    rehwild_weiblich: [
      { von: '16.01', bis: '31.08', beschreibung: 'Schonzeit Ricke/Kitz' },
    ],
  },
};

function toDayOfYear(value: string, year: number) {
  const [day, month] = value.split('.').map(Number);
  return new Date(year, month - 1, day).getTime();
}

export function isSchonzeit(
  bundesland: string,
  wildartKey: string,
  date: Date = new Date(),
) {
  const land = SCHONZEITEN[bundesland];
  if (!land || !land[wildartKey]) {
    return null;
  }

  const windows = land[wildartKey];
  const today = date.getTime();
  const year = date.getFullYear();

  for (const window of windows) {
    const start = toDayOfYear(window.von, year);
    const end = toDayOfYear(window.bis, year);
    const crossesYear = end < start;
    const inRange = crossesYear
      ? today >= start || today <= end
      : today >= start && today <= end;

    if (inRange) {
      return window;
    }
  }

  return null;
}
