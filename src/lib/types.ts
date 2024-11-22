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
