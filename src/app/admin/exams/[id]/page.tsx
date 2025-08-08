"use client";
import { ExamSectionType } from "@/lib/enums";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
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
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { api } from "@/lib/api";
import Link from "next/link";

// Use enum values directly as section type options
const sectionTypeOptions = Object.values(ExamSectionType);

type Section = { id: string; type: string };
type Exam = { id: string; title: string };

export default function ExamSectionsPage() {
  const params = useParams();
  const examId = params?.id as string;
  const [exam, setExam] = useState<Exam | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<null | "single" | "bulk">(null);
  const [type, setType] = useState("");
  const [bulk, setBulk] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  // Bulk add state
  const [selectedTypes, setSelectedTypes] = useState<ExamSectionType[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkError, setBulkError] = useState("");
  const { toast } = useToast();

  const fetchSections = () => {
    setLoading(true);
    setError("");
    api
      .get(`/exams/${examId}/sections`)
      .then((res) => setSections(res.data))
      .catch(() => setError("Failed to load sections"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (examId) fetchSections();
    // eslint-disable-next-line
  }, [examId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError("");
    try {
      await api.post(`/exams/${examId}/sections`, { type });
      toast({ title: "Section added" });
      setOpen(null);
      setType("");
      fetchSections();
    } catch (err: any) {
      setCreateError(
        err?.response?.data?.message || "Failed to create section"
      );
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this section?"))
      return;
    await api.delete(`/exams/${examId}/sections/${id}`);
    fetchSections();
  };

  const handleBulk = async () => {
    if (!examId || selectedTypes.length === 0) return;
    setBulkLoading(true);
    setBulkError("");
    try {
      const payload = selectedTypes.map((type) => ({ type }));
      await api.post(`/exams/${examId}/sections/bulk`, payload);
      toast({ title: "Sections added" });
      setOpen(null);
      setSelectedTypes([]);
      fetchSections();
    } catch (err: any) {
      setBulkError(err?.response?.data?.message || "Failed to add sections");
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Exam Sections</h1>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/exams"
            className="min-w-[120px] bg-black text-white  h-[40px] items-center justify-center flex border border-white rounded-lg"
          >
            Back
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Sections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={2} className="h-24 text-center">
                      <Loader2 className="h-5 w-5 animate-spin inline-block mr-2" />
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : sections.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No sections yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  sections.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.type}</TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete section?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(s.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={open === "single"}
        onOpenChange={(o) => !o && setOpen(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Section</DialogTitle>
            <DialogDescription>Add a single section by type.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              placeholder="Section type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
            />
            {createError && (
              <div className="text-red-500 text-sm">{createError}</div>
            )}
            <DialogFooter>
              <Button type="submit" disabled={createLoading}>
                {createLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Add"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bulk add dialog */}
    </div>
  );
}
