
import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface MenuItemCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  popular?: boolean;
  className?: string;
  onAddToCart?: (id: string, quantity: number) => void;
}

const MenuItemCard = ({
  id,
  name,
  description,
  price,
  image,
  popular = false,
  className,
  onAddToCart
}: MenuItemCardProps) => {
  const [quantity, setQuantity] = useState(0);

  const handleIncrement = () => {
    setQuantity(prev => prev + 1);
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (quantity > 0 && onAddToCart) {
      onAddToCart(id, quantity);
      setQuantity(0);
    }
  };

  return (
    <div 
      className={cn(
        "flex flex-col sm:flex-row gap-4 overflow-hidden rounded-lg border bg-white p-4 transition-all hover:shadow-md",
        className
      )}
    >
      <div className="relative h-24 sm:h-auto sm:w-24 rounded-md overflow-hidden flex-shrink-0">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover"
        />
        {popular && (
          <Badge 
            className="absolute top-1 left-1 bg-brand-500 hover:bg-brand-600 text-xs"
          >
            Popular
          </Badge>
        )}
      </div>

      <div className="flex-grow space-y-2">
        <h3 className="font-medium">{name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        <div className="flex items-center justify-between pt-2">
          <span className="font-semibold">R{price.toFixed(2)}</span>
          
          <div className="flex items-center space-x-2">
            {quantity > 0 ? (
              <>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 rounded-full"
                  onClick={handleDecrement}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-6 text-center">{quantity}</span>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 rounded-full"
                  onClick={handleIncrement}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  className="ml-2 bg-brand-500 hover:bg-brand-600"
                  onClick={handleAddToCart}
                >
                  Add
                </Button>
              </>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full"
                onClick={handleIncrement}
              >
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;
