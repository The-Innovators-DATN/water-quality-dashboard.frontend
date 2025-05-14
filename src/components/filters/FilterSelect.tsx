"use client";

import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from "@headlessui/react";
import { ChevronDown } from "lucide-react";

interface FilterSelectProps {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}

export const FilterSelect = ({ label, options, value, onChange }: FilterSelectProps) => {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      <Listbox value={value} onChange={onChange}>
        <div className="relative">
          <ListboxButton className="w-full p-2 border rounded-md text-left flex justify-between items-center">
            <span>{options.find((opt) => opt.value === value)?.label || `Chọn ${label.toLowerCase()}`}</span>
            <ChevronDown className="w-4 h-4" />
          </ListboxButton>
          <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto bg-white border rounded-md shadow-lg">
            {options.map((opt) => (
              <ListboxOption
                key={opt.value}
                value={opt.value}
                className={({ active }) =>
                  `cursor-pointer px-4 py-2 ${active ? 'bg-blue-100' : ''}`
                }
              >
                {opt.label}
              </ListboxOption>
            ))}
          </ListboxOptions>
        </div>
      </Listbox>
    </div>
  );
};
