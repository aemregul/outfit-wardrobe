export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatShortDate(dateStr: string): { day: string; month: string; year: string } {
  const d = new Date(dateStr);
  return {
    day: d.toLocaleDateString('tr-TR', { day: '2-digit' }),
    month: d.toLocaleDateString('tr-TR', { month: 'short' }),
    year: d.toLocaleDateString('tr-TR', { year: 'numeric' }),
  };
}

// Converts "YYYY-MM-DD" or any ISO string to "YYYY-MM-DDTHH:mm:ss" for backend LocalDateTime.
// If only a date part is given, defaults the time to 12:00:00.
export function toLocalDateTime(isoDate: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
    return `${isoDate}T12:00:00`;
  }
  return isoDate.slice(0, 19);
}
