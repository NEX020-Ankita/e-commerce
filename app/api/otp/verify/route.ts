import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { phone, otp } = await request.json();

    // Get OTP from Supabase
    const { data, error } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('phone', phone)
      .eq('otp', otp)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !data) {
      return NextResponse.json({ success: false, error: 'Invalid or expired OTP' });
    }

    // Delete used OTP
    await supabase
      .from('otp_codes')
      .delete()
      .eq('phone', phone);

    return NextResponse.json({ success: true, verified: true });
  } catch (error) {
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}