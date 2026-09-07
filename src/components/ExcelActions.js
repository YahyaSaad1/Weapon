import React, { useRef } from 'react';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

const ExcelActions = ({ weapons = [], selectedType = 'الكل', onImportWeapons }) => {
  const fileInputRef = useRef(null);

  // 1. تنزيل نموذج الشيت المرجعي المنسق من مجلد public ليكتب فيه المستخدم
  const handleDownloadTemplate = () => {
    Swal.fire({
      title: 'تحميل نموذج الشيت المرجعي',
      text: 'هل تريد تنزيل الشيت المرجعي الفارغ للبدء في ملء بيانات الأسلحة؟',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#047857',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'نعم، قم بالتنزيل',
      cancelButtonText: 'إلغاء'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch('/weapons_data.xlsx');
          if (!response.ok) throw new Error('تعذر العثور على الملف');

          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'نموذج_جرد_الأسلحة.xlsx';
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);

          Swal.fire({
            icon: 'success',
            title: 'تم التحميل',
            text: 'تم تنزيل النموذج المرجعي بنجاح.',
            timer: 1500,
            showConfirmButton: false
          });
        } catch (error) {
          console.error(error);
          Swal.fire({
            icon: 'error',
            title: 'خطأ في التنزيل',
            text: 'تأكد من وجود ملف weapons_data.xlsx داخل مجلد public في مشروعك.',
            confirmButtonText: 'حسناً'
          });
        }
      }
    });
  };

  // 2. معالجة واستيراد ملف الإكسيل مع التحقق من عدم التكرار وعدم وجود أماكن فارغة
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // قراءة البيانات كمصفوفة صفوف
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (!rows || rows.length < 3) {
          Swal.fire('خطأ في الملف', 'الملف لا يحتوي على صفوف بيانات كافية!', 'error');
          return;
        }

        // استخراج نوع السلاح من الصف الأول (A1)
        const extractedType = String(rows[0][0] || '').trim();

        // البيانات تبدأ من الصف الثالث (Index 2)
        const dataRows = rows.slice(2);

        const newWeaponsToImport = [];
        const existingSerials = new Set(
          (Array.isArray(weapons) ? weapons : []).map((w) =>
            String(w.serialNumber || w.serial_number || '').trim().toLowerCase()
          )
        );
        const fileSerialsSeen = new Set();

        let emptyFieldsCount = 0;
        let duplicateInSystemCount = 0;
        let duplicateInFileCount = 0;

        dataRows.forEach((row, idx) => {
          // التغاضي عن الصفوف الفارغة كلياً
          if (
            !row ||
            row.length === 0 ||
            row.every((cell) => cell === undefined || cell === null || String(cell).trim() === '')
          ) {
            return;
          }

          // جلب القيم من الأعمدة:
          // B = رقم السلاح, C = التشغيل, D = الموقع/العهدة
          const serialNumber = row[1] ? String(row[1]).trim() : '';
          const status = row[2] ? String(row[2]).trim() : '';
          const location = row[3] ? String(row[3]).trim() : '';
          const weaponType =
            extractedType && extractedType !== 'جرد كافة الأسلحة والذخيرة' ? extractedType : '';

          // 1. التحقق من وجود أماكن فارغة بالصف
          if (!serialNumber || !status || !location || !weaponType) {
            emptyFieldsCount++;
            return;
          }

          const serialKey = serialNumber.toLowerCase();

          // 2. التحقق من عدم التكرار داخل نفس الملف
          if (fileSerialsSeen.has(serialKey)) {
            duplicateInFileCount++;
            return;
          }

          // 3. التحقق من عدم وجود السلاح مسبقاً في المنظومة
          if (existingSerials.has(serialKey)) {
            duplicateInSystemCount++;
            return;
          }

          fileSerialsSeen.add(serialKey);
          newWeaponsToImport.push({
            id: Date.now() + idx + Math.random(),
            type: weaponType,
            serialNumber: serialNumber,
            status: status,
            location: location
          });
        });

        // إخراج تقرير مفصل عند وجود أخطاء في الاستيراد
        if (newWeaponsToImport.length === 0) {
          let errorMsg = 'لم يتم استيراد أي أسلحة لأحد الأسباب التالية:\n';
          if (emptyFieldsCount > 0) errorMsg += `• بعض الصفوف تحتوي على بيانات/خانات فارغة.\n`;
          if (duplicateInSystemCount > 0) errorMsg += `• أرقام الأسلحة موجودة بالفعل في المنظومة.\n`;
          if (duplicateInFileCount > 0) errorMsg += `• يوجد تكرار في أرقام الأسلحة داخل نفس الملف.\n`;

          Swal.fire({
            icon: 'warning',
            title: 'تم رفض الاستيراد',
            text: errorMsg,
            confirmButtonText: 'موافق'
          });
          return;
        }

        // إدخال الأسلحة المعتمدة
        if (typeof onImportWeapons === 'function') {
          onImportWeapons(newWeaponsToImport);
        }

        let successNotice = `تم إضافة ${newWeaponsToImport.length} سلاح بنجاح.`;
        if (emptyFieldsCount > 0 || duplicateInSystemCount > 0 || duplicateInFileCount > 0) {
          successNotice += `\n(ملاحظة: تم تخطي ${
            emptyFieldsCount + duplicateInSystemCount + duplicateInFileCount
          } صف بسبب عدم اكتمال البيانات أو التكرار).`;
        }

        Swal.fire({
          icon: 'success',
          title: 'اكتمل الاستيراد بنجاح',
          text: successNotice,
          confirmButtonText: 'حسناً'
        });
      } catch (err) {
        console.error(err);
        Swal.fire('خطأ في معالجة الملف', 'حدث خطأ أثناء قراءة ملف الإكسيل. تأكد من سلامة الملف.', 'error');
      } finally {
        e.target.value = '';
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // 3. تصدير البيانات إلى ملف إكسيل
  const handleExportToExcel = () => {
    // التحقق المرن من وجود بيانات
    if (!Array.isArray(weapons) || weapons.length === 0) {
      Swal.fire('تنبيه', 'لا توجد بيانات أسلحة لتصديرها!', 'info');
      return;
    }

    const titleHeader =
      selectedType && selectedType !== 'الكل' ? selectedType : 'جرد كافة الأسلحة والذخيرة';

    const excelRows = [
      [titleHeader, '', '', ''],
      ['الترتيب', 'رقم السلاح', 'التشغيل', 'الموقع/العهدة']
    ];

    weapons.forEach((weapon, index) => {
      excelRows.push([
        index + 1,
        weapon.serialNumber || weapon.serial_number || 'غير مدخل',
        weapon.status || 'غير محدد',
        weapon.location || 'غير محدد'
      ]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(excelRows);

    worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }];

    worksheet['!cols'] = [{ wch: 12 }, { wch: 25 }, { wch: 18 }, { wch: 25 }];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'الأسلحة');

    const fileName =
      selectedType && selectedType !== 'الكل'
        ? `جدول_${selectedType}.xlsx`
        : `جدول_الأسلحة_${new Date().toISOString().slice(0, 10)}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".xlsx, .xls"
        className="hidden"
      />

      {/* زر تحميل الشيت المرجعي/النموذج فارغ للكتابة */}
      <button
        onClick={handleDownloadTemplate}
        className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition shadow-sm"
        title="تنزيل الشيت المرجعي المنسق للكتابة فيه"
      >
        <span>📄</span>
        <span>تحميل نموذج الشيت</span>
      </button>

      {/* زر استيراد ورفع البيانات من ملف ممتلئ */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition shadow-sm"
        title="استيراد أسلحة مع التحقق المباشر من صحة البيانات"
      >
        <span>📤</span>
        <span>استيراد Excel</span>
      </button>

      {/* زر تصدير الجرد الحالي */}
      <button
        onClick={handleExportToExcel}
        className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition shadow-sm"
        title="تنزيل الجرد الحالي"
      >
        <span>📥</span>
        <span>تصدير Excel</span>
      </button>
    </div>
  );
};

export default ExcelActions;