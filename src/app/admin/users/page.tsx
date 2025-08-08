"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldPlus } from "lucide-react";
import { api } from "@/lib/api";

export default function UsersPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Use shared axios client to create admin
      await api.post("/users", { username, password, role: "admin" });
      setUsername("");
      setPassword("");
      toast({ title: "Admin created" });
    } catch {
      toast({
        title: "Error",
        description: "Could not create admin",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] ">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Admin</h1>
        <p className="text-sm text-muted-foreground mb-4">
          Create a new admin user. Existing admins are not listed here.
        </p>
      </div>

      <Card className="min-w-[700px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldPlus className="h-5 w-5 text-muted-foreground" />
            Create Admin
          </CardTitle>
          <CardDescription>
            Enter a username and a strong password.
          </CardDescription>
        </CardHeader>

        <form onSubmit={onSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Create Admin"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
