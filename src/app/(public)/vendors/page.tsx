import VendorForm from "./VendorForm";

export const metadata = {
  title: "المقاولين والموردين | نحت العقارية",
  description: "سجل شركتك كمقاول أو مورد مع نحت العقارية.",
};

export default function VendorsPage() {
  return (
    <div>
      {/* Header */}
      <section className="bg-primary text-white py-20 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-4">بوابة المقاولين والموردين</h1>
          <p className="text-xl text-primary-light">
            نرحب بالشركات والمؤسسات المتميزة لتكون جزءاً من نجاحاتنا
          </p>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">طلب تسجيل مورد / مقاول</h2>
            <VendorForm />
          </div>
        </div>
      </section>
    </div>
  );
}
