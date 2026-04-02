import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { crypto } from 'https://deno.land/std@0.212.0/crypto/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function md5(text: string): Promise<string> {
  const hash = await crypto.subtle.digest('MD5', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function buildParamString(params: Record<string, string>, passphrase?: string): string {
  const parts = Object.entries(params)
    .filter(([, v]) => v !== '' && v != null)
    .map(([k, v]) => `${k}=${encodeURIComponent(v.trim()).replace(/%20/g, '+')}`)
    .join('&');
  return passphrase
    ? `${parts}&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}`
    : parts;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const merchantId = Deno.env.get('PAYFAST_MERCHANT_ID') ?? '';
    const merchantKey = Deno.env.get('PAYFAST_MERCHANT_KEY') ?? '';
    const passphrase = Deno.env.get('PAYFAST_PASSPHRASE') ?? '';
    const isSandbox = Deno.env.get('PAYFAST_SANDBOX') !== 'false'; // default to sandbox
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const {
      orderId,
      amount,
      customerEmail,
      customerName,
      itemDescription,
      returnUrl,
      cancelUrl,
    } = await req.json();

    if (!orderId || !amount || !customerEmail) {
      return new Response(JSON.stringify({ error: 'orderId, amount and customerEmail are required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify the order exists before creating a PayFast URL
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('id, total_amount, payment_status')
      .eq('id', orderId)
      .single();

    if (orderErr || !order) {
      return new Response(JSON.stringify({ error: 'Order not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (order.payment_status === 'paid') {
      return new Response(JSON.stringify({ error: 'Order already paid' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const notifyUrl = `${supabaseUrl}/functions/v1/payfast-itn`;
    const payfastUrl = isSandbox
      ? 'https://sandbox.payfast.co.za/eng/process'
      : 'https://www.payfast.co.za/eng/process';

    const [firstName, ...rest] = (customerName as string).trim().split(' ');
    const lastName = rest.join(' ') || firstName;

    const params: Record<string, string> = {
      merchant_id: merchantId,
      merchant_key: merchantKey,
      return_url: returnUrl,
      cancel_url: cancelUrl,
      notify_url: notifyUrl,
      name_first: firstName,
      name_last: lastName,
      email_address: customerEmail,
      m_payment_id: orderId,
      amount: Number(amount).toFixed(2),
      item_name: 'QuickBite Order',
      item_description: (itemDescription as string).slice(0, 255),
    };

    const paramString = buildParamString(params, passphrase || undefined);
    const signature = await md5(paramString);

    return new Response(JSON.stringify({ payfast_url: payfastUrl, params: { ...params, signature } }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Internal error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
