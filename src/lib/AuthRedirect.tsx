"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { userAtom } from "@/lib/AuthAtoms";
import { supabase } from "@/lib/supabase";

const AuthRedirect = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [, setUser] = useAtom(userAtom);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      if (!user && pathname !== "/login") {
        router.push("/login");
      }
    };

    checkUser();
  }, [pathname, router, setUser]);

  return <>{children}</>;
};

export default AuthRedirect;
