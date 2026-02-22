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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Copy, Plus, Minus, Users, Share2 } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const GroupOrder = () => {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const placeOrder = usePlaceOrder();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [groupDeliveryAddress, setGroupDeliveryAddress] = useState('');
  const [groupDeliveryInstructions, setGroupDeliveryInstructions] = useState('');

  const { data: groupOrder, isLoading } = useQuery({
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

  // Aggregate items by menu_item_id for single order
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
  const deliveryFee = 15;
  const serviceFee = 10;
  const totalAmount = subtotal + deliveryFee + serviceFee;
  const deliveryAddress = groupDeliveryAddress || groupOrder?.delivery_address || '';
  const canPlaceGroupOrder = groupOrder?.creator_id === user?.id && groupOrder?.status === 'open' && aggregatedItems.length > 0 && deliveryAddress.trim().length > 0;

  const handlePlaceGroupOrder = async () => {
    if (!user || !groupOrder || !canPlaceGroupOrder) return;
    try {
      const pin = generateDeliveryPin();
      const cancellationDeadline = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: user.id,
          vendor_id: groupOrder.vendor_id,
          customer_name: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Group',
          delivery_address: deliveryAddress,
          delivery_instructions: groupDeliveryInstructions || groupOrder.delivery_instructions || null,
          subtotal,
          delivery_fee: deliveryFee,
          total_amount: totalAmount,
          order_number: '',
          status: 'pending',
          payment_status: 'pending',
          payment_method: 'cash',
          delivery_pin: pin,
          cancellation_deadline: cancellationDeadline,
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
      await supabase.from('group_orders').update({ status: 'placed', delivery_address: deliveryAddress, delivery_instructions: groupDeliveryInstructions || groupOrder.delivery_instructions }).eq('id', groupOrder.id);
      queryClient.invalidateQueries({ queryKey: ['group_order', id] });
      toast.success(`Group order placed! Delivery PIN: ${pin}`);
      navigate('/orders');
    } catch (e) {
      toast.error('Failed to place group order');
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

  const totalAmount = groupItems?.reduce((sum, i) => sum + Number((i as any).menu_items?.price || 0) * i.quantity, 0) || 0;

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

                  <div className="border-t pt-3">
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>R{totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  {groupOrder.creator_id === user?.id && groupOrder.status === 'open' && (
                    <>
                      <div className="mt-4 space-y-2">
                        <Input placeholder="Delivery address (required)" value={deliveryAddress} onChange={e => setGroupDeliveryAddress(e.target.value)} />
                        <Input placeholder="Delivery instructions (optional)" value={groupDeliveryInstructions} onChange={e => setGroupDeliveryInstructions(e.target.value)} />
                      </div>
                      <Button className="w-full mt-4" disabled={!canPlaceGroupOrder} onClick={handlePlaceGroupOrder}>
                        Place Group Order (R{totalAmount.toFixed(2)})
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
