import sys
import os
import pandas as pd
from datetime import datetime

# Add src to path
sys.path.append('c:/CSE_C_14/ml-service/src')
from features import extract_features

# Sample activities
activities = [
    {
        'event_type': 'screen_on',
        'app_category': 'social',
        'timestamp': '2024-03-09T10:00:00Z',
        'session_duration': 120,
        'charging_status': False
    },
    {
        'event_type': 'screen_off',
        'app_category': None,
        'timestamp': '2024-03-09T10:02:00Z',
        'session_duration': None,
        'charging_status': False
    }
]

try:
    print("Testing extract_features with sample data...")
    features = extract_features(activities)
    print("Successfully extracted features!")
    
    # Load model and feature names
    import joblib
    import numpy as np
    model = joblib.load('models/sleep_disorder_model_v1.0.0.pkl')
    metadata = joblib.load('models/model_metadata_v1.0.0.pkl')
    feature_names = metadata['feature_names']
    
    # Prepare feature vector
    feature_vector = np.array([[features[name] for name in feature_names]])
    print(f"Feature vector shape: {feature_vector.shape}")
    
    # Check for NaN values in vector
    if np.isnan(feature_vector).any():
        print("Warning: Feature vector contains NaN values")
    
    # Run prediction
    print("Attempting prediction...")
    prediction = model.predict(feature_vector)[0]
    print(f"Prediction result: {prediction}")
    
except Exception as e:
    import traceback
    print(f"An error occurred: {e}")
    traceback.print_exc()
