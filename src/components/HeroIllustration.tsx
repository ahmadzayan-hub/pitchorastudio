/**
 * Minimal hero illustration: rough scribbled note → spark → polished card.
 * SVG, no images, RTL-safe (mirrors automatically when html[dir=rtl]).
 *
 * Colours come from CSS classes (`.hi-*`) defined in globals.css so the
 * illustration adapts cleanly to dark mode.
 */
export default function HeroIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 240"
      role="img"
      aria-label="Raw idea becomes polished prompt"
      className={className}
    >
      <defs>
        <linearGradient id="hi-spark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <linearGradient id="hi-card" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#eef2ff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#fae8ff" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      {/* RAW NOTE (left) */}
      <g transform="translate(20,30)">
        <rect width="180" height="180" rx="12" className="hi-raw-bg" strokeWidth="2" />
        <path d="M22 36 H140" className="hi-raw-line"  strokeWidth="3" strokeLinecap="round" />
        <path d="M22 60 H120" className="hi-raw-line"  strokeWidth="3" strokeLinecap="round" />
        <path d="M22 84 H150" className="hi-raw-line"  strokeWidth="3" strokeLinecap="round" />
        {/* messy scribble */}
        <path
          d="M22 118 q12 -18 28 0 t28 0 t28 0 t28 0 t28 0"
          className="hi-raw-scribble"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <text x="22" y="160" className="hi-raw-label" fontFamily="ui-sans-serif,system-ui" fontSize="13">raw idea…</text>
      </g>

      {/* ARROW + SPARK */}
      <g transform="translate(220,110)">
        <path
          d="M0 0 H140"
          stroke="url(#hi-spark)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="2 8"
        />
        <path
          d="M132 -8 L150 0 L132 8"
          stroke="url(#hi-spark)"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        <g transform="translate(70,-50)">
          <path
            d="M0 0 L8 22 L30 30 L8 38 L0 60 L-8 38 L-30 30 L-8 22 Z"
            fill="url(#hi-spark)"
          />
        </g>
      </g>

      {/* POLISHED CARD (right) */}
      <g transform="translate(400,30)">
        <rect width="180" height="180" rx="12" fill="url(#hi-card)" className="hi-card-stroke" strokeWidth="2" />
        <text x="22" y="34"  className="hi-card-label" fontFamily="ui-sans-serif,system-ui" fontSize="11" fontWeight="700">CONTEXT</text>
        <path d="M22 46 H140" className="hi-card-line" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M22 60 H110" className="hi-card-line" strokeWidth="2.5" strokeLinecap="round" />

        <text x="22" y="86"  className="hi-card-label" fontFamily="ui-sans-serif,system-ui" fontSize="11" fontWeight="700">TASK</text>
        <path d="M22 98 H150" className="hi-card-line" strokeWidth="2.5" strokeLinecap="round" />

        <text x="22" y="124" className="hi-card-label" fontFamily="ui-sans-serif,system-ui" fontSize="11" fontWeight="700">FORMAT</text>
        <path d="M22 136 H100" className="hi-card-line" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M22 150 H140" className="hi-card-line" strokeWidth="2.5" strokeLinecap="round" />

        <circle cx="158" cy="160" r="7" fill="#10b981" />
        <path d="M155 160 l3 3 l5 -6" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}
