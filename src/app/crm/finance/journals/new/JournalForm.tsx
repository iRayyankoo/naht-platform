"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import SelectInput from "@/components/SelectInput";
import toast from "react-hot-toast";
import JournalLines, { JournalLineData } from "./JournalLines";
import { createDraftWithLinesAction } from "@/actions/finance/journal-actions";
import { listOpenPeriodsAction } from "@/actions/finance/reference-actions";

// Secure UUID — no Math.random fallback
function generateSecureUUID(): string {
  return crypto.randomUUID();
}

interface LedgerOption {
  id: string;
  code: string;
  nameAr: string;
  baseCurrencyId: string;
}

interface CurrencyOption {
  id: string;
  code: string;
  nameAr: string;
}

interface JournalFormProps {
  initialLedgers: LedgerOption[];
  initialCurrencies: CurrencyOption[];
}

export default function JournalForm({ initialLedgers, initialCurrencies }: JournalFormProps) {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const inFlightRef = useRef(false);
  // Generated once at mount — never regenerated after failed request
  const [idempotencyKey] = useState<string>(() => generateSecureUUID());

  const [ledgerId, setLedgerId] = useState("");
  const [currencyId, setCurrencyId] = useState("");
  const [fiscalPeriodId, setFiscalPeriodId] = useState("");
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [reference, setReference] = useState("");
  const [exchangeRate, setExchangeRate] = useState("1.0000");

  const [periods, setPeriods] = useState<
    { id: string; periodName: string; startDate: string; endDate: string }[]
  >([]);
  const [isLoadingPeriods, setIsLoadingPeriods] = useState(false);

  const [lines, setLines] = useState<JournalLineData[]>([
    { id: "line-1", accountId: null, costCenterId: null, description: "", debitAmount: "", creditAmount: "" },
    { id: "line-2", accountId: null, costCenterId: null, description: "", debitAmount: "", creditAmount: "" },
  ]);

  // Derived: the base currency of the currently selected Ledger
  const selectedLedger = initialLedgers.find(l => l.id === ledgerId) ?? null;
  const baseCurrencyId = selectedLedger?.baseCurrencyId ?? null;

  // Is the currently selected currency the Ledger's base currency?
  const isBaseCurrency = !!currencyId && currencyId === baseCurrencyId;

  // Load open periods when Ledger changes
  useEffect(() => {
    if (!ledgerId) return;

    let isMounted = true;
    const timer = setTimeout(() => {
      if (isMounted) setIsLoadingPeriods(true);
    }, 0);

    listOpenPeriodsAction({ ledgerId, skip: 0, take: 100 })
      .then((res) => {
        if (!isMounted) return;
        if (res.ok && res.data) {
          setPeriods(res.data.items);
          if (res.data.items.length > 0) {
            setFiscalPeriodId(res.data.items[0].id);
          }
        } else {
          setPeriods([]);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingPeriods(false);
      });

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [ledgerId]);

  // When Ledger changes: reset period, lines, and exchange rate if new ledger's base currency differs
  const handleLedgerChange = (newLedgerId: string) => {
    setLedgerId(newLedgerId);
    setFiscalPeriodId("");
    setPeriods([]);
    setLines(prev => prev.map(l => ({ ...l, accountId: null, costCenterId: null })));

    // If selected currency matches new ledger's baseCurrencyId, lock rate to 1
    const newLedger = initialLedgers.find(l => l.id === newLedgerId);
    if (newLedger && currencyId === newLedger.baseCurrencyId) {
      setExchangeRate("1.0000");
    }
  };

  const handleCurrencyChange = (newCurrencyId: string) => {
    setCurrencyId(newCurrencyId);
    // Lock exchange rate to 1.0000 if it matches the Ledger's base currency ID
    if (newCurrencyId && newCurrencyId === baseCurrencyId) {
      setExchangeRate("1.0000");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (inFlightRef.current) return;

    // Validation
    if (!ledgerId || !currencyId || !fiscalPeriodId || !description || !entryDate) {
      toast.error("يرجى تعبئة جميع الحقول الإلزامية في ترويسة القيد");
      return;
    }

    // Filter lines with accountId and at least one positive amount (BigInt comparison)
    const formattedLines = lines
      .filter(l => {
        if (!l.accountId) return false;
        // Use BigInt via a simple scaled comparison — no Number/parseFloat
        const toScaled = (v: string) => {
          if (!v) return BigInt(0);
          const [i, d = ""] = v.split(".");
          return BigInt((i || "0") + d.padEnd(4, "0").slice(0, 4));
        };
        return toScaled(l.debitAmount) > BigInt(0) || toScaled(l.creditAmount) > BigInt(0);
      })
      .map(l => ({
        accountId: l.accountId!,
        costCenterId: l.costCenterId || undefined,
        description: l.description || undefined,
        debitAmount: l.debitAmount || undefined,
        creditAmount: l.creditAmount || undefined,
      }));

    inFlightRef.current = true;
    setIsSubmitting(true);

    try {
      const payload = {
        idempotencyKey,
        ledgerId,
        currencyId,
        fiscalPeriodId,
        entryDate: new Date(entryDate).toISOString(),
        description,
        reference: reference || undefined,
        exchangeRate: exchangeRate || undefined,
        lines: formattedLines,
      };

      const res = await createDraftWithLinesAction(payload);

      if (!res.ok) {
        if (res.error?.fieldErrors) {
          toast.error("يوجد خطأ في البيانات المدخلة، يرجى المراجعة");
          console.error(res.error.fieldErrors);
        } else {
          toast.error(res.error?.message || "حدث خطأ أثناء حفظ القيد");
        }
        // DO NOT regenerate idempotencyKey — keep same key for retry
        inFlightRef.current = false;
        setIsSubmitting(false);
        return;
      }

      toast.success("تم حفظ المسودة بنجاح");
      router.push(`/crm/finance/journals/${res.data?.id}`);
    } catch (error) {
      console.error(error);
      toast.error("حدث خطأ غير متوقع");
      inFlightRef.current = false;
      setIsSubmitting(false);
    }
  };

  const selectedPeriod = periods.find(p => p.id === fiscalPeriodId);

  return (
    <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
      <div className="p-6 space-y-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">المعلومات الأساسية</h3>

        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          {/* Ledger */}
          <SelectInput
            id="ledgerId"
            label="دفتر الأستاذ *"
            value={ledgerId}
            onChange={(e) => handleLedgerChange(e.target.value)}
            disabled={isSubmitting}
            className="sm:col-span-2"
            options={[
              { value: "", label: "اختر دفتر الأستاذ..." },
              ...initialLedgers.map(l => ({ value: l.id, label: `[${l.code}] ${l.nameAr}` })),
            ]}
          />

          {/* Fiscal Period */}
          <SelectInput
            id="fiscalPeriodId"
            label="الفترة المالية *"
            value={fiscalPeriodId}
            onChange={(e) => setFiscalPeriodId(e.target.value)}
            disabled={isSubmitting || isLoadingPeriods || !ledgerId}
            className="sm:col-span-2"
            options={
              periods.length > 0
                ? periods.map(p => ({ value: p.id, label: p.periodName }))
                : [{ value: "", label: isLoadingPeriods ? "جاري التحميل..." : "لا توجد فترات مفتوحة" }]
            }
          />

          {/* Entry Date — bounded by selected period */}
          <div className="sm:col-span-2">
            <label htmlFor="entryDate" className="block text-sm font-medium text-gray-700 mb-1.5">
              تاريخ القيد *
            </label>
            <input
              type="date"
              id="entryDate"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              disabled={isSubmitting}
              min={selectedPeriod?.startDate ? selectedPeriod.startDate.split("T")[0] : undefined}
              max={selectedPeriod?.endDate ? selectedPeriod.endDate.split("T")[0] : undefined}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary p-3 md:p-3.5 text-base text-gray-900 font-medium disabled:bg-gray-100 border"
            />
          </div>

          {/* Currency */}
          <SelectInput
            id="currencyId"
            label="العملة *"
            value={currencyId}
            onChange={(e) => handleCurrencyChange(e.target.value)}
            disabled={isSubmitting}
            className="sm:col-span-2"
            options={[
              { value: "", label: "اختر العملة..." },
              ...initialCurrencies.map(c => ({ value: c.id, label: `[${c.code}] ${c.nameAr}` })),
            ]}
          />

          {/* Exchange Rate — locked when currency === ledger baseCurrencyId */}
          <div className="sm:col-span-2">
            <label htmlFor="exchangeRate" className="block text-sm font-medium text-gray-700 mb-1.5">
              سعر الصرف
              {isBaseCurrency && (
                <span className="mr-2 text-xs text-gray-400 font-normal">(مقفول — عملة أساسية)</span>
              )}
            </label>
            <input
              type="text"
              inputMode="decimal"
              id="exchangeRate"
              value={exchangeRate}
              onChange={(e) => {
                if (isBaseCurrency) return;
                if (e.target.value !== "" && !/^\d*\.?\d{0,4}$/.test(e.target.value)) return;
                setExchangeRate(e.target.value);
              }}
              disabled={isSubmitting || isBaseCurrency}
              readOnly={isBaseCurrency}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary p-3 md:p-3.5 text-base text-gray-900 font-medium disabled:bg-gray-100 border"
            />
          </div>

          {/* Reference */}
          <div className="sm:col-span-2">
            <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-1.5">المرجع</label>
            <input
              type="text"
              id="reference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              disabled={isSubmitting}
              placeholder="مثال: فاتورة رقم 123"
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary p-3 md:p-3.5 text-base text-gray-900 font-medium disabled:bg-gray-100 border"
            />
          </div>

          {/* Description */}
          <div className="sm:col-span-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">
              وصف القيد *
            </label>
            <textarea
              id="description"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary p-3 md:p-3.5 text-base text-gray-900 font-medium disabled:bg-gray-100 border"
              placeholder="شرح عام للقيد..."
            />
          </div>
        </div>
      </div>

      {/* Journal Lines */}
      <div className="p-6 space-y-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">أسطر القيد</h3>
        <JournalLines
          ledgerId={ledgerId}
          lines={lines}
          onChange={setLines}
          disabled={isSubmitting}
        />
      </div>

      {/* Actions */}
      <div className="p-6 bg-gray-50 flex items-center justify-end space-x-4 space-x-reverse rounded-b-lg">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="bg-white py-2.5 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
        >
          إلغاء
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center items-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              جاري الحفظ...
            </>
          ) : (
            "حفظ المسودة"
          )}
        </button>
      </div>
    </form>
  );
}
