# Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Prerequisites Check
```bash
# Check Node.js
node --version  # Should be 18+

# Check Python
python --version  # Should be 3.9+

# Check PostgreSQL
psql --version  # Should be 14+
```

### 1. Database (30 seconds)
```bash
createdb sleep_disorder_db
psql -d sleep_disorder_db -f backend/database/schema.sql
```

### 2. Backend (1 minute)
```bash
cd backend
npm install
# Create .env file (copy from .env.example and update DB credentials)
npm start
```

### 3. ML Service (2 minutes)
```bash
cd ml-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python src/synthetic_dataset.py
python src/train_model.py
python src/inference.py
```

### 4. Mobile App (1 minute)
```bash
cd mobile-app
npm install
npx expo start
```

## ✅ Test It Works

1. Open mobile app
2. Register: `test@example.com` / `password123`
3. Go to "Upload Activity" → "Generate Sample Data"
4. Upload activities
5. Go to "Predictions" → "Generate New Prediction"
6. View results!

## 🐛 Quick Fixes

**Backend won't start?**
- Check PostgreSQL is running: `pg_isready`
- Verify `.env` has correct DB credentials

**ML Service error?**
- Make sure you ran `train_model.py` first
- Check `ml-service/models/` has `.pkl` files

**Mobile app can't connect?**
- Verify backend is on port 3000
- Check `src/utils/constants.js` API URL

## 📞 Need Help?

See `SETUP_GUIDE.md` for detailed instructions.

