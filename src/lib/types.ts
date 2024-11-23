/* ============================    API TYPES    ============================*/

export type Faq = {
  id?: number;
  question: string;
  answer: string;
};

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
