import { http } from './http'
import { ProductSchema, type Product, InventorySchema, type Inventory } from '../types'

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

export interface CreateSpecialOrderProductPayload {
  productName: string;
  description?: string | null;
  salePrice: number;
  produnitID?: string | null;
  quantity: number;
}

// "Orden Especial" en RegisterOrder_Page — crea el producto ad-hoc (prodType
// 'custom', prodCode/sku automáticos) y en el mismo paso lo ingresa al
// almacén fijo "Pedido especial" (se crea solo la primera vez). Devuelve el
// renglón de inventario ya creado, listo para armar el CartItem.
export async function createSpecialOrderProduct(payload: CreateSpecialOrderProductPayload): Promise<Inventory> {
  const { data } = await http.post('/products/special-order', payload)
  return InventorySchema.parse(data)
}
