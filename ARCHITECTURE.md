# Non-Invasive Sleep Disorder Detection System - Architecture

## System Overview

```
┌─────────────────┐
│  Mobile App     │  React Native Expo
│  (React Native) │
└────────┬─────────┘
         │ HTTPS/REST API
         │ JWT Authentication
         ▼
┌─────────────────┐
│  Backend API    │  Node.js + Express
│  (Node.js)      │  PostgreSQL
└────────┬────────┘
         │ HTTP/JSON
         ▼
┌─────────────────┐
│  ML Service     │  Python
│  (Python)       │  Scikit-learn
└─────────────────┘
```

## Technology Stack

- **Mobile**: React Native (Expo)
- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL
- **ML**: Python 3.9+ (scikit-learn, pandas, numpy)
- **Authentication**: JWT (jsonwebtoken)
- **Security**: bcrypt for password hashing

## Data Flow

1. **Data Collection**: Mobile app captures/simulates smartphone metadata
2. **API Upload**: Activity data sent to backend via REST API
3. **Storage**: PostgreSQL stores user activities and predictions
4. **ML Inference**: Backend calls Python service for predictions
5. **Response**: Results returned to mobile app
6. **Visualization**: Mobile app displays sleep patterns and risk scores

## Folder Structure

```
CSE_C_14/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── activityController.js
│   │   │   ├── predictionController.js
│   │   │   └── recommendationController.js
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.js
│   │   │   └── validationMiddleware.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── ActivityLog.js
│   │   │   ├── SleepSession.js
│   │   │   ├── Prediction.js
│   │   │   └── Recommendation.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── activityRoutes.js
│   │   │   ├── predictionRoutes.js
│   │   │   └── recommendationRoutes.js
│   │   ├── services/
│   │   │   ├── mlService.js
│   │   │   └── predictionService.js
│   │   ├── utils/
│   │   │   ├── logger.js
│   │   │   └── errors.js
│   │   └── app.js
│   ├── database/
│   │   ├── schema.sql
│   │   └── migrations/
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── ml-service/
│   ├── data/
│   │   └── .gitkeep
│   ├── models/
│   │   └── .gitkeep
│   ├── src/
│   │   ├── synthetic_dataset.py
│   │   ├── train_model.py
│   │   ├── inference.py
│   │   └── features.py
│   ├── requirements.txt
│   └── README.md
│
├── mobile-app/
│   ├── src/
│   │   ├── screens/
│   │   │   ├── AuthScreen.js
│   │   │   ├── RegisterScreen.js
│   │   │   ├── DashboardScreen.js
│   │   │   ├── ActivityUploadScreen.js
│   │   │   ├── PredictionScreen.js
│   │   │   ├── HistoryScreen.js
│   │   │   ├── RecommendationsScreen.js
│   │   │   └── ProfileScreen.js
│   │   ├── components/
│   │   │   ├── SleepGraph.js
│   │   │   ├── RiskMeter.js
│   │   │   └── ActivityCard.js
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── auth.js
│   │   ├── navigation/
│   │   │   └── AppNavigator.js
│   │   ├── utils/
│   │   │   └── constants.js
│   │   └── App.js
│   ├── app.json
│   ├── package.json
│   └── .env.example
│
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Activity
- `POST /api/activity/upload` - Upload activity logs
- `GET /api/activity/history` - Get activity history

### Predictions
- `POST /api/prediction/run` - Run prediction on activity data
- `GET /api/prediction/latest` - Get latest prediction

### Recommendations
- `GET /api/recommendations` - Get personalized recommendations

## ML Model Features

1. **Temporal Features**:
   - Sleep start time
   - Sleep end time
   - Sleep duration
   - Late night activity (11 PM - 4 AM)

2. **Usage Patterns**:
   - Screen unlock frequency
   - Average session duration
   - App category usage (social, entertainment, etc.)
   - Charging behavior

3. **Circadian Indicators**:
   - Activity distribution across 24 hours
   - Peak activity times
   - Sleep consistency

## Security

- JWT tokens for authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Environment variables for secrets
- CORS configuration
- Rate limiting (recommended for production)

