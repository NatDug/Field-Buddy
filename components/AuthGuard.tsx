import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Text } from '@/components/Themed';
import { useAuth } from '@/lib/auth-context';
import { router } from 'expo-router';
import { useEffect } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth();

  // Temporarily disable auth guard for development
  // useEffect(() => {
  //   if (!isLoading && !isAuthenticated) {
  //     // Redirect to login if not authenticated
  //     router.replace('/auth/login');
  //   }
  // }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Always allow access during development
  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#0066cc',
  },
});
