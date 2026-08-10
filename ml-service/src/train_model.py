"""
Training Pipeline for Sleep Disorder Detection Model
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import joblib
import os
import sys

# Add parent directory to path to import features
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from features import extract_features


def load_and_prepare_data(dataset_path: str) -> tuple:
    """
    Load dataset and extract features for each user
    
    Args:
        dataset_path: Path to CSV dataset
        
    Returns:
        X (features), y (labels)
    """
    print(f"Loading dataset from {dataset_path}...")
    df = pd.read_csv(dataset_path)
    
    print(f"Dataset shape: {df.shape}")
    print(f"Label distribution:\n{df['label'].value_counts()}")
    
    # Group by user_id and label, then extract features
    X_list = []
    y_list = []
    
    for user_id in df['user_id'].unique():
        user_activities = df[df['user_id'] == user_id].to_dict('records')
        label = user_activities[0]['label']  # All activities for a user have same label
        
        # Extract features
        features = extract_features(user_activities)
        
        # Convert to list in consistent order
        feature_names = sorted(features.keys())
        feature_vector = [features[name] for name in feature_names]
        
        X_list.append(feature_vector)
        y_list.append(label)
    
    X = np.array(X_list)
    y = np.array(y_list)
    
    print(f"\nExtracted features for {len(X)} users")
    print(f"Feature vector length: {len(feature_names)}")
    print(f"Feature names: {feature_names}")
    
    return X, y, feature_names


def train_model(X, y, feature_names, test_size: float = 0.2, random_state: int = 42):
    """
    Train RandomForest model
    
    Args:
        X: Feature matrix
        y: Labels
        feature_names: List of feature names
        test_size: Proportion of test set
        random_state: Random seed
        
    Returns:
        Trained model, feature names, test results
    """
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )
    
    print(f"\nTraining set: {len(X_train)} samples")
    print(f"Test set: {len(X_test)} samples")
    
    # Train RandomForest
    print("\nTraining RandomForest classifier...")
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=15,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=random_state,
        n_jobs=-1,
        class_weight='balanced'  # Handle class imbalance
    )
    
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"\nModel Accuracy: {accuracy:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    print("\nConfusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    
    # Feature importance
    feature_importance = pd.DataFrame({
        'feature': feature_names,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    print("\nTop 10 Most Important Features:")
    print(feature_importance.head(10))
    
    return model, feature_names, {
        'accuracy': accuracy,
        'classification_report': classification_report(y_test, y_pred, output_dict=True),
        'confusion_matrix': confusion_matrix(y_test, y_pred).tolist(),
    }


def save_model(model, feature_names, accuracy, model_dir: str = '../models', version: str = '1.0.0'):
    """
    Save trained model and metadata
    
    Args:
        model: Trained model
        feature_names: List of feature names
        accuracy: Model accuracy score
        model_dir: Directory to save model
        version: Model version
    """
    os.makedirs(model_dir, exist_ok=True)
    
    model_path = os.path.join(model_dir, f'sleep_disorder_model_v{version}.pkl')
    metadata_path = os.path.join(model_dir, f'model_metadata_v{version}.pkl')
    
    # Save model
    joblib.dump(model, model_path)
    print(f"\nModel saved to {model_path}")
    
    # Save metadata
    metadata = {
        'feature_names': feature_names,
        'version': version,
        'model_type': 'RandomForestClassifier',
        'accuracy': float(accuracy),
    }
    joblib.dump(metadata, metadata_path)
    print(f"Metadata saved to {metadata_path}")
    
    return model_path, metadata_path


if __name__ == '__main__':
    # Paths
    dataset_path = '../data/synthetic_dataset.csv'
    model_dir = '../models'
    
    # Create directories if they don't exist
    os.makedirs(os.path.dirname(dataset_path), exist_ok=True)
    os.makedirs(model_dir, exist_ok=True)
    
    # Check if dataset exists, if not generate it
    if not os.path.exists(dataset_path):
        print("Dataset not found. Generating synthetic dataset...")
        from synthetic_dataset import generate_synthetic_dataset
        df = generate_synthetic_dataset(num_users=300, days_per_user=14)
        df.to_csv(dataset_path, index=False)
        print(f"Dataset saved to {dataset_path}")
    
    # Load and prepare data
    X, y, feature_names = load_and_prepare_data(dataset_path)
    
    # Train model
    model, feature_names, results = train_model(X, y, feature_names)
    
    # Save model
    model_path, metadata_path = save_model(model, feature_names, results['accuracy'], model_dir)
    
    print("\n✅ Training completed successfully!")
    print(f"Model version: 1.0.0")
    print(f"Model accuracy: {results['accuracy']:.4f}")

