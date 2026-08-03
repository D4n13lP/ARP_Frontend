import { useState, useEffect } from "react";

interface SalesPriceFormProps {
  onDataChange?: (data: any) => void;
  onPrevTab?: () => void;
  onSubmit?: () => void;
  costPrice?: number; // Precio de costo del producto
}

export default function SalesPriceForm({
  onDataChange,
  onPrevTab,
  onSubmit,
  costPrice = 100,
}: SalesPriceFormProps) {
  const [applySpecialPrice, setApplySpecialPrice] = useState(false);

  const [formData, setFormData] = useState({
    precioVenta: "",
    cantidad: "",
    cantTiempo: "",
    unidadTiempo: "días",
    importeTotal: "",
    ganancia: "",
  });

  const formClassName =
    "px-3 py-2 border border-gray-300 rounded focus:border-[#3ab0e2] focus:outline-none placeholder-gray-400 text-sm font-medium bg-white text-gray-800";
  const disabledClassName =
    "px-3 py-2 border border-gray-200 rounded text-sm font-medium bg-[#f5f5f5] text-gray-500 cursor-not-allowed";

  const handleInputChange = (field: string, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    if (onDataChange) onDataChange(newData);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      handleInputChange("precioVenta", value);
    }
  };

  const handleCantidadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      handleInputChange("cantidad", value);
      return;
    }
    const intVal = parseInt(value, 10);
    if (!isNaN(intVal) && intVal >= 1 && /^\d+$/.test(value)) {
      handleInputChange("cantidad", intVal.toString());
    }
  };

  const handleCantTiempoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      handleInputChange("cantTiempo", value);
      return;
    }
    const intVal = parseInt(value, 10);
    if (!isNaN(intVal) && intVal >= 1 && /^\d+$/.test(value)) {
      handleInputChange("cantTiempo", intVal.toString());
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setApplySpecialPrice(isChecked);

    if (!isChecked) {
      const newData = {
        ...formData,
        cantidad: "",
        cantTiempo: "",
        unidadTiempo: "días",
        importeTotal: "",
        ganancia: "",
      };
      setFormData(newData);
      if (onDataChange) onDataChange(newData);
    }
  };

  useEffect(() => {
    if (applySpecialPrice && formData.precioVenta) {
      const precio = parseFloat(formData.precioVenta) || 0;
      const cantidad = parseInt(formData.cantidad) || 0;

      if (precio > 0 && cantidad > 0) {
        const importeTotal = precio * cantidad;
        const ganancia = (precio - costPrice) * cantidad;

        setFormData((prev) => ({
          ...prev,
          importeTotal: (Math.round(importeTotal * 100) / 100).toString(),
          ganancia: (Math.round(ganancia * 100) / 100).toString(),
        }));
      } else {
        setFormData((prev) => ({ ...prev, importeTotal: "", ganancia: "" }));
      }
    }
  }, [formData.precioVenta, formData.cantidad, costPrice, applySpecialPrice]);

  return (
    <div className="w-full pb-0 pt-4 flex flex-col min-h-[500px]">
      <div className="w-full max-w-4xl mx-auto pl-8 flex-1">
        {/* Precio de Venta */}
        <div className="mb-12">
          <input
            type="text"
            placeholder="Ingrese precio de venta"
            value={formData.precioVenta}
            onChange={handlePriceChange}
            className={`${formClassName} w-[200px]`}
          />
        </div>

        {/* Formulario Grid para Expectativa de Venta */}
        <div className="grid grid-cols-[200px_1fr] md:grid-cols-[240px_1fr] gap-x-4 gap-y-6 items-center">
          {/* Fila 1: Checkbox */}
          <div className="flex justify-start">
            <span className="font-bold text-gray-800 text-[13px] md:text-[14px]">
              Aplicar espectativa de venta
            </span>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={applySpecialPrice}
              onChange={handleCheckboxChange}
              className="w-[18px] h-[18px] rounded border-gray-300 cursor-pointer accent-[#16A085]"
            />
          </div>

          {/* Fila 2: Cantidad y Unidades */}
          <div className="flex justify-start items-center gap-4 pr-2">
            <input
              type="text"
              placeholder="Cantidad"
              value={formData.cantidad}
              onChange={handleCantidadChange}
              disabled={!applySpecialPrice}
              className={`${formClassName} w-[90px] ${!applySpecialPrice ? "bg-gray-100 opacity-60 cursor-not-allowed" : ""}`}
            />
            <span className="font-bold text-gray-800 text-[13px] md:text-[14px]">
              Unidades en
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Unidades de tiempo"
              value={formData.cantTiempo}
              onChange={handleCantTiempoChange}
              disabled={!applySpecialPrice}
              className={`${formClassName} w-[140px] ${!applySpecialPrice ? "bg-gray-100 opacity-60 cursor-not-allowed" : ""}`}
            />
            <div className="relative">
              <select
                value={formData.unidadTiempo}
                onChange={(e) =>
                  handleInputChange("unidadTiempo", e.target.value)
                }
                disabled={!applySpecialPrice}
                className={`${formClassName} w-[125px] appearance-none pr-8 select-none ${!applySpecialPrice ? "bg-gray-100 opacity-60 cursor-not-allowed text-gray-500" : ""}`}
              >
                <option value="días">día(s)</option>
                <option value="semanas">semana(s)</option>
                <option value="meses">mes(es)</option>
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </div>
          </div>

          {/* Fila 3: Importe total */}
          <div className="flex justify-end pr-3">
            <span className="font-bold text-gray-800 text-[13px] md:text-[14px]">
              Importe total
            </span>
          </div>
          <div className="flex items-center">
            <input
              type="text"
              readOnly
              value={formData.importeTotal}
              className={`${disabledClassName} w-[222px]`}
            />
          </div>

          {/* Fila 4: Ganancia */}
          <div className="flex justify-end pr-3">
            <span className="font-bold text-gray-800 text-[13px] md:text-[14px]">
              Ganancia
            </span>
          </div>
          <div className="flex items-center">
            <input
              type="text"
              readOnly
              value={formData.ganancia}
              className={`${disabledClassName} w-[222px]`}
            />
          </div>
        </div>
      </div>

      {/* FOOTER BUTTONS */}
      <div className="mt-8 flex gap-4 pb-4 pr-4 justify-end">
        <button
          onClick={onPrevTab}
          className="bg-gray-400 hover:bg-gray-500 text-white py-2 px-8 text-sm transition-colors duration-300 cursor-pointer"
        >
          Anterior
        </button>

        <button
          onClick={() => {
            if (onSubmit) onSubmit();
          }}
          className="bg-[#3ab0e2] hover:bg-[#16A085] text-white py-2 px-8 text-sm transition-colors duration-300 cursor-pointer"
        >
          Agregar
        </button>
      </div>
    </div>
  );
}
