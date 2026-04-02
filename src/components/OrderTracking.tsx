import { CheckCircle, Clock, Package, Truck, MapPin, ChefHat } from 'lucide-react';

interface OrderTrackingProps {
  status: string;
  estimatedTime?: string | null;
  deliveredTime?: string | null;
  pickupTime?: string | null;
}

const steps = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'preparing', label: 'Preparing', icon: ChefHat },
  { key: 'ready', label: 'Ready', icon: Package },
  { key: 'picked_up', label: 'Picked Up', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: MapPin },
];

const OrderTracking = ({ status, estimatedTime, deliveredTime, pickupTime }: OrderTrackingProps) => {
  const currentIndex = steps.findIndex(s => s.key === status);
  const isCancelled = status === 'cancelled';

  if (isCancelled) {
    return (
      <div className="text-center py-6">
        <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-3">
          <span className="text-destructive text-xl">✕</span>
        </div>
        <p className="font-medium text-destructive">Order Cancelled</p>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-6">
        {steps.map((step, i) => {
          const StepIcon = step.icon;
          const isCompleted = i <= currentIndex;
          const isCurrent = i === currentIndex;
          return (
            <div key={step.key} className="flex flex-col items-center flex-1 relative">
              {/* Connector line */}
              {i > 0 && (
                <div className={`absolute top-5 right-1/2 w-full h-0.5 -translate-y-1/2 ${
                  i <= currentIndex ? 'bg-primary' : 'bg-muted'
                }`} style={{ zIndex: 0 }} />
              )}
              <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                isCurrent ? 'bg-primary text-primary-foreground ring-4 ring-primary/20 scale-110' :
                isCompleted ? 'bg-primary text-primary-foreground' :
                'bg-muted text-muted-foreground'
              }`}>
                <StepIcon className="h-5 w-5" />
              </div>
              <span className={`text-[10px] mt-1.5 text-center leading-tight ${
                isCurrent ? 'font-semibold text-primary' :
                isCompleted ? 'text-foreground' :
                'text-muted-foreground'
              }`}>{step.label}</span>
            </div>
          );
        })}
      </div>

      {/* Estimated delivery */}
      {status !== 'delivered' && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {status === 'pending' && 'Waiting for vendor confirmation...'}
            {status === 'confirmed' && 'Your order has been confirmed!'}
            {status === 'preparing' && 'Your food is being prepared 🍳'}
            {status === 'ready' && 'Your order is ready for pickup!'}
            {status === 'picked_up' && 'Your driver is on the way! 🚗'}
          </p>
        </div>
      )}

      {status === 'delivered' && deliveredTime && (
        <div className="text-center text-sm text-muted-foreground">
          Delivered at {new Date(deliveredTime).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
