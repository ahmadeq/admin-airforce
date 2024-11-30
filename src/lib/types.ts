/* ============================    API TYPES    ============================*/

export type Faq = {
  id?: number;
  question: string;
  answer: string;
};

export type Category = {
  id: number;
  name: string;
}

export type Coupon = {
  id: number;
  created_at?: string;
  amount: number;
  maxDiscount: number;
  minPurchase: number;
  isPercentage: boolean;
  code: string;
  status?: string;
};

export type CouponForm = {
  id?: number;
  created_at?: string;
  amount: number;
  maxDiscount: number;
  minPurchase: number;
  isPercentage: boolean;
  code: string;
  status?: string;
};

export type Order = {
  id: number;
  payment_method: string;
  status: string;
  total: number;
  address: string;
  city: string;
  created_at: string;
  phone: string;
  cartId: number;
  notes: string;
  name: string;
};

export type OrderItem = {
  id: number;
  productId: number;
  variantId: number;
  quantity: number;
  price: number;
  name: string;
  image: string;
  orderId: number;
  variantName?: string;
};

export type Product = {
  id: number
  name: string
  description: string
  price: number
  sale_price: number
  image: string
  category: number
  status: string
}

export type ProductForm = {
  name: string
  description: string
  price: number
  sale_price: number
  image: string
  category: number
  status: string
}

export type ProductImage = {
  id: number
  alt: string
  url: string
  productId: number
}

export type ProductVariant = {
  id: number
  size: string
  stockQuantity: number
  productId: number
}