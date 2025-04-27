import { useRef, useState, useEffect } from "react";
import Calendar from "react-calendar";
import { CalendarIcon } from "lucide-react";
import { useClickOutside } from "@/lib/hooks/useClickOutside";

interface FilterDatePickerProps {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
}

export const FilterDatePicker = ({ label, value, onChange }: FilterDatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [calendarPosition, setCalendarPosition] = useState<{ top: number; left: number } | null>(null);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  useClickOutside(calendarRef, () => setIsOpen(false));

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const calendarWidth = 300;
      const calendarHeight = 300;

      let top = rect.bottom;
      let left = rect.left;

      if (window.innerHeight - rect.bottom < calendarHeight) {
        top = rect.top - calendarHeight;
      }

      if (window.innerWidth - rect.left < calendarWidth) {
        left = window.innerWidth - calendarWidth - 16;
      }

      setCalendarPosition({ top, left });
    }
  }, [isOpen]);

  return (
    <div className="space-y-1 relative">
      <label className="text-sm font-medium">{label}</label>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-2 border rounded-md flex justify-between items-center"
      >
        <span>{value ? value.toLocaleDateString("vi-VN") : `Chọn ${label.toLowerCase()}`}</span>
        <CalendarIcon className="w-5 h-5 text-gray-500" />
      </button>

      {isOpen && calendarPosition && (
        <div
          ref={calendarRef}
          className="fixed z-50 bg-white border rounded-md shadow-md"
          style={{
            top: calendarPosition.top,
            left: calendarPosition.left,
            width: 300,
          }}
        >
          <Calendar
            onChange={(date) => {
              onChange(date as Date);
              setIsOpen(false);
            }}
            value={value || new Date()}
            locale="vi-VN"
          />
        </div>
      )}
    </div>
  );
};
