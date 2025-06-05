"use client";

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
import { CalendarIcon, Check, Eye, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getContactResponses, updateContactResponseStatus } from "@/lib/api";
import { ContactFormResponse } from "@/lib/types";

export default function ContactResponses() {
  const [responses, setResponses] = useState<ContactFormResponse[]>([]);
  const [filteredResponses, setFilteredResponses] = useState<
    ContactFormResponse[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResponse, setSelectedResponse] =
    useState<ContactFormResponse | null>(null);
  const [visibilityFilter, setVisibilityFilter] = useState<
    "all" | "visible" | "hidden"
  >("all");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

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

  // Fetch contact responses
  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const data = await getContactResponses();
        setResponses(data);
        setFilteredResponses(data);
      } catch (error) {
        console.error("Failed to fetch contact responses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResponses();
  }, []);

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
          response.phone.toLowerCase().includes(term)
      );
    }

    // Apply visibility filter
    if (visibilityFilter !== "all") {
      result = result.filter((response) =>
        visibilityFilter === "visible" ? !response.hide : response.hide
      );
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
  }, [responses, searchTerm, visibilityFilter, startDate, endDate]);

  // Toggle hide status
  const toggleHideStatus = async (id: number, currentHideStatus: boolean) => {
    try {
      await updateContactResponseStatus(id.toString(), !currentHideStatus);

      // Update local state
      setResponses((prevResponses) =>
        prevResponses.map((response) =>
          response.id === id
            ? { ...response, hide: !currentHideStatus }
            : response
        )
      );
    } catch (error) {
      console.error("Failed to update response status:", error);
    }
  };

  // Clear date filters
  const clearDateFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Contact Form Responses</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by name, email or phone"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Visibility filter */}
        <Select
          value={visibilityFilter}
          onValueChange={(value) =>
            setVisibilityFilter(value as "all" | "visible" | "hidden")
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by visibility" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All responses</SelectItem>
            <SelectItem value="visible">Visible only</SelectItem>
            <SelectItem value="hidden">Hidden only</SelectItem>
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
          Showing {filteredResponses.length} of {responses.length} responses
        </p>
      </div>

      {/* Table */}
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Loading responses...
                </TableCell>
              </TableRow>
            ) : filteredResponses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No responses found
                </TableCell>
              </TableRow>
            ) : (
              filteredResponses.map((response) => (
                <TableRow
                  key={response.id}
                  className={response.hide ? "opacity-50" : ""}
                >
                  <TableCell className="font-medium">{response.name}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {response.message}
                  </TableCell>
                  <TableCell>{formatDateDMY(response.created_at)}</TableCell>
                  <TableCell>
                    {response.hide ? (
                      <Badge variant="outline">Hidden</Badge>
                    ) : (
                      <Badge>Visible</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          toggleHideStatus(response.id, response.hide)
                        }
                        title={
                          response.hide ? "Show response" : "Hide response"
                        }
                      >
                        <Check
                          className={`h-4 w-4 ${
                            response.hide ? "text-gray-400" : "text-green-500"
                          }`}
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedResponse(response)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contact Response Details</DialogTitle>
          </DialogHeader>

          {selectedResponse && (
            <div className="space-y-4">
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <div className="font-medium text-gray-500">Name:</div>
                <div>{selectedResponse.name}</div>

                <div className="font-medium text-gray-500">Email:</div>
                <div>{selectedResponse.email}</div>

                <div className="font-medium text-gray-500">Phone:</div>
                <div>{selectedResponse.phone}</div>

                <div className="font-medium text-gray-500">Date:</div>
                <div>{formatDateDMY(selectedResponse.created_at)}</div>

                <div className="font-medium text-gray-500">Status:</div>
                <div>
                  {selectedResponse.hide ? (
                    <Badge variant="outline">Hidden</Badge>
                  ) : (
                    <Badge>Visible</Badge>
                  )}
                </div>
              </div>

              <div>
                <div className="font-medium text-gray-500 mb-2">Message:</div>
                <div className="p-3 bg-gray-50 rounded-md whitespace-pre-wrap">
                  {selectedResponse.message}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    toggleHideStatus(selectedResponse.id, selectedResponse.hide)
                  }
                >
                  {selectedResponse.hide ? "Show Response" : "Hide Response"}
                </Button>
                <Button onClick={() => setSelectedResponse(null)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
