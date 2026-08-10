# ML Service - Sleep Disorder Detection

Python-based machine learning service for sleep disorder detection.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Generate synthetic dataset:
```bash
python src/synthetic_dataset.py
```

3. Train the model:
```bash
python src/train_model.py
```

4. Start inference service:
```bash
python src/inference.py
```

## API Endpoints

### Health Check
```
GET /health
```

### Prediction
```
POST /predict
Content-Type: application/json

{
  "activities": [
    {
      "event_type": "screen_on",
      "app_category": "social",
      "timestamp": "2024-01-15T10:30:00",
      "session_duration": 120,
      "charging_status": false
    },
    ...
  ]
}
```

### Model Info
```
GET /model/info
```

## Model Details

- **Algorithm**: RandomForest Classifier
- **Classes**: normal, insomnia, dsps
- **Features**: 24 temporal and behavioral features
- **Output**: Prediction with probabilities and sleep time estimates

