"use client";
import { useAuth } from "@/lib/AuthAtoms";
import { useRouter } from "next/navigation";
export default function Home() {
  const { signin } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await signin({ email: "ahmad@byeq.net", password: "123456" });
      router.push("/");
    } catch (error) {
      console.log("Error login:", error);
    }
  };

  return (
    <div className="text-5xl flex flex-col min-h-screen items-center justify-center  ">
      <h1>Login in page</h1>
      <button
        className="mt-10 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={handleLogin}
      >
        Login
      </button>
    </div>
  );
}
