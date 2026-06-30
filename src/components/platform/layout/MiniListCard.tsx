interface ListItem {
  id: string | number;
  title: string;
  subtitle: string;
  badge?: string;
  badgeColor?: string;
}

interface MiniListCardProps {
  title: string;
  items: ListItem[];
  viewAllHref?: string;
  emptyMessage?: string;
}

export default function MiniListCard({ title, items, viewAllHref, emptyMessage = "لا توجد بيانات حالياً" }: MiniListCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full min-h-[300px]">
      <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
        <h3 className="text-base font-bold text-gray-800">{title}</h3>
        {viewAllHref && (
          <a href={viewAllHref} className="text-xs text-primary hover:underline font-medium px-2">عرض الكل</a>
        )}
      </div>
      <div className="divide-y divide-gray-50 flex-1 overflow-y-auto bg-white p-2 flex flex-col">
        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-6 text-sm font-medium text-gray-400 text-center">
            {emptyMessage}
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="p-3 hover:bg-gray-50 rounded-xl transition-colors flex justify-between items-center">
              <div>
                <p className="text-sm font-bold text-gray-900">{item.title}</p>
                <p className="text-xs text-gray-500 mt-1">{item.subtitle}</p>
              </div>
              {item.badge && (
                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${item.badgeColor || 'bg-gray-100 text-gray-600'}`}>
                  {item.badge}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
