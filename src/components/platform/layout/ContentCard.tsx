interface ContentCardProps {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export default function ContentCard({ title, action, children, className = "" }: ContentCardProps) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col ${className}`}>
      <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
        <h3 className="text-base font-bold text-gray-800">{title}</h3>
        {action && <div>{action}</div>}
      </div>
      <div className="p-0 flex-1 bg-white">
        {children}
      </div>
    </div>
  );
}
