import { db } from './firebase';
import { writeBatch, doc, collection, getDocs } from 'firebase/firestore';
import { initialWeaponsList } from './data/weaponsData';
import Swal from 'sweetalert2';

// -------------------------------------------------------------
// 1. دالة رفع البيانات الأولية (مع التحقق)
// -------------------------------------------------------------
export const uploadInitialData = async () => {
  try {
    const weaponsCollectionRef = collection(db, "weapons");

    // التحقق مما إذا كانت البيانات موجودة بالفعل
    const snapshot = await getDocs(weaponsCollectionRef);
    
    if (!snapshot.empty) {
      Swal.fire({
        icon: 'warning',
        title: 'البيانات موجودة بالفعل!',
        text: 'تحتوي قاعدة البيانات على أسلحة مسجلة مسبقاً، ولا حاجة لإعادة الرفع.',
        confirmButtonText: 'حسناً',
        confirmButtonColor: '#059669',
      });
      return;
    }

    // إظهار تنبيه جاري الرفع
    Swal.fire({
      title: 'جاري رفع البيانات...',
      text: 'يرجى الانتظار لحين رفع البيانات إلى الفايربيس',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const batch = writeBatch(db);

    initialWeaponsList.forEach((weapon) => {
      const docRef = doc(weaponsCollectionRef);
      
      batch.set(docRef, {
        serialNumber: weapon.serialNumber,
        type: weapon.type,
        status: weapon.status,
        location: weapon.location || "غير محدد",
        createdAt: Date.now()
      });
    });

    await batch.commit();

    Swal.fire({
      icon: 'success',
      title: 'تم الرفع بنجاح! 🚀',
      text: `تم رفع جميع الأسلحة الـ ${initialWeaponsList.length} إلى الفايربيس بنجاح.`,
      confirmButtonText: 'رائع!',
      confirmButtonColor: '#059669'
    });

  } catch (error) {
    console.error("خطأ أثناء رفع البيانات:", error);
    Swal.fire({
      icon: 'error',
      title: 'حدث خطأ!',
      text: 'عذراً، حدث خطأ أثناء رفع البيانات.',
      confirmButtonText: 'موافق',
      confirmButtonColor: '#dc2626'
    });
  }
};

// -------------------------------------------------------------
// 2. دالة حذف جميع البيانات الموجودة في الفايربيس
// -------------------------------------------------------------
export const deleteAllData = async () => {
  // رسالة تأكيد تحذيرية قبل الحذف
  const result = await Swal.fire({
    title: 'هل أنت تأكد من الحذف؟',
    text: 'سيؤدي هذا إلى مسح جميع الأسلحة المسجلة في الفايربيس نهائياً!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc2626', // أحمر تحذيري
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'نعم، احذف الكل!',
    cancelButtonText: 'إلغاء'
  });

  // إذا وافق المستخدم على الحذف
  if (result.isConfirmed) {
    try {
      Swal.fire({
        title: 'جاري حذف كافة البيانات...',
        text: 'يرجى الانتظار لحين إتمام العملية',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const weaponsCollectionRef = collection(db, "weapons");
      const snapshot = await getDocs(weaponsCollectionRef);

      if (snapshot.empty) {
        Swal.fire({
          icon: 'info',
          title: 'لا توجد بيانات!',
          text: 'قاعدة البيانات فارغة بالفعل.',
          confirmButtonText: 'حسناً',
          confirmButtonColor: '#2563eb'
        });
        return;
      }

      // إضافة جميع عمليات الحذف في Batch
      const batch = writeBatch(db);
      snapshot.docs.forEach((docSnapshot) => {
        batch.delete(docSnapshot.ref);
      });

      // تنفيذ عملية الحذف دفعة واحدة
      await batch.commit();

      Swal.fire({
        icon: 'success',
        title: 'تم الحذف بنجاح!',
        text: 'تمت إزالة كافة البيانات من الفايربيس.',
        confirmButtonText: 'موافق',
        confirmButtonColor: '#059669'
      });

    } catch (error) {
      console.error("خطأ أثناء حذف البيانات:", error);
      Swal.fire({
        icon: 'error',
        title: 'حدث خطأ!',
        text: 'عذراً، حدث خطأ أثناء محاولة حذف البيانات.',
        confirmButtonText: 'موافق',
        confirmButtonColor: '#dc2626'
      });
    }
  }
};