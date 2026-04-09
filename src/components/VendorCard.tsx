
import { Clock, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface VendorCardProps {
  id: string;
  name: string;
  image: string;
  cuisineType: string;
  rating: number;
  deliveryTime: string;
  location: string;
  featured?: boolean;
  className?: string;
}

const VendorCard = ({ 
  id, 
  name, 
  image, 
  cuisineType, 
  rating, 
  deliveryTime, 
  location, 
  featured = false,
  className 
}: VendorCardProps) => {
  return (
    <Link 
      to={`/vendor/${id}`} 
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-300 hover:shadow-md",
        featured && "ring-2 ring-brand-400 ring-offset-2",
        className
      )}
    >
      <div className="relative h-48 w-full overflow-hidden">
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {featured && (
          <Badge 
            className="absolute top-3 right-3 bg-brand-500 hover:bg-brand-600 z-20"
          >
            Featured
          </Badge>
        )}
      </div>
      
      <div className="flex flex-col p-4 flex-grow">
        <div className="mb-2">
          <h3 className="font-semibold text-lg">{name}</h3>
        </div>
        
        <Badge variant="outline" className="self-start text-xs mb-3">
          {cuisineType}
        </Badge>
        
        <div className="mt-auto space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{deliveryTime}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{location}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default VendorCard;
