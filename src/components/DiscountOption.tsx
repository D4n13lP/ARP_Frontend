import { CheckCircle2, Circle } from 'lucide-react';

interface DiscountOptionProps {
  label: string;
  checked: boolean;
  activeColor: string;
}

export default function DiscountOption({ label, checked, activeColor }: DiscountOptionProps) {
  return (
    <div className={`flex items-center gap-4 transition-all duration-200 ${checked ? 'text-gray-900' : 'text-gray-400'}`}>
      <div className="relative flex items-center justify-center">
        {checked ? (
          <CheckCircle2 className={`${activeColor} animate-in zoom-in-50 duration-300`} size={36} />
        ) : (
          <Circle className="text-gray-300 group-hover:text-gray-400" size={36} />
        )}
      </div>
      <span className={`text-2xl transition-all ${checked ? 'font-bold' : 'font-normal'}`}>
        {label}
      </span>
    </div>
  );
}