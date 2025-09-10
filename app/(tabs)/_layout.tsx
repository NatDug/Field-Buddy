import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import AuthGuard from '@/components/AuthGuard';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthGuard>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          // Disable the static render of the header on web
          // to prevent a hydration error in React Navigation v6.
          headerShown: useClientOnlyValue(false, true),
        }}>
        <Tabs.Screen name="dashboard" options={{ title: 'Dashboard', tabBarIcon: ({ color }) => <TabBarIcon name="tachometer" color={color} /> }} />
        <Tabs.Screen name="crops" options={{ title: 'Crops', tabBarIcon: ({ color }) => <TabBarIcon name="leaf" color={color} /> }} />
        <Tabs.Screen name="tasks" options={{ title: 'Tasks', tabBarIcon: ({ color }) => <TabBarIcon name="check-square" color={color} /> }} />
        <Tabs.Screen name="expenses" options={{ title: 'Expenses', tabBarIcon: ({ color }) => <TabBarIcon name="dollar" color={color} /> }} />
        <Tabs.Screen name="alerts" options={{ title: 'Alerts', tabBarIcon: ({ color }) => <TabBarIcon name="bell" color={color} /> }} />
        <Tabs.Screen name="reports" options={{ title: 'Reports', tabBarIcon: ({ color }) => <TabBarIcon name="file-text" color={color} /> }} />
        <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} /> }} />
      </Tabs>
    </AuthGuard>
  );
}
