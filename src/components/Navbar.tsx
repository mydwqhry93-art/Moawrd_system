import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Bell, Loader2, Package, Sun, Moon, Users } from 'lucide-react';
import { supabase } from '../utils/supabase';
import Swal from 'sweetalert2';

export default function Navbar() {
    const [isLight, setIsLight] = useState(false);
    const navigate = useNavigate();
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // 💡 1. جلب بيانات المستخدم وإلغاء حالة التحميل فوراً لمنع التعليق
    useEffect(() => {
        const fetchUserNavbarData = async () => {
            try {
                setLoading(true);
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    // جلب اسم وبروفايل المستخدم من جدول الـ profiles
                    const { data: profileData, error } = await supabase
                        .from('profiles')
                        .select('full_name, role, avatar_url')
                        .eq('id', user.id)
                        .single();

                    if (!error && profileData) {
                        setUserData(profileData);
                    } else {
                        // إذا لم يوجد بروفايل، نضع قيم افتراضية آمنة من اليوزر
                        setUserData({ full_name: user.email?.split('@')[0], role: 'supplier' });
                    }
                }
            } catch (error) {
                console.error("خطأ في جلب بيانات الـ Navbar:", error);
            } finally {
                // 🔐 قفل أيقونة التحميل نهائياً سواء نجح الاتصال أو فشل
                setLoading(false);
            }
        };

        fetchUserNavbarData();
    }, []);

    // 💡 2. مراقبة وضع النهار والليل المخصص لـ Tailwind v4
    useEffect(() => {
        const root = window.document.documentElement;
        if (isLight) {
            root.classList.add('light'); // تفعيل وضع النهار
        } else {
            root.classList.remove('light'); // العودة للوضع الليلي الافتراضي
        }
    }, [isLight]);

    // 3. دالة تسجيل الخروج
    const handleLogout = async () => {
        const result = await Swal.fire({
            title: 'تسجيل الخروج؟',
            text: "هل أنت متأكد أنك تريد مغادرة النظام؟",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#1e293b',
            confirmButtonText: 'خروج',
            cancelButtonText: 'إلغاء',
            background: '#0d0d0d',
            color: '#fff'
        });

        if (result.isConfirmed) {
            await supabase.auth.signOut();
            setUserData(null);
            navigate('/login');
        }
    };

    return (
        <nav className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-md border-b border-slate-900/60 px-6 py-3.5" dir="rtl">
            <div className="max-w-7xl mx-auto flex justify-between items-center">

                {/* 📌 الجزء الأيمن: الشعار والاسم الهوائي المطور */}
                <div
                    className="flex items-center gap-3 cursor-pointer group select-none"
                    
                >
                    <div className="p-2 bg-red-950/20 border border-red-600/20 rounded-sm shadow-[0_0_15px_rgba(220,38,38,0.1)] group-hover:border-red-600/50 transition-all duration-300">
                        <img src='/logo.png' className="size-6 object-contain" alt="Logo" />
                    </div>
                    <span className="text-lg font-black tracking-wider text-white italic group-hover:text-red-500 transition-colors">
                        MOURID <span className="text-red-600 text-[9px] not-italic font-mono font-medium bg-red-600/10 px-1.5 py-0.5 rounded-sm ml-1">v1.0</span>
                    </span>
                </div>

                {/* 📌 الجزء الأوسط والأيسر: أدوات التحكم */}
                <div className="flex items-center gap-4">

                    {/* 💡 زر تبديل الوضع (ليلي / نهار) */}
                    <button
                        onClick={() => setIsLight(!isLight)}
                        className="p-2.5 bg-slate-900 border border-slate-800 rounded-sm text-slate-400 hover:text-white hover:border-red-600 transition-all active:scale-95 cursor-pointer"
                        title={isLight ? "تفعيل الوضع الليلي" : "تفعيل وضع النهار"}
                    >
                        {isLight ? (
                            <Moon size={20} className="text-yellow-500" />
                        ) : (
                            <Sun size={20} className="text-red-500" />
                        )}
                    </button>

                    {/* زر العودة للموردين */}
                    <button
                        onClick={() => navigate('/SuppliersList')}
                        className="flex items-center gap-1.5 border border-slate-800 text-slate-300 px-4 py-2 rounded-sm text-[11px] font-bold hover:bg-white hover:text-black hover:border-white transition-all uppercase tracking-wider cursor-pointer"
                    >
                        <Users size={14} />
                        قائمة الموردين
                    </button>

                    {/* زر طلبات المورد الحركي المشروط */}
                    {!loading && userData?.role === 'supplier' && (
                        <button
                            onClick={() => navigate('/SupplierOrders')}
                            className="flex items-center gap-1.5 bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-sm text-[11px] font-black transition-all uppercase tracking-wider shadow-[0_0_15px_rgba(220,38,38,0.2)] group cursor-pointer"
                        >
                            <Package size={14} className="group-hover:animate-bounce" />
                            <span>الطلبات الواردة</span>
                        </button>
                    )}

                    {/* خط فاصل أنيق */}
                    <div className="w-[1px] h-5 bg-slate-900 hidden sm:block" />

                    {/* التنبيهات */}
                    <button className="text-slate-400 hover:text-white transition-colors relative p-1 cursor-pointer">
                        <Bell size={18} />
                        <span className="absolute top-1 left-1 w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
                    </button>

                    {/* حاوية الملف الشخصي وتسجيل الخروج متوافقة تماماً مع وضع النهار والليل */}
                    <div className="flex items-center gap-4">

                        {loading ? (
                            // 💡 يظهر فقط أثناء جلب البيانات الحقيقي ثم يختفي تلقائياً
                            <Loader2 size={16} className="animate-spin text-red-600" />
                        ) : (
                            <>
                                <button
                                    onClick={() => navigate('/profile')}
                                    className="flex items-center gap-2.5 group text-right cursor-pointer"
                                >
                                    <div className="hidden md:flex flex-col justify-center leading-none">
                                        <span className="text-xs font-bold text-slate-200 group-hover:text-red-500 transition-colors">
                                            {userData?.full_name || 'مستخدم جديد'}
                                        </span>
                                        <span className="text-[10px] text-slate-500 font-sans mt-1">
                                            {userData?.role === 'supplier' ? 'مورد' : userData?.role === 'retailer' ? 'تاجر' : 'مندوب توصيل'}
                                        </span>
                                    </div>

                                    {/* حقل الصورة الشخصية المستمع للتحديث الفوري */}
                                    <div className="w-8 h-8 rounded-full border border-slate-700/60 p-0.5 group-hover:border-red-600 transition-all overflow-hidden bg-transparent flex items-center justify-center">
                                        <img
                                            src={
                                                userData?.avatar_url
                                                    ? `https://npcvgvwiqxpobgpvlvwz.supabase.co/storage/v1/object/public/product-images/${userData.avatar_url}`
                                                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.full_name || 'M')}&background=dc2626&color=fff&size=40&bold=true`
                                            }
                                            className="w-full h-full rounded-full object-cover"
                                            alt="User Avatar"
                                        />
                                    </div>
                                </button>

                                {/* زر تسجيل الخروج يظهر فقط إذا كان اليوزر مسجل دخول */}
                                <button
                                    onClick={handleLogout}
                                    className="text-slate-500 hover:text-red-500 p-1.5 transition-colors cursor-pointer"
                                    title="تسجيل الخروج"
                                >
                                    <LogOut size={18} />
                                </button>
                            </>
                        )}

                    </div>

                </div>
            </div>
        </nav>
    );
}