"use client";
import Link from "next/link";
import { ChartNoAxesCombined, FileUser, Mail } from "lucide-react";
import { Orbitron } from "next/font/google";
import { usePathname } from "next/navigation";
const baskervville = Orbitron({ weight: "400", subsets: ["latin"] });

const menuItems = [
  { name: "DASHBOARD", href: "/", icon: ChartNoAxesCombined },
  { name: "CONTACT FORM", href: "/forms/contact", icon: Mail },
  { name: "JOIN FORM", href: "/forms/join-utopia", icon: FileUser },
];

export function SideMenu() {
  const pathname = usePathname();

  if (pathname === "/login") {
    return null;
  }

  return (
    <>
      <div className="flex flex-col h-full w-64 bg-gray-100 text-gray-800 border-r border-black">
        <div className="p-4 border-b border-gray-200">
          <div className="flex gap-4"></div>
          <h1 className={`text-4xl font-extrabold ${baskervville.className}`}>
            UTOPIA
          </h1>
        </div>
        <nav className="flex-1 overflow-y-auto">
          <ul className="p-2 space-y-2">
            {menuItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className="flex items-center p-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
