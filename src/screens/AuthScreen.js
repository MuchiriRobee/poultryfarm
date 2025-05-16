import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons'; // Make sure to install expo/vector-icons

const AuthScreen = ({ navigation }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [farmName, setFarmName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
      navigation.navigate('Main', { farmName: response.data.farm_name });
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Something went wrong');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.innerContainer}>
            <Text style={styles.appTitle}>Farm Manager</Text>
            <View style={styles.formCard}>
              <Text style={styles.title}>{isSignup ? 'Create Account' : 'Welcome Back'}</Text>
              <Text style={styles.subtitle}>
                {isSignup ? 'Sign up to get started' : 'Sign in to continue'}
              </Text>
              
              {isSignup && (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Farm Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your farm name"
                    value={farmName}
                    onChangeText={setFarmName}
                    placeholderTextColor="#999"
                  />
                </View>
              )}
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#999"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    placeholderTextColor="#999"
                  />
                  <TouchableOpacity 
                    onPress={togglePasswordVisibility} 
                    style={styles.passwordToggle}
                  >
                    <Ionicons 
                      name={showPassword ? 'eye-off' : 'eye'} 
                      size={24} 
                      color="#666" 
                    />
                  </TouchableOpacity>
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.submitButton} 
                onPress={handleSubmit}
                activeOpacity={0.8}
              >
                <Text style={styles.submitButtonText}>
                  {isSignup ? 'Create Account' : 'Sign In'}
                </Text>
              </TouchableOpacity>
              
              <View style={styles.switchContainer}>
                <Text style={styles.switchText}>
                  {isSignup ? 'Already have an account?' : "Don't have an account?"}
                </Text>
                <TouchableOpacity onPress={() => setIsSignup(!isSignup)}>
                  <Text style={styles.switchActionText}>
                    {isSignup ? 'Sign In' : 'Sign Up'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc',
  },
  keyboardAvoidView: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2e7d32',
    textAlign: 'center',
    marginBottom: 30,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
    padding: 14,
    borderRadius: 8,
    fontSize: 16,
    color: '#333',
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  passwordInput: {
    flex: 1,
    padding: 14,
    fontSize: 16,
    color: '#333',
  },
  passwordToggle: {
    padding: 10,
  },
  submitButton: {
    backgroundColor: '#2e7d32',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchText: {
    color: '#666',
    fontSize: 14,
  },
  switchActionText: {
    color: '#2e7d32',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 5,
  },
});

export default AuthScreen;