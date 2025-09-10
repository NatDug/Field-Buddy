import { useState } from 'react';
import { StyleSheet, TextInput, Button, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Text, View } from '@/components/Themed';
import { signInWithGoogle, signInWithMicrosoft, signInWithApple, signInWithEmail } from '@/lib/auth';
import { router } from 'expo-router';

export default function LoginScreen() {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result.isNewUser) {
        Alert.alert('Welcome!', 'Account created successfully. Please complete your farm profile.');
      } else {
        Alert.alert('Welcome back!', 'Signed in successfully.');
      }
      router.replace('/(tabs)/dashboard');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicrosoftSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithMicrosoft();
      if (result.isNewUser) {
        Alert.alert('Welcome!', 'Account created successfully. Please complete your farm profile.');
      } else {
        Alert.alert('Welcome back!', 'Signed in successfully.');
      }
      router.replace('/(tabs)/dashboard');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to sign in with Microsoft');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithApple();
      if (result.isNewUser) {
        Alert.alert('Welcome!', 'Account created successfully. Please complete your farm profile.');
      } else {
        Alert.alert('Welcome back!', 'Signed in successfully.');
      }
      router.replace('/(tabs)/dashboard');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to sign in with Apple');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async () => {
    if (!emailOrPhone.trim() || !name.trim()) {
      Alert.alert('Error', 'Please enter both email/phone and name');
      return;
    }

    setIsLoading(true);
    try {
      const result = await signInWithEmail(emailOrPhone.trim(), name.trim());
      Alert.alert('Welcome back!', 'Signed in successfully.');
      router.replace('/(tabs)/dashboard');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to Agriden</Text>
        <Text style={styles.subtitle}>Sign in to manage your farm</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sign in with SSO</Text>
        
        <Button
          title="Continue with Google"
          onPress={handleGoogleSignIn}
          disabled={isLoading}
        />
        
        <View style={styles.buttonSpacing} />
        
        <Button
          title="Continue with Microsoft"
          onPress={handleMicrosoftSignIn}
          disabled={isLoading}
        />
        
        <View style={styles.buttonSpacing} />
        
        <Button
          title="Continue with Apple"
          onPress={handleAppleSignIn}
          disabled={isLoading}
        />
      </View>

      <View style={styles.divider}>
        <Text style={styles.dividerText}>or</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sign in with Email/Phone</Text>
        
        <TextInput
          placeholder="Email or Phone Number"
          value={emailOrPhone}
          onChangeText={setEmailOrPhone}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        
        <Button
          title="Sign In"
          onPress={handleEmailSignIn}
          disabled={isLoading}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Don't have an account?{' '}
          <Text style={styles.linkText} onPress={() => router.push('/auth/signup')}>
            Sign up
          </Text>
        </Text>
      </View>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.loadingText}>Signing in...</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  buttonSpacing: {
    height: 12,
  },
  divider: {
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerText: {
    fontSize: 16,
    color: '#666',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 16,
    color: '#666',
  },
  linkText: {
    color: '#0066cc',
    fontWeight: 'bold',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#0066cc',
  },
});
