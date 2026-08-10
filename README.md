# Non-Invasive Sleep Disorder Detection System

A production-grade end-to-end system for detecting sleep disorders (Insomnia, DSPS, Normal) using smartphone behavioral metadata.

## 🏗️ System Architecture

```
Mobile App (React Native Expo) 
    ↓ REST API
Backend (Node.js + Express)
    ↓ PostgreSQL
    ↓ HTTP/JSON
ML Service (Python + Flask)
```

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.9+
- **PostgreSQL** 14+
- **Expo CLI** (for mobile app)
- **Git**

## 🚀 Quick Start

### 1. Database Setup

```bash
# Create PostgreSQL database
createdb sleep_disorder_db

# Run schema
psql -d sleep_disorder_db -f backend/database/schema.sql
```

### 2. Backend Setup

```bash
cd backend
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env with your database credentials

# Start server
npm start
# or for development
npm run dev
```

Backend will run on `http://localhost:3000`

### 3. ML Service Setup

```bash
cd ml-service

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Generate synthetic dataset
python src/synthetic_dataset.py

# Train the model
python src/train_model.py

# Start inference service
python src/inference.py
```

ML Service will run on `http://localhost:5000`

### 4. Mobile App Setup

```bash
cd mobile-app
npm install

# Configure API URL (optional)
# Edit src/utils/constants.js or set EXPO_PUBLIC_API_URL environment variable

# Start Expo
npx expo start
```

Scan QR code with Expo Go app or press `a` for Android / `i` for iOS simulator.

## 📁 Project Structure

```
CSE_C_14/
├── backend/                 # Node.js API
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── models/         # Database models
│   │   ├── middlewares/    # Auth, validation
│   │   └── utils/          # Helpers
│   ├── database/           # SQL schema
│   └── package.json
│
├── ml-service/              # Python ML service
│   ├── src/
│   │   ├── synthetic_dataset.py  # Dataset generation
│   │   ├── train_model.py        # Model training
│   │   ├── inference.py          # Prediction API
│   │   └── features.py           # Feature engineering
│   ├── data/               # Generated datasets
│   ├── models/             # Trained models
│   └── requirements.txt
│
├── mobile-app/             # React Native Expo
│   ├── src/
│   │   ├── screens/        # App screens
│   │   ├── components/     # Reusable components
│   │   ├── services/       # API clients
│   │   ├── navigation/     # Navigation setup
│   │   └── utils/          # Constants, helpers
│   └── package.json
│
└── README.md
```

## 🔐 Environment Variables

### Backend (.env)

```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sleep_disorder_db
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
ML_SERVICE_URL=http://localhost:5000
CORS_ORIGIN=http://localhost:19006
```

### Mobile App

Set `EXPO_PUBLIC_API_URL` environment variable or edit `src/utils/constants.js`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Activity
- `POST /api/activity/upload` - Upload activity logs
- `GET /api/activity/history` - Get activity history

### Predictions
- `POST /api/prediction/run` - Run prediction (requires activities)
- `GET /api/prediction/latest` - Get latest prediction

### Recommendations
- `GET /api/recommendations` - Get recommendations
- `PATCH /api/recommendations/:id/read` - Mark as read

## 🧠 ML Model Training

### Step 1: Generate Dataset

```bash
cd ml-service
python src/synthetic_dataset.py
```

This generates `data/synthetic_dataset.csv` with:
- 300 users
- 14 days per user
- Labels: normal, insomnia, dsps

### Step 2: Train Model

```bash
python src/train_model.py
```

This will:
- Load and process the dataset
- Extract features for each user
- Train RandomForest classifier
- Save model to `models/sleep_disorder_model_v1.0.0.pkl`

### Step 3: Start Inference Service

```bash
python src/inference.py
```

Model will be loaded automatically on startup.

## 🔄 End-to-End Prediction Flow

1. **User uploads activities** via mobile app
   - Activities stored in PostgreSQL
   
2. **User requests prediction**
   - Backend fetches recent activities (last 7 days)
   - Backend calls ML service `/predict` endpoint
   - ML service extracts features and runs model
   - Returns prediction with probabilities

3. **Backend saves prediction**
   - Stores in `predictions` table
   - Generates recommendations based on prediction
   - Returns result to mobile app

4. **Mobile app displays results**
   - Shows risk meter
   - Displays sleep timeline estimates
   - Shows recommendations

## 📱 Mobile App Features

- **Authentication**: Register/Login with JWT
- **Dashboard**: Overview with latest prediction
- **Upload Activity**: Manual upload or sample data generation
- **Predictions**: View and generate new predictions
- **History**: Activity and prediction history
- **Recommendations**: Personalized suggestions
- **Profile**: User information and logout

## 🧪 Testing the System

### 1. Register a user
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Save the token from response.

### 3. Upload activities
```bash
curl -X POST http://localhost:3000/api/activity/upload \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "activities": [
      {
        "eventType": "screen_on",
        "appCategory": "social",
        "timestamp": "2024-01-15T10:30:00Z",
        "sessionDuration": 120,
        "chargingStatus": false
      }
    ]
  }'
```

### 4. Run prediction
```bash
curl -X POST http://localhost:3000/api/prediction/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"days": 7}'
```

### 5. Get latest prediction
```bash
curl -X GET http://localhost:3000/api/prediction/latest \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔧 Troubleshooting

### Backend won't start
- Check PostgreSQL is running
- Verify database credentials in `.env`
- Ensure database exists

### ML Service errors
- Make sure model is trained (`train_model.py`)
- Check model file exists in `ml-service/models/`
- Verify Python dependencies installed

### Mobile app connection issues
- Verify backend is running on correct port
- Check `API_BASE_URL` in `src/utils/constants.js`
- Ensure CORS is configured correctly

### Prediction fails
- Ensure activities are uploaded first
- Check ML service is running
- Verify activities span at least 1 day

## 📊 Database Schema

See `backend/database/schema.sql` for complete schema.

Key tables:
- `users` - User accounts
- `activity_logs` - Smartphone activity data
- `sleep_sessions` - Sleep session records
- `predictions` - ML predictions
- `recommendations` - Personalized recommendations

## 🎯 ML Features

The model uses 24 features including:
- Temporal: sleep start/end, duration, consistency
- Late night activity: events 11 PM - 4 AM
- Screen usage: unlock frequency, session duration
- App categories: social, entertainment, productivity
- Charging behavior: frequency, timing
- Circadian indicators: activity distribution

## 🚀 Production Deployment

### Backend
- Use PM2 or similar process manager
- Set `NODE_ENV=production`
- Use strong JWT secret
- Enable HTTPS
- Configure proper CORS origins
- Set up database connection pooling

### ML Service
- Use Gunicorn or uWSGI
- Run behind reverse proxy (nginx)
- Enable request timeout
- Monitor model performance

### Mobile App
- Build production bundle
- Configure production API URL
- Enable code signing
- Test on real devices

## 📝 License

This is a production-grade system built for educational and research purposes.

## 👥 Support

For issues or questions, please check:
1. Architecture documentation: `ARCHITECTURE.md`
2. ML Service README: `ml-service/README.md`
3. Database schema: `backend/database/schema.sql`

---

**Built with ❤️ for sleep health awareness**

