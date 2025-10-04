import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl) {
  throw new Error('SUPABASE_URL is not defined in environment variables.');
}
if (!supabaseKey) {
  throw new Error('SUPABASE_SERVICE_KEY is not defined in environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
