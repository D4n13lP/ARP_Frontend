import React, { useState } from 'react'

export interface TabConfig {
  id: string
  label: string
  component: React.ReactNode
  hideNavigation?: boolean
}

interface ProductTabsProps {
  tabs: TabConfig[]
  onSubmit?: (data: any) => void
  onBack?: () => void
  currentTabIndex?: number
  onTabChange?: (index: number) => void
}

export default function ProductTabs({ tabs, onSubmit, onBack, currentTabIndex: externalIndex, onTabChange }: ProductTabsProps) {
  const [internalIndex, setInternalIndex] = useState(0)

  const isControlled = externalIndex !== undefined && onTabChange !== undefined
  const currentTabIndex = isControlled ? externalIndex : internalIndex

  const handleSetTabIndex = (index: number) => {
    if (isControlled) {
      onTabChange(index)
    } else {
      setInternalIndex(index)
    }
  }

  const handleNext = () => {
    if (currentTabIndex < tabs.length - 1) {
      handleSetTabIndex(currentTabIndex + 1)
    }
  }

  const handlePrev = () => {
    if (currentTabIndex > 0) {
      handleSetTabIndex(currentTabIndex - 1)
    }
  }

  const handleSave = () => {
    if (onSubmit) onSubmit({})
  }

  const isFirstTab = currentTabIndex === 0
  const isLastTab = currentTabIndex === tabs.length - 1
  const hideNavigation = tabs[currentTabIndex].hideNavigation

  return (
    <div className="w-full max-w-7xl mx-auto pb-16">
      {/* TABS HEADER (Estilo folder) */}
      <div className="flex px-4 items-end">
        {tabs.map((tab, index) => {
          const isActive = currentTabIndex === index
          return (
            <button
              key={tab.id}
              onClick={() => handleSetTabIndex(index)}
              className={`px-8 py-3 text-sm transition-all whitespace-nowrap rounded-t-lg z-10 relative
                ${
                  isActive
                    ? 'text-gray-800 bg-white border border-gray-300 border-b-white font-medium shadow-[0_-2px_4px_rgba(0,0,0,0.02)] -mb-[1px]'
                    : 'text-[#3ab0e2] bg-transparent border-transparent hover:bg-gray-50 mb-[1px]'
                }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* TAB CONTENT (Caja blanca) */}
      <div className="bg-white border border-gray-300 rounded-lg rounded-tl-none p-8 shadow-sm">
        {/* Inject navigation callbacks to the active component if it needs them */}
        {React.isValidElement(tabs[currentTabIndex].component)
          ? React.cloneElement(tabs[currentTabIndex].component as React.ReactElement<any>, {
              onNextTab: handleNext,
              onPrevTab: handlePrev,
              onSubmit: handleSave
            })
          : tabs[currentTabIndex].component}
        
        {/* BOTONES DE NAVEGACIÓN DENTRO DE LA CAJA */}
        {!hideNavigation && (
          <div className="mt-8 flex gap-4 justify-end pt-4">
            {!isFirstTab && (
              <button
                onClick={handlePrev}
                className="bg-gray-400 hover:bg-gray-500 text-white py-2 px-8 text-sm transition-colors duration-300 cursor-pointer"
              >
                Anterior
              </button>
            )}

            {!isLastTab ? (
              <button
                onClick={handleNext}
                className="bg-[#3ab0e2] hover:bg-[#16A085] text-white py-2 px-8 text-sm transition-colors duration-300 cursor-pointer"
              >
                Siguiente
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="bg-[#3ab0e2] hover:bg-[#16A085] text-white py-2 px-8 text-sm transition-colors duration-300 cursor-pointer"
              >
                Guardar Producto
              </button>
            )}
          </div>
        )}
      </div>

    </div>
  )
}
