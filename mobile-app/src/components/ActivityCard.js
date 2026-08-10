import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';

export default function ActivityCard({ activity }) {
  if (!activity) return null;

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Get battery percentage from metadata
  const batteryLevel = activity.metadata?.batteryLevel || 
                       (activity.metadata ? JSON.parse(activity.metadata).batteryLevel : null);

  // Get app name and usage count from metadata
  const appName = activity.metadata?.appName || 
                  (activity.metadata ? JSON.parse(activity.metadata).appName : null);
  const usageCount = activity.metadata?.usageCount || 
                     (activity.metadata ? JSON.parse(activity.metadata).usageCount : null);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eventType}>{activity.event_type || activity.eventType}</Text>
        <Text style={styles.date}>{formatDate(activity.timestamp)}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.time}>{formatTime(activity.timestamp)}</Text>
        
        {/* Battery Percentage - Show for screen_on and screen_off */}
        {(activity.event_type === 'screen_on' || activity.event_type === 'screen_off' || 
          activity.eventType === 'screen_on' || activity.eventType === 'screen_off') && 
          batteryLevel !== null && (
          <View style={styles.batteryContainer}>
            <Text style={styles.batteryLabel}>🔋 Battery:</Text>
            <Text style={[
              styles.batteryPercentage,
              batteryLevel < 20 && styles.batteryLow,
              batteryLevel >= 20 && batteryLevel < 50 && styles.batteryMedium,
              batteryLevel >= 50 && styles.batteryHigh
            ]}>
              {batteryLevel}%
            </Text>
          </View>
        )}

        {appName && (
          <View style={styles.appContainer}>
            <Text style={styles.appLabel}>📱 App:</Text>
            <Text style={styles.appName}>{appName}</Text>
            {usageCount && (
              <Text style={styles.usageCount}>({usageCount}x)</Text>
            )}
          </View>
        )}

        {activity.app_category && (
          <Text style={styles.category}>Category: {activity.app_category}</Text>
        )}
        {activity.session_duration && (
          <Text style={styles.duration}>
            Duration: {Math.round(activity.session_duration / 60)} min
          </Text>
        )}
        {activity.charging_status && (
          <View style={styles.chargingBadge}>
            <Text style={styles.chargingText}>🔌 Charging</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 12,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventType: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    textTransform: 'capitalize',
  },
  date: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  body: {
    gap: 4,
  },
  time: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  category: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  duration: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  chargingBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 4,
  },
  chargingText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 4,
  },
  batteryLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginRight: 4,
  },
  batteryPercentage: {
    fontSize: 14,
    fontWeight: '600',
  },
  batteryLow: {
    color: COLORS.danger,
  },
  batteryMedium: {
    color: COLORS.warning,
  },
  batteryHigh: {
    color: COLORS.success,
  },
  appContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    flexWrap: 'wrap',
  },
  appLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginRight: 4,
  },
  appName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
    marginRight: 4,
  },
  usageCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
});

