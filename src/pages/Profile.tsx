import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { useNavigate } from 'react-router-dom';
import { Camera, Save, User as UserIcon, Mail, Shield, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Profile() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [userId, setUserId] = useState<string>('');
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        role: "",
        avatar_url: ""
    });

    useEffect(() => {
        fetchUserProfile();
    }, []);

    // 1. جلب بيانات المستخدم الحقيقية وعرضها كقيم افتراضية داخل الحقول
    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return;
            setUserId(user.id);

            const { data: profile, error } = await supabase
                .from('profiles')
                .select('full_name, role, avatar_url')
                .eq('id', user.id)
                .single();

            if (error) throw error;

            let displayRole = profile?.role;
            if (profile?.role === 'supplier') displayRole = 'مورد (Supplier)';
            if (profile?.role === 'retailer') displayRole = 'تاجر (Merchant)';
            if (profile?.role === 'delivery') displayRole = 'مندوب توصيل (Courier)';

            // هنا نضع البيانات القادمة من السيرفر لتظهر في الحقول فوراً
            setFormData({
                full_name: profile?.full_name || "",
                email: user.email || "",
                role: displayRole || "غير محدد",
                avatar_url: profile?.avatar_url || ""
            });

        } catch (error: any) {
            console.error("Error fetching profile:", error.message);
        } finally {
            setLoading(false);
        }
    };

    // 2. معالجة رفع وتحديث صورة البروفايل
    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (!e.target.files || e.target.files.length === 0) return;
            setUploading(true);

            const file = e.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${userId}-${Date.now()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(filePath, file, { cacheControl: '3600', upsert: true });

            if (uploadError) throw uploadError;

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: filePath })
                .eq('id', userId);

            if (updateError) throw updateError;

            setFormData(prev => ({ ...prev, avatar_url: filePath }));

            Swal.fire({
                toast: true, position: 'top', title: 'تم تحديث الصورة الشخصية بنجاح',
                icon: 'success', showConfirmButton: false, timer: 1500,
                background: '#0a0a0a', color: '#fff'
            });

        } catch (error: any) {
            Swal.fire('خطأ في الرفع', error.message, 'error');
        } finally {
            setUploading(false);
        }
    };

    // 3. حفظ التغييرات (الاسم الكامل + البريد الإلكتروني الجديد)
    const handleSave = async () => {
        try {
            setSaving(true);

            // أ) تحديث الاسم الكامل في جدول الـ profiles
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ full_name: formData.full_name })
                .eq('id', userId);

            if (profileError) throw profileError;

            // ب) تحديث البريد الإلكتروني في نظام الـ Auth الخاص بـ Supabase
            const { error: authError } = await supabase.auth.updateUser({
                email: formData.email
            });

            if (authError) throw authError;

            // داخل دالة handleSave في صفحة Profile.tsx بعد التحقق من نجاح التحديث في قاعدة البيانات:
            Swal.fire({
                title: 'تم التحديث بنجاح!',
                text: 'تم حفظ الاسم والبريد الإلكتروني الجديد بنجاح.',
                icon: 'success',
                background: '#0d0d0d',
                color: '#fff',
                confirmButtonColor: '#dc2626',
                confirmButtonText: 'موافق'
            }).then((result) => {
                // 💡 التعديل السحري هنا: بمجرد أن يضغط المستخدم على زر "موافق" في رسالة النجاح، يرجعه للقرية/الصفحة اللي جاء منها فوراً!
                if (result.isConfirmed) {
                    navigate(-1);
                }
            });

        } catch (error: any) {
            Swal.fire('خطأ أثناء الحفظ', error.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    // 4. دالة حظر تعديل الرتبة وتوجيه المستخدم للإدارة
    const handleRoleClick = () => {
        Swal.fire({
            title: 'تعديل صلاحية الحساب',
            text: 'عذراً، لا يمكنك تغيير نوع الحساب بنفسك لحماية النظام. يرجى التواصل مع مدير البرنامج لتقديم طلب تعديل الرتبة.',
            icon: 'info',
            background: '#0d0d0d',
            color: '#fff',
            confirmButtonColor: '#dc2626',
            confirmButtonText: 'موافق، مفهوم'
        });
    };

    if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white font-mono uppercase tracking-[0.3em]">Loading Account Data...</div>;

    return (
        <div className="min-h-screen bg-[#050505] p-8 text-slate-200" dir="rtl">
            <div className="max-w-2xl mx-auto bg-[#0d0d0d] border border-slate-900 rounded-sm p-8 shadow-2xl relative">
                <h2 className="text-3xl font-black text-white italic mb-10 border-r-4 border-red-600 pr-4">إعدادات الحساب</h2>

                <div className="space-y-8">
                    {/* الصورة شخصية */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative group">
                            <img
                                src={
                                    formData.avatar_url
                                        ? `https://npcvgvwiqxpobgpvlvwz.supabase.co/storage/v1/object/public/product-images/${formData.avatar_url}`
                                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.full_name || 'M')}&background=101010&color=fff&size=150`
                                }
                                className="w-32 h-32 rounded-full border-2 border-slate-800 p-1 group-hover:border-red-600 transition-all object-cover bg-black"
                                alt="User Avatar"
                            />
                            <label className="absolute bottom-0 right-0 bg-red-600 p-2 rounded-full cursor-pointer hover:scale-110 transition-transform flex items-center justify-center w-9 h-9">
                                {uploading ? (
                                    <Loader2 size={16} className="text-white animate-spin" />
                                ) : (
                                    <Camera size={16} className="text-white" />
                                )}
                                <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} className="hidden" />
                            </label>
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">
                            {uploading ? 'Uploading_Image...' : 'Update_Avatar'}
                        </p>
                    </div>

                    {/* الحقول وإدخال البيانات */}
                    <div className="space-y-6">
                        {/* حقل الاسم الكامل (يعرض الاسم الحالي وقابل للتعديل) */}
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">الاسم الكامل</label>
                            <div className="relative">
                                <UserIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                                <input
                                    type="text"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    className="w-full bg-black border border-slate-800 p-3 pr-10 focus:border-red-600 outline-none transition-all text-white rounded-sm"
                                    placeholder="اكتب اسمك الكامل هنا..."
                                />
                            </div>
                        </div>

                        {/* حقل البريد الإلكتروني (مفتوح وقابل للتعديل الآن) */}
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">البريد الإلكتروني الجديد</label>
                            <div className="relative">
                                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-black border border-slate-800 p-3 pr-10 focus:border-red-600 outline-none transition-all text-white rounded-sm"
                                    placeholder="name@example.com"
                                />
                            </div>
                        </div>

                        {/* حقل الرتبة المحمي المقروء فقط */}
                        <div onClick={handleRoleClick} className="cursor-pointer group">
                            <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block group-hover:text-red-500 transition-colors">نوع الحساب (انقر للتعديل)</label>
                            <div className="relative border border-dashed border-slate-800 group-hover:border-red-600/40 transition-all rounded-sm bg-black/40">
                                <Shield className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 group-hover:text-red-500 transition-colors" size={18} />
                                <input
                                    type="text"
                                    value={formData.role}
                                    readOnly
                                    className="w-full bg-transparent p-3 pr-10 outline-none text-slate-400 cursor-pointer select-none rounded-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* زر الحفظ */}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full bg-white text-black py-4 font-black text-xs uppercase flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white transition-all shadow-lg rounded-sm disabled:opacity-50"
                    >
                        {saving ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Save size={16} />
                        )}
                        حفظ التغييرات الجديدة
                    </button>
                </div>
            </div>
        </div>
    );
}