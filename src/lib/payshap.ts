/**
 * Payshap / Fast One API integration for instant payments (South Africa).
 * Payments are proxied through a Supabase Edge Function so the API key is
 * never exposed to the browser. Set PAYSHAP_API_URL and PAYSHAP_API_KEY as
 * Supabase secrets (supabase secrets set PAYSHAP_API_KEY=...).
 */

export type PayshapPaymentRequest = {
  amount: number;
  currency: string;
  reference: string;
  customerShapId?: string;
  description?: string;
};

export type PayshapPaymentResult =
  | { success: true; reference: string; status: string }
  | { success: false; error: string };

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * Request payment via Payshap. Calls the payshap-proxy Edge Function which
 * holds the API key securely server-side.
 */
export async function requestPayshapPayment(
  request: PayshapPaymentRequest
): Promise<PayshapPaymentResult> {
  if (!SUPABASE_URL) {
    return { success: false, error: 'Supabase URL not configured' };
  }
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/payshap-proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        amount: request.amount,
        currency: request.currency || 'ZAR',
        reference: request.reference,
        customerShapId: request.customerShapId,
        description: request.description,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || res.statusText };
    }
    return {
      success: true,
      reference: data.reference || request.reference,
      status: data.status || 'initiated',
    };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Payment request failed' };
  }
}
