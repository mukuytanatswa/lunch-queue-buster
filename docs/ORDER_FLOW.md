# Order flow – How everything connects

This doc explains how student orders reach vendors and drivers so the app stays connected and deployable.

## End-to-end flow

1. **Student (customer)**  
   - Signs up with role **Student**.  
   - Browses **Vendors** (list from `vendors` table).  
   - Chooses a vendor → adds items from that vendor’s menu → **Cart** → Checkout.  
   - Checkout creates an **order** with: `customer_id`, `vendor_id` (the vendor they chose), `delivery_address`, items, total (in **ZAR**), and status `pending`.

2. **Vendor**  
   - Signs up with role **Restaurant/Vendor**.  
   - **Critical:** The vendor’s user account must be **linked** to a row in the `vendors` table (that row’s `user_id` = the vendor user’s id).  
   - If that link exists, **Vendor Dashboard** shows **all orders** where `orders.vendor_id` = that vendor’s id.  
   - So every order a student places for “that restaurant” appears in the vendor’s Orders tab.  
   - Vendor updates status: **Pending → Confirmed → Preparing → Ready for pickup**.  
   - **Realtime:** New student orders appear automatically (Supabase subscription on `orders` for this `vendor_id`).

3. **Driver**  
   - Signs up with role **Delivery Driver**.  
   - A **driver profile** is created (or updated) when they first go **Online** in the Driver Dashboard.  
   - **Available deliveries** = orders with status `ready` or `confirmed` and **no** `driver_id`.  
   - Driver clicks **Accept** → order gets `driver_id` = that driver’s user id.  
   - Driver goes to vendor → marks **Picked up** → goes to customer → enters **Delivery PIN** (shown to customer) → marks **Delivered** (optional proof photo).  
   - Customer sees status updates on **Orders** and **Order tracking** page.

## Why “student orders don’t show on vendor side”

- **Vendor row not linked:** The `vendors` row that students see (e.g. “Pizza Place”) must have `user_id` set to the vendor user who logs in. If `user_id` is null or points to another account, the dashboard uses a different vendor id and won’t show those orders.  
- **Fix:** Ensure every restaurant that should use the dashboard has a `vendors` row with `user_id` = the vendor’s auth user id (e.g. via onboarding or admin).

## Currency

- All amounts are in **South African Rand (ZAR)**.  
- Display uses **R** (e.g. R49.99).  
- Payshap and other payment APIs use currency **ZAR**.

## Data links

| Who        | Sees orders where                         |
|-----------|-------------------------------------------|
| Student   | `customer_id` = my user id                |
| Vendor    | `vendor_id` = my vendor row id            |
| Driver    | Unassigned: `driver_id` is null, status ready/confirmed. Assigned: `driver_id` = my user id |
