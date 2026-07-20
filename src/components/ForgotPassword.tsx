import React, { useState } from "react";
import { supabase } from "../supabaseClient";

interface ForgotPasswordProps {
  onNavigate: (path: string) => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Password reset email sent. Please check your inbox.");
      }
    } catch (err: any) {
      setMessage("Something went wrong.");
    }

    setLoading(false);
  };

  return (
    <div className="w-full max-w-md mx-auto mt-20 px-4">
      <div className="bg-white shadow-xl rounded-3xl p-8 text-left">
        <h2 className="text-2xl font-bold mb-6 text-[#1d3557]">
          Reset Your Password
        </h2>

        <form onSubmit={handleReset} className="flex flex-col gap-4">
          <input
            type="email"
            required
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-3 rounded-xl"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-[#e63946] text-white py-3 rounded-xl font-bold"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-sm text-gray-600">{message}</p>
        )}

        <button
          onClick={() => onNavigate("/login")}
          className="mt-6 text-[#e63946] font-bold text-sm hover:underline"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};