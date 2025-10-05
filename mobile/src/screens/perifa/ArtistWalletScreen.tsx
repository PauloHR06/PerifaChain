import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';

export default function ArtistWalletScreen() {
  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.account}>
          <View style={styles.who}>
            <Text style={styles.name}>PC_CONTA{"\n"}DA LÍVIA</Text>
            <View style={styles.line} />
          </View>
          <Image source={require('../../../assets/liviamc.png')} style={styles.avatar} />
        </View>

        <View style={styles.balance}>
          <Text style={styles.balanceLabel}>Saldo</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.amount}>R$ 650,00</Text>
            <TouchableOpacity><Text style={styles.arrow}>→</Text></TouchableOpacity>
          </View>
        </View>

        <View style={styles.chips}>
          <TouchableOpacity style={[styles.chip, styles.chipPrimary]}><Text style={styles.chipTextDark}>PIX</Text></TouchableOpacity>
          <TouchableOpacity style={styles.chip}><Text style={styles.chipText}>Pagar</Text></TouchableOpacity>
          <TouchableOpacity style={styles.chip}><Text style={styles.chipText}>Extrato</Text></TouchableOpacity>
        </View>

        <TouchableOpacity><Text style={styles.allOptions}>TODAS AS OPÇÕES DA SUA CONTA</Text></TouchableOpacity>

        <View style={styles.promoCard}>
          {/* Forma superior apenas */}
          <View style={styles.shapeA} />
          <View style={styles.promoCopy}>
            <Text style={styles.promoTitle}>FINANÇAS{"\n"}PARA ARTISTAS{"
"}DA QUEBRADA</Text>
            <Text style={styles.promoDesc}>Descubra como organizar sua grana, investir no seu talento e transformar sua arte, sem perder sua essência.</Text>
          </View>
        </View>

        <View style={styles.help}>
          <TouchableOpacity style={styles.helpBtn}><Text style={styles.helpText}>Central de ajuda →</Text></TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#fff' },
  content: { paddingHorizontal: 28, paddingTop: 16, paddingBottom: 104, gap: 22 },

  account: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  who: { },
  name: { fontWeight: '700', fontSize: 18, letterSpacing: .2 },
  line: { width: 92, height: 2, backgroundColor: '#000', opacity: .25, marginTop: 8, borderRadius: 2 },
  avatar: { width: 56, height: 56, borderRadius: 28 },

  balance: { marginTop: 8 },
  balanceLabel: { color: '#7c7c7c', fontSize: 14 },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  amount: { fontSize: 52, fontWeight: '800', letterSpacing: .2 },
  arrow: { fontSize: 26 },

  chips: { flexDirection: 'row', gap: 12, marginTop: 8 },
  chip: { backgroundColor: '#efefef', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 999 },
  chipPrimary: { backgroundColor: '#AAFF00', shadowColor: '#AAFF00', shadowOpacity: .35, shadowRadius: 18 },
  chipText: { fontWeight: '800', color: '#0a0a0a', fontSize: 14 },
  chipTextDark: { fontWeight: '800', color: '#0a0a0a', fontSize: 14 },

  allOptions: { marginTop: 6, marginBottom: 8, color: '#000', textDecorationLine: 'underline', fontWeight: '800', letterSpacing: .3, fontSize: 14 },

  promoCard: { backgroundColor: '#AAFF00', borderRadius: 32, padding: 36, minHeight: 300, overflow: 'hidden', marginTop: 4 },
  shapeA: { position: 'absolute', top: -26, left: '70%', width: 176, height: 88, backgroundColor: '#0a0a0a', borderBottomLeftRadius: 22 },
  promoCopy: { },
  promoTitle: { fontWeight: '700', fontSize: 28, lineHeight: 30 },
  promoDesc: { marginTop: 16, color: '#132', fontSize: 14 },

  help: { alignItems: 'center', marginTop: 8 },
  helpBtn: { backgroundColor: '#f4f4f4', borderRadius: 24, paddingVertical: 18, paddingHorizontal: 20, width: '90%' },
  helpText: { textAlign: 'center', fontWeight: '800', fontSize: 16 },
});
