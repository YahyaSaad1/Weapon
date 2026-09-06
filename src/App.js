import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import FilterBar from './components/FilterBar';
import WeaponTable from './components/WeaponTable';
import AddWeaponTypeForm from './components/AddWeaponTypeForm';
import AddWeaponForm from './components/AddWeaponForm';
import EditWeaponModal from './components/EditWeaponModal';
import { uploadInitialData } from './uploadData';

import { statusOptions, initialWeaponTypes } from './data/weaponsData';

// استيراد الفايربيس والدوال الخاصة بـ Firestore
import { db } from './firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';

function App() {
  // 1. أنواع الأسلحة (يمكن تركها في LocalStorage أو نقلها للفايربيس لاحقاً)
  const [weaponTypes, setWeaponTypes] = useState(() => {
    const savedTypes = localStorage.getItem('weaponTypes');
    return savedTypes ? JSON.parse(savedTypes) : initialWeaponTypes;
  });

  // 2. قائمة الأسلحة - تُجلب الآن أونلاين من Firestore
  const [weapons, setWeapons] = useState([]);
  const [loading, setLoading] = useState(true);

  // 3. مزامنة التغيرات في أنواع الأسلحة إلى LocalStorage
  useEffect(() => {
    localStorage.setItem('weaponTypes', JSON.stringify(weaponTypes));
  }, [weaponTypes]);

  // 4. جلب بيانات الأسلحة من Firestore لحظياً (Real-time listener)
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "weapons"), (snapshot) => {
      const weaponsList = snapshot.docs.map(document => ({
        id: document.id, // استخدام الـ Document ID المولد تلقائياً من الفايربيس
        ...document.data()
      }));
      setWeapons(weaponsList);
      setLoading(false);
    }, (error) => {
      console.error("خطأ في جلب البيانات من الفايربيس:", error);
      setLoading(false);
    });

    // تنظيف الـ Listener عند إغلاق المكون
    return () => unsubscribe();
  }, []);

  const [currentTab, setCurrentTab] = useState('inventory');
  const [selectedType, setSelectedType] = useState('الكل');
  const [selectedStatus, setSelectedStatus] = useState('الكل');
  const [selectedLocation, setSelectedLocation] = useState('الكل');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('id-asc');

  const [editingWeapon, setEditingWeapon] = useState(null);
  const [selectedWeaponId, setSelectedWeaponId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const locationOptions = useMemo(() => {
    const locations = weapons.map(w => w.location || 'غير محدد');
    return [...new Set(locations)];
  }, [weapons]);

  // إضافة نوع جديد
  const handleAddType = (typeName) => {
    const newType = { id: Date.now(), name: typeName };
    setWeaponTypes([...weaponTypes, newType]);
  };

  // تعديل نوع سلاح موجود
  const handleEditType = (id, newName) => {
    const oldTypeObj = weaponTypes.find(t => t.id === id);
    const oldName = oldTypeObj ? oldTypeObj.name : null;

    setWeaponTypes(prevTypes => 
      prevTypes.map(t => t.id === id ? { ...t, name: newName } : t)
    );

    if (oldName) {
      // تحديث نوع السلاح في الفايربيس لكل الأسلحة المرتبطة بهذا الطراز
      weapons.forEach(async (w) => {
        if (w.type === oldName) {
          try {
            const weaponRef = doc(db, "weapons", w.id);
            await updateDoc(weaponRef, { type: newName });
          } catch (err) {
            console.error("خطأ في تحديث نوع السلاح:", err);
          }
        }
      });
    }
  };

  // حذف نوع سلاح
  const handleDeleteType = (id) => {
    setWeaponTypes(prevTypes => prevTypes.filter(t => t.id !== id));
  };

  // إضافة سلاح جديد إلى Firestore
  const handleAddWeapon = async (newWeaponData) => {
    try {
      await addDoc(collection(db, "weapons"), {
        ...newWeaponData,
        createdAt: Date.now()
      });
      setCurrentTab('inventory');
    } catch (error) {
      console.error("خطأ في إضافة السلاح للفايربيس:", error);
    }
  };

  // حذف سلاح من Firestore
  const handleDeleteWeapon = async (id) => {
    try {
      await deleteDoc(doc(db, "weapons", id));
      if (selectedWeaponId === id) {
        setSelectedWeaponId(null);
      }
    } catch (error) {
      console.error("خطأ في حذف السلاح:", error);
    }
  };

  // حفظ تعديل السلاح في Firestore
  const handleSaveEdit = async (updatedWeapon) => {
    try {
      const weaponRef = doc(db, "weapons", updatedWeapon.id);
      // نستثني الـ id من كائن البيانات المرسلة للتحديث
      const { id, ...dataToUpdate } = updatedWeapon; 
      await updateDoc(weaponRef, dataToUpdate);
      setEditingWeapon(null);
    } catch (error) {
      console.error("خطأ في تعديل السلاح:", error);
    }
  };

  const handleSelectWeapon = (id) => {
    setSelectedWeaponId(prevId => prevId === id ? null : id);
  };

  const filteredWeapons = useMemo(() => {
    return weapons
      .filter(weapon => {
        const matchesType = selectedType === 'الكل' || weapon.type === selectedType;
        const matchesStatus = selectedStatus === 'الكل' || weapon.status === selectedStatus;
        const matchesLocation = selectedLocation === 'الكل' || (weapon.location || 'غير محدد') === selectedLocation;

        const term = searchTerm.trim().toLowerCase();
        const matchesSearch = !term || 
          (weapon.serialNumber && weapon.serialNumber.toLowerCase().includes(term)) ||
          (weapon.type && weapon.type.toLowerCase().includes(term)) ||
          (weapon.status && weapon.status.toLowerCase().includes(term)) ||
          (weapon.location && weapon.location.toLowerCase().includes(term));

        return matchesType && matchesStatus && matchesLocation && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'serial-asc') return (a.serialNumber || '').localeCompare(b.serialNumber || '', undefined, { numeric: true });
        if (sortBy === 'serial-desc') return (b.serialNumber || '').localeCompare(a.serialNumber || '', undefined, { numeric: true });
        if (sortBy === 'type') return (a.type || '').localeCompare(b.type || '');
        if (sortBy === 'status') return (a.status || '').localeCompare(b.status || '');
        if (sortBy === 'location') return (a.location || '').localeCompare(b.location || '');
        return (b.createdAt || 0) - (a.createdAt || 0);
      });
  }, [weapons, selectedType, selectedStatus, selectedLocation, searchTerm, sortBy]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans" dir="rtl">
      <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex flex-1 relative items-start">
        <Sidebar 
          weaponTypes={weaponTypes} 
          selectedType={selectedType} 
          setSelectedType={setSelectedType} 
          currentTab={currentTab} 
          setCurrentTab={setCurrentTab}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        
        <main className="flex-1 p-3 sm:p-6 max-w-full overflow-hidden">
          {loading ? (
            <div className="flex flex-col justify-center items-center h-[70vh] w-full text-center">
              
              {/* حلقة التحميل مع تأثير النبض */}
              <div className="relative flex items-center justify-center mb-5">
                {/* الحلقة الخارجية */}
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                
                {/* الحلقة الداخلية بالاتجاه المعاكس */}
                <div className="absolute w-10 h-10 border-4 border-emerald-200 border-b-emerald-500 rounded-full animate-spin [animation-duration:1.2s] [animation-direction:reverse]"></div>
                
                {/* أيقونة شارة الحماية في المنتصف */}
                <div className="absolute inset-0 flex items-center justify-center text-blue-600 animate-pulse">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>

              {/* العنوان والنص */}
              <h3 className="text-slate-800 font-bold text-lg mb-1 tracking-wide">
                جاري تحميل البيانات ...

              </h3>
              {/* <p className="text-slate-500 text-xs font-medium mb-3 animate-pulse">
                جاري مزامنة وجلب البيانات من السيرفر...
              </p> */}

              {/* نقاط الانتظار المتحركة */}
              <div className="flex space-x-1.5 space-x-reverse">
                <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></span>
              </div>

            </div>
          ) : (
            <>
              {currentTab === 'inventory' && (
                <>
                  <button 
                    onClick={uploadInitialData}
                    className="mb-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded shadow-md"
                  >
                    🚀 رفع البيانات الأولية للفايربيس (مرة واحدة)
                  </button>
                  <FilterBar 
                    searchTerm={searchTerm} 
                    setSearchTerm={setSearchTerm} 
                    selectedStatus={selectedStatus} 
                    setSelectedStatus={setSelectedStatus} 
                    selectedLocation={selectedLocation}
                    setSelectedLocation={setSelectedLocation}
                    locationOptions={locationOptions}
                    sortBy={sortBy} 
                    setSortBy={setSortBy} 
                    statusOptions={statusOptions} 
                    totalCount={weapons.length}
                    filteredCount={filteredWeapons.length}
                  />
                  <WeaponTable 
                    weapons={filteredWeapons} 
                    onDelete={handleDeleteWeapon} 
                    onEdit={(weapon) => setEditingWeapon(weapon)}
                    selectedWeaponId={selectedWeaponId}
                    onSelectWeapon={handleSelectWeapon}
                  />
                </>
              )}

              {currentTab === 'addWeapon' && (
                <AddWeaponForm 
                  weaponTypes={weaponTypes} 
                  statusOptions={statusOptions} 
                  onAddWeapon={handleAddWeapon} 
                  weapons={weapons}
                />
              )}

              {currentTab === 'addType' && (
                <AddWeaponTypeForm 
                  onAddType={handleAddType} 
                  onEditType={handleEditType}
                  onDeleteType={handleDeleteType}
                  weaponTypes={weaponTypes} 
                  weapons={weapons}
                />
              )}
            </>
          )}
        </main>
      </div>

      {editingWeapon && (
        <EditWeaponModal 
          weapon={editingWeapon}
          weaponTypes={weaponTypes}
          statusOptions={statusOptions}
          onSave={handleSaveEdit}
          onClose={() => setEditingWeapon(null)}
          weapons={weapons}
        />
      )}
    </div>
  );
}

export default App;