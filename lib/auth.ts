import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { executeAsync } from './db';

// Configure WebBrowser for OAuth
WebBrowser.maybeCompleteAuthSession();

export interface User {
  id: number;
  email?: string;
  phone?: string;
  name: string;
  provider?: string;
  provider_id?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResult {
  user: User;
  isNewUser: boolean;
}

// OAuth Configuration
const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';
const MICROSOFT_CLIENT_ID = process.env.EXPO_PUBLIC_MICROSOFT_CLIENT_ID || 'YOUR_MICROSOFT_CLIENT_ID';

const GOOGLE_REDIRECT_URI = process.env.EXPO_PUBLIC_GOOGLE_REDIRECT_URI || 
  AuthSession.makeRedirectUri({
    scheme: 'agriden',
    path: 'auth/google',
  });

const MICROSOFT_REDIRECT_URI = process.env.EXPO_PUBLIC_MICROSOFT_REDIRECT_URI || 
  AuthSession.makeRedirectUri({
    scheme: 'agriden',
    path: 'auth/microsoft',
  });

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const token = await SecureStore.getItemAsync('auth_token');
    if (!token) return null;

    const res = await executeAsync(
      'SELECT * FROM users WHERE id = ? AND is_active = 1',
      [parseInt(token)]
    );
    
    return res.rows._array[0] || null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle(): Promise<AuthResult> {
  try {
    const request = new AuthSession.AuthRequest({
      clientId: GOOGLE_CLIENT_ID,
      scopes: ['openid', 'profile', 'email'],
      redirectUri: GOOGLE_REDIRECT_URI,
      responseType: AuthSession.ResponseType.Code,
      extraParams: {},
      additionalParameters: {},
    });

    const result = await request.promptAsync({
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    });

    if (result.type === 'success') {
      // Exchange code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          code: result.params.code,
          grant_type: 'authorization_code',
          redirect_uri: GOOGLE_REDIRECT_URI,
        }).toString(),
      });

      const tokens = await tokenResponse.json();
      
      // Get user info
      const userInfoResponse = await fetch(
        `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokens.access_token}`
      );
      const userInfo = await userInfoResponse.json();

      return await createOrUpdateUser({
        email: userInfo.email,
        name: userInfo.name,
        provider: 'google',
        provider_id: userInfo.id,
        avatar_url: userInfo.picture,
      });
    } else {
      throw new Error('Google authentication cancelled or failed');
    }
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
}

/**
 * Sign in with Microsoft
 */
export async function signInWithMicrosoft(): Promise<AuthResult> {
  try {
    const request = new AuthSession.AuthRequest({
      clientId: MICROSOFT_CLIENT_ID,
      scopes: ['openid', 'profile', 'email'],
      redirectUri: MICROSOFT_REDIRECT_URI,
      responseType: AuthSession.ResponseType.Code,
      extraParams: {},
      additionalParameters: {},
    });

    const result = await request.promptAsync({
      authorizationEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    });

    if (result.type === 'success') {
      // Exchange code for tokens
      const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: MICROSOFT_CLIENT_ID,
          code: result.params.code,
          grant_type: 'authorization_code',
          redirect_uri: MICROSOFT_REDIRECT_URI,
        }).toString(),
      });

      const tokens = await tokenResponse.json();
      
      // Get user info
      const userInfoResponse = await fetch(
        `https://graph.microsoft.com/v1.0/me?access_token=${tokens.access_token}`
      );
      const userInfo = await userInfoResponse.json();

      return await createOrUpdateUser({
        email: userInfo.mail || userInfo.userPrincipalName,
        name: userInfo.displayName,
        provider: 'microsoft',
        provider_id: userInfo.id,
        avatar_url: undefined, // Microsoft Graph doesn't provide avatar in basic profile
      });
    } else {
      throw new Error('Microsoft authentication cancelled or failed');
    }
  } catch (error) {
    console.error('Microsoft sign-in error:', error);
    throw error;
  }
}

/**
 * Sign in with Apple (iCloud)
 */
export async function signInWithApple(): Promise<AuthResult> {
  try {
    // Apple Sign-In implementation would go here
    // This requires additional setup with Apple Developer account
    throw new Error('Apple Sign-In not yet implemented');
  } catch (error) {
    console.error('Apple sign-in error:', error);
    throw error;
  }
}

/**
 * Sign up with email and phone
 */
export async function signUpWithEmail(
  email: string,
  phone: string,
  name: string
): Promise<AuthResult> {
  try {
    // Check for existing users
    const existingEmail = await executeAsync(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (existingEmail.rows._array.length > 0) {
      throw new Error('Email already registered');
    }

    const existingPhone = await executeAsync(
      'SELECT id FROM users WHERE phone = ?',
      [phone]
    );
    
    if (existingPhone.rows._array.length > 0) {
      throw new Error('Phone number already registered');
    }

    return await createOrUpdateUser({
      email,
      phone,
      name,
      provider: 'email',
    });
  } catch (error) {
    console.error('Email sign-up error:', error);
    throw error;
  }
}

/**
 * Sign in with email/phone
 */
export async function signInWithEmail(
  emailOrPhone: string,
  name: string
): Promise<AuthResult> {
  try {
    const res = await executeAsync(
      'SELECT * FROM users WHERE (email = ? OR phone = ?) AND name = ? AND is_active = 1',
      [emailOrPhone, emailOrPhone, name]
    );
    
    const user = res.rows._array[0];
    if (!user) {
      throw new Error('User not found or invalid credentials');
    }

    await SecureStore.setItemAsync('auth_token', user.id.toString());
    return { user, isNewUser: false };
  } catch (error) {
    console.error('Email sign-in error:', error);
    throw error;
  }
}

/**
 * Create or update user in database
 */
async function createOrUpdateUser(userData: {
  email?: string;
  phone?: string;
  name: string;
  provider?: string;
  provider_id?: string;
  avatar_url?: string;
}): Promise<AuthResult> {
  try {
    // Check if user already exists
    let existingUser = null;
    
    if (userData.email) {
      const emailRes = await executeAsync(
        'SELECT * FROM users WHERE email = ?',
        [userData.email]
      );
      existingUser = emailRes.rows._array[0];
    }
    
    if (!existingUser && userData.phone) {
      const phoneRes = await executeAsync(
        'SELECT * FROM users WHERE phone = ?',
        [userData.phone]
      );
      existingUser = phoneRes.rows._array[0];
    }

    if (existingUser) {
      // Update existing user
      await executeAsync(
        'UPDATE users SET name = ?, provider = ?, provider_id = ?, avatar_url = ?, updated_at = datetime("now") WHERE id = ?',
        [userData.name, userData.provider, userData.provider_id, userData.avatar_url, existingUser.id]
      );
      
      await SecureStore.setItemAsync('auth_token', existingUser.id.toString());
      return { user: { ...existingUser, ...userData }, isNewUser: false };
    } else {
      // Create new user
      const res = await executeAsync(
        'INSERT INTO users (email, phone, name, provider, provider_id, avatar_url) VALUES (?, ?, ?, ?, ?, ?)',
        [userData.email || null, userData.phone || null, userData.name, userData.provider || null, userData.provider_id || null, userData.avatar_url || null]
      );
      
      const newUser = {
        id: res.insertId,
        email: userData.email,
        phone: userData.phone,
        name: userData.name,
        provider: userData.provider,
        provider_id: userData.provider_id,
        avatar_url: userData.avatar_url,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      await SecureStore.setItemAsync('auth_token', newUser.id.toString());
      return { user: newUser, isNewUser: true };
    }
  } catch (error) {
    console.error('Error creating/updating user:', error);
    throw error;
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync('auth_token');
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}
