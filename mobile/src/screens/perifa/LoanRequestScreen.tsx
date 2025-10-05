import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';

export default function LoanRequestScreen() {
  const [nome, setNome] = useState('');
  const [idade, setIdade] = useState('');
  const [cep, setCep] = useState('');
  const [projeto, setProjeto] = useState('');
  const [descricao, setDescricao] = useState('');

  const onSubmit = () => {
    if (!nome || !idade || !cep || !projeto || !descricao) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos.');
      return;
    }
    console.log('Pedido de empréstimo:', { nome, idade, cep, projeto, descricao });
    Alert.alert('Sucesso', 'Obrigado! Recebemos seu pedido.');
  };

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.headline}>
          <Text style={styles.h1Line}>AQUI,</Text>
          <Text style={styles.h1Accent}>SONHAR</Text>
          <Text style={styles.h1Line}>É SÓ O COMEÇO →</Text>
        </View>

        <View style={styles.form}>
          <TextInput style={styles.input} placeholder="Seu nome completo" placeholderTextColor="#c9ffc0" value={nome} onChangeText={setNome} />
          <TextInput style={styles.input} placeholder="Idade" placeholderTextColor="#c9ffc0" value={idade} onChangeText={setIdade} keyboardType="number-pad" />
          <TextInput style={styles.input} placeholder="CEP / Local / Comunidade" placeholderTextColor="#c9ffc0" value={cep} onChangeText={setCep} />
          <TextInput style={styles.input} placeholder="O nome do seu Projeto" placeholderTextColor="#c9ffc0" value={projeto} onChangeText={setProjeto} />
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder={'Conte mais sobre o seu projeto.\nQual a visão que move sua ideia?\nDe onde vem a força do seu projeto?\nSeja livre para expressar sua ideia.'}
            placeholderTextColor="#c9ffc0"
            value={descricao}
            onChangeText={setDescricao}
            multiline
          />
        </View>
      </ScrollView>

      <TouchableOpacity onPress={onSubmit} style={styles.cta}>
        <Text style={styles.ctaText}>Continuar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#000' },
  content: { padding: 16, paddingBottom: 160 },
  headline: { marginTop: 10, alignItems: 'center' },
  h1Line: { color: '#fff', // fontFamily: 'NeueMontreal-Medium',
    fontWeight: '500', fontSize: 36, lineHeight: 38, textAlign: 'center' },
  h1Accent: { color: '#AAFF00', fontWeight: '800', fontSize: 44, lineHeight: 46, textAlign: 'center' },
  form: { marginTop: 18, gap: 12 },
  input: { borderWidth: 2, borderColor: '#AAFF00', borderRadius: 10, paddingVertical: 14, paddingHorizontal: 16, color: '#fff' },
  textarea: { minHeight: 120, textAlignVertical: 'top' },
  cta: { position: 'absolute', left: '50%', transform: [{ translateX: -100 }], bottom: 64, backgroundColor: '#fff', paddingHorizontal: 28, paddingVertical: 12, borderRadius: 999 },
  ctaText: { color: '#0a0a0a', fontWeight: '800', fontSize: 16 },
});
