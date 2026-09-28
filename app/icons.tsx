/*
  The handful of stroke icons the site uses, on links and buttons. All
  inherit currentColor so the same glyph works on ink, on muted text, and
  reversed on a filled button.
*/

type IconProps = { size?: number; className?: string };

function Icon({
  size = 14,
  className,
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function ArrowIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Icon>
  );
}

export function SendIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M22 2L11 13" />
      <path d="M22 2L15 22l-4-9-9-4z" />
    </Icon>
  );
}

export function OutIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M7 17L17 7" />
      <path d="M8 7h9v9" />
    </Icon>
  );
}

export function ChevronIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 9l6 6 6-6" />
    </Icon>
  );
}
