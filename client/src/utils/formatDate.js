export const formatDate = (isoString) => {
  if (!isoString) return '—';
  return new Intl.DateTimeFormat('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(isoString));
};
export const formatDateTime = (isoString) => {
  if (!isoString) return '—';
  return new Intl.DateTimeFormat('en-ZA', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(isoString));
};
export const timeAgo = (isoString) => {
  if (!isoString) return '—';
  const seconds = Math.floor((new Date() - new Date(isoString)) / 1000);
  const intervals = [
    { label: 'year', seconds: 31536000 }, { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },   { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },     { label: 'minute', seconds: 60 },
  ];
  for (const i of intervals) {
    const count = Math.floor(seconds / i.seconds);
    if (count >= 1) return `${count} ${i.label}${count > 1 ? 's' : ''} ago`;
  }
  return 'Just now';
};
