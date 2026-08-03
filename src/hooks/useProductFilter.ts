import { useState, useMemo } from 'react'
import { type Product } from '../types'

export function useProductFilter(initialProducts: Product[], selectedCategory: string | null = null) {
  const [searchCode, setSearchCode] = useState('')
  const [searchName, setSearchName] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const filteredProducts = useMemo(() => {
    let result = [...initialProducts]

    // 1. Prioridad: Filtrar por Categoría
    if (selectedCategory) {
      result = result.filter(p => p.categoryID === selectedCategory)
    }
    // 2. Si no hay categoría, habilitar búsqueda por Código y Nombre
    else {
      if (searchCode) {
        result = result.filter(p =>
          p.prodCode.toLowerCase().includes(searchCode.toLowerCase())
        )
      }
      if (searchName) {
        result = result.filter(p =>
          p.productName.toLowerCase().includes(searchName.toLowerCase())
        )
      }
    }

    // 3. Ordenamiento por nombre
    result.sort((a, b) => {
      return sortOrder === 'asc'
        ? a.productName.localeCompare(b.productName)
        : b.productName.localeCompare(a.productName)
    })

    return result
  }, [initialProducts, selectedCategory, searchCode, searchName, sortOrder])

  return {
    // Estados
    searchCode,
    searchName,
    sortOrder,
    // Resultados
    filteredProducts,
    // Funciones para actualizar
    setSearchCode,
    setSearchName,
    toggleSortOrder: () => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
  }
}