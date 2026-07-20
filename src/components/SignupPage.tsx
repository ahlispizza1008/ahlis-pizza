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
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      setSuccess('Verification email sent. Please check your inbox.');
      setFullName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        onNavigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Signup failed.');
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
            Join the Pizza Club
          </h2>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-semibold">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 text-xs font-semibold">
              {success}
            </div>
          )}

          <form onSubmit={handleSignup} className="flex flex-col gap-5">

            {/* Full Name */}
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full Name"
              className="w-full px-4 py-3 border rounded-xl"
            />

            {/* Email */}
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="w-full px-4 py-3 border rounded-xl"
            />

            {/* Password */}
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              minLength={6}
              className="w-full px-4 py-3 border rounded-xl"
            />

            {/* Confirm Password */}
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              minLength={6}
              className="w-full px-4 py-3 border rounded-xl"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#e63946] text-white font-bold rounded-xl"
            >
              {loading ? 'Creating...' : 'Create Account'}
            </button>

          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => onNavigate('/login')}
              className="text-[#e63946] font-bold hover:underline"
            >
              Already have an account?
            </button>
          </div>

        </div>
      </motion.div>
    </div>
  );
};