import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
    // الافتراضي هو false (الوضع الليلي الأساسي لمتجرك)
    const [isLight, setIsLight] = useState(false);

    useEffect(() => {
        const root = window.document.documentElement;
        if (isLight) {
            root.classList.add('light'); // تفعيل وضع النهار
        } else {
            root.classList.remove('light'); // العودة للوضع الليلي الأصلي
        }
    }, [isLight]);

    return (
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
    );
}