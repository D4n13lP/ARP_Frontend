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
import JsBarcode from "jsbarcode";
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
  Barcode,
  Printer,
  TrendingUp,
} from "lucide-react";
import { useAppStore } from "../stores/useAppStore";
import { updateProduct, deleteProduct } from "../api/products";
import { getCategories, createCategory } from "../api/categories";
import { getProductUnits, createProductUnit } from "../api/productUnits";
import { getSuppliers, createSupplier } from "../api/suppliers";
import { linkSupplierProduct, unlinkSupplierProduct } from "../api/suppProd";
import { uploadPicture, deletePicture } from "../api/pictures";
import { getTicketConfig } from "../api/ticketConfig";
import { updatePromo } from "../api/promos";
import { getMyPermissions } from "../api/userPermissions";
import { getTimeUnits, createTimeUnit } from "../api/timeUnits";
import {
  getSalesExpectations,
  createSalesExpectation,
  updateSalesExpectation,
  deleteSalesExpectation,
} from "../api/salesExpectations";
import { getErrorMessage } from "../utils/errorMessage";
import type { Category, Picture, Product, ProductUnit, SalesExpectation, Supplier, TicketConfig, TimeUnit } from "../types";

// Mismas 3 unidades de tiempo fijas que ofrece AddProduct_Page (SalesPriceForm)
// al registrar la expectativa de venta por primera vez — se reutiliza aquí el
// mismo catálogo en vez de texto libre, para no terminar con filas de
// "timeUnit" duplicadas por errores de tipeo.
const EXPECTATION_UNIT_OPTIONS: Record<string, string> = {
  días: "día(s)",
  semanas: "semana(s)",
  meses: "mes(es)",
};

// "YYYY-MM-DD" (DATEONLY tal cual lo manda el backend) -> "DD/MM/YYYY" sin
// pasar por Date/toLocaleDateString, que puede recorrer un día hacia atrás
// en husos horarios negativos (México) al interpretar la fecha como UTC.
function formatDateOnly(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

const PLACEHOLDER_IMAGE = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect width="600" height="600" fill="#e5e7eb"/><text x="50%" y="50%" font-family="sans-serif" font-size="28" fill="#9ca3af" text-anchor="middle" dominant-baseline="middle">Sin imagen</text></svg>'
);

// Renglón de la tabla de detalles del centro del modal. Los campos son todos
// opcionales salvo k/l/ed/money porque cada tipo de renglón (categoría,
// unidad, proveedor, el botón "+") solo usa un subconjunto.
type ModalRow = {
  k: string;
  l: string;
  ed: boolean;
  money: boolean;
  select?: boolean;
  unitSelect?: boolean;
  supplierSelect?: boolean;
  supplierIdx?: number;
  removable?: boolean;
  addSupplier?: boolean;
  display?: string;
};

export default function ProductModal() {
  // --- STORE ---
  const isModalOpen = useAppStore((state) => state.isModalOpen);
  const selectedProduct = useAppStore((state) => state.selectedProduct);
  const closeModal = useAppStore((state) => state.closeModal);
  const products = useAppStore((state) => state.products);
  const setProducts = useAppStore((state) => state.setProducts);
  const authUser = useAppStore((state) => state.authUser);

  // --- ESTADOS LOCALES ---
  const [isEditing, setIsEditing] = useState(false);
  // Se muestra como aviso fijo dentro del modal (no solo un alert que
  // desaparece) cuando "Eliminar" falla — p. ej. porque el producto ya se
  // usó en una venta/pedido registrado (el backend manda el motivo exacto).
  const [deleteError, setDeleteError] = useState<string | null>(null);
  // Editar/eliminar el producto vía este modal: admin siempre, vendedor solo
  // si tiene canEdit activado para el módulo "product-details" (mismo
  // permiso sin importar si el modal se abrió desde Inventario, el catálogo
  // o la ficha de un proveedor). Se vuelve a pedir cada vez que el modal se
  // ABRE (no solo una vez al montar la página) — este componente vive
  // montado todo el tiempo detrás de escena y solo devuelve null cuando está
  // cerrado, así que sin esto un permiso otorgado mientras la página ya
  // estaba abierta no se reflejaba hasta recargar todo el navegador.
  const [canEditProduct, setCanEditProduct] = useState(false);
  useEffect(() => {
    if (!isModalOpen) return;
    if (authUser?.userType === 'admin') {
      setCanEditProduct(true);
      return;
    }
    getMyPermissions()
      .then((perms) => {
        const mod = perms.find((p) => p.module?.moduleKey === 'product-details');
        setCanEditProduct(!!mod?.canEdit);
      })
      .catch(() => setCanEditProduct(false));
  }, [authUser?.userType, isModalOpen]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [formData, setFormData] = useState<Product | null>(selectedProduct);
  // Imágenes agregadas/reemplazadas localmente en esta sesión (no se persisten, ver plan de Fase 1)
  const [localPictures, setLocalPictures] = useState<Picture[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryInput, setCategoryInput] = useState('');
  // Unidad: mismo patrón que categoría — input con lista desplegable de las
  // unidades ya guardadas, pero también se puede escribir una nueva y se crea
  // al guardar (ver resolución en handleSave).
  const [units, setUnits] = useState<ProductUnit[]>([]);
  const [unitInput, setUnitInput] = useState('');
  // Proveedores: relación muchos-a-muchos vía "suppProd" — un producto puede
  // tener 0, 1 o varios. La lista de renglones editables es dinámica: arranca
  // con uno por cada proveedor ya vinculado (o uno vacío si no tiene
  // ninguno), y "Agregar proveedor" va anexando renglones al final. Cada
  // renglón es un input con datalist (mismo patrón que categoría/unidad):
  // autocompleta con los proveedores ya guardados o permite escribir uno
  // nuevo, que se crea al guardar.
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierInputs, setSupplierInputs] = useState<string[]>(['']);

  // Etiqueta del producto ("Imprimir etiqueta"): el código de barras real se
  // dibuja con JsBarcode dentro del <svg> de más abajo, usando el tipo de
  // símbolo y las características de impresión que el admin haya guardado en
  // "Editar etiquetas" (EditTicketConfig_Page) — se piden frescas cada vez
  // que se imprime, por si cambiaron desde la última vez.
  const [labelConfig, setLabelConfig] = useState<TicketConfig | null>(null);
  const [printingLabel, setPrintingLabel] = useState(false);
  // La terminal tiene 2 impresoras conectadas (tickets y códigos de barras):
  // en vez de imprimir directo, se muestra este menú antes — un navegador no
  // puede elegir la impresora en silencio (misma restricción que en
  // TicketPrintModal), así que "seleccionar impresora" e "imprimir etiqueta"
  // abren el mismo diálogo nativo del sistema, donde ahí sí aparecen las 2
  // impresoras detectadas para elegir la correcta.
  const [labelMenuOpen, setLabelMenuOpen] = useState(false);
  const labelBarcodeRef = useRef<SVGSVGElement>(null);

  // Descuento del producto: porcentaje editable (1-100) + botón para
  // eliminarlo por completo. Solo se desvincula del producto (discountID a
  // null) — no se borra el registro de Promo, porque también puede estar
  // vinculado a una categoría (ver PromotionSetupPage).
  const [discountPercentInput, setDiscountPercentInput] = useState<number | string>('');
  const [savingDiscount, setSavingDiscount] = useState(false);
  const [deletingDiscount, setDeletingDiscount] = useState(false);

  // Expectativa de venta ("salesExpectation"): antes solo se registraba desde
  // AddProduct_Page y nunca se volvía a mostrar en ningún lado — se agrega
  // aquí para poder verla y editarla desde el modal, con el mismo permiso
  // (canEditProduct / "product-details") que el resto de este modal.
  const [expectation, setExpectation] = useState<SalesExpectation | null>(null);
  const [timeUnits, setTimeUnits] = useState<TimeUnit[]>([]);
  const [editingExpectation, setEditingExpectation] = useState(false);
  const [expectationQuantityInput, setExpectationQuantityInput] = useState<number | string>('');
  // Cuántas unidades de tiempo dura el plazo (p. ej. "3" en "cada 3 días") —
  // antes existía este mismo input en SalesPriceForm pero nunca se guardaba.
  const [expectationPeriodLengthInput, setExpectationPeriodLengthInput] = useState<number | string>(1);
  const [expectationUnitInput, setExpectationUnitInput] = useState('días');
  const [savingExpectation, setSavingExpectation] = useState(false);
  const [deletingExpectation, setDeletingExpectation] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getCategories().then(setCategories);
    getProductUnits().then(setUnits).catch(() => {});
    getSuppliers().then(setSuppliers).catch(() => {});
    getTimeUnits().then(setTimeUnits).catch(() => {});
  }, []);

  // Trae la expectativa de venta del producto que se está viendo (a lo más
  // una fila por producto en la práctica, aunque el modelo no lo obligue).
  useEffect(() => {
    if (!selectedProduct) return;
    getSalesExpectations({ prodCode: selectedProduct.prodCode })
      .then((items) => {
        const item = items[0] ?? null;
        setExpectation(item);
        setExpectationQuantityInput(item ? item.quantity : '');
        setExpectationPeriodLengthInput(item ? item.periodLength : 1);
        setExpectationUnitInput(item?.timeUnit?.timeunitName || 'días');
      })
      .catch(() => setExpectation(null));
    setEditingExpectation(false);
  }, [selectedProduct]);

  // Sincronizar datos al abrir
  useEffect(() => {
    if (selectedProduct) {
      setFormData(selectedProduct);
      setLocalPictures(selectedProduct.pictures || []);
      setCategoryInput(selectedProduct.category?.categoryName || '');
      setUnitInput(selectedProduct.unit?.produnitName || '');
      setSupplierInputs(selectedProduct.suppliers?.length ? selectedProduct.suppliers.map((s) => s.supplierName) : ['']);
      setDiscountPercentInput(selectedProduct.promo ? Math.round(Number(selectedProduct.promo.discountPercentage) * 100) : '');
      setCurrentImgIndex(0);
      setIsEditing(false);
      setLabelMenuOpen(false);
      setDeleteError(null);
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

      // Resolver la unidad escrita: usar la existente por nombre o crear una nueva
      let produnitID = formData.produnitID ?? null;
      const trimmedUnit = unitInput.trim();
      if (trimmedUnit !== (formData.unit?.produnitName || '').trim()) {
        if (!trimmedUnit) {
          produnitID = null;
        } else {
          const existing = units.find((u) => u.produnitName.trim().toLowerCase() === trimmedUnit.toLowerCase());
          if (existing) {
            produnitID = existing.produnitID;
          } else {
            const created = await createProductUnit(trimmedUnit);
            produnitID = created.produnitID;
            setUnits((prev) => [...prev, created]);
          }
        }
      }

      // Resolver los proveedores escritos: cada renglón no vacío se resuelve
      // al existente por nombre o se crea uno nuevo. Al final se comparan los
      // suppCode resultantes contra los que el producto ya tenía vinculados:
      // se desvinculan los que ya no están y se vinculan los que son nuevos
      // (los que no cambiaron no se tocan).
      const currentSuppliers = formData.suppliers || [];
      const newSuppCodes: string[] = [];
      let suppliersCatalog = suppliers;
      for (const raw of supplierInputs) {
        const trimmed = raw.trim();
        if (!trimmed) continue;
        const existing = suppliersCatalog.find((s) => s.supplierName.trim().toLowerCase() === trimmed.toLowerCase());
        let suppCode: string;
        if (existing) {
          suppCode = existing.suppCode;
        } else {
          const created = await createSupplier({ supplierName: trimmed });
          suppCode = created.suppCode;
          suppliersCatalog = [...suppliersCatalog, created];
          setSuppliers(suppliersCatalog);
        }
        if (!newSuppCodes.includes(suppCode)) newSuppCodes.push(suppCode);
      }
      const toUnlink = currentSuppliers.filter((s) => !newSuppCodes.includes(s.suppCode));
      const toLink = newSuppCodes.filter((code) => !currentSuppliers.some((s) => s.suppCode === code));
      await Promise.all([
        ...toUnlink.map((s) => unlinkSupplierProduct(s.suppCode, formData.prodCode)),
        ...toLink.map((code) => linkSupplierProduct(code, formData.prodCode)),
      ]);

      const updated = await updateProduct(formData.prodCode, {
        productName: formData.productName,
        sku: formData.sku,
        cost: formData.cost,
        salePrice: formData.salePrice,
        lowStock: formData.lowStock,
        description: formData.description,
        categoryID,
        produnitID,
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
    setDeleteError(null);
    try {
      await deleteProduct(formData.prodCode);
      setProducts(products.filter((p) => p.prodCode !== formData.prodCode));
      closeModal();
    } catch (error: any) {
      setDeleteError(error?.response?.data?.message || "No se pudo eliminar el producto.");
    }
  };

  // Genera el código de barras y abre el menú (no imprime todavía) — el menú
  // deja elegir entre "Seleccionar impresora" e "Imprimir etiqueta", ambos
  // abren el diálogo nativo del sistema, donde están las 2 impresoras reales
  // (tickets y códigos de barras) para escoger la correcta.
  const handlePrintLabel = async () => {
    const sku = formData.sku || formData.prodCode;
    if (!sku) {
      alert("Este producto no tiene SKU registrado.");
      return;
    }
    setPrintingLabel(true);
    try {
      const config = await getTicketConfig();
      setLabelConfig(config);
      // Se espera al siguiente frame para que el <svg> del área imprimible ya
      // esté montado con la config nueva antes de dibujar el código de barras.
      requestAnimationFrame(() => {
        if (labelBarcodeRef.current) {
          JsBarcode(labelBarcodeRef.current, sku, {
            format: config.etiquetaTipoCodigo,
            displayValue: config.etiquetaMostrarSku,
            fontSize: 16,
            margin: 8,
          });
        }
        setLabelMenuOpen(true);
      });
    } catch (error: any) {
      alert(error?.response?.data?.message || "No se pudo generar la etiqueta.");
    } finally {
      setPrintingLabel(false);
    }
  };

  // Valida en cada tecla: solo enteros de 1 a 100 (igual que
  // PromotionSetupPage) — si el valor no cumple, simplemente se ignora la
  // tecla y el input se queda como estaba.
  const handleDiscountPercentChange = (val: string) => {
    if (val === '') {
      setDiscountPercentInput('');
      return;
    }
    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 1 && num <= 100) {
      setDiscountPercentInput(num);
    }
  };

  const handleSaveDiscount = async () => {
    if (discountPercentInput === '' || !formData.discountID) {
      alert("Ingresa un porcentaje válido entre 1 y 100.");
      return;
    }
    setSavingDiscount(true);
    try {
      const promo = await updatePromo(formData.discountID, { discountPercentage: Number(discountPercentInput) / 100 });
      const merged = { ...formData, promo };
      setFormData(merged);
      setProducts(products.map((p) => (p.prodCode === merged.prodCode ? merged : p)));
    } catch (error) {
      alert(getErrorMessage(error, "No se pudo actualizar el descuento."));
    } finally {
      setSavingDiscount(false);
    }
  };

  // Solo desvincula el descuento de ESTE producto (discountID a null) — no
  // borra el registro de Promo, que puede seguir vinculado a una categoría.
  const handleDeleteDiscount = async () => {
    if (!window.confirm("¿Seguro que deseas eliminar el descuento de este producto?")) return;
    setDeletingDiscount(true);
    try {
      const updated = await updateProduct(formData.prodCode, { discountID: null });
      const merged = { ...formData, ...updated };
      setFormData(merged);
      setProducts(products.map((p) => (p.prodCode === merged.prodCode ? merged : p)));
      setDiscountPercentInput('');
    } catch (error) {
      alert(getErrorMessage(error, "No se pudo eliminar el descuento."));
    } finally {
      setDeletingDiscount(false);
    }
  };

  // Solo enteros >= 0 (igual que el patrón de cantidad de SalesPriceForm).
  const handleExpectationQuantityChange = (val: string) => {
    if (val === '') {
      setExpectationQuantityInput('');
      return;
    }
    const intVal = parseInt(val, 10);
    if (!isNaN(intVal) && intVal >= 0 && /^\d+$/.test(val)) {
      setExpectationQuantityInput(intVal);
    }
  };

  // Solo enteros >= 1: la duración del plazo no puede ser cero.
  const handleExpectationPeriodLengthChange = (val: string) => {
    if (val === '') {
      setExpectationPeriodLengthInput('');
      return;
    }
    const intVal = parseInt(val, 10);
    if (!isNaN(intVal) && intVal >= 1 && /^\d+$/.test(val)) {
      setExpectationPeriodLengthInput(intVal);
    }
  };

  const handleSaveExpectation = async () => {
    if (expectationQuantityInput === '' || Number(expectationQuantityInput) <= 0) {
      alert("Ingresa una cantidad válida.");
      return;
    }
    if (expectationPeriodLengthInput === '' || Number(expectationPeriodLengthInput) <= 0) {
      alert("Ingresa una duración de plazo válida.");
      return;
    }
    setSavingExpectation(true);
    try {
      // Mismo patrón de "usar la existente o crearla" que categoría/unidad,
      // pero sobre las 3 unidades de tiempo fijas en vez de texto libre.
      const existingUnit = timeUnits.find((u) => u.timeunitName === expectationUnitInput);
      const timeunitID = existingUnit ? existingUnit.timeunitID : (await createTimeUnit(expectationUnitInput)).timeunitID;
      if (!existingUnit) setTimeUnits((prev) => [...prev, { timeunitID, timeunitName: expectationUnitInput }]);

      const saved = expectation
        ? await updateSalesExpectation(expectation.expectationID, {
            quantity: Number(expectationQuantityInput),
            timeunitID,
            periodLength: Number(expectationPeriodLengthInput),
          })
        : await createSalesExpectation({
            prodCode: formData.prodCode,
            timeunitID,
            quantity: Number(expectationQuantityInput),
            periodLength: Number(expectationPeriodLengthInput),
          });
      setExpectation(saved);
      setEditingExpectation(false);
    } catch (error) {
      alert(getErrorMessage(error, "No se pudo guardar la expectativa de venta."));
    } finally {
      setSavingExpectation(false);
    }
  };

  const handleDeleteExpectation = async () => {
    if (!expectation) return;
    if (!window.confirm("¿Seguro que deseas eliminar la expectativa de venta de este producto?")) return;
    setDeletingExpectation(true);
    try {
      await deleteSalesExpectation(expectation.expectationID);
      setExpectation(null);
      setExpectationQuantityInput('');
      setExpectationPeriodLengthInput(1);
      setExpectationUnitInput('días');
      setEditingExpectation(false);
    } catch (error) {
      alert(getErrorMessage(error, "No se pudo eliminar la expectativa de venta."));
    } finally {
      setDeletingExpectation(false);
    }
  };

  // Renglones de la tabla central. Los de proveedor son dinámicos: en
  // edición, uno por cada input actual (+ el botón "Agregar proveedor" al
  // final); en solo-lectura, uno por cada proveedor real que tenga el
  // producto (o uno solo diciendo "Sin proveedor" si no tiene ninguno).
  const supplierRows: ModalRow[] = isEditing
    ? supplierInputs.map((_, idx) => ({
        k: `supplier-${idx}`,
        l: supplierInputs.length > 1 ? `Proveedor ${idx + 1}:` : "Proveedor:",
        ed: true,
        money: false,
        supplierSelect: true,
        supplierIdx: idx,
        removable: supplierInputs.length > 1,
      }))
    : (formData.suppliers && formData.suppliers.length > 0
        ? formData.suppliers.map((s, idx, arr) => ({
            k: `supplier-view-${s.suppCode}`,
            l: arr.length > 1 ? `Proveedor ${idx + 1}:` : "Proveedor:",
            ed: false,
            money: false,
            display: s.supplierName,
          }))
        : [{ k: "supplier-view-none", l: "Proveedor:", ed: false, money: false, display: "Sin proveedor" }]);

  const rows: ModalRow[] = [
    { k: "prodCode", l: "Código de producto:", ed: false, money: false },
    { k: "sku", l: "SKU:", ed: true, money: false },
    { k: "category", l: "Categoría:", ed: true, money: false, select: true, display: formData.category?.categoryName || "Sin categoría" },
    { k: "unit", l: "Unidad:", ed: true, money: false, unitSelect: true, display: formData.unit?.produnitName || "Sin unidad" },
    { k: "cost", l: "Costo:", ed: true, money: true },
    { k: "salePrice", l: "Precio de venta:", ed: true, money: true },
    { k: "lowStock", l: "Stock bajo:", ed: true, money: false },
    ...supplierRows,
    ...(isEditing ? [{ k: "supplier-add", l: "", ed: false, money: false, addSupplier: true }] : []),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 md:p-4 animate-fade-in">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />

      {/* CONTENEDOR PRINCIPAL: aprovecha más espacio lateral en pantallas grandes */}
      <div className="bg-white w-full max-w-384 max-h-[95vh] overflow-y-auto rounded-3xl shadow-2xl relative border border-gray-100">
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
            <div className="lg:col-span-3 flex flex-col gap-6">
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
            <div className="lg:col-span-6 flex flex-col">
              <div className="border-2 border-gray-200 rounded-2xl overflow-hidden shadow-xl bg-white">
                <div className="max-h-137.5 overflow-y-auto">
                  <table className="w-full text-base md:text-lg text-left border-collapse">
                    <tbody className="divide-y divide-gray-200">
                      {rows.map((row) => (
                        row.addSupplier ? (
                          <tr key={row.k}>
                            <td colSpan={2} className="px-8 py-3 text-center">
                              <button
                                type="button"
                                onClick={() => setSupplierInputs((prev) => [...prev, ''])}
                                className="text-emerald-600 hover:text-emerald-800 font-bold text-base cursor-pointer transition-colors"
                              >
                                + Agregar proveedor
                              </button>
                            </td>
                          </tr>
                        ) : (
                        <tr
                          key={row.k}
                          className="hover:bg-emerald-50/30 transition-colors group"
                        >
                          <td className="px-8 py-3 font-black text-gray-500 border-r border-gray-100 w-1/2 bg-gray-50/50 text-xs md:text-sm tracking-widest uppercase group-hover:text-emerald-600">
                            {row.l}
                          </td>
                          <td className="px-8 py-3">
                            {isEditing && row.ed && row.supplierSelect ? (
                              <div className="flex items-center gap-2">
                                {/* Mismo patrón de input+datalist que categoría/unidad:
                                    permite elegir un proveedor ya guardado (con
                                    autocompletado del navegador) o escribir uno
                                    nuevo, que se crea al guardar. El datalist se
                                    define una sola vez fuera de esta tabla. */}
                                <input
                                  list="productModalSuppliersList"
                                  className="w-full border-b-2 border-emerald-400 outline-none px-1 bg-transparent font-bold text-gray-800"
                                  value={supplierInputs[row.supplierIdx!]}
                                  onChange={(e) => {
                                    const idx = row.supplierIdx!;
                                    setSupplierInputs((prev) => prev.map((v, i) => (i === idx ? e.target.value : v)));
                                  }}
                                  placeholder="Escribe o elige un proveedor"
                                />
                                {row.removable && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const idx = row.supplierIdx!;
                                      setSupplierInputs((prev) => prev.filter((_, i) => i !== idx));
                                    }}
                                    className="text-gray-400 hover:text-red-500 font-bold px-1 cursor-pointer transition-colors flex-shrink-0"
                                    title="Quitar proveedor"
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            ) : isEditing && row.ed && row.unitSelect ? (
                              <>
                                {/* input con datalist: el desplegable lo dibuja el
                                    navegador (no lo recorta el scroll de la tarjeta)
                                    y ya trae su propio scroll cuando hay muchas
                                    unidades guardadas; además permite escribir una
                                    unidad nueva que se crea al guardar. */}
                                <input
                                  list="productModalUnitsList"
                                  className="w-full border-b-2 border-emerald-400 outline-none px-1 bg-transparent font-bold text-gray-800"
                                  value={unitInput}
                                  onChange={(e) => setUnitInput(e.target.value)}
                                  placeholder="Escribe o elige una unidad"
                                />
                                <datalist id="productModalUnitsList">
                                  {units.map((u) => (
                                    <option key={u.produnitID} value={u.produnitName} />
                                  ))}
                                </datalist>
                              </>
                            ) : isEditing && row.ed && row.select ? (
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
                        )
                      ))}
                    </tbody>
                  </table>
                  {/* Un solo datalist para todos los renglones de proveedor
                      (puede haber varios) — cada input lo referencia por id. */}
                  <datalist id="productModalSuppliersList">
                    {suppliers.map((s) => (
                      <option key={s.suppCode} value={s.supplierName} />
                    ))}
                  </datalist>
                </div>
              </div>

            </div>

            {/* 3. SECCIÓN DERECHA: DESCUENTO Y EXPECTATIVA DE VENTA (3 columnas).
                La descripción ya NO va aquí (ver más abajo, fuera del grid). */}
            <div className="lg:col-span-3 flex flex-col gap-8">
              {tieneDescuento ? (
                // Tamaño dinámico: en solo-lectura, el bloque se ajusta nada
                // más al número y el "%" (sin los botones, que solo existen
                // en DOM cuando isEditing); al activar "Editar" en la ventana
                // general, crece para dar lugar al input y los botones.
                <div className={`text-center bg-emerald-50 rounded-3xl border-2 border-emerald-100 shadow-inner flex flex-col items-center transition-all ${isEditing ? 'p-6 gap-4' : 'p-4 gap-1'}`}>
                  <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">
                    Promoción Vigente
                  </p>
                  {isEditing ? (
                    <>
                      <div className="flex items-center gap-1 text-emerald-900">
                        <span className="text-4xl font-black">-</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="1-100"
                          value={discountPercentInput}
                          onChange={(e) => handleDiscountPercentChange(e.target.value)}
                          className="w-20 text-4xl font-black text-center bg-transparent border-b-4 border-emerald-300 focus:border-emerald-600 outline-none"
                        />
                        <span className="text-4xl font-black">%</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handleSaveDiscount}
                          disabled={savingDiscount || discountPercentInput === ''}
                          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Check className="w-3.5 h-3.5" /> <span className="hidden md:inline">{savingDiscount ? "Guardando..." : "Guardar"}</span>
                        </button>
                        <button
                          onClick={handleDeleteDiscount}
                          disabled={deletingDiscount}
                          className="flex items-center gap-1.5 bg-red-500 hover:bg-red-700 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> <span className="hidden md:inline">{deletingDiscount ? "Eliminando..." : "Eliminar"}</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="text-4xl font-black text-emerald-900">
                      -{(Number(formData.promo?.discountPercentage) * 100).toFixed(0)}%
                    </p>
                  )}
                </div>
              ) : (
                <div className="h-40 border-2 border-dashed border-gray-100 rounded-3xl flex items-center justify-center text-gray-300 italic text-sm">
                  Sin descuentos registrados
                </div>
              )}

              {/* Expectativa de venta: cuánto se espera vender por unidad de
                  tiempo. Se guarda/edita/borra sola (no depende del "Editar"
                  general del producto), igual que el bloque de descuento. */}
              <div className={`text-center bg-sky-50 rounded-3xl border-2 border-sky-100 shadow-inner flex flex-col items-center transition-all ${editingExpectation ? 'p-6 gap-4' : 'p-4 gap-1'}`}>
                <p className="text-xs font-black text-sky-600 uppercase tracking-widest flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" /> Expectativa de Venta
                </p>
                {editingExpectation ? (
                  <>
                    <div className="flex flex-col items-center gap-3 w-full">
                      <div className="flex items-center gap-2 text-sky-900">
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="Cantidad"
                          value={expectationQuantityInput}
                          onChange={(e) => handleExpectationQuantityChange(e.target.value)}
                          className="w-20 text-3xl font-black text-center bg-transparent border-b-4 border-sky-300 focus:border-sky-600 outline-none"
                        />
                        <span className="text-sm font-bold">unid. cada</span>
                      </div>
                      <div className="flex items-center gap-2 text-sky-900">
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="1"
                          value={expectationPeriodLengthInput}
                          onChange={(e) => handleExpectationPeriodLengthChange(e.target.value)}
                          className="w-12 text-lg font-black text-center bg-transparent border-b-2 border-sky-300 focus:border-sky-600 outline-none"
                        />
                        <select
                          value={expectationUnitInput}
                          onChange={(e) => setExpectationUnitInput(e.target.value)}
                          className="border-b-2 border-sky-300 focus:border-sky-600 outline-none bg-transparent font-bold text-sky-900 text-sm px-2 py-1 cursor-pointer"
                        >
                          {Object.entries(EXPECTATION_UNIT_OPTIONS).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap justify-center">
                      <button
                        onClick={handleSaveExpectation}
                        disabled={savingExpectation || expectationQuantityInput === '' || expectationPeriodLengthInput === ''}
                        className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Check className="w-3.5 h-3.5" /> <span className="hidden md:inline">{savingExpectation ? "Guardando..." : "Guardar"}</span>
                      </button>
                      <button
                        onClick={() => {
                          setEditingExpectation(false);
                          setExpectationQuantityInput(expectation ? expectation.quantity : '');
                          setExpectationPeriodLengthInput(expectation ? expectation.periodLength : 1);
                          setExpectationUnitInput(expectation?.timeUnit?.timeunitName || 'días');
                        }}
                        className="flex items-center gap-1.5 bg-gray-400 hover:bg-gray-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-sm transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> <span className="hidden md:inline">Cancelar</span>
                      </button>
                      {expectation && (
                        <button
                          onClick={handleDeleteExpectation}
                          disabled={deletingExpectation}
                          className="flex items-center gap-1.5 bg-red-500 hover:bg-red-700 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> <span className="hidden md:inline">{deletingExpectation ? "Eliminando..." : "Eliminar"}</span>
                        </button>
                      )}
                    </div>
                  </>
                ) : expectation ? (
                  <>
                    <p className="text-2xl font-black text-sky-900">
                      {expectation.quantity} <span className="text-sm font-bold">unid. cada {expectation.periodLength} {EXPECTATION_UNIT_OPTIONS[expectation.timeUnit?.timeunitName || 'días'] || expectation.timeUnit?.timeunitName}</span>
                    </p>
                    <p className="text-sm font-bold text-sky-700">
                      Vendido: {expectation.soldQuantity ?? 0} / {expectation.quantity}
                    </p>
                    <div className="w-full max-w-40 h-2 bg-sky-100 rounded-full overflow-hidden my-1">
                      <div
                        className={`h-full rounded-full ${expectation.fulfilled ? 'bg-emerald-500' : expectation.periodEnded ? 'bg-red-500' : 'bg-sky-500'}`}
                        style={{ width: `${Math.min(100, Math.round(((expectation.soldQuantity ?? 0) / expectation.quantity) * 100))}%` }}
                      />
                    </div>
                    {expectation.fulfilled ? (
                      <span className="text-xs font-black text-emerald-700 bg-emerald-100 rounded-full px-3 py-1">✅ Cumplida</span>
                    ) : expectation.periodEnded ? (
                      <span className="text-xs font-black text-red-700 bg-red-100 rounded-full px-3 py-1">❌ No cumplida (venció {formatDateOnly(expectation.endDate)})</span>
                    ) : (
                      <span className="text-xs font-black text-sky-700 bg-sky-100 rounded-full px-3 py-1">⏳ En progreso · vence {formatDateOnly(expectation.endDate)}</span>
                    )}
                    {canEditProduct && (
                      <button
                        onClick={() => setEditingExpectation(true)}
                        className="text-xs font-bold text-sky-600 hover:text-sky-800 underline mt-1 cursor-pointer"
                      >
                        Editar
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-400 italic">Sin expectativa registrada</p>
                    {canEditProduct && (
                      <button
                        onClick={() => setEditingExpectation(true)}
                        className="text-xs font-bold text-sky-600 hover:text-sky-800 underline mt-1 cursor-pointer"
                      >
                        + Agregar
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Descripción técnica: se movió fuera de la columna angosta de la
              derecha (Descuento/Expectativa) para que pueda extenderse a todo
              el ancho del modal — en esa columna un texto largo dejaba
              muchísimo espacio en blanco debajo de las otras dos tarjetas. */}
          <div className="mt-10">
            <h4 className="font-black text-gray-400 border-b-4 border-emerald-500 inline-block mb-4 uppercase text-[11px] tracking-tighter">
              Descripción Técnica:
            </h4>
            {isEditing ? (
              <textarea
                className="w-full p-4 border-2 border-gray-200 rounded-2xl text-sm h-40 focus:border-emerald-500 outline-none transition-all bg-emerald-50/10"
                value={formData.description || ''}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            ) : (
              <p className="text-gray-600 leading-relaxed text-sm italic font-medium bg-gray-50 p-4 rounded-2xl border border-gray-100 whitespace-pre-wrap">
                {formData.description || "Sin descripción disponible."}
              </p>
            )}
          </div>

          {/* BOTONES FINALES DE ACCIÓN — en celular (exclusivo), solo ícono,
              sin texto, en todas las versiones "Eliminar" queda al final a la
              derecha para que "Editar" quede en medio de la fila. */}
          <div className="flex justify-center gap-6 mt-16 pt-10 border-t-2 border-gray-50">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 md:px-8 md:py-3 rounded-2xl font-black shadow-xl transition-all active:scale-95 cursor-pointer flex items-center gap-2 md:gap-3 uppercase text-sm md:text-base"
                >
                  <Check className="w-4 h-4 md:w-5 md:h-5" /> <span className="hidden md:inline">Guardar Cambios</span>
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData(selectedProduct);
                    setLocalPictures(selectedProduct.pictures || []);
                    setCategoryInput(selectedProduct.category?.categoryName || '');
                    setUnitInput(selectedProduct.unit?.produnitName || '');
                    setSupplierInputs(selectedProduct.suppliers?.length ? selectedProduct.suppliers.map((s) => s.supplierName) : ['']);
                  }}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-5 py-2 md:px-8 md:py-3 rounded-2xl font-black shadow-xl transition-all cursor-pointer flex items-center gap-2 md:gap-3 uppercase text-sm md:text-base"
                >
                  <RotateCcw className="w-4 h-4 md:w-5 md:h-5" /> <span className="hidden md:inline">Cancelar</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handlePrintLabel}
                  disabled={printingLabel}
                  className="bg-gray-700 hover:bg-gray-900 text-white px-5 py-2 md:px-8 md:py-3 rounded-2xl font-black shadow-xl transition-all hover:-translate-y-2 cursor-pointer flex items-center gap-2 md:gap-3 uppercase tracking-wider text-sm md:text-base disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  <Barcode className="w-4 h-4 md:w-5 md:h-5" /> <span className="hidden md:inline">Imprimir etiqueta</span>
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  disabled={!canEditProduct}
                  title={canEditProduct ? undefined : 'No tienes permiso para editar productos'}
                  className="bg-[#3ab0e2] hover:bg-emerald-600 text-white px-5 py-2 md:px-8 md:py-3 rounded-2xl font-black shadow-xl transition-all hover:-translate-y-2 cursor-pointer flex items-center gap-2 md:gap-3 uppercase tracking-wider text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  <Edit3 className="w-4 h-4 md:w-5 md:h-5" /> <span className="hidden md:inline">Editar</span>
                </button>
                <button
                  onClick={handleDelete}
                  disabled={!canEditProduct}
                  title={canEditProduct ? undefined : 'No tienes permiso para eliminar productos'}
                  className="bg-red-500 hover:bg-red-700 text-white px-5 py-2 md:px-8 md:py-3 rounded-2xl font-black shadow-xl transition-all hover:-translate-y-2 cursor-pointer flex items-center gap-2 md:gap-3 uppercase tracking-wider text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  <Trash2 className="w-4 h-4 md:w-5 md:h-5" /> <span className="hidden md:inline">Eliminar</span>
                </button>
              </>
            )}
          </div>

          {/* Motivo por el que no se pudo eliminar (p. ej. ya se usó en una
              venta/pedido registrado) — se queda visible en vez de solo un
              alert pasajero, hasta que se cierre el modal o se reintente. */}
          {deleteError && (
            <div className="mt-6 bg-red-50 border-2 border-red-200 text-red-700 text-sm rounded-2xl px-6 py-4 text-center">
              <span className="font-black uppercase tracking-wide text-xs block mb-1">No se pudo eliminar</span>
              {deleteError}
            </div>
          )}
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

      {/* Menú "Imprimir etiqueta": la terminal tiene 2 impresoras conectadas
          (tickets y códigos de barras), así que en vez de imprimir directo se
          confirma primero cuál usar — un navegador no puede elegir la
          impresora en silencio, así que ambos botones abren el mismo diálogo
          nativo del sistema, donde sí aparecen las 2 impresoras detectadas. */}
      {labelMenuOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4 print:hidden">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4 animate-fade-in">
            <div className="text-center">
              <h2 className="text-lg font-bold text-gray-900">Etiqueta lista para imprimir</h2>
              <p className="text-sm text-gray-500">SKU: {formData.sku || formData.prodCode}</p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-3 border border-gray-300 hover:bg-gray-50 text-gray-800 rounded-lg py-2.5 px-4 text-sm font-medium transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 shrink-0" />
                Seleccionar impresora
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-3 bg-gray-800 hover:bg-gray-950 text-white rounded-lg py-2.5 px-4 text-sm font-medium shadow-sm transition-colors cursor-pointer"
              >
                <Barcode className="w-4 h-4 shrink-0" />
                Imprimir etiqueta
              </button>
            </div>

            <button
              onClick={() => setLabelMenuOpen(false)}
              className="text-sm text-gray-500 hover:text-gray-700 self-center mt-1 cursor-pointer transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Área imprimible de la etiqueta — oculta en pantalla, solo se muestra
          (y solo ella) dentro del diálogo de impresión, igual que
          TicketPrintModal. La rotación/espejo vienen de "Editar etiquetas". */}
      <div
        id="label-print-area"
        className="hidden print:flex flex-col items-center gap-2 bg-white text-black"
        style={{
          transform: `rotate(${(labelConfig?.etiquetaVertical ? 90 : 0) + (labelConfig?.etiquetaRotar ? 180 : 0)}deg) scaleX(${labelConfig?.etiquetaEspejo ? -1 : 1})`,
        }}
      >
        <div className="font-bold text-sm text-center" style={{ fontFamily: 'sans-serif' }}>
          {formData.productName}
        </div>
        <svg ref={labelBarcodeRef} />
        {labelConfig?.etiquetaFechaHora && (
          <div className="text-xs" style={{ fontFamily: 'sans-serif' }}>
            {new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}
          </div>
        )}
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #label-print-area, #label-print-area * { visibility: visible; }
          #label-print-area {
            position: absolute;
            top: 0;
            left: 0;
          }
          @page {
            size: auto;
            margin: 8mm;
          }
        }
      `}</style>
    </div>
  );
}
