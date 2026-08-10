"use client";

import { useState } from "react";
import { createCampaignLink } from "@/actions/campaigns";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const PLATFORMS = [
  "Snapchat", "TikTok", "Instagram", "Facebook", "Google Ads", "Google Search", 
  "Google Display", "YouTube", "X / Twitter", "LinkedIn", "WhatsApp", 
  "Email Campaigns", "SMS Campaigns", "Influencers", "Organic Search", 
  "Direct Traffic", "Referral Websites", "QR Code", "Offline Campaigns", "Other"
];

export default function CampaignBuilderForm({ projects }: { projects: { id: string, name: string, slug: string }[] }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    campaignName: "",
    destinationUrl: "https://naht-re.sa",
    platform: "Snapchat",
    utmSource: "snapchat",
    utmMedium: "paid_social",
    utmCampaign: "",
    utmContent: "",
    utmTerm: "",
    projectId: "",
    notes: "",
  });

  const generatePreviewUrl = () => {
    try {
      const url = new URL(formData.destinationUrl);
      if (formData.utmSource) url.searchParams.set("utm_source", formData.utmSource);
      if (formData.utmMedium) url.searchParams.set("utm_medium", formData.utmMedium);
      if (formData.utmCampaign) url.searchParams.set("utm_campaign", formData.utmCampaign);
      if (formData.utmContent) url.searchParams.set("utm_content", formData.utmContent);
      if (formData.utmTerm) url.searchParams.set("utm_term", formData.utmTerm);
      return url.toString();
    } catch {
      return "رابط الوجهة غير صالح";
    }
  };

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pId = e.target.value;
    setFormData(prev => {
      let dest = "https://naht-re.sa";
      if (pId !== "") {
        const p = projects.find(x => x.id === pId);
        if (p) dest = `https://naht-re.sa/projects/${p.slug}`;
      }
      return { ...prev, projectId: pId, destinationUrl: dest };
    });
  };

  const handlePlatformChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const plat = e.target.value;
    const source = plat.toLowerCase().replace(/\s|\//g, "_");
    let medium = "paid_social";
    
    if (plat.includes("Google") || plat === "YouTube") medium = "cpc";
    if (plat === "Email Campaigns") medium = "email";
    if (plat === "SMS Campaigns") medium = "sms";
    if (plat === "Organic Search") medium = "organic";
    if (plat === "QR Code" || plat === "Offline Campaigns") medium = "offline";
    if (plat === "Influencers") medium = "influencer";

    setFormData(prev => ({ ...prev, platform: plat, utmSource: source, utmMedium: medium }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const finalUrl = generatePreviewUrl();
      if (finalUrl === "رابط الوجهة غير صالح") {
        throw new Error("تأكد من كتابة رابط وجهة صحيح يبدأ بـ http:// أو https://");
      }

      await createCampaignLink({
        ...formData,
        finalUrl,
      });

      toast.success("تم إنشاء الحملة بنجاح!");
      router.push("/crm/campaigns");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "حدث خطأ غير متوقع";
      toast.error(message);
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 border-b pb-2">بيانات الحملة الأساسية</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">اسم الحملة التنظيمي (الداخلي) *</label>
            <input type="text" required value={formData.campaignName} onChange={e => setFormData({...formData, campaignName: e.target.value})} className="w-full border-gray-300 rounded-md shadow-sm p-2 text-sm border focus:ring-primary focus:border-primary" placeholder="مثال: إطلاق مشروع 15 - سناب شات" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">المشروع المرتبط</label>
            <select value={formData.projectId} onChange={handleProjectChange} className="w-full border-gray-300 rounded-md shadow-sm p-2 text-sm border focus:ring-primary focus:border-primary">
              <option value="">عام / الصفحة الرئيسية</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">المنصة الإعلانية *</label>
            <select value={formData.platform} onChange={handlePlatformChange} className="w-full border-gray-300 rounded-md shadow-sm p-2 text-sm border focus:ring-primary focus:border-primary">
              {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">رابط الوجهة (Destination URL) *</label>
            <input type="url" required dir="ltr" value={formData.destinationUrl} onChange={e => setFormData({...formData, destinationUrl: e.target.value})} className="w-full border-gray-300 rounded-md shadow-sm p-2 text-sm border focus:ring-primary focus:border-primary text-left" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات (اختياري)</label>
            <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full border-gray-300 rounded-md shadow-sm p-2 text-sm border focus:ring-primary focus:border-primary" rows={2}></textarea>
          </div>
        </div>

        <div className="space-y-4 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 border-b pb-2">معطيات UTM</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">utm_source *</label>
            <input type="text" required dir="ltr" value={formData.utmSource} onChange={e => setFormData({...formData, utmSource: e.target.value})} className="w-full border-gray-300 bg-gray-50 rounded-md shadow-sm p-2 text-sm border text-left" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">utm_medium *</label>
            <input type="text" required dir="ltr" value={formData.utmMedium} onChange={e => setFormData({...formData, utmMedium: e.target.value})} className="w-full border-gray-300 rounded-md shadow-sm p-2 text-sm border focus:ring-primary focus:border-primary text-left" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">utm_campaign *</label>
            <input type="text" required dir="ltr" value={formData.utmCampaign} onChange={e => setFormData({...formData, utmCampaign: e.target.value})} className="w-full border-gray-300 rounded-md shadow-sm p-2 text-sm border focus:ring-primary focus:border-primary text-left" placeholder="summer_sale" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">utm_content</label>
            <input type="text" dir="ltr" value={formData.utmContent} onChange={e => setFormData({...formData, utmContent: e.target.value})} className="w-full border-gray-300 rounded-md shadow-sm p-2 text-sm border focus:ring-primary focus:border-primary text-left" placeholder="video_ad_1" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">utm_term</label>
            <input type="text" dir="ltr" value={formData.utmTerm} onChange={e => setFormData({...formData, utmTerm: e.target.value})} className="w-full border-gray-300 rounded-md shadow-sm p-2 text-sm border focus:ring-primary focus:border-primary text-left" placeholder="riyadh_villas" />
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
        <h3 className="text-blue-900 font-bold mb-2">معاينة الرابط النهائي:</h3>
        <p className="text-blue-800 text-sm dir-ltr text-left break-all bg-white p-3 border border-blue-200 rounded-md font-mono">
          {generatePreviewUrl()}
        </p>
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={isSaving} className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-md font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed">
          {isSaving ? "جاري الإنشاء..." : "حفظ وإنشاء الرابط"}
        </button>
      </div>
    </form>
  );
}
