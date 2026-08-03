import { useState, useEffect } from 'react'
import { getWarehouses } from '../api/warehouses'
import { getSuppliers } from '../api/suppliers'

interface WarehouseSupplierFormProps {
  onDataChange?: (data: any) => void
  onNextTab?: () => void
  onPrevTab?: () => void
}

interface AlmacenData {
  id: string
  nombre: string
  direccion: string
  descripcion: string
}

interface SupplierData {
  id: string
  nombre: string
  empresa: string
  direccion: string
  telefonoOficina: string
  contacto: string
  telefonoContacto: string
}

export default function WarehouseSupplierForm({ onDataChange, onNextTab, onPrevTab }: WarehouseSupplierFormProps) {
  const [step, setStep] = useState(1) // 1: Almacen, 2: Proveedor
  
  // Estado para la lista de almacenes (simulando BD)
  const [almacenes, setAlmacenes] = useState<AlmacenData[]>([])
  
  // Estado para la lista de proveedores (simulando BD)
  const [proveedores, setProveedores] = useState<SupplierData[]>([])

  const [isNewSupplier, setIsNewSupplier] = useState(false)
  const [selectedSupplierId, setSelectedSupplierId] = useState('')

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombreAlmacen: '',
    direccionAlmacen: '',
    descripcionAlmacen: '',
    proveedor: {
      id: '',
      nombre: '',
      empresa: '',
      direccion: '',
      telefonoOficina: '',
      contacto: '',
      telefonoContacto: ''
    }
  })

  useEffect(() => {
    getWarehouses().then((data) => setAlmacenes(data.map((w) => ({
      id: w.whID, nombre: w.whname, direccion: w.whaddress || '', descripcion: ''
    }))))
    getSuppliers().then((data) => setProveedores(data.map((s) => ({
      id: s.suppCode, nombre: s.supplierName, empresa: s.enterpBusi || '',
      direccion: s.address || '', telefonoOficina: s.officePhone || '',
      contacto: s.contactName || '', telefonoContacto: s.contactPhone || ''
    }))))
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: string, isProveedor = false) => {
    const { value } = e.target
    
    if (isProveedor) {
      const newData = {
        ...formData,
        proveedor: { ...formData.proveedor, [field]: value }
      }
      setFormData(newData)
      if (onDataChange) onDataChange(newData)
    } else {
      const newData = { ...formData, [field]: value }
      setFormData(newData)
      
      if (field === 'nombreAlmacen') {
        const selectedAlmacen = almacenes.find(a => a.nombre === value)
        if (selectedAlmacen) {
          newData.direccionAlmacen = selectedAlmacen.direccion || ''
          newData.descripcionAlmacen = selectedAlmacen.descripcion || ''
          setFormData(newData)
        }
      }
      if (onDataChange) onDataChange(newData)
    }
  }

  const handleSupplierSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setSelectedSupplierId(value)
    
    if (value) {
      const provider = proveedores.find(p => p.id === value)
      if (provider && !isNewSupplier) {
        const newData = { ...formData, proveedor: { ...provider } }
        setFormData(newData)
        if (onDataChange) onDataChange(newData)
      }
    } else {
      const newData = { ...formData, proveedor: { id: '', nombre: '', empresa: '', direccion: '', telefonoOficina: '', contacto: '', telefonoContacto: '' } }
      setFormData(newData)
      if (onDataChange) onDataChange(newData)
    }
  }

  const toggleNewSupplier = () => {
    const newValue = !isNewSupplier
    setIsNewSupplier(newValue)
    if (newValue) {
      // Limpiar y resetear select
      setSelectedSupplierId('')
      const newData = { ...formData, proveedor: { id: '', nombre: '', empresa: '', direccion: '', telefonoOficina: '', contacto: '', telefonoContacto: '' } }
      setFormData(newData)
      if (onDataChange) onDataChange(newData)
    } else if (selectedSupplierId) {
      const provider = proveedores.find(p => p.id === selectedSupplierId)
      if (provider) {
        const newData = { ...formData, proveedor: { ...provider } }
        setFormData(newData)
        if (onDataChange) onDataChange(newData)
      }
    }
  }

  const handleNext = () => {
    if (step === 1) {
      setStep(2)
    } else {
      if (onNextTab) onNextTab()
    }
  }

  const handlePrev = () => {
    if (step === 2) {
      setStep(1)
    } else {
      if (onPrevTab) onPrevTab()
    }
  }

  // Estilo base de los inputs usado en ProductDataForm
  const inputClassName = "w-full px-3 py-2 border border-gray-300 rounded focus:border-[#3ab0e2] focus:outline-none placeholder-gray-400 text-sm font-medium bg-white text-gray-800"
  
  return (
    <div className="w-full relative">

      {/* STEP 1: Datos de Almacén */}
      {step === 1 && (
        <div className="w-full flex justify-center py-6 px-4 md:px-16 animate-fade-in relative">
          <div className="w-full max-w-4xl space-y-4">
            {/* Nombre del almacen */}
            <div className="relative">
              <input
                list="almacenes-list"
                value={formData.nombreAlmacen}
                onChange={(e) => handleInputChange(e, 'nombreAlmacen')}
                placeholder="Nombre del almacen"
                className={`${inputClassName} pr-8 appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-list-button]:hidden`}
              />
              <datalist id="almacenes-list">
                {almacenes.map(almacen => (
                  <option key={almacen.id} value={almacen.nombre} />
                ))}
              </datalist>
              <div className="absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </div>
            </div>

            {/* Dirección */}
            <div>
              <input
                type="text"
                value={formData.direccionAlmacen}
                onChange={(e) => handleInputChange(e, 'direccionAlmacen')}
                placeholder="Dirección"
                className={inputClassName}
              />
            </div>

            {/* Descripción */}
            <div>
              <textarea
                value={formData.descripcionAlmacen}
                onChange={(e) => handleInputChange(e, 'descripcionAlmacen')}
                placeholder="Descripción"
                rows={12}
                className={`${inputClassName} resize-y min-h-[120px]`}
              />
            </div>
            
            {/* Botones */}
            <div className="mt-8 flex gap-4 justify-end pt-4">
              <button
                onClick={handlePrev}
                className="bg-gray-400 hover:bg-gray-500 text-white py-2 px-8 text-sm transition-colors duration-300 cursor-pointer"
              >
                Anterior
              </button>
              <button
                onClick={handleNext}
                className="bg-[#3ab0e2] hover:bg-[#16A085] text-white py-2 px-8 text-sm transition-colors duration-300 cursor-pointer"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Registrar Proveedor */}
      {step === 2 && (
        <div className="w-full py-8 md:px-16 animate-fade-in relative min-h-[500px]">
          {/* Botón Atrás (Top Right) */}
          <div className="absolute top-0 right-0 md:right-8 lg:right-16 mt-4">
            <button
              onClick={handlePrev}
              className="bg-[#3ab0e2] hover:bg-[#16A085] text-white py-1.5 px-6 rounded-sm text-sm transition-colors duration-300 cursor-pointer"
            >
              Atras
            </button>
          </div>

          <div className="w-full max-w-4xl mx-auto">
            {/* Título central */}
            <h2 className="text-[32px] text-[#e64a19] mb-8 text-center pt-2">
              Registrar proveedor
            </h2>

            {/* Fila Dropdown */}
            <div className="flex justify-center mb-12">
              <div className="relative w-[300px]">
                <select
                  value={selectedSupplierId}
                  onChange={handleSupplierSelect}
                  disabled={isNewSupplier}
                  className={`${inputClassName} pr-8 appearance-none select-none disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed`}
                >
                  <option value="">Seleccionar proveedor</option>
                  {proveedores.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </div>

            {/* Formulario Principal (Grid) */}
            <div className="grid grid-cols-[1fr_2fr] gap-x-12 gap-y-6 items-start">
              {/* Columna Izquierda: Checkbox Nuevo Proveedor */}
              <div className="flex items-center gap-4 justify-end mt-2">
                <span className="font-bold text-gray-800 text-[15px]">Nuevo proveedor</span>
                <input
                  type="checkbox"
                  checked={isNewSupplier}
                  onChange={toggleNewSupplier}
                  className="w-5 h-5 rounded border-gray-300 cursor-pointer accent-[#16A085]"
                />
              </div>

              {/* Columna Derecha: Campos */}
              <div className="flex flex-col gap-4">
                {[
                  { label: 'Código de proveedor', field: 'id' as const },
                  { label: 'Nombre de proveedor', field: 'nombre' as const },
                  { label: 'Empresa', field: 'empresa' as const },
                  { label: 'Dirección', field: 'direccion' as const },
                  { label: 'Teléfono oficina', field: 'telefonoOficina' as const },
                  { label: 'Nombre del contacto', field: 'contacto' as const },
                  { label: 'Teléfono de contacto', field: 'telefonoContacto' as const },
                ].map((item) => (
                    <div key={item.field} className="w-[300px]">
                      <input
                        type="text"
                        placeholder={item.label}
                        value={formData.proveedor[item.field]}
                        onChange={(e) => handleInputChange(e, item.field, true)}
                        disabled={!isNewSupplier && !selectedSupplierId}
                        readOnly={!isNewSupplier}
                        className={`${inputClassName} w-full disabled:bg-gray-100 disabled:text-gray-500 read-only:focus:border-gray-300`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Botón Siguiente Abajo */}
            <div className="flex justify-end mt-12 mb-4 pr-16 md:pr-[120px]">
              <button
                onClick={handleNext}
                className="bg-[#3ab0e2] hover:bg-[#16A085] text-white py-2 px-8 text-sm transition-colors duration-300 cursor-pointer"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
