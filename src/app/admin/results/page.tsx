"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { FileDown, Loader2, Search } from "lucide-react";
import { api } from "@/lib/api";
import * as XLSX from "xlsx";

type Exam = { id: string; title: string };
type Result = { id: string; studentName: string; score: number };

// Section type to Arabic mapping
const SECTION_TYPE_AR = {
  multitasking_coordination_test: "اختبار التنسيق المتعدد المهام",
  multiple_meters_needles: "اختبار مؤشرات العدادات المتعددة",
  cube_rotation_test: "اختبار تدوير المكعب",
  dice_folding_test: "اختبار طي النرد",
  running_memory_span_test: "اختبار مدى الذاكرة الجارية",
  dice_arithmetic_test: "اختبار حساب النرد",
  multitasking_pointing_test: "اختبار التوجيه المتعدد المهام",
  spacial_awareness: "اختبار الوعي المكاني",
  attention_and_alertness: "اختبار الانتباه والتيقظ",
  focused_attention: "اختبار الانتباه المركز",
};

export default function ResultsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [error, setError] = useState("");
  const [examId, setExamId] = useState<string>("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    api
      .get("/exams")
      .then((res) => setExams(res.data))
      .catch(() => setError("Failed to load exams"));
  }, []);

  const fetchResults = (id: string) => {
    setLoading(true);
    setError("");
    api
      .get(`/exam-results/${id}`)
      .then((res) => {
        // Map nested API response to flat Result[]
        const mapped = Array.isArray(res.data)
          ? res.data.map((r: any) => ({
              id: r.id,
              studentName: r.student?.name ?? "",
              score: r.score,
            }))
          : [];
        setResults(mapped);
      })
      .catch(() => setError("Failed to load results"))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    if (examId) fetchResults(examId);
  }, [examId]);

  const filtered = useMemo(() => {
    const t = q.toLowerCase();
    return results.filter((r) => r?.studentName?.toLowerCase().includes(t));
  }, [q, results]);

  const stats = useMemo(() => {
    if (results.length === 0) return null;
    const scores = results.map((r) => r.score);
    const sum = scores.reduce((a, b) => a + b, 0);
    const avg = sum / scores.length;
    const max = Math.max(...scores);
    const min = Math.min(...scores);
    const passRate =
      (scores.filter((s) => s >= 50).length / scores.length) * 100;
    return { avg, max, min, passRate };
  }, [results]);

  const handleExport = async () => {
    if (!examId) return;
    setExporting(true);
    try {
      const res = await api.get(`/exam-results/${examId}/with-sections-json`);
      const { sectionTypes, attempts } = res.data;
      // Build columns: name, national id, score, ...section names (arabic)
      const sectionHeaders = sectionTypes.map(
        (type: string) =>
          SECTION_TYPE_AR[type as keyof typeof SECTION_TYPE_AR] || type
      );
      const headers = ["الاسم", "الرقم الوطني", "الدرجة", ...sectionHeaders];
      const rows = attempts.map((a: any) => {
        return [
          a.student.name,
          a.student.nationalId,
          a.score,
          ...(a.sectionContributions || []).map((s: number) => s),
        ];
      });
      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Results");
      const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([wbout], { type: "application/octet-stream" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `exam-results-${examId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast({ title: "تم تصدير النتائج إلى Excel" });
    } catch {
      toast({
        title: "Error",
        description: "Could not export CSV",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Exam Results</h1>
          <p className="text-sm text-muted-foreground">
            View and export results for a selected exam.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="min-w-[240px]">
            <Select value={examId} onValueChange={setExamId}>
              <SelectTrigger>
                <SelectValue placeholder="Select an exam" />
              </SelectTrigger>
              <SelectContent>
                {exams.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleExport} disabled={!examId || exporting}>
            {exporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Exporting...
              </>
            ) : (
              <>
                <FileDown className="h-4 w-4 mr-2" /> Export CSV
              </>
            )}
          </Button>
        </div>
      </div>

      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">
              {stats.avg.toFixed(1)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Max</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">
              {stats.max}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Min</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">
              {stats.min}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pass rate</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">
              {stats.passRate.toFixed(0)}%
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">Results</CardTitle>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by student..."
              className="pl-8 w-64"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              disabled={!examId}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!examId ? (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Select an exam to view results.
                    </TableCell>
                  </TableRow>
                ) : loading ? (
                  <TableRow>
                    <TableCell colSpan={2} className="h-24 text-center">
                      <Loader2 className="h-5 w-5 animate-spin inline-block mr-2" />
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">
                        {r.studentName}
                      </TableCell>
                      <TableCell>{r.score}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
