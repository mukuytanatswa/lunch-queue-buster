import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const {
      email, firstName, lastName,
      shopName, cuisineType, location, description,
      deliveryFee, deliveryTimeMin, deliveryTimeMax, minimumOrder,
    } = await req.json();

    console.log('invite-vendor called for:', email);

    if (!email || !firstName || !lastName || !shopName || !cuisineType || !location) {
      return new Response(
        JSON.stringify({ error: 'email, firstName, lastName, shopName, cuisineType and location are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Invite the user — Supabase sends them a setup email
    const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: { first_name: firstName, last_name: lastName },
    });

    if (inviteError) {
      console.error('inviteUserByEmail error:', inviteError.message);
      return new Response(JSON.stringify({ error: inviteError.message }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = inviteData.user.id;

    // Set their profile role to vendor
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        user_id: userId,
        role: 'vendor',
        first_name: firstName,
        last_name: lastName,
        onboarding_completed: true,
      }, { onConflict: 'user_id' });

    if (profileError) {
      console.error('profile upsert error:', profileError.message);
      return new Response(JSON.stringify({ error: profileError.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create the vendors table row so the vendor dashboard works immediately
    const { error: vendorError } = await supabase
      .from('vendors')
      .insert({
        user_id: userId,
        name: shopName,
        cuisine_type: cuisineType,
        location,
        description: description ?? null,
        email,
        delivery_fee: deliveryFee ?? 0,
        delivery_time_min: deliveryTimeMin ?? 15,
        delivery_time_max: deliveryTimeMax ?? 30,
        minimum_order: minimumOrder ?? 0,
        is_active: true,
      });

    if (vendorError) {
      console.error('vendor insert error:', vendorError.message);
      return new Response(JSON.stringify({ error: `Vendor profile created but shop record failed: ${vendorError.message}` }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Internal error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
