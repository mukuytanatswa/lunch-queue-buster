import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MenuItem {
  id: string;
  vendor_id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  image_url?: string;
  is_available: boolean;
  is_vegetarian: boolean;
  is_vegan: boolean;
  allergens?: string[];
  preparation_time: number;
  created_at: string;
  updated_at: string;
}

export const useMenuItems = (vendorId?: string) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('menu_items')
        .select('*')
        .eq('is_available', true)
        .order('category')
        .order('name');

      if (vendorId) {
        query = query.eq('vendor_id', vendorId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      setMenuItems(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch menu items';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, [vendorId]);

  return {
    menuItems,
    loading,
    error,
    refetch: fetchMenuItems,
  };
};

export const useMenuItem = (id: string) => {
  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchMenuItem = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      setMenuItem(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch menu item';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchMenuItem();
    }
  }, [id]);

  return {
    menuItem,
    loading,
    error,
    refetch: fetchMenuItem,
  };
};