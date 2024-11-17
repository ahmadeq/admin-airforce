"use client";
import { useAuthRedirect } from "@/lib/AuthAtoms";
export default function Home() {
  useAuthRedirect();
  return (
    <div className="text-5xl flex flex-col min-h-screen items-center justify-center  ">
      <h1>Hello World!</h1>
      <h2>hi??</h2>
    </div>
  );
}
