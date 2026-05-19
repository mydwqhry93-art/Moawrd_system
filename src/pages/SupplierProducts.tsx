import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingBag, Plus, Minus, ArrowRight, Package, ShieldCheck, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { supabase } from '../utils/supabase';

export default function SupplierProducts() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [addressNote, setAddressNote] = useState(''); // لتخزين وصف المكان
    const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null); // لتخزين الإحداثيات

    const [products, setProducts] = useState<any[]>([]); // المنتجات الحقيقية
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState<Record<string, number>>({});

    // 💡 إضافة State لتخزين اسم المورد الحقيقي
    const [supplierName, setSupplierName] = useState<string>('جارٍ التحميل...');

    // 1. دالة جلب اسم المورد من جدول الـ profiles
    const fetchSupplierName = async () => {
        if (!id) return;
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', id)
                .single();

            if (!error && data) {
                setSupplierName(data.full_name);
            } else {
                setSupplierName('متجر المورد');
            }
        } catch (error) {
            console.error('خطأ في جلب اسم المورد:', error);
            setSupplierName('متجر المورد');
        }
    };

    // 2. دالة جلب المنتجات من الداتابيز
    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('supplier_id', id);

            if (error) throw error;
            setProducts(data || []);
        } catch (error: any) {
            console.error('Error:', error.message);
        } finally {
            setLoading(false);
        }
    };

    // تشغيل جلب البيانات فور تحميل الصفحة أو تغيير الـ id
    useEffect(() => {
        if (id) {
            fetchSupplierName();
            fetchProducts();
        }
    }, [id]);

    const updateQty = (productId: string, delta: number) => {
        setCart(prev => ({
            ...prev,
            [productId]: Math.max(0, (prev[productId] || 0) + delta)
        }));
    };

    const getTotalItems = () => Object.values(cart).reduce((a, b) => a + b, 0);

const handleSendOrder = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return Swal.fire('عذراً', 'سجل دخولك أولاً', 'error');

            const total = products.reduce((sum, p) => sum + (p.price * (cart[p.id] || 0)), 0);

            // 1️⃣ إنشاء رأس الطلب
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert([{
                    retailer_id: user.id,
                    supplier_id: id,
                    total_price: total,
                    latitude: location?.lat || null, 
                    longitude: location?.lng || null, 
                    address_note: addressNote, 
                    status: 'pending'
                }])
                .select()
                .single();

            if (orderError) throw orderError;

       
// 2️⃣ تجهيز المنتجات (الآن نرسل المعرف الحقيقي للمنتج بعد إصلاح قاعدة البيانات)
const orderItems = products
    .filter(p => p.id && cart[p.id] > 0)
    .map(p => ({
        order_id: order.id,
        product_id: p.id, // 🎯 يعود الحقل ليربط برقم المنتج الأصلي بكل سلامة
        quantity: Number(cart[p.id])
    }));

if (orderItems.length === 0) {
    return Swal.fire('تنبيه', 'يرجى اختيار كميات صالحة للمنتجات أولاً', 'warning');
}

// طباعة مصفوفة العناصر في الكونسول للتأكد من سلامتها قبل إرسالها للسيرفر
console.log("العناصر الجاهزة للإرسال:", orderItems);

if (orderItems.length === 0) {
    return Swal.fire('تنبيه', 'الرجاء اختيار كمية صالحة للمنتجات أولاً', 'warning');
}

            // 3️⃣ إرسال تفاصيل المنتجات لجدول order_items
            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems);

            if (itemsError) throw itemsError;

            // 4️⃣ تنقيص الكمية من المورد وتحديث الواجهة
            for (const item of orderItems) {
                const currentProduct = products.find(p => p.id === item.product_id);
                if (currentProduct) {
                    const currentStock = currentProduct.stock_quantity !== undefined ? currentProduct.stock_quantity : (currentProduct.stock || 0);
                    const newStock = currentStock - item.quantity;

                    await supabase
                        .from('products')
                        .update({ stock_quantity: newStock })
                        .eq('id', item.product_id);

                    setProducts(prev => prev.map(p => p.id === item.product_id ? { ...p, stock_quantity: newStock } : p));
                }
            }

            Swal.fire({
                title: 'تم بنجاح',
                text: 'وصل طلبك للمورد وسيقوم بمراجعته وإرساله للمندوب',
                icon: 'success',
                confirmButtonText: 'ممتاز',
                confirmButtonColor: '#dc2626',
                background: '#0d0d0d',
                color: '#fff'
            });
            setCart({});

        } catch (err: any) {
            console.error("تفاصيل الخطأ:", err);
            Swal.fire({
                title: 'خطأ',
                text: err.message,
                icon: 'error',
                confirmButtonText: 'حسناً',
                confirmButtonColor: '#dc2626',
                background: '#0d0d0d',
                color: '#fff'
            });
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] p-4 md:p-8 text-slate-200" dir="rtl">
            <div className="max-w-7xl mx-auto">

                {/* 📌 الهيدر الفخم المطور بالكامل */}
                <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-3 bg-[#0d0d0d] border border-slate-800 hover:border-red-600 rounded-xl transition-all cursor-pointer group"
                            title="العودة للخلف"
                        >
                            <ArrowRight size={20} className="text-red-600 group-hover:-translate-x-1 transition-transform" />
                        </button>

                        <div>
                            {/* إظهار اسم المورد الحركي السحب من الداتابيز */}
                            <h1 className="text-3xl font-black text-white italic tracking-tighter">
                                متجر <span className="text-red-600 not-italic font-sans">{supplierName}</span>
                            </h1>

                            {/* تفاصيل المورد المعربة والنظيفة */}
                            <div className="flex items-center gap-2 text-[10px] font-sans font-bold text-slate-500 mt-1">
                                <Package size={12} className="text-slate-400" /> معرف المورد: <span className="font-mono text-slate-400">{id?.split('-')[0]}</span>
                                <span className="text-slate-800">|</span>
                                <ShieldCheck size={12} className="text-emerald-500" /> مصدر موثق ومعتمد
                            </div>
                        </div>
                    </div>

                    {/* كرت إجمالي القطع بتصميم متناسق مع حواف البراند الجديدة */}
                    <div className="bg-[#0d0d0d] border-r-4 border-red-600 p-4 min-w-[200px] rounded-l-xl shadow-lg">
                        <p className="text-[10px] text-slate-500 font-bold mb-1">إجمالي القطع المختارة</p>
                        <p className="text-2xl font-black font-mono text-white">
                            {getTotalItems()} <span className="text-xs text-red-600 font-sans font-bold italic mr-1">قطع</span>
                        </p>
                    </div>
                </header>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="animate-spin text-red-600 size-12 mb-4" />
                        <p className="font-sans text-xs text-slate-500 font-bold tracking-widest">تحميل المخزون الحقيقي من السيرفر...</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-slate-800 rounded-xl">
                        <p className="text-slate-500 font-sans font-bold italic">لا توجد منتجات متاحة لهذا المورد حالياً</p>
                    </div>
                ) : (
                    /* 📌 Grid المنتجات الحقيقية بتصميم معرب ومطور وبحواف ناعمة rounded-2xl */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                        {products.map((p) => (
                            <div key={p.id} className="flex flex-col bg-[#0d0d0d] border border-slate-900 hover:border-red-600/40 rounded-2xl overflow-hidden hover:shadow-[0_0_30px_-5px_rgba(220,38,38,0.15)] transition-all duration-500 group">

                                {/* حاوية الصورة */}
                                <div className="relative aspect-[10/9] w-full bg-black/40 flex items-center justify-center p-5 border-b border-slate-900/60">

                                    {/* 📌 شارة المخزون الذكية المدمجة والمعربة بالكامل */}
                                    <div className={`absolute top-3 right-3 z-10 backdrop-blur-xl px-2.5 py-1 rounded-full text-[10px] font-sans font-bold border shadow-inner transition-all duration-300
                                                         ${p.stock_quantity !== undefined && p.stock_quantity > 0
                                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                                            : 'bg-red-500/10 text-red-300 border-red-500/20'
                                        }`}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            {/* النقطة المضيئة الديناميكية تبين الحالة (أخضر متوفر / أحمر منتهي) */}
                                            <span className="relative flex h-1.5 w-1.5">
                                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${p.stock_quantity !== undefined && p.stock_quantity > 0 ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                                <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${p.stock_quantity !== undefined && p.stock_quantity > 0 ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                            </span>

                                            {/* طباعة الكمية الحقيقية أو إظهار حالة النفاد بالعربي */}
                                            {p.stock_quantity !== undefined && p.stock_quantity !== null && p.stock_quantity > 0 ? (
                                                <span>المتوفر: {p.stock_quantity} قطعة</span>
                                            ) : (
                                                <span>منتهي من المخزن</span>
                                            )}
                                        </div>
                                    </div>

                                    {p.image_url ? (
                                        <img
                                            src={`https://npcvgvwiqxpobgpvlvwz.supabase.co/storage/v1/object/public/product-images/${p.image_url}`}
                                            className="max-w-[90%] max-h-[90%] object-contain transform group-hover:scale-105 transition-transform duration-700 ease-out"
                                            alt={p.product_name || "صورة المنتج"}
                                            loading="lazy"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                if (target.src !== window.location.origin + '/logo.png') {
                                                    target.src = '/logo.png';
                                                    target.className = "w-16 h-auto opacity-20 object-contain";
                                                }
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 p-4">
                                            <img src="/logo.png" className="w-14 h-auto opacity-10 mb-2 object-contain" alt="لا توجد صورة" />
                                            <span className="text-[11px] font-sans font-bold">لا توجد صورة للمنتج</span>
                                        </div>
                                    )}
                                </div>

                                {/* تفاصيل المنتج وأزرار العداد */}
                                <div className="p-5 flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-lg font-black text-white mb-1 group-hover:text-red-500 transition-colors line-clamp-1">
                                            {p.product_name || "منتج بدون اسم"}
                                        </h3>
                                        <p className="text-red-600 font-black font-mono text-xl mb-6">
                                            {p.price} <span className="text-xs font-sans font-bold text-slate-500">ريال</span>
                                        </p>
                                    </div>

                                    {/* متحكم الكمية الاحترافي الفخم */}
                                    <div className="flex items-center justify-between bg-black border border-slate-900 rounded-xl p-1">
                                        <button
                                            onClick={() => updateQty(p.id, -1)}
                                            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-red-600/10 text-slate-500 hover:text-red-600 transition-all cursor-pointer"
                                        >
                                            <Minus size={18} />
                                        </button>
                                        <span className="text-xl font-black font-mono text-white">{cart[p.id] || 0}</span>
                                        <button
                                            onClick={() => updateQty(p.id, 1)}
                                            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-red-600/10 text-slate-500 hover:text-red-600 transition-all cursor-pointer"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>
                )}

                {/* 📌 صندوق معلومات التوصيل الجغرافي المعرب */}
                <div className="bg-[#0a0a0a] border border-slate-900 rounded-2xl overflow-hidden mt-8 mb-20 group hover:border-red-600/30 transition-all shadow-xl">
                    <div className="bg-slate-900/30 px-4 py-2 border-b border-slate-900 flex justify-between items-center">
                        <span className="text-[10px] font-sans font-black text-slate-500 tracking-wider">بيانات ومعلومات التوصيل للمحل</span>
                        <div className={`w-1.5 h-1.5 rounded-full ${location ? 'bg-green-500' : 'bg-red-600'}`}></div>
                    </div>

                    <div className="p-4">
                        {/* حقل الوصف الدقيق */}
                        <div className="flex items-center p-3 gap-3 bg-black border border-slate-900 rounded-xl mb-4 group-hover:border-slate-800 transition-all">
                            <div className="flex flex-col items-center border-l border-slate-900 pl-3">
                                <span className="text-[10px] font-sans font-black text-red-600 tracking-wider">الموقع</span>
                            </div>
                            <input
                                type="text"
                                className="flex-1 bg-transparent border-none text-white text-[12px] sm:text-sm outline-none placeholder:text-slate-700 py-1 font-sans"
                                placeholder="اكتب وصفاً دقيقاً لموقعك (اسم المحل، اسم الشارع، بجانب معلم معروف...)"
                                value={addressNote}
                                onChange={(e) => setAddressNote(e.target.value)}
                            />
                        </div>

                        {/* تحكم الـ GPS الذكي الفخم */}
                        <div className="flex justify-between items-center px-2 py-1">
                            <div className="flex items-center gap-2">
                                <div className="relative flex items-center justify-center">
                                    <div className={`w-2 h-2 rounded-full ${location ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-600 animate-pulse'}`}></div>
                                    {location && <div className="absolute w-2 h-2 bg-green-500 rounded-full animate-ping opacity-75"></div>}
                                </div>
                                <span className="text-[10px] font-sans font-bold text-slate-500">
                                    {location ? 'تم ربط إحداثيات الـ GPS بنجاح' : 'في انتظار تحديد نقطة الموقع...'}
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    if (navigator.geolocation) {
                                        navigator.geolocation.getCurrentPosition((pos) => {
                                            setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                                            Swal.fire({
                                                toast: true,
                                                position: 'top',
                                                showConfirmButton: false,
                                                timer: 1500,
                                                timerProgressBar: true,
                                                title: 'تم التقاط الموقع بنجاح',
                                                icon: 'success',
                                                background: '#0d0d0d',
                                                color: '#fff'
                                            });
                                        });
                                    }
                                }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-sans font-black transition-all duration-300 cursor-pointer ${location
                                    ? 'bg-green-600/10 border border-green-600/30 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.1)]'
                                    : 'bg-white text-black hover:bg-red-600 hover:text-white shadow-lg shadow-white/5'
                                    }`}
                            >
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                                {location ? 'تحديث الموقع الجغرافي' : 'التقاط موقعي الحالي عبر الـ GPS'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 📌 زر إرسال الطلب النهائي العائم الفخم والمثبت بالأسفل */}
            {getTotalItems() > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50">
                    <button
                        onClick={handleSendOrder}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl flex items-center justify-center gap-3 shadow-[0_15px_30px_rgba(220,38,38,0.4)] hover:shadow-[0_20px_40px_rgba(220,38,38,0.6)] active:scale-98 transition-all cursor-pointer group"
                    >
                        <ShoppingBag className="group-hover:rotate-12 transition-transform duration-300" size={20} />
                        <span className="font-sans font-black text-base tracking-wide">إرسال الطلب النهائي للمورد</span>
                    </button>
                </div>
            )}
        </div>
    );
}