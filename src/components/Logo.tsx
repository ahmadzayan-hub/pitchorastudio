interface LogoProps {
  className?: string;
}

/**
 * Brand mark: prompt cursor (>) into an input line, with a spark above —
 * symbolising "your input becomes a polished, sparkling prompt".
 */
export default function Logo({ className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 512 512"
      role="img"
      aria-label="ZAIan Studio"
      className={className}
    >
      <defs>
        <linearGradient id="po-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="60%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <linearGradient id="po-spark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="112" fill="url(#po-bg)" />
      <path
        d="M120 188 L196 256 L120 324"
        stroke="#ffffff"
        strokeWidth="34"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.92"
      />
      <rect x="216" y="338" width="180" height="20" rx="10" fill="#ffffff" opacity="0.55" />
      <path
        d="M360 120 L376 168 L424 184 L376 200 L360 248 L344 200 L296 184 L344 168 Z"
        fill="url(#po-spark)"
      />
    </svg>
  );
}
