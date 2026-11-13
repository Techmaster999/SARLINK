/* Small inline icons for the Dashboard board (same shapes as the Figma's lucide icons). */

function Icon({ size = 14, color = "currentColor", children }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      {children}
    </svg>
  );
}

export function ChevronIcon({ open, size = 14, color }) {
  return (
    <Icon size={size} color={color}>
      <path d={open ? "m6 9 6 6 6-6" : "m9 18 6-6-6-6"} />
    </Icon>
  );
}

export function ShieldIcon({ size = 18, color = "#FFFFFF" }) {
  return (
    <Icon size={size} color={color}>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </Icon>
  );
}

export function UserIcon({ size = 13, color }) {
  return (
    <Icon size={size} color={color}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </Icon>
  );
}

export function UsersIcon({ size = 13, color }) {
  return (
    <Icon size={size} color={color}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </Icon>
  );
}

export function TruckIcon({ size = 16, color }) {
  return (
    <Icon size={size} color={color}>
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path d="M15 18H9" />
      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
      <circle cx="17" cy="18" r="2" />
      <circle cx="7" cy="18" r="2" />
    </Icon>
  );
}

export function ClockIcon({ size = 11, color }) {
  return (
    <Icon size={size} color={color}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </Icon>
  );
}

export function CheckCircleIcon({ size = 16, color = "#16A34A" }) {
  return (
    <Icon size={size} color={color}>
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </Icon>
  );
}
