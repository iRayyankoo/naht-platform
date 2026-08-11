"use client";

import React, { useCallback, useMemo } from "react";
import AsyncSelectInput, { AsyncOption } from "./AsyncSelectInput";
import { listAccountsAction, listCostCentersAction } from "@/actions/finance/reference-actions";

export interface JournalLineData {
  id: string; // temp id for react key
  accountId: string | null;
  costCenterId: string | null;
  description: string;
  debitAmount: string;
  creditAmount: string;
}

interface JournalLinesProps {
  ledgerId: string;
  lines: JournalLineData[];
  onChange: (lines: JournalLineData[]) => void;
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// BigInt helpers — no floating-point math, no Number(), no parseFloat()
// ---------------------------------------------------------------------------

/** Parse a decimal string (up to 4 decimal places) into a scaled BigInt ×10000 */
function parseToScaledBigInt(val: string): bigint {
  if (!val || val === ".") return BigInt(0);
  const clean = val.replace(/,/g, "").trim();
  if (!/^\d*\.?\d{0,4}$/.test(clean)) return BigInt(0);
  const parts = clean.split(".");
  const intPart = parts[0] || "0";
  const decPart = (parts[1] ?? "").padEnd(4, "0").slice(0, 4);
  return BigInt(intPart + decPart);
}

/** Return true if string represents a strictly positive amount */
function isPositiveAmount(val: string): boolean {
  return parseToScaledBigInt(val) > BigInt(0);
}

function formatScaledBigInt(val: bigint): string {
  const isNegative = val < BigInt(0);
  const absVal = isNegative ? -val : val;
  const str = absVal.toString().padStart(5, "0");
  const intPart = str.slice(0, -4) || "0";
  const decPart = str.slice(-4);
  const trimmedDec = decPart.replace(/0+$/, "");
  const result = trimmedDec.length > 0 ? `${intPart}.${trimmedDec}` : intPart;
  return isNegative ? `-${result}` : result;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function JournalLines({ ledgerId, lines, onChange, disabled = false }: JournalLinesProps) {

  const generateLineId = () => {
    const arr = new Uint32Array(2);
    crypto.getRandomValues(arr);
    return arr[0].toString(16) + arr[1].toString(16);
  };

  const handleAddLine = () => {
    onChange([
      ...lines,
      {
        id: generateLineId(),
        accountId: null,
        costCenterId: null,
        description: "",
        debitAmount: "",
        creditAmount: "",
      },
    ]);
  };

  const handleRemoveLine = (id: string) => {
    onChange(lines.filter((l) => l.id !== id));
  };

  const updateLine = (id: string, field: keyof JournalLineData, value: string | null) => {
    onChange(
      lines.map((l) => {
        if (l.id !== id) return l;
        const updated = { ...l, [field]: value };
        // Enforce exclusive: once debit is positive, clear credit and vice versa
        if (field === "debitAmount" && isPositiveAmount(value ?? "")) {
          updated.creditAmount = "";
        } else if (field === "creditAmount" && isPositiveAmount(value ?? "")) {
          updated.debitAmount = "";
        }
        return updated;
      })
    );
  };

  const handleAmountChange = (id: string, field: "debitAmount" | "creditAmount", value: string) => {
    // Accept empty string for clearing
    if (value !== "" && !/^\d*\.?\d{0,4}$/.test(value)) return;
    updateLine(id, field, value);
  };

  // loadOptions now matches AsyncSelectInput's (search, skip) => { items, hasMore }
  const loadAccounts = useCallback(
    async (search: string, skip: number): Promise<{ items: AsyncOption[]; hasMore: boolean }> => {
      if (!ledgerId) return { items: [], hasMore: false };
      const res = await listAccountsAction({ ledgerId, search, skip, take: 50 });
      if (!res.ok || !res.data) return { items: [], hasMore: false };
      const items = res.data.items.map((acc: { id: string; code: string; nameAr: string }) => ({
        value: acc.id,
        label: `[${acc.code}] ${acc.nameAr}`,
      }));
      return { items, hasMore: res.data.total > skip + items.length };
    },
    [ledgerId]
  );

  const loadCostCenters = useCallback(
    async (search: string, skip: number): Promise<{ items: AsyncOption[]; hasMore: boolean }> => {
      if (!ledgerId) return { items: [], hasMore: false };
      const res = await listCostCentersAction({ ledgerId, search, skip, take: 50 });
      if (!res.ok || !res.data) return { items: [], hasMore: false };
      const items = res.data.items.map((cc: { id: string; code: string; nameAr: string }) => ({
        value: cc.id,
        label: `[${cc.code}] ${cc.nameAr}`,
      }));
      return { items, hasMore: res.data.total > skip + items.length };
    },
    [ledgerId]
  );

  // Compute Totals using BigInt — zero floating-point involvement
  const { totalDebit, totalCredit, diff } = useMemo(() => {
    let d = BigInt(0);
    let c = BigInt(0);
    for (const l of lines) {
      d += parseToScaledBigInt(l.debitAmount);
      c += parseToScaledBigInt(l.creditAmount);
    }
    return {
      totalDebit: formatScaledBigInt(d),
      totalCredit: formatScaledBigInt(c),
      diff: formatScaledBigInt(d - c),
    };
  }, [lines]);

  return (
    <div className="space-y-4">
      {/* Desktop View: Table */}
      <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-sm text-right text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
            <tr>
              <th scope="col" className="px-4 py-3 w-64">الحساب <span className="text-red-500" aria-hidden="true">*</span></th>
              <th scope="col" className="px-4 py-3 w-64">مركز التكلفة</th>
              <th scope="col" className="px-4 py-3">البيان</th>
              <th scope="col" className="px-4 py-3 w-32">مدين</th>
              <th scope="col" className="px-4 py-3 w-32">دائن</th>
              <th scope="col" className="px-4 py-3 w-16 text-center">حذف</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line, idx) => (
              <tr key={line.id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-4 py-2">
                  <AsyncSelectInput
                    label=""
                    value={line.accountId}
                    onChange={(v) => updateLine(line.id, "accountId", v)}
                    loadOptions={loadAccounts}
                    disabled={!ledgerId || disabled}
                    placeholder="اختر الحساب..."
                  />
                </td>
                <td className="px-4 py-2">
                  <AsyncSelectInput
                    label=""
                    value={line.costCenterId}
                    onChange={(v) => updateLine(line.id, "costCenterId", v)}
                    loadOptions={loadCostCenters}
                    disabled={!ledgerId || disabled}
                    placeholder="اختياري..."
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    aria-label={`بيان السطر ${idx + 1}`}
                    value={line.description}
                    onChange={(e) => updateLine(line.id, "description", e.target.value)}
                    disabled={disabled}
                    className="w-full border-gray-300 rounded-md focus:ring-primary focus:border-primary px-3 py-2 border shadow-sm disabled:bg-gray-100"
                    placeholder="بيان السطر..."
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    aria-label={`مدين السطر ${idx + 1}`}
                    value={line.debitAmount}
                    onChange={(e) => handleAmountChange(line.id, "debitAmount", e.target.value)}
                    disabled={disabled || isPositiveAmount(line.creditAmount)}
                    className="w-full border-gray-300 rounded-md focus:ring-primary focus:border-primary px-3 py-2 border shadow-sm disabled:bg-gray-100 disabled:opacity-50"
                    placeholder="0.0000"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    aria-label={`دائن السطر ${idx + 1}`}
                    value={line.creditAmount}
                    onChange={(e) => handleAmountChange(line.id, "creditAmount", e.target.value)}
                    disabled={disabled || isPositiveAmount(line.debitAmount)}
                    className="w-full border-gray-300 rounded-md focus:ring-primary focus:border-primary px-3 py-2 border shadow-sm disabled:bg-gray-100 disabled:opacity-50"
                    placeholder="0.0000"
                  />
                </td>
                <td className="px-4 py-2 text-center">
                  <button
                    type="button"
                    onClick={() => handleRemoveLine(line.id)}
                    disabled={disabled || lines.length <= 1}
                    aria-label={`حذف السطر ${idx + 1}`}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View: Cards */}
      <div className="md:hidden space-y-4">
        {lines.map((line, index) => (
          <div key={line.id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-4 relative">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <span className="font-semibold text-gray-700">سطر #{index + 1}</span>
              <button
                type="button"
                onClick={() => handleRemoveLine(line.id)}
                disabled={disabled || lines.length <= 1}
                aria-label={`حذف السطر ${index + 1}`}
                className="text-red-600 p-1 disabled:opacity-50 text-sm font-medium"
              >
                حذف
              </button>
            </div>
            <AsyncSelectInput
              label="الحساب *"
              value={line.accountId}
              onChange={(v) => updateLine(line.id, "accountId", v)}
              loadOptions={loadAccounts}
              disabled={!ledgerId || disabled}
            />
            <AsyncSelectInput
              label="مركز التكلفة"
              value={line.costCenterId}
              onChange={(v) => updateLine(line.id, "costCenterId", v)}
              loadOptions={loadCostCenters}
              disabled={!ledgerId || disabled}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">البيان</label>
              <input
                type="text"
                aria-label={`بيان السطر ${index + 1}`}
                value={line.description}
                onChange={(e) => updateLine(line.id, "description", e.target.value)}
                disabled={disabled}
                className="w-full border-gray-300 rounded-md focus:ring-primary focus:border-primary px-3 py-2 border shadow-sm disabled:bg-gray-100"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">مدين</label>
                <input
                  type="text"
                  inputMode="decimal"
                  aria-label={`مدين السطر ${index + 1}`}
                  value={line.debitAmount}
                  onChange={(e) => handleAmountChange(line.id, "debitAmount", e.target.value)}
                  disabled={disabled || isPositiveAmount(line.creditAmount)}
                  className="w-full border-gray-300 rounded-md focus:ring-primary focus:border-primary px-3 py-2 border shadow-sm disabled:bg-gray-100 disabled:opacity-50"
                  placeholder="0.0000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">دائن</label>
                <input
                  type="text"
                  inputMode="decimal"
                  aria-label={`دائن السطر ${index + 1}`}
                  value={line.creditAmount}
                  onChange={(e) => handleAmountChange(line.id, "creditAmount", e.target.value)}
                  disabled={disabled || isPositiveAmount(line.debitAmount)}
                  className="w-full border-gray-300 rounded-md focus:ring-primary focus:border-primary px-3 py-2 border shadow-sm disabled:bg-gray-100 disabled:opacity-50"
                  placeholder="0.0000"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer: Add Line + Totals */}
      <div className="flex justify-between items-center p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <button
          type="button"
          onClick={handleAddLine}
          disabled={disabled}
          className="flex items-center text-sm font-medium text-primary hover:text-primary-dark disabled:opacity-50"
        >
          <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          إضافة سطر
        </button>

        <div className="flex space-x-6 space-x-reverse text-sm md:text-base" aria-live="polite">
          <div className="flex flex-col items-end">
            <span className="text-gray-500 mb-1">إجمالي المدين</span>
            <span className="font-bold text-gray-900">{totalDebit}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-gray-500 mb-1">إجمالي الدائن</span>
            <span className="font-bold text-gray-900">{totalCredit}</span>
          </div>
          <div className={`flex flex-col items-end ${diff === "0" ? "text-green-600" : "text-red-600"}`}>
            <span className="mb-1 text-gray-500">الفرق</span>
            <span className="font-bold">{diff}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
