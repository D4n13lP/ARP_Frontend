import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Edit3, Trash2, Check, RotateCcw } from 'lucide-react'
import ProductModal from '../components/ProductModal'
import { useAppStore } from '../stores/useAppStore'
import { getSupplierById, updateSupplier, deleteSupplier } from '../api/suppliers'
import type { Product, Supplier } from '../types'

const emptySupplier: Supplier = {
  suppCode: '',
  supplierName: '',
  enterpBusi: '',
  address: '',
  officePhone: '',
  contactName: '',
  contactPhone: '',
  email: '',
  website: '',
}

export default function SupplierDetail_Page() {
  const navigate = useNavigate()
  const { suppCode } = useParams()
  const openModal = useAppStore((state) => state.openModal)

  // Estado para el modo edición
  const [isEditing, setIsEditing] = useState(false)

  const [supplier, setSupplier] = useState<Supplier>(emptySupplier)
  const associatedProducts = supplier.products || []

  useEffect(() => {
    if (suppCode) {
      getSupplierById(suppCode).then(setSupplier)
    }
  }, [suppCode])

  const hasProducts = associatedProducts.length > 0

  const handleViewProduct = (product: Product) => {
    openModal(product)
  }

  const handleGuardar = async () => {
    if (!suppCode) return
    const updated = await updateSupplier(suppCode, {
      supplierName: supplier.supplierName,
      enterpBusi: supplier.enterpBusi,
      address: supplier.address,
      officePhone: supplier.officePhone,
      contactName: supplier.contactName,
      contactPhone: supplier.contactPhone,
      email: supplier.email,
      website: supplier.website,
    })
    setSupplier({ ...updated, products: supplier.products })
    setIsEditing(false)
  }

  const handleEliminar = async () => {
    if (hasProducts) {
      alert("No se puede eliminar el proveedor: Primero se deben borrar los productos de ese proveedor.")
    } else if (suppCode) {
      if (window.confirm("¿Estás seguro de que deseas eliminar este proveedor?")) {
        await deleteSupplier(suppCode)
        navigate(-1)
      }
    }
  }

  return (
    <div className="min-h-screen bg-white p-6 md:p-12 animate-fade-in">
      
      {/* BOTÓN REGRESAR (Atras) */}
      <div className="max-w-7xl mx-auto mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="bg-[#3ab0e2] hover:bg-[#16A085] text-white px-8 py-2 rounded shadow-md flex items-center gap-2 transition-all font-bold text-sm uppercase cursor-pointer"
        >
          <ArrowLeft size={18} /> Atras
        </button>
      </div>

      {/* TÍTULO DEL PROVEEDOR */}
      <h1 className="text-5xl font-light text-[#e67e22] text-center mb-12 lowercase tracking-tighter">
        {supplier.supplierName}
      </h1>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* TABLA DE INFORMACIÓN */}
        <div className="lg:col-span-8">
          <div className="border border-gray-300 rounded overflow-hidden shadow-sm bg-white">
            <table className="w-full text-sm text-left border-collapse">
              <tbody className="divide-y divide-gray-200">
                {[
                  { key: 'suppCode', label: 'Código de proveedor', editable: false },
                  { key: 'supplierName', label: 'Nombre proveedor', editable: true },
                  { key: 'enterpBusi', label: 'Empresa', editable: true },
                  { key: 'address', label: 'Dirección', editable: true },
                  { key: 'officePhone', label: 'Teléfono oficina', editable: true },
                  { key: 'contactName', label: 'Nombre del contacto', editable: true },
                  { key: 'contactPhone', label: 'Teléfono del contacto', editable: true },
                  { key: 'email', label: 'Correo electrónico', editable: true },
                  { key: 'website', label: 'Sitio web', editable: true },
                ].map((row) => (
                  <tr key={row.key} className="group">
                    <td className="px-6 py-4 font-bold text-gray-700 bg-gray-50 border-r border-gray-200 w-1/3 italic">
                      {row.label}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {isEditing && row.editable ? (
                        <input
                          className="w-full border-b border-emerald-400 outline-none px-1 bg-emerald-50/20 py-1"
                          value={(supplier as any)[row.key] ?? ''}
                          onChange={(e) => setSupplier({...supplier, [row.key]: e.target.value})}
                        />
                      ) : ((supplier as any)[row.key] || '---')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* COLUMNA DE ACCIONES */}
        <div className="lg:col-span-4 flex flex-col gap-5 pt-4">
          {isEditing ? (
            <>
              <button
                onClick={handleGuardar}
                className="bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-lg shadow-lg font-bold flex items-center justify-center gap-2 transition-all uppercase cursor-pointer"
              >
                <Check size={20} /> Guardar Cambios
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-400 hover:bg-gray-500 text-white py-4 rounded-lg shadow-lg font-bold flex items-center justify-center gap-2 transition-all uppercase cursor-pointer"
              >
                <RotateCcw size={20} /> Cancelar
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="bg-[#3ab0e2] hover:bg-[#16A085] text-white py-4 px-10 rounded shadow-lg font-bold flex items-center justify-center gap-2 transition-all uppercase cursor-pointer"
            >
              <Edit3 size={20} /> Editar
            </button>
          )}

          <button 
            onClick={handleEliminar}
            className={`py-4 px-10 rounded shadow-lg font-bold flex items-center justify-center gap-2 transition-all text-white uppercase cursor-pointer
              ${hasProducts ? 'bg-gray-300 opacity-50' : 'bg-red-500 hover:bg-red-700'}`}
          >
            <Trash2 size={20} /> Eliminar
          </button>
        </div>
      </div>

      {/* TABLA DE PRODUCTOS ASOCIADOS */}
      <div className="max-w-6xl mx-auto mt-20">
        <h3 className="text-3xl font-bold text-gray-800 mb-8 italic">Productos</h3>
        
        <div className="border border-gray-300 rounded shadow-sm overflow-hidden bg-white">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-gray-100 text-gray-700 font-bold">
              <tr className="divide-x divide-gray-300">
                <th className="px-6 py-4 text-center uppercase">Código de producto</th>
                <th className="px-6 py-4 text-center uppercase">Nombre del producto</th>
                <th className="px-6 py-4 text-center uppercase">Categoría</th>
                <th className="px-6 py-4 text-center uppercase text-gray-400">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {associatedProducts.map((prod) => (
                <tr key={prod.prodCode} className="divide-x divide-gray-300 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-center">{prod.prodCode}</td>
                  <td className="px-6 py-4">{prod.productName}</td>
                  <td className="px-6 py-4 text-center">{prod.category?.categoryName || '---'}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleViewProduct(prod)}
                      className="text-[#3ab0e2] hover:text-emerald-600 font-bold underline transition-colors cursor-pointer"
                    >
                      Ver producto
                    </button>
                  </td>
                </tr>
              ))}
              {associatedProducts.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400 italic">
                    Este proveedor no tiene productos asociados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ProductModal />
    </div>
  )
}