export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      driver_profiles: {
        Row: {
          bank_account_name: string | null
          bank_account_number: string | null
          bank_name: string | null
          created_at: string | null
          current_location: unknown
          delivery_radius_km: number | null
          id: string
          is_online: boolean | null
          license_plate: string | null
          rating: number | null
          total_deliveries: number | null
          total_earnings: number | null
          updated_at: string | null
          user_id: string
          vehicle_type: string | null
        }
        Insert: {
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          created_at?: string | null
          current_location?: unknown
          delivery_radius_km?: number | null
          id?: string
          is_online?: boolean | null
          license_plate?: string | null
          rating?: number | null
          total_deliveries?: number | null
          total_earnings?: number | null
          updated_at?: string | null
          user_id: string
          vehicle_type?: string | null
        }
        Update: {
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          created_at?: string | null
          current_location?: unknown
          delivery_radius_km?: number | null
          id?: string
          is_online?: boolean | null
          license_plate?: string | null
          rating?: number | null
          total_deliveries?: number | null
          total_earnings?: number | null
          updated_at?: string | null
          user_id?: string
          vehicle_type?: string | null
        }
        Relationships: []
      }
      group_order_items: {
        Row: {
          created_at: string | null
          group_order_id: string
          id: string
          menu_item_id: string | null
          quantity: number
          special_instructions: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          group_order_id: string
          id?: string
          menu_item_id?: string | null
          quantity?: number
          special_instructions?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          group_order_id?: string
          id?: string
          menu_item_id?: string | null
          quantity?: number
          special_instructions?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_order_items_group_order_id_fkey"
            columns: ["group_order_id"]
            isOneToOne: false
            referencedRelation: "group_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      group_order_members: {
        Row: {
          group_order_id: string
          id: string
          joined_at: string | null
          nickname: string | null
          user_id: string
        }
        Insert: {
          group_order_id: string
          id?: string
          joined_at?: string | null
          nickname?: string | null
          user_id: string
        }
        Update: {
          group_order_id?: string
          id?: string
          joined_at?: string | null
          nickname?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_order_members_group_order_id_fkey"
            columns: ["group_order_id"]
            isOneToOne: false
            referencedRelation: "group_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      group_orders: {
        Row: {
          created_at: string | null
          creator_id: string
          delivery_address: string | null
          delivery_instructions: string | null
          expires_at: string | null
          id: string
          invite_code: string
          name: string
          status: string
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          created_at?: string | null
          creator_id: string
          delivery_address?: string | null
          delivery_instructions?: string | null
          expires_at?: string | null
          id?: string
          invite_code?: string
          name?: string
          status?: string
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          created_at?: string | null
          creator_id?: string
          delivery_address?: string | null
          delivery_instructions?: string | null
          expires_at?: string | null
          id?: string
          invite_code?: string
          name?: string
          status?: string
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          allergens: string[] | null
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_available: boolean | null
          is_vegan: boolean | null
          is_vegetarian: boolean | null
          name: string
          preparation_time: number | null
          price: number
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          allergens?: string[] | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          is_vegan?: boolean | null
          is_vegetarian?: boolean | null
          name: string
          preparation_time?: number | null
          price: number
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          allergens?: string[] | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          is_vegan?: boolean | null
          is_vegetarian?: boolean | null
          name?: string
          preparation_time?: number | null
          price?: number
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          order_id: string
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          order_id: string
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          order_id?: string
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          menu_item_id: string | null
          order_id: string
          quantity: number
          special_instructions: string | null
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          menu_item_id?: string | null
          order_id: string
          quantity?: number
          special_instructions?: string | null
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          menu_item_id?: string | null
          order_id?: string
          quantity?: number
          special_instructions?: string | null
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          customer_id: string
          customer_name: string
          customer_phone: string | null
          delivered_time: string | null
          delivery_address: string
          delivery_fee: number
          delivery_instructions: string | null
          driver_id: string | null
          estimated_delivery_time: string | null
          id: string
          order_number: string
          payment_method: string | null
          payment_status: string | null
          pickup_time: string | null
          status: string
          stripe_payment_intent_id: string | null
          subtotal: number
          tip_amount: number | null
          total_amount: number
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          customer_name: string
          customer_phone?: string | null
          delivered_time?: string | null
          delivery_address: string
          delivery_fee?: number
          delivery_instructions?: string | null
          driver_id?: string | null
          estimated_delivery_time?: string | null
          id?: string
          order_number: string
          payment_method?: string | null
          payment_status?: string | null
          pickup_time?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          subtotal: number
          tip_amount?: number | null
          total_amount: number
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          customer_name?: string
          customer_phone?: string | null
          delivered_time?: string | null
          delivery_address?: string
          delivery_fee?: number
          delivery_instructions?: string | null
          driver_id?: string | null
          estimated_delivery_time?: string | null
          id?: string
          order_number?: string
          payment_method?: string | null
          payment_status?: string | null
          pickup_time?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          subtotal?: number
          tip_amount?: number | null
          total_amount?: number
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          campus_location: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          onboarding_completed: boolean | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          campus_location?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          campus_location?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          created_at: string | null
          customer_id: string
          driver_comment: string | null
          driver_id: string | null
          driver_rating: number | null
          id: string
          order_id: string
          vendor_comment: string | null
          vendor_id: string | null
          vendor_rating: number | null
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          driver_comment?: string | null
          driver_id?: string | null
          driver_rating?: number | null
          id?: string
          order_id: string
          vendor_comment?: string | null
          vendor_id?: string | null
          vendor_rating?: number | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          driver_comment?: string | null
          driver_id?: string | null
          driver_rating?: number | null
          id?: string
          order_id?: string
          vendor_comment?: string | null
          vendor_id?: string | null
          vendor_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          created_at: string | null
          cuisine_type: string
          delivery_fee: number | null
          delivery_time_max: number | null
          delivery_time_min: number | null
          description: string | null
          email: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          location: string
          minimum_order: number | null
          name: string
          phone_number: string | null
          rating: number | null
          total_reviews: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          cuisine_type: string
          delivery_fee?: number | null
          delivery_time_max?: number | null
          delivery_time_min?: number | null
          description?: string | null
          email?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          location: string
          minimum_order?: number | null
          name: string
          phone_number?: string | null
          rating?: number | null
          total_reviews?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          cuisine_type?: string
          delivery_fee?: number | null
          delivery_time_max?: number | null
          delivery_time_min?: number | null
          description?: string | null
          email?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          location?: string
          minimum_order?: number | null
          name?: string
          phone_number?: string | null
          rating?: number | null
          total_reviews?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_order_number: { Args: never; Returns: string }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      user_role: "student" | "vendor" | "driver" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["student", "vendor", "driver", "admin"],
    },
  },
} as const
