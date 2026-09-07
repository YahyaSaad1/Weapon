import React, { useEffect } from 'react';
import Swal from 'sweetalert2';

const WeaponTable = ({ weapons = [], onDelete, onEdit, selectedWeaponId, onSelectWeapon }) => {
  // فحص واستخراج أرقام الأسلحة المكررة في البيانات الممررة
  useEffect(() => {
    if (weapons.length > 0) {
      const serialsMap = {};
      const duplicates = [];

      weapons.forEach(w => {
        const serialClean = String(w.serialNumber).trim().toLowerCase();
        if (serialsMap[serialClean]) {
          duplicates.push(w.serialNumber);
        } else {
          serialsMap[serialClean] = true;
        }
      });

      if (duplicates.length > 0) {
        // إزالة التكرارات من قائمة المكررات نفسها للعرض بشكل نظيف
        const uniqueDuplicates = [...new Set(duplicates)];
        
        Swal.fire({
          icon: 'warning',
          title: 'تنبيه تكرار بيانات',
          text: `الرقم المسلسل المكرر: (${uniqueDuplicates.join(', ')})`,
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 4000
        });
      }
    }
  }, [weapons]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'متداول': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'مخزن': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'كهنة': return 'bg-red-100 text-red-800 border-red-300';
      case 'حراسات': return 'bg-amber-100 text-amber-800 border-amber-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const handleDeleteConfirm = (e, weapon) => {
    e.stopPropagation();
    Swal.fire({
      title: 'هل أنت تأكد؟',
      text: `سيتم حذف السلاح رقم (${weapon.serialNumber}) نهائياً!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#4b5563',
      confirmButtonText: 'نعم، قم بالحذف',
      cancelButtonText: 'إلغاء'
    }).then((result) => {
      if (result.isConfirmed) {
        onDelete(weapon.id);
        Swal.fire({
          title: 'تم الحذف!',
          text: 'تم حذف السلاح بنجاح.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

  const handleEditClick = (e, weapon) => {
    e.stopPropagation();
    onEdit(weapon);
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden text-right">
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse min-w-[650px]">
          <thead>
            <tr className="bg-slate-800 text-slate-100 text-xs font-bold uppercase border-b border-slate-700 whitespace-nowrap">
              <th className="p-3.5 text-center w-12">#</th>
              <th className="p-3.5">رقم السلاح</th>
              <th className="p-3.5">نوع السلاح</th>
              <th className="p-3.5">حالة التشغيل</th>
              <th className="p-3.5">الموقع / العهدة</th>
              <th className="p-3.5 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="text-xs sm:text-sm whitespace-nowrap select-text">
            {weapons.length > 0 ? (
              weapons.map((weapon, index) => {
                const isSelected = selectedWeaponId === weapon.id;
                const isEven = index % 2 === 0;
                
                return (
                  <tr 
                    key={weapon.id} 
                    onClick={() => onSelectWeapon(weapon.id)}
                    className={`cursor-pointer transition-colors duration-150 border-b border-slate-100 ${
                      isSelected 
                        ? 'bg-blue-200/90 hover:bg-blue-200 border-r-4 border-r-blue-600 font-semibold text-slate-900' 
                        : isEven 
                          ? 'bg-white hover:bg-blue-50' 
                          : 'bg-slate-100 hover:bg-blue-50'
                    }`}
                  >
                    <td className={`p-3.5 text-center font-mono text-xs font-bold ${isSelected ? 'text-blue-800' : 'text-slate-400'}`}>
                      {index + 1}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-slate-800 select-all cursor-text">
                      {weapon.serialNumber}
                    </td>
                    <td className="p-3.5 text-slate-700">{weapon.type}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${getStatusBadge(weapon.status)}`}>
                        {weapon.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600">{weapon.location || 'غير محدد'}</td>
                    <td className="p-3.5 text-center select-none">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={(e) => handleEditClick(e, weapon)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-xs px-2.5 py-1 rounded border border-blue-200 bg-white hover:bg-blue-50 transition shadow-sm"
                        >
                          تعديل
                        </button>
                        <button 
                          onClick={(e) => handleDeleteConfirm(e, weapon)}
                          className="text-red-600 hover:text-red-800 font-medium text-xs px-2.5 py-1 rounded border border-red-200 bg-white hover:bg-red-50 transition shadow-sm"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="p-8 text-center text-slate-500 bg-white">لا توجد أسلحة مطابقة للبيانات الحالية.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WeaponTable;