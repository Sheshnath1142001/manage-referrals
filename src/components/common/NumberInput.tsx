
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface NumberInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label?: string;
}

export const NumberInput = ({ value, onChange, placeholder, label }: NumberInputProps) => {
  return (
    <div className="w-auto min-w-[120px]">
      {label && <label className="text-xs text-gray-500 mb-1 block">{label}</label>}
      <div className="relative">
        <Input
          placeholder={placeholder}
          className="w-full pr-8 h-9 bg-white border border-gray-300"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          type="number"
        />
        {value && (
          <button 
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground"
            onClick={() => onChange("")}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};
