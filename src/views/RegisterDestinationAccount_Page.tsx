import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Search, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import logoEmpresa from '../assets/logo_empresa.jpg';
import { getDestAccounts, createDestAccount, deleteDestAccount } from '../api/destAccounts';
import type { DestAccount } from '../types';

export default function RegisterDestinationAccount_Page() {
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState<DestAccount[]>([]);

  useEffect(() => {
    getDestAccounts().then(setAccounts);
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedAccountId, setExpandedAccountId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    accountAlias: '',
    holderName: '',
    bank: '',
    accountNumber: '',
    clabe: '',
  });

  const filteredAccounts = accounts.filter(acc =>
    (acc.accountAlias || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (acc.holderName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (acc.bank || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (acc.accountNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    acc.clabe.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (clabe: string, alias: string) => {
    const isConfirmed = window.confirm(`¿Estás seguro de que deseas eliminar la cuenta "${alias}"?`);
    if (isConfirmed) {
      try {
        await deleteDestAccount(clabe);
        setAccounts(accounts.filter(acc => acc.clabe !== clabe));
        if (expandedAccountId === clabe) {
          setExpandedAccountId(null);
        }
      } catch (error: any) {
        alert(error?.response?.data?.message || 'Ocurrió un error al eliminar la cuenta.');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // La CLABE solo acepta dígitos (la base de datos exige exactamente 18)
    const cleanValue = name === 'clabe' ? value.replace(/\D/g, '').slice(0, 18) : value;
    setFormData(prev => ({ ...prev, [name]: cleanValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.accountAlias || !formData.holderName || !formData.clabe) {
      alert('Alias de cuenta, Nombre titular y Cuenta Clabe son obligatorios.');
      return;
    }
    if (!/^\d{18}$/.test(formData.clabe)) {
      alert('La Cuenta Clabe debe tener exactamente 18 dígitos numéricos.');
      return;
    }

    try {
      const newAccount = await createDestAccount(formData);
      setAccounts([...accounts, newAccount]);
      setFormData({ accountAlias: '', holderName: '', bank: '', accountNumber: '', clabe: '' });
      alert('Cuenta agregada exitosamente');
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Ocurrió un error al agregar la cuenta.');
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 md:p-10 animate-fade-in flex flex-col items-center">
      
      {/* Header aligned like the other pages */}
      <div className="w-full max-w-7xl mb-8 border-b border-gray-200 pb-8 relative flex items-center justify-center min-h-[5rem]">
        {/* Back Button and Logo (Left) */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-6">
          <img 
            src={logoEmpresa} 
            alt="Logo Empresa" 
            className="h-20 w-auto object-contain" 
          />
          <button 
            onClick={() => navigate(-1)} 
            className="bg-[#3ab0e2] hover:bg-sky-400 text-white px-6 py-2 rounded shadow-sm transition-colors text-sm font-medium cursor-pointer"
          >
            Atras
          </button>
        </div>
        
        {/* Title Centered with Icon */}
        <div className="flex items-center gap-4 text-[#e2694b]">
          <h1 className="text-4xl md:text-5xl font-normal tracking-tight">
            Cuenta destinó
          </h1>
          <Wallet size={45} strokeWidth={1.5} />
        </div>
      </div>

      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-12 mt-6">
        
        {/* Left Column: Saved Accounts */}
        <div className="flex flex-col w-full lg:w-[400px]">
          <div className="bg-[#b3bacb] rounded-lg p-6 shadow-sm flex flex-col h-[500px]">
            <h2 className="text-2xl text-gray-900 mb-6 text-center font-medium">Cuentas guardadas</h2>
            
            {/* Search Box */}
            <div className="relative mb-6">
              <input 
                type="text" 
                placeholder="Buscar por Alias, Nombre, Banco..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white rounded border border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#16A085] text-sm text-gray-800"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>

            {/* List with Scroll */}
            <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3 custom-scrollbar">
              {filteredAccounts.map((acc) => (
                <div key={acc.clabe} className="flex gap-3 items-start">

                  {/* Account Box Wrapper */}
                  <div className="flex-1 bg-white rounded shadow-sm overflow-hidden border border-gray-200">

                    {/* Header Button */}
                    <button
                      onClick={() => setExpandedAccountId(expandedAccountId === acc.clabe ? null : acc.clabe)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-colors ${
                        expandedAccountId === acc.clabe ? 'bg-[#16A085] text-white' : 'bg-white text-gray-800 hover:bg-gray-50'
                      }`}
                    >
                      <span className="truncate">{acc.accountAlias}</span>
                      {expandedAccountId === acc.clabe ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    {/* Expanded Content */}
                    {expandedAccountId === acc.clabe && (
                      <div className="px-4 pb-3 pt-2 text-xs text-gray-800 border-t border-gray-100 flex flex-col gap-1.5 bg-gray-50">
                         <div className="flex items-start">
                           <span className="font-semibold text-gray-600 w-16 shrink-0">Alias:</span>
                           <span className="truncate">{acc.accountAlias}</span>
                         </div>
                         <div className="flex items-start">
                           <span className="font-semibold text-gray-600 w-16 shrink-0">Nombre:</span>
                           <span className="line-clamp-2">{acc.holderName}</span>
                         </div>
                         <div className="flex items-start">
                           <span className="font-semibold text-gray-600 w-16 shrink-0">Banco:</span>
                           <span className="truncate">{acc.bank}</span>
                         </div>
                         <div className="flex items-start">
                           <span className="font-semibold text-gray-600 w-16 shrink-0">Cuenta:</span>
                           <span className="truncate">{acc.accountNumber}</span>
                         </div>
                         <div className="flex items-start">
                           <span className="font-semibold text-gray-600 w-16 shrink-0">Clabe:</span>
                           <span className="truncate">{acc.clabe}</span>
                         </div>
                      </div>
                    )}
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(acc.clabe, acc.accountAlias || '')}
                    className="bg-white hover:bg-red-50 text-gray-600 hover:text-red-500 rounded h-10 w-10 flex items-center justify-center transition-colors shadow-sm shrink-0 border border-gray-200 mt-0"
                    title="Eliminar cuenta"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              
              {filteredAccounts.length === 0 && (
                <div className="text-center text-gray-600 text-sm mt-4">
                  No se encontraron cuentas.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Registration Form */}
        <div className="flex-1 flex flex-col pt-10 px-0 lg:px-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-xl mx-auto w-full">
            
            <div className="flex items-center justify-between">
              <label htmlFor="accountAlias" className="text-gray-900 font-medium w-1/3 text-sm">
                Alias de cuenta:
              </label>
              <input
                type="text"
                name="accountAlias"
                id="accountAlias"
                value={formData.accountAlias}
                onChange={handleChange}
                required
                className="w-2/3 border border-gray-300 rounded py-1.5 px-3 text-gray-800 text-sm focus:outline-none focus:border-[#3ab0e2]"
              />
            </div>

            <div className="flex items-center justify-between">
              <label htmlFor="holderName" className="text-gray-900 font-medium w-1/3 text-sm">
                Nombre titular:
              </label>
              <input
                type="text"
                name="holderName"
                id="holderName"
                value={formData.holderName}
                onChange={handleChange}
                required
                className="w-2/3 border border-gray-300 rounded py-1.5 px-3 text-gray-800 text-sm focus:outline-none focus:border-[#3ab0e2]"
              />
            </div>

            <div className="flex items-center justify-between">
              <label htmlFor="bank" className="text-gray-900 font-medium w-1/3 text-sm">
                Banco:
              </label>
              <input
                type="text"
                name="bank"
                id="bank"
                value={formData.bank}
                onChange={handleChange}
                className="w-2/3 border border-gray-300 rounded py-1.5 px-3 text-gray-800 text-sm focus:outline-none focus:border-[#3ab0e2]"
              />
            </div>

            <div className="flex items-center justify-between">
              <label htmlFor="accountNumber" className="text-gray-900 font-medium w-1/3 text-sm">
                Número Cuenta:
              </label>
              <input
                type="text"
                name="accountNumber"
                id="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                className="w-2/3 border border-gray-300 rounded py-1.5 px-3 text-gray-800 text-sm focus:outline-none focus:border-[#3ab0e2]"
              />
            </div>

            <div className="flex items-center justify-between">
              <label htmlFor="clabe" className="text-gray-900 font-medium w-1/3 text-sm">
                Cuenta Clabe:
              </label>
              <input
                type="text"
                name="clabe"
                id="clabe"
                value={formData.clabe}
                onChange={handleChange}
                required
                inputMode="numeric"
                maxLength={18}
                placeholder="18 dígitos"
                className="w-2/3 border border-gray-300 rounded py-1.5 px-3 text-gray-800 text-sm focus:outline-none focus:border-[#3ab0e2]"
              />
            </div>

            <div className="flex justify-end mt-6">
              <button 
                type="submit" 
                className="bg-[#3ab0e2] hover:bg-sky-400 text-white px-10 py-2 rounded shadow-sm transition-colors text-sm font-medium cursor-pointer"
              >
                Agregar
              </button>
            </div>
            
          </form>
        </div>

      </div>
      
      {/* Agregar estilos para el scrollbar internamente */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #a3aac0;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #828ba3;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6a748c;
        }
      `}</style>
    </div>
  );
}
