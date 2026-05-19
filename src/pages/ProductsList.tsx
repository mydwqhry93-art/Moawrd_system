import { useEffect, useState } from 'react';
import { Package, Edit3, Trash2, Plus, Loader2, ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import Swal from 'sweetalert2';

export default function ProductsList() {
    const navigate = useNavigate();
    const [products, setProducts] = useState<any[]>([]);
    const [supplierInfo, setSupplierInfo] = useState<any>(null); // حالة تخزين بيانات المورد
    const [loading, setLoading] = useState(true);

    // 1. جلب منتجات المورد وبيانات بروفايله الشخصي
    useEffect(() => {
        const fetchInventoryData = async () => {
            setLoading(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    // جلب اسم المورد من جدول الـ profiles
                    const { data: profileData, error: profileError } = await supabase
                        .from('profiles')
                        .select('full_name')
                        .eq('id', user.id)
                        .single();

                    if (!profileError && profileData) {
                        setSupplierInfo(profileData);
                    }

                    // جلب المنتجات الخاصة به
                    const { data: productsData, error: productsError } = await supabase
                        .from('products')
                        .select('*')
                        .eq('supplier_id', user.id)
                        .order('created_at', { ascending: false });

                    if (productsError) throw productsError;
                    setProducts(productsData || []);
                }
            } catch (error: any) {
                console.error("Error fetching inventory data:", error.message);
                Swal.fire('خطأ', 'فشل في تحميل بيانات المخزون', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchInventoryData();
    }, []);

    // 2. دالة الحذف
    const handleDelete = async (id: any, name: string) => {
        const result = await Swal.fire({
            title: 'حذف المنتج نهائياً؟',
            text: `هل أنت متأكد من حذف "${name}"؟`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#1e293b',
            confirmButtonText: 'نعم، احذف',
            cancelButtonText: 'تراجع',
            background: '#0d0d0d',
            color: '#fff'
        });

        if (result.isConfirmed) {
            try {
                const { error } = await supabase
                    .from('products')
                    .delete()
                    .eq('id', id);

                if (error) throw error;

                setProducts(prevProducts => prevProducts.filter(item => item.id !== id));

                Swal.fire({
                    title: 'تم الحذف بنجاح!',
                    icon: 'success',
                    background: '#0d0d0d',
                    color: '#fff',
                    timer: 1500,
                    showConfirmButton: false
                });
            } catch (error: any) {
                console.error("Delete Error:", error.message);
                Swal.fire('خطأ', 'حدث خطأ أثناء الحذف: ' + error.message, 'error');
            }
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-red-600 font-sans">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="text-sm tracking-wide">جارٍ مزامنة المخزون الخاص بك...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#050505] p-6 text-slate-200" dir="rtl">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-white italic">
                            مخزون <span className="text-red-600 uppercase">المنتجات</span>
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">
                            إدارة وتحرير المنتجات المعروضة في {supplierInfo?.full_name ? `متجر ${supplierInfo.full_name}` : 'متجر المورد'}
                        </p>
                    </div>
                    {/* 📌 زر إضافة بضاعة جديدة - تصميم دائري عائم ومطور - حسام */}
                    <button
                        onClick={() => navigate('/Addproduct')}
                        // 💡 التعديل الجذري في الـ ClassName هنا لتحويله لدائرة عائمة ذات تأثير نيون
                        className="group bg-red-700 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-300 shadow-lg shadow-red-900/40 
               /* تحديد الأبعاد الدائرية الثابتة */
               w-14 h-14 
               /* وضعية عائمة في زاوية الشاشة (يمكنك تفعيلها إذا أردت) */
               /* fixed bottom-8 left-8 z-40 */
               /* تأثيرات الحركية عند الهوفر */
               hover:scale-110 active:scale-95 group"
                        title="إضافة بضاعة جديدة"
                    >
                        <div className="relative flex items-center justify-center">
                            {/* 1. أيقونة الإضافة الأساسية (تبقى ثابتة في المنتصف) */}
                            <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300 relative z-10" />

                            {/* 2. هالة نيون خلفية تبرز عند الهوفر لتأكيد التفاعل */}
                            <div className="absolute inset-0 bg-red-500 rounded-full blur-md opacity-0 group-hover:opacity-70 transition-opacity"></div>
                        </div>
                    </button>
                </div>

                {products.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-slate-900 rounded-lg">
                        <Package size={48} className="mx-auto text-slate-800 mb-4" />
                        <p className="text-slate-500">لا يوجد لديك منتجات حالياً.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((item) => (
                            <div key={item.id} className="bg-[#0d0d0d] border border-slate-900 rounded-sm overflow-hidden group hover:border-red-600 transition-all duration-300 shadow-xl flex flex-col relative">

                                {/* شارة المخزون بالعربي */}
                                <div className="absolute top-3 right-3 z-10 bg-black/80 backdrop-blur-md px-2.5 py-1 border border-slate-800 rounded-sm">
                                    <span className="text-red-500 font-sans text-[11px] font-black tracking-wider">
                                        الكمية المتوفر: {item.stock_quantity}
                                    </span>
                                </div>

                                {/* حاوية الصورة */}
                                <div className="h-44 bg-slate-950/40 border-b border-slate-900/60 flex items-center justify-center p-2 relative overflow-hidden">
                                    {item.image_url ? (
                                        <img
                                            src={
                                                item.image_url.startsWith('http')
                                                    ? item.image_url
                                                    : `https://npcvgvwiqxpobgpvlvwz.supabase.co/storage/v1/object/public/product-images/${item.image_url}`
                                            }
                                            alt={item.name}
                                            className="max-w-full max-h-full object-contain opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 ease-out"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                                if (target.parentElement) {
                                                    target.parentElement.innerHTML = `
                                                        <div class="flex flex-col items-center justify-center text-slate-700">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                                                            <span class="text-[10px] mt-2 font-sans text-red-900/70 font-bold">خطأ في الاتصال بالصورة</span>
                                                        </div>
                                                    `;
                                                }
                                            }}
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-slate-500">
                                            <ImageIcon size={32} className="text-slate-700 stroke-[1.5]" />
                                            <span className="text-[10px] mt-2 font-sans font-bold">لم يتم العثور على صورة</span>
                                        </div>
                                    )}
                                </div>

                                {/* تفاصيل المنتج */}
                                <div className="p-5 flex-1 flex flex-col justify-between">
                                    <h3 className="text-xl font-bold text-white mb-4 group-hover:text-red-500 transition-colors truncate">{item.name}</h3>

                                    <div className="flex justify-between items-center">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-slate-500 font-sans font-bold">سعر الوحدة</span>
                                            <span className="text-2xl font-black text-white font-mono">{item.price} <small className="text-xs text-slate-400 font-sans">ريال يمني</small></span>
                                        </div>

                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => navigate(`/Addproduct/${item.id}`)}
                                                className="p-3 bg-slate-900 hover:bg-white hover:text-black rounded-sm transition-all text-slate-400"
                                            >
                                                <Edit3 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id, item.name)}
                                                className="p-3 bg-slate-900 hover:bg-red-600 hover:text-white rounded-sm transition-all text-slate-600"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}