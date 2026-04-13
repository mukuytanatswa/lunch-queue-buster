import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import webpush from 'npm:web-push';

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

    if (!order?.id || !order?.vendor_id) {
      return new Response('Missing order data', { status: 400 });
    }

    // Get customer name
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', order.customer_id)
      .single();

    // Get item count
    const { count: itemCount } = await supabase
      .from('order_items')
      .select('id', { count: 'exact', head: true })
      .eq('order_id', order.id);

    const customerName = profile?.full_name ?? 'A customer';
    const items = itemCount ?? 1;
    const amount = Number(order.total_amount ?? 0).toFixed(2);

    const notificationPayload = JSON.stringify({
      title: 'New order on QuickBite!',
      body: `${customerName} ordered ${items} item${items !== 1 ? 's' : ''} R${amount}`,
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
