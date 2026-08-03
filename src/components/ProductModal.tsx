// import { useState, useEffect, useRef } from 'react'
// import { X, ChevronLeft, ChevronRight, Maximize2, UploadCloud, Edit3, Trash2, Check, RotateCcw } from 'lucide-react'
// import { useAppStore } from '../stores/useAppStore'

// export default function ProductModal() {
//   const isModalOpen = useAppStore((state) => state.isModalOpen)
//   const selectedProduct = useAppStore((state) => state.selectedProduct)
//   const closeModal = useAppStore((state) => state.closeModal)
//   const updateProductImage = useAppStore((state) => state.updateProductImage)

//   const [isEditing, setIsEditing] = useState(false)
//   const [isFullscreen, setIsFullscreen] = useState(false)
//   const [currentImgIndex, setCurrentImgIndex] = useState(0)
//   const [formData, setFormData] = useState(selectedProduct)
//   const [errors, setErrors] = useState<Record<string, string>>({})

//   // Referencia para el input de archivos oculto
//   const fileInputRef = useRef<HTMLInputElement>(null)

//   useEffect(() => {
//     if (selectedProduct) {
//       setFormData(selectedProduct)
//       setCurrentImgIndex(0)
//       setIsEditing(false)
//     }
//   }, [selectedProduct])

//   if (!isModalOpen || !selectedProduct || !formData) return null

//   const imagenes = formData.imagenes || []

//   // --- LÃ“GICA DE CARGA DE IMÃGENES ---

//   const handleReplaceClick = (e: React.MouseEvent) => {
//     e.stopPropagation()
//     fileInputRef.current?.click() // Simula clic en el input oculto
//   }

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0]
//     if (file) {
//       // ValidaciÃ³n bÃ¡sica de tipo de archivo
//       if (!file.type.startsWith('image/')) {
//         alert("Por favor, selecciona un archivo de imagen vÃ¡lido.")
//         return
//       }

//       // Crear URL temporal para previsualizaciÃ³n (SimulaciÃ³n de subida a BD)
//       const reader = new FileReader()
//       reader.onload = (event) => {
//         const newUrl = event.target?.result as string

//         // Actualizar localmente el formulario
//         const nuevasImagenes = [...imagenes]
//         nuevasImagenes[currentImgIndex] = newUrl
//         setFormData({ ...formData, imagenes: nuevasImagenes })

//         // AquÃ­ podrÃ­as disparar la subida real a tu base de datos
//         console.log(`Imagen ${currentImgIndex} reemplazada por archivo:`, file.name)
//       }
//       reader.readAsDataURL(file)
//     }
//   }

//   // --- NAVEGACIÃ“N Y ACCIONES ---

//   const nextImage = (e?: React.MouseEvent) => {
//     e?.stopPropagation()
//     setCurrentImgIndex((prev) => (prev + 1) % imagenes.length)
//   }

//   const prevImage = (e?: React.MouseEvent) => {
//     e?.stopPropagation()
//     setCurrentImgIndex((prev) => (prev - 1 + imagenes.length) % imagenes.length)
//   }

//   const handleSave = () => {
//     // Validaciones de congruencia
//     if (!formData.nombre.trim() || formData.precio <= 0) {
//       setErrors({ general: "Revisa los campos obligatorios y el precio." })
//       return
//     }
//     console.log("Guardando cambios en la base de datos...", formData)
//     setIsEditing(false)
//   }

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
//       {/* Input de archivo oculto para reemplazo */}
//       <input
//         type="file"
//         ref={fileInputRef}
//         className="hidden"
//         accept="image/*"
//         onChange={handleFileChange}
//       />

//       <div className="bg-white w-full max-w-6xl max-h-[95vh] overflow-y-auto rounded-2xl shadow-2xl relative">
//         <button onClick={closeModal} className="absolute top-4 right-4 z-10 p-2 bg-gray-100 rounded-full hover:bg-red-500 hover:text-white transition-all cursor-pointer">
//           <X size={24} />
//         </button>

//         <div className="p-10">
//           <div className="text-center mb-8">
//             {isEditing ? (
//               <input
//                 className="text-2xl font-bold text-center uppercase border-b-2 border-emerald-500 outline-none w-full max-w-2xl"
//                 value={formData.nombre}
//                 onChange={e => setFormData({...formData, nombre: e.target.value})}
//               />
//             ) : (
//               <h2 className="text-3xl font-bold text-gray-800 uppercase tracking-tight">{formData.nombre}</h2>
//             )}
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
//             {/* GALERÃA */}
//             <div className="lg:col-span-4 space-y-4">
//               <div
//                 className="relative group cursor-zoom-in rounded-xl overflow-hidden border border-gray-200 aspect-square bg-gray-50"
//                 onClick={() => setIsFullscreen(true)}
//               >
//                 <img src={imagenes[currentImgIndex]} className="w-full h-full object-cover" alt="Producto" />
//                 <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
//                   <Maximize2 className="text-white" size={40} />
//                 </div>
//               </div>

//               <div className="flex gap-2 overflow-x-auto justify-center">
//                 {imagenes.map((img, idx) => (
//                   <button
//                     key={idx}
//                     onClick={() => setCurrentImgIndex(idx)}
//                     className={`w-14 h-14 rounded-md border-2 ${currentImgIndex === idx ? 'border-emerald-500 scale-105 shadow-md' : 'border-transparent opacity-50'}`}
//                   >
//                     <img src={img} className="w-full h-full object-cover" alt="mini" />
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* TABLA Y CONTENIDO (Mantenido igual para coherencia) */}
//             <div className="lg:col-span-8 flex flex-col justify-between">
//                 {/* ... (AquÃ­ va la lÃ³gica de la tabla dinÃ¡mica y descripciÃ³n explicada antes) ... */}

//                 <div className="flex justify-center gap-4 mt-8">
//                    {/* Botones de Editar / Eliminar / Guardar */}
//                 </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* CARRUSEL PANTALLA COMPLETA */}
//       {isFullscreen && (
//         <div className="fixed inset-0 z-[60] bg-black/95 flex flex-col items-center justify-center p-4" onClick={() => setIsFullscreen(false)}>
//           <button className="absolute top-6 right-6 text-white/50 hover:text-white"><X size={48} /></button>

//           <div className="relative w-full max-w-5xl flex items-center justify-center" onClick={e => e.stopPropagation()}>
//             <button onClick={prevImage} className="absolute left-0 p-4 text-white/30 hover:text-white"><ChevronLeft size={64} strokeWidth={1} /></button>

//             <div className="flex flex-col items-center gap-8">
//               <img src={imagenes[currentImgIndex]} className="max-w-full max-h-[70vh] object-contain rounded-lg" alt="Full" />

//               <button
//                 onClick={handleReplaceClick}
//                 className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-full font-bold shadow-xl transition-all active:scale-95 uppercase text-sm"
//               >
//                 <UploadCloud size={20} /> Reemplazar esta imagen
//               </button>
//             </div>

//             <button onClick={nextImage} className="absolute right-0 p-4 text-white/30 hover:text-white"><ChevronRight size={64} strokeWidth={1} /></button>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }
import { useState, useEffect, useRef } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  UploadCloud,
  Edit3,
  Trash2,
  Check,
  RotateCcw,
} from "lucide-react";
import { useAppStore } from "../stores/useAppStore";
import { updateProduct, deleteProduct } from "../api/products";
import { getCategories, createCategory } from "../api/categories";
import { uploadPicture, deletePicture } from "../api/pictures";
import type { Category, Picture, Product } from "../types";

const PLACEHOLDER_IMAGE = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect width="600" height="600" fill="#e5e7eb"/><text x="50%" y="50%" font-family="sans-serif" font-size="28" fill="#9ca3af" text-anchor="middle" dominant-baseline="middle">Sin imagen</text></svg>'
);

export default function ProductModal() {
  // --- STORE ---
  const isModalOpen = useAppStore((state) => state.isModalOpen);
  const selectedProduct = useAppStore((state) => state.selectedProduct);
  const closeModal = useAppStore((state) => state.closeModal);
  const products = useAppStore((state) => state.products);
  const setProducts = useAppStore((state) => state.setProducts);

  // --- ESTADOS LOCALES ---
  const [isEditing, setIsEditing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [formData, setFormData] = useState<Product | null>(selectedProduct);
  // Imágenes agregadas/reemplazadas localmente en esta sesión (no se persisten, ver plan de Fase 1)
  const [localPictures, setLocalPictures] = useState<Picture[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryInput, setCategoryInput] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  // Sincronizar datos al abrir
  useEffect(() => {
    if (selectedProduct) {
      setFormData(selectedProduct);
      setLocalPictures(selectedProduct.pictures || []);
      setCategoryInput(selectedProduct.category?.categoryName || '');
      setCurrentImgIndex(0);
      setIsEditing(false);
    }
  }, [selectedProduct]);

  if (!isModalOpen || !selectedProduct || !formData) return null;

  const imagenes = localPictures.length > 0 ? localPictures.map((p) => p.link) : [PLACEHOLDER_IMAGE];
  const tieneDescuento = !!formData.promo;

  // --- MANEJADORES ---
  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentImgIndex((prev) => (prev + 1) % imagenes.length);
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentImgIndex(
      (prev) => (prev - 1 + imagenes.length) % imagenes.length,
    );
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const oldPicture = localPictures[currentImgIndex];
      try {
        const uploaded = await uploadPicture(formData.prodCode, file);
        const nuevas = [...localPictures];
        nuevas[currentImgIndex] = uploaded;
        setLocalPictures(nuevas);
        if (oldPicture) {
          await deletePicture(oldPicture.pictureID).catch(() => {});
        }
      } catch (error: any) {
        alert(error?.response?.data?.message || "No se pudo subir la imagen.");
      }
    }
  };

  const handleSave = async () => {
    if (!formData.productName.trim() || formData.salePrice <= 0) {
      alert("Por favor revisa el nombre y el precio.");
      return;
    }
    try {
      // Resolver la categoría escrita: usar la existente por nombre o crear una nueva
      let categoryID = formData.categoryID ?? null;
      const trimmedCategory = categoryInput.trim();
      if (trimmedCategory !== (formData.category?.categoryName || '').trim()) {
        if (!trimmedCategory) {
          categoryID = null;
        } else {
          const existing = categories.find((c) => c.categoryName.trim().toLowerCase() === trimmedCategory.toLowerCase());
          if (existing) {
            categoryID = existing.categoryID;
          } else {
            const created = await createCategory(trimmedCategory);
            categoryID = created.categoryID;
            setCategories((prev) => [...prev, created]);
          }
        }
      }

      const updated = await updateProduct(formData.prodCode, {
        productName: formData.productName,
        sku: formData.sku,
        cost: formData.cost,
        salePrice: formData.salePrice,
        lowStock: formData.lowStock,
        description: formData.description,
        categoryID,
      });
      const merged = { ...formData, ...updated };
      setFormData(merged);
      setProducts(products.map((p) => (p.prodCode === merged.prodCode ? merged : p)));
      setIsEditing(false);
    } catch (error: any) {
      alert(error?.response?.data?.message || "No se pudo guardar el producto.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("¿Seguro que deseas eliminarlo?")) return;
    try {
      await deleteProduct(formData.prodCode);
      setProducts(products.filter((p) => p.prodCode !== formData.prodCode));
      closeModal();
    } catch (error: any) {
      alert(error?.response?.data?.message || "No se pudo eliminar el producto.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 md:p-6 animate-fade-in">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />

      {/* CONTENEDOR PRINCIPAL: Ancho aumentado a 7xl para que sea espacioso */}
      <div className="bg-white w-full max-w-7xl max-h-[95vh] overflow-y-auto rounded-3xl shadow-2xl relative border border-gray-100">
        {/* BOTÃ“N CERRAR GLOBAL */}
        <button
          onClick={closeModal}
          className="absolute top-6 right-6 z-20 p-2 bg-white/90 rounded-full hover:bg-red-500 hover:text-white shadow-md transition-all cursor-pointer"
        >
          <X size={28} />
        </button>

        <div className="p-6 md:p-12">
          {/* TÃTULO EDITABLE */}
          <div className="text-center mb-10">
            {isEditing ? (
              <input
                className="text-3xl font-black text-center uppercase border-b-4 border-emerald-500 outline-none w-full max-w-3xl bg-emerald-50/30 px-4 py-2"
                value={formData.productName}
                onChange={(e) =>
                  setFormData({ ...formData, productName: e.target.value })
                }
              />
            ) : (
              <h2 className="text-4xl font-black text-gray-800 uppercase tracking-tighter italic">
                {formData.productName}
              </h2>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* 1. SECCIÃ“N IZQUIERDA: GALERÃA (4 columnas) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div
                className="relative group cursor-zoom-in rounded-2xl overflow-hidden border-2 border-gray-100 aspect-square bg-gray-50 shadow-inner shadow-black/5"
                onClick={() => setIsFullscreen(true)}
              >
                <img
                  src={imagenes[currentImgIndex]}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  alt="Vista"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-white/20 backdrop-blur-md p-4 rounded-full border border-white/30">
                    <Maximize2 className="text-white" size={40} />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 overflow-x-auto justify-center py-2 no-scrollbar">
                {imagenes.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImgIndex(idx)}
                    className={`w-16 h-16 rounded-xl border-4 transition-all overflow-hidden flex-shrink-0 ${currentImgIndex === idx ? "border-emerald-500 scale-110" : "border-transparent opacity-40 hover:opacity-80"}`}
                  >
                    <img
                      src={img}
                      className="w-full h-full object-cover"
                      alt={`thumb-${idx}`}
                    />
                  </button>
                ))}
                {isEditing && localPictures.length < 10 && (
                  <button
                    onClick={() => {
                      const fileInput = document.createElement("input");
                      fileInput.type = "file";
                      fileInput.accept = "image/*";
                      fileInput.onchange = async (e: any) => {
                        const file = e.target.files?.[0];
                        if (file && file.type.startsWith("image/")) {
                          try {
                            const uploaded = await uploadPicture(formData.prodCode, file);
                            const nuevas = [...localPictures, uploaded];
                            setLocalPictures(nuevas);
                            setCurrentImgIndex(nuevas.length - 1);
                          } catch (error: any) {
                            alert(error?.response?.data?.message || "No se pudo subir la imagen.");
                          }
                        }
                      };
                      fileInput.click();
                    }}
                    className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-400 flex items-center justify-center text-gray-400 hover:border-emerald-500 hover:text-emerald-500 transition-all flex-shrink-0"
                    title="Agregar nueva imagen"
                  >
                    <span className="text-2xl font-black">+</span>
                  </button>
                )}
              </div>
            </div>

            {/* 2. SECCIÃ“N CENTRAL: TABLA DINÃMICA (5 columnas) */}
            <div className="lg:col-span-5 flex flex-col">
              <div className="border-2 border-gray-200 rounded-2xl overflow-hidden shadow-xl bg-white">
                <div className="max-h-[450px] overflow-y-auto">
                  <table className="w-full text-sm md:text-base text-left border-collapse">
                    <tbody className="divide-y divide-gray-200">
                      {[
                        { k: "prodCode", l: "Código de producto:", ed: false, money: false },
                        { k: "sku", l: "SKU:", ed: true, money: false },
                        { k: "category", l: "Categoría:", ed: true, money: false, select: true, display: formData.category?.categoryName || "Sin categoría" },
                        { k: "unit", l: "Unidad:", ed: false, money: false, display: formData.unit?.produnitName || "---" },
                        { k: "cost", l: "Costo:", ed: true, money: true },
                        { k: "salePrice", l: "Precio de venta:", ed: true, money: true },
                        { k: "lowStock", l: "Stock bajo:", ed: true, money: false },
                      ].map((row) => (
                        <tr
                          key={row.k}
                          className="hover:bg-emerald-50/30 transition-colors group"
                        >
                          <td className="px-6 py-4 font-black text-gray-500 border-r border-gray-100 w-1/2 bg-gray-50/50 text-[11px] md:text-xs tracking-widest uppercase group-hover:text-emerald-600">
                            {row.l}
                          </td>
                          <td className="px-6 py-4">
                            {isEditing && row.ed && row.select ? (
                              <>
                                <input
                                  list="productModalCategoriesList"
                                  className="w-full border-b-2 border-emerald-400 outline-none px-1 bg-transparent font-bold text-gray-800"
                                  value={categoryInput}
                                  onChange={(e) => setCategoryInput(e.target.value)}
                                  placeholder="Escribe o elige una categoría"
                                />
                                <datalist id="productModalCategoriesList">
                                  {categories.map((c) => (
                                    <option key={c.categoryID} value={c.categoryName} />
                                  ))}
                                </datalist>
                              </>
                            ) : isEditing && row.ed ? (
                              <input
                                type={row.money || row.k === "lowStock" ? "number" : "text"}
                                className="w-full border-b-2 border-emerald-400 outline-none px-1 bg-transparent font-bold text-gray-800"
                                value={(formData as any)[row.k] ?? ''}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    [row.k]: row.money || row.k === "lowStock"
                                      ? Number(e.target.value)
                                      : e.target.value,
                                  })
                                }
                              />
                            ) : (
                              <span
                                className={`font-bold ${row.money ? "text-emerald-700 text-lg" : "text-gray-800"}`}
                              >
                                {row.money
                                  ? `$${Number((formData as any)[row.k]).toLocaleString("es-MX")} ${formData.currencyCost || 'MXN'}`
                                  : (row.display ?? (formData as any)[row.k])}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* 3. SECCIÃ“N DERECHA: DESCUENTO Y DESCRIPCIÃ“N (3 columnas) */}
            <div className="lg:col-span-3 flex flex-col gap-8">
              {tieneDescuento ? (
                <div className="text-center p-6 bg-emerald-50 rounded-3xl border-2 border-emerald-100 shadow-inner">
                  <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-2">
                    Promoción Vigente
                  </p>
                  <p className="text-4xl font-black text-emerald-900">
                    -{(Number(formData.promo?.discountPercentage) * 100).toFixed(0)}%
                  </p>
                </div>
              ) : (
                <div className="h-40 border-2 border-dashed border-gray-100 rounded-3xl flex items-center justify-center text-gray-300 italic text-sm">
                  Sin descuentos registrados
                </div>
              )}

              <div className="flex-grow">
                <h4 className="font-black text-gray-400 border-b-4 border-emerald-500 inline-block mb-4 uppercase text-[11px] tracking-tighter">
                  Descripción Técnica:
                </h4>
                {isEditing ? (
                  <textarea
                    className="w-full p-4 border-2 border-gray-200 rounded-2xl text-sm h-48 focus:border-emerald-500 outline-none transition-all bg-emerald-50/10"
                    value={formData.description || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                ) : (
                  <p className="text-gray-600 leading-relaxed text-sm italic font-medium bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    {formData.description || "Sin descripción disponible."}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* BOTONES FINALES DE ACCIÃ“N */}
          <div className="flex justify-center gap-6 mt-16 pt-10 border-t-2 border-gray-50">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-12 py-4 rounded-2xl font-black shadow-xl transition-all active:scale-95 cursor-pointer flex items-center gap-3 uppercase"
                >
                  <Check size={24} /> Guardar Cambios
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData(selectedProduct);
                    setLocalPictures(selectedProduct.pictures || []);
                    setCategoryInput(selectedProduct.category?.categoryName || '');
                  }}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-12 py-4 rounded-2xl font-black shadow-xl transition-all cursor-pointer flex items-center gap-3 uppercase"
                >
                  <RotateCcw size={24} /> Cancelar
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-[#3ab0e2] hover:bg-emerald-600 text-white px-14 py-4 rounded-2xl font-black shadow-xl transition-all hover:-translate-y-2 cursor-pointer flex items-center gap-3 uppercase tracking-wider"
                >
                  <Edit3 size={24} /> Editar Producto
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-500 hover:bg-red-700 text-white px-14 py-4 rounded-2xl font-black shadow-xl transition-all hover:-translate-y-2 cursor-pointer flex items-center gap-3 uppercase tracking-wider"
                >
                  <Trash2 size={24} /> Eliminar Registro
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* MODAL FULLSCREEN / CARRUSEL */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-[100] bg-black/98 flex flex-col items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsFullscreen(false)}
        >
          <button className="absolute top-8 right-8 text-white/40 hover:text-white transition-all">
            <X size={60} strokeWidth={1} />
          </button>
          <div
            className="relative w-full max-w-6xl flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {imagenes.length > 1 && (
              <button
                onClick={prevImage}
                className="absolute left-0 p-6 text-white/20 hover:text-white transition-all z-20"
              >
                <ChevronLeft size={80} strokeWidth={1} />
              </button>
            )}
            <div className="flex flex-col items-center gap-10">
              <img
                src={imagenes[currentImgIndex]}
                className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10"
                alt="Full"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-4 bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-4 rounded-full font-black shadow-2xl transition-all active:scale-95 uppercase text-sm tracking-[0.2em]"
              >
                <UploadCloud size={24} /> Reemplazar esta imagen
              </button>
            </div>
            {imagenes.length > 1 && (
              <button
                onClick={nextImage}
                className="absolute right-0 p-6 text-white/20 hover:text-white transition-all z-20"
              >
                <ChevronRight size={80} strokeWidth={1} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
