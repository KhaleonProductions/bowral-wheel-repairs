import { NextResponse } from 'next/server';
import { z } from 'zod';

const Submission = z.object({
  name: z.string().min(1).max(120),
  phone: z.string().min(6).max(40),
  email: z.email().max(160),
  vehicle: z.string().max(160).optional().default(''),
  wheelSize: z.string().max(60).optional().default(''),
  damageType: z.string().max(80).optional().default(''),
  message: z.string().min(1).max(4000),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }

  const parsed = Submission.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'Please check the form and try again.' },
      { status: 422 },
    );
  }

  const tenantId = process.env.BB_TENANT_ID;
  const secret = process.env.BB_WEBHOOK_SECRET;
  const url = process.env.BB_WEBHOOK_URL;

  // Until the site is registered on the platform these are unset. Accept the
  // submission and log it rather than failing: the form must work from day one
  // and gain CRM integration later without a code change.
  if (!tenantId || !secret || !url) {
    console.info('[contact] platform webhook not configured; accepted in fallback mode', {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
    });
    return NextResponse.json({ ok: true, mode: 'fallback' });
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-bb-tenant-id': tenantId,
        'x-bb-webhook-secret': secret,
      },
      body: JSON.stringify({
        source: 'bowral-wheel-repairs',
        submittedAt: new Date().toISOString(),
        ...parsed.data,
      }),
    });

    if (!res.ok) {
      console.error('[contact] webhook rejected', res.status);
      return NextResponse.json(
        { ok: false, error: 'We could not send that. Please call us instead.' },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, mode: 'webhook' });
  } catch (err) {
    console.error('[contact] webhook error', err);
    return NextResponse.json(
      { ok: false, error: 'We could not send that. Please call us instead.' },
      { status: 502 },
    );
  }
}
