"use client";

import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Pencil, Search, Trash2, UploadCloud } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Student = {
  id: string;
  name: string;
  nationalId: number;
  nominalId: number;
};

type Mode = "create" | "edit" | "bulk" | null;

export default function StudentsPage() {
  const [all, setAll] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>(null);
  const [selected, setSelected] = useState<Student | null>(null);
  const [query, setQuery] = useState("");
  const debounced = useDebounce(query, 250);
  const { toast } = useToast();

  // forms
  const [form, setForm] = useState({
    name: "",
    national_id: "",
    nominal_id: "",
  });
  const [bulkText, setBulkText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const students = useMemo(() => {
    if (!debounced) return all;
    const q = debounced.toLowerCase();
    return all.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        String(s.nationalId).includes(q) ||
        String(s.nominalId).includes(q)
    );
  }, [all, debounced]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get("/students");
        setAll(res.data.data);
      } catch {
        toast({
          title: "Error",
          description: "Failed to load students",
          variant: "destructive",
          color: "#f44336",
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [toast]);

  const open = (m: Mode, s?: Student) => {
    setMode(m);
    if (s) setSelected(s);
    else setSelected(null);
    setForm({
      name: s?.name || "",
      national_id: s ? String(s.nationalId) : "",
      nominal_id: s ? String(s.nominalId) : "",
    });
    setBulkText("");
  };

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await api.get("/students");
      setAll(res.data.data);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive",
        color: "#f44336",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "bulk") {
        await api.post("/students/bulk", {
          students: bulkText
            .split("\n")
            .filter(Boolean)
            .map((line) => {
              const [name, national_id, nominal_id] = line.split(",");
              return {
                name: name.trim(),
                national_id: Number(national_id),
                nominal_id: Number(nominal_id),
              };
            }),
        });
        toast({ title: "Students imported", color: "#4caf50" });
      } else if (mode === "edit" && selected) {
        await api.patch(`/students/${selected.id}`, { name: form.name });
        toast({ title: "Student updated", color: "#4caf50" });
      } else if (mode === "create") {
        await api.post("/students/bulk", {
          students: [
            {
              name: form.name,
              national_id: Number(form.national_id),
              nominal_id: Number(form.nominal_id),
            },
          ],
        });
        toast({ title: "Student added", color: "#4caf50" });
      }
      setMode(null);
      await refresh();
    } catch {
      toast({
        title: "Error",
        description: "Operation failed",
        variant: "destructive",
        color: "#f44336",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (id: string) => {
    try {
      await api.delete(`/students/${id}`);
      toast({ title: "Student deleted", color: "#4caf50" });
      await refresh();
    } catch {
      toast({
        title: "Error",
        description: "Could not delete student",
        variant: "destructive",
        color: "#f44336",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Students</h1>
          <p className="text-sm text-muted-foreground">
            Manage student records and perform bulk imports.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-8 w-72"
              placeholder="Search by name, national or nominal ID..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={() => open("bulk")}>
            <UploadCloud className="h-4 w-4 mr-2" />
            Bulk Import
          </Button>
          <Button onClick={() => open("create")}>Add Student</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            All Students
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Name</TableHead>
                  <TableHead>National ID</TableHead>
                  <TableHead>Nominal ID</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      <Loader2 className="h-5 w-5 animate-spin inline-block mr-2" />
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : students.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No students found.
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{s.nationalId}</TableCell>
                      <TableCell>{s.nominalId}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Edit"
                            onClick={() => open("edit", s)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="icon"
                                aria-label="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-gray-100">
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete student?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => onDelete(s.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!mode} onOpenChange={(o) => !o && setMode(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {mode === "create" && "Add Student"}
              {mode === "edit" && "Edit Student"}
              {mode === "bulk" && "Bulk Import"}
            </DialogTitle>
            <DialogDescription>
              {mode === "bulk"
                ? "Paste CSV lines in the format: name,national_id,nominal_id"
                : "Provide the student details below."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit} className="space-y-4">
            {mode === "bulk" ? (
              <div className="space-y-2">
                <Label htmlFor="bulk">CSV</Label>
                <textarea
                  id="bulk"
                  className="w-full min-h-[140px] rounded-md border bg-background p-2 text-sm"
                  placeholder="Name,National Id,Nominal Id"
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  required
                />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="national">National ID</Label>
                  <Input
                    id="national"
                    inputMode="numeric"
                    value={form.national_id}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, national_id: e.target.value }))
                    }
                    required
                    disabled={mode === "edit"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nominal">Nominal ID</Label>
                  <Input
                    id="nominal"
                    inputMode="numeric"
                    value={form.nominal_id}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, nominal_id: e.target.value }))
                    }
                    required
                    disabled={mode === "edit"}
                  />
                </div>
              </>
            )}

            <DialogFooter>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : mode === "bulk" ? (
                  "Import"
                ) : (
                  "Save"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
