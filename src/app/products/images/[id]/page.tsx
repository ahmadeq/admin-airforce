"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash, Save, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ProductImage } from "@/lib/types";
import {
  getProductImages,
  updateProductImage,
  deleteProductImage,
  createProductImage,
} from "@/lib/api";
import { RoundSpinner } from "@/components/ui/spinner";

export default function ProductImagesPage() {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [newImage, setNewImage] = useState({ url: "", alt: "" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<number | null>(null);
  const [editedImages, setEditedImages] = useState<{ [key: number]: Partial<ProductImage> }>({});
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);

  const handleUpdate = async (imageId: number) => {
    const updatedImage = editedImages[imageId];
    if (updatedImage) {
      setIsLoading(true);
      console.log("Updating image:", imageId, updatedImage);
      await updateProductImage(imageId, updatedImage);
      setEditedImages((prev) => {
        const newEditedImages = { ...prev };
        delete newEditedImages[imageId];
        return newEditedImages;
      });
      await fetchImages();
    }
  };

  const handleDelete = (imageId: number) => {
    setImageToDelete(imageId);
    setIsConfirmDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (imageToDelete !== null) {
      console.log("Deleting image:", imageToDelete);
      await deleteProductImage(imageToDelete);
      setImages((prev) => prev.filter((image) => image.id !== imageToDelete));
      setIsConfirmDialogOpen(false);
      setImageToDelete(null);
    }
  };

  const handleAddNew = async () => {
    console.log("Adding new image:", newImage);
    await createProductImage({ ...newImage, productId: Number(id) });
    setIsDialogOpen(false);
    setNewImage({ url: "", alt: "" });
    await fetchImages();
  };

  const fetchImages = async () => {
    try {
      const data = await getProductImages(Number(id));
      setImages(data);
    } catch (error) {
      console.error("Error fetching product:", error);
      toast({
        title: "Error",
        description: "Failed to load product data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const data = await getProductImages(Number(id));
        setImages(data);
      } catch (error) {
        console.error("Error fetching product:", error);
        toast({
          title: "Error",
          description: "Failed to load product data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchImages();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
      <RoundSpinner size="xxl" />
    </div>
    );
  }

  if (!images) {
    return (
      <div className="flex justify-center items-center h-screen">
        Product not found
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-stretch">
        <h1 className="text-2xl font-bold mb-4">Product Images</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="expandIcon"
              Icon={Plus}
              iconPlacement="right"
              className="mb-4 bg-black text-white hover:bg-black hover:text-white"
            >
              Add New Image
            </Button>
          </DialogTrigger>
          <DialogOverlay />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Image</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                placeholder="Image URL"
                value={newImage.url}
                onChange={(e) =>
                  setNewImage({ ...newImage, url: e.target.value })
                }
              />
              <Input
                placeholder="Alt Text"
                value={newImage.alt}
                onChange={(e) =>
                  setNewImage({ ...newImage, alt: e.target.value })
                }
              />
              <Button onClick={handleAddNew}>Add Image</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image) => (
          <div key={image.id} className="border p-4 rounded-lg">
            <div className="mb-2">
              <Image
                src={image.url}
                alt={image.alt}
                width={150}
                height={150}
                className="rounded-md"
              />
            </div>
            <Input
              className="mb-2"
              placeholder="Image URL"
              defaultValue={image.url}
              onChange={(e) =>
                setEditedImages((prev) => ({
                  ...prev,
                  [image.id]: { ...prev[image.id], url: e.target.value },
                }))
              }
            />
            <Input
              className="mb-2"
              placeholder="Alt Text"
              defaultValue={image.alt}
              onChange={(e) =>
                setEditedImages((prev) => ({
                  ...prev,
                  [image.id]: { ...prev[image.id], alt: e.target.value },
                }))
              }
            />
            <div className="flex justify-between">
              <Button
                variant="expandIcon"
                Icon={Save}
                iconPlacement="right"
                onClick={() => handleUpdate(image.id)}
              >
                Save
              </Button>
              <Button
                variant="expandIcon"
                Icon={Trash}
                iconPlacement="right"
                className="bg-red-700 text-white hover:bg-red-800"
                onClick={() => handleDelete(image.id)}
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
            <p>Are you sure you want to delete this image?</p>
            <div className="flex justify-end gap-4">
              <Button onClick={() => setIsConfirmDialogOpen(false)}>No</Button>
              <Button className="bg-red-700 text-white" onClick={confirmDelete}>Yes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}