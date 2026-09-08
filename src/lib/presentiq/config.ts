/**
 * Pitchora — single source of truth for contact + brand metadata.
 *
 * Anything user-facing that names "Ahmad" or his email should pull from
 * here. Renaming the founder, swapping inboxes, or running Pitchora
 * under a different brand later is a one-line change in this file.
 */

export const PQ_BRAND_NAME = "Pitchora";
export const PQ_BRAND_TAGLINE = "From spark to boardroom-ready deck, in minutes.";
export const PQ_FOUNDER_NAME = "Ahmad";
export const PQ_CONTACT_EMAIL = "Ahmad.zaian@outlook.com";
export const PQ_CONTACT_SUBJECT_DEFAULT = "Pitchora — feedback / support";
export const PQ_CONTACT_MAILTO = `mailto:${PQ_CONTACT_EMAIL}?subject=${encodeURIComponent(
  PQ_CONTACT_SUBJECT_DEFAULT,
)}`;

/** Build a mailto link with a custom subject prefilled. */
export function pqMailto(subject?: string): string {
  if (!subject) return PQ_CONTACT_MAILTO;
  return `mailto:${PQ_CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}
