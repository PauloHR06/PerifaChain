import { supabase } from '../config/supabaseClient.js';
export async function getProfile(req, res) {
  const id = req.user.userId;
  const { data, error } = await supabase.from('users').select('*').eq('user_id', id).single();
  if (error) return res.status(404).json({ error: error.message });
  res.json({ profile: data });
}
export async function updateProfile(req, res) {
  const id = req.user.userId;
  const updates = req.body;
  const { data, error } = await supabase.from('users').update(updates).eq('user_id', id).select();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ profile: data[0] });
}
