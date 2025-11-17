import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store OTP in Supabase
    const { error } = await supabase
      .from('otp_codes')
      .upsert({
        phone,
        otp,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to store OTP' }, { status: 500 });
    }

    // In production, send SMS here. For demo, return OTP
    console.log(`OTP for ${phone}: ${otp}`);
    
    return NextResponse.json({ success: true, otp }); // Remove otp in production
  } catch (error: any) {
    console.error('Error:', error.message);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}