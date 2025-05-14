"use client";

import { createPortal } from "react-dom";
import { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import Calendar from "react-calendar";
import { timeRanges } from "./timeOptions";
import { format } from "date-fns";
import { calculatePopupPosition, PopupPosition } from "@/lib/utils/popupPosition";

interface Props {
  value: { from: Date | string; to: Date | string };
  timeLabel: string | null;
  onApply: (from: Date | string, to: Date | string, label: string | null) => void;
}

function parseRelativeTimeString(relativeStr: string | Date): Date {
  if (relativeStr instanceof Date) return relativeStr;

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

export default function ChartTimeDropdown({ value, onApply, timeLabel }: Props) {
  const fromCalendarRef = useRef<HTMLDivElement>(null);
  const toCalendarRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fromButtonRef = useRef<HTMLButtonElement>(null);
  const toButtonRef = useRef<HTMLButtonElement>(null);
  const dropdownButtonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showFromCalendar, setShowFromCalendar] = useState(false);
  const [showToCalendar, setShowToCalendar] = useState(false);
  const [fromCalendarPos, setFromCalendarPos] = useState<PopupPosition | null>(null);
  const [toCalendarPos, setToCalendarPos] = useState<PopupPosition | null>(null);
  const [dropdownPos, setDropdownPos] = useState<PopupPosition | null>(null);
  const [range, setRange] = useState<{ from: Date | string; to: Date | string }>(value);

  const openCalendar = (type: "from" | "to") => {
    const targetRef = type === "from" ? fromButtonRef : toButtonRef;
    if (!targetRef.current) return;
    const rect = targetRef.current.getBoundingClientRect();
    const pos = calculatePopupPosition(rect, 320, 320);

    if (type === "from") {
      setFromCalendarPos(pos);
      setShowFromCalendar(!showFromCalendar);
      setShowToCalendar(false);
    } else {
      setToCalendarPos(pos);
      setShowFromCalendar(false);
      setShowToCalendar(!showToCalendar);
    }
  };

  useEffect(() => {
    if (dropdownOpen && dropdownButtonRef.current) {
      const rect = dropdownButtonRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });
    }
  }, [dropdownOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        ref={dropdownButtonRef}
        onClick={() => {
          setDropdownOpen((prev) => !prev);
          setShowFromCalendar(false);
          setShowToCalendar(false);
        }}
        className="h-8 border px-3 py-1 rounded hover:bg-gray-100 flex items-center gap-1"
      >
        <CalendarIcon className="w-4 h-4" />
        <p>
          {timeLabel
            ? timeLabel
            : `${format(
                typeof range.from === "string" ? parseRelativeTimeString(range.from) : range.from,
                "dd/MM/yyyy HH:mm:ss"
              )} - ${format(
                typeof range.to === "string" ? parseRelativeTimeString(range.to) : range.to,
                "dd/MM/yyyy HH:mm:ss"
              )}`}
        </p>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>

      {dropdownOpen && dropdownPos && createPortal(
        <div 
          ref={dropdownRef}
          className="absolute z-10 w-[500px] h-[300px] flex bg-white border rounded shadow-lg mt-2 p-2 gap-1" 
          style={{
            top: dropdownPos.top,
            left: dropdownPos.left,
          }}
        >
          <div className="w-full h-full flex flex-col space-y-1 p-2">
            <p className="font-semibold">Khoảng thời gian</p>

            <p>Từ:</p>
            <button
              ref={fromButtonRef}
              onClick={() => openCalendar("from")}
              className="w-full text-left px-3 py-2 rounded bg-gray-50 hover:bg-gray-100 border"
            >
              <p>{typeof range.from === "string" ? range.from : format(range.from, "dd/MM/yyyy HH:mm:ss")}</p>
            </button>

            <p>Đến:</p>
            <button
              ref={toButtonRef}
              onClick={() => openCalendar("to")}
              className="w-full text-left px-3 py-2 rounded bg-gray-50 hover:bg-gray-100 border"
            >
              <p>{typeof range.to === "string" ? range.to : format(range.to, "dd/MM/yyyy HH:mm:ss")}</p>
            </button>
          </div>

          <div className="w-[1px] bg-gray-300"></div>

          <div className="w-[200px] h-full overflow-y-scroll scrollbar-hide">
            {timeRanges.map((r) => (
              <button
                key={r.label}
                className="w-full text-left px-3 py-2 rounded hover:bg-gray-100"
                onClick={() => {
                  const fromDate = parseRelativeTimeString(r.from);
                  const toDate = parseRelativeTimeString(r.to);
                  setRange({ from: r.from, to: r.to });
                  onApply(fromDate, toDate, r.label);
                  setDropdownOpen(false);
                }}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}

      {showFromCalendar && fromCalendarPos && createPortal(
        <div
          ref={fromCalendarRef}
          className="fixed z-30 bg-white p-2 border rounded shadow-lg text-center"
          style={{ top: fromCalendarPos.top, left: fromCalendarPos.left, width: 320 }}
        >
          <p className="text-sm text-gray-500">Chọn ngày bắt đầu</p>
          <Calendar
            onChange={(date) => {
              if (date instanceof Date) {
                setRange({ from: date, to: range.to });
                onApply(
                  date,
                  typeof range.to === "string" ? parseRelativeTimeString(range.to) : range.to,
                  null
                );
                setShowFromCalendar(false);
              }
            }}
            minDate={new Date("1991-01-01")}
            maxDate={typeof range.to === "string" ? parseRelativeTimeString(range.to) : range.to}
            value={typeof range.from === "string" ? parseRelativeTimeString(range.from) : range.from}
          />
        </div>,
        document.body
      )}

      {showToCalendar && toCalendarPos && createPortal(
        <div
          ref={toCalendarRef}
          className="fixed z-30 bg-white p-2 border rounded shadow-lg text-center"
          style={{ top: toCalendarPos.top, left: toCalendarPos.left, width: 320 }}
        >
          <p className="text-sm text-gray-500">Chọn ngày kết thúc</p>
          <Calendar
            onChange={(date) => {
              if (date instanceof Date) {
                const endOfDay = new Date(date);
                endOfDay.setHours(23, 59, 59, 999);
                setRange({ from: range.from, to: endOfDay });
                onApply(
                  typeof range.from === "string" ? parseRelativeTimeString(range.from) : range.from,
                  endOfDay,
                  null
                );
                setShowToCalendar(false);
              }
            }}
            minDate={typeof range.from === "string" ? parseRelativeTimeString(range.from) : range.from}
            maxDate={new Date()}
            value={typeof range.to === "string" ? parseRelativeTimeString(range.to) : range.to}
          />
        </div>,
        document.body
      )}
    </div>
  );
}