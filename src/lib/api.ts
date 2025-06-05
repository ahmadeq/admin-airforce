import { supabase } from "@/lib/supabase";

export const getContactResponses = async () => {
  const { data, error } = await supabase
    .from<any, any>("contact")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.log("Error fetching contact responses:", error);
    throw error;
  }
  return data || [];
};

export const getJoinFormResponses = async () => {
  const { data, error } = await supabase
    .from<any, any>("join-utopia")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.log("Error fetching join form responses:", error);
    throw error;
  }
  return data || [];
};

export const updateContactResponseStatus = async (
  id: string,
  hide: boolean
) => {
  const { data, error } = await supabase
    .from("contact")
    .update({ hide })
    .eq("id", id)
    .select("*");

  if (error) {
    console.log("Error updating contact response status:", error);
    throw error;
  }
  return data ? data[0] : null;
};
