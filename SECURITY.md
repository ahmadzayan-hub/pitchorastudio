# Security Policy

We take Pitchora's security seriously. This document explains how to
report a vulnerability, what we consider in scope, and what you can
expect from us.

## Reporting a vulnerability

Please email **security@pitchora.ai** with:

- A description of the issue and its impact.
- Reproduction steps or a proof-of-concept.
- The affected environment (production, staging, PR preview URL, etc.).
- Your contact details for a follow-up.

Do **not** open a public GitHub issue for a vulnerability. Do not
disclose the issue publicly until we have coordinated a fix.

For an encrypted report, request our PGP key by sending a plain
email; we will reply with the key inline.

## Response SLA

| Step | Target |
|------|--------|
| Acknowledge receipt | 2 business days |
| Initial assessment (severity + validity) | 5 business days |
| Fix window for critical / high | 14 days |
| Fix window for medium | 45 days |
| Fix window for low | Next release cycle |
| Public disclosure | Coordinated with reporter, no earlier than 30 days after fix ships |

## Scope

In scope:

- `https://www.pitchora.ai` and its subdomains.
- The Pitchora Next.js application under `/presentiq` and any
  `/api/presentiq/**` route in this repository.
- The service worker (`/sw.js`) and PWA manifest.
- The Stripe webhook handler.
- Any Supabase migration under `supabase/migrations/**` in this repo.

Out of scope:

- Social engineering of Pitchora staff or customers.
- Physical attacks against any office or datacentre.
- Denial-of-service against the public Vercel edge (rate-limited
  outside our control).
- Third-party services we depend on (Supabase, Stripe, OpenAI,
  Anthropic). Report those to the vendor directly.
- Findings against the legacy `Tweenz AI` code paths that predate
  Pitchora. Those routes are frozen and slated for removal.
- Missing security headers on paths outside `/presentiq/**`.
- Missing rate limiting on best-effort endpoints (`/api/feedback`,
  contact form) unless a monetary or data-loss impact is
  demonstrated.
- Reports produced solely by automated scanners without a working
  proof-of-concept.

## Safe harbour

We will not take legal action against researchers who:

- Make a good-faith effort to comply with this policy.
- Test only accounts they own or have explicit permission to test.
- Do not access, modify, or destroy other users' data.
- Do not degrade service availability for other users.
- Give us reasonable time to fix before public disclosure.

## Bounty

Pitchora does not currently run a paid bounty programme. We do offer
public acknowledgement in `SECURITY-HALL-OF-FAME.md` for any
confirmed valid report (with your permission) and, at our
discretion, credit inside the product changelog.

## Reference

See `THREAT_MODEL.md` in the repository root for the current STRIDE
assessment. Reports that map to a known gap listed there are still
welcome; a working proof-of-concept accelerates the fix.
