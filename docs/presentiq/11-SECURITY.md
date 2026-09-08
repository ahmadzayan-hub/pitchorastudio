# PresentIQ — Security Architecture

## 1. Threat Model

| Threat | Mitigation |
|---|---|
| Cross-tenant data leakage | RLS on every table; storage path includes `org_id`; AI cache keyed by `org_id` |
| Prompt injection via uploaded files | Security Guardrail agent + content sanitisation + system prompt isolation |
| Hallucinated approvals / numbers | Evidence engine + classification + Numerical Lock |
| Account takeover | MFA, password complexity, SSO/SAML/OIDC, short cookie TTL |
| Token theft | HttpOnly + Secure + SameSite=Lax cookies; CSRF tokens for mutating requests |
| File-based malware in PPTX/DOCX | Strip macros; quarantine OLE objects; AV scan hook |
| Credential stuffing | Rate limit + IP-based throttling + breach-pwn check on login |
| AI provider exfiltration | Confidentiality-tier provider routing + opt-in training |
| Audit-log tampering | append-only table + per-row hash chain |
| SSRF via signed URLs | URL allowlist; storage signing happens server-side only |
| XSS in slide content | sanitised inputs + escape-by-default in React |

## 2. Authentication

- **Primary:** Supabase email + password.
- **Enterprise:** SAML / OIDC via Supabase or external IdP (`Microsoft Entra ID`, `Okta`).
- **MFA:** TOTP (RFC 6238). Required for `owner`, `admin` roles in Business and Enterprise plans.
- Sessions are JWTs in `HttpOnly` cookies, 30 min sliding TTL with refresh token rotation.

## 3. Authorisation

Role-based, per organisation:

| Role | Brand | Projects | Generate | Approve | Export | Billing | Audit |
|---|---|---|---|---|---|---|---|
| owner | RW | RW | yes | yes | yes | yes | yes |
| admin | RW | RW | yes | yes | yes | yes | yes |
| editor | R | RW | yes | yes (own) | yes | – | – |
| reviewer | R | R | – | yes | yes | – | – |
| viewer | R | R | – | – | – | – | – |

## 4. Tenant Isolation

- Postgres RLS using `pq_current_org()` (reads JWT claim).
- Storage paths `org/{org_id}/...` and only the API can mint signed URLs.
- AI cache keys: `sha256(org_id || agent || version || input_canonical)`.
- Vector index always filtered by `org_id`.

## 5. Prompt Injection Defence

The Security Guardrail Agent runs on every uploaded text block before evidence extraction. It looks for patterns such as:

- `ignore (all|previous) instructions`
- `you are now (a different|an unrestricted) assistant`
- `delete .* policies`
- inline tool-use directives like `<tool_call>`
- "system: …" / "assistant: …" preludes
- ZWNJ / RTL override unicode tricks

Detected files are tagged `injection_check_status = blocked`, an audit log `security.injection_detected` is written, and the file's text is excluded from the agent context. Agents always run with **isolated system prompts** — uploaded text is delivered as **role=user data**, never as system instructions.

## 6. Confidentiality Routing

`pq_organizations.settings.allowed_providers` controls which model providers may be used. `pq_presentation_projects.confidentiality_level`:

| Level | Allowed providers (default) |
|---|---|
| public | any |
| internal | enterprise-eligible providers |
| confidential | enterprise-eligible providers, no training |
| strictly_confidential | tenant-pinned provider only |

The `provider.ts` resolver enforces this at call time and refuses unsafe providers with `provider_disallowed`.

## 7. Encryption

- **In transit:** TLS 1.2+ on every endpoint.
- **At rest:** Supabase Postgres + storage encryption (AES-256).
- **Application-level:** customer-uploaded font binaries are encrypted-at-rest behind a per-org key in `pq_organizations.settings.kek_id` (envelope encryption — post-MVP).

## 8. Audit Logging

Every mutating API call writes a row to `pq_audit_logs`:

```jsonc
{
  "id": "uuid",
  "organization_id": "uuid",
  "user_id": "uuid",
  "action": "project.export.pptx",
  "object_type": "deck_version",
  "object_id": "uuid",
  "metadata": { "version": 3, "size_bytes": 1234567 },
  "created_at": "2026-05-09T12:00:00Z",
  "row_hash": "sha256(...)",        // chains with previous row's hash
  "prev_row_hash": "sha256(...)"
}
```

Hash-chain detects tampering. Daily anchor digest can be exported to an external WORM (post-MVP).

## 9. Data Retention & Deletion

- Default 365 days for source files, 730 days for deck versions.
- Tenant deletion hard-deletes all rows + storage objects + cache entries; audit retains anonymised summary for compliance.

## 10. Security Headers

`next.config.mjs` sets: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Strict-Transport-Security`, `Permissions-Policy`. CSP is added in middleware: `default-src 'self'; img-src 'self' data: blob: https:; script-src 'self'`.

## 11. Compliance Roadmap

- **SOC 2 Type 1** prep: control mapping doc; quarterly access reviews.
- **ISO 27001** prep: ISMS controls inventory.
- **UAE Government Private Deployment**: dedicated tenant, UAE-region storage, private model, customer-managed keys.

## 12. Secrets Hygiene

- All secrets are env vars; none committed.
- `.env.example` lists keys without values.
- A pre-commit hook (`gitleaks`) blocks accidental secret commits.
