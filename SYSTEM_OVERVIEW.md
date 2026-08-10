# System Overview - Sleep Disorder Detection

## 🎯 Purpose

Detect probability of sleep disorders (Insomnia, DSPS, Normal) using smartphone behavioral metadata without invasive sensors.

## 🏗️ Architecture Components

### 1. Mobile App (React Native Expo)
- **Purpose**: User interface for data collection and visualization
- **Tech**: React Native, Expo, React Navigation
- **Features**:
  - User authentication
  - Activity data upload (simulated metadata)
  - Prediction requests
  - Results visualization (risk meter, sleep graph)
  - Recommendations display
  - History tracking

### 2. Backend API (Node.js + Express)
- **Purpose**: Business logic, data persistence, ML service integration
- **Tech**: Node.js, Express, PostgreSQL, JWT
- **Responsibilities**:
  - User authentication & authorization
  - Activity data storage
  - Prediction orchestration
  - Recommendation generation
  - API security & validation

### 3. ML Service (Python + Flask)
- **Purpose**: Machine learning inference
- **Tech**: Python, Flask, scikit-learn, pandas
- **Components**:
  - Feature extraction from activities
  - Model inference (RandomForest)
  - Sleep time estimation
  - Probability calculation

### 4. Database (PostgreSQL)
- **Purpose**: Persistent data storage
- **Tables**:
  - `users`: User accounts
  - `activity_logs`: Smartphone activity data
  - `sleep_sessions`: Sleep session records
  - `predictions`: ML prediction results
  - `recommendations`: Personalized suggestions

## 🔄 Data Flow

```
1. User Action (Mobile)
   ↓
2. Activity Upload → Backend API
   ↓
3. Store in PostgreSQL
   ↓
4. User Requests Prediction
   ↓
5. Backend Fetches Activities
   ↓
6. Backend Calls ML Service
   ↓
7. ML Service Extracts Features
   ↓
8. ML Model Predicts
   ↓
9. Backend Saves Prediction
   ↓
10. Backend Generates Recommendations
   ↓
11. Results Returned to Mobile
   ↓
12. User Views Results
```

## 📊 ML Model Details

### Features (24 total)
1. **Temporal Features** (4)
   - Sleep start hour
   - Wake hour
   - Sleep duration
   - Sleep consistency

2. **Late Night Activity** (3)
   - Late night events count
   - Late night screen time
   - Late night activity ratio

3. **Screen Usage** (4)
   - Total screen ons
   - Average session duration
   - Max session duration
   - Unlock frequency

4. **App Categories** (3)
   - Social app usage
   - Entertainment app usage
   - Productivity app usage

5. **Charging Behavior** (2)
   - Charging during night
   - Charging frequency

6. **Activity Distribution** (2)
   - Peak activity hour
   - Activity variance

7. **Circadian Indicators** (4)
   - Morning activity
   - Afternoon activity
   - Evening activity
   - Night activity

8. **Sleep Quality** (2)
   - Interruptions
   - Sleep fragmentation

### Model Type
- **Algorithm**: RandomForest Classifier
- **Classes**: normal, insomnia, dsps
- **Training**: 300 synthetic users, 14 days each
- **Accuracy**: ~85-90% (varies with dataset)

## 🔐 Security Features

1. **Authentication**
   - JWT tokens
   - Password hashing (bcrypt)
   - Token expiration

2. **API Security**
   - Input validation
   - SQL injection prevention (parameterized queries)
   - CORS configuration
   - Error handling

3. **Data Protection**
   - Environment variables for secrets
   - No sensitive data in logs
   - Secure password storage

## 📱 Mobile App Screens

1. **Auth Screen**: Login
2. **Register Screen**: User registration
3. **Dashboard**: Overview, latest prediction
4. **Upload Activity**: Manual/sample data upload
5. **Predictions**: View and generate predictions
6. **History**: Activity and prediction history
7. **Recommendations**: Personalized suggestions
8. **Profile**: User info and logout

## 🧪 Testing Strategy

### Unit Testing (Recommended)
- Feature extraction functions
- Model prediction logic
- API endpoint handlers

### Integration Testing
- End-to-end prediction flow
- Database operations
- ML service communication

### Manual Testing
- Mobile app workflows
- API endpoints via Postman/curl
- ML service via direct calls

## 📈 Performance Considerations

### Backend
- Database connection pooling
- Async/await for I/O operations
- Request timeout handling
- Error logging

### ML Service
- Model loaded once at startup
- Efficient feature extraction
- Fast inference (< 100ms)

### Mobile App
- Optimistic UI updates
- Caching where appropriate
- Efficient re-renders

## 🚀 Scalability

### Horizontal Scaling
- Backend: Stateless, can run multiple instances
- ML Service: Can run multiple instances behind load balancer
- Database: Read replicas for queries

### Vertical Scaling
- Increase database resources
- More ML service instances
- Larger connection pools

### Caching (Future)
- Redis for session storage
- Cache prediction results
- Cache recommendations

## 🔮 Future Enhancements

1. **Real-time Data Collection**
   - Background service for automatic activity tracking
   - Integration with device sensors

2. **Advanced ML**
   - Deep learning models
   - Time series analysis
   - Personalization

3. **Additional Features**
   - Sleep diary integration
   - Medication tracking
   - Progress tracking over time
   - Export reports

4. **Notifications**
   - Push notifications for recommendations
   - Sleep reminders
   - Prediction updates

## 📚 Key Files Reference

- **Architecture**: `ARCHITECTURE.md`
- **Setup**: `SETUP_GUIDE.md`
- **Quick Start**: `QUICK_START.md`
- **Database Schema**: `backend/database/schema.sql`
- **ML Training**: `ml-service/src/train_model.py`
- **ML Inference**: `ml-service/src/inference.py`
- **Backend Entry**: `backend/server.js`
- **Mobile Entry**: `mobile-app/src/App.js`

## 🎓 Learning Resources

- React Native: https://reactnative.dev/
- Express.js: https://expressjs.com/
- PostgreSQL: https://www.postgresql.org/docs/
- scikit-learn: https://scikit-learn.org/
- Expo: https://docs.expo.dev/

---

**System Status**: ✅ Production-ready architecture
**Last Updated**: 2024

