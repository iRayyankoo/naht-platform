import MaintenanceForm from "./MaintenanceForm";

export const metadata = {
  title: "طلب صيانة | نحت العقارية",
  description: "خدمة طلبات الصيانة لعملاء نحت العقارية.",
};

export default function MaintenancePage() {
  return (
    <div>
      {/* Header */}
      <section className="bg-primary text-white py-20 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-4">طلب صيانة</h1>
          <p className="text-xl text-primary-light">
            خدمة سريعة واحترافية لضمان جودة عقارك
          </p>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <MaintenanceForm />
          </div>
        </div>
      </section>
    </div>
  );
}
