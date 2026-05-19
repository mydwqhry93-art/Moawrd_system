// import { useState } from 'react';
// import { MapPin, PackageCheck, Phone, Navigation, Clock, CheckCircle2 } from 'lucide-react';
// import Swal from 'sweetalert2';

// export default function CourierDashboard() {
//     // بيانات وهمية لطلبات بانتظار التوصيل
//     const [deliveries, setDeliveries] = useState([
//         { 
//             id: 'ORD-9921', 
//             merchant: "متجر الوفاء", 
//             supplier: "مؤسسة القحري", 
//             address: "حي حده - صنعاء", 
//             items: 12, 
//             status: 'pending_pickup',
//             distance: '3.2 km'
//         },
//         { 
//             id: 'ORD-8840', 
//             merchant: "بقالة النور", 
//             supplier: "المركز التقني", 
//             address: "شارع تعز - صنعاء", 
//             items: 5, 
//             status: 'on_the_way',
//             distance: '1.5 km'
//         }
//     ]);

//     const handleUpdateStatus = (id: string, currentStatus: string) => {
//         const nextStatus = currentStatus === 'pending_pickup' ? 'تم الاستلام' : 'تم التوصيل بنجاح';
        
//         Swal.fire({
//             title: 'تحديث الحالة؟',
//             text: `هل تريد تغيير حالة الطلب إلى: ${nextStatus}`,
//             icon: 'info',
//             showCancelButton: true,
//             confirmButtonText: 'نعم، حدث',
//             background: '#0d0d0d',
//             color: '#fff',
//             confirmButtonColor: '#dc2626'
//         }).then((result) => {
//             if (result.isConfirmed) {
//                 Swal.fire('تم التحديث!', 'تم إشعار التاجر والمورد بالحالة الجديدة', 'success');
//             }
//         });
//     };

//     return (
//         <div className="min-h-screen bg-[#050505] p-6 text-slate-200" dir="rtl">
//             <div className="max-w-4xl mx-auto">
                
//                 {/* Header المندوب */}
//                 <header className="mb-10 flex justify-between items-center border-b border-slate-900 pb-6">
//                     <div>
//                         <h1 className="text-3xl font-black text-white italic">لوحة المندوب</h1>
//                         <p className="text-red-600 font-mono text-xs tracking-widest">AGENT_ID: COURIER_77</p>
//                     </div>
//                     <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full flex items-center gap-2">
//                         <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
//                         <span className="text-emerald-500 text-xs font-bold uppercase">متصل الآن</span>
//                     </div>
//                 </header>

//                 {/* قائمة المهمات */}
//                 <div className="space-y-6">
//                     <h2 className="text-lg font-bold flex items-center gap-2 text-slate-400 mb-4">
//                         <Clock size={20} className="text-red-600" />
//                         المهمات الحالية
//                     </h2>

//                     {deliveries.map((delivery) => (
//                         <div key={delivery.id} className="bg-[#0d0d0d] border border-slate-800 rounded-sm overflow-hidden group">
//                             <div className="p-6">
//                                 <div className="flex justify-between items-start mb-6">
//                                     <div>
//                                         <span className="text-[10px] bg-slate-900 text-slate-500 px-2 py-1 font-mono mb-2 inline-block">#{delivery.id}</span>
//                                         <h3 className="text-xl font-bold text-white uppercase italic">{delivery.merchant}</h3>
//                                     </div>
//                                     <div className="text-left">
//                                         <p className="text-red-600 font-black text-sm">{delivery.distance}</p>
//                                         <p className="text-[10px] text-slate-600 italic font-mono uppercase">Estimated Dist.</p>
//                                     </div>
//                                 </div>

//                                 {/* تفاصيل المسار */}
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
//                                     <div className="flex items-start gap-3 bg-black/40 p-3 border border-slate-900">
//                                         <MapPin className="text-slate-500 mt-1" size={18} />
//                                         <div>
//                                             <p className="text-[10px] text-slate-600 uppercase font-bold">من (المورد):</p>
//                                             <p className="text-sm text-slate-300">{delivery.supplier}</p>
//                                         </div>
//                                     </div>
//                                     <div className="flex items-start gap-3 bg-black/40 p-3 border border-slate-900">
//                                         <Navigation className="text-red-600 mt-1" size={18} />
//                                         <div>
//                                             <p className="text-[10px] text-slate-600 uppercase font-bold">إلى (التاجر):</p>
//                                             <p className="text-sm text-slate-300">{delivery.address}</p>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* أزرار التحكم */}
//                                 <div className="flex flex-col md:flex-row gap-3">
//                                     <button className="flex-1 bg-white text-black py-3 font-black text-xs uppercase flex items-center justify-center gap-2 hover:bg-slate-200 transition-all">
//                                         <Phone size={14} /> اتصال بالتاجر
//                                     </button>
//                                     <button 
//                                         onClick={() => handleUpdateStatus(delivery.id, delivery.status)}
//                                         className="flex-1 bg-red-600 text-white py-3 font-black text-xs uppercase flex items-center justify-center gap-2 hover:bg-red-700 transition-all shadow-lg shadow-red-900/20"
//                                     >
//                                         <PackageCheck size={14} />
//                                         {delivery.status === 'pending_pickup' ? 'تأكيد استلام الشحنة' : 'تأكيد إتمام التوصيل'}
//                                     </button>
//                                 </div>
//                             </div>
                            
//                             {/* بار الحالة في الأسفل */}
//                             <div className="bg-slate-900/30 px-6 py-2 border-t border-slate-800 flex items-center gap-2">
//                                 <CheckCircle2 size={12} className={delivery.status === 'on_the_way' ? 'text-blue-500' : 'text-yellow-500'} />
//                                 <span className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em]">
//                                     Status: {delivery.status.replace('_', ' ')}
//                                 </span>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         </div>
//     );
// }



import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { MapPin, PackageCheck, Phone, Navigation, Clock, CheckCircle2, LogOut } from 'lucide-react';
import Swal from 'sweetalert2';

export default function CourierDashboard() {
    const [deliveries, setDeliveries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [driverId, setDriverId] = useState<string>('');
    const navigate = useNavigate();

    useEffect(() => {
        checkDriverAndFetchOrders();
    }, []);

    const checkDriverAndFetchOrders = async () => {
        try {
            // 1. جلب بيانات المندوب المسجل حالياً
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { navigate('/login'); return; }

            // 2. التحقق من صلاحية الحساب للتأكد أنه مندوب (delivery)
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (profile?.role !== 'delivery') {
                Swal.fire({ title: 'وصول ممنوع', text: 'هذه اللوحة مخصصة للمناديب فقط!', icon: 'error', background: '#0d0d0d', color: '#fff' });
                navigate('/');
                return;
            }

            setDriverId(user.id);
            // 3. جلب طلبات المندوب الحقيقية
            await fetchActiveDeliveries(user.id);
        } catch (error) {
            console.error("Error initializing courier dashboard:", error);
            setLoading(false);
        }
    };

    // جلب الطلبات النشطة الموجهة لهذا المندوب (المعينة له أو المستلمة وقيد التوصيل)
    const fetchActiveDeliveries = async (currentDriverId: string) => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    id, total_price, status, created_at, latitude, longitude, address_note, supplier_id,
                    profiles!retailer_id ( full_name ),
                    supplier_profile:profiles!supplier_id ( full_name )
                `)
                .eq('driver_id', currentDriverId) // فلترة بالـ ID الخاص بالمندوب الحالي
                .in('status', ['assigned', 'picked_up']) // عرض الحالات النشطة فقط
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) setDeliveries(data);
        } catch (err: any) {
            console.error("Error fetching active deliveries:", err.message);
        } finally {
            setLoading(false);
        }
    };

    // تحديث حالة الطلب حركياً في قاعدة البيانات
    const handleUpdateStatus = (id: string, currentStatus: string) => {
        const nextStatus = currentStatus === 'assigned' ? 'picked_up' : 'completed';
        const statusText = nextStatus === 'picked_up' ? 'تم استلام الشحنة من المورد' : 'تم التوصيل والتحصيل بنجاح';
        
        Swal.fire({
            title: 'تحديث حالة الشحنة؟',
            text: `هل تريد تغيير حالة الطلب إلى: ${nextStatus === 'picked_up' ? 'قيد التوصيل' : 'مكتمل'}؟`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'نعم، حدّث الآن',
            cancelButtonText: 'إلغاء',
            background: '#0d0d0d',
            color: '#fff',
            confirmButtonColor: '#dc2626'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const { error } = await supabase
                        .from('orders')
                        .update({ status: nextStatus })
                        .eq('id', id);

                    if (error) throw error;

                    Swal.fire({
                        title: 'تم التحديث!',
                        text: statusText,
                        icon: 'success',
                        background: '#0d0d0d',
                        color: '#fff',
                        confirmButtonColor: '#dc2626'
                    });

                    // إعادة تحميل البيانات بعد التحديث الناجح
                    fetchActiveDeliveries(driverId);
                } catch (err: any) {
                    Swal.fire('خطأ', err.message, 'error');
                }
            }
        });
    };

    if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white font-mono uppercase tracking-[0.3em]">Loading Courier System...</div>;

    return (
        <div className="min-h-screen bg-[#050505] p-6 text-slate-200" dir="rtl">
            <div className="max-w-4xl mx-auto">
                
                {/* Header المندوب */}
                <header className="mb-10 flex justify-between items-center border-b border-slate-900 pb-6">
                    <div>
                        <h1 className="text-3xl font-black text-white italic">لوحة المندوب</h1>
                        <p className="text-red-600 font-mono text-xs tracking-widest uppercase">Agent ID: {driverId.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span className="text-emerald-500 text-xs font-bold uppercase">متصل الآن</span>
                        </div>
                        <button 
                            onClick={async () => { await supabase.auth.signOut(); navigate('/login'); }}
                            className="p-2 bg-white/5 border border-slate-800 text-slate-400 hover:text-red-500 hover:border-red-500/30 transition-all rounded-sm"
                            title="تسجيل الخروج"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </header>

                {/* قائمة المهمات */}
                <div className="space-y-6">
                    <h2 className="text-lg font-bold flex items-center gap-2 text-slate-400 mb-4">
                        <Clock size={20} className="text-red-600" />
                        المهمات الحالية الموجهة لك
                    </h2>

                    {deliveries.length === 0 ? (
                        <div className="text-center py-20 text-slate-600 font-mono text-sm uppercase tracking-wider border border-dashed border-slate-900 rounded-sm">
                            No active deliveries / لا توجد طلبات معينة لك حالياً
                        </div>
                    ) : (
                        deliveries.map((delivery) => (
                            <div key={delivery.id} className="bg-[#0d0d0d] border border-slate-800 rounded-sm overflow-hidden group">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <span className="text-[10px] bg-slate-900 text-slate-500 px-2 py-1 font-mono mb-2 inline-block">#{delivery.id.slice(0, 8).toUpperCase()}</span>
                                            <h3 className="text-xl font-bold text-white uppercase italic">{delivery.profiles?.full_name || 'تاجر غير مسجل'}</h3>
                                        </div>
                                        <div className="text-left">
                                            <p className="text-red-600 font-black text-lg font-mono">{delivery.total_price} <span className="text-xs font-normal text-slate-500">ريال</span></p>
                                            <p className="text-[10px] text-slate-600 italic font-mono uppercase">المبلغ المطلوب تحصيله</p>
                                        </div>
                                    </div>

                                    {/* تفاصيل المسار الحركية */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <div className="flex items-start gap-3 bg-black/40 p-3 border border-slate-900">
                                            <MapPin className="text-slate-500 mt-1" size={18} />
                                            <div>
                                                <p className="text-[10px] text-slate-600 uppercase font-bold">من (المورد):</p>
                                                <p className="text-sm text-slate-300">{delivery.supplier_profile?.full_name || 'مؤسسة القحري'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 bg-black/40 p-3 border border-slate-900">
                                            <Navigation className="text-red-600 mt-1" size={18} />
                                            <div>
                                                <p className="text-[10px] text-slate-600 uppercase font-bold">إلى (عنوان التاجر المكتوب):</p>
                                                <p className="text-sm text-slate-300">{delivery.address_note || 'لم يتم كتابة وصف دقيق للعنوان'}</p>
                                                {delivery.latitude && (
                                                    <button 
                                                        onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${delivery.latitude},${delivery.longitude}`, '_blank')}
                                                        className="text-[9px] font-black text-red-500 hover:underline mt-1 block"
                                                    >
                                                        فتح الموقع الخريطة 🌍 ←
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* أزرار التحكم */}
                                    <div className="flex flex-col md:flex-row gap-3">
                                        <button className="flex-1 bg-white/5 border border-slate-800 text-slate-300 py-3 font-black text-xs uppercase flex items-center justify-center gap-2 hover:bg-white hover:text-black transition-all">
                                            <Phone size={14} /> اتصال بالتاجر المستلم
                                        </button>
                                        <button 
                                            onClick={() => handleUpdateStatus(delivery.id, delivery.status)}
                                            className={`flex-1 py-3 font-black text-xs uppercase flex items-center justify-center gap-2 transition-all shadow-lg ${
                                                delivery.status === 'assigned' 
                                                    ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-900/10' 
                                                    : 'bg-red-600 hover:bg-red-700 text-white shadow-red-900/20'
                                            }`}
                                        >
                                            <PackageCheck size={14} />
                                            {delivery.status === 'assigned' ? 'تأكيد استلام الشحنة من المورد' : 'تأكيد إتمام التوصيل للتاجر ✓'}
                                        </button>
                                    </div>
                                </div>
                                
                                {/* بار الحالة الحقيقي في الأسفل */}
                                <div className="bg-slate-900/30 px-6 py-2 border-t border-slate-800 flex items-center gap-2">
                                    <CheckCircle2 size={12} className={delivery.status === 'picked_up' ? 'text-amber-500' : 'text-red-500'} />
                                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em]">
                                        Status: {delivery.status === 'assigned' ? 'WAITING_PICKUP (بانتظار الاستلام)' : 'ON_THE_WAY (قيد التوصيل)'}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}