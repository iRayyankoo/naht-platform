import Link from "next/link";

export default function NahtStandard() {
  return (
    <section className="py-24 md:py-32 bg-[#050505] text-white">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <div className="lg:w-1/2">
            <h2 className="text-sm font-bold tracking-[0.2em] text-primary/90 uppercase mb-6">The Naht Standard</h2>
            <h3 className="text-4xl md:text-5xl font-bold mb-8 font-serif leading-[1.2] tracking-tight text-white drop-shadow-sm">
              نرتقي بمفهوم التطوير العقاري.
            </h3>
            <p className="text-lg md:text-xl text-gray-400/90 font-light leading-relaxed mb-10 max-w-xl">
              نلتزم في "نحت" بأعلى معايير الجودة العالمية، حيث ندمج بين التصميم المعماري العبقري، واستدامة التنفيذ، واختيار أميز المواقع لنخلق أصولاً عقارية تتوارثها الأجيال.
            </p>
            
            <div className="grid grid-cols-2 gap-8 md:gap-12 mt-12 pt-12 border-t border-white/5">
              <div>
                <div className="text-5xl font-serif font-bold text-white mb-2 drop-shadow-sm">15+</div>
                <div className="text-sm text-gray-500/80 tracking-widest uppercase font-bold">عاماً من الخبرة</div>
              </div>
              <div>
                <div className="text-5xl font-serif font-bold text-white mb-2 drop-shadow-sm">10+</div>
                <div className="text-sm text-gray-500/80 tracking-widest uppercase font-bold">مشاريع نوعية</div>
              </div>
            </div>
          </div>
          
          <div className="lg:w-1/2 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <div className="bg-white/[0.03] border border-white/[0.05] p-8 md:p-10 rounded-3xl hover:bg-white/[0.06] transition-colors duration-500 shadow-[0_10px_40px_rgba(0,0,0,0.2)]">
              <svg className="w-10 h-10 text-primary/90 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              <h4 className="text-xl font-bold mb-3 text-white/95">مواقع استراتيجية</h4>
              <p className="text-sm text-gray-400/80 leading-relaxed font-light">انتقاء دقيق لأرقى الأحياء وأكثرها نمواً لضمان جودة الحياة والعائد الاستثماري.</p>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.05] p-8 md:p-10 rounded-3xl hover:bg-white/[0.06] transition-colors duration-500 md:mt-12 shadow-[0_10px_40px_rgba(0,0,0,0.2)]">
              <svg className="w-10 h-10 text-primary/90 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
              <h4 className="text-xl font-bold mb-3 text-white/95">جودة البناء</h4>
              <p className="text-sm text-gray-400/80 leading-relaxed font-light">استخدام أفضل المواد وتطبيق أدق معايير الكود السعودي للبناء.</p>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.05] p-8 md:p-10 rounded-3xl hover:bg-white/[0.06] transition-colors duration-500 shadow-[0_10px_40px_rgba(0,0,0,0.2)]">
              <svg className="w-10 h-10 text-primary/90 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path></svg>
              <h4 className="text-xl font-bold mb-3 text-white/95">تصاميم استثنائية</h4>
              <p className="text-sm text-gray-400/80 leading-relaxed font-light">واجهات عصرية وتقسيمات داخلية ذكية تلبي تطلعات العائلة العصرية.</p>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.05] p-8 md:p-10 rounded-3xl hover:bg-white/[0.06] transition-colors duration-500 md:mt-12 shadow-[0_10px_40px_rgba(0,0,0,0.2)]">
              <svg className="w-10 h-10 text-primary/90 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
              <h4 className="text-xl font-bold mb-3 text-white/95">ضمانات ممتدة</h4>
              <p className="text-sm text-gray-400/80 leading-relaxed font-light">نقدم ضمانات حقيقية تمتد لسنوات لحماية استثمارك وراحتك.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
