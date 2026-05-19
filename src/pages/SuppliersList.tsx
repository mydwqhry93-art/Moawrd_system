import { useState, useEffect } from 'react';
import { Truck, ShieldCheck, Star, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '../utils/supabase'; // مسار سوبابيز
import { useNavigate } from 'react-router-dom';

export default function SuppliersList() {
    const navigate = useNavigate();
    const [suppliers, setSuppliers] = useState<any[]>([]); // حالة تخزين الموردين
    const [loading, setLoading] = useState(true); // حالة التحميل

    // دالة جلب الموردين من الداتابيز
    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'supplier'); // جلب فقط من رتبته "مورد"

            if (error) throw error;
            setSuppliers(data || []);
        } catch (error: any) {
            console.error('Error fetching suppliers:', error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    return (
        <div className="min-h-screen bg-[#050505] p-8 text-slate-200 font-sans" dir="rtl">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <header className="mb-12 flex justify-between items-end">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Truck className="text-red-600 size-8 shadow-glow" />
                            <h1 className="text-4xl font-black text-white italic tracking-tighter">الموردين المعتمدين</h1>
                        </div>
                        <div className="h-[2px] w-48 bg-gradient-to-l from-red-600 to-transparent"></div>
                    </div>
                    <div className="text-left font-mono text-[10px] text-slate-500">
                        SYSTEM_STATUS: <span className="text-emerald-500">{loading ? 'SYNCING...' : 'READY'}</span><br />
                        ACCESS_LEVEL: <span className="text-red-600">MERCHANT_ONLY</span>
                    </div>
                </header>

                {/* حالة التحميل */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="animate-spin text-red-600 size-12 mb-4" />
                        <p className="font-mono text-xs tracking-widest text-slate-500">جارِ جلب سجلات الموردين...</p>
                    </div>
                ) : (
                    /* شبكة الموردين الحقيقية */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                        {suppliers.map((sup, idx) => (
                            <div key={sup.id} className="group relative bg-[#0d0d0d] border border-slate-900 rounded-sm p-6 hover:border-red-600/50 transition-all duration-500 overflow-hidden">

                                <div className="absolute -right-4 -bottom-4 text-slate-900/20 font-black text-8xl italic group-hover:text-red-900/10 transition-colors">
                                    0{idx + 1}
                                </div>

                                <div className="flex items-start gap-6 relative z-10">
                                    <div className="relative">
                                        {/* 📌 مربع الصورة المطور والملحوم برابط سوبابيز الاستراتيجي */}
                                        <div className="relative group/avatar cursor-pointer select-none">
                                            {/* 💡 تصميم الإطار الجديد: حدود سوداء وتأثير ظل نيون خفيف جداً يبرز عند الهوفر */}
                                            <div className="w-24 h-24 bg-black border border-slate-900 rounded-sm overflow-hidden flex items-center justify-center relative z-20 
                                                       group-hover/avatar:border-red-600 group-hover/avatar:shadow-[0_0_15px_rgba(220,38,38,0.3)] transition-all duration-300">
                                                <img
                                                    src={
                                                        sup.avatar_url
                                                            ? `https://npcvgvwiqxpobgpvlvwz.supabase.co/storage/v1/object/public/product-images/${sup.avatar_url}`
                                                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(sup.full_name || 'M')}&background=050505&color=dc2626&size=100&bold=true`
                                                    }
                                                    // 💡 تصميم الصورة: تظهر بألوانها الحقيقية دائماً، ومع الهوفر تتكبر بنسبة بسيطة (105) لتعطي إحساساً بالحركة
                                                    className="w-full h-full object-cover transition-transform duration-300 group-hover/avatar:scale-105"
                                                    alt={sup.full_name || 'Supplier'}
                                                />
                                            </div>

                                            {/* شارة التحقق (تبقى ثابتة فوق الصورة) */}
                                            <div className="absolute -bottom-2 -right-2 bg-red-600 p-1 z-30 rounded-sm">
                                                <ShieldCheck className="size-4 text-white" />
                                            </div>
                                        </div>
                                    
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-red-500 transition-colors">
                                                {sup.full_name || 'مورد غير مسمى'}
                                            </h3>
                                            <div className="flex items-center gap-1 text-yellow-500 bg-yellow-500/5 px-2 py-1 rounded-sm">
                                                <Star className="size-3 fill-current" />
                                                <span className="text-xs font-bold">4.9</span>
                                            </div>
                                        </div>

                                        <p className="text-slate-500 text-sm mb-4">{sup.business_type || 'مورد معتمد'}</p>

                                        <div className="flex items-center gap-6 border-t border-slate-900 pt-4 mt-2">
                                            <div>
                                                <p className="text-[10px] text-slate-600 uppercase font-bold tracking-tighter">معرف المورد</p>
                                                <p className="text-white font-mono text-[10px]">{sup.id.split('-')[0]}</p>
                                            </div>
                                            <button
                                                onClick={() => navigate(`/SupplierProducts/${sup.id}`)} // نرسل الـ ID في الرابط
                                                className="mr-auto flex items-center gap-2 text-xs font-black bg-white text-black px-4 py-2 hover:bg-red-600 hover:text-white transition-all active:scale-95"
                                            >
                                                عرض المنتجات
                                                <ArrowLeft className="size-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* إشعار في حال عدم وجود موردين */}
                {!loading && suppliers.length === 0 && (
                    <div className="text-center py-20 border border-dashed border-slate-800">
                        <p className="text-slate-500 font-mono">NO_SUPPLIERS_FOUND_IN_DATABASE</p>
                    </div>
                )}

                <footer className="mt-16 pt-8 border-t border-slate-900/50 flex justify-center">
                    <p className="text-[10px] text-slate-600 font-mono tracking-[0.5em]">MORID_LOGISTICS_CORE_V2</p>
                </footer>
            </div>
        </div>
    );
}