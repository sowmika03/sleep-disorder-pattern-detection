import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../utils/constants';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            // Navigation will update automatically
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Profile</Text>

        {user && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>User Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
            {user.firstName && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>First Name:</Text>
                <Text style={styles.infoValue}>{user.firstName}</Text>
              </View>
            )}
            {user.lastName && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Last Name:</Text>
                <Text style={styles.infoValue}>{user.lastName}</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>About</Text>
          <Text style={styles.aboutText}>
            Sleep Disorder Detection uses smartphone metadata to assess your risk
            of sleep disorders including insomnia and Delayed Sleep Phase Syndrome (DSPS).
          </Text>
          <Text style={styles.aboutText}>
            The app analyzes your activity patterns, screen usage, and timing behaviors
            to provide personalized insights and recommendations.
          </Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 24,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  aboutText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  logoutButton: {
    backgroundColor: COLORS.danger,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

