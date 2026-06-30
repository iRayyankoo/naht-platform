interface MetricCardProps {
  label: string;
  value: string | number;
  icon: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export default function MetricCard({ label, value, icon, trend }: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 p-3 lg:p-4 flex flex-col justify-center min-h-[84px] lg:min-h-[96px] hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-1">
        <h3 className="text-[11px] lg:text-sm font-medium text-gray-500 line-clamp-1">{label}</h3>
        <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-lg bg-gray-50 flex items-center justify-center text-sm lg:text-lg text-primary flex-shrink-0 ml-1">
          {icon}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div className="text-xl lg:text-3xl font-bold text-gray-900 tracking-tight">{value}</div>
        {trend && (
          <div className={`text-[9px] lg:text-xs font-semibold px-1.5 py-0.5 lg:px-2 lg:py-1 rounded-full ${trend.isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </div>
        )}
      </div>
    </div>
  );
}
