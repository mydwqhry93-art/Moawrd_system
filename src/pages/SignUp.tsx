import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { UserPlus, Mail, Lock, User, Sparkles, ShieldCheck, ChevronLeft, Phone } from 'lucide-react';
import { supabase } from '../utils/supabase';

export default function SignUp() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState('delivery');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. تسجيل الحساب وإرسال البيانات للـ Metadata
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: email.trim(),
                password: password,
                options: {
                    data: {
                        full_name: name,
                        phone: phone,
                        role: role
                    }
                }
            });

            if (authError) throw authError;

            if (authData?.user) {
               
                Swal.fire({
                    icon: 'success',
                    title: 'تم الانضمام بنجاح!',
                    text: 'أهلاً بك في منظومة مورّد، جاري تحضير حسابك...',
                    timer: 3000,
                    showConfirmButton: false,
                    background: '#0d0d0d',
                    color: '#fff',
                    iconColor: '#dc2626'
                });

                // تفريغ الحقول
                setName(''); setEmail(''); setPassword(''); setPhone('');
                
                // 🛠️ التعديل هنا: التوجيه إلى المسار الرئيسي المعتمد لصفحة الدخول بحرف صغير "/"
                setTimeout(() => navigate('/'), 3000);
            }
        } catch (err: any) {
            Swal.fire({
                icon: 'error',
                title: 'فشل التسجيل',
                text: err.message,
                background: '#0d0d0d',
                color: '#fff'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-[#050505] font-sans antialiased text-slate-200 relative overflow-hidden" dir="rtl">
            {/* الخلفية التقنية */}
            <div className="absolute inset-0 z-0 opacity-30"
                style={{
                    backgroundImage: `linear-gradient(#450a0a 0.5px, transparent 0.5px), linear-gradient(90deg, #450a0a 0.5px, transparent 0.5px)`,
                    backgroundSize: '40px 40px'
                }}>
            </div>

            <div className="w-full max-w-md z-10 p-6">
                <div className="text-center mb-8 animate-float">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-950/30 border border-red-500/20 rounded-full mb-4">
                        <Sparkles className="text-red-500 size-4 animate-pulse" />
                        <span className="text-red-400 text-xs font-mono tracking-widest uppercase">New Account Registration</span>
                    </div>
                    <h2 className="text-4xl font-black text-white mb-2 relative">
                        أهلاً بك في <span className="text-red-600">مورّد</span>
                    </h2>
                </div>

                <div className="relative p-[1.5px] overflow-hidden rounded-md shadow-[0_0_50px_-12px_rgba(220,38,38,0.3)]">
                    <div className="absolute inset-[-1000%] animate-border-spin bg-[conic-gradient(from_90deg_at_50%_50%,#000_0%,#000_40%,#dc2626_50%,#000_60%,#000_100%)]"></div>

                    <div className="relative bg-[#0d0d0d] rounded-md p-10 z-10">
                        <form onSubmit={handleSignUp} className="space-y-5">
                            {/* الاسم الكامل */}
                            <div className="space-y-2 text-right">
                                <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mr-1">إلإسم الكامل</label>
                                <div className="relative group">
                                    <input type="text" required placeholder="الاسم الثلاثي..." value={name}
                                        className="w-full pl-4 pr-11 py-3 bg-[#050505] border border-slate-800 rounded-sm focus:border-red-600 outline-none transition-all text-red-500"
                                        onChange={(e) => setName(e.target.value)} />
                                    <User className="absolute right-3.5 top-3.5 text-slate-600 size-5" />
                                </div>
                            </div>

                            {/* رقم الهاتف */}
                            <div className="space-y-2 text-right">
                                <label htmlFor="phoneInput" className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mr-1">رقم التواصل</label>
                                <div className="relative group">
                                    <input id="phoneInput" type="tel" required placeholder="7xxxxxxxx" value={phone}
                                        className="w-full pl-4 pr-11 py-3 bg-[#050505] border border-slate-800 rounded-sm focus:border-red-600 outline-none transition-all text-red-500 font-mono"
                                        onChange={(e) => setPhone(e.target.value)} />
                                    <Phone className="absolute right-3.5 top-3.5 text-slate-600 size-5" />
                                </div>
                            </div>

                            {/* نوع الحساب */}
                            <div className="space-y-2 text-right">
                                <label htmlFor="roleSelect" className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mr-1">نوع الحساب</label>
                                <div className="relative group">
                                    <select id="roleSelect" value={role} onChange={(e) => setRole(e.target.value)}
                                        className="w-full pl-4 pr-11 py-3 bg-[#050505] border border-slate-800 rounded-sm focus:border-red-600 outline-none text-red-500 appearance-none cursor-pointer font-mono">
                                        <option value="supplier">مورّد (Supplier)</option>
                                        <option value="delivery">مندوب توزيع (Delivery)</option>
                                        <option value="retailer">تاجر (Retailer)</option>
                                    </select>
                                    <ShieldCheck className="absolute right-3.5 top-3.5 text-slate-600 size-5" />
                                    <ChevronLeft className="absolute left-3 top-4 size-4 -rotate-90 text-slate-700" />
                                </div>
                            </div>

                            {/* البريد الإلكتروني */}
                            <div className="space-y-2 text-right">
                                <label htmlFor="emailInput" className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mr-1">البريد الإلكتروني</label>
                                <div className="relative group">
                                    <input id="emailInput" type="email" required placeholder="name@morid.sys" value={email}
                                        className="w-full pl-4 pr-11 py-3 bg-[#050505] border border-slate-800 rounded-sm focus:border-red-600 outline-none text-red-500 font-mono"
                                        onChange={(e) => setEmail(e.target.value)} />
                                    <Mail className="absolute right-3.5 top-3.5 text-slate-600 size-5" />
                                </div>
                            </div>

                            {/* كلمة المرور */}
                            <div className="space-y-2 text-right">
                                <label htmlFor="passInput" className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mr-1">رمز الدخول</label>
                                <div className="relative group">
                                    <input id="passInput" type="password" required placeholder="••••••••" value={password}
                                        className="w-full pl-4 pr-11 py-3 bg-[#050505] border border-slate-800 rounded-sm focus:border-red-600 outline-none text-red-500"
                                        onChange={(e) => setPassword(e.target.value)} />
                                    <Lock className="absolute right-3.5 top-3.5 text-slate-600 size-5" />
                                </div>
                            </div>

                            <button disabled={loading} className="w-full bg-red-700 hover:bg-red-600 text-white font-bold py-4 rounded-sm transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                                {loading ? "جارِ المعالجة..." : "تأكيد إنشاء الحساب"}
                                {!loading && <UserPlus className="size-5" />}
                            </button>
                        </form>

                        <div className="mt-8 text-center border-t border-slate-900 pt-6">
                            <p className="text-[13px] text-slate-500">
                                لديك حساب بالفعل؟ <Link to="/" className="text-red-600 font-bold underline">تسجيل الدخول</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}