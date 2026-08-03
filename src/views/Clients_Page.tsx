// import { useState, useEffect } from 'react';
// import { Search, Plus, X, Save, ReceiptText } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import logoEmpresa from '../assets/logo_empresa.jpg';

// interface Cliente {
//   id: string;
//   nombre: string;
//   telefono1: string;
//   telefono2: string;
//   rfc: string;
//   email: string;
// }

// export default function ClientsPage() {
//   const navigate = useNavigate();
  
//   // 1. Estados principales
//   const [clientes, setClientes] = useState<Cliente[]>([]);
//   const [isEditing, setIsEditing] = useState(false);
//   const [currentId, setCurrentId] = useState<string | null>(null);
//   const [searchTerm, setSearchTerm] = useState('');

//   const [formData, setFormData] = useState({
//     nombre: '',
//     telefono1: '',
//     telefono2: '',
//     rfc: '',
//     email: ''
//   });

//   // 2. Cargar datos de LocalStorage al iniciar
//   useEffect(() => {
//     const saved = localStorage.getItem('clientes_db');
//     if (saved) setClientes(JSON.parse(saved));
//   }, []);

//   // 3. Guardar en LocalStorage cada vez que cambie la lista
//   const saveToLocalStorage = (data: Cliente[]) => {
//     localStorage.setItem('clientes_db', JSON.stringify(data));
//     setClientes(data);
//   };

//   // 4. Lógica de Agregar / Guardar Cambios
//   const handleMainAction = () => {
//     if (!formData.nombre.trim() || !formData.telefono1.trim()) {
//       alert("Error: Nombre y Teléfono 1 son obligatorios.");
//       return;
//     }

//     if (isEditing && currentId) {
//       // MODO EDICIÓN: Reemplazar en el array
//       const updated = clientes.map(c => 
//         c.id === currentId ? { ...formData, id: currentId } : c
//       );
//       saveToLocalStorage(updated);
//       resetForm();
//     } else {
//       // MODO AGREGAR: Nuevo registro
//       const nuevo: Cliente = {
//         ...formData,
//         id: `CLI-${Math.floor(Math.random() * 10000)}` // ID temporal
//       };
//       saveToLocalStorage([...clientes, nuevo]);
//       resetForm();
//     }
//   };

//   const resetForm = () => {
//     setFormData({ nombre: '', telefono1: '', telefono2: '', rfc: '', email: '' });
//     setIsEditing(false);
//     setCurrentId(null);
//   };

//   // 5. Cargar datos para editar
//   const startEdit = (cliente: Cliente) => {
//     setFormData({
//       nombre: cliente.nombre,
//       telefono1: cliente.telefono1,
//       telefono2: cliente.telefono2,
//       rfc: cliente.rfc,
//       email: cliente.email
//     });
//     setCurrentId(cliente.id);
//     setIsEditing(true);
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };

//   return (
//     <div className="min-h-screen bg-white p-6 md:p-10 animate-fade-in flex flex-col">
//       <div className="max-w-7xl mx-auto w-full mb-4">
//         <img src={logoEmpresa} alt="Logo" className="h-16 md:h-20 object-contain" />
//       </div>

//       <main className="w-full max-w-7xl mx-auto flex flex-col">
//         <div className="flex justify-center items-center gap-4 mb-10 text-[#e65100]">
//           <h1 className="text-5xl font-normal">Clientes</h1>
//         </div>

//         {/* FORMULARIO DINÁMICO */}
//         <div className={`flex flex-wrap items-end gap-4 mb-8 p-6 rounded-lg border shadow-sm transition-colors ${isEditing ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-100'}`}>
//           {[
//             { id: 'nombre', label: 'Nombre', req: true },
//             { id: 'telefono1', label: 'Teléfono 1', req: true },
//             { id: 'telefono2', label: 'Teléfono 2', req: false },
//             { id: 'rfc', label: 'RFC', req: false },
//             { id: 'email', label: 'E-mail', req: false }
//           ].map((field) => (
//             <div key={field.id} className="flex-1 min-w-[180px] relative group">
//               <input 
//                 type="text" 
//                 placeholder={`Ingrese ${field.label}${field.req ? '' : ' (Opcional)'}`}
//                 className="w-full p-2 pr-8 border border-gray-300 rounded focus:ring-2 focus:ring-[#3ab0e2] outline-none bg-white"
//                 value={formData[field.id as keyof typeof formData]}
//                 onChange={(e) => setFormData({...formData, [field.id]: e.target.value})}
//               />
//               {formData[field.id as keyof typeof formData] && (
//                 <button onClick={() => setFormData({...formData, [field.id]: ''})} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 cursor-pointer">
//                   <X size={16} />
//                 </button>
//               )}
//             </div>
//           ))}
          
//           <button 
//             onClick={handleMainAction}
//             className={`px-8 py-2 rounded transition-all flex items-center gap-2 font-medium cursor-pointer shadow-md text-white ${isEditing ? 'bg-green-600 hover:bg-green-700' : 'bg-[#3ab0e2] hover:bg-[#16A085]'}`}
//           >
//             {isEditing ? <><Save size={20} /> Guardar</> : <><Plus size={20} /> Agregar</>}
//           </button>
          
//           {isEditing && (
//             <button onClick={resetForm} className="text-gray-500 hover:underline cursor-pointer py-2">Cancelar</button>
//           )}
//         </div>

//         {/* BUSCADOR RESALTADO */}
//         <div className="flex items-center gap-2 mb-6 max-w-sm">
//           <div className="relative flex-1 flex">
//             <input 
//               type="text" 
//               placeholder="Buscar cliente..." 
//               className="w-full pl-3 pr-4 py-2 border-2 border-gray-200 rounded-l-md focus:border-[#3ab0e2] outline-none"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//             <button className="bg-[#3ab0e2] hover:bg-[#16A085] text-white px-4 rounded-r-md transition-all cursor-pointer flex items-center border-2 border-[#3ab0e2] hover:border-[#16A085]">
//               <Search size={20} />
//             </button>
//           </div>
//         </div>

//         {/* TABLA CON COLUMNA CONSULTAR */}
//         <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
//           <table className="w-full text-left border-collapse">
//             <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
//               <tr>
//                 <th className="p-4 border-b">ID Cliente</th>
//                 <th className="p-4 border-b">Nombre</th>
//                 <th className="p-4 border-b">Teléfono 1</th>
//                 <th className="p-4 border-b">RFC</th>
//                 <th className="p-4 border-b">Correo electrónico</th>
//                 <th className="p-4 border-b">Historial</th>
//                 <th className="p-4 border-b text-center">Acciones</th>
//               </tr>
//             </thead>
//             <tbody className="text-gray-600 text-sm">
//               {clientes.filter(c => c.nombre.toLowerCase().includes(searchTerm.toLowerCase())).map((cliente) => (
//                 <tr key={cliente.id} className="hover:bg-gray-50 border-b border-gray-100">
//                   <td className="p-4 font-mono text-xs">{cliente.id}</td>
//                   <td className="p-4 font-medium text-gray-900">{cliente.nombre}</td>
//                   <td className="p-4">{cliente.telefono1}</td>
//                   <td className="p-4">{cliente.rfc || '---'}</td>
//                   <td className="p-4">{cliente.email || '---'}</td>
//                   <td className="p-4">
//                     <button 
//                       onClick={() => navigate(`/clients/history/${cliente.id}`)}
//                       className="flex items-center gap-1 text-[#3ab0e2] hover:text-[#16A085] font-semibold cursor-pointer underline underline-offset-4"
//                     >
//                       <ReceiptText size={16} /> Consultar
//                     </button>
//                   </td>
//                   <td className="p-4 flex justify-center gap-4">
//                     <button onClick={() => startEdit(cliente)} className="text-amber-500 hover:text-amber-700 cursor-pointer font-bold">Editar</button>
//                     <button onClick={() => saveToLocalStorage(clientes.filter(c => c.id !== cliente.id))} className="text-red-500 hover:text-red-700 cursor-pointer font-bold">Eliminar</button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </main>
//     </div>
//   );
// }


import { useState, useEffect } from 'react';
import { Search, Plus, X, Save, ReceiptText, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logoEmpresa from '../assets/logo_empresa.jpg';
import { getClients, createClient, updateClient, deleteClient } from '../api/clients';
import type { Client } from '../types';

export default function ClientsPage() {
  const navigate = useNavigate();

  // --- ESTADOS ---
  const [clientes, setClientes] = useState<Client[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(20);

  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone1: '',
    clientPhone2: '',
    RFC: '',
    email: ''
  });

  // --- CARGA DESDE LA API ---
  useEffect(() => {
    getClients().then((data) => {
      data.sort((a, b) => a.clientName.localeCompare(b.clientName));
      setClientes(data);
    });
  }, []);

  // --- ACCIONES DEL FORMULARIO ---
  const handleMainAction = async () => {
    if (!formData.clientName.trim() || !formData.clientPhone1.trim()) {
      alert("Error: El Nombre y el Teléfono 1 son campos obligatorios.");
      return;
    }

    try {
      if (isEditing && currentId) {
        const updated = await updateClient(currentId, formData);
        setClientes(prev => prev.map(c => c.clientCode === currentId ? updated : c).sort((a, b) => a.clientName.localeCompare(b.clientName)));
      } else {
        const created = await createClient(formData);
        setClientes(prev => [...prev, created].sort((a, b) => a.clientName.localeCompare(b.clientName)));
      }
      resetForm();
    } catch (error: any) {
      alert(error?.response?.data?.message || "Ocurrió un error al guardar el cliente.");
    }
  };

  const startEdit = (cliente: Client) => {
    setFormData({
      clientName: cliente.clientName,
      clientPhone1: cliente.clientPhone1 || '',
      clientPhone2: cliente.clientPhone2 || '',
      RFC: cliente.RFC || '',
      email: cliente.email || ''
    });
    setCurrentId(cliente.clientCode);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormData({ clientName: '', clientPhone1: '', clientPhone2: '', RFC: '', email: '' });
    setIsEditing(false);
    setCurrentId(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Estás seguro de eliminar este cliente?")) {
      await deleteClient(id);
      setClientes(prev => prev.filter(c => c.clientCode !== id));
    }
  };

  // --- FILTRADO Y PAGINACIÓN ---
  const filteredClientes = clientes.filter(c =>
    c.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.clientCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.RFC || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedClientes = filteredClientes.slice(0, visibleCount);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans animate-fade-in">
      {/* HEADER: Divider line at bottom */}
      <header className="relative py-6 mb-8 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center items-center h-16">
          <img
            src={logoEmpresa}
            alt="Logo Empresa"
            className="absolute left-4 sm:left-6 lg:left-8 h-16 md:h-20 object-contain"
          />
          <h1 className="text-4xl md:text-5xl font-normal text-[#e65100] tracking-tight text-center">
            Clientes
          </h1>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col mb-10">
        
        {/* 3. FORMULARIO DINÁMICO (5 CAMPOS + BOTÓN CAMALEÓN) */}
        <div className={`flex flex-wrap items-end gap-4 mb-8 p-6 rounded-lg border shadow-sm transition-all duration-300 ${isEditing ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-100'}`}>
          {[
            { id: 'clientName', label: 'Nombre', req: true },
            { id: 'clientPhone1', label: 'Teléfono 1', req: true },
            { id: 'clientPhone2', label: 'Teléfono 2', req: false },
            { id: 'RFC', label: 'RFC', req: false },
            { id: 'email', label: 'E-mail', req: false }
          ].map((field) => (
            <div key={field.id} className="flex-1 min-w-[190px] relative">
              <input 
                type="text" 
                placeholder={`Ingrese ${field.label}${field.req ? '' : ' (Opcional)'}`}
                className="w-full p-2 pr-8 border border-gray-300 rounded focus:ring-2 focus:ring-[#3ab0e2] outline-none bg-white transition-all"
                value={formData[field.id as keyof typeof formData]}
                onChange={(e) => setFormData({...formData, [field.id]: e.target.value})}
              />
              {formData[field.id as keyof typeof formData] && (
                <button 
                  onClick={() => setFormData({...formData, [field.id]: ''})} 
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 cursor-pointer p-1"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
          
          <div className="flex gap-2">
            <button 
              onClick={handleMainAction}
              className={`px-8 py-2 rounded transition-all flex items-center gap-2 font-medium cursor-pointer shadow-md text-white ${isEditing ? 'bg-green-600 hover:bg-green-700' : 'bg-[#3ab0e2] hover:bg-[#16A085]'}`}
            >
              {isEditing ? <><Save size={20} /> Guardar</> : <><Plus size={20} /> Agregar</>}
            </button>
            
            {isEditing && (
              <button 
                onClick={resetForm} 
                className="text-gray-500 hover:text-gray-700 cursor-pointer py-2 px-2 underline text-sm"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>

        {/* 4. BUSCADOR RESALTADO EN AZUL */}
        <div className="flex items-center gap-2 mb-6 max-w-sm">
          <div className="relative flex-1 flex shadow-sm">
            <input 
              type="text" 
              placeholder="Buscar cliente..." 
              className="w-full pl-3 pr-4 py-2 border-2 border-gray-200 rounded-l-md focus:border-[#3ab0e2] outline-none transition-colors"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setVisibleCount(20); // Reset paginación al buscar
              }}
            />
            <button className="bg-[#3ab0e2] hover:bg-[#16A085] text-white px-5 rounded-r-md transition-all cursor-pointer flex items-center border-2 border-[#3ab0e2] hover:border-[#16A085]">
              <Search size={20} />
            </button>
          </div>
        </div>

        {/* 5. TABLA DE RESULTADOS */}
        <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs font-bold">
              <tr>
                <th className="p-4 border-b">ID Cliente</th>
                <th className="p-4 border-b">Nombre</th>
                <th className="p-4 border-b">Teléfono 1</th>
                <th className="p-4 border-b">RFC</th>
                <th className="p-4 border-b">Correo electrónico</th>
                <th className="p-4 border-b">Historial</th>
                <th className="p-4 border-b text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm">
              {displayedClientes.map((cliente) => (
                <tr key={cliente.clientCode} className="hover:bg-gray-50 border-b border-gray-100 transition-colors">
                  <td className="p-4 font-mono text-[10px] text-gray-400">{cliente.clientCode}</td>
                  <td className="p-4 font-medium text-gray-900">{cliente.clientName}</td>
                  <td className="p-4">{cliente.clientPhone1}</td>
                  <td className="p-4">{cliente.RFC || '---'}</td>
                  <td className="p-4">{cliente.email || '---'}</td>
                  <td className="p-4">
                    <button
                      onClick={() => navigate(`/clients/history/${cliente.clientCode}`)}
                      className="flex items-center gap-1 text-[#3ab0e2] hover:text-[#16A085] font-semibold cursor-pointer underline underline-offset-4 decoration-2"
                    >
                      <ReceiptText size={16} /> Consultar
                    </button>
                  </td>
                  <td className="p-4 flex justify-center gap-6">
                    <button
                      onClick={() => startEdit(cliente)}
                      className="text-amber-500 hover:text-amber-700 cursor-pointer font-bold transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(cliente.clientCode)}
                      className="text-red-500 hover:text-red-700 cursor-pointer font-bold transition-colors"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {displayedClientes.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-gray-400 italic bg-gray-50/50">
                    No se encontraron registros que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 6. BOTÓN CARGAR MÁS (DINÁMICO) */}
        {visibleCount < filteredClientes.length && (
          <div className="flex justify-center mt-8 mb-12">
            <button 
              onClick={() => setVisibleCount(prev => prev + 20)}
              className="flex items-center gap-2 border-2 border-[#3ab0e2] text-[#3ab0e2] hover:bg-[#3ab0e2] hover:text-white px-8 py-2 rounded-full transition-all font-medium cursor-pointer shadow-sm group"
            >
              Mostrar más registros 
              <ChevronDown size={18} className="group-hover:translate-y-1 transition-transform" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}