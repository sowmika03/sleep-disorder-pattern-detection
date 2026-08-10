/**
 * Real Activity Detector Service
 * Detects actual user actions dynamically
 * Uses AppState for screen on/off detection
 * Uses expo-battery for real-time charging detection
 */

import { AppState } from 'react-native';
import * as Battery from 'expo-battery';
import { EVENT_TYPES } from '../utils/constants';

class RealActivityDetector {
  constructor() {
    this.isRunning = false;
    this.activities = [];
    this.appStateSubscription = null;
    this.batterySubscription = null;
    this.currentAppState = AppState.currentState;
    this.lastScreenOnTime = null;
    this.currentBatteryLevel = 75;
    this.currentChargingStatus = false;
    this.appUsageCount = {};
    this.onActivityDetectedCallback = null;
  }

  /**
   * Start real activity detection
   */
  async start(onActivityDetected) {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.onActivityDetectedCallback = onActivityDetected;
    this.activities = [];
    this.currentAppState = AppState.currentState;
    
    // Initialize real battery status
    try {
      const batteryLevel = await Battery.getBatteryLevelAsync();
      this.currentBatteryLevel = Math.round(batteryLevel * 100);
      const batteryState = await Battery.getBatteryStateAsync();
      this.currentChargingStatus = batteryState === Battery.BatteryState.CHARGING;
      console.log(`🔋 Initial Battery: ${this.currentBatteryLevel}%, Charging: ${this.currentChargingStatus}`);
    } catch (error) {
      console.warn('Battery API not available, using defaults:', error);
      this.currentBatteryLevel = 75;
      this.currentChargingStatus = false;
    }

    // Listen to real-time battery changes (charging status, battery level)
    this.batterySubscription = Battery.addBatteryStateListener(async ({ batteryState, batteryLevel }) => {
      const newBatteryLevel = Math.round(batteryLevel * 100);
      const newChargingStatus = batteryState === Battery.BatteryState.CHARGING;
      
      // Detect charging status change
      if (newChargingStatus !== this.currentChargingStatus) {
        console.log(`🔌 Charging status changed: ${this.currentChargingStatus} -> ${newChargingStatus}`);
        this.currentChargingStatus = newChargingStatus;
        this.logChargingStatus(newChargingStatus, onActivityDetected);
      }
      
      // Update battery level
      if (Math.abs(newBatteryLevel - this.currentBatteryLevel) >= 1) {
        this.currentBatteryLevel = newBatteryLevel;
        console.log(`🔋 Battery level: ${this.currentBatteryLevel}%`);
      }
    });

    // Listen to app state changes (foreground/background = screen on/off)
    this.appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      console.log('AppState changed:', this.currentAppState, '->', nextAppState);
      
      if (this.currentAppState.match(/inactive|background/) && nextAppState === 'active') {
        // App came to foreground - Screen ON detected
        console.log('Screen ON detected - App came to foreground');
        this.detectScreenOn(onActivityDetected);
      } else if (this.currentAppState === 'active' && nextAppState.match(/inactive|background/)) {
        // App went to background - User switched to another app or locked screen
        console.log('Screen OFF detected - App went to background');
        this.detectScreenOff(onActivityDetected);
      }
      this.currentAppState = nextAppState;
    });

    // Initial screen on event
    if (this.currentAppState === 'active') {
      this.detectScreenOn(onActivityDetected);
    }
  }

  /**
   * Stop detection
   */
  stop() {
    if (!this.isRunning) {
      return this.activities;
    }

    this.isRunning = false;
    
    // Remove app state listener
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
    
    // Remove battery listener
    if (this.batterySubscription) {
      this.batterySubscription.remove();
      this.batterySubscription = null;
    }

    // Final screen off if still active
    if (this.currentAppState === 'active') {
      this.detectScreenOff(null);
    }

    this.onActivityDetectedCallback = null;
    return this.activities;
  }

  /**
   * Detect screen on
   */
  async detectScreenOn(onActivityDetected) {
    const now = new Date();
    const sessionDuration = this.lastScreenOnTime 
      ? Math.floor((now.getTime() - this.lastScreenOnTime.getTime()) / 1000)
      : null;

    // Get real battery level
    try {
      const batteryLevel = await Battery.getBatteryLevelAsync();
      this.currentBatteryLevel = Math.round(batteryLevel * 100);
      const batteryState = await Battery.getBatteryStateAsync();
      this.currentChargingStatus = batteryState === Battery.BatteryState.CHARGING;
    } catch (error) {
      // Fallback if battery API fails
      if (!this.currentChargingStatus) {
        this.currentBatteryLevel = Math.max(5, this.currentBatteryLevel - 1);
      } else {
        this.currentBatteryLevel = Math.min(100, this.currentBatteryLevel + 1);
      }
    }

    const activity = {
      eventType: EVENT_TYPES.SCREEN_ON,
      appCategory: null,
      timestamp: now.toISOString(),
      sessionDuration: null,
      chargingStatus: this.currentChargingStatus,
      metadata: {
        batteryLevel: this.currentBatteryLevel,
        detectedBy: 'app_state',
      },
    };

    this.activities.push(activity);
    this.lastScreenOnTime = now;

    if (onActivityDetected) {
      onActivityDetected(activity);
    }
  }

  /**
   * Detect screen off (when app goes to background - user switched apps or locked screen)
   */
  async detectScreenOff(onActivityDetected) {
    const now = new Date();
    const sessionDuration = this.lastScreenOnTime
      ? Math.floor((now.getTime() - this.lastScreenOnTime.getTime()) / 1000)
      : null;

    // Get real battery level
    try {
      const batteryLevel = await Battery.getBatteryLevelAsync();
      this.currentBatteryLevel = Math.round(batteryLevel * 100);
      const batteryState = await Battery.getBatteryStateAsync();
      this.currentChargingStatus = batteryState === Battery.BatteryState.CHARGING;
    } catch (error) {
      // Fallback if battery API fails
      if (!this.currentChargingStatus && sessionDuration) {
        const minutesUsed = sessionDuration / 60;
        this.currentBatteryLevel = Math.max(5, this.currentBatteryLevel - (minutesUsed * 0.3));
      }
    }

    const activity = {
      eventType: EVENT_TYPES.SCREEN_OFF,
      appCategory: null,
      timestamp: now.toISOString(),
      sessionDuration: sessionDuration,
      chargingStatus: this.currentChargingStatus,
      metadata: {
        batteryLevel: Math.round(this.currentBatteryLevel),
        detectedBy: 'app_state', // Indicates this was auto-detected
        note: 'User switched to another app or locked screen',
        lastScreenOnTime: this.lastScreenOnTime ? this.lastScreenOnTime.toISOString() : null,
      },
    };

    this.activities.push(activity);

    if (onActivityDetected) {
      onActivityDetected(activity);
    }
  }

  /**
   * Manually log app usage
   */
  logAppUsage(appName, appCategory, onActivityDetected) {
    if (!this.isRunning) return;

    const now = new Date();
    
    // Track usage count
    if (!this.appUsageCount[appName]) {
      this.appUsageCount[appName] = 0;
    }
    this.appUsageCount[appName]++;

    // Update battery
    if (!this.currentChargingStatus) {
      this.currentBatteryLevel = Math.max(5, this.currentBatteryLevel - 0.5);
    }

    const activity = {
      eventType: EVENT_TYPES.APP_USAGE,
      appCategory: appCategory,
      timestamp: now.toISOString(),
      sessionDuration: null,
      chargingStatus: this.currentChargingStatus,
      metadata: {
        appName: appName,
        usageCount: this.appUsageCount[appName],
        batteryLevel: Math.round(this.currentBatteryLevel),
      },
    };

    this.activities.push(activity);

    if (onActivityDetected) {
      onActivityDetected(activity);
    }
  }

  /**
   * Log charging status change (called automatically by battery listener)
   */
  async logChargingStatus(isCharging, onActivityDetected) {
    if (!this.isRunning) return;

    this.currentChargingStatus = isCharging;
    const now = new Date();

    // Get real battery level
    try {
      const batteryLevel = await Battery.getBatteryLevelAsync();
      this.currentBatteryLevel = Math.round(batteryLevel * 100);
    } catch (error) {
      // Use current level if API fails
    }

    const activity = {
      eventType: EVENT_TYPES.CHARGING,
      appCategory: null,
      timestamp: now.toISOString(),
      sessionDuration: null,
      chargingStatus: isCharging,
      metadata: {
        action: isCharging ? 'charging_started' : 'charging_stopped',
        batteryLevel: Math.round(this.currentBatteryLevel),
        detectedBy: 'battery_api', // Indicates this was auto-detected from battery API
      },
    };

    this.activities.push(activity);

    if (onActivityDetected) {
      onActivityDetected(activity);
    }
  }

  /**
   * Get app usage stats
   */
  getAppUsageStats() {
    return {
      totalApps: Object.keys(this.appUsageCount).length,
      appCounts: { ...this.appUsageCount },
      mostUsedApp: Object.keys(this.appUsageCount).length > 0
        ? Object.keys(this.appUsageCount).reduce((a, b) => 
            this.appUsageCount[a] > this.appUsageCount[b] ? a : b
          )
        : null,
    };
  }

  /**
   * Get current battery level (real-time from device)
   */
  async getBatteryLevel() {
    try {
      const batteryLevel = await Battery.getBatteryLevelAsync();
      this.currentBatteryLevel = Math.round(batteryLevel * 100);
      return this.currentBatteryLevel;
    } catch (error) {
      return Math.round(this.currentBatteryLevel);
    }
  }

  /**
   * Get current charging status (real-time from device)
   */
  async getChargingStatus() {
    try {
      const batteryState = await Battery.getBatteryStateAsync();
      this.currentChargingStatus = batteryState === Battery.BatteryState.CHARGING;
      return this.currentChargingStatus;
    } catch (error) {
      return this.currentChargingStatus;
    }
  }

  /**
   * Clear all activities
   */
  clear() {
    this.activities = [];
    this.appUsageCount = {};
    this.currentBatteryLevel = 75;
    this.currentChargingStatus = false;
  }

  /**
   * Get all activities
   */
  getActivities() {
    return this.activities;
  }
}

export default new RealActivityDetector();

