// API Configuration
// For physical device/emulator, use your computer's IP address instead of localhost
// Example: http://192.168.1.100:3000
// Find your IP: Windows (ipconfig) or Mac/Linux (ifconfig)
export const API_BASE_URL = __DEV__ 
  ? (process.env.EXPO_PUBLIC_API_URL || 'http://10.99.199.226:3000') // Change to your computer's IP
  : (process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com');

// App Constants
export const APP_NAME = 'Sleep Disorder Detection';

// Sleep Disorder Types
export const SLEEP_DISORDER_TYPES = {
  NORMAL: 'normal',
  INSOMNIA: 'insomnia',
  DSPS: 'dsps',
};

// Event Types
export const EVENT_TYPES = {
  SCREEN_ON: 'screen_on',
  SCREEN_OFF: 'screen_off',
  APP_USAGE: 'app_usage',
  CHARGING: 'charging',
};

// App Categories
export const APP_CATEGORIES = [
  'social',
  'entertainment',
  'productivity',
  'news',
  'communication',
  'health',
  'education',
];

// Specific Apps by Category
export const APPS_BY_CATEGORY = {
  social: ['Facebook', 'Instagram', 'Twitter', 'WhatsApp', 'Snapchat', 'TikTok'],
  entertainment: ['YouTube', 'Netflix', 'Spotify', 'Prime Video', 'Disney+', 'Twitch'],
  productivity: ['Gmail', 'Outlook', 'Slack', 'Microsoft Teams', 'Notion', 'Trello'],
  news: ['BBC News', 'CNN', 'Google News', 'Reddit', 'Medium'],
  communication: ['WhatsApp', 'Telegram', 'Messenger', 'Zoom', 'Skype'],
  health: ['Fitbit', 'MyFitnessPal', 'Headspace', 'Calm', 'Strava'],
  education: ['Coursera', 'Khan Academy', 'Duolingo', 'Udemy', 'Quizlet'],
};

// Colors
export const COLORS = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  background: '#f9fafb',
  surface: '#ffffff',
  text: '#1f2937',
  textSecondary: '#6b7280',
  border: '#e5e7eb',
};

