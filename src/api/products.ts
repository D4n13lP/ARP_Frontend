import { http } from './http'
import { ProductSchema, type Product } from '../types'

export async function getProducts(): Promise<Product[]> {
  const { data } = await http.get('/products')
  return ProductSchema.array().parse(data)
}

export async function getProductById(prodCode: string): Promise<Product> {
  const { data } = await http.get(`/products/${prodCode}`)
  return ProductSchema.parse(data)
}

export async function createProduct(payload: Partial<Product>): Promise<Product> {
  const { data } = await http.post('/products', payload)
  return ProductSchema.parse(data)
}

export async function updateProduct(prodCode: string, payload: Partial<Product>): Promise<Product> {
  const { data } = await http.put(`/products/${prodCode}`, payload)
  return ProductSchema.parse(data)
}

export async function deleteProduct(prodCode: string): Promise<void> {
  await http.delete(`/products/${prodCode}`)
}
