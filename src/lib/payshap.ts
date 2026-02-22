/**
 * Payshap / Fast One API integration for instant payments (South Africa).
 * Configure VITE_PAYSHAP_API_URL and VITE_PAYSHAP_API_KEY in .env for production.
 * This module provides the request structure; actual API calls require backend or Edge Function for secrets.
 */

export type PayshapPaymentRequest = {
  amount: number;
  currency: string;
  reference: string;
  customerShapId?: string; // Mobile or alias
  description?: string;
};

export type PayshapPaymentResult =
  | { success: true; reference: string; status: string }
  | { success: false; error: string };

const PAYSHAP_API_URL = import.meta.env.VITE_PAYSHAP_API_URL || '';
const PAYSHAP_API_KEY = import.meta.env.VITE_PAYSHAP_API_KEY || '';

/**
 * Request payment via Payshap (Request-to-Pay).
 * In production, call your backend or Supabase Edge Function that holds the API key
 * and uses Payshap's API. Here we simulate success for cash/flow testing.
 */
export async function requestPayshapPayment(
  request: PayshapPaymentRequest
): Promise<PayshapPaymentResult> {
  if (!PAYSHAP_API_URL || !PAYSHAP_API_KEY) {
    // Dev: accept without real API call
    return {
      success: true,
      reference: `PAYSHAP-${Date.now()}-${request.reference}`,
      status: 'initiated',
    };
  }
  try {
    const res = await fetch(`${PAYSHAP_API_URL}/request-pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PAYSHAP_API_KEY}`,
      },
      body: JSON.stringify({
        amount: request.amount,
        currency: request.currency || 'ZAR',
        reference: request.reference,
        customer_shap_id: request.customerShapId,
        description: request.description,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: (data.message || data.error) || res.statusText };
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
