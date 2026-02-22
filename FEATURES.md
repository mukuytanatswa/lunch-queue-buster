# QuickBite – Implemented Features

This document summarizes the functional features added to the app. Run the Supabase migration and configure env where noted.

## Setup

1. **Run Supabase migration**  
   Apply `supabase/migrations/20260222000000_feature_orders_drivers_promotions.sql` in your Supabase project (SQL Editor or `supabase db push`). This adds:
   - `pickup_points`, `promotions`, `vendor_payouts`
   - New columns on `orders`: `delivery_pin`, `proof_of_delivery_photo_url`, `scheduled_for`, `cancellation_deadline`, `pickup_point_id`, `delivery_batch_id`, `payshap_reference`

2. **Payshap (optional)**  
   For live Payshap payments set in `.env`:
   - `VITE_PAYSHAP_API_URL` – your Payshap API base URL  
   - `VITE_PAYSHAP_API_KEY` – your API key  
   Without these, Payshap is simulated (order still completes).

---

## Feature List

| Feature | Where it works |
|--------|-----------------|
| **Vendor order tracking** | Vendor Dashboard → Orders tab: real orders, status steps (Confirm → Preparing → Ready → Picked up). |
| **Driver assignment** | Drivers go online in Driver Dashboard; “Available Deliveries” shows orders with status `ready`/`confirmed` and no driver; “Accept Delivery” assigns the driver to the order. |
| **Payshap & card** | Cart → Checkout: choose Cash, Card (pay on delivery), or Payshap; Payshap asks for ShapID and calls the payment API. |
| **Group cart** | Start/join group order from vendor; add items; creator sets delivery address and clicks “Place Group Order” to create one order for the group. |
| **Live order status** | Orders page subscribes to Supabase realtime for `orders`; status updates (e.g. from vendor/driver) refresh the list. Order tracking page shows step-by-step progress. |
| **GPS map tracking** | Order Tracking page: “View courier on map” when driver has shared location. Driver Dashboard: “Share my location” sends current position to `driver_profiles.current_location`. |
| **Push notifications** | Realtime order updates refresh the Orders list; for native push, add `@capacitor/push-notifications` and your backend to send FCM/APNs. |
| **Reorder** | Orders page: “Reorder” adds that order’s items to the cart and navigates to the vendor. |
| **Order cancellation window** | “Cancel order” is shown only when status is pending/confirmed and before `cancellation_deadline` (e.g. 10 minutes after place order). |
| **Driver assignment system** | Online drivers see unassigned ready/confirmed orders; accepting assigns by proximity/availability (first-come from list). |
| **Route / contact driver** | Order Tracking: “Open in Maps” for delivery address; “Call driver” when a driver is assigned (uses driver phone from profiles). Driver Dashboard: Navigate, Call Customer. |
| **Proof of delivery** | Driver completes delivery: enter customer’s delivery PIN (optional validation); optional proof photo URL; order marked delivered. |
| **Delivery PIN** | Generated at place order; shown to customer (Orders + Order Tracking) and to driver in active delivery; used to confirm handoff. |
| **Batch delivery** | Schema supports `delivery_batch_id` on orders; batch UI for multiple stops can be added on top of this. |
| **Promotion creation** | Vendor Dashboard → Promotions: create discounts (code, type, value, valid until). Apply at checkout via promotion code (hook `usePromotionByCode` ready). |
| **Payout system** | `vendor_payouts` table; Vendor Dashboard → Settings shows payout list. Automatic transfers can be implemented with a cron or Edge Function that creates payouts from completed orders. |
| **Dynamic pricing** | Delivery fee is increased by 25% between 11:30 and 14:00 (see `src/lib/delivery.ts`). |
| **Pre-order** | Checkout: optional “Pre-order: schedule for” datetime; stored in `orders.scheduled_for`; vendor sees it in order details. |
| **Shared pickup points** | `pickup_points` table; checkout shows optional “Shared pickup point” dropdown to reduce delivery cost (logic can apply a discount when selected). |

---

## Key files

- **Orders / placement**: `src/hooks/useOrders.ts`, `src/pages/Cart.tsx`, `src/pages/Orders.tsx`
- **Vendor**: `src/hooks/useVendorOrders.ts`, `src/hooks/useVendorByUser.ts`, `src/pages/VendorDashboard.tsx`
- **Driver**: `src/hooks/useDrivers.ts`, `src/pages/DriverDashboard.tsx`
- **Tracking**: `src/pages/OrderTracking.tsx`
- **Group order**: `src/pages/GroupOrder.tsx`
- **Delivery / pricing**: `src/lib/delivery.ts`, `src/lib/payshap.ts`
- **Promotions / payouts**: `src/hooks/usePromotions.ts`, `src/hooks/useVendorPayouts.ts`, `src/hooks/usePickupPoints.ts`
