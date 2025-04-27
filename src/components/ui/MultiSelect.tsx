"use client";

import { useState, useRef, Fragment } from "react";
import { Transition } from "@headlessui/react";
import { X } from "lucide-react";

interface Option {
  label: string;
  value: number | string;
}

interface Props {
  options: Option[];
  selected: Option[];
  onChange: (selected: Option[]) => void;
  placeholder?: string;
  maxSuggest?: number;
}

export default function MultiSelect({
  options,
  selected,
  onChange,
  placeholder,
  maxSuggest = 5,
}: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = options
    .filter((opt) => !selected.some((s) => s.value === opt.value))
    .filter((opt) =>
      opt.label.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, maxSuggest);

  const remove = (value: string | number) =>
    onChange(selected.filter((s) => s.value !== value));

  const add = (opt: Option) => {
    onChange([...selected, opt]);
    setQuery("");
  };

  return (
    <div className="w-full relative">
      <div
        className="flex items-center gap-2 border px-2 py-2 rounded bg-white min-h-[44px] overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-gray-300"
        onClick={() => inputRef.current?.focus()}
      >
        {/* Tag đã chọn */}
        {selected.map((s) => (
          <span
            key={s.value}
            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
          >
            {s.label}
            <button
              type="button"
              onClick={() => remove(s.value)}
              className="hover:text-red-500"
            >
              <X className="w-4 h-4" />
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 100)}
          placeholder={selected.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] text-sm px-2 py-1 focus:outline-none bg-transparent"
        />
      </div>

      {open && filteredOptions.length > 0 && (
        <Transition
          as={Fragment}
          show={open}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <ul className="absolute z-10 mt-1 w-full bg-white shadow border rounded max-h-60 overflow-y-auto text-sm">
            {filteredOptions.map((opt) => (
              <li
                key={opt.value}
                onClick={() => add(opt)}
                className="cursor-pointer px-3 py-2 hover:bg-blue-100"
              >
                {opt.label}
              </li>
            ))}
          </ul>
        </Transition>
      )}
    </div>
  );
}