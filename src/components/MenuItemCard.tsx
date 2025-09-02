import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItemCardProps {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  isVegetarian?: boolean;
  isVegan?: boolean;
  preparationTime?: number;
  category?: string;
  className?: string;
  onAddToCart: (item: any) => void;
}

export const MenuItemCard = ({
  id,
  name,
  description,
  price,
  image,
  isVegetarian,
  isVegan,
  preparationTime,
  category,
  className,
  onAddToCart,
}: MenuItemCardProps) => {
  const defaultImage = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80';

  const tags = [
    ...(isVegetarian ? ['Vegetarian'] : []),
    ...(isVegan ? ['Vegan'] : []),
    ...(category ? [category] : [])
  ].filter(Boolean);

  const handleAddToCart = () => {
    onAddToCart({
      id,
      name,
      description,
      price,
      image: image || defaultImage,
      isVegetarian,
      isVegan,
      preparationTime,
      category
    });
  };

  return (
    <div className={cn(
      "border rounded-lg overflow-hidden bg-card shadow-sm hover:shadow-md transition-shadow",
      className
    )}>
      <div className="h-48 overflow-hidden">
        <img
          src={image || defaultImage}
          alt={name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-foreground">{name}</h3>
          <span className="font-medium text-primary">R{price.toFixed(2)}</span>
        </div>
        
        {description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {description}
          </p>
        )}
        
        <div className="flex items-center justify-between mb-4">
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          {preparationTime && (
            <div className="flex items-center text-xs text-muted-foreground ml-auto">
              <Clock className="h-3 w-3 mr-1" />
              <span>{preparationTime} min</span>
            </div>
          )}
        </div>
        
        <Button 
          className="w-full"
          onClick={handleAddToCart}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
      </div>
    </div>
  );
};

export default MenuItemCard;