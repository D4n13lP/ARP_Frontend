import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './layouts/Layout'
import RequireAuth from './layouts/RequireAuth'
import { ROUTES } from "./routes";

const AccountDisplay_Page = lazy(() => import('./views/AccountDisplay_Page'))
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
              <Route index element={<DashboardPage />} />

              <Route path="account" element={<AccountDisplay_Page />} />
              <Route path="retiros" element={<Retiros_Page />} />
              <Route path={ROUTES.PRODUCTS.ADD_PRODUCTS} element={<AddProducts_Page />} />
              <Route path={ROUTES.CLIENTS} element={<Clients_Page />} />
              <Route path="/clients/history/:id" element={<ClientHistory_Page />} />
              <Route path={ROUTES.DELIVERYMEN} element={<Deliverymen_Page />} />
              <Route path={ROUTES.DISCOUNTS.ROOT} element={<Discounts_Page />} />
              <Route path={ROUTES.DISCOUNTS.PROMOTION} element={<PromotionSetupPage />} />
              <Route path={ROUTES.DISCOUNTS.CLIENT_DISCOUNT} element={<ClientsDiscountPage />} />
              <Route path={ROUTES.DISCOUNTS.DISCOUNT_ADJUSTMENT} element={<DiscountAdjustmentPage />} />
              <Route path={ROUTES.INVENTORY} element={<Inventory_Page />} />
              <Route path="account/manage" element={<ManageAccount_Page />} />
              <Route path={ROUTES.ORDERS.ROOT} element={<Orders_Page />} />
              <Route path={ROUTES.ORDERS.REPORT} element={<OrdersReports_Page />} />
              <Route path={ROUTES.PRODUCTS.ROOT} element={<Products_Page />} />
              <Route path={ROUTES.PRODUCTS.PRODUCT_CATALOG} element={<ProductCatalog_Page />}/>
              <Route path={ROUTES.PRODUCTS.ADD_PRODUCT} element={<AddProduct_Page />} />
              <Route path="orders/register" element={<RegisterOrder_Page />} />
              <Route path="products/register" element={<RegisterProducts_Page />} />
              <Route path="sales/register" element={<RegisterSale_Page />} />
              <Route path="sales" element={<Sales_and_orders_Page />} />
              <Route path={ROUTES.SALES.REPORT} element={<SalesReport_Page />} />
              <Route path="suppliers" element={<Suppliers_Page />} />
              <Route path={ROUTES.SUPPLIERS.WATCH_SUPPLIERS} element={<WatchSuppliers_Page />} />
              <Route path={ROUTES.SUPPLIERS.REGISTER_SUPPLIER} element={<RegisterSupplier_Page />} />
              <Route path={ROUTES.SUPPLIERS.SUPPLIER_DETAIL} element={<SupplierDetail_Page />} />
              <Route path={ROUTES.ORDERS.UPDATE} element={<UpdateOrder_Page />} />
              <Route path={ROUTES.ORDERS.DETAIL} element={<OrderDetail_Page />} />
              <Route path="products/watch" element={<WatchProducts_Page />} />
              <Route path='destinationAccount/register' element={<RegisterDestinationAccount_Page/>} />
            </Route>
          </Route>

        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
