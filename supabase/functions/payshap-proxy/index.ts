import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiUrl = Deno.env.get('PAYSHAP_API_URL');
    const apiKey = Deno.env.get('PAYSHAP_API_KEY');

    const body = await req.json();
    const { amount, currency, reference, customerShapId, description } = body;

    if (!amount || !reference) {
      return new Response(JSON.stringify({ success: false, error: 'amount and reference are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // No API credentials configured — fail clearly instead of silently faking success
    if (!apiUrl || !apiKey) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Payshap credentials not configured. Run: supabase secrets set PAYSHAP_API_URL=... PAYSHAP_API_KEY=...',
      }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const res = await fetch(`${apiUrl}/request-pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        amount,
        currency: currency || 'ZAR',
        reference,
        customer_shap_id: customerShapId,
        description,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return new Response(JSON.stringify({ success: false, error: data.message || data.error || res.statusText }), {
        status: res.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      reference: data.reference || reference,
      status: data.status || 'initiated',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err instanceof Error ? err.message : 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
