"use client";

import * as XLSX from "xlsx";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Eye, Search, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { JoinFormResponse } from "@/lib/types";
import { getJoinFormResponses } from "@/lib/api";

export default function JoinUsMembers() {
  const [responses, setResponses] = useState<JoinFormResponse[]>([]);
  const [filteredResponses, setFilteredResponses] = useState<
    JoinFormResponse[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResponse, setSelectedResponse] =
    useState<JoinFormResponse | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [majorFilter, setMajorFilter] = useState<string>("all");
  const [editingNote, setEditingNote] = useState<string>("");

  function formatDateDMY(dateString: string) {
    if (!dateString) return "";
    // Remove microseconds for compatibility
    const cleaned = dateString.replace(/\.(\d{3})\d+/, ".$1");
    const date = new Date(cleaned);
    if (isNaN(date.getTime())) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
  // Fetch join form responses
  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const data = await getJoinFormResponses();
        setResponses(data);
        setFilteredResponses(data);
      } catch (error) {
        console.error("Failed to fetch join form responses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResponses();
  }, []);

  // Get unique majors for filtering
  // @ts-expect-error ignore this
  const uniqueMajors = [...new Set(responses.map((r) => r.major))].sort();

  // Apply filters when any filter changes
  useEffect(() => {
    let result = [...responses];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (response) =>
          response.name.toLowerCase().includes(term) ||
          response.email.toLowerCase().includes(term) ||
          response.phone.toLowerCase().includes(term) ||
          response.university.toLowerCase().includes(term)
      );
    }

    // Apply major filter
    if (majorFilter !== "all") {
      result = result.filter((response) => response.major === majorFilter);
    }

    // Apply date range filter
    if (startDate) {
      result = result.filter(
        (response) => new Date(response.created_at) >= startDate
      );
    }

    if (endDate) {
      // Add one day to include the end date fully
      const endDatePlusOne = new Date(endDate);
      endDatePlusOne.setDate(endDatePlusOne.getDate() + 1);

      result = result.filter(
        (response) => new Date(response.created_at) < endDatePlusOne
      );
    }

    setFilteredResponses(result);
  }, [responses, searchTerm, majorFilter, startDate, endDate]);

  // Clear date filters
  const clearDateFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };

  // Save note
  const saveNote = async (id: number, note: string) => {
    try {
      // This would be replaced with your actual API call
      console.log(`Saving note for response ${id}: ${note}`);

      // Update local state
      setResponses((prevResponses) =>
        prevResponses.map((response) =>
          response.id === id ? { ...response, note } : response
        )
      );
      setSelectedResponse((prev) => (prev ? { ...prev, note } : null));
      setEditingNote("");
    } catch (error) {
      console.error("Failed to save note:", error);
    }
  };

  const exportToExcel = () => {
    // Prepare data for export (you can customize columns as needed)
    const data = filteredResponses.map((response) => ({
      Name: response.name,
      Age: response.age,
      University: response.university,
      Major: response.major,
      Email: response.email,
      Phone: response.phone,
      Date: formatDateDMY(response.created_at),
      Skills: response.skills,
      About: response.about,
      "Why Join Us": response.why,
      Notes: response.note,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Applications");

    XLSX.writeFile(workbook, "join-us-applications.xlsx");
  };

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Join Us Applications</h1>
        <Button
          onClick={exportToExcel}
          variant="outline"
          className="bg-green-700 border-2 text-white border-green-600 hover:text-green-900"
        >
          Export to Excel
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by name, email, phone or university"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Major filter */}
        <Select
          value={majorFilter}
          onValueChange={(value) => setMajorFilter(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by major" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All majors</SelectItem>
            {uniqueMajors.map((major) => (
              <SelectItem key={major} value={major}>
                {major}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date range filter */}
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[150px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : "Start date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[150px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : "End date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {(startDate || endDate) && (
            <Button variant="ghost" size="icon" onClick={clearDateFilters}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4">
        <p className="text-sm text-gray-500">
          Showing {filteredResponses.length} of {responses.length} applications
        </p>
      </div>

      {/* Table */}
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>University</TableHead>
              <TableHead>Major</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading applications...
                </TableCell>
              </TableRow>
            ) : filteredResponses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No applications found
                </TableCell>
              </TableRow>
            ) : (
              filteredResponses.map((response) => (
                <TableRow key={response.id}>
                  <TableCell className="font-medium">{response.name}</TableCell>
                  <TableCell>{response.age}</TableCell>
                  <TableCell>{response.university}</TableCell>
                  <TableCell>{response.major}</TableCell>
                  <TableCell>{formatDateDMY(response.created_at)}</TableCell>

                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedResponse(response)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Detail Dialog */}
      <Dialog
        open={!!selectedResponse}
        onOpenChange={(open) => !open && setSelectedResponse(null)}
      >
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>

          {selectedResponse && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-medium mb-3">
                    Personal Information
                  </h3>
                  <div className="space-y-2">
                    <div className="grid grid-cols-[120px_1fr] gap-2">
                      <div className="font-medium text-gray-500">Name:</div>
                      <div>{selectedResponse.name}</div>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-2">
                      <div className="font-medium text-gray-500">Age:</div>
                      <div>{selectedResponse.age}</div>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-2">
                      <div className="font-medium text-gray-500">Email:</div>
                      <div>{selectedResponse.email}</div>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-2">
                      <div className="font-medium text-gray-500">Phone:</div>
                      <div>{selectedResponse.phone}</div>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-2">
                      <div className="font-medium text-gray-500">Date:</div>
                      <div>{formatDateDMY(selectedResponse.created_at)}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">
                    Academic Information
                  </h3>
                  <div className="space-y-2">
                    <div className="grid grid-cols-[120px_1fr] gap-2">
                      <div className="font-medium text-gray-500">
                        University:
                      </div>
                      <div>{selectedResponse.university}</div>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-2">
                      <div className="font-medium text-gray-500">Major:</div>
                      <div>{selectedResponse.major}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Skills</h3>
                <div className="p-3 bg-gray-50 rounded-md whitespace-pre-wrap">
                  {selectedResponse.skills}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">About</h3>
                <div className="p-3 bg-gray-50 rounded-md whitespace-pre-wrap">
                  {selectedResponse.about}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Why Join Us</h3>
                <div className="p-3 bg-gray-50 rounded-md whitespace-pre-wrap">
                  {selectedResponse.why}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Notes</h3>
                {editingNote !== "" ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editingNote}
                      onChange={(e) => setEditingNote(e.target.value)}
                      placeholder="Add your notes here..."
                      className="min-h-[100px]"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setEditingNote("")}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() =>
                          saveNote(selectedResponse.id, editingNote)
                        }
                      >
                        Save Note
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="p-3 bg-gray-50 rounded-md whitespace-pre-wrap min-h-[60px]">
                      {selectedResponse.note || "No notes added yet."}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setSelectedResponse(null)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
