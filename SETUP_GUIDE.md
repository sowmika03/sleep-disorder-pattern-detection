# Detailed Setup Guide

## Prerequisites Installation

### Windows

1. **Node.js**: Download from https://nodejs.org/
2. **Python**: Download from https://www.python.org/downloads/
3. **PostgreSQL**: Download from https://www.postgresql.org/download/windows/
4. **Expo CLI**: `npm install -g expo-cli`

### macOS

```bash
# Install Homebrew if not installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node

# Install Python
brew install python

# Install PostgreSQL
brew install postgresql
brew services start postgresql

# Install Expo CLI
npm install -g expo-cli
```

### Linux (Ubuntu/Debian)

```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Python
sudo apt-get install python3 python3-pip python3-venv

# PostgreSQL
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql

# Expo CLI
sudo npm install -g expo-cli
```

## Step-by-Step Setup

### 1. Clone and Navigate

```bash
cd CSE_C_14
```

### 2. Database Setup

```bash
# Create database
createdb sleep_disorder_db

# Or using psql
psql -U postgres
CREATE DATABASE sleep_disorder_db;
\q

# Run schema
psql -U postgres -d sleep_disorder_db -f backend/database/schema.sql
```

### 3. Backend Configuration

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sleep_disorder_db
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=change-this-to-a-random-secret-key-in-production
JWT_EXPIRES_IN=7d
ML_SERVICE_URL=http://localhost:5000
ML_SERVICE_TIMEOUT=30000
CORS_ORIGIN=http://localhost:19006
EOF

# Create logs directory
mkdir -p logs

# Start server
npm start
```

Verify: Open http://localhost:3000/health

### 4. ML Service Configuration

```bash
cd ml-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create directories
mkdir -p data models logs

# Generate dataset
python src/synthetic_dataset.py

# Train model
python src/train_model.py

# Start inference service (in a new terminal)
python src/inference.py
```

Verify: Open http://localhost:5000/health

### 5. Mobile App Configuration

```bash
cd mobile-app

# Install dependencies
npm install

# Start Expo
npx expo start
```

## Running All Services

You need 3 terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - ML Service:**
```bash
cd ml-service
source venv/bin/activate  # or venv\Scripts\activate on Windows
python src/inference.py
```

**Terminal 3 - Mobile App:**
```bash
cd mobile-app
npx expo start
```

## Verification Checklist

- [ ] PostgreSQL database created and schema loaded
- [ ] Backend server running on port 3000
- [ ] ML service running on port 5000
- [ ] Model trained and saved
- [ ] Mobile app starts without errors
- [ ] Can register/login via mobile app
- [ ] Can upload activities
- [ ] Can generate predictions

## Common Issues

### Port Already in Use

```bash
# Find process using port
# Windows:
netstat -ano | findstr :3000
# macOS/Linux:
lsof -i :3000

# Kill process (replace PID)
# Windows:
taskkill /PID <PID> /F
# macOS/Linux:
kill -9 <PID>
```

### Database Connection Error

- Verify PostgreSQL is running
- Check credentials in `.env`
- Ensure database exists: `psql -l | grep sleep_disorder_db`

### ML Service Model Not Found

- Run `python src/train_model.py` first
- Check `ml-service/models/` directory has `.pkl` files

### Mobile App Can't Connect

- Verify backend URL in `src/utils/constants.js`
- Check backend is running
- Verify CORS settings in backend

## Next Steps

1. Register a user in the mobile app
2. Generate sample activities
3. Upload activities
4. Run prediction
5. View results and recommendations

