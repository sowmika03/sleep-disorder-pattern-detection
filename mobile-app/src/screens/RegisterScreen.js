import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../utils/constants';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    age: '',
    gender: '',
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Email and password are required');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        age: formData.age ? parseInt(formData.age) : undefined,
        gender: formData.gender || undefined,
      });
      // Navigation will automatically update
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.error ||
        error.message ||
        'Failed to create account. Please check your connection and try again.';
      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email *"
              placeholderTextColor={COLORS.textSecondary}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Password *"
              placeholderTextColor={COLORS.textSecondary}
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              secureTextEntry
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="First Name"
              placeholderTextColor={COLORS.textSecondary}
              value={formData.firstName}
              onChangeText={(text) => setFormData({ ...formData, firstName: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Last Name"
              placeholderTextColor={COLORS.textSecondary}
              value={formData.lastName}
              onChangeText={(text) => setFormData({ ...formData, lastName: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Age"
              placeholderTextColor={COLORS.textSecondary}
              value={formData.age}
              onChangeText={(text) => setFormData({ ...formData, age: text })}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.input}
              placeholder="Gender (male/female/other)"
              placeholderTextColor={COLORS.textSecondary}
              value={formData.gender}
              onChangeText={(text) => setFormData({ ...formData, gender: text })}
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Creating account...' : 'Sign Up'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.linkText}>
                Already have an account? Sign in
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 24,
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    color: COLORS.primary,
    fontSize: 14,
  },
});

