import { supabase } from '../config/supabaseClient.js';
export async function listRevenueSources(req, res) {
  const { project_id } = req.query;
  let query = supabase.from('revenue_sources').select('*');
  if (project_id) query = query.eq('project_id', project_id);
  const { data, error } = await query;
  if (error) return res.status(400).json({ error: error.message });
  res.json({ revenues: data });
}



export async function createRevenueSource(req, res) {
  console.log('createRevenueSource chamada');
  const { project_id, source_type, description, amount, oracle_tx_hash } = req.body;

  if (!project_id || !source_type || amount === undefined) {
    return res.status(400).json({ error: 'Campos obrigatórios faltando' });
  }

  const { data, error } = await supabase
    .from('revenue_sources')
    .insert([
      { project_id, source_type, description, amount, oracle_tx_hash }
    ])
    .select();

  if (error) return res.status(400).json({ error: error.message });

  res.status(201).json({ revenue_source: data[0] });
}
