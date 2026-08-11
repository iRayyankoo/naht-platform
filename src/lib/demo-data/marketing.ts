/**
 * بيانات تجريبية - مركز التسويق والتحليلات
 * Demo Mock Data for Marketing Hub & Analytics
 */

export interface MarketingContentItem {
  id: string;
  title: string;
  channel: "سوشيال ميديا" | "بريد إلكتروني" | "مدونة" | "إعلان";
  platform?: "X / Twitter" | "Instagram" | "LinkedIn" | "TikTok" | "عام";
  status: "مسودة" | "قيد المراجعة" | "معتمد" | "مجدول" | "منشور";
  scheduledDate: string;
  author: string;
  projectSlug?: string;
  projectName?: string;
  notes?: string;
}

export interface MarketingKpiItem {
  label: string;
  value: string | number;
  change: string;
  isPositive: boolean;
}

export const DEMO_MARKETING_KPIS: MarketingKpiItem[] = [
  { label: "إجمالي الزيارات الشهرية", value: "24,850", change: "+14.2%", isPositive: true },
  { label: "نقرات أزرار التواصل (CTR)", value: "3,120", change: "+8.7%", isPositive: true },
  { label: "معدل التحويل إلى عملاء (Conversion)", value: "4.8%", change: "+0.9%", isPositive: true },
  { label: "الحملات النشطة حالياً", value: "6 حملات", change: "محدث اليوم", isPositive: true },
];

export const DEMO_MARKETING_CONTENT: MarketingContentItem[] = [
  {
    id: "cnt_01",
    title: "تغطية مرئية لمراحل البناء في مشروع نحت النرجس",
    channel: "سوشيال ميديا",
    platform: "Instagram",
    status: "منشور",
    scheduledDate: "2026-08-01",
    author: "فريق التسويق الرقمي",
    projectName: "مخطط نحت السكني",
    projectSlug: "naht-plots",
    notes: "وصل المحتوى لأكثر من 45 ألف مشاهدة",
  },
  {
    id: "cnt_02",
    title: "إطلاق المرحلة الثانية من فلل نحت الياسمين",
    channel: "سوشيال ميديا",
    platform: "X / Twitter",
    status: "مجدول",
    scheduledDate: "2026-08-15",
    author: "أحمد التسويق",
    projectName: "مشروع تطوير حي الياسمين",
    projectSlug: "naht-yasmeen",
  },
  {
    id: "cnt_03",
    title: "النشرة البريدية الشهرية: التملك العقاري في الرياض 2026",
    channel: "بريد إلكتروني",
    platform: "عام",
    status: "معتمد",
    scheduledDate: "2026-08-18",
    author: "فريق صناعة المحتوى",
  },
  {
    id: "cnt_04",
    title: "مقال: أهمية الضمانات الإنطباقية في الشقق الفاخرة",
    channel: "مدونة",
    platform: "عام",
    status: "قيد المراجعة",
    scheduledDate: "2026-08-22",
    author: "سارة المحتوى",
  },
  {
    id: "cnt_05",
    title: "حملة إعلانات مميزة للمشروع الشاطئي (برج نحت)",
    channel: "إعلان",
    platform: "TikTok",
    status: "مسودة",
    scheduledDate: "2026-08-28",
    author: "قسم الإعلانات",
    projectName: "برج نحت (جدة)",
  },
];

export const DEMO_CAMPAIGN_CHANNELS_PERFORMANCE = [
  { channel: "حملات جوجل الإعلانية", clicks: 1420, leads: 185, conversionRate: "13.0%" },
  { channel: "إعلانات سناب شات", clicks: 980, leads: 110, conversionRate: "11.2%" },
  { channel: "منصة X (تويتر)", clicks: 820, leads: 94, conversionRate: "11.4%" },
  { channel: "حملات إنستغرام وتيك توك", clicks: 1250, leads: 140, conversionRate: "11.2%" },
  { channel: "الزيارات المباشرة للموقع", clicks: 2100, leads: 210, conversionRate: "10.0%" },
];
