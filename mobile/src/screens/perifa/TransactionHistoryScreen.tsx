import React, { useMemo, useState } from 'react';
import { View, Text, SectionList, StyleSheet, TouchableOpacity } from 'react-native';

// Types
export type Txn = {
  id: string;
  title: string;
  subtitle?: string;
  amount: number; // positive = entrada, negative = saída
  type: 'credit' | 'debit';
  time: string; // e.g., "08:41"
  date: string; // group key e.g., "Hoje", "Ontem", "02/10/2025"
};

export default function TransactionHistoryScreen() {
  const [filter, setFilter] = useState<'all' | 'credit' | 'debit'>('all');

  const data: Txn[] = useMemo(() => ([
    { id: 't1', title: "Aporte em 'Sarau na Praça'", subtitle: 'Investimento em artista', amount: -500, type: 'debit', time: '09:12', date: 'Hoje' },
    { id: 't2', title: "Rentabilidade recebida", subtitle: "Sarau na Praça", amount: 38.75, type: 'credit', time: '08:41', date: 'Hoje' },
    { id: 't3', title: "Aporte em 'Painéis da Comunidade'", subtitle: 'Investimento em artista', amount: -1000, type: 'debit', time: '20:03', date: 'Ontem' },
    { id: 't4', title: 'Dividendo recebido', subtitle: 'Galeria a céu aberto', amount: 48.9, type: 'credit', time: '12:48', date: 'Ontem' },
    { id: 't5', title: 'Retorno parcial', subtitle: 'Painéis da Comunidade', amount: 120, type: 'credit', time: '10:10', date: '02/10/2025' },
    { id: 't6', title: 'Resgate de cota', subtitle: 'Ritmos da Quebrada', amount: 300, type: 'credit', time: '08:15', date: '02/10/2025' },
  ]), []);

  const sections = useMemo(() => {
    const filtered = filter === 'all' ? data : data.filter(d => d.type === filter);
    const map = new Map<string, Txn[]>();
    filtered.forEach(t => {
      if (!map.has(t.date)) map.set(t.date, []);
      map.get(t.date)!.push(t);
    });
    return Array.from(map.entries()).map(([title, items]) => ({ title, data: items }));
  }, [data, filter]);

  return (
    <View style={styles.container}>
      <View style={styles.header}> 
        <Text style={styles.title}>Histórico</Text>
        <View style={styles.filters}>
          <FilterPill label="Tudo" active={filter==='all'} onPress={() => setFilter('all')} />
          <FilterPill label="Entradas" active={filter==='credit'} onPress={() => setFilter('credit')} />
          <FilterPill label="Saídas" active={filter==='debit'} onPress={() => setFilter('debit')} />
        </View>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{section.title}</Text>
          </View>
        )}
        renderItem={({ item }) => <TxnRow txn={item} />}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
      />
    </View>
  );
}

function FilterPill({ label, active, onPress }: { label: string; active?: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.pill, active && styles.pillActive]}>
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function TxnRow({ txn }: { txn: Txn }) {
  const isCredit = txn.amount >= 0;
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Text style={styles.rowTitle}>{txn.title}</Text>
        <Text style={styles.rowSubtitle}>{txn.subtitle ?? txn.time}</Text>
      </View>
      <View style={styles.rowRight}>
        <Text style={[styles.amount, isCredit ? styles.amountCredit : styles.amountDebit]}>
          {formatAmount(txn.amount)}
        </Text>
        <Text style={styles.time}>{txn.time}</Text>
      </View>
    </View>
  );
}

function formatAmount(n: number) {
  const sign = n >= 0 ? '+' : '-';
  const v = Math.abs(n).toFixed(2).replace('.', ',');
  return `${sign} R$ ${v}`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { paddingTop: 18, paddingHorizontal: 20, paddingBottom: 8, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '800', color: '#0a0a0a' },
  filters: { flexDirection: 'row', gap: 10, marginTop: 12 },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: '#efefef' },
  pillActive: { backgroundColor: '#AAFF00' },
  pillText: { fontWeight: '800', color: '#0a0a0a' },
  pillTextActive: { color: '#0a0a0a' },

  listContent: { paddingBottom: 24 },
  sectionHeader: { backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 10 },
  sectionHeaderText: { fontWeight: '800', color: '#6b6b6b' },

  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  sep: { height: 1, backgroundColor: '#eee', marginLeft: 20 },
  rowLeft: { flexShrink: 1, paddingRight: 10 },
  rowRight: { alignItems: 'flex-end' },
  rowTitle: { fontSize: 16, fontWeight: '700', color: '#0a0a0a' },
  rowSubtitle: { fontSize: 13, color: '#6b6b6b', marginTop: 2 },
  amount: { fontSize: 16, fontWeight: '800' },
  amountCredit: { color: '#2f8f00' },
  amountDebit: { color: '#c1002b' },
  time: { fontSize: 12, color: '#8a8a8a', marginTop: 2 },
});
