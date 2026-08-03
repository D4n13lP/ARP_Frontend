import { http } from './http'
import { CategorySchema, type Category } from '../types'

export async function getCategories(): Promise<Category[]> {
  const { data } = await http.get('/categories')
  return CategorySchema.array().parse(data)
}

export async function createCategory(categoryName: string): Promise<Category> {
  const { data } = await http.post('/categories', { categoryName })
  return CategorySchema.parse(data)
}
