import { createClient } from '@supabase/supabase-js';

const getEnvVar = (key: string): string | undefined => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  return undefined;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL') || 'https://jcyxbpoergyslwcwjluv.supabase.co';
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY') || 'sb_publishable_ZRAMVK5BH8SGQkvCZb7esA_xqY-Op96';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
