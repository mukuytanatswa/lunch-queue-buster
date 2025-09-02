import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Vendor {
  id: string;
  name: string;
  description?: string;
  cuisine_type: string;
  image_url?: string;
  location: string;
  phone_number?: string;
  email?: string;
  is_active: boolean;
  is_featured: boolean;
  rating: number;
  total_reviews: number;
  delivery_time_min: number;
  delivery_time_max: number;
  minimum_order: number;
  delivery_fee: number;
  created_at: string;
  updated_at: string;
}

export const useVendors = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchVendors = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('rating', { ascending: false });

      if (error) throw error;
      
      setVendors(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch vendors';
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
    fetchVendors();
  }, []);

  return {
    vendors,
    loading,
    error,
    refetch: fetchVendors,
  };
};

export const useVendor = (id: string) => {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchVendor = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      setVendor(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch vendor';
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
      fetchVendor();
    }
  }, [id]);

  return {
    vendor,
    loading,
    error,
    refetch: fetchVendor,
  };
};