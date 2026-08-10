"""
Feature Engineering for Sleep Disorder Detection
Extracts meaningful features from activity logs
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict, Any


def extract_features(activities: List[Dict[str, Any]]) -> Dict[str, float]:
    """
    Extract features from activity logs for ML model
    
    Args:
        activities: List of activity dictionaries
        
    Returns:
        Dictionary of feature names and values
    """
    if not activities or len(activities) == 0:
        return get_default_features()
    
    df = pd.DataFrame(activities)
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df = df.sort_values('timestamp')
    
    # Initialize feature dictionary
    features = {}
    
    # 1. Temporal Features
    features['sleep_start_hour'] = estimate_sleep_start(df)
    features['wake_hour'] = estimate_wake_time(df)
    features['sleep_duration_hours'] = estimate_sleep_duration(df)
    features['sleep_consistency'] = calculate_sleep_consistency(df)
    
    # 2. Late Night Activity (11 PM - 4 AM)
    features['late_night_events'] = count_late_night_events(df)
    features['late_night_screen_time'] = calculate_late_night_screen_time(df)
    features['late_night_activity_ratio'] = features['late_night_events'] / max(len(df), 1)
    
    # 3. Screen Usage Patterns
    features['total_screen_ons'] = count_screen_ons(df)
    features['avg_session_duration'] = calculate_avg_session_duration(df)
    features['max_session_duration'] = calculate_max_session_duration(df)
    features['screen_unlock_frequency'] = calculate_unlock_frequency(df)
    
    # 4. App Category Usage
    features['social_app_usage'] = count_app_category(df, 'social')
    features['entertainment_app_usage'] = count_app_category(df, 'entertainment')
    features['productivity_app_usage'] = count_app_category(df, 'productivity')
    
    # 5. Charging Behavior
    features['charging_during_night'] = count_charging_events(df, start_hour=22, end_hour=6)
    features['charging_frequency'] = count_charging_events(df)
    
    # 6. Activity Distribution
    features['activity_peak_hour'] = find_peak_activity_hour(df)
    features['activity_variance'] = calculate_activity_variance(df)
    
    # 7. Circadian Indicators
    features['morning_activity'] = count_activity_in_range(df, 6, 12)
    features['afternoon_activity'] = count_activity_in_range(df, 12, 18)
    features['evening_activity'] = count_activity_in_range(df, 18, 22)
    features['night_activity'] = count_activity_in_range(df, 22, 6)
    
    # 8. Sleep Quality Indicators
    features['interruptions'] = count_sleep_interruptions(df)
    features['sleep_fragmentation'] = calculate_sleep_fragmentation(df)
    
    return features


def get_default_features() -> Dict[str, float]:
    """Return default feature values when no activities are available"""
    return {
        'sleep_start_hour': 23.0,
        'wake_hour': 7.0,
        'sleep_duration_hours': 8.0,
        'sleep_consistency': 0.5,
        'late_night_events': 0.0,
        'late_night_screen_time': 0.0,
        'late_night_activity_ratio': 0.0,
        'total_screen_ons': 0.0,
        'avg_session_duration': 0.0,
        'max_session_duration': 0.0,
        'screen_unlock_frequency': 0.0,
        'social_app_usage': 0.0,
        'entertainment_app_usage': 0.0,
        'productivity_app_usage': 0.0,
        'charging_during_night': 0.0,
        'charging_frequency': 0.0,
        'activity_peak_hour': 14.0,
        'activity_variance': 0.0,
        'morning_activity': 0.0,
        'afternoon_activity': 0.0,
        'evening_activity': 0.0,
        'night_activity': 0.0,
        'interruptions': 0.0,
        'sleep_fragmentation': 0.0,
    }


def estimate_sleep_start(df: pd.DataFrame) -> float:
    """
    Estimate typical sleep start time by analyzing nightly gaps.
    Finds the longest inactivity gap starting between 8 PM and 4 AM each night.
    """
    if len(df) < 2:
        return 23.0
    
    # Group by calendar day to find nightly gaps
    df['date'] = df['timestamp'].dt.date
    daily_starts = []
    
    for date in df['date'].unique():
        # Get activities for this day and the start of the next day
        day_plus_next = df[(df['date'] == date) | (df['date'] == date + timedelta(days=1))]
        
        if len(day_plus_next) < 2:
            continue
            
        # Calculate gaps between consecutive activities
        day_plus_next = day_plus_next.sort_values('timestamp')
        day_plus_next['gap'] = day_plus_next['timestamp'].diff().shift(-1).dt.total_seconds() / 3600.0
        
        # Look for gaps starting between 8 PM and 4 AM
        night_gaps = day_plus_next[
            ((day_plus_next['timestamp'].dt.hour >= 20) | (day_plus_next['timestamp'].dt.hour < 4)) &
            (day_plus_next['gap'] >= 4.0)  # At least 4 hours of inactivity
        ]
        
        if not night_gaps.empty:
            # Take the longest gap of the night
            longest_gap_row = night_gaps.loc[night_gaps['gap'].idxmax()]
            start_hour = longest_gap_row['timestamp'].hour + longest_gap_row['timestamp'].minute / 60.0
            daily_starts.append(start_hour)
            
    if not daily_starts:
        # Fallback to a sane default if no gaps found
        return 23.0
        
    return float(np.mean(daily_starts))


def estimate_wake_time(df: pd.DataFrame) -> float:
    """
    Estimate typical wake time by analyzing nightly gaps.
    Finds the end of the longest inactivity gap.
    """
    if len(df) < 2:
        return 7.0
        
    df['date'] = df['timestamp'].dt.date
    daily_ends = []
    
    for date in df['date'].unique():
        day_plus_next = df[(df['date'] == date) | (df['date'] == date + timedelta(days=1))]
        
        if len(day_plus_next) < 2:
            continue
            
        day_plus_next = day_plus_next.sort_values('timestamp')
        day_plus_next['gap'] = day_plus_next['timestamp'].diff().shift(-1).dt.total_seconds() / 3600.0
        
        # Look for gaps starting at night
        night_gaps = day_plus_next[
            ((day_plus_next['timestamp'].dt.hour >= 20) | (day_plus_next['timestamp'].dt.hour < 4)) &
            (day_plus_next['gap'] >= 4.0)
        ]
        
        if not night_gaps.empty:
            longest_gap_idx = night_gaps['gap'].idxmax()
            # The wake time is the timestamp of the NEXT activity after the gap
            # Get the index of the next activity
            next_act_idx = day_plus_next.index.get_loc(longest_gap_idx) + 1
            if next_act_idx < len(day_plus_next):
                wake_ts = day_plus_next.iloc[next_act_idx]['timestamp']
                wake_hour = wake_ts.hour + wake_ts.minute / 60.0
                daily_ends.append(wake_hour)
            
    if not daily_ends:
        return 7.0
        
    return float(np.mean(daily_ends))


def estimate_sleep_duration(df: pd.DataFrame) -> float:
    """Estimate typical sleep duration in hours"""
    if len(df) < 2:
        return 8.0
        
    start = estimate_sleep_start(df)
    wake = estimate_wake_time(df)
    
    if wake < start:
        duration = (24 - start) + wake
    else:
        duration = wake - start
        
    return float(max(2.0, min(12.0, duration)))


def calculate_sleep_consistency(df: pd.DataFrame) -> float:
    """Calculate consistency of sleep schedule (0-1)"""
    if len(df) < 2:
        return 0.5
    
    # Group by date and calculate sleep start times
    df['date'] = df['timestamp'].dt.date
    daily_sleep_starts = []
    
    for date in df['date'].unique():
        day_df = df[df['date'] == date]
        sleep_start = estimate_sleep_start(day_df)
        daily_sleep_starts.append(sleep_start)
    
    if len(daily_sleep_starts) < 2:
        return 0.5
    
    # Calculate variance (lower variance = higher consistency)
    variance = np.var(daily_sleep_starts)
    consistency = 1.0 / (1.0 + variance)  # Normalize to 0-1
    return float(min(1.0, max(0.0, consistency)))


def count_late_night_events(df: pd.DataFrame) -> float:
    """Count events between 11 PM and 4 AM"""
    if len(df) == 0:
        return 0.0
    
    late_night = df[
        (df['timestamp'].dt.hour >= 23) | 
        (df['timestamp'].dt.hour < 4)
    ]
    return float(len(late_night))


def calculate_late_night_screen_time(df: pd.DataFrame) -> float:
    """Calculate total screen time during late night hours (in minutes)"""
    if len(df) == 0:
        return 0.0
    
    late_night = df[
        (df['timestamp'].dt.hour >= 23) | 
        (df['timestamp'].dt.hour < 4)
    ]
    
    total_duration = late_night['session_duration'].fillna(0).sum()
    return float(total_duration / 60.0)  # Convert to minutes


def count_screen_ons(df: pd.DataFrame) -> float:
    """Count total screen unlock events"""
    return float(len(df[df['event_type'] == 'screen_on']))


def calculate_avg_session_duration(df: pd.DataFrame) -> float:
    """Calculate average session duration in seconds"""
    sessions = df[df['session_duration'].notna()]
    if len(sessions) == 0:
        return 0.0
    return float(sessions['session_duration'].mean())


def calculate_max_session_duration(df: pd.DataFrame) -> float:
    """Calculate maximum session duration in seconds"""
    sessions = df[df['session_duration'].notna()]
    if len(sessions) == 0:
        return 0.0
    return float(sessions['session_duration'].max())


def calculate_unlock_frequency(df: pd.DataFrame) -> float:
    """Calculate screen unlock frequency per hour"""
    if len(df) == 0:
        return 0.0
    
    screen_ons = df[df['event_type'] == 'screen_on']
    if len(screen_ons) == 0:
        return 0.0
    
    time_span = (df['timestamp'].max() - df['timestamp'].min()).total_seconds() / 3600.0
    if time_span == 0:
        return 0.0
    
    return float(len(screen_ons) / max(time_span, 1.0))


def count_app_category(df: pd.DataFrame, category: str) -> float:
    """Count app usage events for a specific category"""
    if 'app_category' not in df.columns:
        return 0.0
    return float(len(df[df['app_category'] == category]))


def count_charging_events(df: pd.DataFrame, start_hour: int = None, end_hour: int = None) -> float:
    """Count charging events, optionally filtered by time range"""
    charging = df[df['event_type'] == 'charging']
    
    if start_hour is not None and end_hour is not None:
        if start_hour < end_hour:
            charging = charging[
                (charging['timestamp'].dt.hour >= start_hour) &
                (charging['timestamp'].dt.hour < end_hour)
            ]
        else:  # Spans midnight
            charging = charging[
                (charging['timestamp'].dt.hour >= start_hour) |
                (charging['timestamp'].dt.hour < end_hour)
            ]
    
    return float(len(charging))


def find_peak_activity_hour(df: pd.DataFrame) -> float:
    """Find the hour with most activity"""
    if len(df) == 0:
        return 14.0  # Default to afternoon
    
    df['hour'] = df['timestamp'].dt.hour
    hour_counts = df['hour'].value_counts()
    if len(hour_counts) == 0:
        return 14.0
    return float(hour_counts.idxmax())


def calculate_activity_variance(df: pd.DataFrame) -> float:
    """Calculate variance in activity distribution across hours"""
    if len(df) == 0:
        return 0.0
    
    df['hour'] = df['timestamp'].dt.hour
    hour_counts = df['hour'].value_counts()
    # Variance needs at least 2 samples to be defined, otherwise it returns NaN
    if len(hour_counts) <= 1:
        return 0.0
    return float(hour_counts.var())


def count_activity_in_range(df: pd.DataFrame, start_hour: int, end_hour: int) -> float:
    """Count activities in a time range"""
    if len(df) == 0:
        return 0.0
    
    if start_hour < end_hour:
        filtered = df[
            (df['timestamp'].dt.hour >= start_hour) &
            (df['timestamp'].dt.hour < end_hour)
        ]
    else:  # Spans midnight
        filtered = df[
            (df['timestamp'].dt.hour >= start_hour) |
            (df['timestamp'].dt.hour < end_hour)
        ]
    
    return float(len(filtered))


def count_sleep_interruptions(df: pd.DataFrame) -> float:
    """Count screen-on events during typical sleep hours"""
    sleep_hours = df[
        ((df['timestamp'].dt.hour >= 23) | (df['timestamp'].dt.hour < 6)) &
        (df['event_type'] == 'screen_on')
    ]
    return float(len(sleep_hours))


def calculate_sleep_fragmentation(df: pd.DataFrame) -> float:
    """Calculate sleep fragmentation score"""
    interruptions = count_sleep_interruptions(df)
    # Normalize: more interruptions = higher fragmentation
    return float(min(1.0, interruptions / 10.0))

