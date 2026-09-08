import Link from "next/link";

/**
 * Segment-level 404 for /presentiq/*.
 *
 * Renders whenever `notFound()` is called inside the segment or a
 * user hits an unknown URL. Returns HTTP 404 (Next.js sets the status
 * automatically for this convention) so crawlers know not to index
 * dead links, and search engines drop them from the index.
 */
export default function PresentIqNotFound() {
  return (
    <div className="pq-nf-shell" role="alert">
      <div className="pq-nf-code" aria-hidden>404</div>
      <h1 className="pq-nf-title">We could not find that page.</h1>
      <p className="pq-nf-sub">
        The link may be broken, the project may have been deleted, or the
        page may have moved. The links below cover most reasons you might
        have landed here.
      </p>
      <div className="pq-nf-links">
        <Link href="/presentiq" className="pq-btn pq-btn-liquid pq-btn-liquid-primary pq-btn-liquid-pill">
          Home
        </Link>
        <Link href="/presentiq/templates" className="pq-btn pq-btn-liquid pq-btn-liquid-pill">
          Templates
        </Link>
        <Link href="/presentiq/pricing" className="pq-btn pq-btn-liquid pq-btn-liquid-pill">
          Pricing
        </Link>
        <Link href="/presentiq/contact" className="pq-btn pq-btn-liquid pq-btn-liquid-pill">
          Contact
        </Link>
      </div>
    </div>
  );
}
