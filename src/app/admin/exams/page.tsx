"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Plus, Trash2, BookOpenCheck, Search } from "lucide-react";
import { api } from "@/lib/api";
import { ExamSectionType } from "@/lib/enums";

type Exam = {
  id: string;
  title: string;
  description?: string;
  sectionsCount?: number;
};

// Use enum for section types
const sectionTypeOptions: ExamSectionType[] = Object.values(ExamSectionType);

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [addSectionsLoading, setAddSectionsLoading] = useState(false);
  const [addSectionsError, setAddSectionsError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sectionsOpen, setSectionsOpen] = useState(false);
  const [currentExamId, setCurrentExamId] = useState<string | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<ExamSectionType[]>([]);
  const [query, setQuery] = useState("");
  const { toast } = useToast();

  const filtered = useMemo(() => {
    if (!query) return exams;
    const q = query.toLowerCase();
    return exams.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        (e.description || "").toLowerCase().includes(q)
    );
  }, [exams, query]);

  const fetchExams = () => {
    setLoading(true);
    setError("");
    api
      .get("/exams")
      .then((res) => setExams(res.data))
      .catch(() => setError("Failed to load exams"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError("");
    try {
      await api.post("/exams", { title, description });
      setDialogOpen(false);
      setTitle("");
      setDescription("");
      toast({ title: "Exam created" });
      fetchExams();
    } catch (err: any) {
      setCreateError(err?.response?.data?.message || "Could not create exam");
    } finally {
      setCreating(false);
    }
  };

  const handleAddSections = async () => {
    if (!currentExamId || selectedTypes.length === 0) return;
    setAddSectionsLoading(true);
    setAddSectionsError("");
    try {
      await api.post(
        `/exams/${currentExamId}/sections/bulk`,
        selectedTypes.map((type) => ({ type }))
      );
      toast({ title: "Sections added" });
      setSectionsOpen(false);
      setSelectedTypes([]);
      fetchExams();
    } catch (err: any) {
      setAddSectionsError(
        err?.response?.data?.message || "Failed to add sections"
      );
    } finally {
      setAddSectionsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this exam?")) return;
    try {
      await api.delete(`/exams/${id}`);
      toast({ title: "Exam deleted" });
      fetchExams();
    } catch {
      toast({
        title: "Error",
        description: "Could not delete exam",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Exams</h1>
          <p className="text-sm text-muted-foreground">
            Create exams and manage their sections.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search exams..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-8 w-64"
            />
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Exam
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-5 w-40 bg-muted rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-4 w-64 bg-muted rounded mb-2" />
                <div className="h-4 w-40 bg-muted rounded" />
              </CardContent>
              <CardFooter>
                <div className="h-9 w-24 bg-muted rounded" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No exams found.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((exam) => (
            <Card key={exam.id} className="flex flex-col">
              <CardHeader className="space-y-1">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <BookOpenCheck className="h-4 w-4 text-muted-foreground" />
                  {exam.title}
                </CardTitle>
                {exam.description ? (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {exam.description}
                  </p>
                ) : null}
              </CardHeader>
              <CardContent className="flex-1">
                <Badge variant="secondary">exam id: {exam?.id}</Badge>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Link href={`/admin/exams/${exam.id}`} className="w-full">
                  <Button
                    variant="secondary"
                    className="w-full bg-gray-200 hover:border"
                  >
                    View Sections
                  </Button>
                </Link>
                <Button
                  className="w-full"
                  onClick={() => {
                    setCurrentExamId(exam.id);
                    setSectionsOpen(true);
                  }}
                >
                  Add Sections
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-white">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete exam?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will delete the exam and its sections.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(exam.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Exam</DialogTitle>
            <DialogDescription>Provide the exam details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Description</Label>
              <Textarea
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            {createError && (
              <div className="text-red-500 text-sm">{createError}</div>
            )}
            <DialogFooter>
              <Button type="submit" disabled={creating}>
                {creating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Create"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={sectionsOpen} onOpenChange={setSectionsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Sections</DialogTitle>
            <DialogDescription>
              Select section types to add to this exam.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 max-h-56 overflow-y-auto">
            {sectionTypeOptions.map((t) => (
              <label key={t} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={selectedTypes.includes(t)}
                  onCheckedChange={(c) =>
                    setSelectedTypes((prev) =>
                      c ? [...prev, t] : prev.filter((x) => x !== t)
                    )
                  }
                />
                <span>{t}</span>
              </label>
            ))}
          </div>
          {addSectionsError && (
            <div className="text-red-500 text-sm mt-2">{addSectionsError}</div>
          )}
          <DialogFooter>
            <Button
              onClick={handleAddSections}
              disabled={
                !currentExamId ||
                selectedTypes.length === 0 ||
                addSectionsLoading
              }
            >
              {addSectionsLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Add"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
