import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useMenuItems } from '@/hooks/useVendors';
import { generateDeliveryPin } from '@/lib/delivery';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Copy, Plus, Minus, Users, Share2, CreditCard, Smartphone, CalendarClock } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const SERVICE_FEE = 2;

const GroupOrder = () => {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [pickupTime, setPickupTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'payfast' | 'payshap'>('payfast');
  const [isPlacing, setIsPlacing] = useState(false);

  const { data: groupOrder, isLoading, isError } = useQuery({
    queryKey: ['group_order', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('group_orders')
        .select('*, vendors(name, image_url, cuisine_type)')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: members } = useQuery({
    queryKey: ['group_order_members', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('group_order_members')
        .select('*')
        .eq('group_order_id', id!);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: groupItems } = useQuery({
    queryKey: ['group_order_items', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('group_order_items')
        .select('*, menu_items(name, price, image_url)')
        .eq('group_order_id', id!);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const vendorId = groupOrder?.vendor_id;
  const { data: menuItems } = useMenuItems(vendorId || '');

  // Real-time: refresh items when any member adds or removes something
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`group-order-items:${id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'group_order_items',
        filter: `group_order_id=eq.${id}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['group_order_items', id] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id, queryClient]);

  const inviteLink = groupOrder ? `${window.location.origin}/join/${groupOrder.invite_code}` : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast.success('Invite link copied!');
  };

  const handleAddItem = async (menuItemId: string) => {
    const qty = quantities[menuItemId] || 1;
    try {
      const { error } = await supabase.from('group_order_items').insert({
        group_order_id: id!,
        user_id: user!.id,
        menu_item_id: menuItemId,
        quantity: qty,
      });
      if (error) throw error;
      setQuantities(p => ({ ...p, [menuItemId]: 0 }));
      queryClient.invalidateQueries({ queryKey: ['group_order_items', id] });
      toast.success('Item added to group order!');
    } catch {
      toast.error('Failed to add item');
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    const { error } = await supabase.from('group_order_items').delete().eq('id', itemId);
    if (!error) {
      queryClient.invalidateQueries({ queryKey: ['group_order_items', id] });
      toast.success('Item removed');
    }
  };

  const myItems = groupItems?.filter(i => i.user_id === user?.id) || [];
  const otherItems = groupItems?.filter(i => i.user_id !== user?.id) || [];

  // Aggregate items across all members for checkout
  const aggregatedItems = (groupItems || []).reduce((acc: { menu_item_id: string; name: string; unit_price: number; quantity: number }[], item) => {
    const mid = item.menu_item_id;
    const menuItem = (item as any).menu_items;
    const name = menuItem?.name || 'Item';
    const unitPrice = Number(menuItem?.price || 0);
    if (!mid) return acc;
    const existing = acc.find(x => x.menu_item_id === mid);
    if (existing) existing.quantity += item.quantity;
    else acc.push({ menu_item_id: mid, name, unit_price: unitPrice, quantity: item.quantity });
    return acc;
  }, []);

  const subtotal = aggregatedItems.reduce((s, i) => s + i.unit_price * i.quantity, 0);
  const totalAmount = subtotal + SERVICE_FEE;

  const canPlaceGroupOrder = groupOrder?.creator_id === user?.id
    && groupOrder?.status === 'open'
    && aggregatedItems.length > 0
    && !!pickupTime;

  const handlePlaceGroupOrder = async () => {
    if (!user || !groupOrder || !canPlaceGroupOrder) return;
    const scheduled = new Date(pickupTime);
    const minTime = new Date(Date.now() + 30 * 60 * 1000);
    if (scheduled < minTime) {
      toast.error('Pickup time must be at least 30 minutes from now');
      return;
    }
    setIsPlacing(true);
    try {
      const pin = generateDeliveryPin();
      const cancellationDeadline = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: user.id,
          vendor_id: groupOrder.vendor_id,
          customer_name: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Group',
          delivery_address: null,
          subtotal,
          delivery_fee: 0,
          total_amount: totalAmount,
          order_number: '',
          status: 'pending',
          payment_status: 'pending',
          payment_method: paymentMethod,
          delivery_pin: pin,
          cancellation_deadline: cancellationDeadline,
          scheduled_for: pickupTime,
        })
        .select()
        .single();
      if (orderError) throw orderError;
      const orderItems = aggregatedItems.map(i => ({
        order_id: order.id,
        menu_item_id: i.menu_item_id,
        quantity: i.quantity,
        unit_price: i.unit_price,
        total_price: i.unit_price * i.quantity,
      }));
      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;
      await supabase.from('group_orders').update({ status: 'placed' }).eq('id', groupOrder.id);
      queryClient.invalidateQueries({ queryKey: ['group_order', id] });

      if (paymentMethod === 'payfast') {
        toast.info('Redirecting to PayFast...');
        const customerName = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || user.email || 'Group';
        const itemDescription = aggregatedItems.map(i => `${i.quantity}x ${i.name}`).join(', ');
        const { data: pfData, error: pfError } = await supabase.functions.invoke('create-payfast-payment', {
          body: {
            orderId: order.id,
            amount: totalAmount,
            customerEmail: user.email,
            customerName,
            itemDescription: itemDescription.slice(0, 255),
            returnUrl: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/payfast-return`,
            cancelUrl: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/payfast-return?cancelled=1`,
          },
        });
        if (pfError || !pfData?.payfast_url) {
          let detail: string = pfData?.error ?? 'PayFast setup failed';
          if (pfError?.context) {
            try { detail = (await (pfError.context as Response).json()).error ?? detail; } catch { /* ignore */ }
          }
          toast.error(detail);
          navigate('/orders');
          return;
        }
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = pfData.payfast_url;
        for (const [key, value] of Object.entries(pfData.params as Record<string, string>)) {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value;
          form.appendChild(input);
        }
        document.body.appendChild(form);
        form.submit();
        return;
      }

      toast.success('Group order placed!');
      navigate('/orders');
    } catch {
      toast.error('Failed to place group order');
    } finally {
      setIsPlacing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </main>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Unable to Load Group Order</h2>
            <p className="text-muted-foreground mb-4">There was a problem loading this group order. It may have expired or you may not have access.</p>
            <Button asChild><Link to="/">Go Home</Link></Button>
          </div>
        </main>
      </div>
    );
  }

  if (!groupOrder) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Group Order Not Found</h2>
            <Button asChild><Link to="/">Go Home</Link></Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{groupOrder.name}</h1>
              <Badge>{groupOrder.status}</Badge>
            </div>
            <p className="text-muted-foreground">
              {(groupOrder as any).vendors?.name} • {members?.length || 0} members
            </p>
          </div>

          {/* Invite Link */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Share2 className="h-5 w-5 text-primary" />
                <span className="font-medium">Share with friends:</span>
                <Input value={inviteLink} readOnly className="flex-1" />
                <Button variant="outline" onClick={handleCopyLink}><Copy className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Menu */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold mb-4">Add Items</h2>
              <div className="space-y-3">
                {menuItems?.map(item => {
                  const qty = quantities[item.id] || 0;
                  return (
                    <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg bg-card">
                      <img src={item.image_url || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100'} alt={item.name} className="h-16 w-16 rounded-md object-cover" />
                      <div className="flex-grow">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">R{Number(item.price).toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {qty > 0 && (
                          <>
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setQuantities(p => ({ ...p, [item.id]: Math.max(0, qty - 1) }))}>
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-6 text-center">{qty}</span>
                          </>
                        )}
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setQuantities(p => ({ ...p, [item.id]: (p[item.id] || 0) + 1 }))}>
                          <Plus className="h-4 w-4" />
                        </Button>
                        {qty > 0 && (
                          <Button size="sm" onClick={() => handleAddItem(item.id)}>Add</Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />Group Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {myItems.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Your Items</h4>
                      {myItems.map(item => (
                        <div key={item.id} className="flex justify-between items-center py-1 text-sm">
                          <span>{item.quantity}x {(item as any).menu_items?.name}</span>
                          <div className="flex items-center gap-2">
                            <span>R{(Number((item as any).menu_items?.price || 0) * item.quantity).toFixed(2)}</span>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive" onClick={() => handleRemoveItem(item.id)}>×</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {otherItems.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Others' Items</h4>
                      {otherItems.map(item => (
                        <div key={item.id} className="flex justify-between py-1 text-sm text-muted-foreground">
                          <span>{item.quantity}x {(item as any).menu_items?.name}</span>
                          <span>R{(Number((item as any).menu_items?.price || 0) * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="border-t pt-3 space-y-1 text-sm">
                    <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>R{subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between text-muted-foreground"><span>Service fee</span><span>R{SERVICE_FEE.toFixed(2)}</span></div>
                    <div className="flex justify-between font-semibold pt-1 border-t">
                      <span>Total</span>
                      <span>R{totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  {groupOrder.creator_id === user?.id && groupOrder.status === 'open' && (
                    <>
                      {/* Pickup time */}
                      <div className="mt-4 space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <CalendarClock className="h-4 w-4 text-amber-700" />
                          Pickup time <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          type="datetime-local"
                          value={pickupTime}
                          onChange={e => setPickupTime(e.target.value)}
                          min={new Date(Date.now() + 30 * 60 * 1000).toISOString().slice(0, 16)}
                          className="bg-white"
                        />
                        <p className="text-xs text-amber-700">Min 30 minutes from now. Everyone collects at the vendor.</p>
                      </div>

                      {/* Payment method */}
                      <div className="mt-4 space-y-2">
                        <Label className="text-sm font-medium">Payment method</Label>
                        <RadioGroup value={paymentMethod} onValueChange={(v: 'payfast' | 'payshap') => setPaymentMethod(v)} className="flex flex-col gap-2">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="payfast" id="group-payfast" />
                            <Label htmlFor="group-payfast" className="flex items-center gap-2 font-normal cursor-pointer"><CreditCard className="h-4 w-4 text-[#1a84c0]" />PayFast (card / EFT / SnapScan)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="payshap" id="group-payshap" />
                            <Label htmlFor="group-payshap" className="flex items-center gap-2 font-normal cursor-pointer"><Smartphone className="h-4 w-4" />Payshap (instant EFT)</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <Button className="w-full mt-4" disabled={!canPlaceGroupOrder || isPlacing} onClick={handlePlaceGroupOrder}>
                        {isPlacing ? 'Placing...' : `Place Group Order (R${totalAmount.toFixed(2)})`}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GroupOrder;
