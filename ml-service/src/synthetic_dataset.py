"""
Synthetic Dataset Generation for Sleep Disorder Detection
Generates realistic circadian behavior patterns
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import random
from typing import List, Dict, Any


def generate_synthetic_dataset(num_users: int = 300, days_per_user: int = 14) -> pd.DataFrame:
    """
    Generate synthetic dataset with three sleep disorder categories:
    - Normal sleep
    - Insomnia (frequent night usage)
    - DSPS (Delayed Sleep Phase Syndrome - very late sleep start)
    
    Args:
        num_users: Number of synthetic users
        days_per_user: Number of days of data per user
        
    Returns:
        DataFrame with activities and labels
    """
    all_activities = []
    labels = []
    
    # Distribute users across categories
    normal_count = int(num_users * 0.5)
    insomnia_count = int(num_users * 0.3)
    dsps_count = num_users - normal_count - insomnia_count
    
    print(f"Generating dataset:")
    print(f"  Normal: {normal_count} users")
    print(f"  Insomnia: {insomnia_count} users")
    print(f"  DSPS: {dsps_count} users")
    
    # Generate normal sleep patterns
    for user_id in range(normal_count):
        activities, label = generate_normal_sleep_pattern(user_id, days_per_user)
        all_activities.extend(activities)
        labels.extend([label] * len(activities))
    
    # Generate insomnia patterns
    for user_id in range(normal_count, normal_count + insomnia_count):
        activities, label = generate_insomnia_pattern(user_id, days_per_user)
        all_activities.extend(activities)
        labels.extend([label] * len(activities))
    
    # Generate DSPS patterns
    for user_id in range(normal_count + insomnia_count, num_users):
        activities, label = generate_dsps_pattern(user_id, days_per_user)
        all_activities.extend(activities)
        labels.extend([label] * len(activities))
    
    df = pd.DataFrame(all_activities)
    df['label'] = labels
    
    print(f"\nGenerated {len(df)} total activity records")
    print(f"Label distribution:")
    print(df['label'].value_counts())
    
    return df


def generate_normal_sleep_pattern(user_id: int, days: int) -> tuple:
    """Generate normal sleep pattern (sleep 10 PM - 7 AM)"""
    activities = []
    base_date = datetime.now() - timedelta(days=days)
    
    for day in range(days):
        current_date = base_date + timedelta(days=day)
        
        # Wake up around 6:30-7:30 AM
        wake_hour = random.uniform(6.5, 7.5)
        wake_time = current_date.replace(hour=int(wake_hour), minute=int((wake_hour % 1) * 60))
        
        # Sleep around 10:00-11:00 PM
        sleep_hour = random.uniform(22.0, 23.0)
        sleep_time = current_date.replace(hour=int(sleep_hour), minute=int((sleep_hour % 1) * 60))
        
        # Generate daytime activities
        activities.extend(generate_daytime_activities(user_id, wake_time, sleep_time, normal=True))
        
        # Minimal late night activity
        if random.random() < 0.1:  # 10% chance of occasional late night check
            late_time = sleep_time + timedelta(hours=random.uniform(0.5, 2))
            activities.append({
                'user_id': user_id,
                'event_type': 'screen_on',
                'app_category': random.choice(['social', 'entertainment']),
                'timestamp': late_time.isoformat(),
                'session_duration': random.randint(30, 180),
                'charging_status': random.choice([True, False]),
            })
    
    return activities, 'normal'


def generate_insomnia_pattern(user_id: int, days: int) -> tuple:
    """Generate insomnia pattern (frequent night usage, disrupted sleep)"""
    activities = []
    base_date = datetime.now() - timedelta(days=days)
    
    for day in range(days):
        current_date = base_date + timedelta(days=day)
        
        # Irregular wake time (often early or late)
        wake_hour = random.uniform(5.0, 9.0)
        wake_time = current_date.replace(hour=int(wake_hour), minute=int((wake_hour % 1) * 60))
        
        # Late sleep time with interruptions
        sleep_hour = random.uniform(23.0, 1.0)  # Can go past midnight
        if sleep_hour >= 24:
            sleep_hour -= 24
            sleep_time = (current_date + timedelta(days=1)).replace(
                hour=int(sleep_hour), minute=int((sleep_hour % 1) * 60)
            )
        else:
            sleep_time = current_date.replace(hour=int(sleep_hour), minute=int((sleep_hour % 1) * 60))
        
        # Generate daytime activities
        activities.extend(generate_daytime_activities(user_id, wake_time, sleep_time, normal=False))
        
        # Frequent late night activity (insomnia characteristic)
        num_night_events = random.randint(2, 6)
        for _ in range(num_night_events):
            # Between 11 PM and 4 AM
            night_hour = random.uniform(23.0, 28.0)  # 23-28 (4 AM next day)
            if night_hour >= 24:
                night_hour -= 24
                night_time = (current_date + timedelta(days=1)).replace(
                    hour=int(night_hour), minute=int((night_hour % 1) * 60)
                )
            else:
                night_time = current_date.replace(
                    hour=int(night_hour), minute=int((night_hour % 1) * 60)
                )
            
            activities.append({
                'user_id': user_id,
                'event_type': 'screen_on',
                'app_category': random.choice(['social', 'entertainment', 'news']),
                'timestamp': night_time.isoformat(),
                'session_duration': random.randint(120, 600),  # Longer sessions
                'charging_status': random.choice([True, False]),
            })
    
    return activities, 'insomnia'


def generate_dsps_pattern(user_id: int, days: int) -> tuple:
    """Generate DSPS pattern (very late sleep start, 2-4 AM)"""
    activities = []
    base_date = datetime.now() - timedelta(days=days)
    
    for day in range(days):
        current_date = base_date + timedelta(days=day)
        
        # Very late wake time (10 AM - 12 PM)
        wake_hour = random.uniform(10.0, 12.0)
        wake_time = (current_date + timedelta(days=1)).replace(
            hour=int(wake_hour), minute=int((wake_hour % 1) * 60)
        )
        
        # Very late sleep time (2-4 AM)
        sleep_hour = random.uniform(26.0, 28.0)  # 2-4 AM next day
        sleep_hour -= 24
        sleep_time = (current_date + timedelta(days=1)).replace(
            hour=int(sleep_hour), minute=int((sleep_hour % 1) * 60)
        )
        
        # Generate daytime activities (shifted later)
        activities.extend(generate_daytime_activities(user_id, wake_time, sleep_time, normal=False, shifted=True))
        
        # High activity in late night hours (characteristic of DSPS)
        for hour_offset in [0.5, 1.0, 1.5, 2.0]:
            night_time = sleep_time - timedelta(hours=hour_offset)
            activities.append({
                'user_id': user_id,
                'event_type': 'screen_on',
                'app_category': random.choice(['entertainment', 'social', 'productivity']),
                'timestamp': night_time.isoformat(),
                'session_duration': random.randint(300, 900),  # Long sessions
                'charging_status': random.choice([True, False]),
            })
    
    return activities, 'dsps'


def generate_daytime_activities(user_id: int, wake_time: datetime, sleep_time: datetime, 
                                normal: bool = True, shifted: bool = False) -> List[Dict]:
    """Generate realistic daytime activity patterns"""
    activities = []
    current_time = wake_time
    
    # Number of screen sessions per day
    if normal:
        num_sessions = random.randint(15, 25)
    else:
        num_sessions = random.randint(20, 35)
    
    # Distribute sessions throughout the day
    time_span = (sleep_time - wake_time).total_seconds()
    session_times = sorted([random.uniform(0, time_span) for _ in range(num_sessions)])
    
    app_categories = ['social', 'entertainment', 'productivity', 'news', 'communication']
    
    for session_offset in session_times:
        session_time = wake_time + timedelta(seconds=session_offset)
        
        # Skip if too close to sleep time
        if (sleep_time - session_time).total_seconds() < 1800:  # 30 minutes
            continue
        
        # Determine session duration based on time of day
        hour = session_time.hour
        if 9 <= hour <= 17:  # Work hours
            duration = random.randint(60, 300)
            category = random.choice(['productivity', 'communication', 'social'])
        elif 18 <= hour <= 22:  # Evening
            duration = random.randint(120, 600)
            category = random.choice(['entertainment', 'social'])
        else:  # Morning
            duration = random.randint(30, 180)
            category = random.choice(['news', 'social'])
        
        activities.append({
            'user_id': user_id,
            'event_type': 'screen_on',
            'app_category': category,
            'timestamp': session_time.isoformat(),
            'session_duration': duration,
            'charging_status': random.random() < 0.3,  # 30% chance of charging
        })
        
        # Add screen_off event
        activities.append({
            'user_id': user_id,
            'event_type': 'screen_off',
            'app_category': None,
            'timestamp': (session_time + timedelta(seconds=duration)).isoformat(),
            'session_duration': None,
            'charging_status': False,
        })
    
    # Add some charging events
    num_charging = random.randint(1, 3)
    for _ in range(num_charging):
        charge_time = wake_time + timedelta(seconds=random.uniform(0, time_span))
        activities.append({
            'user_id': user_id,
            'event_type': 'charging',
            'app_category': None,
            'timestamp': charge_time.isoformat(),
            'session_duration': None,
            'charging_status': True,
        })
    
    return activities


if __name__ == '__main__':
    # Generate and save dataset
    print("Generating synthetic dataset...")
    df = generate_synthetic_dataset(num_users=300, days_per_user=14)
    
    # Save to CSV
    import os
    output_dir = '../data'
    output_path = os.path.join(output_dir, 'synthetic_dataset.csv')
    
    # Create directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    df.to_csv(output_path, index=False)
    print(f"\nDataset saved to {output_path}")
    print(f"Total records: {len(df)}")
    print(f"Columns: {df.columns.tolist()}")

