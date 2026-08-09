/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { isValidPhone, isValidWhatsapp, formatProjectName, formatUnitType, formatFloor } from "@/lib/contact-helpers";



interface FeatureData {
  id: string;
  title: string;
  desc?: string | null;
  icon?: string | null;
}

interface WarrantyData {
  id: string;
  title: string;
  duration?: string | null;
}

interface GalleryImageData {
  id: string;
  url: string;
  alt?: string | null;
}

export interface UnitDetailData {
  id: string;
  unitNum: string;
  type: string;
  area: number;
  rooms: number;
  baths: number;
  price: number;
  status: string;
  floor?: string | null;
  facade?: string | null;
  unitPlanImage?: string | null;
  projectId: string;
  project: {
    id: string;
    slug: string;
    name: string;
    city: string;
    neighborhood: string;
    mainImage?: string | null;
    fullDesc?: string | null;
    shortDesc?: string | null;
    googleMapsUrl?: string | null;
    features?: FeatureData[];
    warranties?: WarrantyData[];
    galleryImages?: GalleryImageData[];
  };
  model?: {
    name: string;
    planImage?: string | null;
  } | null;
}

interface UnitDetailClientViewProps {
  unit: UnitDetailData;
  similarUnits: UnitDetailData[];
  whatsappNumber?: string | null;
  contactPhone?: string | null;
}


export default function UnitDetailClientView({
  unit,
  similarUnits,
  whatsappNumber,
  contactPhone,
}: UnitDetailClientViewProps) {
  const [selectedImage, setSelectedImage] = useState<string>(
    unit.unitPlanImage || unit.model?.planImage || unit.project.mainImage || "/placeholder-unit.jpg"
  );

  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(`أرغب في حجز معاينة أو الاستفسار عن وحدة رقم ${unit.unitNum} في ${formatProjectName(unit.project.name)}`);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  const openModal = (e: React.MouseEvent<HTMLButtonElement>) => {
    triggerRef.current = e.currentTarget;
    setIsInquiryModalOpen(true);
  };

  const closeModal = () => {
    setIsInquiryModalOpen(false);
    setTimeout(() => {
      triggerRef.current?.focus();
    }, 50);
  };

  // Handle Escape key and focus initialization/trapping
  useEffect(() => {
    if (!isInquiryModalOpen) return;

    // Focus first input on open
    setTimeout(() => {
      nameInputRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
        return;
      }

      if (e.key === "Tab" && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isInquiryModalOpen]);

  // Gallery images list
  const galleryImages = [
    unit.unitPlanImage,
    unit.model?.planImage,
    unit.project.mainImage,
    ...(unit.project.galleryImages?.map((g) => g.url) || []),
  ].filter(Boolean) as string[];

  const formatPrice = (price: number) => {
    if (!price || price === 0) return "السعر عند الطلب";
    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: "SAR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          notes: message,
          projectId: unit.projectId,
          type: "UNIT_INQUIRY",
        }),
      });

      if (res.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          closeModal();
          setIsSuccess(false);
        }, 2500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasValidWp = isValidWhatsapp(whatsappNumber);
  const cleanWhatsapp = whatsappNumber?.replace(/[^0-9]/g, "") || "";
  const hasValidPh = isValidPhone(contactPhone);



  return (
    <div className="space-y-12">
      {/* Top Banner Section */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-brand-cafe/10 text-brand-cafe font-bold text-xs px-3 py-1 rounded-full">
              {formatUnitType(unit.type)}
            </span>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              {unit.status === "AVAILABLE" ? "متاحة للبيع" : unit.status}
            </span>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">
            وحدة عقارية رقم {unit.unitNum}
          </h1>
          <p className="text-sm text-gray-500 flex items-center gap-2">
            📍 <Link href={`/projects/${unit.project.slug}`} className="text-brand-cafe underline font-bold">{formatProjectName(unit.project.name)}</Link> — {unit.project.city}، حي {unit.project.neighborhood}
          </p>
        </div>

        <div className="text-right md:text-left bg-gray-50 p-4 rounded-2xl border border-gray-100 min-w-[240px]">
          <span className="block text-xs text-gray-400 font-medium mb-1">السعر المطلوب</span>
          <span className="text-2xl md:text-3xl font-bold text-brand-cafe block">
            {formatPrice(unit.price)}
          </span>
        </div>
      </div>

      {/* Main Grid: Gallery & Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm overflow-hidden h-[420px] md:h-[500px] flex items-center justify-center">
            <img
              src={selectedImage}
              alt={`وحدة ${unit.unitNum}`}
              className="max-h-full w-auto object-contain rounded-2xl"
            />
          </div>

          {/* Thumbnails */}
          {galleryImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {galleryImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(imgUrl)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImage === imgUrl ? "border-brand-cafe scale-95 shadow-md" : "border-gray-200 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={imgUrl} alt={`صورة فرعية ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Specs & CTAs */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Specs Grid */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
              المواصفات الرئيسية
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <span className="block text-xs text-gray-400">المساحة الإجمالية</span>
                <span className="text-xl font-bold text-gray-900">{unit.area} م²</span>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <span className="block text-xs text-gray-400">عدد الغرف</span>
                <span className="text-xl font-bold text-gray-900">{unit.rooms || "-"} غرف</span>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <span className="block text-xs text-gray-400">دورات المياه</span>
                <span className="text-xl font-bold text-gray-900">{unit.baths || "-"} حمامات</span>
              </div>

              {unit.floor && (
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <span className="block text-xs text-gray-400">الطابق / الدور</span>
                  <span className="text-xl font-bold text-gray-900">{formatFloor(unit.floor)}</span>
                </div>
              )}

              {unit.facade && (
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <span className="block text-xs text-gray-400">الواجهة</span>
                  <span className="text-xl font-bold text-gray-900">{unit.facade}</span>
                </div>
              )}

              {unit.model && (
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <span className="block text-xs text-gray-400">نموذج التصميم</span>
                  <span className="text-base font-bold text-gray-900">{unit.model.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="bg-[#2A2624] rounded-3xl p-6 text-white shadow-xl space-y-4">
            <h4 className="text-lg font-bold">مهتم بهذه الوحدة العقارية؟</h4>
            <p className="text-xs text-gray-300 leading-relaxed font-light">
              تواصل مباشرة مع فريق المبيعات للحصول على ملف الكراسة والشروط وحجز موعد لمعاينة الوحدة على الطبيعة.
            </p>

            <div className="space-y-3 pt-2">
              <button
                onClick={openModal}
                className="w-full py-3.5 bg-brand-cafe hover:bg-brand-gold text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2"
              >
                📝 حجز معاينة / طلب معلومات
              </button>

              {(hasValidWp || hasValidPh) && (
                <div className={`grid ${hasValidWp && hasValidPh ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
                  {hasValidWp && (
                    <a
                      href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(`السلام عليكم، أود الاستفسار عن وحدة رقم ${unit.unitNum} في ${formatProjectName(unit.project.name)}`)}`}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="تواصل عبر الواتساب الفوري"
                      className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs text-center transition-all flex items-center justify-center gap-1.5"
                    >
                      💬 واتساب فوري
                    </a>
                  )}

                  {hasValidPh && (
                    <a
                      href={`tel:${contactPhone}`}
                      aria-label="اتصال هاتفي مباشر"
                      className="py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs text-center transition-all flex items-center justify-center gap-1.5 border border-white/10"
                    >
                      📞 اتصال مباشر
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Map Link if available */}
          {unit.project.googleMapsUrl && (
            <a
              href={unit.project.googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="block bg-white p-4 rounded-2xl border border-gray-100 text-center font-bold text-xs text-brand-cafe hover:bg-gray-50 transition-all"
            >
              📍 فتح موقع المشروع على خرائط جوجل ➔
            </a>
          )}
        </div>
      </div>

      {/* Project & Warranties Section */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
        <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">
          عن {formatProjectName(unit.project.name)}
        </h3>

        <p className="text-gray-600 text-sm leading-relaxed font-light">
          {unit.project.fullDesc || unit.project.shortDesc || "مشروع عقاري متكامل يضمن أرقى أساليب العيش الراقي بالتصميم المستدام والجودة العالية."}
        </p>

        {unit.project.features && unit.project.features.length > 0 && (
          <div className="pt-4">
            <h4 className="text-sm font-bold text-gray-800 mb-3">مميزات المشروع والمرافق:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {unit.project.features.map((feat) => (
                <div key={feat.id} className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs font-bold text-gray-800 flex items-center gap-2">
                  ✨ {feat.title}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Similar Units Grid */}
      {similarUnits.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-900">وحدات عقارية مشابهة</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {similarUnits.map((sim) => (
              <div key={sim.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4 hover:shadow-md transition-all">
                <div className="h-44 bg-gray-100 rounded-xl overflow-hidden">
                  <img src={sim.unitPlanImage || sim.project.mainImage || "/placeholder-unit.jpg"} alt={sim.unitNum} className="w-full h-full object-cover" />
                </div>

                <div>
                  <h4 className="font-bold text-gray-900">وحدة رقم {sim.unitNum}</h4>
                  <p className="text-xs text-gray-500">{formatProjectName(sim.project.name)} — {sim.project.city}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="font-bold text-brand-cafe text-sm">{formatPrice(sim.price)}</span>
                  <Link href={`/units/${sim.id}`} className="text-xs font-bold text-[#2A2624] hover:underline">
                    التفاصيل ➔
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inquiry Booking Modal */}
      {isInquiryModalOpen && (
        <div
          onClick={closeModal}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-fadeIn"
          >
            <button
              onClick={closeModal}
              aria-label="إغلاق النافذة"
              className="absolute top-4 left-4 text-gray-400 hover:text-gray-900 font-bold"
            >
              ✕
            </button>

            <h3 id="modal-title" className="text-xl font-bold text-gray-900 mb-1">طلب معاينة وتفاصيل الوحدة</h3>
            <p className="text-xs text-gray-500 mb-6">وحدة رقم {unit.unitNum} — {formatProjectName(unit.project.name)}</p>

            {isSuccess ? (
              <div className="bg-emerald-50 text-emerald-800 p-6 rounded-2xl text-center space-y-2">
                <div className="text-3xl">✅</div>
                <h4 className="font-bold">تم استلام طلبكم بنجاح!</h4>
                <p className="text-xs">سيتواصل معكم فريق المبيعات في أسرع وقت لتأكيد الموعد.</p>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">الاسم الكريم *</label>
                  <input
                    ref={nameInputRef}
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: عبدالملك العتيبي"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-brand-cafe"
                  />
                </div>


                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">رقم الجوال *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="05xxxxxxxx"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-brand-cafe"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">ملاحظات / الاستفسار</label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-brand-cafe"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-brand-cafe hover:bg-[#2A2624] text-white font-bold text-xs rounded-xl transition-all"
                >
                  {isSubmitting ? "جاري الإرسال..." : "إرسال الطلب الآن"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

