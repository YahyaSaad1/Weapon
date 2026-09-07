import React from 'react';

const Sidebar = ({ 
  weaponTypes = [], 
  selectedType, 
  setSelectedType, 
  currentTab, 
  setCurrentTab,
  isOpen,
  onClose 
}) => {

  const handleSelectCategory = (typeName) => {
    setSelectedType(typeName);
    setCurrentTab('inventory'); // الانتقال للجرد تلقائياً عند الضغط على تصنيف
    onClose();
  };

  return (
    <>
      {/* خلفية معتمة للموبايل */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity"
        />
      )}

      {/* سايد بار ثابت بسكرول منفصل */}
      <aside className={`
        fixed md:sticky md:top-16 inset-y-0 right-0 z-50
        w-64 bg-slate-900 text-slate-200 flex flex-col justify-between
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
        shadow-xl md:shadow-none shrink-0
        h-screen md:h-[calc(100vh-4rem)] border-l border-slate-800
      `}>
        
        <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
          {/* زر إغلاق للموبايل */}
          <div className="flex items-center justify-between md:hidden mb-4 pb-2 border-b border-slate-700">
            <span className="font-bold text-sm text-slate-300">القائمة الرئيسية</span>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1">✕</button>
          </div>

          <div className="space-y-6">
            {/* التنقل الرئيسي */}
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">التنقل</h3>
              <nav className="space-y-1">
                <button
                  onClick={() => { setCurrentTab('inventory'); onClose(); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    currentTab === 'inventory' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <span>📦</span> جرد الأسلحة
                </button>
                <button
                  onClick={() => { setCurrentTab('addWeapon'); onClose(); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    currentTab === 'addWeapon' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <span>➕</span> إضافة سلاح جديد
                </button>
                <button
                  onClick={() => { setCurrentTab('addType'); onClose(); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    currentTab === 'addType' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <span>🏷️</span> إضافة نوع سلاح
                </button>
              </nav>
            </div>

            {/* تصنيف الأسلحة */}
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">تصنيف الأسلحة</h3>
              <div className="space-y-1">
                <button
                  onClick={() => handleSelectCategory('الكل')}
                  className={`w-full text-right px-3 py-2 rounded-lg text-xs font-medium transition flex items-center justify-between ${
                    currentTab === 'inventory' && selectedType === 'الكل' 
                      ? 'bg-slate-800 text-blue-400 font-bold border-r-2 border-blue-500' 
                      : 'hover:bg-slate-800/60 text-slate-400'
                  }`}
                >
                  <span>جميع الأسلحة</span>
                </button>
                
                {weaponTypes.map((type, index) => {
                  // لاستخراج الاسم والشفرة سواء كان العنصر نصاً أم كائناً
                  const typeName = typeof type === 'string' ? type : type.name;
                  const typeKey = typeof type === 'object' && type.id ? type.id : index;

                  return (
                    <button
                      key={typeKey}
                      onClick={() => handleSelectCategory(typeName)}
                      className={`w-full text-right px-3 py-2 rounded-lg text-xs font-medium transition ${
                        currentTab === 'inventory' && selectedType === typeName 
                          ? 'bg-slate-800 text-blue-400 font-bold border-r-2 border-blue-500' 
                          : 'hover:bg-slate-800/60 text-slate-400'
                      }`}
                    >
                      {typeName}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        <div className="p-4 border-t border-slate-800 text-center shrink-0 bg-slate-950/40">
          <h3 className="text-xs font-semibold text-slate-300 tracking-wide mb-1">
            منظومة إدارة الأسلحة والذخيرة
          </h3>
          <p className="text-[11px] text-slate-500 font-medium">
            تنفيذ: <span className="text-blue-400 font-semibold">يحيى سعد عبدالموجود</span>
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;