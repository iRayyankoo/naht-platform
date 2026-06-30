interface ChartPlaceholderCardProps {
  title: string;
  type?: 'bar' | 'line' | 'pie';
}

export default function ChartPlaceholderCard({ title, type = 'bar' }: ChartPlaceholderCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col h-full min-h-[300px]">
      <h3 className="text-base font-bold text-gray-800 mb-6">{title}</h3>
      <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50 p-6">
        <div className="text-4xl mb-3 opacity-30">
          {type === 'bar' ? '📊' : type === 'pie' ? '🥧' : '📈'}
        </div>
        <p className="text-sm font-bold text-gray-500 mb-1">الرسم البياني قيد التجهيز</p>
        <p className="text-xs text-gray-400 text-center max-w-[200px]">
          سيتم عرض البيانات المرئية هنا قريباً عند توفر الإحصائيات الكافية.
        </p>
      </div>
    </div>
  );
}
