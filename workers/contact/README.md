# Contact Worker

A standalone Cloudflare Worker that will eventually back the frontend's
`/api/contact` endpoint: validates a contact-form submission, verifies a
Cloudflare Turnstile token, and sends the message via Resend.

**Not wired up yet.** This Worker is independent of the Angular app in
`app/` — it isn't deployed, and the frontend's `ContactForm` currently
POSTs a payload this Worker will reject. See "Current mismatch" below.

## Request contract

```
POST /api/contact
Content-Type: application/json

{
  "name": string,          // required, 1-200 chars
  "email": string,          // required, valid email, <=320 chars
  "message": string,        // required, 1-5000 chars
  "turnstileToken": string  // required, non-empty
}
```

Responses:

| Status | Meaning |
|---|---|
| 200 | `{ "success": true }` — verified and sent |
| 400 | Invalid JSON body, or a field fails validation |
| 403 | Origin not in the allowlist, or Turnstile verification failed |
| 405 | Method other than `POST`/`OPTIONS` |
| 502 | Turnstile passed but sending via Resend failed |
| 500 | Unhandled error |

CORS: only `https://haykbaroyan.com` and `http://localhost:4200` get an
`Access-Control-Allow-Origin` header; other origins are rejected with 403
before any validation, Turnstile check, or email send happens.

## Current mismatch with the frontend

`app/src/app/shared/contact-form/contact-form.ts` POSTs
`{ name, email, message }` — no `turnstileToken`, and there's no Turnstile
widget rendered (the form shows a placeholder div; no site key exists yet).
Every real submission against this Worker will currently get a `400`.

To wire it up:

1. Get a Turnstile site key + secret key for haykbaroyan.com.
2. Render the real Turnstile widget in `contact-form.html` (replacing the
   placeholder div), capture its token.
3. Add `turnstileToken` to the POST body in `contact-form.ts`.
4. Update `contact-form.spec.ts`'s payload assertion to match.
5. `wrangler secret put TURNSTILE_SECRET_KEY` and `RESEND_API_KEY` (see
   `.dev.vars.example` for local dev), then `npm run deploy`.

## Local dev

```bash
cp .dev.vars.example .dev.vars   # fill in real keys
npm install
npm run dev                       # wrangler dev
```

There's no dev proxy from the Angular app (`ng serve` on `localhost:4200`)
to this Worker yet — `/api/contact` will 404 against the Angular dev server
until one exists (e.g. an `app/proxy.conf.json` pointing at `wrangler dev`'s
local port).

## Testing

```bash
npm test        # vitest — isValidPayload + the fetch handler's status matrix
npm run typecheck
```
