interface AdminTopBarProps {
  title?: string;
  userSlot?: React.ReactNode;
  onMenuClick?: () => void;
}

export default function AdminTopBar({ title = "Dashboard", userSlot, onMenuClick }: AdminTopBarProps) {
  return (
    <header className="h-[56px] bg-white border-b border-gray-200 flex items-center justify-between px-4 xl:px-6 flex-shrink-0">
      
      {/* Title & Search */}
      <div className="flex items-center gap-3 xl:gap-6">
        <button 
          className="xl:hidden text-gray-500 hover:text-gray-900 focus:outline-none p-1" 
          onClick={onMenuClick}
          aria-label="Open Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <h2 className="text-lg xl:text-xl font-bold text-gray-800">{title}</h2>
        
        {/* Search placeholder */}
        <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-1.5 text-sm">
          <span className="text-gray-400 mr-2">🔍</span>
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-transparent border-none focus:outline-none text-gray-700 w-48 xl:w-64"
          />
        </div>
      </div>
      
      {/* User Slot */}
      <div className="flex items-center gap-4">
        {userSlot || (
          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
            U
          </div>
        )}
      </div>
    </header>
  );
}
