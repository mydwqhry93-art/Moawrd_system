import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { Download, ArrowRight, Package, Truck, Clock, MapPin, RefreshCw, BrainCircuit } from 'lucide-react';

const SupplierOrders = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [onlineDrivers, setOnlineDrivers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentSupplierId, setCurrentSupplierId] = useState<string>('');
    const navigate = useNavigate();

    useEffect(() => {
        checkUserAndFetchOrders();
    }, []);

    const checkUserAndFetchOrders = async () => {
        try {
        
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { navigate('/Login'); return; }

            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (profile?.role !== 'supplier') {
                Swal.fire({ title: 'وصول ممنوع', text: 'للموردين فقط!', icon: 'error', background: '#0d0d0d', color: '#fff' });
                navigate('/');
                return;
            }

            setCurrentSupplierId(user.id);
            await fetchOnlineDrivers();

            // ✅ تم إصلاح الاستدعاء هنا ليكون فارغاً ومطابقاً للدالة الذكية بالأسفل
            await fetchOrders();
        } catch (error) {
            console.error("Error:", error);
            setLoading(false);
        }
    };

    const fetchOnlineDrivers = async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name')
            .eq('role', 'delivery')
            .eq('is_online', true);

        if (data) setOnlineDrivers(data);
    };

    // --- 🧠 دالة التنبؤ الذكي بموعد طلب التاجر القادم ---
    const getRetailerInsight = (retailerId: string) => {
        const retailerOrders = orders.filter(o => o.retailer_id === retailerId);

        if (retailerOrders.length < 2) {
            return {
                text: "ذكاء الأعمال: جاري مراقبة نمط استهلاك التاجر",
                color: "text-blue-400 animate-pulse",
                icon: true,
                urgent: false
            };
        }

        const sorted = [...retailerOrders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        const lastOrder = new Date(sorted[0].created_at).getTime();
        const prevOrder = new Date(sorted[1].created_at).getTime();

        const avgGap = Math.max(1, Math.floor((lastOrder - prevOrder) / (1000 * 60 * 60 * 24)));
        const daysSinceLast = Math.floor((new Date().getTime() - lastOrder) / (1000 * 60 * 60 * 24));

        if (daysSinceLast > avgGap) {
            return { text: `تنبيه: التاجر متأخر بـ ${daysSinceLast - avgGap} يوم`, color: 'text-red-500', icon: true, urgent: true };
        }
        return { text: `موعد الطلب المتوقع: بعد ${avgGap - daysSinceLast} يوم`, color: 'text-emerald-500', icon: true, urgent: false };
    };

    const fetchOrders = async () => {
        try {
            setLoading(true);

            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (!currentUser) return;

            // 1️⃣ جلب الطلبات مع أسماء التجار (سليم وشغال)
            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select(`
                id, total_price, status, created_at, latitude, longitude, address_note, retailer_id,
                profiles!retailer_id ( full_name )
            `)
                .eq('supplier_id', currentUser.id)
                .order('created_at', { ascending: false });

            if (ordersError) throw ordersError;

            if (ordersData && ordersData.length > 0) {
                // 2️⃣ جلب تفاصيل العناصر (تحديث الاستعلام: حذف الـ price وتحديث اسم حقل اسم المنتج)
                const { data: itemsData, error: itemsError } = await supabase
                    .from('order_items')
                    .select(`
                    order_id,
                    quantity,
                    product_id,
                    products ( name )
                `);

                if (itemsError) {
                    console.warn("فشل جلب المنتجات المرتبطة، جاري تشغيل خطة الإنقاذ البديلة...");

                    // خطة البديلة لحماية الصفحة من الانهيار بدون حقل price
                    const { data: fallbackItems } = await supabase
                        .from('order_items')
                        .select('order_id, quantity, product_id');

                    const combinedFallback = ordersData.map(order => ({
                        ...order,
                        order_items: (fallbackItems || []).filter(item => String(item.order_id) === String(order.id)).map(item => ({
                            ...item,
                            products: { product_name: 'منتج في الطلب' }
                        }))
                    }));
                    setOrders(combinedFallback);
                    return;
                }

                // 3️⃣ دمج الجداول معاً برمجياً مع تحويل الـ ID لنص لتجنب أي مشاكل مقارنة
                const fullOrders = ordersData.map(order => ({
                    ...order,
                    order_items: (itemsData || [])
                        .filter(item => String(item.order_id) === String(order.id))
                        .map(item => ({
                            ...item,
                            // تأمين سلامة البيانات في حال كان الحقل في قاعدة بياناتك اسمه 'name' بدلاً من 'product_name'
                            products: item.products ? item.products : { product_name: 'منتج غير معروف' }
                        }))
                }));

                setOrders(fullOrders);
            } else {
                setOrders([]);
            }

        } catch (err: any) {
            console.error("Error fetching orders:", err.message);
        } finally {
            setLoading(false);
        }
    };

    // --- 📊 دالة التصدير المعدلة مع اسم التاجر ---
    const exportToExcel = () => {
        const dataToExport = orders.map(order => ({
            "اسم التاجر": order.profiles?.full_name || 'غير معروف',
            "رقم الطلب":String(order.id).slice(0, 5),
            "التاريخ": new Date(order.created_at).toLocaleDateString('ar-YE'),
            "إجمالي المبلغ": order.total_price,
            "الحالة": order.status,
            "ملاحظات العنوان": order.address_note || 'لا يوجد وصف'
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "الطلبات");
        XLSX.writeFile(workbook, `Report_${new Date().getTime()}.xlsx`);
    };

    const handleAssignOrder = async (orderId: string, driverId: string) => {
        if (!driverId) return;

        try {
            const { error } = await supabase
                .from('orders')
                .update({
                    driver_id: driverId,
                    status: 'assigned'
                })
                .eq('id', orderId);

            if (error) throw error;

            Swal.fire({
                toast: true,
                position: 'top',
                title: 'تم توجيه الطلب للمندوب بنجاح 🚀',
                icon: 'success',
                showConfirmButton: false,
                timer: 2000,
                background: '#000',
                color: '#fff'
            });

            // تحديث الطلبات بعد التعيين الناجح
            await fetchOrders();

        } catch (error: any) {
            console.error("Error assigning order:", error);
            Swal.fire({
                title: 'فشل توجيه الطلب',
                text: error.message || 'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى',
                icon: 'error',
                background: '#0d0d0d',
                color: '#fff',
                confirmButtonColor: '#dc2626'
            });
        }
    };

    if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white font-mono uppercase tracking-[0.3em]">Loading System...</div>;

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 font-sans" dir="rtl">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 border-b border-slate-900 pb-8">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/ProductsList')} className="bg-white/5 hover:bg-red-600 p-3 rounded-sm transition-all"><ArrowRight size={20} /></button>
                        <div>
                            <h1 className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                                <Package className="text-red-600" size={28} /> طلبات <span className="text-red-600">الزبائن</span>
                            </h1>
                            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em] mt-1 text-right">Supplier Dashboard / Intelligence</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={async () => {
                                await fetchOnlineDrivers();
                                Swal.fire({
                                    toast: true,
                                    position: 'top-start',
                                    title: 'تم تحديث قائمة المناديب النشطين',
                                    icon: 'info',
                                    showConfirmButton: false,
                                    timer: 1500,
                                    background: '#0a0a0a',
                                    color: '#fff'
                                });
                            }}
                            className="flex items-center gap-2 bg-white/5 border border-slate-800 text-slate-400 px-4 py-2 rounded-sm text-[10px] font-black hover:text-white hover:border-red-600/50 transition-all uppercase"
                        >
                            <RefreshCw size={12} />
                            المناديب المتاحين
                        </button>

                        <button
                            onClick={exportToExcel}
                            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-sm text-[10px] font-black transition-all uppercase"
                        >
                            <Download size={12} />
                            تصدير EXCEL
                        </button>
                    </div>
                </div>

                {/* Orders List */}
                <div className="grid grid-cols-1 gap-6">
                    {orders.length === 0 ? (
                        <div className="text-center py-20 text-slate-600 font-mono text-sm uppercase tracking-wider border border-dashed border-slate-900 rounded-sm">
                            No incoming orders found / لا توجد طلبات واردة
                        </div>
                    ) : (
                        orders.map((order) => (
                            <div key={order.id} className="bg-[#0a0a0a] border border-slate-900 rounded-sm p-6 hover:border-red-600/30 transition-all relative">
                                <div className="absolute top-0 right-0 w-1 h-full bg-red-600 opacity-50"></div>

                                <div className="flex flex-col lg:flex-row justify-between gap-8">
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-6 bg-white/[0.02] p-4 border border-white/5 rounded-sm">
                                            <div>
                                                <p className="text-[9px] text-slate-500 uppercase font-mono tracking-widest mb-1">Retailer / التاجر</p>
                                                <h3 className="text-lg font-black text-white">{order.profiles?.full_name || 'تاجر غير مسجل'}</h3>
                                            </div>

                                            <div className="text-left">
                                                {(() => {
                                                    const insight = getRetailerInsight(order.retailer_id);
                                                    if (!insight) return <span className="text-[8px] text-slate-600 italic">بانتظار مزيد من الطلبات للتحليل</span>;
                                                    return (
                                                        <div className="flex flex-col items-end">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <BrainCircuit size={12} className={insight.urgent ? 'text-red-500' : 'text-emerald-500'} />
                                                                <span className="text-[9px] font-black uppercase text-slate-400">Inventory Insight</span>
                                                            </div>
                                                            <span className={`text-[10px] font-black uppercase px-2 py-1 bg-white/5 rounded-sm ${insight.color}`}>
                                                                {insight.text}
                                                            </span>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 mb-4 flex-wrap">
                                            <span className="bg-red-600 text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-tighter">New Order</span>
                                            <span className="text-slate-500 font-mono text-xs uppercase italic tracking-tighter">ID: {order?.id ? String(order.id).slice(0, 5) : '—'}</span>
                                            <span className="text-slate-600 text-[10px] flex items-center gap-1 font-mono"><Clock size={10} /> {new Date(order.created_at).toLocaleDateString('ar-YE')}</span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-6 text-right">
                                            <div className="bg-white/5 p-3 border border-white/5 rounded-sm">
                                                <p className="text-[9px] text-slate-500 uppercase mb-1 font-mono text-right">Total Amount</p>
                                                <p className="text-xl font-black text-white text-right">{order.total_price} <span className="text-[10px] font-normal text-slate-400">ريال</span></p>
                                            </div>
                                            <div className="bg-white/5 p-3 border border-white/5 rounded-sm text-right">
                                                <p className="text-[9px] text-slate-500 uppercase mb-1 font-mono text-right">Order Status</p>
                                                <p className="text-sm font-black text-red-500 uppercase italic tracking-tighter text-right">{order.status}</p>
                                            </div>
                                        </div>

                                        <div className="mb-6 p-4 bg-red-600/5 border border-red-600/10 rounded-sm text-right">
                                            <div className="flex items-center gap-2 mb-2 justify-start">
                                                <MapPin size={12} className="text-red-600" />
                                                <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">الموقع المذكور</span>
                                            </div>
                                            <p className="text-xs text-slate-300 leading-relaxed mb-3 text-right">{order.address_note || "لم يذكر التاجر ملاحظات إضافية"}</p>
                                            {order.latitude && (
                                                <button onClick={() => window.open(`https://maps.google.com/?q=${order.latitude},${order.longitude}`, '_blank')} className="text-[9px] font-black text-white underline underline-offset-4 hover:text-red-600 uppercase transition-all">تحديد الموقع على الخريطة →</button>
                                            )}
                                        </div>

                                        <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 border-b border-slate-900 pb-2 text-right">Products / المنتجات</h4>
                                        <ul className="space-y-2">
                                            {order.order_items?.map((item: any, index: number) => (
                                                <li key={index} className="flex justify-between items-center text-xs bg-white/[0.01] p-3 border border-transparent hover:border-white/5 transition-all">
                                                    <span className="font-bold text-slate-200">{item.products?.name || 'منتج غير معروف'}</span>
                                                    <div className="flex gap-4 font-mono text-[10px] text-slate-500">
                                                        <span>QTY: {item.quantity}</span>
                                                        <span className="text-white font-bold">{item.price} ريال</span>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* اختيار المندوب */}
                                    <div className="lg:w-64 flex flex-col justify-center border-r border-slate-900 pr-0 lg:pr-6">
                                        <label className="text-[9px] font-black text-slate-500 uppercase block mb-2 tracking-tighter text-right">Assign Driver / تعيين المندوب</label>
                                        <select
                                            onChange={(e) => handleAssignOrder(order.id, e.target.value)}
                                            className="w-full bg-black border border-slate-800 text-white text-[11px] p-3 outline-none focus:border-red-600 rounded-sm appearance-none cursor-pointer mb-4 text-right"
                                            defaultValue=""
                                        >
                                            <option value="" disabled>-- قائمة المناديب المتاحين --</option>
                                            {onlineDrivers.map(driver => (
                                                <option key={driver.id} value={driver.id}>🟢 {driver.full_name}</option>
                                            ))}
                                        </select>

                                        <button disabled className={`w-full py-4 rounded-sm text-[10px] font-black uppercase italic flex items-center justify-center gap-3 border ${order.status === 'assigned' ? 'bg-emerald-600/10 border-emerald-600/20 text-emerald-500' : 'bg-slate-900/50 border-slate-800 text-slate-500'}`}>
                                            <Truck size={14} /> {order.status === 'assigned' ? 'تم التوجيه بنجاح' : 'انتظار التعيين'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default SupplierOrders;