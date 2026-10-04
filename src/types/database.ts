// ============================================================
// src/types/database.ts
// TypeScript types matching the Supabase schema
// Generated to match supabase/migrations/001_initial_schema.sql
// ============================================================

export type AdminRole = "super_admin" | "admin" | "manager";

export type ProductStatus = "active" | "inactive" | "draft";

export type PaymentMethod = "cod" | "card" | "paypal" | "transfer";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type OrderStatus =
  | "new"
  | "pending_confirmation"
  | "confirmed"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

export type ConfirmationStatus =
  | "pending"
  | "confirmed"
  | "rejected"
  | "unreachable";

export type ShippingMethod = "free" | "fixed" | "by_city";

export interface AdminProfile {
  id: string;
  email: string;
  full_name: string;
  role: AdminRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  name_ar: string | null;
  slug: string;
  description: string | null;
  image: string | null;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductColor {
  name: string;
  hex: string;
}

export interface ProductVariant {
  id: string;
  sku?: string;
  price: number;
  stock: number;
  color?: string;
  size?: string;
}

export interface Product {
  id: number;
  name: string;
  name_ar: string | null;
  slug: string;
  description: string | null;
  short_description: string | null;
  price: string;
  compare_at_price: string | null;
  cost_price: string | null;
  currency: string;
  stock_quantity: number;
  sku: string | null;
  category_id: number | null;
  status: ProductStatus;
  featured: boolean;
  new_arrival: boolean;
  images: string[];
  colors: ProductColor[];
  sizes: string[];
  material: string | null;
  material_ar: string | null;
  variants: ProductVariant[];
  created_at: string;
  updated_at: string;
}

export interface ProductOffer {
  id: number;
  product_id: number;
  name: string;
  name_ar: string | null;
  quantity: number;
  price: string;
  original_price: string | null;
  promo_text: string | null;
  promo_text_ar: string | null;
  active: boolean;
  is_default: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: number;
  full_name: string;
  phone: string;
  email: string | null;
  address: string | null;
  city: string | null;
  notes: string | null;
  total_orders: number;
  total_spent: string;
  last_order_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  order_number: string;
  customer_id: number | null;
  full_name: string;
  phone: string;
  address: string;
  city: string | null;
  notes: string | null;
  internal_notes: string | null;
  subtotal: string;
  shipping_cost: string;
  discount: string;
  total: string;
  currency: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  confirmation_status: ConfirmationStatus;
  assigned_admin: string | null;
  coupon_code: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number | null;
  product_name_snapshot: string;
  product_price_snapshot: string;
  quantity: number;
  variant: string | null;
  subtotal: string;
  created_at: string;
}

export interface ShippingConfig {
  id: number;
  label: string;
  label_ar: string | null;
  method: ShippingMethod;
  base_cost: string;
  free_over: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShippingZone {
  id: number;
  config_id: number | null;
  city: string;
  cost: string;
  active: boolean;
  created_at: string;
}

export interface StoreSetting {
  id: number;
  key: string;
  value: string | null;
  updated_at: string;
}

export interface AuditLog {
  id: number;
  admin_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface BestSellingProduct {
  name: string;
  sold: number;
  revenue: string;
}

export interface OrdersByCity {
  city: string;
  orders: number;
}

export interface OrdersByDate {
  day: string;
  orders: number;
}

export interface DashboardStats {
  total_orders: number;
  new_orders: number;
  pending_confirm: number;
  confirmed: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  returned: number;
  total_revenue: string;
  revenue_30d: string;
  total_customers: number;
  active_products: number;
  low_stock_products: number;
  best_selling: BestSellingProduct[];
  orders_by_city: OrdersByCity[];
  orders_by_date: OrdersByDate[];
}

/** Payload accepted by public.create_cod_order() */
export interface CreateCodOrderPayload {
  full_name: string;
  phone: string;
  address: string;
  city?: string | null;
  notes?: string | null;
  items: {
    productId: number;
    quantity: number;
    variant?: string;
  }[];
  offer_id?: number | null;
  offer_quantity?: number;
  coupon_code?: string | null;
}

export interface CreateCodOrderResult {
  success: boolean;
  order_id: number;
  order_number: string;
  subtotal: string;
  shipping_cost: string;
  discount: string;
  total: string;
  items: {
    product_id: number;
    product_name_snapshot: string;
    product_price_snapshot: string;
    quantity: number;
    variant: string | null;
    subtotal: string;
  }[];
}

export interface Database {
  public: {
    Tables: {
      admin_profiles: {
        Row: AdminProfile;
        Insert: Omit<AdminProfile, "created_at" | "updated_at">;
        Update: Partial<AdminProfile>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, "id" | "created_at" | "updated_at">;
        Update: Partial<Category>;
      };
      products: {
        Row: Product;
        Insert: Omit<Product, "id" | "created_at" | "updated_at">;
        Update: Partial<Product>;
      };
      product_offers: {
        Row: ProductOffer;
        Insert: Omit<ProductOffer, "id" | "created_at" | "updated_at">;
        Update: Partial<ProductOffer>;
      };
      customers: {
        Row: Customer;
        Insert: Omit<Customer, "id" | "total_orders" | "total_spent" | "last_order_at" | "created_at" | "updated_at">;
        Update: Partial<Customer>;
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, "id" | "created_at" | "updated_at">;
        Update: Partial<Order>;
      };
      order_items: {
        Row: OrderItem;
        Insert: Omit<OrderItem, "id" | "created_at">;
        Update: Partial<OrderItem>;
      };
      shipping_config: {
        Row: ShippingConfig;
        Insert: Omit<ShippingConfig, "id" | "created_at" | "updated_at">;
        Update: Partial<ShippingConfig>;
      };
      shipping_zones: {
        Row: ShippingZone;
        Insert: Omit<ShippingZone, "id" | "created_at">;
        Update: Partial<ShippingZone>;
      };
      store_settings: {
        Row: StoreSetting;
        Insert: Omit<StoreSetting, "id" | "updated_at">;
        Update: Partial<StoreSetting>;
      };
      audit_logs: {
        Row: AuditLog;
        Insert: Omit<AuditLog, "id" | "created_at">;
        Update: Partial<AuditLog>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_cod_order: {
        Args: CreateCodOrderPayload;
        Returns: CreateCodOrderResult;
      };
      calc_shipping_cost: {
        Args: { p_city: string | null; p_subtotal: number };
        Returns: string;
      };
      restore_stock_for_order: {
        Args: { p_order_id: number; p_admin_id?: string | null };
        Returns: boolean;
      };
      admin_dashboard_stats: {
        Args: Record<string, never>;
        Returns: DashboardStats;
      };
      generate_order_number: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
    Enums: Record<string, never>;
  };
}
