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
import { X } from "lucide-react";

type ImageData = {
  url: string;
  alt: string;
};

export default function ProductImagesPage() {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [newImages, setNewImages] = useState<ImageData[]>([
    { url: "", alt: "" },
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<number | null>(null);
  const [editedImages, setEditedImages] = useState<{
    [key: number]: Partial<ProductImage>;
  }>({});
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

  const handleAddFields = () => {
    setNewImages([...newImages, { url: "", alt: "" }]);
  };

  const handleRemoveFields = (index: number) => {
    const updatedImages = newImages.filter((_, i) => i !== index);
    setNewImages(updatedImages);
  };

  const handleInputChange = (
    index: number,
    field: keyof ImageData,
    value: string
  ) => {
    const updatedImages = newImages.map((image, i) => {
      if (i === index) {
        return { ...image, [field]: value };
      }
      return image;
    });
    setNewImages(updatedImages);
  };

  const handleAddNew = async () => {
    try {
      for (const newImage of newImages) {
        await createProductImage({ ...newImage, productId: Number(id) });
      }
      setIsDialogOpen(false);
      setNewImages([]); // Reset the array of new images
      await fetchImages();
    } catch (error) {
      console.error("Error creating product images:", error);
    }
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
              Add New Images
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Images</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {newImages.map((image, index) => (
                <div key={index} className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Image {index + 1}
                    </span>
                    {index > 0 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveFields(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <Input
                    placeholder="Image URL"
                    value={image.url}
                    onChange={(e) =>
                      handleInputChange(index, "url", e.target.value)
                    }
                  />
                  <Input
                    placeholder="Alt Text"
                    value={image.alt}
                    onChange={(e) =>
                      handleInputChange(index, "alt", e.target.value)
                    }
                  />
                </div>
              ))}
              <Button onClick={handleAddFields} variant="outline">
                <Plus className="mr-2 h-4 w-4" /> Add Another Image
              </Button>
              <Button onClick={handleAddNew}>Add Images</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {images.length === 0 && (
        <div className="flex flex-col h-[80vh] items-center justify-center gap-4">
          <h1 className="text-5xl"> NO IMAGES FOR THIS PRODUCT</h1>
          <div className="w-full bg-red-700 h-[3px] max-w-[700px]"></div>
          <h2 className="text-2xl"> Add Images Please</h2>
        </div>
      )}
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
