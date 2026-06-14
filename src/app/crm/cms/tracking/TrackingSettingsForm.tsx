"use client";

import { useState } from "react";
import { updateTrackingSettings } from "@/actions/trackingSettings";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function TrackingSettingsForm({ initialData }: { initialData: any }) {
  const [activeTab, setActiveTab] = useState("google");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data: any = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });

    try {
      await updateTrackingSettings(data);
      toast.success("تم الحفظ بنجاح!");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: "google", label: "Google Services" },
    { id: "social", label: "Social Pixels" },
    { id: "custom", label: "Custom Scripts (متقدم)" },
  ];

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex border-b mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-8 min-h-[400px]">
        {/* Google Tab */}
        <div className={activeTab === "google" ? "block" : "hidden"}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-5 rounded-lg border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-gray-800">Google Tag Manager</h3>
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" name="isGtmEnabled" defaultChecked={initialData.isGtmEnabled} value="true" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500 relative"></div>
                </label>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">GTM Container ID</label>
                  <input type="text" name="gtmId" defaultValue={initialData.gtmId || ""} placeholder="GTM-XXXXXXX" dir="ltr" className="w-full border p-2 rounded text-left" />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-5 rounded-lg border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-gray-800">Google Analytics 4</h3>
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" name="isGa4Enabled" defaultChecked={initialData.isGa4Enabled} value="true" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500 relative"></div>
                </label>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">GA4 Measurement ID</label>
                  <input type="text" name="ga4MeasurementId" defaultValue={initialData.ga4MeasurementId || ""} placeholder="G-XXXXXXXXXX" dir="ltr" className="w-full border p-2 rounded text-left" />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-5 rounded-lg border md:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-gray-800">Google Ads Conversion</h3>
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" name="isGoogleAdsEnabled" defaultChecked={initialData.isGoogleAdsEnabled} value="true" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500 relative"></div>
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Conversion ID</label>
                  <input type="text" name="googleAdsId" defaultValue={initialData.googleAdsId || ""} placeholder="AW-XXXXXXXXX" dir="ltr" className="w-full border p-2 rounded text-left" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Conversion Label (اختياري)</label>
                  <input type="text" name="googleAdsConversionLabel" defaultValue={initialData.googleAdsConversionLabel || ""} placeholder="xxx-xxx" dir="ltr" className="w-full border p-2 rounded text-left" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Pixels Tab */}
        <div className={activeTab === "social" ? "block" : "hidden"}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="bg-gray-50 p-4 rounded-lg border flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-800">Meta (Facebook) Pixel</h3>
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" name="isMetaPixelEnabled" defaultChecked={initialData.isMetaPixelEnabled} value="true" className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500 relative"></div>
                  </label>
                </div>
                <input type="text" name="metaPixelId" defaultValue={initialData.metaPixelId || ""} placeholder="Pixel ID" dir="ltr" className="w-full border p-2 rounded text-left text-sm" />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-800">TikTok Pixel</h3>
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" name="isTiktokPixelEnabled" defaultChecked={initialData.isTiktokPixelEnabled} value="true" className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500 relative"></div>
                  </label>
                </div>
                <input type="text" name="tiktokPixelId" defaultValue={initialData.tiktokPixelId || ""} placeholder="Pixel ID" dir="ltr" className="w-full border p-2 rounded text-left text-sm" />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-800">Snapchat Pixel</h3>
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" name="isSnapchatPixelEnabled" defaultChecked={initialData.isSnapchatPixelEnabled} value="true" className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500 relative"></div>
                  </label>
                </div>
                <input type="text" name="snapchatPixelId" defaultValue={initialData.snapchatPixelId || ""} placeholder="Pixel ID" dir="ltr" className="w-full border p-2 rounded text-left text-sm" />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-800">LinkedIn Insight Tag</h3>
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" name="isLinkedinEnabled" defaultChecked={initialData.isLinkedinEnabled} value="true" className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500 relative"></div>
                  </label>
                </div>
                <input type="text" name="linkedinPartnerId" defaultValue={initialData.linkedinPartnerId || ""} placeholder="Partner ID" dir="ltr" className="w-full border p-2 rounded text-left text-sm" />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-800">X (Twitter) Pixel</h3>
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" name="isXPixelEnabled" defaultChecked={initialData.isXPixelEnabled} value="true" className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500 relative"></div>
                  </label>
                </div>
                <input type="text" name="xPixelId" defaultValue={initialData.xPixelId || ""} placeholder="Pixel ID" dir="ltr" className="w-full border p-2 rounded text-left text-sm" />
              </div>
            </div>

          </div>
        </div>

        {/* Custom Scripts Tab */}
        <div className={activeTab === "custom" ? "block" : "hidden"}>
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg mb-6">
            <h4 className="font-bold mb-1">تحذير أمني!</h4>
            <p className="text-sm">تعديل هذه الحقول مخصص فقط للمطورين. أي كود خاطئ قد يؤدي إلى تعطل الموقع. الإعدادات تتطلب تفعيل المفتاح العام لتعمل.</p>
          </div>

          <div className="flex items-center justify-between mb-6 bg-gray-50 p-4 border rounded-lg">
            <h3 className="font-bold text-lg text-gray-800">تفعيل الأكواد المخصصة</h3>
            <label className="flex items-center cursor-pointer">
              <input type="checkbox" name="isCustomScriptsEnabled" defaultChecked={initialData.isCustomScriptsEnabled} value="true" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500 relative"></div>
            </label>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Head Script (&lt;head&gt;)</label>
              <textarea name="customHeadScript" rows={5} defaultValue={initialData.customHeadScript || ""} dir="ltr" className="w-full border p-3 rounded text-left font-mono text-sm bg-gray-900 text-green-400" placeholder="<script>...</script>"></textarea>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Body Start Script (بعد &lt;body&gt;)</label>
              <textarea name="customBodyStartScript" rows={5} defaultValue={initialData.customBodyStartScript || ""} dir="ltr" className="w-full border p-3 rounded text-left font-mono text-sm bg-gray-900 text-green-400" placeholder="<noscript>...</noscript>"></textarea>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Body End Script (قبل &lt;/body&gt;)</label>
              <textarea name="customBodyEndScript" rows={5} defaultValue={initialData.customBodyEndScript || ""} dir="ltr" className="w-full border p-3 rounded text-left font-mono text-sm bg-gray-900 text-green-400" placeholder="<script>...</script>"></textarea>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t flex items-center justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary text-white px-8 py-3 rounded-md font-bold disabled:opacity-50"
        >
          {isSubmitting ? "جاري الحفظ..." : "حفظ الإعدادات"}
        </button>
      </div>
    </form>
  );
}
