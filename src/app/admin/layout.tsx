"use client";

import { getToken } from "../../lib/api";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SideMenu } from "../../components/shared/Sidemenu";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SideMenu />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
