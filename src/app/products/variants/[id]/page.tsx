"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Trash, Save, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ProductVariant } from "@/lib/types";
import {
  getProductVariants,
  updateProductVariant,
  deleteProductVariant,
  createProductVariant,
} from "@/lib/api";
import { RoundSpinner } from "@/components/ui/spinner";

export default function ProductVariantsPage() {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [newVariant, setNewVariant] = useState({ size: "", stockQuantity: 0 });
  const [newBulkVariants, setNewBulkVariants] = useState({
    category: "",
    stockQuantity: 0,
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDialogBulkOpen, setIsDialogBulkOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [variantToDelete, setVariantToDelete] = useState<number | null>(null);
  const [editedVariants, setEditedVariants] = useState<{
    [key: number]: Partial<ProductVariant>;
  }>({});
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);

  const shoesSizes = Array.from({ length: 10 }, (_, i) => ({
    label: String(i + 36),
    value: String(i + 36),
  }));

  const apparelSizes = Array.from({ length: 10 }, (_, i) => ({
    label: String(i + 36),
    value: String(i + 36),
  }));

  const handleUpdate = async (variantId: number) => {
    const updatedVariant = editedVariants[variantId];
    if (updatedVariant) {
      setIsLoading(true);
      console.log("Updating variant:", variantId, updatedVariant);
      await updateProductVariant(variantId, updatedVariant);
      setEditedVariants((prev) => {
        const newEditedVariants = { ...prev };
        delete newEditedVariants[variantId];
        return newEditedVariants;
      });
      await fetchVariants();
    }
  };

  const handleDelete = (variantId: number) => {
    setVariantToDelete(variantId);
    setIsConfirmDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (variantToDelete !== null) {
      console.log("Deleting variant:", variantToDelete);
      await deleteProductVariant(variantToDelete);
      setVariants((prev) =>
        prev.filter((variant) => variant.id !== variantToDelete)
      );
      setIsConfirmDialogOpen(false);
      setVariantToDelete(null);
    }
  };

  const handleAddNew = async () => {
    console.log("Adding new variant:", newVariant);
    await createProductVariant({ ...newVariant, productId: Number(id) });
    setIsDialogOpen(false);
    setNewVariant({ size: "", stockQuantity: 100 });
    await fetchVariants();
  };

  const handleAddNewBulk = async () => {
    console.log("Adding new bulk variant:", newBulkVariants);
    const newVariants =
      newBulkVariants.category === "shoes" ? shoesSizes : apparelSizes;
    await Promise.all(
      newVariants.map((variant) =>
        createProductVariant({
          size: variant.label,
          stockQuantity: newBulkVariants.stockQuantity,
          productId: Number(id),
        })
      )
    );
    setIsDialogBulkOpen(false);
    setNewBulkVariants({ category: "", stockQuantity: 0 });
    await fetchVariants();
  };

  const fetchVariants = async () => {
    try {
      const data = await getProductVariants(Number(id));
      setVariants(data);
    } catch (error) {
      console.error("Error fetching variants:", error);
      toast({
        title: "Error",
        description: "Failed to load variant data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchVariants = async () => {
      try {
        const data = await getProductVariants(Number(id));
        setVariants(data);
      } catch (error) {
        console.error("Error fetching variants:", error);
        toast({
          title: "Error",
          description: "Failed to load variant data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    if (id) {
      fetchVariants();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        <RoundSpinner size="xxl" />
      </div>
    );
  }

  if (!variants) {
    return (
      <div className="flex justify-center items-center h-screen">
        Product variants not found
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-stretch">
        <h1 className="text-2xl font-bold mb-4">Product Variants</h1>
        <div className="flex gap-4">
          <Dialog open={isDialogBulkOpen} onOpenChange={setIsDialogBulkOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="mb-4 bg-black text-white hover:bg-black hover:text-white"
              >
                <Plus className="mr-2 h-4 w-4" /> Bulk Add New Variants
              </Button>
            </DialogTrigger>
            <DialogOverlay />
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Variant</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <RadioGroup
                  defaultValue="shoes"
                  onValueChange={(value) =>
                    setNewBulkVariants({
                      ...newBulkVariants,
                      category: value,
                    })
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="shoes" id="shoes" />
                    <Label htmlFor="shoes">Shoes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="apparel" id="apparel" />
                    <Label htmlFor="apparel">Apparel</Label>
                  </div>
                </RadioGroup>

                <Input
                  type="number"
                  placeholder="Stock Quantity"
                  value={newBulkVariants.stockQuantity}
                  onChange={(e) =>
                    setNewBulkVariants({
                      ...newBulkVariants,
                      stockQuantity: Number.parseInt(e.target.value),
                    })
                  }
                />
                <Button
                  className="bg-black text-white border-black border hover:bg-white hover:text-black"
                  onClick={handleAddNewBulk}
                >
                  Add Bulk Variants
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="expandIcon"
                Icon={Plus}
                iconPlacement="right"
                className="mb-4 bg-black text-white hover:bg-black hover:text-white"
              >
                Add New Variant
              </Button>
            </DialogTrigger>
            <DialogOverlay />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Variant</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Input
                  placeholder="Size"
                  value={newVariant.size}
                  onChange={(e) =>
                    setNewVariant({ ...newVariant, size: e.target.value })
                  }
                />
                <Input
                  type="number"
                  placeholder="Stock Quantity"
                  value={newVariant.stockQuantity}
                  onChange={(e) =>
                    setNewVariant({
                      ...newVariant,
                      stockQuantity: parseInt(e.target.value),
                    })
                  }
                />
                <Button
                  className=" bg-black text-white border-black border hover:bg-white hover:text-black"
                  onClick={handleAddNew}
                >
                  Add Variant
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {variants.length === 0 && (
        <div className="flex flex-col h-[80vh] items-center justify-center gap-4">
          <h1 className="text-5xl"> NO VARIANTS FOR THIS PRODUCT</h1>
          <div className="w-full bg-red-700 h-[3px] max-w-[700px]"></div>
          <h2 className="text-2xl"> Add Variants Please</h2>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {variants.map((variant) => (
          <div key={variant.id} className="border p-4 rounded-lg">
            <Label>Size</Label>

            <Input
              className="mb-2"
              placeholder="Size"
              defaultValue={variant.size}
              onChange={(e) =>
                setEditedVariants((prev) => ({
                  ...prev,
                  [variant.id]: { ...prev[variant.id], size: e.target.value },
                }))
              }
            />
            <Label>Stock Quantity</Label>
            <Input
              className="mb-2"
              type="number"
              placeholder="Stock Quantity"
              defaultValue={variant.stockQuantity}
              onChange={(e) =>
                setEditedVariants((prev) => ({
                  ...prev,
                  [variant.id]: {
                    ...prev[variant.id],
                    stockQuantity: parseInt(e.target.value),
                  },
                }))
              }
            />
            <div className="flex justify-between">
              <Button
                variant="expandIcon"
                Icon={Save}
                iconPlacement="right"
                onClick={() => handleUpdate(variant.id)}
              >
                Save
              </Button>
              <Button
                variant="expandIcon"
                Icon={Trash}
                iconPlacement="right"
                className="bg-red-700 text-white hover:bg-red-800"
                onClick={() => handleDelete(variant.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogOverlay />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p>Are you sure you want to delete this variant?</p>
            <div className="flex justify-end gap-4">
              <Button onClick={() => setIsConfirmDialogOpen(false)}>No</Button>
              <Button className="bg-red-700 text-white" onClick={confirmDelete}>
                Yes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
