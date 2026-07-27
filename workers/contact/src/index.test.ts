import { afterEach, describe, expect, it, vi } from 'vitest';
import worker, { isValidPayload, type Env } from './index';

describe('isValidPayload', () => {
	const valid = { name: 'Jane', email: 'jane@example.com', message: 'Hello', turnstileToken: 'tok' };

	it('accepts a well-formed payload', () => {
		expect(isValidPayload(valid)).toBe(true);
	});

	it.each([
		['non-object body', 'not an object'],
		['null body', null],
		['missing name', { ...valid, name: undefined }],
		['blank name', { ...valid, name: '   ' }],
		['name over 200 chars', { ...valid, name: 'a'.repeat(201) }],
		['missing email', { ...valid, email: undefined }],
		['malformed email', { ...valid, email: 'not-an-email' }],
		['email over 320 chars', { ...valid, email: `${'a'.repeat(316)}@a.co` }],
		['missing message', { ...valid, message: undefined }],
		['blank message', { ...valid, message: '   ' }],
		['message over 5000 chars', { ...valid, message: 'a'.repeat(5001) }],
		['missing turnstileToken', { ...valid, turnstileToken: undefined }],
		['blank turnstileToken', { ...valid, turnstileToken: '' }],
	])('rejects %s', (_label, payload) => {
		expect(isValidPayload(payload)).toBe(false);
	});
});

describe('worker fetch handler', () => {
	const env: Env = {
		TURNSTILE_SECRET_KEY: 'test-secret',
		RESEND_API_KEY: 'test-key',
		CONTACT_TO_EMAIL: 'to@example.com',
		CONTACT_FROM_EMAIL: 'from@example.com',
	};
	const origin = 'https://haykbaroyan.com';
	const validBody = { name: 'Jane', email: 'jane@example.com', message: 'Hello', turnstileToken: 'tok' };

	function request(init: { method?: string; origin?: string | null; body?: unknown; rawBody?: string } = {}) {
		const method = init.method ?? 'POST';
		const headers = new Headers({ 'Content-Type': 'application/json' });
		if (init.origin !== null) headers.set('Origin', init.origin ?? origin);
		const canHaveBody = method !== 'GET' && method !== 'HEAD';
		return new Request('https://haykbaroyan.com/api/contact', {
			method,
			headers,
			body: canHaveBody
				? (init.rawBody ?? (init.body !== undefined ? JSON.stringify(init.body) : JSON.stringify(validBody)))
				: undefined,
		});
	}

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('responds to OPTIONS preflight with 204 and an allowed-origin header', async () => {
		const res = await worker.fetch(request({ method: 'OPTIONS' }), env);
		expect(res.status).toBe(204);
		expect(res.headers.get('Access-Control-Allow-Origin')).toBe(origin);
		expect(res.headers.get('Vary')).toBe('Origin');
	});

	it('rejects non-POST/OPTIONS methods with 405', async () => {
		const res = await worker.fetch(request({ method: 'GET' }), env);
		expect(res.status).toBe(405);
	});

	it('rejects a disallowed origin with 403 before doing any work', async () => {
		const fetchSpy = vi.fn();
		vi.stubGlobal('fetch', fetchSpy);
		const res = await worker.fetch(request({ origin: 'https://evil.example' }), env);
		expect(res.status).toBe(403);
		expect(res.headers.has('Access-Control-Allow-Origin')).toBe(false);
		expect(fetchSpy).not.toHaveBeenCalled();
	});

	it('returns 400 for invalid JSON', async () => {
		const res = await worker.fetch(request({ rawBody: '{not json' }), env);
		expect(res.status).toBe(400);
	});

	it('returns 400 for a well-formed but invalid payload', async () => {
		const res = await worker.fetch(request({ body: { name: '', email: '', message: '', turnstileToken: '' } }), env);
		expect(res.status).toBe(400);
	});

	it('returns 403 when Turnstile verification fails', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: false }), { status: 200 })),
		);
		const res = await worker.fetch(request(), env);
		expect(res.status).toBe(403);
	});

	it('returns 502 when Turnstile succeeds but Resend fails', async () => {
		vi.stubGlobal(
			'fetch',
			vi
				.fn()
				.mockResolvedValueOnce(new Response(JSON.stringify({ success: true }), { status: 200 }))
				.mockResolvedValueOnce(new Response('upstream error', { status: 500 })),
		);
		const res = await worker.fetch(request(), env);
		expect(res.status).toBe(502);
	});

	it('returns 200 when Turnstile and Resend both succeed', async () => {
		vi.stubGlobal(
			'fetch',
			vi
				.fn()
				.mockResolvedValueOnce(new Response(JSON.stringify({ success: true }), { status: 200 }))
				.mockResolvedValueOnce(new Response(JSON.stringify({ id: 'email_123' }), { status: 200 })),
		);
		const res = await worker.fetch(request(), env);
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ success: true });
	});

	it('returns 403 (not a thrown error) when the Turnstile request itself fails', async () => {
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));
		const res = await worker.fetch(request(), env);
		expect(res.status).toBe(403);
		expect(res.headers.get('Access-Control-Allow-Origin')).toBe(origin);
	});
});
