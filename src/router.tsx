import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './layouts/Layout'
import RequireAuth from './layouts/RequireAuth'
import ModuleGuard from './components/ModuleGuard'
import AdminOnlyGuard from './components/AdminOnlyGuard'
import { ROUTES } from "./routes";

const OtherAccountSettings_Page = lazy(() => import('./views/OtherAccountSettings_Page'))
const PendingAccounts_Page = lazy(() => import('./views/PendingAccounts_Page'))
const AddProducts_Page = lazy(() => import('./views/AddProducts_Page'))
const AddProduct_Page = lazy(() => import('./views/AddProduct_Page'))
const Clients_Page = lazy(() => import('./views/Clients_Page'))
const DashboardPage = lazy(() => import('./views/DashboardPage'))
const Deliverymen_Page = lazy(() => import('./views/Deliverymen_Page'))
const Discounts_Page = lazy(() => import('./views/Discounts_Page'))
const ClientHistory_Page = lazy(() => import('./views/ClientHistory_Page'))
const PromotionSetupPage = lazy(() => import('./views/PromotionSetupPage'))
const ClientsDiscountPage = lazy(() => import('./views/ClientsDiscountPage'))
const DiscountAdjustmentPage = lazy(() => import('./views/DiscountAdjustmentPage'))

const LoginDisplay_Page = lazy(() => import('./views/LoginDisplay_Page'))
const RegisterUser_Page = lazy(() => import('./views/RegisterUser_Page'))
const VerifyEmail_Page = lazy(() => import('./views/VerifyEmail_Page'))
const ForgotPassword_Page = lazy(() => import('./views/ForgotPassword_Page'))
const ResetPassword_Page = lazy(() => import('./views/ResetPassword_Page'))
const ManageAccount_Page = lazy(() => import('./views/ManageAccount_Page'))
const Orders_Page = lazy(() => import('./views/Orders_Page'))
const OrdersReports_Page = lazy(() => import('./views/OrdersReports_Page'))
const Products_Page = lazy(() => import('./views/Products_Page'))
const RegisterDestinationAccount_Page = lazy(() => import('./views/RegisterDestinationAccount_Page'))
const RegisterOrder_Page = lazy(() => import('./views/RegisterOrder_Page'))
const RegisterProducts_Page = lazy(() => import('./views/RegisterProducts_Page'))
const RegisterSale_Page = lazy(() => import('./views/RegisterSale_Page'))
const Sales_and_orders_Page = lazy(() => import('./views/Sales_and_orders_Page'))
const SalesReport_Page = lazy(() => import('./views/SalesReport_Page'))
const Suppliers_Page = lazy(() => import('./views/Suppliers_Page'))
const SupplierDetail_Page = lazy(() => import('./views/SupplierDetail_Page'))
const WatchSuppliers_Page = lazy(() => import('./views/WatchSuppliers_Page'))
const RegisterSupplier_Page = lazy(() => import('./views/RegisterSupplier_Page'))
const UpdateOrder_Page = lazy(() => import('./views/UpdateOrder_Page'))
const OrderDetail_Page = lazy(() => import('./views/OrderDetail_Page'))
const WatchProducts_Page = lazy(() => import('./views/WatchProducts_Page'))
const Retiros_Page = lazy(() => import('./views/Retiros_Page'))
const Inventory_Page = lazy(() => import('./views/Inventory_Page'))
const ProductCatalog_Page = lazy(() => import('./views/ProductCatalog_Page'))
const Warehouses_Page = lazy(() => import('./views/Warehouses_Page'))
const EditTicketConfig_Page = lazy(() => import('./views/EditTicketConfig_Page'))

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Cargando...</div>}>
        <Routes>

          {/* Login y registro fuera del layout: son públicos, no hay sesión todavía */}
          <Route path="/login" element={<LoginDisplay_Page />} />
          <Route path={ROUTES.REGISTER} element={<RegisterUser_Page />} />
          <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmail_Page />} />
          <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword_Page />} />
          <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword_Page />} />

          {/* App principal: sin token guardado, RequireAuth manda a /login */}
          <Route element={<RequireAuth />}>
            <Route element={<Layout />}>
              {/* Dashboard y "account/manage" (ajustes de tu propia cuenta)
                  quedan sin ModuleGuard a propósito: todo usuario autenticado
                  necesita poder llegar a ellos siempre, sin importar sus
                  permisos por módulo. */}
              <Route index element={<DashboardPage />} />
              <Route path="account/manage" element={<ManageAccount_Page />} />
              <Route path="account/pending" element={<PendingAccounts_Page />} />

              <Route path="account/switch" element={<ModuleGuard moduleKey="permissions"><OtherAccountSettings_Page /></ModuleGuard>} />
              <Route path="retiros" element={<ModuleGuard moduleKey="retiros"><Retiros_Page /></ModuleGuard>} />
              <Route path={ROUTES.PRODUCTS.ADD_PRODUCTS} element={<ModuleGuard moduleKey="add-products"><AddProducts_Page /></ModuleGuard>} />
              <Route path={ROUTES.CLIENTS} element={<ModuleGuard moduleKey="clients"><Clients_Page /></ModuleGuard>} />
              <Route path="/clients/history/:id" element={<ModuleGuard moduleKey="client-history"><ClientHistory_Page /></ModuleGuard>} />
              <Route path={ROUTES.DELIVERYMEN} element={<ModuleGuard moduleKey="deliverymen"><Deliverymen_Page /></ModuleGuard>} />
              <Route path={ROUTES.DISCOUNTS.ROOT} element={<ModuleGuard moduleKey="discounts"><Discounts_Page /></ModuleGuard>} />
              <Route path={ROUTES.DISCOUNTS.PROMOTION} element={<ModuleGuard moduleKey="promotion-setup"><PromotionSetupPage /></ModuleGuard>} />
              <Route path={ROUTES.DISCOUNTS.CLIENT_DISCOUNT} element={<ModuleGuard moduleKey="clients-discount"><ClientsDiscountPage /></ModuleGuard>} />
              <Route path={ROUTES.DISCOUNTS.DISCOUNT_ADJUSTMENT} element={<ModuleGuard moduleKey="discount-adjustment"><DiscountAdjustmentPage /></ModuleGuard>} />
              <Route path={ROUTES.INVENTORY} element={<ModuleGuard moduleKey="inventory"><Inventory_Page /></ModuleGuard>} />
              <Route path={ROUTES.WAREHOUSES} element={<ModuleGuard moduleKey="warehouses"><Warehouses_Page /></ModuleGuard>} />
              <Route path={ROUTES.ORDERS.ROOT} element={<ModuleGuard moduleKey="orders"><Orders_Page /></ModuleGuard>} />
              <Route path={ROUTES.ORDERS.REPORT} element={<ModuleGuard moduleKey="orders-report"><OrdersReports_Page /></ModuleGuard>} />
              <Route path={ROUTES.PRODUCTS.ROOT} element={<ModuleGuard moduleKey="products"><Products_Page /></ModuleGuard>} />
              <Route path={ROUTES.PRODUCTS.PRODUCT_CATALOG} element={<ModuleGuard moduleKey="product-catalog"><ProductCatalog_Page /></ModuleGuard>} />
              <Route path={ROUTES.PRODUCTS.ADD_PRODUCT} element={<ModuleGuard moduleKey="add-product"><AddProduct_Page /></ModuleGuard>} />
              <Route path="orders/register" element={<ModuleGuard moduleKey="register-order"><RegisterOrder_Page /></ModuleGuard>} />
              <Route path="products/register" element={<ModuleGuard moduleKey="register-products"><RegisterProducts_Page /></ModuleGuard>} />
              <Route path="sales/register" element={<ModuleGuard moduleKey="register-sale"><RegisterSale_Page /></ModuleGuard>} />
              <Route path="sales" element={<ModuleGuard moduleKey="transactions"><Sales_and_orders_Page /></ModuleGuard>} />
              <Route path={ROUTES.SALES.REPORT} element={<ModuleGuard moduleKey="sales-report"><SalesReport_Page /></ModuleGuard>} />
              <Route path="suppliers" element={<ModuleGuard moduleKey="suppliers"><Suppliers_Page /></ModuleGuard>} />
              <Route path={ROUTES.SUPPLIERS.WATCH_SUPPLIERS} element={<ModuleGuard moduleKey="watch-suppliers"><WatchSuppliers_Page /></ModuleGuard>} />
              <Route path={ROUTES.SUPPLIERS.REGISTER_SUPPLIER} element={<ModuleGuard moduleKey="register-supplier"><RegisterSupplier_Page /></ModuleGuard>} />
              <Route path={ROUTES.SUPPLIERS.SUPPLIER_DETAIL} element={<ModuleGuard moduleKey="supplier-detail"><SupplierDetail_Page /></ModuleGuard>} />
              <Route path={ROUTES.ORDERS.UPDATE} element={<ModuleGuard moduleKey="update-order"><UpdateOrder_Page /></ModuleGuard>} />
              <Route path={ROUTES.ORDERS.DETAIL} element={<ModuleGuard moduleKey="order-detail"><OrderDetail_Page /></ModuleGuard>} />
              <Route path="products/watch" element={<ModuleGuard moduleKey="watch-products"><WatchProducts_Page /></ModuleGuard>} />
              <Route path='destinationAccount/register' element={<ModuleGuard moduleKey="destination-account"><RegisterDestinationAccount_Page/></ModuleGuard>} />
              <Route path={ROUTES.TICKET_CONFIG} element={<AdminOnlyGuard><EditTicketConfig_Page /></AdminOnlyGuard>} />
            </Route>
          </Route>

        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
