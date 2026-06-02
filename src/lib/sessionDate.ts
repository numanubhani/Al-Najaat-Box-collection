export interface SessionDateInfo {
  iso: string;
  dayName: string;
  label: string;
  monthKey: string;
  monthLabel: string;
  previousMonthKey: string;
  previousMonthLabel: string;
}

export function buildSessionDate(reference = new Date()): SessionDateInfo {
  const iso = reference.toISOString().split('T')[0];
  const dayName = reference.toLocaleDateString('en-US', { weekday: 'long' });
  const label = reference.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const monthKey = `${reference.getFullYear()}-${String(reference.getMonth() + 1).padStart(2, '0')}`;
  const monthLabel = reference.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const previous = new Date(reference);
  previous.setMonth(previous.getMonth() - 1);
  const previousMonthKey = `${previous.getFullYear()}-${String(previous.getMonth() + 1).padStart(2, '0')}`;
  const previousMonthLabel = previous.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return {
    iso,
    dayName,
    label,
    monthKey,
    monthLabel,
    previousMonthKey,
    previousMonthLabel,
  };
}
