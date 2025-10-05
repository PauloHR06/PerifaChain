import { supabase } from '../config/supabaseClient.js';
export async function listArtists(req, res) {
  const { data, error } = await supabase.from('artists').select('*, users(*)');
  if (error) return res.status(400).json({ error: error.message });
  res.json({ artists: data });
}
export async function createArtist(req, res) {
  const { user_id, vulgo, genre, social_links, portfolio_links } = req.body;
  const { data, error } = await supabase
    .from('artists')
    .insert([{ user_id, vulgo, genre, social_links, portfolio_links }])
    .select();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ artist: data[0] });
}
