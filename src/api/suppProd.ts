import { http } from './http'

export async function linkSupplierProduct(suppCode: string, prodCode: string): Promise<void> {
  await http.post('/supp-prods', { suppCode, prodCode })
}

export async function unlinkSupplierProduct(suppCode: string, prodCode: string): Promise<void> {
  await http.delete(`/supp-prods/${suppCode}/${prodCode}`)
}
