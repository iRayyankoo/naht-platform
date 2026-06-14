import ContactForm from "../contact/ContactForm";
import TrackedButton from "@/components/TrackedButton";
import { SiteSettings } from "@prisma/client";

export default function HomeContact({ settings }: { settings: SiteSettings | null }) {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-gray-50 border border-gray-100 p-8 md:p-16 flex flex-col lg:flex-row gap-16">
          {/* Contact Info Side */}
          <div className="lg:w-5/12 flex flex-col justify-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 tracking-tight">تواصل معنا</h2>
            <div className="w-16 h-1 bg-primary mb-8"></div>
            <p className="text-gray-600 text-lg mb-12 font-light leading-relaxed">
              فريقنا الاستشاري متاح دائمًا لتقديم الدعم والإجابة على استفساراتكم المتعلقة بمشاريعنا وخدماتنا.
            </p>

            <div className="space-y-8">
              {settings?.contactPhone && (
                <div className="flex flex-col">
                  <div className="text-gray-400 text-sm mb-1 uppercase tracking-widest font-bold">الهاتف</div>
                  <TrackedButton
                    actionType="CALL"
                    targetContact={settings.contactPhone}
                    href={`tel:${settings.contactPhone}`}
                    className="text-2xl font-bold text-gray-900 hover:text-primary transition-colors dir-ltr w-max"
                  >
                    {settings.contactPhone}
                  </TrackedButton>
                </div>
              )}
              
              {settings?.whatsappNumber && (
                <div className="flex flex-col">
                  <div className="text-gray-400 text-sm mb-1 uppercase tracking-widest font-bold">واتساب</div>
                  <TrackedButton
                    actionType="WHATSAPP"
                    targetContact={settings.whatsappNumber}
                    href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
                    className="text-2xl font-bold text-gray-900 hover:text-green-600 transition-colors dir-ltr w-max"
                  >
                    {settings.whatsappNumber}
                  </TrackedButton>
                </div>
              )}

              {settings?.contactEmail && (
                <div className="flex flex-col">
                  <div className="text-gray-400 text-sm mb-1 uppercase tracking-widest font-bold">البريد الإلكتروني</div>
                  <a href={`mailto:${settings.contactEmail}`} className="text-xl font-bold text-gray-900 hover:text-primary transition-colors w-max">
                    {settings.contactEmail}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Form Side */}
          <div className="lg:w-7/12 bg-white p-8 md:p-10 shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-8 border-b border-gray-100 pb-4">أرسل رسالة</h3>
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
