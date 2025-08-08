import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, BookOpenCheck, BarChart3 } from "lucide-react";

export default function AdminDashboard() {
  const tiles = [
    {
      href: "/admin/users",
      title: "Users",
      desc: "Manage admin users and roles.",
      icon: Users,
    },
    {
      href: "/admin/students",
      title: "Students",
      desc: "View, add, edit, and import students.",
      icon: GraduationCap,
    },
    {
      href: "/admin/exams",
      title: "Exams",
      desc: "Create and manage exams and sections.",
      icon: BookOpenCheck,
    },
    {
      href: "/admin/results",
      title: "Results",
      desc: "View and export exam results.",
      icon: BarChart3,
    },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          Manage users, students, exams and results.
        </p>
      </div>
      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
        {tiles.map(({ href, title, desc, icon: Icon }) => (
          <Link key={href} href={href}>
            <Card className="hover:shadow-md transition-shadow h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold">
                  {title}
                </CardTitle>
                <Icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
