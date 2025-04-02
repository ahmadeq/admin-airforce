"use client";

import { useEffect, useState } from "react";
import { RoundSpinner } from "@/components/ui/spinner";
import {
  getOrderById,
  updateOrderStatus,
  getOrderItemsByCartId,
  updateOrderPaymentMethod,
  getItemVariantByVariantId,
} from "@/lib/api";
import { Order, OrderItem } from "@/lib/types";
import { useParams } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
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

export default function Home() {
  const [fetchStates, setFetchStates] = useState({
    loading: false,
    error: null,
  });
  const { id } = useParams<{ id: string }>();
  const [orderInfo, setOrderInfo] = useState<Order>({
    id: 1,
    payment_method: "COD",
    status: "PLACED",
    total: 30,
    address: "Wait..", // Corrected syntax
    city: "wait..",
    created_at: "2024-11-21 23:11:43.931319+00",
    phone: "123456789",
    cartId: 1,
    notes: "No notes",
    name: "Wait..",
  });
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  const handleUpdateStatus = async (
    orderId: number,
    newStatus: Order["status"]
  ) => {
    console.log(`Updating order ${orderId} to status ${newStatus}`);
    await updateOrderStatus(orderId, newStatus);
  };

  const handleUpdatePaymentMethod = async (
    orderId: number,
    newMethod: Order["payment_method"]
  ) => {
    console.log(`Updating order ${orderId} to method ${newMethod}`);
    await updateOrderPaymentMethod(orderId, newMethod);
  };

  useEffect(() => {
    const fetchOrderData = async () => {
      setFetchStates((prevState) => ({
        ...prevState,
        loading: true,
        error: null,
      }));
      try {
        const orderInfoData = await getOrderById(Number(id));
        console.log("Order Info Data:", orderInfoData);
        const orderItemsData = await getOrderItemsByCartId(
          orderInfoData[0]?.cartId
        );

        const orderItemsWithVariants = await Promise.all(
          orderItemsData.map(async (item) => {
            const variantName = await getItemVariantByVariantId(item.variantId);
            return { ...item, variantName };
          })
        );

        setOrderInfo(orderInfoData[0]);
        setOrderItems(orderItemsWithVariants);
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

    fetchOrderData();
  }, [id]);

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
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Order #{orderInfo?.id}</h1>

      <Card>
        <CardHeader>
          <CardTitle>Order Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="font-semibold">Status</dt>
              <dd>
                <Select
                  defaultValue={orderInfo?.status}
                  onValueChange={(value) =>
                    handleUpdateStatus(orderInfo?.id, value as Order["status"])
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
              </dd>
            </div>
            <div>
              <dt className="font-semibold">Payment Method</dt>
              <dd>
                <Select
                  defaultValue={orderInfo?.payment_method}
                  onValueChange={(value) =>
                    handleUpdatePaymentMethod(
                      orderInfo?.id,
                      value as Order["payment_method"]
                    )
                  }
                  disabled={true}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COD">COD</SelectItem>
                    <SelectItem value="CLIQ">CLIQ</SelectItem>
                    <SelectItem value="OTHER">OTHER</SelectItem>
                  </SelectContent>
                </Select>
              </dd>
            </div>
            <div>
              <dt className="font-semibold">Total</dt>
              <dd>{orderInfo?.total.toFixed(2)} JD</dd>
            </div>
            <div>
              <dt className="font-semibold">Date</dt>
              <dd>{format(new Date(orderInfo?.created_at), "yyyy-MM-dd")}</dd>
            </div>
            <div>
              <dt className="font-semibold">Address</dt>
              <dd>
                {orderInfo?.address}, {orderInfo?.city}
              </dd>
            </div>
            <div>
              <dt className="font-semibold">Phone</dt>
              <dd>{orderInfo?.phone}</dd>
            </div>
            <div>
              <dt className="font-semibold">Cart ID</dt>
              <dd>{orderInfo?.cartId}</dd>
            </div>
            <div>
              <dt className="font-semibold">Notes</dt>
              <dd>{orderInfo?.notes || "No notes"}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Variant</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={50}
                      height={50}
                      className="rounded-md"
                    />
                  </TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.variantName}</TableCell>
                  <TableCell>{item.price.toFixed(2)} JD</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
