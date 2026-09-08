import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Animated, Image } from 'react-native';

interface LoadingScreenProps {
  message?: string;
}

// Branded full-screen loading state, shown while the app's initial data is
// still in flight (first Explore-tab fetch, restaurant detail fetch, etc).
// Mirrors the native splash screen's look (same background/icon) so the
// transition from cold-start splash into the app reads as one continuous
// moment instead of a jarring cut to a bare spinner.
export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Discovering restaurants...',
}) => {
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fade]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fade }]}>
        <Image
          source={require('@/assets/images/icon.png')}
          style={styles.logo}
          accessible={false}
        />
        <Text style={styles.title}>VI Eats</Text>
        <Text style={styles.tagline}>Restaurants of the Virgin Islands</Text>
        <ActivityIndicator size="small" color="#00BCD4" style={styles.spinner} />
        <Text style={styles.message}>{message}</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00647A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 24,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 6,
    marginBottom: 32,
  },
  spinner: {
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
  },
});
