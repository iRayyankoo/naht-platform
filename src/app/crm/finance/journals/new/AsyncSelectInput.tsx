"use client";

import React, { useState, useEffect, useRef, useCallback, useId } from "react";

export interface AsyncOption {
  value: string;
  label: string;
  description?: string;
}

interface AsyncSelectInputProps {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  /** Returns items + whether more pages exist */
  loadOptions: (search: string, skip: number) => Promise<{ items: AsyncOption[]; hasMore: boolean }>;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}


export default function AsyncSelectInput({
  label,
  value,
  onChange,
  loadOptions,
  placeholder = "ابحث...",
  className = "",
  disabled = false,
}: AsyncSelectInputProps) {
  // Unique IDs per instance — no duplicate aria-controls
  const uid = useId();
  const listboxId = `asl-list-${uid}`;
  const inputId = `asl-input-${uid}`;

  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<AsyncOption[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<AsyncOption | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(true);
  const loadCountRef = useRef(0);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Resolve selectedOption when value changes externally
  useEffect(() => {
    if (!value) {
      if (selectedOption) {
        Promise.resolve().then(() => {
          if (isMountedRef.current) {
            setSelectedOption(null);
            setSearch("");
          }
        });
      }
      return;
    }
    if (value && selectedOption?.value === value) return;
    // Try to find in already-loaded options first
    const found = options.find(o => o.value === value);
    if (found) {
      Promise.resolve().then(() => {
        if (isMountedRef.current) setSelectedOption(found);
      });
      return;
    }

    // Fallback: load first page and find
    let cancelled = false;
    loadOptions("", 0).then(res => {
      if (cancelled || !isMountedRef.current) return;
      const match = res.items.find(o => o.value === value);
      if (match) setSelectedOption(match);
    });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const fetchOptions = useCallback(
    async (searchTerm: string, skip: number, append: boolean) => {
      if (disabled) return;
      const currentLoadId = ++loadCountRef.current;
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
        setOptions([]);
        setHasMore(false);
        setFocusedIndex(-1);
      }
      try {
        const res = await loadOptions(searchTerm, skip);
        if (currentLoadId !== loadCountRef.current || !isMountedRef.current) return;
        setOptions(prev => append ? [...prev, ...res.items] : res.items);
        setHasMore(res.hasMore);
        setError(null);
      } catch {
        if (currentLoadId !== loadCountRef.current || !isMountedRef.current) return;
        setError("فشل تحميل الخيارات");
        if (!append) setOptions([]);
      } finally {
        if (currentLoadId === loadCountRef.current && isMountedRef.current) {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    },
    [loadOptions, disabled]
  );

  // Debounced search effect
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      fetchOptions(search, 0, false);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, isOpen, fetchOptions]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch("");
        setFocusedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll focused option into view
  useEffect(() => {
    if (focusedIndex >= 0 && listRef.current) {
      const item = listRef.current.querySelector(`[data-index="${focusedIndex}"]`) as HTMLElement | null;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [focusedIndex]);

  const handleSelect = (option: AsyncOption) => {
    setSelectedOption(option);
    setSearch("");
    setIsOpen(false);
    setFocusedIndex(-1);
    onChange(option.value);
  };

  const handleClear = () => {
    setSelectedOption(null);
    setSearch("");
    setIsOpen(false);
    setFocusedIndex(-1);
    onChange(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter")) {
      e.preventDefault();
      setIsOpen(true);
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex(prev => Math.min(prev + 1, options.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex(prev => Math.max(prev - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (focusedIndex >= 0 && options[focusedIndex]) {
          handleSelect(options[focusedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setSearch("");
        setFocusedIndex(-1);
        break;
    }
  };

  const handleLoadMore = () => {
    fetchOptions(search, options.length, true);
  };

  const isBaseLocked = disabled;

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
        </label>
      )}
      <div
        className={`w-full px-3 py-2 bg-white border rounded-md shadow-sm focus-within:ring-1 focus-within:ring-primary focus-within:border-primary dark:bg-slate-800 dark:border-slate-700 dark:text-white ${
          isBaseLocked ? "opacity-50 cursor-not-allowed bg-gray-100" : "cursor-text"
        }`}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-owns={listboxId}
        onClick={() => {
          if (!isBaseLocked) {
            setIsOpen(true);
            inputRef.current?.focus();
          }
        }}
      >
        <div className="flex items-center gap-2">
          {/* Selected label (collapsed state) */}
          {selectedOption && !isOpen ? (
            <div className="flex-1 min-w-0">
              <span className="block truncate text-sm text-gray-900 dark:text-white">
                {selectedOption.label}
              </span>
              {selectedOption.description && (
                <span className="block text-xs text-gray-500 truncate dark:text-gray-400">
                  {selectedOption.description}
                </span>
              )}
            </div>
          ) : (
            <input
              ref={inputRef}
              id={inputId}
              type="text"
              role="searchbox"
              aria-autocomplete="list"
              aria-controls={listboxId}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => {
                if (!isBaseLocked) setIsOpen(true);
              }}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 min-w-0"
              placeholder={selectedOption ? selectedOption.label : placeholder}
              disabled={isBaseLocked}
              autoComplete="off"
            />
          )}

          {/* Clear button */}
          {selectedOption && !isBaseLocked && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              aria-label="مسح الاختيار"
              className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Chevron */}
          <svg
            className={`flex-shrink-0 h-4 w-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          id={listboxId}
          ref={listRef}
          role="listbox"
          aria-label={label || placeholder}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto dark:bg-slate-800 dark:border-slate-700"
        >
          {isLoading ? (
            <div className="p-3 text-sm text-center text-gray-500 dark:text-gray-400">جاري التحميل...</div>
          ) : error ? (
            <div className="p-3 text-sm text-center text-red-500">{error}</div>
          ) : options.length === 0 ? (
            <div className="p-3 text-sm text-center text-gray-500 dark:text-gray-400">لا توجد نتائج</div>
          ) : (
            <>
              {options.map((opt, idx) => {
                const isFocused = idx === focusedIndex;
                const isSelected = opt.value === value;
                return (
                  <div
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    data-index={idx}
                    onClick={() => handleSelect(opt)}
                    className={`px-3 py-2 cursor-pointer text-sm flex flex-col ${
                      isFocused
                        ? "bg-primary text-white"
                        : isSelected
                        ? "bg-primary-50 text-primary font-medium dark:bg-slate-700"
                        : "text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-slate-700"
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {opt.description && (
                      <span className={`text-xs truncate ${isFocused ? "text-primary-100" : "text-gray-500"}`}>
                        {opt.description}
                      </span>
                    )}
                  </div>
                );
              })}

              {/* Load More */}
              {hasMore && (
                <div className="px-3 py-2 border-t border-gray-100 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLoadMore();
                    }}
                    disabled={isLoadingMore}
                    className="w-full text-xs text-primary hover:text-primary-dark font-medium py-1 disabled:opacity-50"
                    aria-label="تحميل المزيد من الخيارات"
                  >
                    {isLoadingMore ? "جاري التحميل..." : `تحميل المزيد (${options.length} محمّل)`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
