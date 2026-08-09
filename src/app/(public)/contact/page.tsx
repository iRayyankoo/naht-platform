import { prisma } from "@/lib/prisma";
import ContactForm from "./ContactForm";
import { getBaseMetadata } from "@/lib/seo";
import { isValidPhone, isValidEmail } from "@/lib/contact-helpers";

export async function generateMetadata() {
  const content = await prisma.contactPageContent.findUnique({ where: { id: "global" } });
  return getBaseMetadata({
    title: content?.seoTitle || content?.title || "تواصل معنا | نحت العقارية",
    description: content?.seoDescription || content?.description || "يسعدنا تواصلكم معنا للإجابة على استفساراتكم وتقديم أفضل الخدمات العقارية.",
  });
}

export default async function ContactPage() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "global" } });
  const content = await prisma.contactPageContent.findUnique({ where: { id: "global" } });
  const socials = await prisma.socialLink.findMany({ where: { isVisible: true }, orderBy: { order: "asc" } });

  const isColor = content?.heroImage?.startsWith("#");
  const heroStyle = content?.heroImage
    ? isColor
      ? { backgroundColor: content.heroImage }
      : { backgroundImage: `url(${content.heroImage})`, backgroundSize: "cover", backgroundPosition: "center" }
    : {};

  return (
    <div>
      {/* Header */}
      <section 
        className={`relative text-white py-24 text-center ${!content?.heroImage ? "bg-primary" : ""}`}
        style={heroStyle}
      >
        {content?.heroImage && !isColor && <div className="absolute inset-0 bg-black/50"></div>}
        <div className="relative max-w-4xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{content?.title || "تواصل معنا"}</h1>
          <p className="text-xl md:text-2xl text-gray-100">
            {content?.description || "نحن هنا لخدمتك والإجابة على كافة استفساراتك"}
          </p>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Contact Info */}
          <div className="space-y-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">كيف يمكننا مساعدتك؟</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                يسعدنا تواصلكم معنا في أي وقت. فريقنا من الخبراء جاهز للرد على استفساراتكم، سواء كانت متعلقة بمشاريعنا، خدماتنا، أو أي طلبات خاصة.
              </p>
            </div>

            <div className="space-y-6">
              {isValidPhone(settings?.contactPhone) && (
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                  </div>
                  <div className="mr-4">
                    <h3 className="font-bold text-gray-900 mb-1">اتصل بنا</h3>
                    <p className="text-gray-600" dir="ltr">{settings!.contactPhone}</p>
                  </div>
                </div>
              )}
              {isValidEmail(settings?.contactEmail) && (
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  </div>
                  <div className="mr-4">
                    <h3 className="font-bold text-gray-900 mb-1">البريد الإلكتروني</h3>
                    <p className="text-gray-600">{settings!.contactEmail}</p>
                  </div>
                </div>
              )}

              {settings?.address && (
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  </div>
                  <div className="mr-4">
                    <h3 className="font-bold text-gray-900 mb-1">العنوان</h3>
                    <p className="text-gray-600">{settings.address}</p>
                  </div>
                </div>
              )}
              {settings?.workingHours && (
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <div className="mr-4">
                    <h3 className="font-bold text-gray-900 mb-1">أوقات العمل</h3>
                    <p className="text-gray-600">{settings.workingHours}</p>
                  </div>
                </div>
              )}
            </div>

            {socials.length > 0 && (
              <div className="pt-8 border-t border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">تواصل معنا عبر الشبكات الاجتماعية</h3>
                <div className="flex space-x-4 space-x-reverse">
                  {socials.map(s => (
                    <a key={s.id} href={s.url} target="_blank" rel="noreferrer" className="w-10 h-10 bg-white border border-gray-200 text-gray-600 rounded-full flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-colors" title={s.platformName}>
                      {s.icon ? <span dangerouslySetInnerHTML={{__html: s.icon}} className="w-5 h-5 block" /> : <span className="text-xs font-bold">{s.platformName.charAt(0)}</span>}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">{content?.formTitle || "أرسل رسالتك"}</h3>
            <ContactForm 
              submitButtonText={content?.submitButtonText || "إرسال الرسالة"}
              helperText={content?.helperText || ""}
            />
          </div>

        </div>
      </section>

      {/* Google Maps Map */}
      {settings?.googleMapsUrl && (
        <section className="h-96 w-full bg-gray-200">
          <iframe 
            src={settings.googleMapsUrl} 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen={false} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </section>
      )}
    </div>
  );
}
