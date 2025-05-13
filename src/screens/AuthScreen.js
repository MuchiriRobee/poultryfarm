import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthScreen = ({ navigation }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [farmName, setFarmName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const validateInputs = () => {
    if (isSignup && (!farmName || farmName.length < 3)) {
      Alert.alert('Error', 'Farm name must be at least 3 characters long');
      return false;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    if (!password || password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateInputs()) return;

    const url = isSignup
      ? 'http://192.168.1.66:5000/api/auth/signup'
      : 'http://192.168.1.66:5000/api/auth/signin';
    const payload = isSignup
      ? { farm_name: farmName, email, password }
      : { email, password };

    try {
      const response = await axios.post(url, payload);
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('farmName', response.data.farm_name);
      navigation.navigate('Landing', { farmName: response.data.farm_name });
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isSignup ? 'Sign Up' : 'Sign In'}</Text>
      {isSignup && (
        <TextInput
          style={styles.input}
          placeholder="Farm Name"
          value={farmName}
          onChangeText={setFarmName}
        />
      )}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title={isSignup ? 'Sign Up' : 'Sign In'} onPress={handleSubmit} />
      <Button
        title={`Switch to ${isSignup ? 'Sign In' : 'Sign Up'}`}
        onPress={() => setIsSignup(!isSignup)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
});

export default AuthScreen;