import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createHmac } from 'node:crypto';

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const webhookSecret = Deno.env.get('YOCO_WEBHOOK_SECRET') ?? '';
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const rawBody = await req.text();

    // Verify HMAC-SHA256 signature
    const signature = req.headers.get('x-yoco-signature') ?? '';
    if (webhookSecret) {
      const expected = createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
      if (signature !== expected) {
        console.error('Yoco webhook: signature mismatch');
        return new Response('Invalid signature', { status: 400 });
      }
    } else {
      console.warn('Yoco webhook: YOCO_WEBHOOK_SECRET not set, skipping signature check');
    }

    const event = JSON.parse(rawBody);

    // Only handle successful payments
    if (event.type !== 'payment.succeeded') {
      return new Response('OK', { status: 200 });
    }

    const orderId = event?.payload?.metadata?.orderId;
    if (!orderId) {
      console.error('Yoco webhook: no orderId in metadata', event);
      return new Response('Missing orderId', { status: 400 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { error } = await supabase
      .from('orders')
      .update({ payment_status: 'paid', updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (error) {
      console.error('Yoco webhook: DB update failed', error);
      return new Response('DB error', { status: 500 });
    }

    return new Response('OK', { status: 200 });
  } catch (err) {
    console.error('Yoco webhook error:', err);
    return new Response('Internal error', { status: 500 });
  }
});
