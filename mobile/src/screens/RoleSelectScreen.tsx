import React from 'react';
import { Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BgImage from '../../../assets/Imagem fundo (1).png';
import Logo from '../../../assets/logoperifa.png';

// Neon green from the reference (AAFF00)
const NEON_GREEN = '#AAFF00';

// Fixed design surface 440 x 956 as requested (same as OnboardingScreen)
const CANVAS_WIDTH = 440;
const CANVAS_HEIGHT = 956;

export type RoleSelectProps = {
  onPressInvestor?: () => void;
  onPressArtist?: () => void;
};

export default function RoleSelectScreen({ onPressInvestor, onPressArtist }: RoleSelectProps) {
  // Match initial screen: logo width at 150% of canvas, preserve aspect ratio
  const logoMeta = Image.resolveAssetSource(Logo);
  const logoAspect = logoMeta?.width && logoMeta?.height ? (logoMeta.width / logoMeta.height) : (2);
  const logoDisplayWidth = CANVAS_WIDTH * 1.5; // 150% of canvas width
  const logoDisplayHeight = logoDisplayWidth / logoAspect;
  return (
    <View style={styles.root}>
      <View style={styles.canvas}>
        <ImageBackground
          source={BgImage}
          resizeMode="cover"
          style={styles.bg}
          imageStyle={styles.bgImage}
        >
          <View style={styles.overlay} pointerEvents="none" />

          {/* Centered area for the logo */}
          <View style={styles.centerArea}>
            <View style={styles.logoWrapper}>
              <Image
                source={Logo}
                style={[styles.logo, { width: logoDisplayWidth, height: logoDisplayHeight }]}
                resizeMode="contain"
                accessibilityIgnoresInvertColors
              />
            </View>
          </View>

          {/* Role buttons */}
          <View style={styles.rolesWrapper}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.roleButton}
              onPress={onPressInvestor}
              accessibilityRole="button"
              accessibilityLabel="Selecionar perfil Investidor"
              testID="role-investor"
            >
              <Text style={styles.roleText}>Investidor</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.roleButton}
              onPress={onPressArtist}
              accessibilityRole="button"
              accessibilityLabel="Selecionar perfil Artista"
              testID="role-artist"
            >
              <Text style={styles.roleText}>Artista</Text>
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
    justifyContent: 'flex-start',
  },
  bgImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  centerArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 280,
    height: 140,
  },
  rolesWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16 as any, // RN web supports gap; native may ignore. Safe-fallback below.
    columnGap: 16 as any,
    marginTop: 64,
  },
  roleButton: {
    backgroundColor: NEON_GREEN,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    marginHorizontal: 8, // fallback if gap not supported
  },
  roleText: {
    color: '#0A0A0A',
    fontSize: 16,
    fontWeight: '700',
  },
  captionWrapper: {
    padding: 24,
    alignItems: 'center',
  },
  caption: {
    color: '#EDEDED',
    fontSize: 26.49,
    lineHeight: 26.49,
    textAlign: 'center',
    textTransform: 'uppercase',
    fontWeight: '500',
    letterSpacing: 0,
    // If the custom font is linked in native projects, set its postscript name below.
    // fontFamily: 'NeueMontreal-Medium',
  },
  captionHighlight: {
    color: '#FFFFFF',
    textDecorationLine: 'underline',
  },
});
