import { supabase } from './supabase';

export interface CartItem {
  id: number;
  user_id: string;
  product_id: number;
  quantity: number;
  created_at: string;
  updated_at: string;
  product?: {
    id: number;
    title: string;
    price: number;
    image_urls?: string[];
    offer_percentage?: number;
  };
}

export const fetchCartItems = async (): Promise<CartItem[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from('user_cart')
      .select(`
        *,
        product:product_id (
          id,
          title,
          price,
          image_urls,
          offer_percentage
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching cart items:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
};

export const updateCartItemQuantity = async (cartItemId: number, quantity: number): Promise<boolean> => {
  try {
    if (quantity <= 0) {
      const { error } = await supabase
        .from('user_cart')
        .delete()
        .eq('id', cartItemId);
      
      return !error;
    }

    const { error } = await supabase
      .from('user_cart')
      .update({ product_quantity: quantity })
      .eq('id', cartItemId);

    return !error;
  } catch (error) {
    console.error('Error updating cart item:', error);
    return false;
  }
};

export const removeCartItem = async (cartItemId: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_cart')
      .delete()
      .eq('id', cartItemId);

    return !error;
  } catch (error) {
    console.error('Error removing cart item:', error);
    return false;
  }
};

export const clearCart = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return false;
    }

    const { error } = await supabase
      .from('user_cart')
      .delete()
      .eq('user_id', user.id);

    return !error;
  } catch (error) {
    console.error('Error clearing cart:', error);
    return false;
  }
};