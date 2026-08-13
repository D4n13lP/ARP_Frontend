import { useEffect } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { getDashboardMetrics } from '../api/dashboard';
import type { MetricTableItem } from '../types';

export default function IndicatorsPage() {
  const { stats, masVendidos, recienLlegados, productosRezagados, ultimasVentas, pedidosPorVencer, usuariosTopVentas, setMetrics } = useAppStore();

  useEffect(() => {
    getDashboardMetrics().then(setMetrics);
  }, [setMetrics]);

  const fechaActual = new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  return (
    <div className="min-h-screen bg-white p-6 md:p-10">
      {/* Contenedor Maestro: Centraliza todo el contenido de la página */}
      <div className="max-w-6xl mx-auto">
        
        {/* Título - Alineado a la izquierda del contenedor centrado */}
        <h1 className="text-3xl md:text-4xl font-normal text-[#e65100] mb-10">
          Indicadores {fechaActual}
        </h1>

        {/* Sección de Tarjetas: Centradas mediante grid y mx-auto */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 justify-items-center">
          <StatCard color="bg-[#ffcc33]" icon="$" value={stats.ventas.toLocaleString()} label="Ventas" />
          <StatCard color="bg-[#e35336]" icon="🛒" value={stats.pedidos} label="Pedidos" />
          <StatCard color="bg-[#af5c37]" icon="🕸️" value={stats.rezagados} label="Rezagados" />
        </div>

        {/* Sección de Tablas: Grid de 2 columnas centrado */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-12">
          <MetricTable 
            title="PRODUCTOS MÁS VENDIDOS" 
            data={masVendidos} 
            columns={['#', 'Producto', 'Cantidad', 'Importe']} 
          />
          <MetricTable 
            title="PRODUCTOS RECIEN LLEGADOS" 
            data={recienLlegados} 
            columns={['#', 'Producto', 'Cantidad']} 
          />
          <MetricTable
            title="PRODUCTOS REZAGADOS"
            data={productosRezagados}
            // "Rezagado" = no cumplió su expectativa de venta dentro del
            // plazo fijado (ver dashboard.controller.ts) — "Faltan" es cuánto
            // le faltó vender para llegar a la meta, no stock disponible.
            columns={['#', 'Producto', 'Faltan', 'Tiempo']}
          />
          <MetricTable
            title="ÚLTIMAS VENTAS"
            data={ultimasVentas}
            columns={['#', 'Producto', 'Cantidad', 'Importe']}
          />
          <MetricTable
            title="PEDIDOS POR VENCER"
            data={pedidosPorVencer}
            // Pedidos aún no entregados, ordenados por fecha de entrega más
            // próxima primero (los ya vencidos quedan arriba, son los más
            // urgentes) — "Cantidad" es el total de unidades del pedido.
            columns={['#', 'Pedido', 'Cantidad', 'Tiempo']}
          />
          <MetricTable
            title="USUARIOS CON MÁS VENTAS"
            data={usuariosTopVentas}
            // Suma de ventas (transType "sale") registradas por cada usuario,
            // no pedidos — "Cantidad" es el número de ventas, "Importe" el
            // monto acumulado.
            columns={['#', 'Usuario', 'Cantidad', 'Importe']}
          />
        </div>
      </div>
    </div>
  );
}

// Sub-componente Tarjeta (Ajustado para tamaño uniforme)
function StatCard({ color, icon, value, label }: { color: string, icon: string, value: any, label: string }) {
  return (
    <div className="flex bg-white shadow-md border border-gray-200 rounded-sm w-full max-w-[320px] h-28 overflow-hidden">
      <div className={`${color} w-1/3 flex items-center justify-center text-white text-4xl shadow-inner`}>
        {icon}
      </div>
      <div className="w-2/3 flex flex-col justify-center items-center bg-white px-2">
        <span className="text-2xl font-bold text-gray-700 tracking-tight">{value}</span>
        <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">{label}</span>
      </div>
    </div>
  );
}

// Formatea el valor de una columna extra (todo lo que no sea "#"/"Producto")
// contra el campo de MetricTableItem que le corresponde por nombre. Antes
// estas columnas se declaraban pero nunca se dibujaban (siempre quedaban
// celdas vacías) aunque el backend sí mandaba el dato.
function formatMetricValue(col: string, item: MetricTableItem): string {
  switch (col) {
    case 'Cantidad':
    case 'Faltan':
      return item.cantidad.toLocaleString('es-MX');
    case 'Importe':
      return item.importe !== undefined
        ? `$${item.importe.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : '';
    case 'Tiempo':
      return item.tiempo || '';
    default:
      return '';
  }
}

// Sub-componente Tabla (Con sombra suave y bordes rectos como la imagen)
function MetricTable({ title, data, columns }: { title: string, data: MetricTableItem[], columns: string[] }) {
  const extraColumns = columns.slice(2);

  return (
    <div className="flex flex-col shadow-[0_4px_10px_rgba(0,0,0,0.1)] rounded-sm">
      <div className="bg-[#dcdcdc] py-2 px-4 text-center font-bold text-gray-700 uppercase text-sm tracking-wide border-b border-gray-300">
        {title}
      </div>
      <div className="bg-white p-5">
        {/* Escritorio/tablet (>= md), intacta */}
        <table className="w-full text-left border-collapse border border-gray-300 hidden md:table">
          <thead>
            <tr className="bg-[#f2f2f2]">
              {columns.map((col, i) => (
                <th key={i} className="border border-gray-300 p-2 text-[13px] font-bold text-gray-700">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((item, idx) => (
                <tr key={idx} className="h-9 hover:bg-gray-50 transition-colors">
                  <td className="border border-gray-300 p-2 text-sm text-center w-10">{idx + 1}</td>
                  <td className="border border-gray-300 p-2 text-sm">{item.producto}</td>
                  {extraColumns.map((col, j) => (
                    <td key={j} className="border border-gray-300 p-2 text-sm">{formatMetricValue(col, item)}</td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="border border-gray-300 p-3 text-sm text-center text-gray-400 italic">
                  Sin datos disponibles
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Tarjetas — celulares (< md). Mismos datos que la tabla de escritorio. */}
        <div className="md:hidden flex flex-col gap-2">
          {data.length > 0 ? (
            data.map((item, idx) => (
              <div key={idx} className="border border-gray-300 rounded-lg p-2.5 flex items-center gap-3 text-sm">
                <span className="shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-700 font-bold text-xs flex items-center justify-center">{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium text-gray-800">{item.producto}</p>
                  {extraColumns.length > 0 && (
                    <p className="text-xs text-gray-500 flex gap-3 flex-wrap mt-0.5">
                      {extraColumns.map((col, j) => {
                        const value = formatMetricValue(col, item);
                        return value ? <span key={j}>{col}: {value}</span> : null;
                      })}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-center text-gray-400 italic py-3">Sin datos disponibles</p>
          )}
        </div>
      </div>
    </div>
  );
}