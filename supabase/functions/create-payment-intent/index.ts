// supabase/functions/create-payment-intent/index.ts
// Deno edge function — creates a Stripe PaymentIntent and returns the clientSecret.
// Deploy with:
//   supabase functions deploy create-payment-intent
//   supabase secrets set STRIPE_SECRET_KEY=sk_live_...

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const STRIPE_API = 'https://api.stripe.com/v1';

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, content-type',
      },
    });
  }

  try {
    const { amount, currency } = await req.json() as { amount: number; currency: string };

    if (!amount || amount < 50) {
      return new Response(JSON.stringify({ error: 'Invalid amount' }), { status: 400 });
    }

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      return new Response(JSON.stringify({ error: 'Stripe not configured' }), { status: 500 });
    }

    // Create PaymentIntent via Stripe REST API
    const body = new URLSearchParams({
      amount: String(amount),
      currency: currency ?? 'gbp',
      'automatic_payment_methods[enabled]': 'true',
    });

    const stripeRes = await fetch(`${STRIPE_API}/payment_intents`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    const intent = await stripeRes.json() as { client_secret?: string; error?: { message: string } };

    if (!stripeRes.ok || !intent.client_secret) {
      throw new Error(intent.error?.message ?? 'Stripe error');
    }

    return new Response(
      JSON.stringify({ clientSecret: intent.client_secret }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      },
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
});
