import { useState, useEffect } from 'react';
import { ImageIcon, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../utils/supabase';

export default function AddProduct() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(isEdit);

    useEffect(() => {
        if (isEdit) {
            const fetchProduct = async () => {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (data) {
                    setName(data.name);
                    setPrice(data.price.toString());
                    setStock(data.stock_quantity.toString());
                    setImagePreview(data.image_url);
                }
                setFetchingData(false);
            };
            fetchProduct();
        }
    }, [id, isEdit]);//هذه المصفوفة تخبر الـ useEffect: "لا تشتغل وتنفذ هذا الكود إلا في حالتين: إما عند فتح الصفحة لأول مرة، أو إذا تغيرت قيمة الـ id أو قيمة الـ isEdit في الرابط". هذا يمنع الصفحة من الدخول في حلقة تكرار لانهائية (Infinite Loop) تضرب السيرفر.

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    // دالة رفع الصورة المنفصلة
    const uploadImage = async (file: File) => {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;

            console.log("محاولة رفع الملف:", fileName);

            const { data, error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: true // لضمان التحديث لو تكرر الاسم
                });

            if (uploadError) {
                console.error("خطأ سوبابيس في الرفع:", uploadError.message);
                throw new Error(`فشل الرفع: ${uploadError.message}`);
            }

            console.log("تم الرفع بنجاح!");
            return fileName;
        } catch (err: any) {
            console.error("حدث خطأ في الاتصال أثناء الرفع:", err.message);
            throw err;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("يجب تسجيل الدخول أولاً");

            let finalImageUrl = imagePreview; // القيمة الافتراضية (سواء كانت قديمة أو preview)

            // 1. إذا اختار المستخدم صورة جديدة، نرفعها
            if (imageFile) {
                finalImageUrl = await uploadImage(imageFile);
            }

            const productData = {
                name: name,
                price: parseFloat(price),
                stock_quantity: parseInt(stock),
                image_url: finalImageUrl, // هنا نضع الرابط الحقيقي وليس placeholder
                supplier_id: user.id
            };

            let error;
            if (isEdit) {
                // 2. التعديل: نستخدم update مع eq
                const { error: updateError } = await supabase
                    .from('products')
                    .update(productData)
                    .eq('id', id);
                error = updateError;
            } else {
                // 3. الإضافة: نستخدم insert
                const { error: insertError } = await supabase
                    .from('products')
                    .insert([productData]);
                error = insertError;
            }

            if (error) throw error;

            Swal.fire({
                icon: 'success',
                title: isEdit ? 'تم التحديث!' : 'تمت الإضافة!',
                background: '#0d0d0d',
                color: '#fff',
                confirmButtonColor: '#dc2626',
            }).then(() => navigate('/ProductsList'));

        } catch (error: any) {
            console.error("العطل هنا:", error.message);
            Swal.fire('خطأ', error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    if (fetchingData) return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center text-red-600 font-mono">
            <Loader2 className="animate-spin mr-2" /> LOADING_PRODUCT_DATA...
        </div>
    );




    return (
        <div className="min-h-screen bg-[#050505] p-6 text-slate-200" dir="rtl">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-black text-white mb-8 italic">
                    {isEdit ? 'تعديل' : 'إضافة'} <span className="text-red-600">المنتج</span>
                </h1>

                <form onSubmit={handleSubmit} className="bg-[#0d0d0d] border border-slate-900 p-8 rounded-sm space-y-6 shadow-2xl">
                    {/* حقل الصورة */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">صورة المنتج</label>
                        <div className="border-2 border-dashed border-slate-900 rounded-sm p-4 text-center hover:border-red-600 bg-[#050505] relative cursor-pointer transition-colors group">
                            {imagePreview ? (
                                <img src={imagePreview} className="max-h-40 mx-auto rounded-sm shadow-2xl opacity-80 group-hover:opacity-100" alt="معاينة صور المنتج" />
                            ) : (
                                <div className="py-8 flex flex-col items-center">
                                    <ImageIcon className="text-slate-800 size-12 mb-2 group-hover:text-red-600" />
                                    <p className="text-xs text-slate-600 font-mono">UP_LOAD_PRODUCT_VISUAL</p>
                                </div>
                            )}
                            <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                    </div>

                    {/* اسم المنتج */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Product Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-black border border-slate-900 p-4 rounded-sm outline-none focus:border-red-600 text-white font-bold"
                            placeholder="اسم البضاعة.."
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {/* السعر */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Price (YER)</label>
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="w-full bg-black border border-slate-900 p-4 rounded-sm outline-none focus:border-red-600 text-red-500 font-mono text-xl"
                                placeholder="0.00"
                                required
                            />
                        </div>
                        {/* المخزون */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Stock Quantity</label>
                            <input
                                type="number"
                                value={stock}
                                onChange={(e) => setStock(e.target.value)}
                                className="w-full bg-black border border-slate-900 p-4 rounded-sm outline-none focus:border-red-600 text-white font-mono text-xl"
                                placeholder="0"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] bg-red-700 hover:bg-red-600 text-white font-black py-4 rounded-sm transition-all disabled:opacity-30 flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 className="animate-spin" size={20} />}
                            {loading ? 'PROCESSING...' : (isEdit ? 'UPDATE_ENTRY' : 'CONFIRM_ADDITION')}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/ProductsList')}
                            className="flex-1 bg-slate-950 border border-slate-900 hover:bg-slate-900 text-slate-500 font-bold py-4 rounded-sm transition-all"
                        >
                            تراجع
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}