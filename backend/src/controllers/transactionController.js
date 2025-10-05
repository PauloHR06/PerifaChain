import { supabase } from '../config/supabaseClient.js';
export async function listTransactions(req, res) {
  const { data, error } = await supabase.from('transactions').select('*, loans(*), projects(*), users!transactions_from_user_fkey(*), users!transactions_to_user_fkey(*)');
  if (error) return res.status(400).json({ error: error.message });
  res.json({ transactions: data });
}

export async function createTransaction(req, res) {
  const { loan_id, project_id, from_user, to_user, amount, currency, tx_type } = req.body;

  if (!loan_id || !project_id || !from_user || !to_user || !amount || !currency || !tx_type) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }

  const { data, error } = await supabase.from('transactions').insert([
    {
      loan_id,
      project_id,
      from_user,
      to_user,
      amount,
      currency,
      tx_type
    }
  ]).select();

  if (error) return res.status(400).json({ error: error.message });

  res.status(201).json({ transaction: data[0] });
}