import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Mail, Lock, ArrowRight, Pizza, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginPageProps {
  onNavigate: (path: string) => void;
  onSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ GOOGLE LOGIN FUNCTION
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      console.error("Google login error:", error.message);
      setError("Google login failed.");
      setLoading(false);
    }
  };

  // ✅ EMAIL/PASSWORD LOGIN
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      onSuccess();
    } catch (err: any) {
      const errMsg = err.message || '';
      const lowerMsg = errMsg.toLowerCase();

      if (
        lowerMsg.includes('email not confirmed') ||
        lowerMsg.includes('email_not_confirmed') ||
        lowerMsg.includes('confirm your email') ||
        lowerMsg.includes('verify your email')
      ) {
        setError('Please verify your email before logging in.');
      } else {
        setError('Invalid email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto my-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden text-left"
      >
        <div className="bg-[#1d3557] py-8 px-8 text-white text-center">
          <div className="inline-flex p-3 bg-[#e63946] rounded-2xl text-white shadow-md mb-3">
            <Pizza className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h2 className="font-serif text-2xl font-black tracking-tight">
            Ahli's Pizza Club
          </h2>
          <p className="text-[10px] font-mono tracking-widest text-amber-200 uppercase font-bold mt-1">
            Sign in to savor exclusive rewards
          </p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-semibold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-5">

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 focus:border-[#e63946] focus:ring-2 focus:ring-[#e63946]/10 rounded-xl text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 focus:border-[#e63946] focus:ring-2 focus:ring-[#e63946]/10 rounded-xl text-sm"
                />
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#e63946] hover:bg-[#d62839] disabled:bg-stone-200 text-white font-bold uppercase text-xs rounded-xl transition-all"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            {/* Google Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-3.5 bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 font-bold uppercase text-xs rounded-xl transition-all"
            >
              Sign in with Google
            </button>

          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-stone-500 font-medium">
              New to Ahli's Pizza?{' '}
              <button
                onClick={() => onNavigate('/signup')}
                className="text-[#e63946] hover:underline font-bold inline-flex items-center gap-1"
              >
                Create an account <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};