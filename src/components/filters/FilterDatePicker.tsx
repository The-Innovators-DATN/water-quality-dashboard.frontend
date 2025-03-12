"use client";

import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CalendarIcon } from "lucide-react";

interface FilterDatePickerProps {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
}

const FilterDatePicker = ({ label, value, onChange }: FilterDatePickerProps) => {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      <div className="relative">
        <DatePicker
          selected={value}
          onChange={onChange}
          dateFormat="dd/MM/yyyy"
          className="w-full p-2 border rounded-md"
          placeholderText={`Chọn ${label.toLowerCase()}`}
        />
        <CalendarIcon className="absolute right-2 top-2 w-5 h-5 text-gray-500" />
      </div>
    </div>
  );
};

export default FilterDatePicker;
