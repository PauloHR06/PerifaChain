import { supabase } from '../config/supabaseClient.js';
import jwt from 'jsonwebtoken';

export async function register(req, res) {
  const { name, email, password, role, vulgo, genre, social_links, portfolio_links } = req.body;
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return res.status(400).json({ error: error.message });
  const { user } = data;
  const userInsert = await supabase
    .from('users')
    .insert([{ name, email, role, wallet_address: 'EXTERNAL_WALLET_SERVICE', phone: req.body.phone }])
    .select();
  let artistInsert = null;
  if (role === 'artist') {
    artistInsert = await supabase
      .from('artists')
      .insert([{ user_id: userInsert.data[0].user_id, vulgo, genre, social_links, portfolio_links }]);
  }
  res.status(201).json({ user: userInsert.data[0], artist: artistInsert?.data?.[0] });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(401).json({ error: error.message });
  const token = jwt.sign({ userId: data.user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
}
