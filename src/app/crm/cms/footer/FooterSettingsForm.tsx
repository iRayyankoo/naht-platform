"use client";

import { useState } from "react";
import { updateSiteSettings, upsertFooterLink, deleteFooterLink } from "@/actions/cms";
import { toast } from "react-hot-toast";
import ImageUpload from "@/components/crm/ImageUpload";

export default function FooterSettingsForm({ initialSettings, initialLinks }: { initialSettings: any, initialLinks: any[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [links, setLinks] = useState(initialLinks || []);
  
  const [editingLink, setEditingLink] = useState<any>(null);
  const [isAddingLink, setIsAddingLink] = useState(false);

  const onSettingsSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        showFooterLogo: formData.get("showFooterLogo") === "true",
        showImportantLinks: formData.get("showImportantLinks") === "true",
        showContactInfo: formData.get("showContactInfo") === "true",
        showEmployeePortal: formData.get("showEmployeePortal") === "true",
        showSocialLinks: formData.get("showSocialLinks") === "true",
      };

      await updateSiteSettings(payload);
      toast.success("تم تحديث إعدادات الفوتر بنجاح");
    } catch (error) {
      toast.error("حدث خطأ أثناء الحفظ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveLink = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      id: editingLink?.id,
      label: formData.get("label") as string,
      url: formData.get("url") as string,
      isExternal: formData.get("isExternal") === "true",
      isVisible: formData.get("isVisible") === "true",
      order: parseInt(formData.get("order") as string) || 0,
    };

    try {
      await upsertFooterLink(data);
      toast.success("تم حفظ الرابط بنجاح");
      setIsAddingLink(false);
      setEditingLink(null);
      // Form reload is handled by revalidatePath in action
      window.location.reload(); 
    } catch (error) {
      toast.error("حدث خطأ أثناء حفظ الرابط");
    }
  };

  const handleDeleteLink = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الرابط؟ (الأفضل هو الإخفاء بدلاً من الحذف)")) return;
    try {
      await deleteFooterLink(id);
      toast.success("تم حذف الرابط بنجاح");
      window.location.reload();
    } catch (error) {
      toast.error("حدث خطأ أثناء حذف الرابط");
    }
  };

  return (
    <div className="space-y-8 pb-20">
      
      {/* إعدادات الفوتر العامة */}
      <form onSubmit={onSettingsSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">إعدادات ونصوص الفوتر</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="md:col-span-2">
            <ImageUpload
              name="footerLogoUrl"
              defaultValue={initialSettings?.footerLogoUrl || ""}
              label="شعار الفوتر (يُنصح باستخدام شعار مفرغ)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">اسم الشركة في الفوتر</label>
            <input
              name="footerCompanyName"
              defaultValue={initialSettings?.footerCompanyName || ""}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring-primary"
              placeholder="شركة نحت الأصول العقارية"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">نص حقوق النشر</label>
            <input
              name="copyrightText"
              defaultValue={initialSettings?.copyrightText || "جميع الحقوق محفوظة"}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring-primary"
              placeholder="جميع الحقوق محفوظة"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">وصف الشركة المختصر</label>
            <textarea
              name="footerDescription"
              defaultValue={initialSettings?.footerDescription || ""}
              rows={3}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring-primary"
              placeholder="نبني مساحات تلهم الحياة..."
            />
          </div>
        </div>

        <h3 className="text-md font-bold text-gray-900 mb-4 border-b pb-2">إعدادات الظهور</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <span className="text-sm font-medium text-gray-700">إظهار شعار الفوتر</span>
            <select name="showFooterLogo" defaultValue={initialSettings?.showFooterLogo !== false ? "true" : "false"} className="border-gray-300 rounded-md text-sm">
              <option value="true">ظاهر</option>
              <option value="false">مخفي</option>
            </select>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <span className="text-sm font-medium text-gray-700">إظهار قسم الروابط المهمة</span>
            <select name="showImportantLinks" defaultValue={initialSettings?.showImportantLinks !== false ? "true" : "false"} className="border-gray-300 rounded-md text-sm">
              <option value="true">ظاهر</option>
              <option value="false">مخفي</option>
            </select>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <span className="text-sm font-medium text-gray-700">إظهار بيانات التواصل</span>
            <select name="showContactInfo" defaultValue={initialSettings?.showContactInfo !== false ? "true" : "false"} className="border-gray-300 rounded-md text-sm">
              <option value="true">ظاهر</option>
              <option value="false">مخفي</option>
            </select>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <span className="text-sm font-medium text-gray-700">إظهار بوابة الموظفين</span>
            <select name="showEmployeePortal" defaultValue={initialSettings?.showEmployeePortal !== false ? "true" : "false"} className="border-gray-300 rounded-md text-sm">
              <option value="true">ظاهر</option>
              <option value="false">مخفي</option>
            </select>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <span className="text-sm font-medium text-gray-700">إظهار أيقونات التواصل الاجتماعي</span>
            <select name="showSocialLinks" defaultValue={initialSettings?.showSocialLinks !== false ? "true" : "false"} className="border-gray-300 rounded-md text-sm">
              <option value="true">ظاهر</option>
              <option value="false">مخفي</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-2 rounded-lg font-bold shadow-sm transition-all disabled:opacity-50"
          >
            {isSubmitting ? "جاري الحفظ..." : "حفظ الإعدادات"}
          </button>
        </div>
      </form>

      {/* روابط الفوتر */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6 border-b pb-2">
          <h2 className="text-lg font-bold text-gray-900">روابط الفوتر</h2>
          <button
            type="button"
            onClick={() => { setEditingLink(null); setIsAddingLink(true); }}
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold"
          >
            + إضافة رابط
          </button>
        </div>

        {(isAddingLink || editingLink) && (
          <form onSubmit={handleSaveLink} className="mb-8 p-4 border border-primary/20 bg-primary/5 rounded-lg relative">
            <h3 className="font-bold mb-4">{editingLink ? "تعديل رابط" : "رابط جديد"}</h3>
            <button 
              type="button" 
              onClick={() => { setIsAddingLink(false); setEditingLink(null); }}
              className="absolute top-4 left-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم الرابط</label>
                <input required name="label" defaultValue={editingLink?.label} className="w-full border-gray-300 rounded-md text-sm" placeholder="مثال: من نحن" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الرابط (URL)</label>
                <input required name="url" defaultValue={editingLink?.url} className="w-full border-gray-300 rounded-md text-sm dir-ltr" placeholder="/about" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الترتيب</label>
                <input type="number" required name="order" defaultValue={editingLink?.order || 0} className="w-full border-gray-300 rounded-md text-sm" />
              </div>
              <div className="flex items-center gap-4 mt-6">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="radio" name="isVisible" value="true" defaultChecked={editingLink ? editingLink.isVisible : true} />
                  ظاهر
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="radio" name="isVisible" value="false" defaultChecked={editingLink ? !editingLink.isVisible : false} />
                  مخفي
                </label>
              </div>
              <div className="flex items-center gap-4 mt-2">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" name="isExternal" value="true" defaultChecked={editingLink?.isExternal} className="rounded border-gray-300 text-primary focus:ring-primary" />
                  يفتح في نافذة جديدة
                </label>
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-bold">
                حفظ الرابط
              </button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-4 py-3">الترتيب</th>
                <th className="px-4 py-3">اسم الرابط</th>
                <th className="px-4 py-3">المسار</th>
                <th className="px-4 py-3">الحالة</th>
                <th className="px-4 py-3 text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {links.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    لا توجد روابط مضافة حالياً.
                  </td>
                </tr>
              ) : (
                links.map((link) => (
                  <tr key={link.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{link.order}</td>
                    <td className="px-4 py-3 font-bold">{link.label}</td>
                    <td className="px-4 py-3 text-gray-500 dir-ltr text-left">{link.url}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${link.isVisible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {link.isVisible ? "ظاهر" : "مخفي"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-left">
                      <button 
                        onClick={() => { setEditingLink(link); setIsAddingLink(false); }}
                        className="text-primary hover:text-primary/80 font-medium ml-3"
                      >
                        تعديل
                      </button>
                      <button 
                        onClick={() => handleDeleteLink(link.id)}
                        className="text-red-500 hover:text-red-700 font-medium"
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}
