// supabase/functions/issue-gift-card/index.ts
// Called after a successful Stripe gift card payment.
// Generates a unique NUR-XXXX-XXXX code, inserts a gift_cards row, returns the code.
// Deploy with: supabase functions deploy issue-gift-card

// @ts-types="https://esm.sh/@supabase/supabase-js@2/dist/module/index.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generates a random uppercase alphanumeric string of given length
function randomSegment(len: number): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // omit O, 0, I, 1 to avoid confusion
  let result = '';
  const array = new Uint8Array(len);
  crypto.getRandomValues(array);
  for (const byte of array) {
    result += chars[byte % chars.length];
  }
  return result;
}

function generateCode(): string {
  return `NUR-${randomSegment(4)}-${randomSegment(4)}`;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const json = (body: object, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  try {
    // ── 1. Auth ───────────────────────────────────────────────────────────────
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return json({ error: 'Unauthorized' }, 401);
    }

    const supabaseUrl     = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceRoleKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Verify user identity using the anon client + user's JWT
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) return json({ error: 'Unauthorized' }, 401);

    // ── 2. Validate input ─────────────────────────────────────────────────────
    const body = await req.json() as { tier?: unknown; amount?: unknown };

    const validTiers = ['classic', 'premium', 'deluxe'] as const;
    type Tier = typeof validTiers[number];

    if (!validTiers.includes(body.tier as Tier)) {
      return json({ error: 'Invalid tier' }, 400);
    }

    const tier   = body.tier as Tier;
    const amount = body.amount;

    if (typeof amount !== 'number' || amount < 1 || amount > 100_000) {
      return json({ error: 'Invalid amount' }, 400);
    }

    // ── 3. Generate unique code (retry up to 5 times for collisions) ──────────
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    let code = '';
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = generateCode();
      const { data: existing } = await adminClient
        .from('gift_cards')
        .select('id')
        .eq('code', candidate)
        .maybeSingle();

      if (!existing) {
        code = candidate;
        break;
      }
    }

    if (!code) {
      return json({ error: 'Could not generate unique code. Please try again.' }, 500);
    }

    // ── 4. Insert gift card row ───────────────────────────────────────────────
    const { error: insertError } = await adminClient
      .from('gift_cards')
      .insert({
        code,
        value:        amount,   // stored in pence
        tier,
        purchased_by: user.id,
        redeemed_by:  null,
        created_at:   new Date().toISOString(),
        expires_at:   null,     // Nur Café gift cards never expire per FAQ
      });

    if (insertError) {
      console.error('Insert error:', insertError);
      return json({ error: 'Failed to issue gift card. Please contact support.' }, 500);
    }

    // ── 5. Return code to app ─────────────────────────────────────────────────
    return json({ code, tier, value: amount });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return json({ error: message }, 500);
  }
});
