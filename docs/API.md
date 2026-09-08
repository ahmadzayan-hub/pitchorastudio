# API Specification

All endpoints are JSON. Authenticated routes require either:
- a Supabase session cookie (set after magic-link login), **or**
- `Authorization: Bearer <api_key>` (extension routes only)

The `x-org-id` header selects the active org. If omitted, the user's
`default_org_id` is used.

## Health

### `GET /api/health`
```json
{ "status": "ok", "service": "prompt-orchestrator" }
```

## Organizations

### `GET /api/orgs`
List the orgs the current user belongs to.
```json
{
  "memberships": [
    { "role": "owner", "org": { "id": "...", "name": "...", "slug": "...", "plan": "free" } }
  ]
}
```

### `POST /api/orgs`
```json
{ "name": "Acme", "slug": "acme" }
```

## Templates

### `GET /api/templates`
Returns the org's templates plus all public templates.

### `POST /api/templates`
```json
{
  "name": "Marketing Copy",
  "description": "...",
  "category": "writing",
  "body": { "sections": ["..."], "slots": ["..."] },
  "is_public": false
}
```

### `GET /api/templates/{id}`
### `PATCH /api/templates/{id}`
### `DELETE /api/templates/{id}`

## Sessions

A session represents a single raw-prompt → final-prompt flow.

### `POST /api/sessions`
Create a session. The server detects intent and generates clarification
questions in one call.

Request:
```json
{
  "raw_prompt": "Help me refactor my React data table to be faster",
  "target_model": "chatgpt",        // optional: chatgpt|claude|copilot|generic
  "template_id": "uuid"             // optional
}
```

Response:
```json
{
  "session": {
    "id": "uuid",
    "raw_prompt": "...",
    "intent": "coding",
    "intent_confidence": 0.92,
    "status": "clarifying",
    "target_model": "chatgpt",
    "questions": [
      { "id": "uuid", "position": 0, "question": "...", "rationale": "...", "required": true }
    ]
  }
}
```

### `GET /api/sessions`
List the org's recent sessions (50 max).

### `GET /api/sessions/{id}`
Returns session, questions, prompt versions, and answers.

### `DELETE /api/sessions/{id}`

### `POST /api/sessions/{id}/answers`
Submit clarification answers.
```json
{
  "answers": [
    { "question_id": "uuid", "answer": "..." }
  ]
}
```

### `POST /api/sessions/{id}/finalize`
Reconstruct the prompt and create a new `prompt_versions` row.
```json
{ "target_model": "claude" }   // optional
```

Response:
```json
{
  "version": {
    "id": "uuid",
    "version": 1,
    "target_model": "claude",
    "final_prompt": "<task>...</task>",
    "rationale": "..."
  }
}
```

## Extension API (single-call)

### `POST /api/extension/enhance`
Headers: `Authorization: Bearer <EXTENSION_API_KEY>`

Two modes:

**Direct enhance** (default):
```json
{ "raw_prompt": "...", "target_model": "chatgpt", "qa": [] }
```
returns `{ "intent": {...}, "final_prompt": "...", "rationale": "..." }`

**Ask first**:
```json
{ "raw_prompt": "...", "ask_first": true }
```
returns `{ "intent": {...}, "questions": [{ "slot":"...", "question":"...", "rationale":"...", "required":true }] }`

Then call again with the collected `qa` to receive the final prompt.
