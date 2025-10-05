import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

export default function InvestorHomeScreen() {
  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.top}>
          <Text style={styles.hello}>Bem-vindo, Paulo</Text>
          <TouchableOpacity style={[styles.pill, styles.pillGhost]}>
            <Text style={styles.pillGhostText}>Ver carteira</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.grid3}>
          <Stat label="Saldo disponível" value="R$ 8.200" />
          <Stat label="Total investido" value="R$ 35.400" />
          <Stat label="Retorno estimado" value="+12,4%" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Oportunidades</Text>
          <OpportunityCard title="Painéis da Comunidade" tag="Arte urbana" goal="R$ 20.000" progress={72} />
          <OpportunityCard title="Sarau na Praça" tag="Cultura local" goal="R$ 12.000" progress={40} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Minha carteira</Text>
          <Holding title="Galeria a céu aberto" value="R$ 2.400" change="+4,1%" />
          <Holding title="Ritmos da Quebrada" value="R$ 1.800" change="-1,2%" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Atividades</Text>
          <ActivityItem text="Aporte de R$ 1.000 no ‘Painéis da Comunidade’" time="há 1d" />
          <ActivityItem text="Recebido update do projeto ‘Sarau na Praça’" time="há 3d" />
        </View>
      </ScrollView>
    </View>
  );
}

function Stat({ label, value }:{label:string; value:string}) {
  return (
    <View style={styles.kard}>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );
}

function OpportunityCard({ title, tag, goal, progress }:{ title:string; tag:string; goal:string; progress:number }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardMeta}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.badge}>{tag}</Text>
      </View>
      <Text style={styles.goal}>Meta {goal}</Text>
      <View style={styles.bar}><View style={[styles.fill, { width: `${progress}%` }]} /></View>
      <TouchableOpacity style={[styles.btn, { marginTop: 10 }]}>
        <Text style={styles.btnText}>Investir</Text>
      </TouchableOpacity>
    </View>
  );
}

function Holding({ title, value, change }:{ title: string; value: string; change: string }) {
  const neg = change.startsWith('-');
  return (
    <View style={styles.listRow}>
      <Text style={styles.rowTitle}>{title}</Text>
      <Text style={styles.rowValue}>{value} <Text style={[styles.change, neg ? styles.neg : styles.pos]}>{change}</Text></Text>
    </View>
  );
}

function ActivityItem({ text, time }:{ text: string; time: string }) {
  return (
    <View style={styles.listRow}>
      <Text style={styles.rowTitle}>{text}</Text>
      <Text style={styles.time}>{time}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, paddingBottom: 24 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  hello: { fontWeight: '600', fontSize: 18 },
  pill: { borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12 },
  pillGhost: { borderWidth: 1.5, borderColor: '#0003', backgroundColor: 'transparent' },
  pillGhostText: { fontWeight: '700', color: '#0a0a0a' },

  grid3: { flexDirection: 'row', gap: 12 },
  kard: { flex: 1, borderWidth: 2, borderColor: '#AAFF00', borderRadius: 14, padding: 12, backgroundColor: '#fff' },
  kpiValue: { fontWeight: '800', fontSize: 18 },
  kpiLabel: { color: '#333', fontSize: 12 },

  section: { marginTop: 16 },
  sectionTitle: { fontWeight: '600', marginBottom: 8 },

  card: { borderWidth: 2, borderColor: '#AAFF00', borderRadius: 14, padding: 12, backgroundColor: '#fff', marginBottom: 12 },
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontWeight: '700' },
  goal: { color: '#333', marginTop: 4 },
  badge: { fontWeight: '800', borderWidth: 1.5, borderColor: '#0003', borderRadius: 999, paddingVertical: 4, paddingHorizontal: 8 },
  bar: { height: 8, borderRadius: 999, backgroundColor: '#eee', marginTop: 8, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: '#AAFF00' },

  btn: { backgroundColor: '#0a0a0a', borderColor: '#0a0a0a', borderWidth: 2, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, alignSelf: 'flex-start' },
  btnText: { color: '#fff', fontWeight: '700' },

  listRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderStyle: 'dashed', borderColor: '#eee' },
  rowTitle: { fontWeight: '600', flexShrink: 1 },
  rowValue: { fontWeight: '700' },
  change: { fontWeight: '700' },
  pos: { color: '#0c8f00' },
  neg: { color: '#cc0022' },
  time: { color: '#666', fontSize: 12 },
});
