import CareerForm from "./CareerForm";

export const metadata = {
  title: "التوظيف | نحت العقارية",
  description: "انضم إلى فريق نحت العقارية وابدأ مسيرتك المهنية في بيئة عمل ملهمة.",
};

export default function CareersPage() {
  return (
    <div>
      {/* Header */}
      <section className="bg-primary text-white py-20 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-4">انضم إلى فريقنا</h1>
          <p className="text-xl text-primary-light">
            نبحث دائمًا عن الكفاءات الطموحة لمشاركتنا رحلة النجاح والتطوير
          </p>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">نموذج التقديم للتوظيف</h2>
            <CareerForm />
          </div>
        </div>
      </section>
    </div>
  );
}
