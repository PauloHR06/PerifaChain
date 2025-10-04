import { supabase } from '../config/supabaseClient.js';
export async function listLoans(req, res) {
  const { data, error } = await supabase.from('loans').select('*, users(*), projects(*)');
  if (error) return res.status(400).json({ error: error.message });
  res.json({ loans: data });
}
export async function createLoan(req, res) {
  const { user_id, project_id, terms, amount, status } = req.body;
  const { data, error } = await supabase.from('loans').insert([
    { user_id, project_id, terms, amount, status }
  ]).select();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ loan: data[0] });
}
