import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './utils/supabase'; // تأكد من مسار السوبابيز عندك
import { AnimatePresence, motion } from 'framer-motion';

// استيراد المكونات الخاصة بك
import Navbar from './components/Navbar';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import AddProduct from './pages/AddProduct';
import ProductsList from './pages/ProductsList';
import SuppliersList from './pages/SuppliersList';
import SupplierProducts from './pages/SupplierProducts';
import CourierDashboard from './pages/CourierDashboard';
import SupplierOrders from './pages/SupplierOrders';
import Profile from './pages/Profile';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true); // حارس التحميل الأساسي

  useEffect(() => {
    // 1. التحقق من الجلسة عند أول إقلاع للموقع أو عند التحديث (Refresh)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false); // انتهى التحقق بنجاح
    });

    // الاستماع لأي تغيير في حالة تسجيل الدخول/الخروج
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    // 2. مؤقت شاشة الـ Splash Screen الفخمة (ينتهي بعد ثانيتين)
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2200);

    return () => {
      subscription.unsubscribe();
      clearTimeout(splashTimer);
    };
  }, []);

  // 🛑 إذا كان الـ Supabase لا يزال يفحص الجلسة، والـ Splash اختفى، نمنع الشاشة السوداء الفارغة ونعرض مؤشر تحميل فخم متناسق
  if (loading && !showSplash) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white font-mono uppercase tracking-[0.2em]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[10px] text-slate-500">Securing Session...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* شاشة الـ Splash Screen الفخمة */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050505] overflow-hidden"
          >
            {/* الشعار من ملف public */}
            <motion.img
              src="/logo.png"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="w-64 h-auto object-contain"
              alt="Mawrid Logo"
            />

            {/* خط تحميل صغير تحت الشعار */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 200 }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="h-[2px] bg-red-600 mt-6 rounded-full"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* محتوى التطبيق الأساسي - لا يظهر إلا بعد انتهاء الـ Splash */}
      {!showSplash && (
        <>
          {session && <Navbar />}
          <div className="min-h-screen bg-[#050505]">
            <Routes>
                <Route path="/" element={<Login />} />
               <Route path="/signup" element={<SignUp />} />
               <Route path="/Addproduct/:id?" element={<AddProduct />} />
               <Route path="/ProductsList" element={<ProductsList />} />
               <Route path="/SuppliersList" element={<SuppliersList />} />
               <Route path="/SupplierProducts/:id" element={<SupplierProducts />} />
               <Route path="/CourierDashboard" element={<CourierDashboard />} />
               <Route path="/SupplierOrders" element={<SupplierOrders />} />
               <Route path="/profile" element={<Profile />} />
              {/* <Route path="*" element={<Navigate to="/" />} /> */}
            </Routes>
          </div>
        </>
      )}
    </>
  );
}


















// import { Routes, Route, Navigate } from 'react-router-dom';
// import { useState, useEffect } from 'react';
// import { supabase } from './utils/supabase';
// import { motion, AnimatePresence } from 'framer-motion'; // مكتبة الحركات
// import Login from './pages/Login';
// import SignUp from './pages/SignUp';
// import AddProduct from './pages/AddProduct';
// import ProductsList from './pages/ProductsList';
// import SuppliersList from './pages/SuppliersList';
// import SupplierProducts from './pages/SupplierProducts';
// import CourierDashboard from './pages/CourierDashboard';
// import SupplierOrders from './pages/SupplierOrders';
// import Profile from './pages/Profile';
// import Navbar from './components/Navbar';

// function App() {
//   const [session, setSession] = useState<any>(null);
//   const [showSplash, setShowSplash] = useState(true); // حالة شاشة الترحيب

//   useEffect(() => {
//     // 1. التحقق من الجلسة عند فتح التطبيق
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       setSession(session);
//     });

//     const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
//       setSession(session);
//     });

//     // 2. إخفاء شاشة الترحيب بعد 3 ثواني
//     const timer = setTimeout(() => {
//       setShowSplash(false);
//     }, 3000);

//     return () => {
//       subscription.unsubscribe();
//       clearTimeout(timer);
//     };
//   }, []);

//   return (
//     <>
//       <AnimatePresence>
//         {showSplash && (
//           <motion.div
//             initial={{ opacity: 1 }}
//             exit={{ opacity: 0, scale: 1.1 }} // حركة خروج فخمة
//             transition={{ duration: 0.8 }}
           
//             className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050505] overflow-hidden"
//           >
//             {/* الشعار من ملف public */}
//             <motion.img
//               src="/logo.png"
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 1, delay: 0.5 }}
//               className="w-64 h-auto object-contain"
//               alt="Mawrid Logo"
//             />

//             {/* خط تحميل صغير تحت الشعار */}
//             <motion.div
//               initial={{ width: 0 }}
//               animate={{ width: 200 }}
//               transition={{ duration: 2, ease: "easeInOut" }}
//               className="h-[2px] bg-red-600 mt-6 rounded-full"
//             />
//           </motion.div>
//         )}
//       </AnimatePresence >

//       {!showSplash && (
//         <>
//           {session && <Navbar />}
//           <div className="min-h-screen bg-[#050505]">
//             <Routes>
//               <Route path="/" element={<Login />} />
//               <Route path="/signup" element={<SignUp />} />
//               <Route path="/Addproduct/:id?" element={<AddProduct />} />
//               <Route path="/ProductsList" element={<ProductsList />} />
//               <Route path="/SuppliersList" element={<SuppliersList />} />
//               <Route path="/SupplierProducts/:id" element={<SupplierProducts />} />
//               <Route path="/CourierDashboard" element={<CourierDashboard />} />
//               <Route path="/SupplierOrders" element={<SupplierOrders />} />
//               <Route path="/profile" element={<Profile />} />
//               {/* <Route path="*" element={<Navigate to="/" />} /> */}
//             </Routes>
//           </div>
//         </>
//       )
//       }





      
//     </>
//   );


// }

// export default App;