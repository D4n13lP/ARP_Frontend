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
});
export type Dashboard = z.infer<typeof DashboardSchema>;

// Esquema para búsquedas (similar a SearchRecipeSchema)
export const SearchProductSchema = z.object({
  codigo: z.string(),
  nombre: z.string()
});
export type SearchProduct = z.infer<typeof SearchProductSchema>;
