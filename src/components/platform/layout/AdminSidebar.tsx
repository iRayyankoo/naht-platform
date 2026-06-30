import Link from 'next/link';

export interface SidebarItem {
  name: string;
  href: string;
  icon: string;
  isActive?: boolean;
}

interface AdminSidebarProps {
  brandName?: string;
  items: SidebarItem[];
  footerSlot?: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ brandName = "Generic Platform", items, footerSlot, isOpen, onClose }: AdminSidebarProps) {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 xl:hidden transition-opacity"
          onClick={onClose}
        />
      )}
      
      <aside className={`
        fixed xl:static inset-y-0 right-0 z-50
        w-[220px] bg-gray-900 text-white flex flex-col flex-shrink-0
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full xl:translate-x-0'}
      `}>
        {/* Brand / Logo Area */}
        <div className="min-h-[56px] flex items-center justify-between px-4 border-b border-gray-800">
          <h1 className="text-sm font-bold leading-tight break-words whitespace-normal">{brandName}</h1>
          <button className="xl:hidden text-gray-400 hover:text-white" onClick={onClose}>
            ✕
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {items.map((item, idx) => (
            <Link 
              key={idx} 
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                item.isActive 
                  ? "bg-primary text-white shadow-sm" 
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <span className="text-base opacity-90">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Footer Area */}
        {footerSlot && (
          <div className="p-4 border-t border-gray-800 bg-gray-900/50">
            {footerSlot}
          </div>
        )}
      </aside>
    </>
  );
}
