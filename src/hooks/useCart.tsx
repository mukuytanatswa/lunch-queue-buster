import { useState, useEffect, createContext, useContext } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  vendorId: string;
  vendorName: string;
  image?: string;
  specialInstructions?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getVendorIds: () => string[];
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load cart from localStorage on mount
  useEffect(() => {
    if (user) {
      const savedCart = localStorage.getItem(`cart_${user.id}`);
      if (savedCart) {
        try {
          setItems(JSON.parse(savedCart));
        } catch (error) {
          console.error('Error loading cart from localStorage:', error);
        }
      }
    }
  }, [user]);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    if (user) {
      localStorage.setItem(`cart_${user.id}`, JSON.stringify(items));
    }
  }, [items, user]);

  const addItem = (newItem: Omit<CartItem, 'id'>) => {
    setItems(prevItems => {
      // Check if item already exists
      const existingItemIndex = prevItems.findIndex(item => 
        item.menuItemId === newItem.menuItemId && 
        item.specialInstructions === newItem.specialInstructions
      );

      if (existingItemIndex > -1) {
        // Update quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += newItem.quantity;
        return updatedItems;
      } else {
        // Add new item
        const itemWithId: CartItem = {
          ...newItem,
          id: `${newItem.menuItemId}-${Date.now()}-${Math.random()}`,
        };
        return [...prevItems, itemWithId];
      }
    });

    toast({
      title: 'Added to cart',
      description: `${newItem.name} has been added to your cart.`,
    });
  };

  const removeItem = (id: string) => {
    setItems(prevItems => {
      const item = prevItems.find(item => item.id === id);
      if (item) {
        toast({
          title: 'Removed from cart',
          description: `${item.name} has been removed from your cart.`,
        });
      }
      return prevItems.filter(item => item.id !== id);
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    toast({
      title: 'Cart cleared',
      description: 'All items have been removed from your cart.',
    });
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getVendorIds = () => {
    return Array.from(new Set(items.map(item => item.vendorId)));
  };

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getTotalItems,
      getTotalPrice,
      getVendorIds,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};