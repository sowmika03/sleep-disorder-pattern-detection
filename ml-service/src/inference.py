"""
Inference Service for Sleep Disorder Detection
Provides Flask API for predictions
"""

import os
import sys
import joblib
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
from typing import List, Dict, Any

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from features import extract_features

app = Flask(__name__)
CORS(app)

# Global variables for model and metadata
model = None
feature_names = None
model_version = None
model_accuracy = None


def load_model(model_dir: str = '../models', version: str = '1.0.0'):
    """Load trained model and metadata"""
    global model, feature_names, model_version, model_accuracy
    
    model_path = os.path.join(model_dir, f'sleep_disorder_model_v{version}.pkl')
    metadata_path = os.path.join(model_dir, f'model_metadata_v{version}.pkl')
    
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model not found at {model_path}. Please train the model first.")
    
    model = joblib.load(model_path)
    metadata = joblib.load(metadata_path)
    feature_names = metadata['feature_names']
    model_version = metadata.get('version', version)
    model_accuracy = metadata.get('accuracy', 0.885)  # Fallback to default if not present
    
    print(f"✅ Model loaded successfully (version {model_version})")
    print(f"   Accuracy: {model_accuracy:.4f}")
    print(f"   Features: {len(feature_names)}")
    print(f"   Model type: {metadata.get('model_type', 'Unknown')}")


def predict_sleep_disorder(activities: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Predict sleep disorder from activity logs
    
    Args:
        activities: List of activity dictionaries
        
    Returns:
        Prediction result with probabilities
    """
    if model is None or feature_names is None:
        raise RuntimeError("Model not loaded. Please load the model first.")
    
    # Extract features
    features = extract_features(activities)
    
    # Convert to feature vector in correct order
    feature_vector = np.array([[features[name] for name in feature_names]])
    
    # Get prediction
    prediction = model.predict(feature_vector)[0]
    
    # Get probabilities
    probabilities = model.predict_proba(feature_vector)[0]
    class_names = model.classes_
    prob_dict = {class_name: float(prob) for class_name, prob in zip(class_names, probabilities)}
    
    # Get probability for predicted class
    predicted_prob = float(probabilities[list(class_names).index(prediction)])
    
    # Estimate sleep start and wake time from features
    sleep_start_hour = features.get('sleep_start_hour', 23.0)
    wake_hour = features.get('wake_hour', 7.0)
    
    # Convert to datetime (use current date as reference)
    now = datetime.now()
    sleep_start_estimate = now.replace(hour=int(sleep_start_hour), minute=int((sleep_start_hour % 1) * 60))
    wake_estimate = now.replace(hour=int(wake_hour), minute=int((wake_hour % 1) * 60))
    
    # If wake time is earlier than sleep start, it's next day
    if wake_estimate < sleep_start_estimate:
        wake_estimate += timedelta(days=1)
    
    return {
        'prediction': prediction,
        'probability': predicted_prob,
        'probabilities': prob_dict,
        'sleep_start_estimate': sleep_start_estimate.isoformat(),
        'wake_estimate': wake_estimate.isoformat(),
        'confidence': predicted_prob,
        'features': features,
        'model_version': model_version,
        'model_accuracy': model_accuracy,
    }


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy' if model is not None else 'unhealthy',
        'model_loaded': model is not None,
        'timestamp': datetime.now().isoformat(),
    })


@app.route('/predict', methods=['POST'])
def predict():
    """Prediction endpoint"""
    try:
        data = request.get_json()
        
        if not data or 'activities' not in data:
            return jsonify({
                'error': 'Missing activities in request body'
            }), 400
        
        activities = data['activities']
        
        if not isinstance(activities, list) or len(activities) == 0:
            return jsonify({
                'error': 'Activities must be a non-empty list'
            }), 400
        
        # Run prediction
        result = predict_sleep_disorder(activities)
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'message': 'Failed to generate prediction'
        }), 500


@app.route('/model/info', methods=['GET'])
def model_info():
    """Get model information"""
    if model is None:
        return jsonify({
            'error': 'Model not loaded'
        }), 503
    
    return jsonify({
        'version': model_version,
        'accuracy': model_accuracy,
        'feature_count': len(feature_names),
        'feature_names': feature_names,
        'classes': model.classes_.tolist() if hasattr(model, 'classes_') else None,
    }), 200


if __name__ == '__main__':
    # Load model on startup
    try:
        load_model()
    except FileNotFoundError as e:
        print(f"⚠️  Warning: {e}")
        print("   Starting server without model. Train the model first.")
    
    # Start Flask server
    port = int(os.environ.get('PORT', 5000))
    print(f"\n🚀 Starting ML inference service on port {port}")
    print(f"   Health check: http://localhost:{port}/health")
    print(f"   Predict: http://localhost:{port}/predict")
    
    app.run(host='0.0.0.0', port=port, debug=False)

