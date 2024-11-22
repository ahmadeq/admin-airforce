"use client";
import { useEffect, useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RoundSpinner } from "@/components/ui/spinner";
import { getCoupons, createCoupon, updateCoupon } from "@/lib/api";
import { Coupon } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { couponSchema, CouponFormValues } from "@/lib/schema";

export default function Home() {
  const [fetchStates, setFetchStates] = useState({
    loading: false,
    error: null,
  });
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
  });

  const handleCreateCoupons: SubmitHandler<CouponFormValues> = async (data) => {
    const quantity = data.quantity;
    const coupons = [];

    for (let i = 0; i < quantity; i++) {
      const uniqueCode = `${data.code}-${uuidv4().slice(-4)}`;
      const newCoupon = {
        amount: data.amount,
        maxDiscount: data.max,
        minPurchase: data.min,
        code: uniqueCode,
        isPercentage: data.is_percentage ? true : false,
      };
      coupons.push(newCoupon);
    }

    console.log("Coupons to be created:", coupons);

    for (const coupon of coupons) {
      await createCoupon(coupon);
    }

    setIsDialogOpen(false);
    reset();
    window.location.reload();
  };

  const handleUpdateCoupon = async (id: number, status: string) => {
    try {
      await updateCoupon(id, status);
      setCoupons((prevCoupons) =>
        prevCoupons.map((coupon) =>
          coupon.id === id ? { ...coupon, status } : coupon
        )
      );
    } catch (error) {
      console.error("Failed to update coupon status:", error);
    }
  };

  useEffect(() => {
    const fetchCoupons = async () => {
      setFetchStates((prevState) => ({
        ...prevState,
        loading: true,
        error: null,
      }));
      try {
        const data = await getCoupons();
        setCoupons(data);
      } catch (error: any) {
        console.error("Failed to fetch Coupons:", error);
        setFetchStates((prevState) => ({
          ...prevState,
          error: error.message || "An unexpected error occurred",
        }));
      } finally {
        setFetchStates((prevState) => ({ ...prevState, loading: false }));
      }
    };

    fetchCoupons();
  }, []);

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Coupons</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create Coupons</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Coupons</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={handleSubmit(handleCreateCoupons)}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  placeholder="Enter coupon code"
                  {...register("code")}
                />
                {errors.code && (
                  <p className="text-red-600 text-sm">{errors.code.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  {...register("amount", { valueAsNumber: true })}
                />
                {errors.amount && (
                  <p className="text-red-600 text-sm">
                    {errors.amount.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="max">Max Discount</Label>
                <Input
                  id="max"
                  type="number"
                  placeholder="Enter max discount"
                  {...register("max", { valueAsNumber: true })}
                />
                {errors.max && (
                  <p className="text-red-600 text-sm">{errors.max.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="min">Min Purchase</Label>
                <Input
                  id="min"
                  type="number"
                  placeholder="Enter min purchase"
                  {...register("min", { valueAsNumber: true })}
                />
                {errors.min && (
                  <p className="text-red-600 text-sm">{errors.min.message}</p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Controller
                  name="is_percentage"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="is_percentage"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label htmlFor="is_percentage">Is Percentage</Label>
              </div>
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="Enter number of coupons to create"
                  {...register("quantity", { valueAsNumber: true })}
                />
                {errors.quantity && (
                  <p className="text-red-600 text-sm">
                    {errors.quantity.message}
                  </p>
                )}
              </div>
              <Button type="submit">Create</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Created At</TableHead>
            <TableHead>Discount</TableHead>
            <TableHead>Max Discount</TableHead>
            <TableHead>Min Purchase</TableHead>
            <TableHead>Is Percentage</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {coupons.map((coupon, index) => (
            <TableRow key={index}>
              <TableCell>
                {coupon.created_at ? coupon.created_at.slice(0, 10) : "Unknown"}
              </TableCell>
              <TableCell>{coupon.amount}</TableCell>
              <TableCell>{coupon.maxDiscount}</TableCell>
              <TableCell>{coupon.minPurchase}</TableCell>
              <TableCell>{coupon.isPercentage ? "Yes" : "No"}</TableCell>
              <TableCell>{coupon.code}</TableCell>
              <TableCell>
                <Select
                  defaultValue={coupon.status}
                  onValueChange={(value) =>
                    handleUpdateCoupon(coupon.id, value)
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AVAILABLE">AVAILABLE</SelectItem>
                    <SelectItem value="GIFTED">GIFTED</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
