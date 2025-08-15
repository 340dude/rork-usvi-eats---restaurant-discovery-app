import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { 
  User, 
  Bell, 
  MapPin, 
  HelpCircle, 
  MessageSquare,
  Shield,
  LogOut,
  ChevronRight,
  Star,
  Clock,
  Store,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

type MenuItem = {
  icon: any;
  label: string;
  action?: () => void;
  toggle?: boolean;
  value?: boolean;
  onToggle?: (value: boolean) => void;
};

type MenuSection = {
  section: string;
  items: MenuItem[];
};

export default function ProfileScreen() {
  const [notifications, setNotifications] = React.useState(true);
  const [locationServices, setLocationServices] = React.useState(true);
  const [hurricaneMode, setHurricaneMode] = React.useState(false);
  const router = useRouter();

  const menuItems: MenuSection[] = [
    {
      section: 'Restaurant Owner',
      items: [
        { icon: Store, label: 'Restaurant Dashboard', action: () => router.push('/admin/dashboard') },
      ],
    },
    {
      section: 'Account',
      items: [
        { icon: User, label: 'Edit Profile', action: () => {} },
        { icon: Star, label: 'Your Reviews', action: () => {} },
        { icon: Clock, label: 'Recently Viewed', action: () => {} },
      ],
    },
    {
      section: 'Preferences',
      items: [
        { 
          icon: Bell, 
          label: 'Notifications', 
          toggle: true,
          value: notifications,
          onToggle: setNotifications,
        },
        { 
          icon: MapPin, 
          label: 'Location Services', 
          toggle: true,
          value: locationServices,
          onToggle: setLocationServices,
        },
        { 
          icon: Shield, 
          label: 'Hurricane Mode', 
          toggle: true,
          value: hurricaneMode,
          onToggle: setHurricaneMode,
        },
      ],
    },
    {
      section: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help & FAQ', action: () => {} },
        { icon: MessageSquare, label: 'Contact Us', action: () => {} },
        { icon: Shield, label: 'Privacy Policy', action: () => {} },
      ],
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <User size={40} color="#fff" />
        </View>
        <Text style={styles.name}>Guest User</Text>
        <Text style={styles.email}>Sign in to sync your favorites</Text>
        <TouchableOpacity style={styles.signInButton}>
          <Text style={styles.signInText}>Sign In / Sign Up</Text>
        </TouchableOpacity>
      </View>

      {menuItems.map((section) => (
        <View key={section.section} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.section}</Text>
          {section.items.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                index === section.items.length - 1 && styles.lastMenuItem,
              ]}
              onPress={item.action}
              disabled={item.toggle}
            >
              <View style={styles.menuItemLeft}>
                <item.icon size={20} color="#666" />
                <Text style={styles.menuItemLabel}>{item.label}</Text>
              </View>
              {item.toggle ? (
                <Switch
                  value={item.value || false}
                  onValueChange={item.onToggle}
                  trackColor={{ false: '#E0E0E0', true: '#B2EBF2' }}
                  thumbColor={item.value ? '#00BCD4' : '#f4f3f4'}
                />
              ) : (
                <ChevronRight size={20} color="#999" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      ))}

      <TouchableOpacity style={styles.logoutButton}>
        <LogOut size={20} color="#FF5252" />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Version 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  profileSection: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#00BCD4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  signInButton: {
    paddingHorizontal: 32,
    paddingVertical: 10,
    backgroundColor: '#00BCD4',
    borderRadius: 20,
  },
  signInText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemLabel: {
    fontSize: 16,
    color: '#333',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    marginBottom: 16,
    paddingVertical: 16,
  },
  logoutText: {
    fontSize: 16,
    color: '#FF5252',
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
    marginBottom: 32,
  },
});