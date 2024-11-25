'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { Product , Category } from "@/lib/types"
import { getProductById , updateProduct, getCategories } from '@/lib/api'


export default function EditProductPage() {
  const {id} = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [product, setProduct] = useState<Product | null>(null)
  const [productAr, setProductAr] = useState<Product | null>(null)
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(Number(id))
        setProduct(data[0])
        setProductAr(data[1])
      } catch (error) {
        console.error('Error fetching product:', error)
        toast({
          title: "Error",
          description: "Failed to load product data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    const fetchCategories = async () => {
      try {
        const data = await getCategories()
        setCategories(data)
      } catch (error) {
        console.error('Error fetching categories:', error)
        toast({
          title: "Error",
          description: "Failed to load categories. Please try again.",
          variant: "destructive",
        })
      }
    }

    if (id) {
      fetchProduct()
    }
    fetchCategories()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      if (!product || !productAr) {
        throw new Error('Product not found')
      }
      await updateProduct(Number(id),[product,productAr])
      toast({
        title: "Success",
        description: "Product updated successfully",
      })
      router.push('/products')
    } catch (error) {
      console.error('Error updating product:', error)
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: keyof Product, value: string | number, isAr: boolean = false) => {
    if (isAr) {
      setProductAr(prev => prev ? { ...prev, [field]: value } : null)
    } else {
      setProduct(prev => prev ? { ...prev, [field]: value } : null)
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (!product || !productAr) {
    return <div className="flex justify-center items-center h-screen">Product not found</div>
  }

  return (
    <div className="container mx-auto py-10 px-10">
      <h1 className="text-2xl font-bold mb-5">Edit Product</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={product.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={product.description}
            onChange={(e) => handleChange('description', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="nameAr">Name (Arabic)</Label>
          <Input
            id="nameAr"
            value={productAr.name}
            onChange={(e) => handleChange('name', e.target.value, true)}
            required
          />
        </div>
        <div>
          <Label htmlFor="descriptionAr">Description (Arabic)</Label>
          <Textarea
            id="descriptionAr"
            value={productAr.description}
            onChange={(e) => handleChange('description', e.target.value, true)}
            required
          />
        </div>
        <div>
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            type="number"
            value={product.price}
            onChange={(e) => handleChange('price', parseFloat(e.target.value))}
            required
          />
        </div>
        <div>
          <Label htmlFor="sale_price">Sale Price</Label>
          <Input
            id="sale_price"
            type="number"
            value={product.sale_price}
            onChange={(e) => handleChange('sale_price', parseFloat(e.target.value))}
            required
          />
        </div>
        <div>
          <Label htmlFor="image">Image URL</Label>
          <Input
            id="image"
            type="url"
            value={product.image}
            onChange={(e) => handleChange('image', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select 
            value={String(product.category)} 
            onValueChange={(value) => handleChange('category', parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={String(category.id)}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select 
            value={product.status} 
            onValueChange={(value) => handleChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AVAILABLE">AVAILABLE</SelectItem>
              <SelectItem value="SOLD">SOLD</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Updating...' : 'Update Product'}
        </Button>
      </form>
    </div>
  )
}