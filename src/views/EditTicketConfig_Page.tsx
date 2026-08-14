import { useEffect, useRef, useState, type ChangeEvent, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom';
import { Receipt, Tag } from 'lucide-react';
import logoEmpresa from '../assets/logo_empresa.jpg';
import { getTicketConfig, updateTicketConfig } from '../api/ticketConfig';
import { getErrorMessage } from '../utils/errorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import type { TicketConfig } from '../types';

interface FieldProps {
  form: TicketConfig;
  setForm: Dispatch<SetStateAction<TicketConfig | null>>;
  name: keyof TicketConfig;
  label: string;
  textarea?: boolean;
}

function Field({ form, setForm, name, label, textarea = false }: FieldProps) {
  const value = form[name] as string;
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setForm((prev) => (prev ? { ...prev, [name]: newValue } : prev));
  };
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={handleChange}
          rows={2}
          className="border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#3ab0e2] resize-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={handleChange}
          className="border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#3ab0e2]"
        />
      )}
    </div>
  );
}

function SelectField({ form, setForm, name, label, options }: FieldProps & { options: { value: string; label: string }[] }) {
  const value = form[name] as string;
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      <select
        value={value}
        onChange={(e) => setForm((prev) => (prev ? { ...prev, [name]: e.target.value } : prev))}
        className="border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#3ab0e2] bg-white"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

function CheckboxField({ form, setForm, name, label }: FieldProps) {
  const checked = Boolean(form[name]);
  return (
    <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => setForm((prev) => (prev ? { ...prev, [name]: e.target.checked } : prev))}
        className="w-4 h-4 accent-[#3ab0e2] cursor-pointer"
      />
      {label}
    </label>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 flex flex-col gap-4">
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

// Solo simbologías que JsBarcode puede renderizar de verdad (la imagen de
// referencia lista muchas más — QR, PDF417, MaxiCode, etc. — que son 2D o de
// otro tipo y esta librería no genera).
const BARCODE_TYPE_OPTIONS = [
  { value: 'CODE128', label: 'CODE128 (recomendado, acepta cualquier texto)' },
  { value: 'CODE39', label: 'CODE39' },
  { value: 'CODE93', label: 'CODE93' },
  { value: 'EAN13', label: 'EAN13' },
  { value: 'EAN8', label: 'EAN8' },
  { value: 'UPC', label: 'UPC-A' },
  { value: 'ITF14', label: 'ITF-14' },
  { value: 'codabar', label: 'CODABAR (NW-7)' },
];

type PageView = 'menu' | 'tickets' | 'etiquetas';

export default function EditTicketConfig_Page() {
  const navigate = useNavigate();
  const [view, setView] = useState<PageView>('menu');
  const [form, setForm] = useState<TicketConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getTicketConfig()
      .then(setForm)
      .catch((error) => alert(getErrorMessage(error, 'No se pudo cargar la configuración del ticket.')))
      .finally(() => setLoading(false));
  }, []);

  // El título va centrado en el encabezado y el logo+botón "Atras" quedan
  // pegados a la izquierda (position:absolute) — en anchos intermedios
  // (tablet horizontal, ventanas de laptop angostas) el título puede crecer
  // lo suficiente para encimarse con ese bloque. En vez de fijar un
  // breakpoint arbitrario, se mide en tiempo real: si el espacio disponible
  // a la izquierda del título ya no alcanza para el logo, se oculta y solo
  // queda el botón; en cuanto vuelve a haber espacio, el logo reaparece
  // separado a la izquierda del botón.
  const headerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const logoMeasureRef = useRef<HTMLImageElement>(null);
  const [showLogo, setShowLogo] = useState(true);

  useEffect(() => {
    const GAP_PX = 24; // gap-6 entre logo y botón
    const SAFETY_PX = 16; // margen extra para no quedar al ras

    const recalc = () => {
      const header = headerRef.current;
      const title = titleRef.current;
      const button = buttonRef.current;
      const logo = logoMeasureRef.current;
      if (!header || !title || !button || !logo) return;
      const availableLeft = (header.offsetWidth - title.offsetWidth) / 2;
      const neededWithLogo = logo.offsetWidth + GAP_PX + button.offsetWidth + SAFETY_PX;
      setShowLogo(availableLeft >= neededWithLogo);
    };

    recalc();
    const observer = new ResizeObserver(recalc);
    if (headerRef.current) observer.observe(headerRef.current);
    if (titleRef.current) observer.observe(titleRef.current);
    // También se observa el clon de medición: su tamaño pasa de 0 al ancho
    // real en cuanto la imagen termina de cargar, y eso debe disparar un
    // recálculo (si no, "showLogo" se queda con el valor calculado antes de
    // conocer el ancho real del logo).
    if (logoMeasureRef.current) observer.observe(logoMeasureRef.current);
    return () => observer.disconnect();
  }, []);

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    try {
      const updated = await updateTicketConfig(form);
      setForm(updated);
      alert('Configuración guardada correctamente.');
    } catch (error) {
      alert(getErrorMessage(error, 'No se pudo guardar la configuración.'));
    } finally {
      setSaving(false);
    }
  };

  const headerTitle = view === 'tickets' ? 'Editar tickets' : view === 'etiquetas' ? 'Editar etiquetas' : 'Editar Ticket y etiquetas';

  return (
    <div className="min-h-screen bg-white p-6 md:p-10 animate-fade-in flex flex-col items-center">

      {/* Header: el bloque ahora ocupa más ancho (más margen para el logo antes
          de encimarse), pero la línea divisoria se deja del mismo tamaño de
          antes (max-w-7xl), centrada dentro de este bloque más ancho. */}
      <div ref={headerRef} className="w-full max-w-352 mb-12 pb-8 relative flex items-center justify-center min-h-20 max-lg:portrait:flex-col max-lg:portrait:gap-4">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-7xl border-b border-gray-200" />

        <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-6 max-lg:portrait:static max-lg:portrait:translate-y-0 max-lg:portrait:self-start">
          {showLogo && (
            <img
              src={logoEmpresa}
              alt="Logo Empresa"
              className="h-20 w-auto object-contain max-lg:portrait:hidden"
            />
          )}
          <button
            ref={buttonRef}
            onClick={() => (view === 'menu' ? navigate(-1) : setView('menu'))}
            className="bg-[#3ab0e2] hover:bg-sky-400 text-white px-6 py-2 rounded shadow-sm transition-colors text-sm font-medium cursor-pointer"
          >
            Atras
          </button>
        </div>

        <div ref={titleRef} className="flex items-center gap-4 text-[#e2694b]">
          <h1 className="text-4xl md:text-5xl font-normal tracking-tight">
            {headerTitle}
          </h1>
          <Receipt size={45} strokeWidth={1.5} />
        </div>

        {/* Clon invisible del logo, fuera de flujo (no afecta el layout del
            bloque real): solo sirve para medir su ancho verdadero. */}
        <img
          ref={logoMeasureRef}
          src={logoEmpresa}
          alt=""
          aria-hidden="true"
          className="h-20 w-auto object-contain absolute top-0 left-0 opacity-0 pointer-events-none"
        />
      </div>

      {loading || !form ? (
        <LoadingSpinner label="Cargando configuración..." />
      ) : view === 'menu' ? (
        /* ==================== MENÚ: elegir qué editar ==================== */
        <div className="w-full max-w-3xl flex flex-col md:flex-row gap-6 justify-center mb-16">
          <button
            onClick={() => setView('tickets')}
            className="flex-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-2xl p-8 flex flex-col items-center gap-4 transition-colors cursor-pointer text-center"
          >
            <Receipt className="w-10 h-10 text-[#3ab0e2]" strokeWidth={1.5} />
            <span className="text-lg font-bold text-gray-900">Editar tickets</span>
            <span className="text-sm text-gray-500">
              Datos de la empresa, etiquetas de campos y textos legales del ticket de venta/pedido.
            </span>
          </button>
          <button
            onClick={() => setView('etiquetas')}
            className="flex-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-2xl p-8 flex flex-col items-center gap-4 transition-colors cursor-pointer text-center"
          >
            <Tag className="w-10 h-10 text-[#3ab0e2]" strokeWidth={1.5} />
            <span className="text-lg font-bold text-gray-900">Editar etiquetas</span>
            <span className="text-sm text-gray-500">
              Tipo de código de barras y características de impresión de la etiqueta de producto.
            </span>
          </button>
        </div>
      ) : view === 'tickets' ? (
        /* ==================== FORMULARIO: Editar tickets ==================== */
        <div className="w-full max-w-5xl flex flex-col gap-8 mb-16">
          <p className="text-sm text-gray-500 -mt-4">
            Estos textos se imprimen en el ticket de ventas y pedidos para todos los usuarios del sistema.
          </p>

          <Section title="Datos de la empresa">
            <Field form={form} setForm={setForm} name="empresaNombre" label="Nombre de la empresa" />
            <Field form={form} setForm={setForm} name="empresaTelefonos" label="Teléfonos" />
            <Field form={form} setForm={setForm} name="empresaCorreo" label="Correo electrónico" />
            <Field form={form} setForm={setForm} name="empresaDireccion" label="Dirección" textarea />
          </Section>

          <Section title="Etiquetas de campos">
            <Field form={form} setForm={setForm} name="lblTicketCompra" label="Número de ticket de compra" />
            <Field form={form} setForm={setForm} name="lblFecha" label="Fecha" />
            <Field form={form} setForm={setForm} name="lblHora" label="Hora" />
            <Field form={form} setForm={setForm} name="lblVendedor" label="Vendedor" />
            <Field form={form} setForm={setForm} name="lblCliente" label="Nombre de cliente" />
            <Field form={form} setForm={setForm} name="lblDomicilio" label="Domicilio (solo pedidos)" />
            <Field form={form} setForm={setForm} name="lblFechaEntrega" label="Fecha de entrega (solo pedidos)" />
            <Field form={form} setForm={setForm} name="lblCantidad" label="Columna: Cantidad" />
            <Field form={form} setForm={setForm} name="lblDescripcion" label="Columna: Descripción" />
            <Field form={form} setForm={setForm} name="lblPrecio" label="Columna: Precio" />
            <Field form={form} setForm={setForm} name="lblImporte" label="Columna: Importe" />
            <Field form={form} setForm={setForm} name="lblSubtotal" label="Subtotal" />
            <Field form={form} setForm={setForm} name="lblDescuento" label="Descuento" />
            <Field form={form} setForm={setForm} name="lblCostoEnvio" label="Costo de envío" />
            <Field form={form} setForm={setForm} name="lblTotal" label="Total" />
            <Field form={form} setForm={setForm} name="lblAnticipo" label="Anticipo (solo pedidos)" />
            <Field form={form} setForm={setForm} name="lblRestante" label="Restante (solo pedidos)" />
            <Field form={form} setForm={setForm} name="lblTipoPago" label="Tipo de pago" />
            <Field form={form} setForm={setForm} name="lblEntregado" label="Entregado" />
            <Field form={form} setForm={setForm} name="lblCambio" label="Cambio" />
            <Field form={form} setForm={setForm} name="lblFirma" label="Firma de conformidad" />
            <Field form={form} setForm={setForm} name="lblGracias" label="Mensaje final" />
          </Section>

          <Section title="Textos legales">
            <Field form={form} setForm={setForm} name="legalTitulo" label="Título" />
            <div />
            <Field form={form} setForm={setForm} name="legalLinea1" label="Línea 1" textarea />
            <Field form={form} setForm={setForm} name="legalLinea2" label="Línea 2" textarea />
            <Field form={form} setForm={setForm} name="legalLinea3" label="Línea 3" textarea />
            <Field form={form} setForm={setForm} name="legalLinea4" label="Línea 4" textarea />
          </Section>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#3ab0e2] hover:bg-sky-400 text-white px-10 py-2 rounded shadow-sm transition-colors text-sm font-medium cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      ) : (
        /* ==================== FORMULARIO: Editar etiquetas ==================== */
        <div className="w-full max-w-5xl flex flex-col gap-8 mb-16">
          <p className="text-sm text-gray-500 -mt-4">
            Estos ajustes se usan al imprimir la etiqueta de un producto (botón "Imprimir etiqueta" en su ficha de detalle).
          </p>

          <Section title="Código de barras">
            <SelectField form={form} setForm={setForm} name="etiquetaTipoCodigo" label="Tipo de código de barras" options={BARCODE_TYPE_OPTIONS} />
            <div className="flex items-end pb-2">
              <CheckboxField form={form} setForm={setForm} name="etiquetaMostrarSku" label="Mostrar el SKU como texto debajo del código" />
            </div>
          </Section>

          <Section title="Características de la etiquetadora">
            <CheckboxField form={form} setForm={setForm} name="etiquetaFechaHora" label="Impresión fecha/hora" />
            <CheckboxField form={form} setForm={setForm} name="etiquetaRotar" label="Rotar impresión (180°)" />
            <CheckboxField form={form} setForm={setForm} name="etiquetaVertical" label="Impresión vertical (90°)" />
            <CheckboxField form={form} setForm={setForm} name="etiquetaEspejo" label="Impresión espejo" />
          </Section>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#3ab0e2] hover:bg-sky-400 text-white px-10 py-2 rounded shadow-sm transition-colors text-sm font-medium cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
