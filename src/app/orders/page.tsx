"use client";

import { useEffect, useState } from "react";
import { RoundSpinner } from "@/components/ui/spinner";
import { getOrders, updateOrderStatus } from "@/lib/api";
import { Order } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function Home() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [fetchStates, setFetchStates] = useState({
    loading: false,
    error: null,
  });
  const [statusFilter, setStatusFilter] = useState<Order["status"] | "ALL">(
    "ALL"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [searchTerm, setSearchTerm] = useState("");

  const handleUpdateStatus = async (
    orderId: number,
    newStatus: Order["status"]
  ) => {
    console.log(`Updating order ${orderId} to status ${newStatus}`);
    await updateOrderStatus(orderId, newStatus);
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  useEffect(() => {
    const fetchOrders = async () => {
      setFetchStates((prevState) => ({
        ...prevState,
        loading: true,
        error: null,
      }));
      try {
        const data = await getOrders();
        setOrders(data);
        setFilteredOrders(data);
      } catch (error: any) {
        console.error("Failed to fetch orders:", error);
        setFetchStates((prevState) => ({
          ...prevState,
          error: error.message || "An unexpected error occurred",
        }));
      } finally {
        setFetchStates((prevState) => ({ ...prevState, loading: false }));
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    let result = [...orders];

    if (statusFilter !== "ALL") {
      result = result.filter((order) => order.status === statusFilter);
    }

    if (searchTerm) {
      result = result.filter((order) =>
        order.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    result.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    setFilteredOrders(result);
  }, [orders, statusFilter, sortOrder, searchTerm]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0]; // Returns YYYY-MM-DD
  };

  if (fetchStates.loading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        <RoundSpinner size="xxl" />
      </div>
    );
  }

  if (fetchStates.error) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        <h1 className="text-center text-3xl text-red-700">
          Error: {fetchStates.error}
        </h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-10">
      <h1 className="text-2xl font-bold mb-6">Orders</h1>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Select
          value={statusFilter}
          onValueChange={(value) =>
            setStatusFilter(value as Order["status"] | "ALL")
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="PLACED">PLACED</SelectItem>
            <SelectItem value="SHIPPING">SHIPPING</SelectItem>
            <SelectItem value="FINISHED">FINISHED</SelectItem>
            <SelectItem value="CANCELED">CANCELED</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={sortOrder}
          onValueChange={(value) => setSortOrder(value as "asc" | "desc")}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Newest First</SelectItem>
            <SelectItem value="asc">Oldest First</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder="Search by name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-[300px]"
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Created At</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredOrders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{formatDate(order.created_at)}</TableCell>
              <TableCell>{order.name}</TableCell>
              <TableCell>{order.total} JD</TableCell>
              <TableCell>
                <Select
                  defaultValue={order.status}
                  onValueChange={(value) =>
                    handleUpdateStatus(order.id, value as Order["status"])
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PLACED">PLACED</SelectItem>
                    <SelectItem value="SHIPPING">SHIPPING</SelectItem>
                    <SelectItem value="FINISHED">FINISHED</SelectItem>
                    <SelectItem value="CANCELED">CANCELED</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Link href={`/orders/${order.id}`}>
                  <Button variant="outline">View</Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
