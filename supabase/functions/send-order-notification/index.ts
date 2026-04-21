import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import webpush from 'npm:web-push';

async function sendSms(to: string, message: string) {
  const apiKey = Deno.env.get('AT_API_KEY');
  const username = Deno.env.get('AT_USERNAME');
  if (!apiKey || !username) {
    console.warn('Africa\'s Talking credentials not set — skipping SMS');
    return;
  }
  const body = new URLSearchParams({ username, to, message });
  const res = await fetch('https://api.africastalking.com/version1/messaging', {
    method: 'POST',
    headers: { apiKey, Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  if (!res.ok) {
    console.error('SMS failed:', await res.text());
  }
}

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')!;
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!;
    const vapidSubject = Deno.env.get('VAPID_SUBJECT')!;

    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Supabase database webhook sends { type, table, record, old_record }
    const body = await req.json();
    const order = body.record;
    const oldRecord = body.old_record;
    const eventType = body.type; // 'INSERT' or 'UPDATE'

    if (!order?.id || !order?.vendor_id) {
      return new Response('Missing order data', { status: 400 });
    }

    // For new orders: only notify immediately for cash (card orders notify on payment confirmation)
    if (eventType === 'INSERT' && order.payment_method !== 'cash') {
      return new Response('Skipping — awaiting payment', { status: 200 });
    }

    // For updates: handle payment confirmation and order-ready SMS separately
    if (eventType === 'UPDATE') {
      const isPaymentConfirmation = order.payment_status === 'paid' && oldRecord?.payment_status !== 'paid';
      const isOrderReady = order.status === 'ready' && oldRecord?.status !== 'ready';

      if (isOrderReady && order.customer_phone) {
        await sendSms(order.customer_phone, `Your QuickBite order is ready for pickup! Head to the vendor now.`);
        return new Response('SMS sent', { status: 200 });
      }

      if (!isPaymentConfirmation) {
        return new Response('Skipping — not a payment confirmation', { status: 200 });
      }
    }

    // Get customer name
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', order.customer_id)
      .single();

    // Get item names and quantities
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('quantity, menu_items(name)')
      .eq('order_id', order.id);

    const customerName = profile?.full_name ?? 'A customer';
    const itemSummary = orderItems
      ?.slice(0, 2)
      .map((i: any) => `${i.quantity}x ${i.menu_items?.name}`)
      .join(', ') ?? 'new order';
    const extra = (orderItems?.length ?? 0) > 2 ? ` +${orderItems!.length - 2} more` : '';

    const notificationPayload = JSON.stringify({
      title: 'New order on QuickBite!',
      body: `${customerName}: ${itemSummary}${extra}`,
      data: { vendorId: order.vendor_id, orderId: order.id },
    });

    // Get all push subscriptions for this vendor
    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('id, endpoint, p256dh, auth')
      .eq('vendor_id', order.vendor_id);

    if (!subscriptions || subscriptions.length === 0) {
      return new Response('No subscriptions found', { status: 200 });
    }

    const expiredIds: string[] = [];

    await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            notificationPayload
          );
        } catch (err: any) {
          // 410 Gone / 404 = subscription expired, clean it up
          if (err?.statusCode === 410 || err?.statusCode === 404) {
            expiredIds.push(sub.id);
          } else {
            console.error('Push failed for', sub.endpoint, err?.message);
          }
        }
      })
    );

    if (expiredIds.length > 0) {
      await supabase.from('push_subscriptions').delete().in('id', expiredIds);
    }

    return new Response('OK', { status: 200 });
  } catch (err) {
    console.error('send-order-notification error:', err);
    return new Response('Internal error', { status: 500 });
  }
});
