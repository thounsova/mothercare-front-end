"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image, { StaticImageData } from "next/image";
import { ChevronDown } from "lucide-react";
import Good from "@/app/img/good.jpg";
import Low from "@/app/img/low.jpg";
import Medium from  "@/app/img/medium.jpg";
import Question from  "@/app/img/question.png";



type Item = {
  id: string | number;
  label: string;
  icon: StaticImageData; // image URL
};

type SelectWithIconsProps = {
  items?: Item[];                // optional; uses defaults if omitted
  value?: string | number;       // controlled value (id)
  defaultValueId?: string | number; // initial value (uncontrolled)
  onChange?: (id: string | number, item: Item) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  name?: string; // to integrate with forms
};

// ✅ default list (used if `items` not provided)
const DEFAULT_ITEMS: Item[] = [
  { id: "1", label: "Good", icon: Good },
  { id: "3", label: "Medium", icon: Medium },
  { id: "5", label: "Low", icon: Low },
  { id: "7", label: "?", icon: Question },
];

export default function SelectWithIcons({
  items,
  value,
  defaultValueId,
  onChange,
  placeholder = "Select an option",
  className = "",
  disabled = false,
  name,
}: SelectWithIconsProps) {
  const data = items && items.length ? items : DEFAULT_ITEMS;

  // uncontrolled internal state (falls back if `value` not supplied)
  const [open, setOpen] = useState(false);
  const [internalId, setInternalId] = useState<string | number | undefined>(
    value ?? defaultValueId ?? data[0]?.id
  );
  const selectedId = value ?? internalId;

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  useEffect(() => {
    // sync internal state if parent controls `value`
    if (value !== undefined) setInternalId(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedItem = useMemo(
    () => data.find((i) => i.id === selectedId),
    [data, selectedId]
  );

  function commitSelection(item: Item) {
    if (value === undefined) setInternalId(item.id);
    onChange?.(item.id, item);
    setOpen(false);
    setActiveIndex(-1);
  }

  function onButtonKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;

    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
      // focus currently selected or first
      const idx =
        data.findIndex((i) => i.id === selectedId) >= 0
          ? data.findIndex((i) => i.id === selectedId)
          : 0;
      setActiveIndex(idx);
      // allow list to render first
      requestAnimationFrame(() => {
        const el = listRef.current?.querySelectorAll("li")[idx] as
          | HTMLLIElement
          | undefined;
        el?.focus();
      });
    }
  }

  function onItemKeyDown(
    e: React.KeyboardEvent<HTMLLIElement>,
    idx: number,
    item: Item
  ) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.min(idx + 1, data.length - 1);
      setActiveIndex(next);
      (listRef.current?.querySelectorAll("li")[next] as HTMLLIElement)?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = Math.max(idx - 1, 0);
      setActiveIndex(prev);
      (listRef.current?.querySelectorAll("li")[prev] as HTMLLIElement)?.focus();
    } else if (e.key === "Enter") {
      e.preventDefault();
      commitSelection(item);
    } else if (e.key === "Escape" || e.key === "Tab") {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      {/* Hidden input for HTML forms */}
      {name && (
        <input type="hidden" name={name} value={selectedId ?? ""} readOnly />
      )}

      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={onButtonKeyDown}
        className={`w-full flex items-center justify-between gap-3 rounded-xl border px-4 py-2 shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed ${
          open ? "ring-2 ring-blue-400" : ""
        }`}
      >
        <div className="flex text-black items-center gap-3 min-w-0">
          {selectedItem ? (
            <>
              <Image
                src={selectedItem.icon}
                alt=""
                width={20}
                height={20}
                className="rounded-sm"
              />
              <span className="truncate">{selectedItem.label}</span>
            </>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>
        <ChevronDown size={18} />
      </button>

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          tabIndex={-1}
          className="absolute z-50 mt-2 w-full max-h-64 overflow-auto rounded-xl border bg-white shadow-lg"
        >
          {data.map((item, idx) => {
            const selected = item.id === selectedId;
            const active = idx === activeIndex;
            return (
              <li
                key={item.id}
                role="option"
                aria-selected={selected}
                tabIndex={0}
                onClick={() => commitSelection(item)}
                onKeyDown={(e) => onItemKeyDown(e, idx, item)}
                className={`flex items-center gap-3 px-3 py-2 cursor-pointer outline-none ${
                  active ? "bg-blue-50" : ""
                } ${selected ? "font-medium" : "font-normal"} hover:bg-blue-50`}
              >
                <Image
                  src={item.icon}
                  alt=""
                  width={20}
                  height={20}
                  className="rounded-sm shrink-0"
                />
                <span className="truncate">{item.label}</span>
                {selected && (
                  <span className="ml-auto text-xs text-blue-600">Selected</span>
                )}
              </li>
            );
          })}
          {data.length === 0 && (
            <li className="px-3 py-2 text-gray-500">No options</li>
          )}
        </ul>
      )}
    </div>
  );
}
