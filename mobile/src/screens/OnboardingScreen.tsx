import React from 'react';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Neon green from the reference (AAFF00)
const NEON_GREEN = '#AAFF00';

// Fixed design surface 440 x 956 as requested
const CANVAS_WIDTH = 440;
const CANVAS_HEIGHT = 956;

type Props = {
  onPressLogin?: () => void;
};

export default function OnboardingScreen({ onPressLogin }: Props) {
  return (
    <View style={styles.root}>
      <View style={styles.canvas}>
        <ImageBackground
          source={require('../../../assets/Imagem fundo (1).png')}
          resizeMode="cover"
          style={styles.bg}
          imageStyle={styles.bgImage}
        >
          <View style={styles.overlay} pointerEvents="none" />
          {/* Logo/Title stylized text */}
          <View style={styles.titleBlock}>
            <Text style={[styles.titleLine, styles.titleMain]}>PERIFA</Text>
            <Text style={[styles.titleLine, styles.titleScribble]}>CHAIN</Text>
          </View>

          {/* CTA Button */}
          <View style={styles.ctaWrapper}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.ctaButton}
              onPress={onPressLogin}
              accessibilityRole="button"
              accessibilityLabel="Ir para a tela de login"
              testID="onboarding-login-button"
            >
              <Text style={styles.ctaText}>Login  →</Text>
            </TouchableOpacity>
          </View>

          {/* Caption */}
          <View style={styles.captionWrapper}>
            <Text style={styles.caption}>
              PRA VOCÊ QUE PRECISA{'\n'}
PENSAR <Text style={styles.captionHighlight}>DIFERENTE</Text>
            </Text>
          </View>
        </ImageBackground>
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
    backgroundColor: '#111',
  },
  bg: {
    flex: 1,
    justifyContent: 'space-between',
  },
  bgImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  titleBlock: {
    marginTop: 140,
    marginLeft: 24,
  },
  titleLine: {
    color: NEON_GREEN,
    letterSpacing: 2,
  },
  titleMain: {
    fontSize: 72,
    fontWeight: '800',
  },
  titleScribble: {
    fontSize: 64,
    fontWeight: '900',
  },
  ctaWrapper: {
    alignItems: 'center',
  },
  ctaButton: {
    backgroundColor: NEON_GREEN,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 24,
    alignSelf: 'center',
  },
  ctaText: {
    color: '#0A0A0A',
    fontSize: 18,
    fontWeight: '700',
  },
  captionWrapper: {
    padding: 24,
  },
  caption: {
    color: '#EDEDED',
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'left',
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  captionHighlight: {
    color: '#FFFFFF',
    textDecorationLine: 'underline',
  },
});
