"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import Calendar from "react-calendar";
import { timeRanges } from "./timeOptions";
import { format } from "date-fns";
import { calculatePopupPosition, PopupPosition } from "@/lib/utils/popupPosition";

interface Props {
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

export default function ChartTimeDropdown({ onApply }: Props) {
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

  const [range, setRange] = useState<[Date | string, Date | string]>(() => {
    const now = new Date();
    const from = new Date();
    from.setHours(from.getHours() - 24);
    return [from, now];
  });

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
    if (range[0] && range[1]) {
      const fromDate = typeof range[0] === "string" ? parseRelativeTimeString(range[0]) : range[0];
      const toDate = typeof range[1] === "string" ? parseRelativeTimeString(range[1]) : range[1];
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
              <p>{typeof range[0] === "string" ? range[0] : format(range[0], "dd/MM/yyyy HH:mm:ss")}</p>
            </button>

            <p>Đến:</p>
            <button
              ref={toButtonRef}
              onClick={() => openCalendar("to")}
              className="w-full text-left px-3 py-2 rounded bg-gray-50 hover:bg-gray-100 border"
            >
              <p>{typeof range[1] === "string" ? range[1] : format(range[1], "dd/MM/yyyy HH:mm:ss")}</p>
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
                  setRange([r.from, r.to]);
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
                setRange(([_, to]) => [date, to]);
                setShowFromCalendar(false);
              }
            }}
            maxDate={typeof range[1] === "string" ? parseRelativeTimeString(range[1]) : range[1]}
            value={typeof range[0] === "string" ? parseRelativeTimeString(range[0]) : range[0]}
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
                setRange(([from]) => [from, endOfDay]);
                setShowToCalendar(false);
              }
            }}
            minDate={typeof range[0] === "string" ? parseRelativeTimeString(range[0]) : range[0]}
            maxDate={new Date()}
            value={typeof range[1] === "string" ? parseRelativeTimeString(range[1]) : range[1]}
          />
        </div>
      )}
    </div>
  );
}
