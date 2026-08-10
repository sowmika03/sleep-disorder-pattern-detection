/**
 * Activity Simulator Service
 * Simulates smartphone sensor behavior to automatically detect activities
 * Tracks: App usage, charging status, usage frequency
 */

import { EVENT_TYPES, APP_CATEGORIES, APPS_BY_CATEGORY } from '../utils/constants';

class ActivitySimulator {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
    this.activities = [];
    this.startTime = null;
    this.lastActivityTime = null;
    this.appUsageCount = {}; // Track app usage frequency
    this.currentChargingStatus = false;
    this.chargingStartTime = null;
    this.currentBatteryLevel = 75; // Start with 75% battery
  }

  /**
   * Start automatic activity detection/simulation
   * Simulates real smartphone behavior
   */
  start(onActivityDetected) {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.startTime = new Date();
    this.lastActivityTime = new Date();
    this.activities = [];
    this.currentBatteryLevel = 75; // Reset to 75% when starting
    this.currentChargingStatus = false;

    // Simulate activities at random intervals (like real phone usage)
    this.intervalId = setInterval(() => {
      this.generateRandomActivity(onActivityDetected);
    }, this.getRandomInterval(5000, 30000)); // 5-30 seconds between activities

    // Generate initial activity
    setTimeout(() => {
      this.generateRandomActivity(onActivityDetected);
    }, 1000);
  }

  /**
   * Stop automatic activity detection
   */
  stop() {
    if (!this.isRunning) {
      return this.activities;
    }

    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    // Generate final screen_off event with current battery level
    const finalActivity = {
      eventType: EVENT_TYPES.SCREEN_OFF,
      appCategory: null,
      timestamp: new Date().toISOString(),
      sessionDuration: null,
      chargingStatus: this.currentChargingStatus,
      metadata: {
        batteryLevel: this.currentBatteryLevel,
      },
    };

    this.activities.push(finalActivity);
    return this.activities;
  }

  /**
   * Get app usage statistics
   */
  getAppUsageStats() {
    return {
      totalApps: Object.keys(this.appUsageCount).length,
      appCounts: { ...this.appUsageCount },
      mostUsedApp: Object.keys(this.appUsageCount).reduce((a, b) => 
        this.appUsageCount[a] > this.appUsageCount[b] ? a : b, null
      ),
    };
  }

  /**
   * Generate a random activity based on realistic phone usage patterns
   */
  generateRandomActivity(onActivityDetected) {
    if (!this.isRunning) return;

    const now = new Date();
    const hour = now.getHours();
    
    // Simulate charging status changes (realistic behavior)
    const shouldChangeCharging = Math.random() < 0.15; // 15% chance to change charging status
    if (shouldChangeCharging) {
      this.currentChargingStatus = !this.currentChargingStatus;
      if (this.currentChargingStatus) {
        this.chargingStartTime = now;
      }
      
      // Add charging event with current battery level
      const chargingActivity = {
        eventType: EVENT_TYPES.CHARGING,
        appCategory: null,
        timestamp: now.toISOString(),
        sessionDuration: null,
        chargingStatus: this.currentChargingStatus,
        metadata: {
          action: this.currentChargingStatus ? 'charging_started' : 'charging_stopped',
          batteryLevel: this.currentBatteryLevel,
        },
      };
      this.activities.push(chargingActivity);
      if (onActivityDetected) {
        onActivityDetected(chargingActivity);
      }
    }

    // Update battery level based on charging status and time passed
    const timeSinceLastActivity = this.lastActivityTime 
      ? (now.getTime() - this.lastActivityTime.getTime()) / 1000 / 60 // minutes
      : 0;

    if (this.currentChargingStatus) {
      // Battery increases when charging (1-2% per minute)
      const chargeRate = 1 + Math.random(); // 1-2% per minute
      this.currentBatteryLevel = Math.min(100, this.currentBatteryLevel + (chargeRate * timeSinceLastActivity * 0.1));
    } else {
      // Battery decreases when not charging (0.5-1% per minute)
      const drainRate = 0.5 + Math.random() * 0.5; // 0.5-1% per minute
      this.currentBatteryLevel = Math.max(5, this.currentBatteryLevel - (drainRate * timeSinceLastActivity * 0.1));
    }

    // Round to integer
    this.currentBatteryLevel = Math.round(this.currentBatteryLevel);

    // Determine activity type based on time of day and patterns
    let activityType;
    let appCategory;
    let appName = null;
    let sessionDuration;
    const chargingStatus = this.currentChargingStatus;

    // Time-based activity patterns
    if (hour >= 6 && hour < 12) {
      // Morning: News, social media
      activityType = Math.random() < 0.7 ? EVENT_TYPES.SCREEN_ON : EVENT_TYPES.APP_USAGE;
      appCategory = this.getRandomCategory(['news', 'social', 'communication']);
      sessionDuration = this.getRandomDuration(60, 300); // 1-5 minutes
    } else if (hour >= 12 && hour < 18) {
      // Afternoon: Productivity, communication
      activityType = Math.random() < 0.6 ? EVENT_TYPES.SCREEN_ON : EVENT_TYPES.APP_USAGE;
      appCategory = this.getRandomCategory(['productivity', 'communication', 'social']);
      sessionDuration = this.getRandomDuration(120, 600); // 2-10 minutes
    } else if (hour >= 18 && hour < 23) {
      // Evening: Entertainment, social
      activityType = Math.random() < 0.5 ? EVENT_TYPES.SCREEN_ON : EVENT_TYPES.APP_USAGE;
      appCategory = this.getRandomCategory(['entertainment', 'social', 'news']);
      sessionDuration = this.getRandomDuration(180, 900); // 3-15 minutes
    } else {
      // Late night: Social, entertainment (insomnia pattern)
      activityType = Math.random() < 0.4 ? EVENT_TYPES.SCREEN_ON : EVENT_TYPES.APP_USAGE;
      appCategory = this.getRandomCategory(['entertainment', 'social']);
      sessionDuration = this.getRandomDuration(300, 1200); // 5-20 minutes
    }

    // If APP_USAGE, get specific app name
    if (activityType === EVENT_TYPES.APP_USAGE && appCategory) {
      const apps = APPS_BY_CATEGORY[appCategory] || [];
      if (apps.length > 0) {
        appName = apps[Math.floor(Math.random() * apps.length)];
        // Track app usage count
        if (!this.appUsageCount[appName]) {
          this.appUsageCount[appName] = 0;
        }
        this.appUsageCount[appName]++;
      }
    }

    // Use current battery level (which updates based on charging status)
    const activity = {
      eventType: activityType,
      appCategory: appCategory,
      timestamp: now.toISOString(),
      sessionDuration: sessionDuration ? parseInt(sessionDuration) : null,
      chargingStatus: Boolean(chargingStatus),
      metadata: {
        appName: appName,
        usageCount: appName ? this.appUsageCount[appName] : null,
        batteryLevel: this.currentBatteryLevel, // Current battery percentage
      },
    };

    this.activities.push(activity);
    this.lastActivityTime = now;

    // Callback to notify about new activity
    if (onActivityDetected) {
      onActivityDetected(activity);
    }

    // Schedule screen_off event after session duration
    if (activityType === EVENT_TYPES.SCREEN_ON || activityType === EVENT_TYPES.APP_USAGE) {
      setTimeout(() => {
        if (this.isRunning) {
          // Update battery based on session duration
          const sessionMinutes = sessionDuration / 60;
          if (this.currentChargingStatus) {
            // Battery increases during session if charging
            this.currentBatteryLevel = Math.min(100, this.currentBatteryLevel + (sessionMinutes * 0.5));
          } else {
            // Battery decreases during session if not charging
            this.currentBatteryLevel = Math.max(5, this.currentBatteryLevel - (sessionMinutes * 0.3));
          }
          this.currentBatteryLevel = Math.round(this.currentBatteryLevel);

          const offActivity = {
            eventType: EVENT_TYPES.SCREEN_OFF,
            appCategory: null,
            timestamp: new Date().toISOString(),
            sessionDuration: null,
            chargingStatus: this.currentChargingStatus,
            metadata: {
              batteryLevel: this.currentBatteryLevel,
            },
          };
          this.activities.push(offActivity);
          if (onActivityDetected) {
            onActivityDetected(offActivity);
          }
        }
      }, sessionDuration);
    }

    // Update interval for next activity
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = setInterval(() => {
        this.generateRandomActivity(onActivityDetected);
      }, this.getRandomInterval(5000, 30000));
    }
  }

  /**
   * Get random interval between activities
   */
  getRandomInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Get random duration for session
   */
  getRandomDuration(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Get random category from list
   */
  getRandomCategory(categories) {
    return categories[Math.floor(Math.random() * categories.length)];
  }

  /**
   * Generate activities for a specific time period (for history)
   */
  generateActivitiesForPeriod(startDate, endDate, count = 20) {
    const activities = [];
    const timeSpan = endDate.getTime() - startDate.getTime();
    const interval = timeSpan / count;

    for (let i = 0; i < count; i++) {
      const timestamp = new Date(startDate.getTime() + i * interval);
      const hour = timestamp.getHours();

      let appCategory;
      if (hour >= 6 && hour < 12) {
        appCategory = this.getRandomCategory(['news', 'social']);
      } else if (hour >= 12 && hour < 18) {
        appCategory = this.getRandomCategory(['productivity', 'communication']);
      } else {
        appCategory = this.getRandomCategory(['entertainment', 'social']);
      }

      // Generate battery level for each activity
      const isCharging = Math.random() < 0.3;
      const batteryLevel = isCharging 
        ? Math.floor(Math.random() * 40) + 60  // 60-100% when charging
        : Math.floor(Math.random() * 50) + 10; // 10-60% when not charging

      activities.push({
        eventType: i % 2 === 0 ? EVENT_TYPES.SCREEN_ON : EVENT_TYPES.SCREEN_OFF,
        appCategory: i % 2 === 0 ? appCategory : null,
        timestamp: timestamp.toISOString(),
        sessionDuration: i % 2 === 0 ? parseInt(this.getRandomDuration(60, 600)) : null,
        chargingStatus: Boolean(isCharging),
        metadata: {
          batteryLevel: batteryLevel,
        },
      });
    }

    return activities;
  }

  /**
   * Get current activities
   */
  getActivities() {
    return this.activities;
  }

  /**
   * Clear activities
   */
  clear() {
    this.activities = [];
    this.appUsageCount = {};
    this.currentChargingStatus = false;
    this.chargingStartTime = null;
    this.currentBatteryLevel = 75; // Reset to 75%
  }
}

export default new ActivitySimulator();

