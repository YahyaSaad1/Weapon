import React, { useState } from 'react';
import StatusSelect from './StatusSelect';
import Swal from 'sweetalert2';

const EditWeaponModal = ({ weapon, weaponTypes, statusOptions, onSave, onClose, weapons = [] }) => {
  const [serialNumber, setSerialNumber] = useState(weapon.serialNumber);
  const [type, setType] = useState(weapon.type);
  const [status, setStatus] = useState(weapon.status);
  const [location, setLocation] = useState(weapon.location || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanSerial = serialNumber.trim();
    if (!cleanSerial) return;

    // فحص التكرار مع استثناء السلاح الحالي الذي يتم تعديله
    const isDuplicate = weapons.some(
      (w) => w.id !== weapon.id && w.serialNumber.trim().toLowerCase() === cleanSerial.toLowerCase()
    );

    if (isDuplicate) {
      Swal.fire({
        icon: 'error',
        title: 'رقم السلاح مكرر!',
        text: `السلاح رقم (${cleanSerial}) مسجل بالفعل لقطعة أخرى.`,
        confirmButtonText: 'حسناً',
        confirmButtonColor: '#ef4444'
      });
      return;
    }

    onSave({
      ...weapon,
      serialNumber: cleanSerial,
      type,
      status,
      location: location.trim()
    });

    Swal.fire({
      title: 'تم التعديل!',
      text: 'تم تحديث بيانات السلاح بنجاح.',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 text-right dir-rtl">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 border border-gray-200">
        <h2 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b">تعديل بيانات السلاح</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">رقم السلاح (Serial Number)</label>
            <input
              type="text"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">نوع السلاح</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {weaponTypes.map((t) => (
                <option key={t.id} value={t.name}>{t.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">حالة التشغيل</label>
            <StatusSelect
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={statusOptions}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">الموقع / جهة العهدة</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition text-sm"
            >
              حفظ التعديلات
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition text-sm"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditWeaponModal;