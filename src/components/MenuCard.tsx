import { type LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MenuCardProps {
  label: string;
  icon: LucideIcon; 
  path: string;
  bgColor: string;   
}

export default function MenuCard({ label, icon: Icon, path, bgColor }: MenuCardProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(path)}
      /* Añadimos 'cursor-pointer' para asegurar el icono de la mano */
      className="group flex bg-white shadow-[0_4px_15px_rgba(0,0,0,0.1)] border border-gray-100 rounded-sm w-full max-w-[340px] h-32 overflow-hidden transition-transform duration-300 hover:scale-[1.02] cursor-pointer"
    >
      {/* Lado del Icono: Mantiene su color original (bgColor) */}
      <div 
        className={`${bgColor} w-1/3 flex items-center justify-center text-white shadow-inner`}
      >
        <Icon size={48} strokeWidth={1.5} />
      </div>

      {/* Lado del Texto: Cambia a verde #16A085 y el texto a blanco en hover */}
      <div className="w-2/3 flex items-center justify-center bg-white group-hover:bg-[#16A085] px-4 text-center transition-colors duration-300">
        <span className="text-lg font-medium text-gray-700 group-hover:text-white tracking-wide leading-tight transition-colors duration-300">
          {label}
        </span>
      </div>
    </button>
  );
}