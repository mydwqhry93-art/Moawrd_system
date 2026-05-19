import { supabase } from '../utils/supabase';
import Swal from 'sweetalert2';

export const submitOrder = async (cartItems, total) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('orders').insert([
        { client_id: user.id, items: cartItems, total_price: total, status: 'pending' }
    ]);

    if (error) {
        Swal.fire({ title: 'خطأ', text: error.message, icon: 'error', background: '#0d0d0d', color: '#fff' });
        return false;
    }
    return true;
};