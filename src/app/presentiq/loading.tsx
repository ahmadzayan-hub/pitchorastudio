/**
 * Segment-level loading UI for /presentiq/*.
 *
 * Next.js App Router streams this file's tree while the sibling
 * page.tsx (or nested layout) resolves. Without it, users see a blank
 * frame between route transitions on slow networks or during LLM
 * calls. The dev console also logged "no loading boundary" warnings.
 *
 * We render a lightweight skeleton that mirrors the marketing shell's
 * typography so the switch does not feel like a full reload.
 */
export default function PresentIqLoading() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="pq-loading-shell"
      role="status"
    >
      <div className="pq-loading-eyebrow" />
      <div className="pq-loading-title" />
      <div className="pq-loading-title" style={{ width: "70%" }} />
      <div className="pq-loading-sub" />
      <div className="pq-loading-grid" aria-hidden>
        <div /><div /><div /><div /><div /><div />
      </div>
      <span className="sr-only">Loading</span>
    </div>
  );
}
