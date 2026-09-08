import Link from "next/link";

/**
 * Scoped 404 for /presentiq/projects/[id]. Rendered when the page
 * calls `notFound()` because the project ID does not exist or the
 * caller is not authorised to see it. Kept intentionally close to
 * the segment throwing `notFound()` so Next.js resolves it before
 * walking up to the /presentiq segment.
 */
export default function ProjectNotFound() {
  return (
    <div className="pq-nf-shell" role="alert">
      <div className="pq-nf-code" aria-hidden>404</div>
      <h1 className="pq-nf-title">We could not open that project.</h1>
      <p className="pq-nf-sub">
        The project may have been deleted, the link may have expired, or you
        may not have access to it. Try one of the routes below.
      </p>
      <div className="pq-nf-links">
        <Link href="/presentiq/projects" className="pq-btn pq-btn-liquid pq-btn-liquid-primary pq-btn-liquid-pill">
          Your projects
        </Link>
        <Link href="/presentiq/projects/new" className="pq-btn pq-btn-liquid pq-btn-liquid-pill">
          New presentation
        </Link>
        <Link href="/presentiq" className="pq-btn pq-btn-liquid pq-btn-liquid-pill">
          Home
        </Link>
      </div>
    </div>
  );
}
