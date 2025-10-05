import { supabase } from '../config/supabaseClient.js';
export async function listProjects(req, res) {
  const { data, error } = await supabase.from('projects').select('*, artists(*, users(*))');
  if (error) return res.status(400).json({ error: error.message });
  res.json({ projects: data });
}
export async function getProject(req, res) {
  const { id } = req.params;
  const { data, error } = await supabase.from('projects').select('*, artists(*, users(*))').eq('project_id', id).single();
  if (error) return res.status(404).json({ error: error.message });
  res.json({ project: data });
}
export async function createProject(req, res) {
  const { artist_id, title, description, target_amount, royalty_percentage, funding_deadline, status } = req.body;
  const { data, error } = await supabase.from('projects').insert([
    { artist_id, title, description, target_amount, royalty_percentage, funding_deadline, status }
  ]).select();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ project: data[0] });
}
