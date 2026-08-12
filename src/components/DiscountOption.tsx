import { CheckCircle2, Circle } from 'lucide-react';

interface DiscountOptionProps {
  label: string;
  checked: boolean;
  activeColor: string;
}

export default function DiscountOption({ label, checked, activeColor }: DiscountOptionProps) {
  return (
    // min-w-0: permite que esta fila se achique/el texto haga wrap cuando el
    // espacio es angosto (celular), en vez de forzar overflow horizontal —
    // en pantallas anchas no cambia nada porque nunca falta espacio ahí.
    <div className={`flex items-center gap-3 md:gap-4 min-w-0 transition-all duration-200 ${checked ? 'text-gray-900' : 'text-gray-400'}`}>
      <div className="relative flex items-center justify-center shrink-0">
        {checked ? (
          <CheckCircle2 className={`${activeColor} animate-in zoom-in-50 duration-300 w-7 h-7 md:w-9 md:h-9`} />
        ) : (
          <Circle className="text-gray-300 group-hover:text-gray-400 w-7 h-7 md:w-9 md:h-9" />
        )}
      </div>
      <span className={`text-lg md:text-2xl transition-all ${checked ? 'font-bold' : 'font-normal'}`}>
        {label}
      </span>
    </div>
  );
}