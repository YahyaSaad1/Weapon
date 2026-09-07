import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Swal from 'sweetalert2';

const AddWeaponForm = ({ weaponTypes = [], statusOptions = [], onAddWeapon, weapons = [] }) => {
  const [serialNumber, setSerialNumber] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [location, setLocation] = useState('');

  // حالات التحكم في منيو نوع السلاح
  const [typeSearch, setTypeSearch] = useState('');
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [typePos, setTypePos] = useState({ top: 0, left: 0, width: 0 });

  // حالات التحكم في منيو حالة التشغيل
  const [statusSearch, setStatusSearch] = useState('');
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [statusPos, setStatusPos] = useState({ top: 0, left: 0, width: 0 });

  // مراجع الزر والمحتوى
  const typeBtnRef = useRef(null);
  const statusBtnRef = useRef(null);
  const typeMenuRef = useRef(null);
  const statusMenuRef = useRef(null);

  // تحديث مكان القوائم المنسدلة
  const updatePositions = () => {
    if (typeBtnRef.current) {
      const rect = typeBtnRef.current.getBoundingClientRect();
      setTypePos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
    if (statusBtnRef.current) {
      const rect = statusBtnRef.current.getBoundingClientRect();
      setStatusPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  };

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        typeBtnRef.current && !typeBtnRef.current.contains(e.target) &&
        typeMenuRef.current && !typeMenuRef.current.contains(e.target)
      ) {
        setIsTypeOpen(false);
      }
      if (
        statusBtnRef.current && !statusBtnRef.current.contains(e.target) &&
        statusMenuRef.current && !statusMenuRef.current.contains(e.target)
      ) {
        setIsStatusOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('resize', updatePositions);
    window.addEventListener('scroll', updatePositions, true);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('resize', updatePositions);
      window.removeEventListener('scroll', updatePositions, true);
    };
  }, []);

  const handleOpenType = () => {
    updatePositions();
    setIsTypeOpen(!isTypeOpen);
    setIsStatusOpen(false);
  };

  const handleOpenStatus = () => {
    updatePositions();
    setIsStatusOpen(!isStatusOpen);
    setIsTypeOpen(false);
  };

  // تصفية الأنواع بحسب كلمة البحث
  const filteredTypes = weaponTypes.filter((t) =>
    t.name.toLowerCase().includes(typeSearch.toLowerCase())
  );

  // تصفية حالات التشغيل بحسب كلمة البحث
  const filteredStatuses = statusOptions.filter((opt) =>
    opt.toLowerCase().includes(statusSearch.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanSerial = serialNumber.trim();
    const cleanLocation = location.trim();

    // 1. التحقق من الحقول الإجبارية
    if (!cleanSerial || !type || !status || !cleanLocation) {
      Swal.fire({
        icon: 'warning',
        title: 'بيانات ناقصة!',
        text: 'يرجى ملء جميع الحقول المطلوبة قبل حفظ قطعة السلاح.',
        confirmButtonText: 'حسناً',
        confirmButtonColor: '#d97706'
      });
      return;
    }

    // 2. التحقق من تكرار السلاح
    const isDuplicate = weapons.some(
      (w) => w.serialNumber.trim().toLowerCase() === cleanSerial.toLowerCase()
    );

    if (isDuplicate) {
      Swal.fire({
        icon: 'error',
        title: 'رقم السلاح مكرر!',
        text: `السلاح رقم (${cleanSerial}) مسجل بالفعل في النظام.`,
        confirmButtonText: 'حسناً',
        confirmButtonColor: '#ef4444'
      });
      return;
    }

    // 3. رسالة التأكيد قبل الإضافة
    Swal.fire({
      title: 'هل أنت متأكد من إضافة قطعة سلاح جديدة؟',
      html: `
        <div style="text-align: right; font-size: 14px; line-height: 1.8;">
          <p><b>رقم السلاح:</b> ${cleanSerial}</p>
          <p><b>نوع السلاح:</b> ${type}</p>
          <p><b>حالة التشغيل:</b> ${status}</p>
          <p><b>الموقع / العهدة:</b> ${cleanLocation}</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#059669',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'نعم، أضف السلاح',
      cancelButtonText: 'إلغاء'
    }).then((result) => {
      if (result.isConfirmed) {
        onAddWeapon({
          serialNumber: cleanSerial,
          type,
          status,
          location: cleanLocation
        });

        // تنظيف الحقول
        setSerialNumber('');
        setType('');
        setStatus('');
        setLocation('');

        Swal.fire({
          icon: 'success',
          title: 'تمت الإضافة بنجاح!',
          text: `تم تسجيل السلاح (${cleanSerial}) في العهدة.`,
          timer: 1800,
          showConfirmButton: false
        });
      }
    });
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-right">
      <h2 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b">
        تسجيل قطعة سلاح جديدة في العهدة
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* رقم السلاح */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            رقم السلاح (Serial Number) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="مثال: W-1005"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* منيو نوع السلاح */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            نوع السلاح <span className="text-red-500">*</span>
          </label>
          <button
            ref={typeBtnRef}
            type="button"
            onClick={handleOpenType}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-right flex justify-between items-center"
          >
            <span className={type ? 'text-gray-800' : 'text-gray-400'}>
              {type || 'اختر نوع السلاح...'}
            </span>
            <span className="text-xs text-gray-400">▼</span>
          </button>
        </div>

        {/* منيو حالة التشغيل */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            حالة التشغيل <span className="text-red-500">*</span>
          </label>
          <button
            ref={statusBtnRef}
            type="button"
            onClick={handleOpenStatus}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-right flex justify-between items-center"
          >
            <span className={status ? 'text-gray-800' : 'text-gray-400'}>
              {status || 'اختر حالة التشغيل...'}
            </span>
            <span className="text-xs text-gray-400">▼</span>
          </button>
        </div>

        {/* الموقع / جهة العهدة */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            الموقع / جهة العهدة <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="مثال: المخزن الأسترتيجي، السلاح ليج، فض الشغب"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition mt-2"
        >
          تسجيل السلاح
        </button>
      </form>

      {/* Portal قائمة نوع السلاح */}
      {isTypeOpen &&
        ReactDOM.createPortal(
          <div
            ref={typeMenuRef}
            style={{
              position: 'absolute',
              top: `${typePos.top}px`,
              left: `${typePos.left}px`,
              width: `${typePos.width}px`,
              zIndex: 99999
            }}
            className="bg-white border border-gray-200 rounded-lg shadow-2xl overflow-hidden text-right"
          >
            <div className="p-2 border-b border-gray-100 bg-gray-50">
              <input
                type="text"
                placeholder="ابحث عن نوع السلاح..."
                value={typeSearch}
                onChange={(e) => setTypeSearch(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                autoFocus
              />
            </div>
            <ul className="max-h-48 overflow-y-auto divide-y divide-gray-50">
              {filteredTypes.length > 0 ? (
                filteredTypes.map((t) => (
                  <li
                    key={t.id}
                    onClick={() => {
                      setType(t.name);
                      setIsTypeOpen(false);
                      setTypeSearch('');
                    }}
                    className={`p-2.5 text-sm cursor-pointer hover:bg-blue-50 transition flex justify-between items-center ${
                      type === t.name ? 'bg-blue-50 font-semibold text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    <span>{t.name}</span>
                    {type === t.name && <span className="text-xs">✓</span>}
                  </li>
                ))
              ) : (
                <li className="p-3 text-xs text-gray-400 text-center">لا توجد نتائج مطابقة</li>
              )}
            </ul>
          </div>,
          document.body
        )}

      {/* Portal قائمة حالة التشغيل */}
      {isStatusOpen &&
        ReactDOM.createPortal(
          <div
            ref={statusMenuRef}
            style={{
              position: 'absolute',
              top: `${statusPos.top}px`,
              left: `${statusPos.left}px`,
              width: `${statusPos.width}px`,
              zIndex: 99999
            }}
            className="bg-white border border-gray-200 rounded-lg shadow-2xl overflow-hidden text-right"
          >
            <div className="p-2 border-b border-gray-100 bg-gray-50">
              <input
                type="text"
                placeholder="ابحث عن الحالة..."
                value={statusSearch}
                onChange={(e) => setStatusSearch(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                autoFocus
              />
            </div>
            <ul className="max-h-48 overflow-y-auto divide-y divide-gray-50">
              {filteredStatuses.length > 0 ? (
                filteredStatuses.map((opt, index) => (
                  <li
                    key={index}
                    onClick={() => {
                      setStatus(opt);
                      setIsStatusOpen(false);
                      setStatusSearch('');
                    }}
                    className={`p-2.5 text-sm cursor-pointer hover:bg-blue-50 transition flex justify-between items-center ${
                      status === opt ? 'bg-blue-50 font-semibold text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    <span>{opt}</span>
                    {status === opt && <span className="text-xs">✓</span>}
                  </li>
                ))
              ) : (
                <li className="p-3 text-xs text-gray-400 text-center">لا توجد نتائج مطابقة</li>
              )}
            </ul>
          </div>,
          document.body
        )}
    </div>
  );
};

export default AddWeaponForm;