import { supabase } from '../config/supabaseClient.js';
export async function uploadDoc(req, res) {
  // Upload logic with Supabase Storage
  res.json({ message: 'Implementar upload via Supabase Storage' });
}
export async function listDocs(req, res) {
  const { user_id, project_id } = req.query;
  let query = supabase.from('docs').select('*');
  if (user_id) query = query.eq('user_id', user_id);
  if (project_id) query = query.eq('project_id', project_id);
  const { data, error } = await query;
  if (error) return res.status(400).json({ error: error.message });
  res.json({ docs: data });
}
