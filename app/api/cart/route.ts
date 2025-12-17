import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { product_id, quantity = 1 } = await request.json();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if item exists
    const { data: existingItem } = await supabase
      .from('cart')
      .select('*')
      .eq('user_id', user.id)
      .eq('product_id', product_id)
      .single();

    if (existingItem) {
      // Update quantity
      const { data, error } = await supabase
        .from('cart')
        .update({ product_quantity: existingItem.product_quantity + quantity })
        .eq('id', existingItem.id)
        .select()
        .single();
      
      if (error) throw error;
      return NextResponse.json(data);
    } else {
      // Insert new item
      const { data, error } = await supabase
        .from('cart')
        .insert({ user_id: user.id, product_id, product_quantity: quantity })
        .select()
        .single();
      
      if (error) throw error;
      return NextResponse.json(data);
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 });
  }
}