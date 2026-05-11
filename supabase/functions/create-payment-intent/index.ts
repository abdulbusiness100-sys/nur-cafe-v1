// supabase/functions/create-payment-intent/index.ts
// Deno edge function — creates a Stripe PaymentIntent and returns the clientSecret.
// Deploy with:
//   supabase functions deploy create-payment-intent
//   supabase secrets set STRIPE_SECRET_KEY=sk_live_...

// @ts-types="https://esm.sh/@supabase/supabase-js@2/dist/module/index.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const STRIPE_API = 'https://api.stripe.com/v1';
const MIN_AMOUNT = 50;       // £0.50 minimum
const MAX_AMOUNT = 100_000;  // £1,000 maximum per transaction

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ── 1. Verify caller is an authenticated Supabase user ────────────────────
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized — missing auth token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(
        JSON.stringify({ error: 'Server misconfiguration' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized — invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // ── 2. Validate input ─────────────────────────────────────────────────────
    const body = await req.json() as { amount?: unknown; currency?: unknown; type?: string; tier?: string };

    const amount = body.amount;
    const currency = body.currency;

    if (typeof amount !== 'number' || !Number.isInteger(amount) || amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
      return new Response(
        JSON.stringify({ error: `Invalid amount — must be an integer between ${MIN_AMOUNT} and ${MAX_AMOUNT} pence` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    if (currency !== 'gbp') {
      return new Response(
        JSON.stringify({ error: 'Invalid currency — only gbp is accepted' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // ── 3. Create Stripe PaymentIntent ────────────────────────────────────────
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      return new Response(
        JSON.stringify({ error: 'Stripe not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const stripeBody = new URLSearchParams({
      amount: String(amount),
      currency,
      'automatic_payment_methods[enabled]': 'true',
      // Tag with user id for audit trail in Stripe dashboard
      'metadata[user_id]': user.id,
      ...(body.type ? { 'metadata[type]': body.type } : {}),
      ...(body.tier ? { 'metadata[tier]': body.tier } : {}),
    });

    const stripeRes = await fetch(`${STRIPE_API}/payment_intents`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: stripeBody.toString(),
    });

    const intent = await stripeRes.json() as { client_secret?: string; error?: { message: string } };

    if (!stripeRes.ok || !intent.client_secret) {
      throw new Error(intent.error?.message ?? 'Stripe error');
    }

    return new Response(
      JSON.stringify({ clientSecret: intent.client_secret }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
