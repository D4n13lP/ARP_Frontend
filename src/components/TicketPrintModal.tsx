import { useEffect, useState } from 'react';
import { Settings2, Printer, Receipt, ArrowLeft } from 'lucide-react';
import logoEmpresa from '../assets/logo_empresa.jpg';
import { getTicketConfig } from '../api/ticketConfig';
import type { TicketConfig } from '../types';

export interface TicketItem {
  nombre: string;
  cantidad: number;
  unidad?: string;
  precio: number;
  importe: number;
}

// Todo lo que necesita el ticket para imprimirse — se arma una sola vez, justo
// después de que RegisterSale_Page/RegisterOrder_Page reciben la respuesta
// exitosa de createSale/createOrder, con los datos que ya tenían en pantalla
// (no hace falta volver a pedirle nada al backend, salvo los textos/etiquetas
// del ticket — ver TicketConfig, editable en EditTicketConfig_Page).
export interface TicketData {
  tipo: 'venta' | 'pedido';
  folio: string;
  fecha: Date;
  vendedor: string;
  cliente: string;
  // Domicilio/fecha de entrega: solo aplica a pedidos (una venta no los imprime).
  domicilio?: string | null;
  fechaEntrega?: string | null;
  items: TicketItem[];
  subtotal: number;
  descuento: number;
  costoEnvio: number;
  total: number;
  // Anticipo/restante: solo aplica a pedidos.
  anticipo?: number | null;
  restante?: number | null;
  tipoPago: string; // "Efectivo" / "Transferencia / tarjeta" / "Sin anticipo"
  totalPago: number; // Importe realmente cobrado en este momento (venta: total; pedido: anticipo)
  metodoPagoEsEfectivo: boolean; // si true, se pide "Efectivo entregado" para calcular el cambio
}

interface TicketPrintModalProps {
  data: TicketData | null;
  onClose: () => void;
}

type PrintView = 'menu' | 'config';

// Ajustes de la IMPRESORA física (ancho de papel/fuente/columnas) — a
// diferencia de TicketConfig (los TEXTOS del ticket), esto es por dispositivo
// y se queda en este navegador, no en el servidor.
interface PrinterConfig {
  paperWidth: '80mm' | '58mm';
  font: 'A' | 'B';
  columnMode: 'standard' | '42col';
}

const STORAGE_KEY = 'arp_ticket_print_config';
const DEFAULT_PRINTER_CONFIG: PrinterConfig = { paperWidth: '80mm', font: 'A', columnMode: 'standard' };

function loadPrinterConfig(): PrinterConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PRINTER_CONFIG;
    return { ...DEFAULT_PRINTER_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PRINTER_CONFIG;
  }
}

// Se usa mientras se termina de cargar TicketConfig desde el servidor (o si
// esa carga falla) — mismos textos que trae la fila 'default' en el backend,
// así el ticket nunca se queda sin texto que imprimir.
const FALLBACK_TICKET_CONFIG: TicketConfig = {
  empresaNombre: 'Acabados Rústicos Pirámides',
  empresaDireccion: 'Carretera México-Tulancingo km 26+650, San Francisco Mazapa, Teotihuacán, Estado de México.',
  empresaTelefonos: '5581705740   5643337241',
  empresaCorreo: 'acabadosrusticospiramides@gmail.com',
  lblTicketCompra: 'Número de ticket de compra:',
  lblFecha: 'Fecha:',
  lblHora: 'Hora:',
  lblVendedor: 'Vendedor:',
  lblCliente: 'Nombre de cliente:',
  lblDomicilio: 'Domicilio:',
  lblFechaEntrega: 'Fecha de entrega:',
  lblCantidad: 'Cant.',
  lblDescripcion: 'Descripción',
  lblPrecio: 'Precio',
  lblImporte: 'Importe',
  lblSubtotal: 'Subtotal',
  lblDescuento: 'Descuento',
  lblCostoEnvio: 'Costo de envío',
  lblTotal: 'Total',
  lblAnticipo: 'Anticipo',
  lblRestante: 'Restante',
  lblTipoPago: 'Tipo de pago',
  lblEntregado: 'Entregado',
  lblCambio: 'Cambio',
  lblFirma: 'Firma de conformidad',
  lblGracias: '¡GRACIAS POR SU PREFERENCIA!',
  legalTitulo: 'NO ACEPTAMOS CAMBIOS NI DEVOLUCIONES',
  legalLinea1: '-Todas la piedras provienen de la naturaleza, por lo cual es de esperarse que tengas variaciones de tono, medida y peso, aun cuando sean parte de un mismo corte o lote y sean de primera calidad.',
  legalLinea2: '-El cliente acepta el 5% de merma por transporte y manejo.',
  legalLinea3: '-Salida la mercancía no se aceptan cambios ni devoluciones.',
  legalLinea4: '-Todas nuestras entregas son a pie de carro.',
  etiquetaTipoCodigo: 'CODE128',
  etiquetaMostrarSku: true,
  etiquetaFechaHora: false,
  etiquetaRotar: false,
  etiquetaVertical: false,
  etiquetaEspejo: false,
};

const formatMoney = (v: number) => `$ ${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// El padre debe montar este componente con key={data?.folio} — así, cada
// ticket nuevo lo remonta desde cero (arranca en el menú de 3 botones, con
// "Entregado" precargado y un fetch fresco de TicketConfig) en vez de tener
// que sincronizar ese reseteo con un efecto cada vez que cambia `data`.
export default function TicketPrintModal({ data, onClose }: TicketPrintModalProps) {
  const [view, setView] = useState<PrintView>('menu');
  const [printerConfig, setPrinterConfig] = useState<PrinterConfig>(loadPrinterConfig);
  const [ticketConfig, setTicketConfig] = useState<TicketConfig>(FALLBACK_TICKET_CONFIG);
  // Precarga "Entregado" con el importe exacto (cambio en $0.00 por defecto,
  // editable si el cliente pagó con billete grande).
  const [entregado, setEntregado] = useState(() => (data?.metodoPagoEsEfectivo ? data.totalPago.toFixed(2) : ''));

  useEffect(() => {
    getTicketConfig().then(setTicketConfig).catch(() => {});
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(printerConfig));
  }, [printerConfig]);

  if (!data) return null;

  const entregadoNum = data.metodoPagoEsEfectivo ? (parseFloat(entregado) || 0) : data.totalPago;
  const cambioNum = data.metodoPagoEsEfectivo ? Math.max(0, entregadoNum - data.totalPago) : 0;

  // "Seleccionar impresora" e "Imprimir ticket" terminan en la misma acción:
  // un navegador no puede listar impresoras por su cuenta ni elegir una en
  // silencio (restricción de seguridad) — el diálogo nativo de impresión ES
  // el selector de impresora (incluye "Guardar como PDF").
  const handlePrint = () => {
    window.print();
  };

  const fechaStr = data.fecha.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Mexico_City' });
  const horaStr = data.fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Mexico_City' });

  const baseFontPx = printerConfig.font === 'A' ? 12 : 10;
  const scale = printerConfig.columnMode === '42col' ? 0.85 : 1;
  const fontPx = Math.round(baseFontPx * scale);

  return (
    <>
      <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4 print:hidden">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4 animate-fade-in">
          {view === 'menu' ? (
            <div className="flex flex-col gap-4">
              <div className="text-center">
                <h2 className="text-lg font-bold text-gray-900">
                  {data.tipo === 'venta' ? 'Venta registrada' : 'Pedido registrado'}
                </h2>
                <p className="text-sm text-gray-500">Folio {data.folio}</p>
              </div>

              {data.metodoPagoEsEfectivo && (
                <div className="flex flex-col gap-2 bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 flex-1">Efectivo entregado por el cliente</label>
                    <input
                      type="number"
                      min={0}
                      value={entregado}
                      onChange={(e) => setEntregado(e.target.value)}
                      className="w-28 border border-gray-300 rounded px-2 py-1 text-sm text-right focus:outline-none focus:border-[#3ab0e2]"
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-right">Cambio: {formatMoney(cambioNum)}</p>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setView('config')}
                  className="flex items-center gap-3 border border-gray-300 hover:bg-gray-50 text-gray-800 rounded-lg py-2.5 px-4 text-sm font-medium transition-colors cursor-pointer"
                >
                  <Settings2 className="w-4 h-4 shrink-0" />
                  Configurar impresión
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-3 border border-gray-300 hover:bg-gray-50 text-gray-800 rounded-lg py-2.5 px-4 text-sm font-medium transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4 shrink-0" />
                  Seleccionar impresora
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-3 bg-[#3ab0e2] hover:bg-sky-500 text-white rounded-lg py-2.5 px-4 text-sm font-medium shadow-sm transition-colors cursor-pointer"
                >
                  <Receipt className="w-4 h-4 shrink-0" />
                  Imprimir ticket
                </button>
              </div>

              <button
                onClick={onClose}
                className="text-sm text-gray-500 hover:text-gray-700 self-center mt-1 cursor-pointer transition-colors"
              >
                Cerrar
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setView('menu')}
                  className="text-gray-500 hover:text-gray-800 cursor-pointer transition-colors"
                  title="Regresar"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h2 className="text-base font-bold text-gray-900">Configurar impresión</h2>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Ancho de papel</label>
                <select
                  value={printerConfig.paperWidth}
                  onChange={(e) => setPrinterConfig((c) => ({ ...c, paperWidth: e.target.value as PrinterConfig['paperWidth'] }))}
                  className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#3ab0e2] bg-white"
                >
                  <option value="80mm">80 mm (48/64 columnas)</option>
                  <option value="58mm">58 mm (35/46 columnas)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Fuente</label>
                <select
                  value={printerConfig.font}
                  onChange={(e) => setPrinterConfig((c) => ({ ...c, font: e.target.value as PrinterConfig['font'] }))}
                  className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#3ab0e2] bg-white"
                >
                  <option value="A">Fuente A · 1.25 x 3.00 mm (predeterminado)</option>
                  <option value="B">Fuente B · 0.80 x 2.13 mm</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Modo de columnas</label>
                <select
                  value={printerConfig.columnMode}
                  onChange={(e) => setPrinterConfig((c) => ({ ...c, columnMode: e.target.value as PrinterConfig['columnMode'] }))}
                  className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#3ab0e2] bg-white"
                >
                  <option value="standard">Estándar</option>
                  <option value="42col">Modo de 42 columnas</option>
                </select>
              </div>

              <p className="text-xs text-gray-400">
                Estos ajustes se guardan en este navegador y se aplican al ancho y tamaño de letra del ticket al imprimir.
              </p>

              <button
                onClick={() => setView('menu')}
                className="mt-2 bg-[#3ab0e2] hover:bg-sky-500 text-white rounded-lg py-2 text-sm font-medium shadow-sm transition-colors cursor-pointer"
              >
                Regresar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Área imprimible: oculta en pantalla, solo se muestra (y solo ella)
          dentro del diálogo de impresión — ver la hoja de estilos @media print
          más abajo, que oculta todo lo demás de la página. Los textos vienen
          de TicketConfig (editable en EditTicketConfig_Page, solo admin). */}
      <div
        id="ticket-print-area"
        className="hidden print:block bg-white text-black"
        style={{ fontFamily: 'monospace', fontSize: `${fontPx}px`, lineHeight: 1.4 }}
      >
        <div className="flex flex-col items-center text-center gap-1 pb-2">
          <img src={logoEmpresa} alt="Logo" style={{ width: '70px', height: 'auto' }} />
          <div className="font-bold" style={{ fontSize: '1.15em' }}>{ticketConfig.empresaNombre}</div>
          <div>{ticketConfig.empresaDireccion}</div>
          <div>Tel. {ticketConfig.empresaTelefonos}</div>
          <div>Correo electrónico: {ticketConfig.empresaCorreo}</div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px dashed #000', margin: '6px 0' }} />

        <div>{ticketConfig.lblTicketCompra} {data.folio}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>{ticketConfig.lblFecha} {fechaStr}</span>
          <span>{ticketConfig.lblHora} {horaStr}</span>
        </div>
        <div>{ticketConfig.lblVendedor} {data.vendedor}</div>

        <hr style={{ border: 'none', borderTop: '1px dashed #000', margin: '6px 0' }} />

        <div>{ticketConfig.lblCliente} {data.cliente}</div>
        {data.tipo === 'pedido' && (
          <>
            <div>{ticketConfig.lblDomicilio} {data.domicilio || '-'}</div>
            <div>{ticketConfig.lblFechaEntrega} {data.fechaEntrega || '-'}</div>
          </>
        )}

        <hr style={{ border: 'none', borderTop: '1px dashed #000', margin: '6px 0' }} />

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>{ticketConfig.lblCantidad}</th>
              <th style={{ textAlign: 'left' }}>{ticketConfig.lblDescripcion}</th>
              <th style={{ textAlign: 'right' }}>{ticketConfig.lblPrecio}</th>
              <th style={{ textAlign: 'right' }}>{ticketConfig.lblImporte}</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, i) => (
              <tr key={i}>
                <td>{item.cantidad}</td>
                <td style={{ textAlign: 'left' }}>{item.nombre}</td>
                <td style={{ textAlign: 'right' }}>{formatMoney(item.precio)}</td>
                <td style={{ textAlign: 'right' }}>{formatMoney(item.importe)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px', marginTop: '8px' }}>
          <div>{ticketConfig.lblSubtotal} {formatMoney(data.subtotal)}</div>
          <div>{ticketConfig.lblDescuento} {formatMoney(data.descuento)}</div>
          <div>{ticketConfig.lblCostoEnvio} {formatMoney(data.costoEnvio)}</div>
          <div style={{ fontWeight: 'bold' }}>{ticketConfig.lblTotal} {formatMoney(data.total)}</div>
          {data.tipo === 'pedido' && (
            <>
              <div style={{ fontWeight: 'bold' }}>{ticketConfig.lblAnticipo} {formatMoney(data.anticipo || 0)}</div>
              <div style={{ fontWeight: 'bold' }}>{ticketConfig.lblRestante} {formatMoney(data.restante || 0)}</div>
            </>
          )}
        </div>

        <hr style={{ border: 'none', borderTop: '1px dashed #000', margin: '6px 0' }} />

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>{ticketConfig.lblTipoPago}</th>
              <th style={{ textAlign: 'right' }}>{ticketConfig.lblTotal}</th>
              <th style={{ textAlign: 'right' }}>{ticketConfig.lblEntregado}</th>
              <th style={{ textAlign: 'right' }}>{ticketConfig.lblCambio}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ textAlign: 'left' }}>{data.tipoPago}</td>
              <td style={{ textAlign: 'right' }}>{formatMoney(data.totalPago)}</td>
              <td style={{ textAlign: 'right' }}>{formatMoney(entregadoNum)}</td>
              <td style={{ textAlign: 'right' }}>{formatMoney(cambioNum)}</td>
            </tr>
          </tbody>
        </table>

        <div style={{ marginTop: '10px', textAlign: 'center', fontWeight: 'bold' }}>
          {ticketConfig.legalTitulo}
        </div>
        <div style={{ marginTop: '4px', textAlign: 'center' }}>{ticketConfig.legalLinea1}</div>
        <div style={{ marginTop: '4px', textAlign: 'center' }}>{ticketConfig.legalLinea2}</div>
        <div style={{ marginTop: '4px', textAlign: 'center' }}>{ticketConfig.legalLinea3}</div>
        <div style={{ marginTop: '4px', textAlign: 'center' }}>{ticketConfig.legalLinea4}</div>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <div>__________________________</div>
          <div>{ticketConfig.lblFirma}</div>
        </div>
        <div style={{ marginTop: '8px', textAlign: 'center', fontWeight: 'bold' }}>
          {ticketConfig.lblGracias}
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #ticket-print-area, #ticket-print-area * { visibility: visible; }
          #ticket-print-area {
            position: absolute;
            top: 0;
            left: 0;
            width: ${printerConfig.paperWidth};
            padding: 4px;
          }
          @page {
            size: ${printerConfig.paperWidth} auto;
            margin: 0;
          }
        }
      `}</style>
    </>
  );
}
