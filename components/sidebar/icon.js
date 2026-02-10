import clsx from "clsx";

function HamburgerIcon() {
  return (
    <svg
      className="w-4 h-4"
      viewBox="0 0 24 24"
      stroke="currentColor"
      fill="none"
    >
      <path d="M4 7h16" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 12h16" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 17h16" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      className="w-4 h-4"
      viewBox="0 0 24 24"
      stroke="currentColor"
      fill="none"
    >
      <path d="M6 6l12 12M6 18L18 6" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function CaretIcon({ rotated }) {
  return (
    <svg
      className={clsx("w-3 h-3 transition-transform", rotated && "rotate-180")}
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path d="M6 8l4 4 4-4" />
    </svg>
  );
}
function HomeIcon() {
  return (
    <svg
      className="w-4 h-4"
      viewBox="0 0 24 24"
      stroke="currentColor"
      fill="none"
    >
      <path
        d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9z"
        strokeWidth="1.8"
      />
      <path d="M9 22V12h6v10" strokeWidth="1.8" />
    </svg>
  );
}
function CubeIcon() {
  return (
    <svg
      className="w-4 h-4"
      viewBox="0 0 24 24"
      stroke="currentColor"
      fill="none"
    >
      <path d="M12 2l9 5-9 5-9-5 9-5z" strokeWidth="1.8" />
      <path d="M3 7v10l9 5 9-5V7" strokeWidth="1.8" />
    </svg>
  );
}
function FileIcon() {
  return (
    <svg
      className="w-4 h-4"
      viewBox="0 0 24 24"
      stroke="currentColor"
      fill="none"
    >
      <path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12V8z"
        strokeWidth="1.8"
      />
      <path d="M14 2v6h6" strokeWidth="1.8" />
    </svg>
  );
}
function InboxIcon() {
  return (
    <svg
      className="w-4 h-4"
      viewBox="0 0 24 24"
      stroke="currentColor"
      fill="none"
    >
      <path d="M3 7h18l-2 10H5L3 7z" strokeWidth="1.8" />
      <path d="M7 7l5 6 5-6" strokeWidth="1.8" />
    </svg>
  );
}
function ChartIcon() {
  return (
    <svg
      className="w-4 h-4"
      viewBox="0 0 24 24"
      stroke="currentColor"
      fill="none"
    >
      <path d="M3 3v18h18" strokeWidth="1.8" />
      <path d="M7 13h3v5H7zM12 9h3v9h-3zM17 5h3v13h-3z" strokeWidth="1.8" />
    </svg>
  );
}
// code for payment icon
function WalletIcon() {
  return (
    <svg
      className="w-4 h-4"
      viewBox="0 0 24 24"
      stroke="currentColor"
      fill="none"
    >
      <rect x="3" y="6" width="18" height="12" rx="2" strokeWidth="1.8" />
      <path d="M3 9h18" strokeWidth="1.8" />
      <circle cx="16.5" cy="12" r="1.25" fill="currentColor" />
    </svg>
  );
}
function MenuAccessIcon() {
  return (
    <svg
      className="w-4 h-4"
      viewBox="0 0 24 24"
      stroke="currentColor"
      fill="none"
    >
      <path
        d="M12 3l7 4v5c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9V7l7-4z"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 12l2 2 4-4"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DotIcon() {
  return <span className="block w-1.5 h-1.5 rounded-full bg-white/80" />;
}
function pickIcon(icon) {
  switch (icon) {
    case "home":
      return <HomeIcon />;
    case "cube":
      return <CubeIcon />;
    case "file":
      return <FileIcon />;
    case "inbox":
      return <InboxIcon />;
    case "wallet":
      return <WalletIcon />;
    case "chart":
      return <ChartIcon />;
    case "access":
      return <MenuAccessIcon />;
    default:
      return <DotIcon />;
  }
}
export {
  pickIcon,
  HamburgerIcon,
  CloseIcon,
  CaretIcon,
};
