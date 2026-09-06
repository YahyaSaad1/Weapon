import React from 'react';
import ExcelActions from './ExcelActions';

const FilterBar = ({ 
  searchTerm, 
  setSearchTerm, 
  selectedStatus, 
  setSelectedStatus, 
  selectedLocation,
  setSelectedLocation,
  locationOptions,
  sortBy, 
  setSortBy, 
  statusOptions, 
  totalCount,
  filteredCount,
  weapons,
  onImportWeapons
}) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 space-y-4">
      {/* الصف العلوي: البحث والتحكم بالإكسيل */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="بحث برقم السلاح، النوع، الحالة، أو الموقع..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
          <span className="absolute right-3 top-2.5 text-slate-400">🔍</span>
        </div>

        {/* أزرار Excel والتعداد */}
        <div className="flex items-center justify-between md:justify-end gap-3">
          <ExcelActions weapons={weapons} onImportWeapons={onImportWeapons} />

          <div className="text-xs text-slate-500 font-medium whitespace-nowrap bg-slate-100 px-3 py-2 rounded-lg border border-slate-200">
            العرض: <span className="font-bold text-slate-800">{filteredCount}</span> من <span className="font-bold text-slate-800">{totalCount}</span>
          </div>
        </div>
      </div>

      {/* أدوات الفلترة والفرز */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">فلترة بالحالة:</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="الكل">جميع الحالات</option>
            {statusOptions.map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">فلترة بالموقع / العهدة:</label>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="الكل">جميع المواقع</option>
            {locationOptions.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">ترتيب حسب:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="id-asc">الأقدم إدخالاً</option>
            <option value="serial-asc">رقم السلاح (تصاعدي)</option>
            <option value="serial-desc">رقم السلاح (تنازلي)</option>
            <option value="type">نوع السلاح</option>
            <option value="status">حالة التشغيل</option>
            <option value="location">الموقع / العهدة</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;