import Link from "next/link";

type ProjectTypeData = {
  type: string;
};

export default function ProjectTypes({ types }: { types: ProjectTypeData[] }) {
  if (!types || types.length === 0) return null;

  return (
    <section className="py-32 bg-[#FAFAFA]">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="mb-20 text-center md:text-right">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight font-serif">مجتمعاتنا</h2>
          <div className="w-24 h-[2px] bg-primary mb-8 mx-auto md:mx-0"></div>
          <p className="text-xl text-gray-500 max-w-2xl font-light leading-relaxed">
            مجموعة متنوعة من الخيارات السكنية والتجارية المصممة لترتقي بتجربتك العقارية وتلبي كافة تطلعاتك.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {types.map((item, index) => (
            <Link key={index} href={`/projects?type=${encodeURIComponent(item.type)}`} className="group relative h-[400px] overflow-hidden bg-gray-900 flex items-center justify-center">
              {/* Neutral abstract background for elegance */}
              <div className="absolute inset-0 bg-[url('https://placehold.co/600x600/111111/222222?text=+')] opacity-50 group-hover:opacity-70 transition-opacity duration-1000 mix-blend-overlay scale-110 group-hover:scale-100"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
              
              <div className="relative z-10 text-center p-8 translate-y-6 group-hover:translate-y-0 transition-transform duration-700 ease-out w-full">
                <h3 className="text-3xl font-bold text-white mb-6 tracking-widest">{item.type}</h3>
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-white/30 text-white group-hover:bg-primary group-hover:border-primary transition-colors duration-500">
                  <svg className="w-5 h-5 rtl:-scale-x-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
