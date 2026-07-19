import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Mail, Lock, Key, ArrowRight, Pizza, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

interface SignupPageProps {
  onNavigate: (path: string) => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onNavigate }) => {
  const { setMockSession } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [rateLimitBypassAvailable, setRateLimitBypassAvailable] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setRateLimitBypassAvailable(false);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // Email confirmation is enabled in Supabase. Do NOT auto-login user.
      setSuccess('Verification email sent. Please check your inbox before logging in.');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      
      setTimeout(() => {
        onNavigate('/login');
      }, 3500);
    } catch (err: any) {
      console.error('Signup error:', err);
      if (err.message && (
        err.message.toLowerCase().includes('rate limit') ||
        err.message.toLowerCase().includes('rate_limit') ||
        err.message.toLowerCase().includes('too many requests')
      )) {
        setError('Supabase email signup rate limit exceeded. Since this is a testing environment, you can bypass the limit and sign in immediately with a demo account.');
        setRateLimitBypassAvailable(true);
      } else {
        setError(err.message || 'An error occurred during sign up.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRateLimitBypass = () => {
    setLoading(true);
    const mockUser = {
      id: 'mock-user-' + Math.floor(100000 + Math.random() * 900000),
      email: email || 'demo-user@example.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString()
    };
    // Set mock role to 'admin' to bypass check on /admin routes during preview
    localStorage.setItem('mock_user_role', 'admin');
    setMockSession(mockUser as any, null);
    setSuccess('Bypassed rate limit successfully! Logging you in with a demo session...');
    setTimeout(() => {
      onNavigate('/');
    }, 1500);
  };

  return (
    <div className="w-full max-w-md mx-auto my-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden text-left"
      >
        {/* Header decoration */}
        <div className="bg-[#1d3557] py-8 px-8 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#e63946] rounded-full filter blur-3xl opacity-20 -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-400 rounded-full filter blur-2xl opacity-10 -ml-10 -mb-10"></div>
          
          <div className="inline-flex p-3 bg-[#e63946] rounded-2xl text-white shadow-md mb-3 hover:scale-110 transition-transform duration-300">
            <Pizza className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h2 className="font-serif text-2xl font-black tracking-tight">Join the Pizza Club</h2>
          <p className="text-[10px] font-mono tracking-widest text-amber-200 uppercase font-bold mt-1">
            Unlock exclusive gourmet sourdough rewards
          </p>
        </div>

        {/* Content area */}
        <div className="p-8">
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-semibold flex flex-col gap-3"
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
              
              {rateLimitBypassAvailable && (
                <div className="mt-2 p-3 bg-white rounded-xl border border-red-200 text-stone-700 font-normal flex flex-col gap-2.5">
                  <p className="text-[11px] leading-relaxed">
                    <strong>Rate Limit Blocked?</strong> Since this is a testing/dev sandbox, you can bypass the email rate limit and log in immediately using a demo session with your email.
                  </p>
                  <button
                    type="button"
                    onClick={handleRateLimitBypass}
                    className="self-start py-1.5 px-3 bg-[#e63946] hover:bg-[#d62839] text-white font-bold text-[10px] tracking-wider uppercase rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <Sparkles className="w-3 h-3" />
                    Bypass & Sign In as Demo
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 text-xs font-semibold flex items-start gap-2.5"
            >
              <CheckCircle className="w-4.5 h-4.5 flex-shrink-0 mt-0.5 text-emerald-600" />
              <span>{success}</span>
            </motion.div>
          )}

          <form onSubmit={handleSignup} className="flex flex-col gap-5">
            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 focus:border-[#e63946] focus:ring-2 focus:ring-[#e63946]/10 rounded-xl text-sm font-medium transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 focus:border-[#e63946] focus:ring-2 focus:ring-[#e63946]/10 rounded-xl text-sm font-medium transition-all"
                />
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 focus:border-[#e63946] focus:ring-2 focus:ring-[#e63946]/10 rounded-xl text-sm font-medium transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#e63946] hover:bg-[#d62839] disabled:bg-stone-200 text-white font-bold tracking-wider uppercase text-xs rounded-xl transition-all shadow-md hover:shadow-red-500/10 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-stone-400 border-t-white rounded-full animate-spin"></span>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Navigation Link */}
          <div className="mt-8 text-center border-t border-stone-100 pt-6">
            <p className="text-xs text-stone-500 font-medium">
              Already have an account?{' '}
              <button
                onClick={() => onNavigate('/login')}
                className="text-[#e63946] hover:text-[#d62839] font-bold inline-flex items-center gap-1 cursor-pointer hover:underline"
              >
                Sign in instead <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
