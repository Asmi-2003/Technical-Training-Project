// Presentation-only helpers (icons, avatars, formatting, shared constants). No data logic here.

export const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];
export const STATUSES = ['Applied', 'Reviewing', 'Shortlisted', 'Rejected', 'Hired'];

export const salary = (j) =>
  j.salary_min || j.salary_max
    ? `₹${(j.salary_min || 0).toLocaleString()} – ₹${(j.salary_max || 0).toLocaleString()}`
    : 'Salary not disclosed';

// Earth-toned tiles so company avatars feel consistent with the green/marigold theme.
const PALETTE = [
  ['#E3EBD5', '#3E5A1C'], ['#F6E3BE', '#7A4E00'], ['#D9E8E4', '#12574B'],
  ['#F2DAD3', '#8F3321'], ['#E4E1EF', '#443A7A'], ['#E8E4D6', '#5C5232'],
];

export function Avatar({ name = '?', size = 48, round = false }) {
  const hash = [...name].reduce((a, c) => a + c.charCodeAt(0), 0);
  const [bg, fg] = PALETTE[hash % PALETTE.length];
  return (
    <span
      className="avatar"
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        background: bg,
        color: fg,
        borderRadius: round ? '50%' : Math.round(size * 0.22),
        fontSize: size * 0.42,
      }}
    >
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
}

export function timeAgo(date) {
  if (!date) return '';
  const s = Math.max(0, (Date.now() - new Date(date).getTime()) / 1000);
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)}d ago`;
  return new Date(date).toLocaleDateString();
}

const P = {
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM20 20l-4.2-4.2',
  pin: 'M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  bookmark: 'M6 4h12v16l-6-4-6 4V4Z',
  mail: 'M4 6h16v12H4V6Zm0 1 8 6 8-6',
  phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A15 15 0 0 1 4 5a1 1 0 0 1 1-1Z',
  file: 'M7 3h7l5 5v13H7V3Zm7 0v5h5',
  back: 'M19 12H5m6-6-6 6 6 6',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  plus: 'M12 5v14M5 12h14',
  briefcase: 'M4 8h16v11H4V8Zm5 0V5h6v3M4 13h16',
  grid: 'M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 9a8 8 0 0 1 16 0',
  logout: 'M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M16 8l4 4-4 4M20 12H9',
  close: 'M6 6l12 12M18 6 6 18',
  edit: 'M4 20h4L19 9l-4-4L4 16v4Zm9-13 4 4',
  trash: 'M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13',
  login: 'M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 8l-4 4 4 4M6 12h11',
  users: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm-6 9a6 6 0 0 1 12 0M16 4.5a3.5 3.5 0 0 1 0 6.5m2 3a6 6 0 0 1 3 6',
};

// All icons are drawn as outlines; pass `fill` to colour the inside (e.g. a saved bookmark).
export function Icon({ name, size = 18, fill = false }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="icon"
      fill={fill ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={P[name]} />
    </svg>
  );
}

export function StatusChip({ status }) {
  return <span className={`chip st-${status}`}>{status}</span>;
}

export function Spinner({ label = 'Loading' }) {
  return (
    <div className="loader" role="status">
      <span className="spin" />
      {label}…
    </div>
  );
}
