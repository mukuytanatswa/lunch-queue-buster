import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createHash } from 'node:crypto';

function md5(text: string): string {
  return createHash('md5').update(text).digest('hex');
}


serve(async (req) => {
  // PayFast sends a POST with URL-encoded form data
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const merchantId = Deno.env.get('PAYFAST_MERCHANT_ID') ?? '';
    const passphrase = Deno.env.get('PAYFAST_PASSPHRASE') ?? '';
    const isSandbox = Deno.env.get('PAYFAST_SANDBOX') === 'true';
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const body = await req.text();

    // Parse decoded values for logic — but keep raw pairs for signature verification
    const params = Object.fromEntries(new URLSearchParams(body));
    const { merchant_id, m_payment_id, payment_status, signature } = params;

    // 1. Verify merchant ID matches
    if (merchant_id !== merchantId) {
      console.error('ITN: merchant_id mismatch');
      return new Response('Invalid merchant', { status: 400 });
    }

    // 2. Verify MD5 signature — use raw body to avoid re-encoding differences
    const rawPairs = body.split('&').filter(p => p !== '' && !p.startsWith('signature='));
    let paramString = rawPairs.join('&');
    if (passphrase) {
      paramString += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}`;
    }
    const expectedSignature = md5(paramString);

    if (signature !== expectedSignature) {
      console.error('ITN: signature mismatch', { received: signature, expected: expectedSignature });
      return new Response('Invalid signature', { status: 400 });
    }

    // 3. Optionally validate with PayFast server
    const validationHost = isSandbox
      ? 'https://sandbox.payfast.co.za/eng/query/validate'
      : 'https://www.payfast.co.za/eng/query/validate';

    const validationRes = await fetch(validationHost, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    const validationText = await validationRes.text();
    if (!validationText.includes('VALID')) {
      console.error('ITN: PayFast validation failed', validationText);
      return new Response('Validation failed', { status: 400 });
    }

    // 4. Update order payment status
    if (payment_status === 'COMPLETE' && m_payment_id) {
      const supabase = createClient(supabaseUrl, serviceRoleKey);
      const { error } = await supabase
        .from('orders')
        .update({ payment_status: 'paid', updated_at: new Date().toISOString() })
        .eq('id', m_payment_id);

      if (error) {
        console.error('ITN: DB update failed', error);
        return new Response('DB error', { status: 500 });
      }
    }

    return new Response('OK', { status: 200 });
  } catch (err) {
    console.error('ITN error:', err);
    return new Response('Internal error', { status: 500 });
  }
});
