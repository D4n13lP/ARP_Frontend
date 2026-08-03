// import { Search, ChevronRight, Package, ArrowUpDown } from 'lucide-react'
// import logoEmpresa from '../assets/logo_empresa.jpg' // Extensión corregida a .jpeg
// import ProductCard from '../components/ProductCard'
// import { useProductFilter } from '../hooks/useProductFilter'
// import type { Category, Product } from '../types'

// export default function ProductCatalog_Page() {
//   // Simulación de datos (En el futuro vendrán de un fetch/store)
//   const categorias: Category[] = ["Adhesivos", "Adoquín", "Cantera laminada", "Figuras", "Macetas", "Mármol", "Fuentes", "Laja"];
  
//   const productosBase: Product[] = [
//     { id: 'M-01', nombre: 'Maceta Conejo Amarilla', imagen: 'https://via.placeholder.com/150', precio: 249.0, categoria: 'Macetas' },
//     { id: 'M-02', nombre: 'Maceta Puerquito', imagen: 'https://via.placeholder.com/150', precio: 180.0, categoria: 'Macetas' },
//     // Agrega más aquí para ver el grid lleno
//   ];

//   const {
//     selectedCategory, setSelectedCategory,
//     searchCode, setSearchCode,
//     searchName, setSearchName,
//     filteredProducts,
//     toggleSortOrder
//   } = useProductFilter(productosBase);

//   return (
//     <div className="min-h-screen bg-white px-2 md:px-6 py-4 md:py-8 animate-fade-in">
      
//       {/* HEADER: Logo a la izquierda, Título al centro */}
//       <header className="relative w-full flex items-center justify-center mb-12 min-h-[80px]">
//         <div className="absolute left-0 hidden sm:block">
//           <img 
//             src={logoEmpresa} 
//             alt="Logo Empresa" 
//             className="h-16 md:h-20 object-contain" 
//           />
//         </div>
        
//         <div className="flex items-center gap-4">
//           <h1 className="text-4xl md:text-5xl text-[#e65100] font-light italic">Productos</h1>
//           <div className="bg-[#e65100] p-2 rounded-lg text-white shadow-md">
//             <Package size={35} />
//           </div>
//         </div>
//       </header>

//       {/* Contenedor con ancho máximo ampliado (max-w-[1600px]) para reducir márgenes laterales */}
//       <div className="flex flex-col lg:flex-row gap-6 max-w-[1600px] mx-auto">
        
//         {/* MENÚ LATERAL */}
//         <aside className="w-full lg:w-60 flex-shrink-0">
//           <div className="bg-gray-100 p-3 rounded-t-xl border-x border-t border-gray-200">
//             <h2 className="text-md font-bold text-center text-gray-600 uppercase tracking-widest">Categorías</h2>
//           </div>
//           <div className="bg-white border border-gray-200 rounded-b-xl shadow-sm overflow-hidden">
//             {categorias.map((cat) => (
//               <button
//                 key={cat}
//                 onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
//                 className={`w-full flex items-center justify-between p-3 border-b border-gray-50 last:border-0 transition-all group cursor-pointer
//                   ${selectedCategory === cat 
//                     ? 'bg-emerald-500 text-white' 
//                     : 'hover:bg-emerald-50 text-gray-500 hover:text-emerald-600'}`}
//               >
//                 <span className="text-xs font-bold uppercase">{cat}</span>
//                 <ChevronRight size={14} className={`transition-transform ${selectedCategory === cat ? 'translate-x-1' : 'group-hover:translate-x-1'}`} />
//               </button>
//             ))}
//           </div>
//         </aside>

//         {/* CONTENIDO PRINCIPAL: Búsqueda y Grid más amplio */}
//         <main className="flex-grow space-y-6">
          
//           <section className="flex flex-wrap items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
//             <div className="flex-1 min-w-[150px] flex border border-gray-300 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-emerald-400 transition-all">
//               <input 
//                 type="text" placeholder="Código" className="p-2 w-full outline-none text-sm"
//                 value={searchCode} onChange={(e) => setSearchCode(e.target.value)}
//               />
//               <button className="bg-[#3ab0e2] p-2 text-white hover:bg-emerald-500 cursor-pointer transition-colors">
//                 <Search size={18} />
//               </button>
//             </div>

//             <div className="flex-1 min-w-[200px] flex border border-gray-300 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-emerald-400 transition-all">
//               <input 
//                 type="text" placeholder="Nombre del producto" className="p-2 w-full outline-none text-sm"
//                 value={searchName} onChange={(e) => setSearchName(e.target.value)}
//               />
//               <button className="bg-[#3ab0e2] p-2 text-white hover:bg-emerald-500 cursor-pointer transition-colors">
//                 <Search size={18} />
//               </button>
//             </div>

//             <button
//               onClick={toggleSortOrder}
//               disabled={filteredProducts.length === 0}
//               className="p-2 rounded-lg border-2 border-[#3ab0e2] text-[#3ab0e2] hover:bg-[#3ab0e2] hover:text-white transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
//             >
//               <ArrowUpDown size={20} />
//             </button>
//           </section>

//           {/* GRID: Incrementado el número de columnas para pantallas grandes */}
//           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 justify-items-center">
//             {filteredProducts.map(p => (
//               <ProductCard key={p.id} product={p} />
//             ))}
//           </div>

//           {filteredProducts.length === 0 && (
//             <div className="text-center py-20">
//               <p className="text-gray-400 italic">No se encontraron productos en esta selección.</p>
//             </div>
//           )}
//         </main>
//       </div>
//     </div>
//   )
// }

import { useEffect } from 'react'
import { ArrowLeft, Search, ChevronRight, Package, ArrowUpDown, X } from 'lucide-react'
import logoEmpresa from '../assets/logo_empresa.jpg'
import ProductCard from '../components/ProductCard'
import ProductModal from '../components/ProductModal' // Importa el modal
import { useProductFilter } from '../hooks/useProductFilter'
import { useAppStore } from '../stores/useAppStore'
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../api/products'
import { getCategories } from '../api/categories'

export default function ProductCatalog_Page() {
  // Traemos los datos y acciones del Store global
  const products = useAppStore((state) => state.products)
  const categories = useAppStore((state) => state.categories)
  const selectedCategory = useAppStore((state) => state.selectedCategory)
  const setSelectedCategory = useAppStore((state) => state.setSelectedCategory)
  const setProducts = useAppStore((state) => state.setProducts)
  const setCategories = useAppStore((state) => state.setCategories)
  const navigate = useNavigate(); // Hook para navegar

  useEffect(() => {
    getProducts().then(setProducts)
    getCategories().then(setCategories)
  }, [setProducts, setCategories])

  // Solo mostramos en el filtro las categorías que algún producto esté usando
  const usedCategories = categories.filter((cat) =>
    products.some((p) => p.categoryID === cat.categoryID)
  )

  // Si la categoría seleccionada deja de tener productos, quitamos el filtro
  useEffect(() => {
    if (selectedCategory && !usedCategories.some((cat) => cat.categoryID === selectedCategory)) {
      setSelectedCategory(null)
    }
  }, [selectedCategory, usedCategories, setSelectedCategory])

  // Hook de filtrado (ahora usa la categoría del Store)
  const {
    searchCode, setSearchCode,
    searchName, setSearchName,
    filteredProducts,
    toggleSortOrder
  } = useProductFilter(products, selectedCategory);

  return (
    <div className="min-h-screen bg-white py-4 md:py-8 animate-fade-in">
      
      {/* HEADER ALINEADO */}
      <header className="max-w-[1600px] mx-auto px-2 md:px-6 mb-12 relative flex items-center justify-center">
        
        {/* Contenedor del Logo y Botón Regresar */}
        <div className="absolute left-2 md:left-6 flex items-center gap-4">
          <button 
            type="button"
            onClick={() => navigate(-1)} 
            className="group flex items-center gap-2 text-gray-400 hover:text-emerald-500 transition-all cursor-pointer"
          >
            <div className="p-2 rounded-full group-hover:bg-emerald-50 transition-colors">
              <ArrowLeft size={24} />
            </div>
            <span className="hidden md:block font-semibold text-sm uppercase tracking-wider">
              Atras
            </span>
          </button>

          <div className="h-10 w-[1px] bg-gray-200 hidden md:block"></div>

          <img 
            src={logoEmpresa} 
            alt="Logo" 
            className="h-12 md:h-16 object-contain hidden sm:block" 
          />

          {/* Colocamos el componente aquí. 
          Como es un 'fixed' con 'z-50', se encimará a todo el catálogo cuando se active.
          */}
          <ProductModal />
        </div>
        
        {/* Título centrado */}
        <div className="flex items-center gap-4">
          <h1 className="text-4xl md:text-5xl text-[#e65100] font-light italic">Productos</h1>
          <div className="bg-[#e65100] p-2 rounded-lg text-white shadow-md">
            <Package size={35} />
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-6 max-w-[1600px] mx-auto px-2 md:px-6">
        
        {/* MENÚ LATERAL */}
        <aside className="w-full lg:w-60 flex-shrink-0">
          <div className="bg-gray-100 p-3 rounded-t-xl border-x border-t border-gray-200">
            <h2 className="text-md font-bold text-center text-gray-600 uppercase tracking-widest">Categorías</h2>
          </div>
          <div className="bg-white border border-gray-200 rounded-b-xl shadow-sm overflow-hidden">
            {usedCategories.map((cat) => (
              <button
                key={cat.categoryID}
                onClick={() => setSelectedCategory(cat.categoryID === selectedCategory ? null : cat.categoryID)}
                className={`w-full flex items-center justify-between p-3 border-b border-gray-50 last:border-0 transition-all group cursor-pointer
                  ${selectedCategory === cat.categoryID
                    ? 'bg-emerald-500 text-white shadow-inner'
                    : 'hover:bg-emerald-50 text-gray-500 hover:text-emerald-600'}`}
              >
                <span className="text-xs font-bold uppercase">{cat.categoryName}</span>
                {selectedCategory === cat.categoryID ? (
                  <span className="relative inline-flex items-center justify-center w-4 h-4" title="Quitar filtro">
                    {/* Mouse: flecha por defecto, se convierte en X al pasar el mouse encima */}
                    <ChevronRight size={14} className="pointer-fine:group-hover:hidden pointer-coarse:hidden" />
                    <X size={14} className="hidden pointer-fine:group-hover:inline-flex pointer-coarse:inline-flex" />
                  </span>
                ) : (
                  <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" />
                )}
              </button>
            ))}
          </div>
        </aside>

        {/* GRID DE PRODUCTOS */}
        <main className="flex-grow space-y-6">
          <section className="flex flex-wrap items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div className="flex-1 min-w-[150px] flex border border-gray-300 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-emerald-400 transition-all">
              <input 
                type="text" placeholder="Código" className="p-2 w-full outline-none text-sm"
                value={searchCode} onChange={(e) => setSearchCode(e.target.value)}
              />
              <button className="bg-[#3ab0e2] p-2 text-white hover:bg-emerald-500 cursor-pointer transition-colors">
                <Search size={18} />
              </button>
            </div>

            <div className="flex-1 min-w-[200px] flex border border-gray-300 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-emerald-400 transition-all">
              <input 
                type="text" placeholder="Nombre del producto" className="p-2 w-full outline-none text-sm"
                value={searchName} onChange={(e) => setSearchName(e.target.value)}
              />
              <button className="bg-[#3ab0e2] p-2 text-white hover:bg-emerald-500 cursor-pointer transition-colors">
                <Search size={18} />
              </button>
            </div>

            <button
              onClick={toggleSortOrder}
              disabled={filteredProducts.length === 0}
              className="p-3 rounded-lg border-2 border-[#3ab0e2] text-[#3ab0e2] hover:bg-[#3ab0e2] hover:text-white transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowUpDown size={20} />
            </button>
          </section>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 justify-items-center">
            {filteredProducts.map(p => (
              <ProductCard key={p.prodCode} product={p} />
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}