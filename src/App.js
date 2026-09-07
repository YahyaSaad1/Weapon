import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import FilterBar from './components/FilterBar';
import WeaponTable from './components/WeaponTable';
import AddWeaponTypeForm from './components/AddWeaponTypeForm';
import AddWeaponForm from './components/AddWeaponForm';
import EditWeaponModal from './components/EditWeaponModal';
import Login from './components/Login';

import { statusOptions, initialWeaponTypes } from './data/weaponsData';

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
  // حالة تسجيل الدخول محلياً عبر الـ State و LocalStorage
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  const handleLoginSuccess = (status) => {
    localStorage.setItem('isLoggedIn', 'true');
    setIsLoggedIn(status);
  };

  const [weaponTypes, setWeaponTypes] = useState(() => {
    const savedTypes = localStorage.getItem('weaponTypes');
    return savedTypes ? JSON.parse(savedTypes) : initialWeaponTypes;
  });

  const [weapons, setWeapons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem('weaponTypes', JSON.stringify(weaponTypes));
  }, [weaponTypes]);

  useEffect(() => {
    if (!isLoggedIn) return;

    const unsubscribe = onSnapshot(collection(db, "weapons"), (snapshot) => {
      const weaponsList = snapshot.docs.map(document => ({
        id: document.id,
        ...document.data()
      }));
      setWeapons(weaponsList);
      setLoading(false);
    }, (error) => {
      console.error("خطأ في جلب البيانات من الفايربيس:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isLoggedIn]);

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

  const handleAddType = (typeName) => {
    const newType = { id: Date.now(), name: typeName };
    setWeaponTypes([...weaponTypes, newType]);
  };

  const handleEditType = async (id, newName) => {
    const oldTypeObj = weaponTypes.find(t => t.id === id);
    const oldName = oldTypeObj ? oldTypeObj.name : null;

    setWeaponTypes(prevTypes => 
      prevTypes.map(t => t.id === id ? { ...t, name: newName } : t)
    );

    if (oldName) {
      const matchedWeapons = weapons.filter(w => w.type === oldName);
      try {
        const updatePromises = matchedWeapons.map(w => 
          updateDoc(doc(db, "weapons", w.id), { type: newName })
        );
        await Promise.all(updatePromises);
      } catch (err) {
        console.error("خطأ في تحديث نوع السلاح في الفايربيس:", err);
      }
    }
  };

  const handleDeleteType = (id) => {
    setWeaponTypes(prevTypes => prevTypes.filter(t => t.id !== id));
  };

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

  const handleSaveEdit = async (updatedWeapon) => {
    try {
      const weaponRef = doc(db, "weapons", updatedWeapon.id);
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

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
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

  if (!isLoggedIn) {
    return <Login onLogin={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans" dir="rtl">
      <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} onLogout={handleLogout} />

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
              <div className="relative flex items-center justify-center mb-5">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
              <h3 className="text-slate-800 font-bold text-lg mb-1 tracking-wide">
                جاري تحميل البيانات ...
              </h3>
            </div>
          ) : (
            <>
              {currentTab === 'inventory' && (
                <>
                  <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                    <button 
                    >
                      
                    </button>

                    <button 
                      onClick={handleLogout}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded shadow-md transition-all text-sm flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      تسجيل الخروج
                    </button>
                  </div>

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