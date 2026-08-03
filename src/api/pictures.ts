import { http } from './http'
import { PictureSchema, type Picture } from '../types'

export async function uploadPicture(prodCode: string, file: File): Promise<Picture> {
  const formData = new FormData()
  formData.append('image', file)
  formData.append('prodCode', prodCode)
  const { data } = await http.post('/pictures/upload', formData)
  return PictureSchema.parse(data)
}

export async function deletePicture(pictureID: string): Promise<void> {
  await http.delete(`/pictures/${pictureID}`)
}
