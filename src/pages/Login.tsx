import { useState } from 'react';
import Swal from 'sweetalert2';
// useNavigate: هوك (Hook) نستخدمه برمجياً لتوجيه المستخدم لصفحة أخرى تلقائياً بعد ما ينجح في تسجيل الدخول.
import { Link, useNavigate } from 'react-router-dom'; // أضفنا useNavigate
import { Mail, Lock, ChevronLeft, ShieldCheck, Truck } from 'lucide-react';
import { supabase } from '../utils/supabase';

export default function Login() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false); //loading: متغير بوليني (true/false) نستخدمه لمنع المستخدم من الضغط على زر الدخول مرتين أثناء إرسال البيانات للسيرفر، ونغير نص الزر إلى "جارِ التحقق..."
    const navigate = useNavigate(); // هوك التنقل



    // await  عشان ننتظر رد قاعدة البيانات بدون ما نجمد واجهة المستخدم
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault(); // يمنع الصفحة من تحديث نفسها (الافتراضي في المتصفح)
        setLoading(true);// تشغيل وضع التحميل لتجميد الزر

        try {
            // 1. تسجيل الدخول الأساسي
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password
            });

            if (authError) throw authError;

            if (data.user) {
                // 2. جلب رتبة المستخدم من جدول profiles
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', data.user.id)
                    .single();// جيب لي سطر واحد فقط (كائن وليس مصفوفة)

                if (profileError) throw new Error("لم يتم العثور على صلاحيات لهذا الحساب");

                // تنبيه النجاح
                Swal.fire({
                    title: 'تم الدخول بنجاح',
                    text: `مرحباً بك، جاري توجيهك...`,
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                    background: '#0d0d0d',
                    color: '#fff',
                });

                // 3. التوجيه الذكي    
                setTimeout(() => {
                    switch (profile.role) {
                        case 'supplier':
                            navigate('/ProductsList'); // واجهة المورد
                            break;
                        case 'retailer':
                            navigate('/SuppliersList'); // واجهة التاجر
                            break;
                        case 'delivery':
                            navigate('/CourierDashboard'); // واجهة المندوب
                            break;
                        default:
                            navigate('/'); // صفحة افتراضية
                    }
                }, 1500);
            }
        } catch (error: any) {
            Swal.fire({
                title: 'فشل التحقق',
                text: error.message,
                icon: 'error',
                background: '#0d0d0d',
                color: '#fff',
                confirmButtonColor: '#dc2626',
                confirmButtonText: 'حاول مجدداً',
            });
        }
         finally {
            setLoading(false);
        }
    };
    return (
        <main className="min-h-screen flex items-center justify-center bg-[#050505] font-sans antialiased text-slate-200 relative overflow-hidden" dir="rtl">

            {/* خلفية تقنية بلمسة حمراء خفيفة جداً */}
            <div className="absolute inset-0 z-0 opacity-50"
                style={{
                    backgroundImage: `linear-gradient(#450a0a 0.5px, transparent 0.5px), linear-gradient(90deg, #450a0a 0.5px, transparent 0.5px)`,
                    backgroundSize: '40px 40px'
                }}>
            </div>

            {/* توهج أحمر خلف البطاقة */}
            <div className="absolute w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px] z-0"></div>

            <div className="w-full max-w-md z-10 p-6">

                {/* الحاوية الخارجية المتحركة */}
                <div className="relative p-[1.5px] overflow-hidden rounded-md group">

                    {/* الشعاع الدوار خلف الكرت */}
                    <div className="absolute inset-[-1000%] animate-border-spin bg-[conic-gradient(from_90deg_at_50%_50%,#000_0%,#000_40%,#dc2626_50%,#000_60%,#000_100%)]">
                    </div>

                    {/* الكرت الفخم الداخلي */}
                    <div className="relative bg-[#0d0d0d] rounded-md p-10 z-10">

                        {/* خط الأمان العلوي */}
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-600/50 to-transparent"></div>

                        {/* Header */}
                        <header className="mb-12 text-right">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-2.5 bg-red-900/20 border border-red-600/30 rounded shadow-[0_0_15px_rgba(220,38,38,0.2)]">
                                    <img src='./public/logo.png' className="text-red-500 size-7"alt='شعار النظام' />
                                </div>
                                <div className="flex flex-col">
                                    <h1 className="text-4xl font-black tracking-tight text-white mb-0">مورّد</h1>
                                    <div className="h-[3px] w-full bg-red-600 mt-1 shadow-[0_0_10px_rgba(220,38,38,0.6)]"></div>
                                </div>
                            </div>
                            <p className="text-slate-300 text-[11px] uppercase tracking-[0.4em] font-bold">نظام الإدارة المتكامل</p>
                        </header>

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2 text-right">
                                <label htmlFor="emailInput"  className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mr-1">معرف الوصول الرسمي</label>
                                <div className="relative group">
                                    <input
                                        id="phoneInput" 
                                        type="email"
                                        required
                                        placeholder="ADMIN@MORID.SYS"
                                        className="w-full pl-4 pr-11 py-3.5 bg-[#050505] border border-slate-800 rounded-sm focus:border-red-600 outline-none transition-all text-red-500 placeholder:text-slate-900 font-mono"
                                        value={email} // ربط الحالة
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                    <Mail className="absolute right-3.5 top-4 text-slate-500 group-focus-within:text-red-600 transition-colors size-5" />
                                </div>
                            </div>

                            <div className="space-y-2 text-right">
                                <label htmlFor="passInput"  className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mr-1">كلمة المرور</label>
                                <div className="relative group">
                                    <input
                                        id="passInput"
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        className="w-full pl-4 pr-11 py-3.5 bg-[#050505] border border-slate-800 rounded-sm focus:border-red-600 outline-none transition-all text-red-500 placeholder:text-slate-900 font-mono"
                                        value={password} // ربط الحالة
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <Lock className="absolute right-3.5 top-4 text-slate-500 group-focus-within:text-red-600 transition-colors size-5" />
                                </div>
                            </div>

                            <button
                                type="submit" // تأكد أن النوع submit
                                disabled={loading}
                                className="w-full bg-red-700 hover:bg-red-600 text-white font-bold py-4 rounded-sm shadow-lg shadow-red-900/20 transition-all flex items-center justify-center gap-3 group active:scale-[0.98] disabled:opacity-50"
                            >
                                <span className="tracking-[0.1em]">
                                    {loading ? "جارِ التحقق من الصلاحيات..." : "تسجيل دخول "}
                                </span>
                                {!loading && <ChevronLeft className="size-5 group-hover:-translate-x-1 transition-transform" />}
                            </button>

                            <div className="mt-8 text-center">
                                <p className="text-[13px] text-slate-500 font-sans">
                                    ليس لديك حساب؟{' '}
                                    <Link
                                        to="/signup"
                                        className="text-red-600 hover:text-red-500 font-bold transition-all underline underline-offset-8 decoration-red-900/50"
                                    >
                                        تقديم طلب تسجيل جديد
                                    </Link>
                                </p>
                            </div>


                        </form>

                        <div className="mt-12 flex justify-between items-center text-[9px] text-slate-500 font-mono border-t border-slate-900/50 pt-4">
                            <div className="flex items-center gap-1">
                                <ShieldCheck className="size-3 text-red-900" />
                                <span className="text-slate-600 uppercase">System_Auth_Secure</span>
                            </div>
                            <span className="text-slate-600">V_1.0.0_CORE</span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}