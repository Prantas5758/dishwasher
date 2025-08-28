export function classNames(...arr) {
  return arr.filter(Boolean).join(" ");
}
export function formatDateTime(iso, tz) {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat('id-ID', {
      timeZone: tz || Intl.DateTimeFormat().resolvedOptions().timeZone,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).format(d);
  } catch {
    return iso;
  }
}
