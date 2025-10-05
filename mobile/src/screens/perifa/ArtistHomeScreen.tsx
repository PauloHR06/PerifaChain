import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

export default function ArtistHomeScreen() {
  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.top}>
          <Text style={styles.hello}>Olá, Lívia</Text>
          <TouchableOpacity style={[styles.pill, styles.pillGhost]}>
            <Text style={styles.pillGhostText}>Ver mensagens</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.grid3}>
          <KpiCard label="Projetos ativos" value="2" />
          <KpiCard label="Investimentos recebidos" value="R$ 12.500" />
          <KpiCard label="Seguidores" value="1.284" />
        </View>

        <View style={styles.quick}>
          <Action label="Novo Projeto" />
          <Action label="Atualizar Projeto" />
          <Action label="Minhas Mensagens" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meus projetos</Text>
          <ProjectCard title="Painéis da Comunidade" status="Arrecadando" progress={72} goal="R$ 20.000" />
          <ProjectCard title="Galeria a céu aberto" status="Em execução" progress={35} goal="R$ 15.000" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Atualizações</Text>
          <FeedItem title="Novo apoio de R$ 500" subtitle="por @bruno_s" time="há 2h" />
          <FeedItem title="Comentário no projeto" subtitle="“Incrível!”" time="há 5h" />
        </View>
      </ScrollView>
    </View>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.kard}>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );
}

function Action({ label }: { label: string }) {
  return (
    <TouchableOpacity style={styles.btn}> 
      <Text style={styles.btnText}>{label}</Text>
    </TouchableOpacity>
  );
}

function ProjectCard({ title, status, progress, goal }:{ title: string; status: string; progress: number; goal: string }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardMeta}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.badge}>{status}</Text>
      </View>
      <View style={styles.bar}><View style={[styles.fill, { width: `${progress}%` }]} /></View>
      <View style={styles.cardFoot}>
        <Text style={styles.footText}>{progress}%</Text>
        <Text style={styles.footText}>Meta {goal}</Text>
      </View>
    </View>
  );
}

function FeedItem({ title, subtitle, time }:{ title: string; subtitle: string; time: string }) {
  return (
    <View style={styles.listRow}>
      <View>
        <Text style={styles.feedTitle}>{title}</Text>
        <Text style={styles.feedSub}>{subtitle}</Text>
      </View>
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

  quick: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  btn: { backgroundColor: '#0a0a0a', borderColor: '#0a0a0a', borderWidth: 2, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12 },
  btnText: { color: '#fff', fontWeight: '700' },

  section: { marginTop: 16 },
  sectionTitle: { fontWeight: '600', marginBottom: 8 },
  card: { borderWidth: 2, borderColor: '#AAFF00', borderRadius: 14, padding: 12, backgroundColor: '#fff', marginBottom: 12 },
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontWeight: '700' },
  badge: { fontWeight: '800', borderWidth: 1.5, borderColor: '#0003', borderRadius: 999, paddingVertical: 4, paddingHorizontal: 8 },
  bar: { height: 8, borderRadius: 999, backgroundColor: '#eee', marginTop: 8, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: '#AAFF00' },
  cardFoot: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  footText: { color: '#333', fontSize: 12 },

  listRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 10, borderBottomWidth: 1, borderStyle: 'dashed', borderColor: '#eee' },
  feedTitle: { fontWeight: '700' },
  feedSub: { color: '#666', fontSize: 12 },
  time: { color: '#666', fontSize: 12 },
});
