// import { useEffect, useRef, useState } from "react";
// import menuIcon from "../assets/icons/menu.png";
// import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
// import { ROUTES } from "../routes";


// type NavHandler = (path: string) => void;

// type NavbarProps = {
//   onNavigate?: NavHandler;
//   menuIconSrc?: string;

//   /** Imagen del avatar (URL o import). Si no la mandas, se muestra placeholder. */
//   avatarSrc?: string;

//   /** Opcional: click al avatar */
//   onAvatarClick?: () => void;
// };

// export default function Navbar({
//   onNavigate,
//   menuIconSrc,
//   avatarSrc,
//   onAvatarClick,
// }: NavbarProps) {
//   const routerNavigate = useNavigate();
//   const navigate: NavHandler = onNavigate ?? routerNavigate;


//   const [drawerOpen, setDrawerOpen] = useState(false);
//   const [salesOpen, setSalesOpen] = useState(false);

//   const salesRef = useRef<HTMLDivElement>(null);

//   // Cerrar dropdown al click fuera
//   useEffect(() => {
//     function onDocMouseDown(e: MouseEvent) {
//       if (!salesRef.current) return;
//       if (!salesRef.current.contains(e.target as Node)) setSalesOpen(false);
//     }
//     document.addEventListener("mousedown", onDocMouseDown);
//     return () => document.removeEventListener("mousedown", onDocMouseDown);
//   }, []);

//   // Cerrar dropdown y drawer con ESC
//   useEffect(() => {
//     function onKeyDown(e: KeyboardEvent) {
//       if (e.key === "Escape") {
//         setSalesOpen(false);
//         setDrawerOpen(false);
//       }
//     }
//     document.addEventListener("keydown", onKeyDown);
//     return () => document.removeEventListener("keydown", onKeyDown);
//   }, []);

//   function go(path: string) {
//     setSalesOpen(false);
//     setDrawerOpen(false);
//     navigate(path);
//   }

//   function toggleDrawer() {
//     setDrawerOpen((v) => !v);
//     setSalesOpen(false);
//   }

//   function toggleSales() {
//     setSalesOpen((v) => !v);
//     setDrawerOpen(false);
//   }

//   // Clase base: hover verde (para botones del navbar)
//   const navBtn =
//     "h-10 px-4 rounded-xl transition flex items-center gap-2 " +
//     "text-white/90 hover:text-emerald-400 hover:bg-white/5";

//   // Botón cuadrado del ícono (izq)
//   const iconBtn =
//     "h-10 w-10 grid place-items-center rounded-xl transition " +
//     "text-white/90 hover:text-emerald-400 hover:bg-white/5";

//   return (
//     <>
//       {/* NAVBAR */}
//       <nav className="fixed top-0 left-0 w-full h-14 z-50 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
//           {/* Cambiamos px-6 por px-4 para ganar espacio en laterales de móvil */}
//           <div className="h-full px-4 flex items-center justify-between">
            
//             {/* IZQUIERDA - Botón Menú (Ocupa el espacio necesario) */}
//             <div className="flex-1 flex items-center">
//               <button
//                 type="button"
//                 onClick={toggleDrawer}
//                 className={iconBtn}
//                 aria-label="Abrir menú"
//                 aria-expanded={drawerOpen}
//               >
//                 <img src={menuIcon} alt="Menú" className="h-6 w-6" />
//               </button>
//             </div>

//             {/* CENTRO - Contenedor de navegación */}
//             <div className="flex items-center justify-center">
//               <div className="flex items-center gap-4 lg:gap-12">
                
//                 {/* Ventas y pedidos (HIDDEN EN MÓVIL) */}
//                 <div className="relative hidden md:block" ref={salesRef}>
//                   <button
//                     type="button"
//                     onClick={toggleSales}
//                     className={navBtn}
//                     aria-haspopup="menu"
//                     aria-expanded={salesOpen}
//                   >
//                     <span className="opacity-90 text-xl">🧾</span>
//                     <span className="font-medium whitespace-nowrap">Ventas y pedidos</span>
//                     <svg
//                       className={`h-4 w-4 transition-transform ${salesOpen ? "rotate-180" : ""}`}
//                       viewBox="0 0 24 24"
//                       fill="none"
//                       stroke="currentColor"
//                       strokeWidth={2}
//                     >
//                       <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
//                     </svg>
//                   </button>

//                   {/* Menú Dropdown (Tu lógica original intacta) */}
//                   {salesOpen && (
//                     <div
//                       role="menu"
//                       className="absolute left-1/2 -translate-x-1/2 mt-3 w-72 rounded-2xl
//                                 bg-slate-800/95 border border-white/10 shadow-xl backdrop-blur z-50"
//                     >
//                       <div className="p-2">
//                         <DropdownItemDark label="Registrar venta" onClick={() => go("/sales/register")} />
//                         <DropdownItemDark label="Registrar pedido" onClick={() => go("/orders/register")} />
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 {/* Indicadores (SIEMPRE VISIBLE) */}
//                 <button type="button" onClick={() => go("/")} className={navBtn}>
//                   <span className="opacity-90 text-xl">📈</span>
//                   <span className="font-medium">Indicadores</span>
//                 </button>
//               </div>
//             </div>

//             {/* DERECHA - Avatar (Ocupa el espacio necesario) */}
//             <div className="flex-1 flex items-center justify-end">
//               <button
//                 type="button"
//                 onClick={onAvatarClick ?? (() => navigate("/perfil"))}
//                 className="h-10 w-10 rounded-full overflow-hidden ring-2 ring-white/10 hover:ring-white/25 transition"
//               >
//                 <img
//                   src={avatarSrc ?? "https://via.placeholder.com/80"}
//                   alt="Perfil"
//                   className="h-full w-full object-cover"
//                 />
//               </button>
//             </div>
//           </div>
//         </nav>

//       {/* Espaciador para que el contenido no quede debajo del navbar fijo */}
//       <div className="h-14" />

//       {/* OVERLAY (oscurece el fondo cuando el drawer está abierto) */}
//       {drawerOpen && (
//         <div
//           className="fixed inset-0 bg-black/40 z-40"
//           onClick={() => setDrawerOpen(false)}
//           aria-hidden="true"
//         />
//       )}

//       {/* DRAWER / SIDE MENU */}
//       <aside
//         className={`fixed top-0 left-0 h-full w-72 bg-gradient-to-r from-[#1A2539] to-[#0F172A]
//                     z-50 shadow-2xl transform transition-transform
//                     ${drawerOpen ? "translate-x-0" : "-translate-x-full"}`}
//         aria-hidden={!drawerOpen}
//       >
//         <div className="h-14 px-4 flex items-center justify-between border-b">
//           <span className="font-semibold text-white">Menú principal</span>
//           <button
//             type="button"
//             onClick={() => setDrawerOpen(false)}
//             className="h-9 w-9 rounded-lg hover:bg-white/10 transition grid place-items-center"
//             aria-label="Cerrar menú"
//           >
//             <span className="text-white hover:text-emerald-400">x</span>
//           </button>
//         </div>

//         <div className="p-4 flex flex-col items-center gap-1 w-full">
//           <SideItem label="Inventario" onClick={() => go(ROUTES.INVENTORY)} />
//           <SideItem label="Productos" onClick={() => go(ROUTES.PRODUCTS)} />
//           <SideItem label="Proveedores" onClick={() => go(ROUTES.SUPPLIERS)} />
//           <SideItem label="Clientes" onClick={() => go(ROUTES.CLIENTS)} />
//           <SideItem label="Descuentos" onClick={() => go(ROUTES.DISCOUNTS.ROOT)} />
//           <SideItem label="Ventas y pedidos" onClick={() => go(ROUTES.SALES.ROOT)} />
//           <SideItem label="Pedidos" onClick={() => go(ROUTES.ORDERS.ROOT)} />
//           <SideItem label="Reporte de ventas" onClick={() => go(ROUTES.SALES.REPORT)} />
//         </div>
//       </aside>
//     </>
//   );
// }

// /** Dropdown oscuro con hover verde que “se mueve” al pasar el mouse */
// function DropdownItemDark({
//   label,
//   onClick,
// }: {
//   label: string;
//   onClick: () => void;
// }) {
//   return (
//     <button
//       type="button"
//       role="menuitem"
//       onClick={onClick}
//       className="
//         w-full text-left px-3 py-2 rounded-xl transition
//         text-white/90 hover:text-emerald-400 hover:bg-white/10
//         focus:outline-none focus:ring-2 focus:ring-emerald-500/40
//       "
//     >
//       {label}
//     </button>
//   );
// }

// function SideItem({
//   label,
//   onClick,
// }: {
//   label: string;
//   onClick: () => void;
// }) {
//   return (
//     <button
//       type="button"
//       onClick={onClick}
//       className= "w-full max-w-xs text-left px-4 py-3 rounded-xl cursor-pointer  hover:text-emerald-400 hover:bg-white/10 transition text-white"
//     >
//       {label}
//     </button>
//   );
// }


import { useEffect, useRef, useState } from "react";
import menuIcon from "../assets/icons/menu.png";
import { useNavigate } from 'react-router-dom'
import { ROUTES } from "../routes";
import { useAppStore } from "../stores/useAppStore";
type NavHandler = (path: string) => void;

type NavbarProps = {
  onNavigate?: NavHandler;
  menuIconSrc?: string;
  /** Imagen del avatar. Si es null/undefined, usa la genérica. */
  avatarSrc?: string;
  onAvatarClick?: () => void;
};

// URL de avatar genérico (puedes cambiarla por un archivo local si prefieres)
const DEFAULT_AVATAR = "https://ui-avatars.com/api/?name=Usuario&background=16A085&color=fff";

export default function Navbar({
  onNavigate,
  avatarSrc,
}: NavbarProps) {
  const routerNavigate = useNavigate();
  const navigate: NavHandler = onNavigate ?? routerNavigate;
  
  const user = useAppStore(state => state.user);
  const authUser = useAppStore(state => state.authUser);
  const logout = useAppStore(state => state.logout);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [salesOpen, setSalesOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const salesRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdowns al click fuera
  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (salesRef.current && !salesRef.current.contains(e.target as Node)) {
        setSalesOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  // Cerrar con ESC
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setSalesOpen(false);
        setDrawerOpen(false);
        setProfileOpen(false);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  function go(path: string) {
    setSalesOpen(false);
    setDrawerOpen(false);
    setProfileOpen(false);
    navigate(path);
  }

  function toggleDrawer() {
    setDrawerOpen((v) => !v);
    setSalesOpen(false);
    setProfileOpen(false);
  }

  function toggleSales() {
    setSalesOpen((v) => !v);
    setDrawerOpen(false);
    setProfileOpen(false);
  }

  function toggleProfile() {
    setProfileOpen((v) => !v);
    setSalesOpen(false);
    setDrawerOpen(false);
  }

  function handleLogout() {
    logout();
    setProfileOpen(false);
    navigate(ROUTES.LOGIN);
  }

  const navBtn =
    "h-10 px-4 rounded-xl transition flex items-center gap-2 " +
    "text-white/90 hover:text-emerald-400 hover:bg-white/5 cursor-pointer";

  const iconBtn =
    "h-10 w-10 grid place-items-center rounded-xl transition " +
    "text-white/90 hover:text-emerald-400 hover:bg-white/5 cursor-pointer";

  return (
    <>
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 w-full h-14 z-50 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="h-full px-4 flex items-center justify-between">
          
          {/* lg:px-4: solo en laptop/escritorio separa el botón un poco de la
              orilla izquierda hacia el centro; tablet y celular quedan igual. */}
          <div className="flex-1 flex items-center lg:px-4">
            <button type="button" onClick={toggleDrawer} className={iconBtn}>
              <img src={menuIcon} alt="Menú" className="h-6 w-6" />
            </button>
          </div>

          <div className="flex items-center justify-center">
            <div className="flex items-center gap-4 lg:gap-12">
              <div className="relative hidden md:block" ref={salesRef}>
                <button type="button" onClick={toggleSales} className={navBtn}>
                  <span className="opacity-90 text-xl">🧾</span>
                  <span className="font-medium whitespace-nowrap">Ventas y pedidos</span>
                  <svg className={`h-4 w-4 transition-transform ${salesOpen ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {salesOpen && (
                  <div role="menu" className="absolute left-1/2 -translate-x-1/2 mt-3 w-72 rounded-2xl bg-slate-800/95 border border-white/10 shadow-xl backdrop-blur z-50">
                    <div className="p-2">
                      <DropdownItemDark label="Registrar venta" onClick={() => go("/sales/register")} />
                      <DropdownItemDark label="Registrar pedido" onClick={() => go("/orders/register")} />
                    </div>
                  </div>
                )}
              </div>

              <button type="button" onClick={() => go("/")} className={navBtn}>
                <span className="opacity-90 text-xl">📈</span>
                <span className="font-medium">Métricas</span>
              </button>
            </div>
          </div>

          {/* lg:px-4: solo en laptop/escritorio separa el avatar un poco de la
              orilla derecha hacia el centro; tablet y celular quedan igual. */}
          <div className="flex-1 flex items-center justify-end relative lg:px-4" ref={profileRef}>
            <button
              type="button"
              onClick={toggleProfile}
              className="h-10 w-10 rounded-full overflow-hidden ring-2 ring-white/10 hover:ring-white/25 transition cursor-pointer z-[60]"
            >
              <img
                src={authUser?.avatarUrl || avatarSrc || DEFAULT_AVATAR}
                alt="Perfil"
                className="h-full w-full object-cover"
              />
            </button>

            {/* MODAL DE PERFIL CON ANIMACIÓN DE ESCALA */}
            {profileOpen && (
              <div className="absolute top-12 right-0 w-72 mt-2 bg-[#2D3748] rounded-2xl shadow-2xl border border-white/10 z-[60] overflow-hidden origin-top-right transition-all transform animate-in zoom-in-95 duration-200 text-center">
                <div className="p-6 flex flex-col items-center">
                  <div className="h-24 w-24 rounded-full overflow-hidden ring-1 ring-white/20 mb-4">
                    <img
                      src={authUser?.avatarUrl || avatarSrc || DEFAULT_AVATAR}
                      alt="Usuario"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  
                  <h3 className="text-white text-3xl font-light mb-6">
                    ¡Hola, <span className="font-normal">{authUser?.userName?.split(' ')[0] || user?.nombreUsuario?.split(' ')[0] || "Usuario"}</span>!
                  </h3>

                  <div className="w-full space-y-4">
                    <button
                      onClick={() => go("/account/manage")}
                      className="w-full py-2.5 px-4 border-2 border-white text-white rounded-full font-medium transition-all cursor-pointer hover:bg-[#16A085] hover:border-[#16A085]"
                    >
                      Administrar tu cuenta
                    </button>

                    <button
                      onClick={() => go("/account/switch")}
                      className="w-full py-1 text-gray-300 hover:text-[#16A085] transition-all cursor-pointer block"
                    >
                      Configurar una cuenta diferente
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full py-1 text-gray-300 hover:text-[#16A085] transition-all cursor-pointer block"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="h-14" />

      {/* OVERLAY GLOBAL */}
      {(drawerOpen || profileOpen) && (
        <div
          className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => { setDrawerOpen(false); setProfileOpen(false); }}
          aria-hidden="true"
        />
      )}

      {/* DRAWER / SIDE MENU */}
      <aside className={`fixed top-0 left-0 h-full w-72 bg-gradient-to-r from-[#1A2539] to-[#0F172A] z-50 shadow-2xl transform transition-transform duration-300 ${drawerOpen ? "translate-x-0" : "-translate-x-full"}`} aria-hidden={!drawerOpen}>
        <div className="h-14 px-4 flex items-center justify-between border-b border-white/10">
          <span className="font-semibold text-white">Menú principal</span>
          <button 
            type="button" 
            onClick={() => setDrawerOpen(false)} 
            className="h-9 w-9 rounded-lg hover:bg-white/10 transition grid place-items-center cursor-pointer group"
          >
            {/* Agregamos la clase group-hover al span para que cambie el color del texto */}
            <span className="text-white text-2xl transition-colors group-hover:text-emerald-400">×</span>
          </button>
        </div>

        <div className="p-4 flex flex-col items-center gap-1 w-full">
          <SideItem label="Inventario" onClick={() => go(ROUTES.INVENTORY)} />
          <SideItem label="Productos" onClick={() => go(ROUTES.PRODUCTS.ROOT)} />
          <SideItem label="Proveedores" onClick={() => go(ROUTES.SUPPLIERS.ROOT)} />
          <SideItem label="Clientes" onClick={() => go(ROUTES.CLIENTS)} />
          <SideItem label="Descuentos" onClick={() => go(ROUTES.DISCOUNTS.ROOT)} />
          <SideItem label="Ventas y pedidos" onClick={() => go(ROUTES.SALES.ROOT)} />
          <SideItem label="Pedidos" onClick={() => go(ROUTES.ORDERS.ROOT)} />
          <SideItem label="Reporte de ventas" onClick={() => go(ROUTES.SALES.REPORT)} />
          {/* Exclusivo admin: sin forma de otorgarlo a un vendedor, a
              diferencia del resto (esas sí son permisos por módulo). */}
          {authUser?.userType === 'admin' && (
            <SideItem label="Editar Ticket y etiquetas" onClick={() => go(ROUTES.TICKET_CONFIG)} />
          )}
        </div>
      </aside>
    </>
  );
}

function DropdownItemDark({ label, onClick }: { label: string; onClick: () => void; }) {
  return (
    <button type="button" role="menuitem" onClick={onClick} className="w-full text-left px-3 py-2 rounded-xl transition cursor-pointer text-white/90 hover:text-emerald-400 hover:bg-white/10 focus:outline-none">
      {label}
    </button>
  );
}

function SideItem({ label, onClick }: { label: string; onClick: () => void; }) {
  return (
    <button type="button" onClick={onClick} className="w-full max-w-xs text-left px-4 py-3 rounded-xl cursor-pointer hover:text-emerald-400 hover:bg-white/10 transition text-white">
      {label}
    </button>
  );
}