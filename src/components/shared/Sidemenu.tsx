"use client";
import Link from "next/link";
import { ChartNoAxesCombined, FileUser, Home, Lock, Book } from "lucide-react";
import { Orbitron } from "next/font/google";
import { usePathname } from "next/navigation";
const baskervville = Orbitron({ weight: "400", subsets: ["latin"] });

const menuItems = [
  {
    name: "Home",
    href: "/admin",
    icon: Home,
    description: "Admin Dashboard",
  },
  {
    name: "Admins",
    href: "/admin/users",
    icon: Lock,
    description: "Manage admin users.",
  },
  {
    name: "Students",
    href: "/admin/students",
    icon: FileUser,
    description: "View, add, edit, and import students.",
  },
  {
    name: "Exams",
    href: "/admin/exams",
    icon: Book,
    description: "Create and manage exams and sections.",
  },
  {
    name: "Results",
    href: "/admin/results",
    icon: ChartNoAxesCombined,
    description: "View and export exam results.",
  },
];

export function SideMenu() {
  const pathname = usePathname();

  if (pathname === "/login") {
    return null;
  }

  return (
    <>
      <div className="flex flex-col min-h-screen w-64 bg-gray-100 text-gray-800 border-r border-black">
        <div className="p-4 border-b border-gray-200">
          <div className="flex gap-4"></div>
          {(() => {
            // Map pathnames to headings
            const headings: { [key: string]: string } = {
              "/admin": "Home",
              "/admin/users": "Admins",
              "/admin/students": "Students",
              "/admin/exams": "Exams",
              "/admin/results": "Results",
            };
            // Find the best match for the current pathname
            const heading = headings[pathname] || "EXAM";
            return (
              <h1
                className={`text-4xl font-extrabold ${baskervville.className}`}
              >
                {heading}
              </h1>
            );
          })()}
        </div>
        <nav className="flex-1 overflow-y-auto">
          <ul className="p-2 space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center p-2 rounded-lg transition-colors ${
                      isActive ? "bg-blue-600 text-white" : "hover:bg-gray-200"
                    }`}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
}
