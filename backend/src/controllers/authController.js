import { supabase } from '../config/supabaseClient.js';
import jwt from 'jsonwebtoken';
import { Wallet } from 'ethers';

export async function register(req, res) {
  const { name, email, password, role, phone } = req.body;

  // 1. Cadastro no Auth do Supabase
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return res.status(400).json({ error: error.message });
  const { user } = data;

  // 2. Gera wallet blockchain (ETH/Solana/etc)
  const newWallet = Wallet.createRandom();

  // 3. Cadastro no banco (tabela users)
  const userInsert = await supabase
    .from('users')
    .insert([
      {
        name,
        email,
        role,
        wallet_address: newWallet.address,
        phone
      }
    ])
    .select();

  if (!userInsert?.data || !userInsert.data.length) {
    return res.status(500).json({ error: userInsert?.error?.message || "Falha ao cadastrar usuário no banco" });
  }

 
  res.status(201).json({
    user: userInsert.data[0],
   
    
  });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return res.status(401).json({ error: error.message });

  const token = jwt.sign(
    { userId: data.user.id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({ token });
}
