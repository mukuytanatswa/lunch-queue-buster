import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2, Plus, Minus, AlertCircle, CheckCircle, CreditCard, Tag, X, CalendarClock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { usePlaceOrder } from '@/hooks/useOrders';
import { usePromotionByCode } from '@/hooks/usePromotions';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { GuestCheckoutModal, GuestInfo } from '@/components/GuestCheckoutModal';

const Cart = () => {
  const { items, updateQuantity, removeItem, clearCart, subtotal, serviceFee, totalItems } = useCart();
  const vendorId = items[0]?.vendorId;

  const { user, profile } = useAuth();
  const placeOrder = usePlaceOrder();
  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false);
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [guestInfo, setGuestInfo] = useState<GuestInfo | null>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentMethod] = useState<'payfast'>('payfast');
  const [pickupTime, setPickupTime] = useState('');
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null);
  const { data: promotion, isFetching: promoLoading } = usePromotionByCode(vendorId, appliedPromoCode);

  const discount = (() => {
    if (!promotion) return 0;
    const meetsMinimum = !promotion.min_order_amount || subtotal >= Number(promotion.min_order_amount);
    if (!meetsMinimum) return 0;
    if (promotion.type === 'percentage') return Math.round(subtotal * (Number(promotion.value) / 100) * 100) / 100;
    return Math.min(Number(promotion.value), subtotal);
  })();

  const total = items.length > 0 ? Math.max(0, subtotal + serviceFee - discount) : 0;

  const redirectToPayFast = async (orderId: string) => {
    const customerName = `${profile?.first_name || guestInfo?.firstName || ''} ${profile?.last_name || guestInfo?.lastName || ''}`.trim() || user?.email || 'Customer';
    const customerEmail = user?.email || '';
    const itemDescription = items.map(i => `${i.quantity}x ${i.name}`).join(', ');

    const { data, error } = await supabase.functions.invoke('create-payfast-payment', {
      body: {
        orderId,
        amount: total,
        customerEmail,
        customerName,
        itemDescription: itemDescription.slice(0, 255),
        returnUrl: `${window.location.origin}/orders?payfast=1`,
        cancelUrl: `${window.location.origin}/cart`,
      },
    });

    if (error || !data?.payfast_url) {
      let detail = data?.error ?? 'PayFast setup failed';
      if (error) {
        try {
          const ctx = (error as any).context;
          if (ctx instanceof Response) {
            const body = await ctx.json();
            detail = body?.error || body?.message || (error as any).message || detail;
          } else {
            detail = (error as any).message || detail;
          }
        } catch {
          detail = (error as any).message || detail;
        }
      }
      throw new Error(detail);
    }

    // Clear cart and close dialog only now — just before navigating away to PayFast
    clearCart();
    setIsCheckoutDialogOpen(false);

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = data.payfast_url;
    for (const [key, value] of Object.entries(data.params as Record<string, string>)) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    }
    document.body.appendChild(form);
    form.submit();
  };

  const redirectToYoco = async (orderId: string) => {
    const { data, error } = await supabase.functions.invoke('create-yoco-payment', {
      body: {
        orderId,
        amount: total,
        successUrl: `${window.location.origin}/orders?yoco=1`,
        cancelUrl: `${window.location.origin}/cart`,
      },
    });

    if (error || !data?.checkout_url) {
      let detail = data?.error ?? 'Yoco setup failed';
      if (error) {
        try {
          const ctx = (error as any).context;
          if (ctx instanceof Response) {
            const body = await ctx.json();
            detail = body?.error || body?.message || (error as any).message || detail;
          } else {
            detail = (error as any).message || detail;
          }
        } catch {
          detail = (error as any).message || detail;
        }
      }
      throw new Error(detail);
    }

    clearCart();
    setIsCheckoutDialogOpen(false);
    window.location.href = data.checkout_url;
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      setIsCheckoutDialogOpen(false);
      setIsGuestModalOpen(true);
      return;
    }
    if (!pickupTime) {
      toast.error('Please select a pickup time');
      return;
    }
    const scheduled = new Date(pickupTime);
    const minTime = new Date(Date.now() + 10 * 60 * 1000);
    if (scheduled < minTime) {
      toast.error('Pickup time must be at least 10 minutes from now');
      return;
    }

    const orderPayload = {
      vendorId,
      items: items.map(i => ({
        menuItemId: i.menuItemId,
        name: i.name,
        quantity: i.quantity,
        unitPrice: i.price,
      })),
      customerName: `${profile?.first_name || guestInfo?.firstName || ''} ${profile?.last_name || guestInfo?.lastName || ''}`.trim() || user.email || 'Customer',
      subtotal,
      totalAmount: total,
      scheduledFor: pickupTime,
      promotionCode: appliedPromoCode || undefined,
    };

    if (paymentMethod === 'payfast') {
      try {
        const order = await placeOrder.mutateAsync({ ...orderPayload, paymentMethod: 'payfast' });
        toast.info('Redirecting to PayFast...');
        await redirectToPayFast(order.id);
      } catch (err: unknown) {
        console.error('[PayFast] Payment error:', err);
        const msg = err instanceof Error ? err.message : (err as any)?.message ?? 'Failed to initiate PayFast payment';
        toast.error(msg);
      }
      return;
    }

  };

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-16 flex flex-col items-center justify-center">
          <div className="text-center max-w-md mx-auto">
            <div className="mb-6 text-primary">
              <svg className="h-24 w-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-3">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Looks like you haven't added any items to your cart yet.</p>
            <Button asChild><Link to="/vendors">Browse Vendors</Link></Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-16">
        <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />Continue Shopping
        </Link>

        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <div key={item.id} className="flex gap-4 p-4 border rounded-lg bg-card">
                <div className="h-20 w-20 rounded-md overflow-hidden flex-shrink-0">
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex-grow space-y-1">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">{item.vendorName}</p>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-6 text-center">{item.quantity}</span>
                      <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="font-semibold">R{(item.price * item.quantity).toFixed(2)}</span>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => { removeItem(item.id); toast.success('Item removed'); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-20 border rounded-lg bg-card p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>R{subtotal.toFixed(2)}</span></div>
                <div className="border-t pt-3 flex justify-between font-semibold"><span>Total</span><span>R{total.toFixed(2)}</span></div>
              </div>
              <Button className="w-full" onClick={() => {
                if (!user) { setIsGuestModalOpen(true); return; }
                setIsCheckoutDialogOpen(true);
              }}>
                Proceed to Checkout
              </Button>
              <div className="mt-4 text-xs text-muted-foreground">
                <p className="flex items-start gap-1"><AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />All orders are pickup, collect from the vendor at your chosen time</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <GuestCheckoutModal
        open={isGuestModalOpen}
        onClose={() => setIsGuestModalOpen(false)}
        onContinue={(info) => {
          setGuestInfo(info);
          setIsGuestModalOpen(false);
          setIsCheckoutDialogOpen(true);
        }}
      />

      <Dialog open={isCheckoutDialogOpen} onOpenChange={setIsCheckoutDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Complete Your Order</DialogTitle>
            <DialogDescription>Choose a pickup time and payment method. All amounts in R (ZAR).</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 overflow-y-auto flex-1 min-h-0">

            {/* Pickup time – required */}
            <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <Label className="text-base font-semibold flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-amber-700" />
                Pickup time <span className="text-destructive">*</span>
              </Label>
              <Input
                type="datetime-local"
                value={pickupTime}
                onChange={e => setPickupTime(e.target.value)}
                min={new Date(Date.now() + 10 * 60 * 1000).toISOString().slice(0, 16)}
              />
              <p className="text-xs text-amber-700">Must be at least 10 minutes from now. You will collect your order at the vendor.</p>
            </div>

            {/* Payment method */}
            <div className="space-y-2 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <Label className="text-base font-semibold">Payment (ZAR)</Label>
              <div className="flex items-center gap-2 text-sm border border-primary bg-primary/10 font-medium rounded-md px-3 py-2">
                <CreditCard className="h-4 w-4 text-[#1a84c0] flex-shrink-0" />
                <span>PayFast</span>
              </div>
              <p className="text-xs text-muted-foreground">Card, EFT or SnapScan via PayFast</p>
            </div>

            {/* Promo code */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1"><Tag className="h-4 w-4" />Promo Code (optional)</Label>
              {appliedPromoCode && promotion ? (
                <div className="flex items-center gap-2 text-sm bg-green-50 border border-green-200 rounded px-3 py-2">
                  <span className="text-green-700 flex-1">
                    <strong>{promotion.code || 'Promo'}</strong> applied — {promotion.type === 'percentage' ? `${promotion.value}% off` : `R${Number(promotion.value).toFixed(2)} off`} (−R{discount.toFixed(2)})
                  </span>
                  <Button variant="ghost" size="icon" className="h-5 w-5 text-green-700" onClick={() => { setAppliedPromoCode(null); setPromoCodeInput(''); }}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input placeholder="Enter code" value={promoCodeInput} onChange={e => setPromoCodeInput(e.target.value.toUpperCase())} />
                  <Button variant="outline" disabled={!promoCodeInput.trim() || promoLoading} onClick={() => {
                    if (!promoCodeInput.trim()) return;
                    setAppliedPromoCode(promoCodeInput.trim());
                  }}>
                    {promoLoading ? '...' : 'Apply'}
                  </Button>
                </div>
              )}
              {appliedPromoCode && !promoLoading && !promotion && (
                <p className="text-xs text-destructive">Code not found or expired for this vendor.</p>
              )}
              {appliedPromoCode && promotion && promotion.min_order_amount && subtotal < Number(promotion.min_order_amount) && (
                <p className="text-xs text-destructive">Minimum order of R{Number(promotion.min_order_amount).toFixed(2)} required for this code.</p>
              )}
            </div>

            {/* Special instructions */}
            <div className="space-y-2">
              <label htmlFor="instructions" className="text-sm font-medium">Special Instructions (Optional)</label>
              <Textarea id="instructions" placeholder="Allergies, customisations, etc." value={specialInstructions} onChange={e => setSpecialInstructions(e.target.value)} />
            </div>

            {/* Summary */}
            <div className="border rounded-md p-4 bg-muted/30">
              <div className="font-medium mb-2">Order Summary</div>
              <div className="text-sm text-muted-foreground space-y-1">
                <div className="flex justify-between"><span>Payment</span><span>PayFast (online)</span></div>
                {pickupTime && <div className="flex justify-between"><span>Pickup time</span><span>{format(new Date(pickupTime), 'PPp')}</span></div>}
                <div className="flex justify-between"><span>{totalItems} items</span><span>R{subtotal.toFixed(2)}</span></div>
                {discount > 0 && <div className="flex justify-between text-green-700"><span>Discount</span><span>−R{discount.toFixed(2)}</span></div>}
                <div className="flex justify-between font-medium pt-1 mt-1 border-t"><span>Total (ZAR)</span><span>R{total.toFixed(2)}</span></div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCheckoutDialogOpen(false)}>Cancel</Button>
            <Button onClick={handlePlaceOrder} disabled={placeOrder.isPending}>
              {placeOrder.isPending ? 'Processing...' : 'Pay with PayFast'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={orderPlaced} onOpenChange={setOrderPlaced}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-6">
            <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Order Placed!</h2>
            <p className="text-muted-foreground mb-6">Your pre-order is confirmed. Head to the vendor at your selected pickup time.</p>
            <Button asChild><Link to="/orders">View My Orders</Link></Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Cart;
