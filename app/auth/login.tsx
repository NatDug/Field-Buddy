import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, View } from '@/components/Themed';
import { signInWithGoogle, signInWithMicrosoft, signInWithApple, signInWithEmail } from '@/lib/auth';
import { router } from 'expo-router';

export default function LoginScreen() {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);

  const handleGoogleSignIn = async () => {
    Alert.alert('Development Mode', 'Authentication is temporarily disabled for testing. Use the bypass option below.');
  };

  const handleMicrosoftSignIn = async () => {
    Alert.alert('Development Mode', 'Authentication is temporarily disabled for testing. Use the bypass option below.');
  };

  const handleAppleSignIn = async () => {
    Alert.alert('Development Mode', 'Authentication is temporarily disabled for testing. Use the bypass option below.');
  };

  const handleEmailButtonPress = () => {
    if (showEmailForm) {
      handleEmailSignIn();
    } else {
      setShowEmailForm(true);
    }
  };

  const handleEmailSignIn = async () => {
    Alert.alert('Development Mode', 'Authentication is temporarily disabled for testing. Use the bypass option below.');
  };

  const handleBypassSignIn = () => {
    Alert.alert(
      'Development Bypass', 
      'This will sign you in with a temporary account for testing. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Continue', 
          onPress: () => {
            Alert.alert('Welcome back!', 'Signed in with temporary account. You can now test the app features.');
            router.replace('/(tabs)/dashboard');
          }
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome to Agriden!</Text>
            <Text style={styles.subtitle}>Sign in to manage your farm</Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.ssoButton, isLoading && styles.disabledButton]}
              onPress={handleGoogleSignIn}
              disabled={isLoading}
            >
              <View style={styles.googleIcon}>
                <Text style={styles.googleIconText}>G</Text>
              </View>
              <Text style={styles.ssoButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.ssoButton, isLoading && styles.disabledButton]}
              onPress={handleMicrosoftSignIn}
              disabled={isLoading}
            >
              <View style={styles.microsoftIcon}>
                <Text style={styles.microsoftIconText}>M</Text>
              </View>
              <Text style={styles.ssoButtonText}>Continue with Microsoft</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.ssoButton, isLoading && styles.disabledButton]}
              onPress={handleAppleSignIn}
              disabled={isLoading}
            >
              <View style={styles.appleIcon}>
                <Text style={styles.appleIconText}>🍎</Text>
              </View>
              <Text style={styles.ssoButtonText}>Continue with Apple</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.formContainer}>
            <TouchableOpacity
              style={[styles.emailButton, isLoading && styles.disabledButton]}
              onPress={handleEmailButtonPress}
              disabled={isLoading}
            >
              <View style={styles.emailIcon}>
                <Text style={styles.emailIconText}>✉️</Text>
              </View>
              <Text style={styles.emailButtonText}>
                {showEmailForm ? 'Sign In' : 'Continue with email'}
              </Text>
            </TouchableOpacity>

            {showEmailForm && (
              <View style={styles.emailForm}>
                <TextInput
                  placeholder="Email or Phone Number"
                  value={emailOrPhone}
                  onChangeText={setEmailOrPhone}
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#999"
                />
                
                <TextInput
                  placeholder="Full Name"
                  value={name}
                  onChangeText={setName}
                  style={styles.input}
                  placeholderTextColor="#999"
                />
              </View>
            )}
          </View>

          <View style={styles.bypassSection}>
            <TouchableOpacity
              style={styles.bypassButton}
              onPress={handleBypassSignIn}
            >
              <Text style={styles.bypassButtonText}>🚀 Development Bypass (No Backend)</Text>
            </TouchableOpacity>
            <Text style={styles.bypassNote}>
              Use this to test the app without authentication
            </Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Don't have an account?{' '}
              <Text style={styles.linkText} onPress={() => router.push('/auth/signup')}>
                Sign up
              </Text>
            </Text>
          </View>
        </View>

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#7C3AED" />
            <Text style={styles.loadingText}>Signing in...</Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    marginBottom: 32,
  },
  ssoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  disabledButton: {
    opacity: 0.6,
  },
  googleIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  googleIconText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  microsoftIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#00BCF2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  microsoftIconText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  appleIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  appleIconText: {
    fontSize: 12,
  },
  ssoButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  formContainer: {
    marginBottom: 32,
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  emailIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  emailIconText: {
    fontSize: 12,
  },
  emailButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  emailForm: {
    marginTop: 16,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    color: '#000000',
  },
  bypassSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  bypassButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 8,
  },
  bypassButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  bypassNote: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  footer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  footerText: {
    fontSize: 16,
    color: '#000000',
  },
  linkText: {
    color: '#7C3AED',
    fontWeight: '500',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7C3AED',
    fontWeight: '500',
  },
});
