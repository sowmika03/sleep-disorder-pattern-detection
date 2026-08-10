import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { activityAPI } from '../services/api';
import { EVENT_TYPES, APP_CATEGORIES, APPS_BY_CATEGORY } from '../utils/constants';
import { COLORS } from '../utils/constants';
import realActivityDetector from '../services/realActivityDetector';

export default function ActivityUploadScreen() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedCount, setDetectedCount] = useState(0);
  const [appStats, setAppStats] = useState(null);
  const [chargingStatus, setChargingStatus] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(75);
  const [selectedApp, setSelectedApp] = useState(null);
  const [customAppName, setCustomAppName] = useState('');
  const [showCustomAppInput, setShowCustomAppInput] = useState(false);
  const activitiesRef = useRef([]);
  const [formData, setFormData] = useState({
    eventType: EVENT_TYPES.SCREEN_ON,
    appCategory: '',
    sessionDuration: '',
  });

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (isDetecting) {
        realActivityDetector.stop();
      }
    };
  }, [isDetecting]);

  const handleActivityDetected = (activity) => {
    activitiesRef.current = [...activitiesRef.current, activity];
    setActivities([...activitiesRef.current]);
    setDetectedCount(activitiesRef.current.length);

    // Update charging status
    if (activity.chargingStatus !== undefined) {
      setChargingStatus(activity.chargingStatus);
    }

    // Update battery level
    if (activity.metadata?.batteryLevel !== undefined) {
      setBatteryLevel(activity.metadata.batteryLevel);
    }

    // Update app stats
    const stats = realActivityDetector.getAppUsageStats();
    setAppStats(stats);
  };

  const startAutoDetection = () => {
    if (isDetecting) {
      return;
    }

    setIsDetecting(true);
    setDetectedCount(0);
    activitiesRef.current = [];
    setActivities([]);

    // Track when app goes to background (user switches to another app)
    let backgroundTime = null;

    // Start real activity detection (uses AppState for screen on/off, Battery API for charging)
    realActivityDetector.start(async (activity) => {
      handleActivityDetected(activity);

      // When app goes to background (user switches to another app)
      if (activity.eventType === EVENT_TYPES.SCREEN_OFF &&
        activity.metadata?.detectedBy === 'app_state') {
        // User switched to another app - record the time
        backgroundTime = new Date(activity.timestamp);
        console.log('✅ Auto-detected: User switched to another app');
      }
      // When app comes back to foreground (user returned from another app)
      else if (activity.eventType === EVENT_TYPES.SCREEN_ON &&
        activity.metadata?.detectedBy === 'app_state') {
        // User came back - check if we have a background time recorded
        if (backgroundTime) {
          // Calculate how long they were away
          const timeAway = Math.floor((new Date(activity.timestamp).getTime() - backgroundTime.getTime()) / 1000);
          console.log(`🔄 User returned after ${timeAway} seconds`);

          // Auto-detect app usage - automatically log when user returns from another app
          // Reduced threshold to 2 seconds to catch all app switches
          if (timeAway >= 2) {
            console.log(`📱 App usage detected: User was away for ${timeAway} seconds`);

            // Smart detection: Based on time away, infer likely app category
            let inferredAppName = 'Other App';
            let inferredCategory = 'unknown';

            // If user was away for a long time (>10 min), likely entertainment
            if (timeAway > 600) {
              inferredCategory = 'entertainment';
              inferredAppName = 'Entertainment App (Auto-detected)';
            } else if (timeAway > 180) {
              // 3-10 min: likely social media
              inferredCategory = 'social';
              inferredAppName = 'Social App (Auto-detected)';
            } else if (timeAway > 30) {
              // 30s-3min: likely communication or quick check
              inferredCategory = 'communication';
              inferredAppName = 'Communication App (Auto-detected)';
            } else {
              // Short time (2-30s): quick app switch
              inferredCategory = 'unknown';
              inferredAppName = 'Other App (Auto-detected)';
            }

            const autoAppActivity = {
              eventType: EVENT_TYPES.APP_USAGE,
              appCategory: inferredCategory,
              timestamp: backgroundTime.toISOString(),
              sessionDuration: timeAway,
              chargingStatus: activity.chargingStatus,
              metadata: {
                appName: inferredAppName,
                batteryLevel: activity.metadata?.batteryLevel || 75,
                autoDetected: true,
                timeAwaySeconds: timeAway,
                note: `Auto-detected: User was away for ${Math.floor(timeAway / 60)}m ${timeAway % 60}s`,
              },
            };

            // Automatically add this activity (no prompt needed)
            handleActivityDetected(autoAppActivity);
            console.log(`✅ Auto-detected app usage: ${inferredAppName} (${Math.floor(timeAway / 60)}m ${timeAway % 60}s)`);
          } else {
            console.log(`⏭️ Skipping app usage (too short: ${timeAway}s)`);
          }

          backgroundTime = null;
        } else {
          console.log('⚠️ Screen ON detected but no background time recorded');
        }
      }

      // Update charging status from real battery API
      if (activity.eventType === EVENT_TYPES.CHARGING && activity.metadata?.detectedBy === 'battery_api') {
        setChargingStatus(activity.chargingStatus);
        setBatteryLevel(activity.metadata?.batteryLevel);
      }
    });

    // Initialize battery status immediately and show in alert
    Promise.all([
      realActivityDetector.getBatteryLevel(),
      realActivityDetector.getChargingStatus()
    ]).then(([level, status]) => {
      setBatteryLevel(level);
      setChargingStatus(status);
      console.log(`🔋 Initial Battery: ${level}%, Charging: ${status ? 'Yes' : 'No'}`);

      // If phone is already charging when detection starts, log it as an activity
      if (status) {
        const initialChargingActivity = {
          eventType: EVENT_TYPES.CHARGING,
          appCategory: null,
          timestamp: new Date().toISOString(),
          sessionDuration: null,
          chargingStatus: true,
          metadata: {
            action: 'charging_started',
            batteryLevel: level,
            detectedBy: 'initial_check',
            note: 'Phone was already charging when detection started',
          },
        };
        handleActivityDetected(initialChargingActivity);
        console.log('✅ Logged initial charging status: Already charging');
      }

      // Show initial status in alert with actual values
      const statusMsg = status
        ? `✅ Real-time detection started!\n\n• Screen on/off: Auto-detected\n• Charging: ⚡ Currently CHARGING (${level}%)\n• App usage: Auto-detected\n• Battery: Real-time updates\n\nCharging status logged in activities!`
        : `✅ Real-time detection started!\n\n• Screen on/off: Auto-detected\n• Charging: Auto-detected (plug/unplug)\n• App usage: Auto-detected\n• Battery: Real-time updates (${level}%)`;

      Alert.alert('Started', statusMsg);
    });
  };

  const stopAutoDetection = () => {
    if (!isDetecting) {
      return;
    }

    const finalActivities = realActivityDetector.stop();
    setActivities(finalActivities);
    setIsDetecting(false);
    Alert.alert('Stopped', `Detected ${finalActivities.length} activities.`);
  };

  const handleScreenOn = () => {
    if (!isDetecting) {
      Alert.alert('Info', 'Please start detection first');
      return;
    }
    realActivityDetector.detectScreenOn(handleActivityDetected);
    Alert.alert('Logged', 'Screen ON logged');
  };

  const handleScreenOff = () => {
    if (!isDetecting) {
      Alert.alert('Info', 'Please start detection first');
      return;
    }
    realActivityDetector.detectScreenOff(handleActivityDetected);
    Alert.alert('Logged', 'Screen OFF logged');
  };

  const handleAppUsage = (appName, category) => {
    if (!isDetecting) {
      Alert.alert('Info', 'Please start detection first');
      return;
    }
    realActivityDetector.logAppUsage(appName, category, handleActivityDetected);
    Alert.alert('Logged', `${appName} usage logged`);
  };

  const handleChargingToggle = () => {
    if (!isDetecting) {
      Alert.alert('Info', 'Please start detection first');
      return;
    }
    const newStatus = !chargingStatus;
    realActivityDetector.logChargingStatus(newStatus, handleActivityDetected);
    setChargingStatus(newStatus);
    Alert.alert('Logged', `Charging ${newStatus ? 'Started' : 'Stopped'}`);
  };

  const generateSampleActivities = () => {
    const now = new Date();
    const startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sampleActivities = [];

    for (let i = 0; i < 20; i++) {
      const timestamp = new Date(startDate.getTime() + Math.random() * 24 * 60 * 60 * 1000);
      sampleActivities.push({
        eventType: Math.random() > 0.3 ? EVENT_TYPES.SCREEN_ON : EVENT_TYPES.APP_USAGE,
        appCategory: ['social', 'entertainment', 'productivity'][Math.floor(Math.random() * 3)],
        timestamp: timestamp.toISOString(),
        sessionDuration: Math.floor(Math.random() * 3600),
        chargingStatus: Math.random() > 0.8,
      });
    }

    setActivities(sampleActivities);
    activitiesRef.current = sampleActivities;
    Alert.alert('Success', `Generated ${sampleActivities.length} logs`);
  };

  const addActivity = () => {
    if (!formData.eventType) {
      Alert.alert('Error', 'Please select an event type');
      return;
    }

    const activity = {
      eventType: formData.eventType,
      appCategory: formData.appCategory || null,
      timestamp: new Date().toISOString(),
      sessionDuration: formData.sessionDuration ? parseInt(formData.sessionDuration) : null,
      chargingStatus: false,
    };

    setActivities([...activities, activity]);
    setFormData({
      eventType: EVENT_TYPES.SCREEN_ON,
      appCategory: '',
      sessionDuration: '',
    });
  };

  const uploadActivities = async () => {
    if (activities.length === 0) {
      Alert.alert('Error', 'No activities to upload');
      return;
    }

    setLoading(true);
    try {
      // Ensure activities are in correct format for backend
      const formattedActivities = activities.map((activity, index) => {
        // Validate required fields
        if (!activity.eventType && !activity.event_type) {
          throw new Error(`Activity ${index + 1} is missing eventType`);
        }
        if (!activity.timestamp) {
          throw new Error(`Activity ${index + 1} is missing timestamp`);
        }

        // Ensure eventType is valid
        const eventType = activity.eventType || activity.event_type;
        if (!['screen_on', 'screen_off', 'app_usage', 'charging'].includes(eventType)) {
          throw new Error(`Activity ${index + 1} has invalid eventType: ${eventType}`);
        }

        // Ensure sessionDuration is integer or null
        let sessionDuration = activity.sessionDuration || activity.session_duration;
        if (sessionDuration !== null && sessionDuration !== undefined) {
          sessionDuration = parseInt(sessionDuration);
          if (isNaN(sessionDuration) || sessionDuration < 0) {
            sessionDuration = null;
          }
        } else {
          sessionDuration = null;
        }

        return {
          eventType: eventType,
          appCategory: activity.appCategory || activity.app_category || null,
          timestamp: activity.timestamp, // Should be ISO8601 format
          sessionDuration: sessionDuration,
          chargingStatus: activity.chargingStatus !== undefined
            ? Boolean(activity.chargingStatus)
            : (activity.charging_status !== undefined ? Boolean(activity.charging_status) : false),
        };
      });

      console.log('Uploading activities:', formattedActivities.length);
      console.log('Sample activity:', JSON.stringify(formattedActivities[0], null, 2));

      const response = await activityAPI.upload(formattedActivities);
      Alert.alert('Success', `${formattedActivities.length} activities uploaded successfully`);
      setActivities([]);
      activitiesRef.current = [];
      // Note: Detection continues running even after upload - user can stop manually if needed
    } catch (error) {
      console.error('Upload error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error stack:', error.stack);

      let errorMessage = 'Failed to upload activities.';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid activity data. Please check the format.';
      } else if (!error.response) {
        errorMessage = 'Network error. Please check your connection and backend server.';
      }

      Alert.alert('Upload Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>Upload Activity</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Real Activity Detection</Text>
            <Text style={styles.sectionDescription}>
              Log your actual phone activities dynamically. Screen on/off detected automatically. Tap buttons to log apps and charging.
            </Text>

            {!isDetecting ? (
              <View>
                <TouchableOpacity
                  style={[styles.actionButton, styles.startButton]}
                  onPress={startAutoDetection}
                >
                  <Text style={styles.actionButtonText}>🔴 Start Real Detection</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.sampleButton]}
                  onPress={generateSampleActivities}
                  disabled={isDetecting}
                >
                  <Text style={styles.actionButtonText}>📊 Generate Sample Data (24h)</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <View style={styles.detectingContainer}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                  <Text style={styles.detectingText}>
                    🔍 Auto-detecting... ({detectedCount} activities)
                  </Text>
                  <Text style={styles.detectingSubtext}>
                    Screen on/off detected automatically when you switch apps
                  </Text>
                </View>

                {/* Quick Action Buttons */}
                <View style={styles.quickActionsContainer}>
                  <Text style={styles.quickActionsTitle}>Quick Actions</Text>

                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={[styles.quickButton, styles.screenOnButton]}
                      onPress={handleScreenOn}
                    >
                      <Text style={styles.quickButtonText}>📱 Screen ON</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.quickButton, styles.screenOffButton]}
                      onPress={handleScreenOff}
                    >
                      <Text style={styles.quickButtonText}>🔒 Screen OFF</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={[styles.quickButton, chargingStatus ? styles.chargingOnButton : styles.chargingOffButton]}
                      onPress={handleChargingToggle}
                    >
                      <Text style={styles.quickButtonText}>
                        {chargingStatus ? '🔌 Charging ON' : '🔋 Charging OFF'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Popular Apps */}
                  <Text style={styles.appsTitle}>Popular Apps</Text>
                  <View style={styles.appsGrid}>
                    {['YouTube', 'Instagram', 'Hotstar', 'WhatsApp', 'Facebook', 'Netflix'].map((appName) => {
                      const category = appName === 'YouTube' || appName === 'Hotstar' || appName === 'Netflix'
                        ? 'entertainment'
                        : appName === 'Instagram' || appName === 'Facebook'
                          ? 'social'
                          : 'communication';
                      return (
                        <TouchableOpacity
                          key={appName}
                          style={[styles.appButton, selectedApp === appName && styles.appButtonSelected]}
                          onPress={() => {
                            setSelectedApp(appName);
                            handleAppUsage(appName, category);
                          }}
                        >
                          <Text style={styles.appButtonText}>{appName}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* All Apps by Category */}
                  <Text style={styles.appsTitle}>More Apps</Text>
                  {Object.entries(APPS_BY_CATEGORY).map(([category, apps]) => (
                    <View key={category} style={styles.categorySection}>
                      <Text style={styles.categoryTitle}>{category.toUpperCase()}</Text>
                      <View style={styles.appsRow}>
                        {apps.slice(0, 4).map((appName) => (
                          <TouchableOpacity
                            key={appName}
                            style={[styles.appButton, styles.smallAppButton]}
                            onPress={() => handleAppUsage(appName, category)}
                          >
                            <Text style={styles.appButtonText}>{appName}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  ))}

                  {/* Custom App Input */}
                  {showCustomAppInput ? (
                    <View style={styles.customAppContainer}>
                      <TextInput
                        style={styles.customAppInput}
                        placeholder="Enter app name (e.g., Hotstar, YouTube)"
                        value={customAppName}
                        onChangeText={setCustomAppName}
                        placeholderTextColor={COLORS.textSecondary}
                      />
                      <View style={styles.customAppButtons}>
                        <TouchableOpacity
                          style={[styles.customAppButton, styles.customAppButtonSave]}
                          onPress={() => {
                            if (customAppName.trim()) {
                              // Determine category based on app name or default to entertainment
                              let category = 'entertainment';
                              if (customAppName.toLowerCase().includes('whatsapp') ||
                                customAppName.toLowerCase().includes('telegram')) {
                                category = 'communication';
                              } else if (customAppName.toLowerCase().includes('instagram') ||
                                customAppName.toLowerCase().includes('facebook') ||
                                customAppName.toLowerCase().includes('twitter')) {
                                category = 'social';
                              }
                              handleAppUsage(customAppName.trim(), category);
                              setCustomAppName('');
                              setShowCustomAppInput(false);
                            }
                          }}
                        >
                          <Text style={styles.customAppButtonText}>Save</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.customAppButton, styles.customAppButtonCancel]}
                          onPress={() => {
                            setShowCustomAppInput(false);
                            setCustomAppName('');
                          }}
                        >
                          <Text style={styles.customAppButtonText}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[styles.appButton, styles.customAppToggleButton]}
                      onPress={() => setShowCustomAppInput(true)}
                    >
                      <Text style={styles.appButtonText}>+ Add Custom App</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {appStats && appStats.totalApps > 0 && (
                  <View style={styles.statsContainer}>
                    <Text style={styles.statsTitle}>📱 App Usage Stats</Text>
                    <Text style={styles.statsText}>
                      Apps Used: {appStats.totalApps}
                    </Text>
                    {appStats.mostUsedApp && (
                      <Text style={styles.statsText}>
                        Most Used: {appStats.mostUsedApp} ({appStats.appCounts[appStats.mostUsedApp]} times)
                      </Text>
                    )}
                  </View>
                )}

                <View style={[
                  styles.chargingContainer,
                  chargingStatus && styles.chargingContainerActive
                ]}>
                  <View style={styles.statusRow}>
                    <Text style={[
                      styles.chargingText,
                      chargingStatus && styles.chargingActive
                    ]}>
                      {chargingStatus ? '⚡ CHARGING' : '🔋 Not Charging'}
                    </Text>
                    <Text style={styles.batteryStatusText}>
                      Battery: {batteryLevel}%
                    </Text>
                  </View>
                  {chargingStatus && (
                    <Text style={styles.chargingNote}>
                      Phone is currently charging - status will update automatically
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  style={[styles.actionButton, styles.stopButton]}
                  onPress={stopAutoDetection}
                >
                  <Text style={styles.actionButtonText}>⏹️ Stop Detection</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add Activity</Text>

            <Text style={styles.label}>Event Type</Text>
            <View style={styles.buttonRow}>
              {Object.values(EVENT_TYPES).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    formData.eventType === type && styles.typeButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, eventType: type })}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      formData.eventType === type && styles.typeButtonTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>App Category (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., social, entertainment"
              value={formData.appCategory}
              onChangeText={(text) => setFormData({ ...formData, appCategory: text })}
            />

            <Text style={styles.label}>Session Duration (seconds, optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 120"
              value={formData.sessionDuration}
              onChangeText={(text) => setFormData({ ...formData, sessionDuration: text })}
              keyboardType="numeric"
            />

            <TouchableOpacity style={styles.addButton} onPress={addActivity}>
              <Text style={styles.addButtonText}>Add Activity</Text>
            </TouchableOpacity>
          </View>

          {activities.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  Activities ({activities.length})
                </Text>
                <TouchableOpacity onPress={() => {
                  setActivities([]);
                  activitiesRef.current = [];
                }}>
                  <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
              </View>
              <ScrollView
                style={styles.activitiesScrollView}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={true}
              >
                {activities.map((activity, index) => {
                  const batteryLevel = activity.metadata?.batteryLevel;
                  const isScreenEvent = activity.eventType === 'screen_on' || activity.eventType === 'screen_off';
                  const isChargingEvent = activity.eventType === EVENT_TYPES.CHARGING;

                  return (
                    <View key={index} style={styles.activityItem}>
                      <Text style={styles.activityText}>
                        {isChargingEvent
                          ? `🔌 ${activity.metadata?.action === 'charging_started' ? 'Charging Started' : 'Charging Stopped'}`
                          : activity.eventType
                        } - {new Date(activity.timestamp).toLocaleTimeString()}
                      </Text>

                      {/* Battery Percentage - Show for screen events and charging events */}
                      {(isScreenEvent || isChargingEvent) && batteryLevel !== null && batteryLevel !== undefined && (
                        <View style={styles.batteryRow}>
                          <Text style={styles.batteryLabel}>🔋 Battery:</Text>
                          <Text style={[
                            styles.batteryValue,
                            batteryLevel < 20 && styles.batteryLow,
                            batteryLevel >= 20 && batteryLevel < 50 && styles.batteryMedium,
                            batteryLevel >= 50 && styles.batteryHigh
                          ]}>
                            {batteryLevel}%
                          </Text>
                          {isChargingEvent && (
                            <Text style={styles.activityDetail}>
                              {activity.chargingStatus ? '⚡ Charging...' : '🔋 Not Charging'}
                            </Text>
                          )}
                        </View>
                      )}

                      {activity.metadata?.appName && (
                        <Text style={styles.activityDetail}>
                          📱 App: {activity.metadata.appName} {activity.metadata.usageCount && `(${activity.metadata.usageCount}x)`}
                        </Text>
                      )}

                      {activity.metadata?.autoDetected && (
                        <Text style={[styles.activityDetail, { color: COLORS.info, fontSize: 11 }]}>
                          🤖 Auto-detected
                        </Text>
                      )}
                    </View>
                  );
                })}
              </ScrollView>

              <TouchableOpacity
                style={[styles.uploadButton, loading && styles.buttonDisabled]}
                onPress={uploadActivities}
                disabled={loading}
              >
                <Text style={styles.uploadButtonText}>
                  {loading ? 'Uploading...' : 'Upload Activities'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
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
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  detectingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: COLORS.info + '20',
    borderRadius: 8,
    marginBottom: 12,
  },
  detectingText: {
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.info,
    fontWeight: '500',
  },
  detectingSubtext: {
    marginLeft: 24,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  statsContainer: {
    backgroundColor: COLORS.success + '20',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.success,
    marginBottom: 4,
  },
  statsText: {
    fontSize: 12,
    color: COLORS.text,
    marginVertical: 2,
  },
  chargingContainer: {
    backgroundColor: COLORS.warning + '20',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  chargingContainerActive: {
    backgroundColor: COLORS.success + '20',
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chargingText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.warning,
  },
  chargingActive: {
    color: COLORS.success,
  },
  chargingNote: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  batteryStatusText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  activityDetail: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  startButton: {
    backgroundColor: COLORS.success,
  },
  stopButton: {
    backgroundColor: COLORS.danger,
  },
  sampleButton: {
    backgroundColor: COLORS.info,
    marginTop: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeButtonText: {
    fontSize: 14,
    color: COLORS.text,
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  addButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: COLORS.info,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  activityItem: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  activityText: {
    fontSize: 14,
    color: COLORS.text,
  },
  moreText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: 8,
  },
  uploadButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  clearText: {
    color: COLORS.danger,
    fontSize: 14,
    fontWeight: '600',
  },
  activityDetail: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  batteryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  batteryLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginRight: 4,
  },
  batteryValue: {
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
  quickActionsContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  quickButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  quickButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  screenOnButton: {
    backgroundColor: COLORS.success,
  },
  screenOffButton: {
    backgroundColor: COLORS.danger,
  },
  chargingOnButton: {
    backgroundColor: COLORS.warning,
  },
  chargingOffButton: {
    backgroundColor: COLORS.info,
  },
  appsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  appsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  appsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  appButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    marginBottom: 8,
  },
  appButtonSelected: {
    backgroundColor: COLORS.success,
  },
  smallAppButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  appButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  categorySection: {
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  customAppContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  customAppInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
  },
  customAppButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  customAppButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  customAppButtonSave: {
    backgroundColor: COLORS.success,
  },
  customAppButtonCancel: {
    backgroundColor: COLORS.danger,
  },
  customAppButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  customAppToggleButton: {
    backgroundColor: COLORS.secondary,
    marginTop: 8,
  },
  activitiesScrollView: {
    maxHeight: 400,
    marginBottom: 12,
  },
});

