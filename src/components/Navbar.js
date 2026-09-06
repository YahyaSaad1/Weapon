import React from 'react';

const Navbar = ({ onToggleSidebar }) => {
  return (
    <header className="bg-slate-900 text-white shadow-md sticky top-0 z-40">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* زر فتح القائمة للشاشات الصغيرة */}
          <button 
            onClick={onToggleSidebar}
            className="md:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg focus:outline-none"
            aria-label="القائمة"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xl">🛡️</span>
            <h1 className="text-base sm:text-lg font-bold tracking-wide">منظومة إداراة العهدة والأسلحة</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-300">
          <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center font-bold text-white text-xs">
            --
          </div>
          <span className="hidden sm:inline">أ.ش/ إبراهيم عبدالحميد</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;