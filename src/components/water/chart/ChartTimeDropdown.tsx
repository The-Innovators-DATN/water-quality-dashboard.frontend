"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import Calendar from "react-calendar";
import { timeRanges } from "./timeOptions";
import { format } from "date-fns";
import { calculatePopupPosition, PopupPosition } from "@/lib/utils/popupPosition";

interface Props {
  value: { from: Date | string, to: Date | string };
  onApply: (from: Date, to: Date) => void;
}

function parseRelativeTimeString(relativeStr: string): Date {
  const now = new Date();
  if (relativeStr === "now") return now;

  const match = relativeStr.match(/^now-(\d+)([smhdMy])$/);
  if (!match) return now;

  const [, amountStr, unit] = match;
  const amount = parseInt(amountStr, 10);

  switch (unit) {
    case "s": now.setSeconds(now.getSeconds() - amount); break;
    case "m": now.setMinutes(now.getMinutes() - amount); break;
    case "h": now.setHours(now.getHours() - amount); break;
    case "d": now.setDate(now.getDate() - amount); break;
    case "M": now.setMonth(now.getMonth() - amount); break;
    case "y": now.setFullYear(now.getFullYear() - amount); break;
  }

  return now;
}

export default function ChartTimeDropdown({ value, onApply }: Props) {
  const fromCalendarRef = useRef<HTMLDivElement>(null);
  const toCalendarRef = useRef<HTMLDivElement>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const fromButtonRef = useRef<HTMLButtonElement>(null);
  const toButtonRef = useRef<HTMLButtonElement>(null);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showFromCalendar, setShowFromCalendar] = useState(false);
  const [showToCalendar, setShowToCalendar] = useState(false);
  const [fromCalendarPos, setFromCalendarPos] = useState<PopupPosition | null>(null);
  const [toCalendarPos, setToCalendarPos] = useState<PopupPosition | null>(null);

  const [range, setRange] = useState<{ from: Date | string, to: Date | string }>(() => {
    const to = new Date();
    const from = new Date();
    from.setHours(from.getHours() - 24);
    return {from, to};
  });

  useEffect(() => {
    setRange(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
        setShowFromCalendar(false);
        setShowToCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const applyCustomRange = () => {
    if (range.from && range.to) {
      const fromDate = typeof range.from === "string" ? parseRelativeTimeString(range.from) : range.from;
      const toDate = typeof range.to === "string" ? parseRelativeTimeString(range.to) : range.to;
      onApply(fromDate, toDate);
      setDropdownOpen(false);
      setShowFromCalendar(false);
      setShowToCalendar(false);
    }
  };

  const openCalendar = (type: "from" | "to") => {
    const targetRef = type === "from" ? fromButtonRef : toButtonRef;
    if (!targetRef.current) return;

    const rect = targetRef.current.getBoundingClientRect();
    const pos = calculatePopupPosition(rect, 320, 320);

    if (type === "from") {
      setFromCalendarPos(pos);
      setShowFromCalendar(true);
      setShowToCalendar(false);
    } else {
      setToCalendarPos(pos);
      setShowFromCalendar(false);
      setShowToCalendar(true);
    }
  };

  useEffect(() => {
    const handleClickOutsidePopup = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        !fromCalendarRef.current?.contains(target) &&
        !fromButtonRef.current?.contains(target)
      ) {
        setShowFromCalendar(false);
      }
  
      if (
        !toCalendarRef.current?.contains(target) &&
        !toButtonRef.current?.contains(target)
      ) {
        setShowToCalendar(false);
      }
    };
  
    document.addEventListener("mousedown", handleClickOutsidePopup);
    return () => document.removeEventListener("mousedown", handleClickOutsidePopup);
  }, []);  

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        onClick={() => {
          setDropdownOpen((prev) => !prev);
          setShowFromCalendar(false);
          setShowToCalendar(false);
        }}
        className="h-8 border px-3 py-1 rounded hover:bg-gray-100 flex items-center gap-1"
      >
        <CalendarIcon className="w-4 h-4" />
        <span>Thời gian</span>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>

      {dropdownOpen && (
        <div className="absolute w-[500px] h-[300px] mt-2 flex bg-white border rounded shadow-lg z-30 p-2 gap-1">
          <div className="w-[400px] space-y-1">
            <p className="font-semibold">Khoảng thời gian</p>

            <p>Từ:</p>
            <button
              ref={fromButtonRef}
              onClick={() => openCalendar("from")}
              className="w-full text-left px-3 py-2 rounded bg-gray-50 hover:bg-gray-100 border"
            >
              <p>{format(range.from, "dd/MM/yyyy HH:mm:ss")}</p>
            </button>

            <p>Đến:</p>
            <button
              ref={toButtonRef}
              onClick={() => openCalendar("to")}
              className="w-full text-left px-3 py-2 rounded bg-gray-50 hover:bg-gray-100 border"
            >
              <p>{format(range.to, "dd/MM/yyyy HH:mm:ss")}</p>
            </button>

            <button
              className="w-full px-3 py-2 rounded bg-blue-600 text-white text-center border"
              onClick={applyCustomRange}
            >
              Áp dụng
            </button>
          </div>

          <div className="w-[1px] bg-gray-300"></div>

          <div className="w-[200px] h-full overflow-y-scroll">
            {timeRanges.map((r) => (
              <button
                key={r.label}
                className="w-full text-left px-3 py-2 rounded hover:bg-gray-100"
                onClick={() => {
                  onApply(parseRelativeTimeString(r.from), parseRelativeTimeString(r.to));
                  setRange({ from: parseRelativeTimeString(r.from), to: parseRelativeTimeString(r.to)});
                  setDropdownOpen(false);
                }}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {showFromCalendar && fromCalendarPos && (
        <div
          ref={fromCalendarRef}
          className="fixed z-50 bg-white p-2 border rounded shadow-lg text-center"
          style={{ top: fromCalendarPos.top, left: fromCalendarPos.left, width: 320 }}
        >
          <p className="text-sm text-gray-500">Chọn ngày bắt đầu</p>
          <Calendar
            onChange={(date) => {
              if (date instanceof Date) {
                setRange({ from: date, to: range.to});
                setShowFromCalendar(false);
              }
            }}
            maxDate={typeof range.to === "string" ? parseRelativeTimeString(range.to) : range.to}
            value={typeof range.from === "string" ? parseRelativeTimeString(range.from) : range.from}
          />
        </div>
      )}

      {showToCalendar && toCalendarPos && (
        <div
          ref={toCalendarRef}
          className="fixed z-50 bg-white p-2 border rounded shadow-lg text-center"
          style={{ top: toCalendarPos.top, left: toCalendarPos.left, width: 320 }}
        >
          <p className="text-sm text-gray-500">Chọn ngày kết thúc</p>
          <Calendar
            onChange={(date) => {
              if (date instanceof Date) {
                const endOfDay = new Date(date);
                endOfDay.setHours(23, 59, 59, 999);
                setRange({ from: range.from, to: endOfDay});
                setShowToCalendar(false);
              }
            }}
            minDate={typeof range.from === "string" ? parseRelativeTimeString(range.from) : range.from}
            maxDate={new Date()}
            value={typeof range.to === "string" ? parseRelativeTimeString(range.to) : range.to}
          />
        </div>
      )}
    </div>
  );
}
