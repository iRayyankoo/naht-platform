import OpportunityForm from "./OpportunityForm";

export const metadata = {
  title: "دراسة فرصة عقارية | نحت العقارية",
  description: "قدم فرصتك العقارية ليقوم فريق الخبراء لدينا بدراستها وتحليلها بأعلى معايير الاحترافية.",
};

export default function OpportunityPage() {
  return (
    <div>
      {/* Header */}
      <section className="bg-primary text-white py-20 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-4">عرض فرصة عقارية</h1>
          <p className="text-xl text-primary-light">
            دع خبراؤنا يقومون بدراسة وتقييم الفرص الاستثمارية لتحقيق أعلى العوائد
          </p>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <OpportunityForm />
          </div>
        </div>
      </section>
    </div>
  );
}
