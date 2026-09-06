import React, { useState } from 'react';
import Swal from 'sweetalert2';

const AddWeaponTypeForm = ({ 
  onAddType, 
  onEditType, 
  onDeleteType, 
  weaponTypes = [], 
  weapons = [] 
}) => {
  const [typeName, setTypeName] = useState('');

  // 1. معالجة إضافة نوع جديد من الـ Form الرئيسي
  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanType = typeName.trim();
    if (!cleanType) return;

    // فحص عدم تكرار نوع السلاح
    const isDuplicate = weaponTypes.some(
      (t) => t.name.trim().toLowerCase() === cleanType.toLowerCase()
    );

    if (isDuplicate) {
      Swal.fire({
        icon: 'error',
        title: 'النوع مكرر!',
        text: `طراز السلاح (${cleanType}) مسجل بالفعل.`,
        confirmButtonText: 'حسناً',
        confirmButtonColor: '#ef4444'
      });
      return;
    }

    // رسالة تأكيد الإضافة
    Swal.fire({
      title: 'تأكيد إضافة نوع السلاح',
      text: `هل أنت متأكد من إضافة نوع السلاح: (${cleanType})؟`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'نعم، أضف النوع',
      cancelButtonText: 'إلغاء'
    }).then((result) => {
      if (result.isConfirmed) {
        if (onAddType) {
          onAddType(cleanType);
          Swal.fire({
            icon: 'success',
            title: 'تمت الإضافة!',
            text: 'تمت إضافة نوع السلاح بنجاح.',
            timer: 1500,
            showConfirmButton: false
          });
        }
        setTypeName('');
      }
    });
  };

  // 2. فتح نافذة التعديل كاملة داخل SweetAlert2 (SWAL Modal)
  const handleStartEdit = (typeObj) => {
    Swal.fire({
      title: 'تعديل نوع السلاح',
      input: 'text',
      inputLabel: 'اسم/طراز السلاح بالكامل',
      inputValue: typeObj.name,
      inputPlaceholder: 'أدخل الاسم الجديد هنا...',
      showCancelButton: true,
      confirmButtonText: 'حفظ التعديلات',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#d97706',
      cancelButtonColor: '#4b5563',
      inputValidator: (value) => {
        const cleanVal = value ? value.trim() : '';
        if (!cleanVal) {
          return 'يجب إدخال اسم السلاح!';
        }

        // التأكد من عدم التكرار مع عنصر آخر
        const isDuplicate = weaponTypes.some(
          (t) => t.name.trim().toLowerCase() === cleanVal.toLowerCase() && t.id !== typeObj.id
        );

        if (isDuplicate) {
          return `طراز السلاح (${cleanVal}) مسجل بالفعل!`;
        }
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const newName = result.value.trim();
        
        if (onEditType) {
          onEditType(typeObj.id, newName);
        }

        Swal.fire({
          icon: 'success',
          title: 'تم التعديل!',
          text: 'تم تعديل اسم نوع السلاح بنجاح.',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

  // 3. تأكيد وتطبيق الحذف
  const handleDeleteConfirm = (typeObj) => {
    // فحص المرفقات من الأسلحة
    const attachedWeapons = weapons.filter(
      (w) => String(w.type).trim().toLowerCase() === String(typeObj.name).trim().toLowerCase()
    );

    if (attachedWeapons.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'لا يمكن الحذف!',
        text: `توجد (${attachedWeapons.length}) قطعة سلاح مسجلة تحت طراز (${typeObj.name}). يجب حذف الأسلحة أو تغيير طرازها أولاً.`,
        confirmButtonText: 'موافق',
        confirmButtonColor: '#ef4444'
      });
      return;
    }

    Swal.fire({
      title: 'هل أنت متأكد؟',
      text: `سيتم حذف نوع السلاح (${typeObj.name})!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#4b5563',
      confirmButtonText: 'نعم، قم بالحذف',
      cancelButtonText: 'إلغاء'
    }).then((result) => {
      if (result.isConfirmed) {
        if (onDeleteType) {
          onDeleteType(typeObj.id);
        }
        Swal.fire({
          title: 'تم الحذف!',
          text: 'تم حذف نوع السلاح بنجاح.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-right">
      <h2 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b">
        إضافة نوع سلاح جديد للمعسكر
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            اسم/طراز السلاح بالكامل
          </label>
          <input
            type="text"
            placeholder="مثال: رشاش اسوان جرينوف 7.62x54"
            value={typeName}
            onChange={(e) => setTypeName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition"
        >
          حفظ النوع
        </button>
      </form>

      <div className="mt-8">
        <h3 className="text-sm font-semibold text-slate-600 mb-2">
          الأنواع المسجلة حالياً ({weaponTypes.length}):
        </h3>
        {weaponTypes.length > 0 ? (
          <ul className="divide-y divide-gray-100 border rounded-lg overflow-hidden">
            {weaponTypes.map((t) => (
              <li
                key={t.id}
                className="p-3 text-sm text-slate-700 bg-gray-50 flex items-center justify-between"
              >
                <span>{t.name}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(t)}
                    className="text-blue-600 hover:text-blue-800 font-medium text-xs px-2.5 py-1 rounded border border-blue-200 bg-white hover:bg-blue-50 transition"
                  >
                    تعديل
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteConfirm(t)}
                    className="text-red-600 hover:text-red-800 font-medium text-xs px-2.5 py-1 rounded border border-red-200 bg-white hover:bg-red-50 transition"
                  >
                    حذف
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 border rounded-lg p-4 text-center">
            لا توجد أنواع مسجلة حتى الآن.
          </p>
        )}
      </div>
    </div>
  );
};

export default AddWeaponTypeForm;