
export interface Env {
	TURNSTILE_SECRET_KEY: string;
	RESEND_API_KEY: string;
	CONTACT_TO_EMAIL: string;
	CONTACT_FROM_EMAIL: string;
}

export interface ContactPayload {
	name: string;
	email: string;
	message: string;
	turnstileToken: string;
}

const ALLOWED_ORIGINS = new Set(['https://haykbaroyan.com', 'http://localhost:4200']);

function corsHeaders(origin: string | null): HeadersInit {
	const headers: HeadersInit = {
		'Access-Control-Allow-Methods': 'POST, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type',
		Vary: 'Origin',
	};
	if (origin && ALLOWED_ORIGINS.has(origin)) {
		headers['Access-Control-Allow-Origin'] = origin;
	}
	return headers;
}

function jsonResponse(body: unknown, status: number, origin: string | null): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: {
			'Content-Type': 'application/json',
			...corsHeaders(origin),
		},
	});
}

export function isValidPayload(data: unknown): data is ContactPayload {
	if (typeof data !== 'object' || data === null) return false;
	const d = data as Record<string, unknown>;
	return (
		typeof d.name === 'string' &&
		d.name.trim().length > 0 &&
		d.name.length <= 200 &&
		typeof d.email === 'string' &&
		d.email.length <= 320 &&
		/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email) &&
		typeof d.message === 'string' &&
		d.message.trim().length > 0 &&
		d.message.length <= 5000 &&
		typeof d.turnstileToken === 'string' &&
		d.turnstileToken.length > 0
	);
}

async function verifyTurnstile(token: string, secret: string, remoteIp: string | null): Promise<boolean> {
	try {
		const formData = new FormData();
		formData.append('secret', secret);
		formData.append('response', token);
		if (remoteIp) formData.append('remoteip', remoteIp);

		const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
			method: 'POST',
			body: formData,
		});

		if (!res.ok) {
			console.error('Turnstile siteverify HTTP error:', res.status);
			return false;
		}
		const outcome = (await res.json()) as { success?: boolean; 'error-codes'?: string[] };
		if (outcome.success !== true) {
			console.error('Turnstile verification rejected:', outcome['error-codes']);
		}
		return outcome.success === true;
	} catch (err) {
		console.error('Turnstile verification request failed:', err);
		return false;
	}
}

async function sendViaResend(payload: ContactPayload, env: Env): Promise<boolean> {
	// Strip line breaks so the message body can't inject extra headers via the Subject line.
	const safeName = payload.name.replace(/[\r\n]/g, ' ');

	try {
		const res = await fetch('https://api.resend.com/emails', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${env.RESEND_API_KEY}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				from: env.CONTACT_FROM_EMAIL,
				to: env.CONTACT_TO_EMAIL,
				reply_to: payload.email,
				subject: `New contact form message from ${safeName}`,
				text: `From: ${safeName} <${payload.email}>\n\n${payload.message}`,
			}),
		});

		if (!res.ok) {
			console.error('Resend API error:', res.status);
			return false;
		}
		return true;
	} catch (err) {
		console.error('Resend request failed:', err);
		return false;
	}
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const origin = request.headers.get('Origin');

		try {
			if (request.method === 'OPTIONS') {
				return new Response(null, { status: 204, headers: corsHeaders(origin) });
			}

			if (request.method !== 'POST') {
				return jsonResponse({ error: 'Method not allowed' }, 405, origin);
			}

			if (origin && !ALLOWED_ORIGINS.has(origin)) {
				return jsonResponse({ error: 'Origin not allowed' }, 403, origin);
			}

			let body: unknown;
			try {
				body = await request.json();
			} catch {
				return jsonResponse({ error: 'Invalid JSON body' }, 400, origin);
			}

			if (!isValidPayload(body)) {
				return jsonResponse({ error: 'Missing or invalid fields' }, 400, origin);
			}

			const remoteIp = request.headers.get('CF-Connecting-IP');
			const humanVerified = await verifyTurnstile(body.turnstileToken, env.TURNSTILE_SECRET_KEY, remoteIp);
			if (!humanVerified) {
				return jsonResponse({ error: 'Verification failed' }, 403, origin);
			}

			const sent = await sendViaResend(body, env);
			if (!sent) {
				return jsonResponse({ error: 'Failed to send message' }, 502, origin);
			}

			return jsonResponse({ success: true }, 200, origin);
		} catch (err) {
			console.error('Unhandled error in contact worker:', err);
			return jsonResponse({ error: 'Internal error' }, 500, origin);
		}
	},
};
