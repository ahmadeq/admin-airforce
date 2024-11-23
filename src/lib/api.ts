import { supabase } from "@/lib/supabase";
import { Faq, Coupon, CouponForm, Order, OrderItem } from "@/lib/types";

export const getFaqs = async (): Promise<Faq[]> => {
  const { data, error } = await supabase.from<any, any>("faq").select("*");
  if (error) {
    console.log("Error fetching FAQS:", error);
    throw error;
  }
  return data || [];
};

export const deleteFaq = async (id: number) => {
  const { error: faqError } = await supabase.from("faq").delete().eq("id", id);
  if (faqError) {
    console.error("Error deleting FAQ from 'faq' table:", faqError);
    throw faqError;
  }

  const { error: faqArError } = await supabase
    .from("faq_ar")
    .delete()
    .eq("id", id);
  if (faqArError) {
    console.error("Error deleting FAQ from 'faq_ar' table:", faqArError);
    throw faqArError;
  }
  console.log(`Deleted FAQ with ID ${id} from 'faq_ar' table`);
};

export const createFaq = async (faq: Faq[]) => {
  const { error } = await supabase.from("faq").insert(faq[0]);
  if (error) {
    console.error("Error inserting FAQ into 'faq' table:", error);
    throw error;
  }
  const { error: arError } = await supabase.from("faq_ar").insert(faq[1]);
  if (arError) {
    console.error("Error inserting FAQ into 'faq_ar' table:", arError);
    throw arError;
  }
};

export const getFaqById = async (id: number) => {
  const { data: faqData, error: faqError } = await supabase
    .from("faq")
    .select("*")
    .eq("id", id)
    .single();
  if (faqError) {
    console.error("Error fetching FAQ from 'faq' table:", faqError);
    throw faqError;
  }

  const { data: faqArData, error: faqArError } = await supabase
    .from("faq_ar")
    .select("*")
    .eq("id", id)
    .single();
  if (faqArError) {
    console.error("Error fetching FAQ from 'faq_ar' table:", faqArError);
    throw faqArError;
  }

  return [faqData, faqArData];
};

export const updateFaq = async (id: number, faq: Faq[]) => {
  const { error: faqError } = await supabase
    .from("faq")
    .update(faq[0])
    .eq("id", id);
  if (faqError) {
    console.error("Error updating FAQ in 'faq' table:", faqError);
    throw faqError;
  }

  const { error: faqArError } = await supabase
    .from("faq_ar")
    .update(faq[1])
    .eq("id", id);
  if (faqArError) {
    console.error("Error updating FAQ in 'faq_ar' table:", faqArError);
    throw faqArError;
  }
};

export const getCoupons = async (): Promise<Coupon[]> => {
  const { data, error } = await supabase.from<any, any>("coupons").select("*");
  if (error) {
    console.log("Error fetching coupons:", error);
    throw error;
  }
  return data || [];
};

export const createCoupon = async (coupon: CouponForm) => {
  const { error } = await supabase.from("coupons").insert(coupon);
  if (error) {
    console.error("Error inserting FAQ into 'faq' table:", error);
    throw error;
  }
};

export const updateCoupon = async (id: number, status: string) => {
  const { error } = await supabase
    .from("coupons")
    .update({ status })
    .eq("id", id);
  if (error) {
    console.error("Error updating coupon in 'coupons' table:", error);
    throw error;
  }
};

export const getOrders = async (): Promise<Order[]> => {
  const { data, error } = await supabase.from<any, any>("orders").select("*");
  if (error) {
    console.log("Error fetching orders:", error);
    throw error;
  }
  return data || [];
};

export const getOrderById = async (id: number): Promise<Order[]> => {
  const { data, error } = await supabase
    .from<any, any>("orders")
    .select("*")
    .eq("id", id);
  if (error) {
    console.log("Error fetching orders:", error);
    throw error;
  }
  return data || [];
};

export const updateOrderStatus = async (id: number, status: string) => {
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id);
  if (error) {
    console.error("Error updating order in 'orders' table:", error);
    throw error;
  }
};

export const updateOrderPaymentMethod = async (
  id: number,
  payment_method: string
) => {
  const { error } = await supabase
    .from("orders")
    .update({ payment_method })
    .eq("id", id);
  if (error) {
    console.error("Error updating order in 'orders' table:", error);
    throw error;
  }
};

export const getOrderItemsById = async (id: number): Promise<OrderItem[]> => {
  const { data, error } = await supabase
    .from<any, any>("order_items")
    .select("*")
    .eq("orderId", id);
  if (error) {
    console.log("Error fetching order items:", error);
    throw error;
  }
  return data || [];
};

export const getItemVariantByVariantId = async (id: number) => {
  const { data, error } = await supabase
    .from<any, any>("product_variants")
    .select("*")
    .eq("id", id);
  if (error) {
    console.log("Error fetching item variant:", error);
    throw error;
  }
  return data[0].size || [];
};
