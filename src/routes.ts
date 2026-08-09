  
export const ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",
  VERIFY_EMAIL: "/verify-email",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  DASHBOARD: "/",
  INVENTORY: "/inventory",
  // PRODUCTS: "/products",
  //SUPPLIERS: "/suppliers",
  CLIENTS: "/clients",
  // DISCOUNTS: "/discounts",

  PRODUCTS: {
    ROOT: "/products",
    ADD_PRODUCTS: "/products/add",
    PRODUCT_CATALOG: "/products/catalog",
    ADD_PRODUCT: "/products/add-product",
  },

  SUPPLIERS: {
    ROOT: "/suppliers",
    WATCH_SUPPLIERS: "/suppliers/watch",
    REGISTER_SUPPLIER: "/suppliers/register",
    SUPPLIER_DETAIL: "/suppliers/detail/:suppCode",
  },

  SALES: {
    ROOT: "/sales",
    REGISTER: "/sales/register",
    REPORT: "/sales/report",
  },

  ORDERS: {
    ROOT: "/orders",
    REGISTER: "/orders/register",
    UPDATE: "/orders/update",
    DETAIL: "/orders/detail",
    REPORT: "/orders/report",
  },

  DISCOUNTS: {
    ROOT: "/discounts",
    PROMOTION: "/discounts/promotions",
    CLIENT_DISCOUNT: "/discounts/clients",
    DISCOUNT_ADJUSTMENT: "/discounts/adjustments",
  },

  ACCOUNT: "/account",
  ACCOUNT_SWITCH: "/account/switch",
  ACCOUNT_PENDING: "/account/pending",
  DELIVERYMEN: "/deliverymen",
} as const;

  