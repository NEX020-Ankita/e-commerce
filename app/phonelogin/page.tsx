"use client";

import { supabase } from "@/lib/supabase";
import { useState } from "react";

export default function PhoneLogin() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [sentOtp, setSentOtp] = useState("");

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Sending OTP to:", phone);
      const { data, error } = await supabase.auth.signInWithOtp({ phone });

      console.log("OTP Response:", data);

      if (error) {
        throw new Error(error.message || "Failed to send OTP");
      }

      if (data) {
        setStep("otp");
      }
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      alert(
        `Error: ${error.message || "Failed to send OTP. Please try again."}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: "sms",
      });

      if (error) {
        console.error("Error verifying OTP:", error);
        alert(
          `Error: ${error.message || "Failed to verify OTP. Please try again."}`
        );
        return;
      }

      if (data.user) {
        console.log("Login successful");
        window.location.href = "/user";
      }
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      alert(
        `Error: ${error.message || "Failed to verify OTP. Please try again."}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">Sign in with your phone number</p>
        </div>

        {step === "phone" ? (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 000 000-0000"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-lg"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="000000"
                maxLength={6}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors text-lg text-center tracking-widest"
                required
              />
              <p className="text-sm text-gray-500 mt-2 text-center">
                Enter the 6-digit code sent to {phone}
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify & Login"}
            </button>
            <button
              type="button"
              onClick={() => setStep("phone")}
              className="w-full text-blue-600 hover:text-blue-800 font-medium py-2 transition-colors"
            >
              ← Change Phone Number
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
