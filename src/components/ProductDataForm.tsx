import { useState, useEffect, useRef } from 'react'
import * as React from 'react'
import { X } from 'lucide-react'
import { getCategories } from '../api/categories'
import { getProductUnits } from '../api/productUnits'
import { uploadPicture, deletePicture } from '../api/pictures'
import type { Picture } from '../types'

interface ProductDataFormProps {
  onDataChange?: (data: any) => void
  prodCode?: string
  sku?: string
}

export default function ProductDataForm({ onDataChange, prodCode, sku }: ProductDataFormProps) {
  const [categories, setCategories] = useState<string[]>([])
  const [currencies, setCurrencies] = useState<string[]>([])
  const [units, setUnits] = useState<string[]>([])
  const [pictures, setPictures] = useState<Picture[]>([])
  const [uploading, setUploading] = useState(false)

  const [formData, setFormData] = useState({
    nombre: '',
    categoria: '',
    costo: '',
    moneda: '',
    cantidad: '',
    unidades: '',
    unidadesStockBajo: '',
    proveedor: '',
    descripcion: '',
  })

  useEffect(() => {
    getCategories().then((data) => setCategories(data.map((c) => c.categoryName)))
    getProductUnits().then((data) => setUnits(data.map((u) => u.produnitName)))
    // No existe tabla de monedas en el backend; se deja fija.
    setCurrencies(['MXN', 'USD', 'EUR'])
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    const newData = { ...formData, [name]: value }
    setFormData(newData)
    if (onDataChange) onDataChange(newData)
  }

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !prodCode) return
    const filesArray = Array.from(e.target.files)

    // Limitar a máximo 10 imágenes en total
    const availableSlots = 10 - pictures.length
    const filesToAdd = filesArray.slice(0, availableSlots)

    if (filesToAdd.length < filesArray.length) {
      alert("Solo se permite un máximo de 10 imágenes por producto.")
    }

    setUploading(true)
    try {
      const uploaded = await Promise.all(filesToAdd.map((file) => uploadPicture(prodCode, file)))
      setPictures((prev) => [...prev, ...uploaded])
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Ocurrió un error al subir la imagen.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeImage = async (indexToRemove: number) => {
    const picture = pictures[indexToRemove]
    if (!picture) return
    try {
      await deletePicture(picture.pictureID)
      setPictures((prev) => prev.filter((_, i) => i !== indexToRemove))
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Ocurrió un error al eliminar la imagen.')
    }
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 py-2">
      {/* Columna Izquierda: Imágenes */}
      <div className="w-full md:w-[250px] flex-shrink-0 flex flex-col items-center">
        {/* Imagen Principal */}
        <div className="w-full aspect-square bg-[#e6e6e6] rounded border border-gray-300 flex items-center justify-center relative overflow-hidden group">
          {pictures.length > 0 ? (
            <img src={pictures[0].link} alt="Principal" className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center opacity-40">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#a0a0a0" strokeWidth="1">
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" fill="#d0d0d0"/>
                <path d="m3.3 7 8.7 5 8.7-5" />
                <path d="M12 22V12" />
                <rect x="7" y="6" width="10" height="12" rx="1" fill="white" stroke="#606060"/>
                <path d="M9 10h6" stroke="#50c878" strokeWidth="2" strokeLinecap="round"/>
                <path d="M9 14h4" stroke="#50c878" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          )}
          {pictures.length > 0 && (
             <button
                onClick={(e) => { e.stopPropagation(); removeImage(0); }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={16} />
              </button>
          )}
        </div>

        {/* Sub-imágenes (miniaturas) */}
        {pictures.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto w-full pb-2 px-1 custom-scrollbar">
            {pictures.slice(1).map((picture, idx) => (
              <div key={picture.pictureID} className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded border border-gray-300 relative group">
                <img src={picture.link} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-cover rounded" />
                <button
                  onClick={() => removeImage(idx + 1)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={pictures.length >= 10 || !prodCode || uploading}
          className={`mt-4 bg-[#3ab0e2] hover:bg-[#16A085] text-white py-2 px-4 rounded text-sm transition-colors duration-300 w-full font-medium ${pictures.length >= 10 || !prodCode || uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {uploading ? 'Subiendo…' : 'Seleccionar archivo(s)'}
        </button>
        <span className="text-xs text-gray-400 mt-2">
          {pictures.length} / 10 imágenes
        </span>
      </div>

      {/* Columna Derecha: Formulario */}
      <div className="flex-1 w-full">
        {/* Datalists para autocompletado nativo */}
        <datalist id="categoriesList">
          {categories.map(c => <option key={c} value={c} />)}
        </datalist>
        <datalist id="currenciesList">
          {currencies.map(c => <option key={c} value={c} />)}
        </datalist>
        <datalist id="unitsList">
          {units.map(u => <option key={u} value={u} />)}
        </datalist>

        <div className="grid grid-cols-12 gap-y-5 gap-x-4">
          {/* Fila 1: Código y SKU los genera la base de datos, aquí solo se muestran */}
          <div className="col-span-12 sm:col-span-3">
            <input
              type="text"
              value={prodCode ? prodCode.slice(0, 8).toUpperCase() : 'Generando…'}
              readOnly
              disabled
              title={prodCode}
              placeholder="Código"
              className="w-full px-3 py-2 border border-gray-200 rounded bg-gray-100 text-gray-500 placeholder-gray-400 text-sm font-medium cursor-not-allowed"
            />
          </div>
          <div className="col-span-12 sm:col-span-3">
            <input
              type="text"
              value={sku || 'Generando…'}
              readOnly
              disabled
              placeholder="SKU"
              className="w-full px-3 py-2 border border-gray-200 rounded bg-gray-100 text-gray-500 placeholder-gray-400 text-sm font-medium cursor-not-allowed"
            />
          </div>
          <div className="col-span-12 sm:col-span-6">
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              placeholder="Nombre producto"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#3ab0e2] focus:outline-none placeholder-gray-400 text-sm font-medium"
            />
          </div>

          {/* Fila 2 */}
          <div className="col-span-12 sm:col-span-4 lg:col-span-3">
            <div className="relative">
              <input
                list="categoriesList"
                name="categoria"
                value={formData.categoria}
                onChange={handleInputChange}
                placeholder="Categoría"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#3ab0e2] focus:outline-none placeholder-gray-400 text-sm font-medium pr-8 appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-list-button]:hidden"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
          </div>
          <div className="col-span-12 sm:col-span-4 lg:col-span-3">
            <input
              type="text"
              name="costo"
              value={formData.costo}
              onChange={handleInputChange}
              placeholder="Costo"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#3ab0e2] focus:outline-none placeholder-gray-400 text-sm font-medium"
            />
          </div>
          <div className="col-span-12 sm:col-span-4 lg:col-span-3">
            <div className="relative">
              <input
                list="currenciesList"
                name="moneda"
                value={formData.moneda}
                onChange={handleInputChange}
                placeholder="Moneda"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#3ab0e2] focus:outline-none placeholder-gray-400 text-sm font-medium pr-8 appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-list-button]:hidden"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-3">
            <input
              type="text"
              name="cantidad"
              value={formData.cantidad}
              onChange={handleInputChange}
              placeholder="Cantidad"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#3ab0e2] focus:outline-none placeholder-gray-400 text-sm font-medium"
            />
          </div>

          {/* Fila 3 */}
          <div className="col-span-12 sm:col-span-4">
             <div className="relative">
              <input
                list="unitsList"
                name="unidades"
                value={formData.unidades}
                onChange={handleInputChange}
                placeholder="Unidades"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#3ab0e2] focus:outline-none placeholder-gray-400 text-sm font-medium pr-8 appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-list-button]:hidden"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
          </div>
          <div className="col-span-12 sm:col-span-4">
            <input
              type="text"
              name="unidadesStockBajo"
              value={formData.unidadesStockBajo}
              onChange={handleInputChange}
              placeholder="Unidades de stock bajo"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#3ab0e2] focus:outline-none placeholder-gray-400 text-sm font-medium"
            />
          </div>
          <div className="col-span-12 sm:col-span-4">
            <input
              type="text"
              name="proveedor"
              value={formData.proveedor}
              onChange={handleInputChange}
              placeholder="Proveedor"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#3ab0e2] focus:outline-none placeholder-gray-400 text-sm font-medium"
            />
          </div>

          {/* Fila 4: Descripción */}
          <div className="col-span-12">
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              placeholder="Descripción"
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#3ab0e2] focus:outline-none placeholder-gray-400 text-sm font-medium resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

