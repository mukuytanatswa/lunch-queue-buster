# Payment integration – South Africa (ZAR)

QuickBite uses **ZAR (R)** everywhere. Common South African payment options and how they’re integrated:

## Currently integrated

### 1. **Payshap (SARB instant EFT / Request-to-Pay)**

- **Location:** `src/lib/payshap.ts`  
- **Checkout:** Cart → Payment method **Payshap** → customer enters ShapID (mobile or alias) → app calls Payshap API (or simulated flow if env not set).  
- **Production:** Set in `.env`:
  - `VITE_PAYSHAP_API_URL` – Payshap API base URL  
  - `VITE_PAYSHAP_API_KEY` – API key  
- **Security:** For live payments, call Payshap from a **Supabase Edge Function** or your backend so the API key is never in the client. The front-end can pass amount (ZAR), reference, and customer ShapID to the Edge Function.

### 2. **Cash on delivery**

- **Checkout:** Payment method **Cash** → order is placed; payment collected when the driver delivers.  
- No gateway; order status and driver flow unchanged.

### 3. **Card (pay on delivery)**

- **Checkout:** Payment method **Card** → order is placed; card can be taken by driver or paid at door.  
- No online gateway in code yet; can be extended (e.g. Yoco device, or link to PayFast card flow).

---

## Adding more SA payment options

### PayFast

- Widely used in SA; supports card, EFT, SnapScan, etc.  
- **Integration:** Use PayFast’s redirect or popup flow: create a payment on your backend (or Edge Function), redirect user to PayFast with amount in **ZAR**, return URL, cancel URL, and notify URL for webhooks.  
- **Backend:** Create payment, verify webhook signature, update `orders.payment_status` and optionally `payshap_reference` or a new `payfast_reference` column.

### SnapScan / Zapper

- QR or in-app; usually integrated via a payment provider (e.g. PayFast, or provider-specific API).  
- Add as a payment method that redirects to the provider or opens their app, then handle success/cancel in your app and webhook in the backend.

### Yoco

- In-person card with Yoco device; driver can take payment at delivery.  
- For online: Yoco has APIs; similar to PayFast, run from Edge Function or backend and pass session/redirect URL to the client.

---

## Recommendation for deployable app

1. **Keep Payshap + Cash** as primary options; ensure Payshap is called from an **Edge Function** in production so the key is server-side.  
2. **Add PayFast** (or one gateway that supports card + EFT) via redirect flow and webhooks so customers can pay online in ZAR.  
3. **Display:** All amounts in UI stay in **R (ZAR)**; gateways receive amount in ZAR.
