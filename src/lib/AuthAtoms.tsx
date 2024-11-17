"use client";
import { useRouter } from "next/navigation";
import { atom, useAtom } from "jotai";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export const userAtom = atom<User | null>(null);

export const signinAtom = atom(
  null,
  async (
    get,
    set,
    { email, password }: { email: string; password: string }
  ) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      throw error;
    }
    set(userAtom, data.user);
  }
);

export const signoutAtom = atom(null, async (get, set) => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
  set(userAtom, null);
});

export const useAuth = () => {
  const [user] = useAtom(userAtom);
  const [, signin] = useAtom(signinAtom);
  const [, signout] = useAtom(signoutAtom);
  return {
    user,
    signin,
    signout,
  };
};

export const useAuthRedirect = () => {
  const [user] = useAtom(userAtom);
  const router = useRouter();

  if (!user) {
    router.push("/login");
  }
};
