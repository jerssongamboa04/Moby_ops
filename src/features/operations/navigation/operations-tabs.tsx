import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors } from '../../../theme/tokens';

export function OperationsTabs() {
  const { t } = useTranslation('operations');

  return (
    <Tabs
      initialRouteName="index"
      backBehavior="initialRoute"
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.charcoal,
        tabBarStyle: { backgroundColor: colors.white, borderTopColor: colors.border },
        tabBarItemStyle: { paddingVertical: 4 },
        tabBarLabelStyle: { fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('home'),
          tabBarAccessibilityLabel: t('home'),
          tabBarButtonTestID: 'tab-home',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={[styles.icon, focused && styles.iconActive]}><Ionicons name={focused ? 'home' : 'home-outline'} color={color} size={size} /></View>
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: t('tasks'),
          tabBarAccessibilityLabel: t('tasks'),
          tabBarButtonTestID: 'tab-tasks',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={[styles.icon, focused && styles.iconActive]}><Ionicons name={focused ? 'list' : 'list-outline'} color={color} size={size} /></View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile'),
          tabBarAccessibilityLabel: t('profile'),
          tabBarButtonTestID: 'tab-profile',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={[styles.icon, focused && styles.iconActive]}><Ionicons name={focused ? 'person' : 'person-outline'} color={color} size={size} /></View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  icon: { width: 54, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 15 },
  iconActive: { backgroundColor: colors.neon },
});
