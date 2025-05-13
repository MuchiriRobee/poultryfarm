import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const LandingScreen = ({ route }) => {
  const { farmName } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to {farmName}</Text>
      <Text style={styles.subtitle}>Your Poultry Farm Management Dashboard</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 18, color: '#666' },
});

export default LandingScreen;