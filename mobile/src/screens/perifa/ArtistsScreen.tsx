import React, { useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_W = Math.round(width * 0.86);

const DATA = [
  {
    id: 'livia',
    name: 'LÍVIA\nRAMOS',
    bio: 'Muralista que transforma muros da comunidade em painéis de histórias locais.'
  },
  {
    id: 'bruno',
    name: 'BRUNO\nSANTOS',
    bio: 'Beatmaker e produtor que revela novos talentos com sons originais da quebrada.'
  },
  {
    id: 'yasmin',
    name: 'YASMIN\nALMEIDA',
    bio: 'Fotógrafa documental que registra a força e a beleza das periferias brasileiras.'
  },
];

export default function ArtistsScreen() {
  const ref = useRef<FlatList>(null);

  const renderItem = ({ item, index }: any) => (
    <View style={[styles.card, index === 1 && styles.cardDark]}> 
      <View style={styles.cardInner}>
        <View style={styles.cardCopy}>
          <Text style={[styles.artistName, index === 1 && styles.artistNameLight]}>{item.name}</Text>
          <Text style={[styles.artistBio, index === 1 && styles.artistBioLight]}>{item.bio}</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.btn, styles.btnPrimary, index === 1 && styles.brunoPrimary]}> 
              <Text style={styles.btnPrimaryText}>Investir</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnGhost, index !== 1 && styles.btnGhostDark]}> 
              <Text style={[styles.btnGhostText, index === 1 ? styles.btnGhostTextLight : styles.btnGhostTextDark]}>Conheça mais</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.page}>
      <Text style={styles.title}>ARTISTAS <Text style={styles.tag}>#PERIFA</Text></Text>

      <FlatList
        ref={ref}
        data={DATA}
        keyExtractor={(it) => it.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToAlignment="start"
        pagingEnabled={false}
        decelerationRate="fast"
        snapToInterval={CARD_W + 16}
        contentContainerStyle={{ paddingHorizontal: 8 }}
        ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
        renderItem={renderItem}
      />

      <Text style={styles.hint}>Passe para o lado, conheça e invista em quem nasce na quebrada e gera impacto no mundo.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#fff', paddingTop: 24, paddingHorizontal: 16 },
  title: {
    // fontFamily: 'NeueMontreal-Medium',
    fontWeight: '500',
    fontSize: 28,
    textAlign: 'center',
  },
  tag: {
    // fontFamily: 'NetworkFreeVersion',
    fontWeight: '800',
  },
  card: {
    width: CARD_W,
    backgroundColor: '#AAFF00',
    borderRadius: 28,
    padding: 18,
  },
  cardDark: { backgroundColor: '#111' },
  cardInner: { flexDirection: 'row', alignItems: 'flex-end' },
  cardCopy: { flex: 1 },
  artistName: { fontWeight: '800', fontSize: 26, lineHeight: 26, marginBottom: 12 },
  artistNameLight: { color: '#fff' },
  artistBio: { color: '#0a0a0a', marginBottom: 18 },
  artistBioLight: { color: '#eaeaea' },
  actions: { marginTop: 'auto', gap: 10 },
  btn: { borderRadius: 22, paddingVertical: 10, paddingHorizontal: 16, alignItems: 'center' },
  btnPrimary: { backgroundColor: '#0a0a0a' },
  brunoPrimary: { backgroundColor: '#AAFF00' },
  btnPrimaryText: { color: '#fff', fontWeight: '700' },
  btnGhost: { borderWidth: 1.5, borderColor: '#ffffff55', backgroundColor: 'transparent' },
  btnGhostDark: { borderColor: '#0a0a0a55' },
  btnGhostText: { fontSize: 12, fontWeight: '700' },
  btnGhostTextLight: { color: '#fff' },
  btnGhostTextDark: { color: '#0a0a0a' },
  hint: { textAlign: 'center', marginTop: 16, paddingHorizontal: 24, fontSize: 13 },
});
