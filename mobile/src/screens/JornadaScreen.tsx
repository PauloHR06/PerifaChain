import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Neon green from the reference (AAFF00)
const NEON_GREEN = '#AAFF00';

// Fixed design surface 440 x 956 to match previews
const CANVAS_WIDTH = 440;
const CANVAS_HEIGHT = 956;

type Props = {
  onContinue?: (username: string, password: string) => void;
  onCreateAccount?: () => void;
};

export default function JornadaScreen({ onContinue, onCreateAccount }: Props) {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleContinue = () => {
    onContinue?.(username, password);
  };

  return (
    <View style={styles.root}>
      <View style={styles.canvas}>
        <View style={styles.content}>
          {/* Hero */}
          <View style={styles.hero}>
            <Text style={styles.heroLine}>A SUA</Text>
            <View style={styles.heroMixLine}>
              <Text style={styles.heroNeue}>DE</Text>
              <Text style={styles.heroNetwork}>JORNADA</Text>
            </View>
            <Text style={styles.heroLine}>DE IMPACTO</Text>
            <Text style={[styles.heroLine, styles.heroUnderline]}>COMEÇA <Text style={styles.heroUnderlineMark}>AQUI</Text></Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={[styles.input, styles.inputUser]}>
              <Text style={[styles.icon, styles.userIcon]} accessibilityElementsHidden>✶</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Costa.silveira"
                placeholderTextColor="#9AA0A6"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                returnKeyType="next"
              />
            </View>

            <View style={[styles.input, styles.inputPass]}>
              <Text style={[styles.icon, styles.lockIcon]} accessibilityElementsHidden>🔒</Text>
              <TextInput
                style={styles.textInput}
                placeholder="************"
                placeholderTextColor="#9AA0A6"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
              />
            </View>
          </View>

          {/* CTA */}
          <TouchableOpacity style={styles.btn} activeOpacity={0.9} onPress={handleContinue}>
            <Text style={styles.btnText}>Continuar</Text>
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.foot}>
            <Text style={styles.muted}>
              Ainda não tem conta?{' '}
              <Text style={styles.link} onPress={onCreateAccount}>Crie agora</Text>
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  canvas: {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: NEON_GREEN,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  // Hero
  hero: {
    marginTop: 64,
    alignItems: 'center',
  },
  heroLine: {
    // Neue Montreal Medium 51.55, lineHeight 55.07, letterSpacing -4%, uppercase
    color: '#000',
    fontWeight: '500',
    fontSize: 51.55,
    lineHeight: 55.07,
    letterSpacing: -0.04 * 16, // RN uses px; -0.64 approx. Keep subtle.
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  heroMixLine: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 10 as any,
  },
  heroNeue: {
    color: '#000',
    fontWeight: '500',
    fontSize: 51.55,
    lineHeight: 55.07,
    textTransform: 'uppercase',
  },
  heroNetwork: {
    color: '#000',
    fontWeight: '700', // fallback if custom font not linked
    fontSize: 56,
    lineHeight: 50,
  },
  heroUnderline: {
    fontWeight: '500',
  },
  heroUnderlineMark: {
    borderBottomWidth: 3,
    borderBottomColor: '#000',
  },

  // Form
  form: {
    marginTop: 24,
    gap: 14 as any,
    alignSelf: 'center',
    width: 300,
  },
  input: {
    height: 62,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 118,
    borderWidth: 2,
    borderColor: '#000',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10 as any,
  },
  icon: {
    width: 24,
    textAlign: 'center',
    fontSize: 18,
    color: '#000',
  },
  userIcon: {
    fontSize: 19,
  },
  lockIcon: {
    fontSize: 18,
  },
  textInput: {
    flex: 1,
    borderWidth: 0,
    color: '#111',
    fontSize: 16,
  },

  // Button
  btn: {
    marginTop: 24,
    alignSelf: 'center',
    width: 171,
    height: 54,
    borderRadius: 59,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },

  // Footer
  foot: {
    marginTop: 16,
    alignItems: 'center',
  },
  muted: {
    color: '#000',
    opacity: 0.85,
  },
  link: {
    color: '#000',
    textDecorationLine: 'underline',
    fontWeight: '700',
  },
});
