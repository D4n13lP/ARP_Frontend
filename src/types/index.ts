import { z } from "zod";

export const PictureSchema = z.object({
  pictureID: z.string(),
  name: z.string().nullable().optional(),
  link: z.string(),
  prodCode: z.string().nullable().optional(),
});
export type Picture = z.infer<typeof PictureSchema>;

export const PromoSchema = z.object({
  discountID: z.string(),
  discountPercentage: z.coerce.number(),
});
export type Promo = z.infer<typeof PromoSchema>;

export const CategorySchema = z.object({
  categoryID: z.string(),
  categoryName: z.string(),
  discountID: z.string().nullable().optional(),
});
export type Category = z.infer<typeof CategorySchema>;

export const ProductUnitSchema = z.object({
  produnitID: z.string(),
  produnitName: z.string(),
});
export type ProductUnit = z.infer<typeof ProductUnitSchema>;

export const WarehouseSchema = z.object({
  whID: z.string(),
  whname: z.string(),
  whaddress: z.string().nullable().optional(),
  // Almacén fijo "Pedido especial" (Orden Especial en RegisterOrder_Page):
  // no se puede renombrar ni recibir stock manual (transferir/ingresar) —
  // ver Inventory.tsx, donde se excluye como destino elegible.
  isSpecialOrders: z.boolean().optional(),
});
export type Warehouse = z.infer<typeof WarehouseSchema>;

export const SupplierSchema = z.object({
  suppCode: z.string(),
  supplierName: z.string(),
  enterpBusi: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  officePhone: z.string().nullable().optional(),
  contactName: z.string().nullable().optional(),
  contactPhone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  products: z.array(z.lazy(() => ProductSchema)).optional(),
});
export type Supplier = z.infer<typeof SupplierSchema>;

// Solo lo que ProductModal necesita para mostrar/editar el proveedor
// vinculado a un producto — no reusa SupplierSchema completo porque eso
// crearía una referencia circular Product↔Supplier (dos z.lazy mutuos)
// que rompe la inferencia de tipos de TS.
const ProductSupplierRefSchema = z.object({
  suppCode: z.string(),
  supplierName: z.string(),
});

export const ProductSchema = z.object({
  prodCode: z.string(),
  productName: z.string(),
  sku: z.string(),
  description: z.string().nullable().optional(),
  prodType: z.string(),
  cost: z.coerce.number(),
  currencyCost: z.string().nullable().optional(),
  salePrice: z.coerce.number(),
  lowStock: z.coerce.number(),
  categoryID: z.string().nullable().optional(),
  category: CategorySchema.nullable().optional(),
  produnitID: z.string().nullable().optional(),
  unit: ProductUnitSchema.nullable().optional(),
  pictures: z.array(PictureSchema).optional(),
  discountID: z.string().nullable().optional(),
  promo: PromoSchema.nullable().optional(),
  suppliers: z.array(ProductSupplierRefSchema).optional(),
});
export type Product = z.infer<typeof ProductSchema>;

export const ClientSchema = z.object({
  clientCode: z.string(),
  clientName: z.string(),
  clientPhone1: z.string().nullable().optional(),
  clientPhone2: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  RFC: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  discountPercentage: z.coerce.number().optional(),
});
export type Client = z.infer<typeof ClientSchema>;

export const CourierSchema = z.object({
  courierID: z.string(),
  courierName: z.string(),
});
export type Courier = z.infer<typeof CourierSchema>;

export const DestAccountSchema = z.object({
  clabe: z.string(),
  accountNumber: z.string().nullable().optional(),
  accountAlias: z.string().nullable().optional(),
  holderName: z.string().nullable().optional(),
  bank: z.string().nullable().optional(),
});
export type DestAccount = z.infer<typeof DestAccountSchema>;

export const TransDiscountSchema = z.object({
  transDiscountID: z.string(),
  percent: z.coerce.number(), // fracción 0-1, ej. 0.15 para 15%
  type: z.enum(["t1", "t2"]),
});
export type TransDiscount = z.infer<typeof TransDiscountSchema>;

// Respuesta de POST /transactions/sale (createSale) — solo lo que la vista
// necesita mostrar/usar después de registrar la venta.
export const SaleTransactionSchema = z.object({
  transactionID: z.string(),
  folio: z.string().nullable().optional(),
  finalAmount: z.coerce.number(),
  status: z.string(),
});
export type SaleTransaction = z.infer<typeof SaleTransactionSchema>;

// Usuario embebido (vendedor en transUser->user, o quien cobró un pago) —
// solo lo mínimo, sin datos sensibles.
export const TransactionUserSchema = z.object({
  userID: z.string(),
  userName: z.string(),
});
export type TransactionUser = z.infer<typeof TransactionUserSchema>;

export const PaymentHistorySchema = z.object({
  pymntHistryID: z.string(),
  paymentAmount: z.coerce.number(),
  paymentDate: z.coerce.date().nullable().optional(),
  paymentMethod: z.enum(["cash", "digital"]),
  transactionID: z.string(),
  clabe: z.string().nullable().optional(),
  // Quién tenía la sesión abierta al registrarlo — null en pagos históricos
  // de antes de esta columna.
  collectedBy: TransactionUserSchema.nullable().optional(),
  // Solo viene poblado cuando se pide con includePayments=true y el pago fue
  // digital (SalesReport_Page, para mostrar el alias de la cuenta destino).
  destAccount: DestAccountSchema.nullable().optional(),
});
export type PaymentHistory = z.infer<typeof PaymentHistorySchema>;

// Retiro de efectivo de caja (Retiros_Page). "cash" (individual) no se usa
// en ningún flujo todavía — el saldo disponible se calcula en el cliente a
// partir de paymentHistory (pagos en efectivo) menos lo ya retirado aquí.
export const TotalCashSchema = z.object({
  totalCashID: z.string(),
  withdrawalAmount: z.coerce.number(),
  withdrawalDate: z.coerce.date().nullable().optional(),
  createdAt: z.coerce.date().nullable().optional(),
  ownUserID: z.string().nullable().optional(),
  adminUserID: z.string().nullable().optional(),
});
export type TotalCash = z.infer<typeof TotalCashSchema>;

// Textos editables del ticket impreso (Editar Ticket y etiquetas, solo
// admin — ver views/EditTicketConfig_Page.tsx). Mismo shape que
// DEFAULT_TICKET_CONFIG en ticketConfig.controller.ts; todos strings porque
// son literalmente lo que se imprime.
export const TicketConfigSchema = z.object({
  empresaNombre: z.string(),
  empresaDireccion: z.string(),
  empresaTelefonos: z.string(),
  empresaCorreo: z.string(),

  lblTicketCompra: z.string(),
  lblFecha: z.string(),
  lblHora: z.string(),
  lblVendedor: z.string(),
  lblCliente: z.string(),
  lblDomicilio: z.string(),
  lblFechaEntrega: z.string(),
  lblCantidad: z.string(),
  lblDescripcion: z.string(),
  lblPrecio: z.string(),
  lblImporte: z.string(),
  lblSubtotal: z.string(),
  lblDescuento: z.string(),
  lblCostoEnvio: z.string(),
  lblTotal: z.string(),
  lblAnticipo: z.string(),
  lblRestante: z.string(),
  lblTipoPago: z.string(),
  lblEntregado: z.string(),
  lblCambio: z.string(),
  lblFirma: z.string(),
  lblGracias: z.string(),

  legalTitulo: z.string(),
  legalLinea1: z.string(),
  legalLinea2: z.string(),
  legalLinea3: z.string(),
  legalLinea4: z.string(),

  // Etiquetas de producto (botón "Imprimir etiqueta" en ProductModal),
  // editables desde "Editar etiquetas" (misma pantalla que "Editar tickets").
  etiquetaTipoCodigo: z.string(),
  etiquetaMostrarSku: z.boolean(),
  etiquetaFechaHora: z.boolean(),
  etiquetaRotar: z.boolean(),
  etiquetaVertical: z.boolean(),
  etiquetaEspejo: z.boolean(),
});
export type TicketConfig = z.infer<typeof TicketConfigSchema>;

export const TransDetailSchema = z.object({
  transDetailID: z.string(),
  quantity: z.coerce.number(),
  unitPrice: z.coerce.number(),
  subtotal: z.coerce.number(),
  appliedDisc: z.coerce.number().nullable().optional(),
  transactionID: z.string(),
  prodCode: z.string(),
  product: ProductSchema.nullable().optional(),
  transDiscountID: z.string().nullable().optional(),
  // De qué almacén se descontó este renglón — nulo en renglones históricos
  // de antes de esta columna (ver Inventory.tsx, "Pendiente entrega").
  whID: z.string().nullable().optional(),
});
export type TransDetail = z.infer<typeof TransDetailSchema>;

// Venta o pedido completo, tal como lo devuelve GET /transactions y
// GET /transactions/:id — usado por UpdateOrder_Page, OrderDetail_Page y
// OrdersReports_Page.
export const TransactionSchema = z.object({
  transactionID: z.string(),
  transType: z.enum(["sale", "order"]),
  folio: z.string().nullable().optional(),
  transactionDate: z.string().nullable().optional(),
  deliveryDate: z.string().nullable().optional(),
  dispatchDateI: z.string().nullable().optional(),
  dispatchDateF: z.string().nullable().optional(),
  status: z.enum(["pending", "completed"]),
  finalAmount: z.coerce.number(),
  outstandingAmount: z.coerce.number(),
  deliveryLocation: z.string().nullable().optional(),
  clientCode: z.string().nullable().optional(),
  client: ClientSchema.nullable().optional(),
  details: z.array(TransDetailSchema).optional(),
  payments: z.array(PaymentHistorySchema).optional(),
  users: z.array(TransactionUserSchema).optional(),
  couriers: z.array(CourierSchema).optional(),
});
export type Transaction = z.infer<typeof TransactionSchema>;

export const InventorySchema = z.object({
  inventoryID: z.string(),
  inventoryName: z.string().nullable().optional(),
  quantity: z.coerce.number(),
  prodCode: z.string(),
  product: ProductSchema.nullable().optional(),
  whID: z.string(),
  warehouse: WarehouseSchema.nullable().optional(),
});
export type Inventory = z.infer<typeof InventorySchema>;

export const InventoryAdjustmentSchema = z.object({
  adjustID: z.string(),
  adjustmentDate: z.coerce.date().nullable().optional(),
  description: z.string().nullable().optional(),
  availableBefore: z.coerce.number().nullable().optional(),
  outstandingDeliveryBefore: z.coerce.number().nullable().optional(),
  type: z.enum(["adjust", "transfer"]),
  quantityTransferred: z.coerce.number().nullable().optional(),
  prodCode: z.string(),
  product: ProductSchema.nullable().optional(),
  sourceWarehousewhID: z.string().nullable().optional(),
  sourceWarehouse: WarehouseSchema.nullable().optional(),
  destinationWarehousewhID: z.string().nullable().optional(),
  destinationWarehouse: WarehouseSchema.nullable().optional(),
});
export type InventoryAdjustment = z.infer<typeof InventoryAdjustmentSchema>;

export const TimeUnitSchema = z.object({
  timeunitID: z.string(),
  timeunitName: z.string(),
});
export type TimeUnit = z.infer<typeof TimeUnitSchema>;

export const SuppProdSchema = z.object({
  suppCode: z.string(),
  prodCode: z.string(),
});
export type SuppProd = z.infer<typeof SuppProdSchema>;

export const SalesExpectationSchema = z.object({
  expectationID: z.string(),
  quantity: z.coerce.number(),
  prodCode: z.string(),
  timeunitID: z.string(),
  timeUnit: TimeUnitSchema.nullable().optional(),
  // Cuántas unidades de timeUnit dura el plazo (p. ej. 3 = "cada 3 días").
  periodLength: z.coerce.number().default(1),
  startDate: z.string(),
  endDate: z.string(),
  // Calculados por el backend en cada consulta (ver salesExpectation.controller.ts),
  // no son columnas propias de la tabla.
  soldQuantity: z.coerce.number().optional(),
  fulfilled: z.boolean().optional(),
  periodEnded: z.boolean().optional(),
});
export type SalesExpectation = z.infer<typeof SalesExpectationSchema>;

export const MetricTableItemSchema = z.object({
  id: z.coerce.number(),
  producto: z.string(),
  cantidad: z.coerce.number(),
  importe: z.coerce.number().optional(),
  tiempo: z.string().optional(),
});
export type MetricTableItem = z.infer<typeof MetricTableItemSchema>;

export const AuthUserSchema = z.object({
  userID: z.string(),
  userName: z.string(),
  email: z.string(),
  userType: z.enum(["admin", "seller"]),
  isActive: z.boolean(),
  isEmailVerified: z.boolean(),
  isAllowed: z.boolean(),
  recoveryEmail: z.string().nullable().optional(),
  employeeCode: z.string(),
  phone: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
  lastLogin: z.coerce.date().nullable().optional(),
});
export type AuthUser = z.infer<typeof AuthUserSchema>;

export const LoginResponseSchema = z.object({
  user: AuthUserSchema,
  token: z.string(),
});
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export const RegisterResponseSchema = z.object({
  message: z.string(),
  userID: z.string(),
  employeeCode: z.string(),
});
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;

export const MessageResponseSchema = z.object({
  message: z.string(),
});
export type MessageResponse = z.infer<typeof MessageResponseSchema>;

export const ModuleSchema = z.object({
  moduleID: z.string(),
  moduleKey: z.string(),
  moduleName: z.string(),
});
export type Module = z.infer<typeof ModuleSchema>;

export const RolePermissionSchema = z.object({
  permissionID: z.string(),
  userType: z.enum(["admin", "seller"]),
  moduleID: z.string(),
  module: ModuleSchema.nullable().optional(),
  canView: z.boolean(),
  canCreate: z.boolean(),
  canEdit: z.boolean(),
  canDelete: z.boolean(),
});
export type RolePermission = z.infer<typeof RolePermissionSchema>;

export const UserPermissionSchema = z.object({
  userPermissionID: z.string(),
  userID: z.string(),
  moduleID: z.string(),
  module: ModuleSchema.nullable().optional(),
  canView: z.boolean(),
  canCreate: z.boolean(),
  canEdit: z.boolean(),
  canDelete: z.boolean(),
});
export type UserPermission = z.infer<typeof UserPermissionSchema>;

export const DashboardSchema = z.object({
  stats: z.object({
    ventas: z.coerce.number(),
    pedidos: z.coerce.number(),
    rezagados: z.coerce.number(),
  }),
  masVendidos: z.array(MetricTableItemSchema),
  recienLlegados: z.array(MetricTableItemSchema),
  productosRezagados: z.array(MetricTableItemSchema),
  ultimasVentas: z.array(MetricTableItemSchema),
  pedidosPorVencer: z.array(MetricTableItemSchema),
  usuariosTopVentas: z.array(MetricTableItemSchema),
  productosStockBajo: z.array(MetricTableItemSchema),
  // Periodo (en días) que el backend realmente aplicó a usuariosTopVentas —
  // ver selector de periodo en DashboardPage (solo admin puede cambiarlo).
  ventasPeriodDays: z.coerce.number().default(7),
});
export type Dashboard = z.infer<typeof DashboardSchema>;

// Esquema para búsquedas (similar a SearchRecipeSchema)
export const SearchProductSchema = z.object({
  codigo: z.string(),
  nombre: z.string()
});
export type SearchProduct = z.infer<typeof SearchProductSchema>;
