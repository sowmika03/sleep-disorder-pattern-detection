# 💤 Non-Invasive Sleep Disorder Detection System

An end-to-end machine learning application that analyzes **smartphone behavioral metadata** to identify patterns associated with **Normal Sleep, Insomnia, and Delayed Sleep Phase Syndrome (DSPS)**.

The system uses smartphone activity patterns such as screen usage, late-night activity, app usage, charging behavior, and activity timing to generate a sleep-disorder risk prediction.

> **Note:** This project is intended as a screening and sleep-awareness system for educational/research purposes. It is **not a medical diagnostic tool**.

---

## 📌 Overview

Sleep disorders are increasingly associated with irregular sleep schedules, excessive nighttime smartphone usage, and changing digital habits.

Traditional sleep assessment methods such as polysomnography (PSG) can require specialized equipment and clinical environments. This project explores a **non-invasive alternative** by analyzing behavioral metadata collected from smartphone activity.

The application combines:

* 📱 React Native mobile application
* 🌐 Node.js + Express REST API
* 🗄️ PostgreSQL database
* 🧠 Python machine learning service
* 🤖 Random Forest classification model
* 🔐 JWT-based authentication

The system processes user activity data, extracts behavioral features, sends them to the ML service, and displays the predicted sleep pattern through the mobile application.

---

## 🏗️ System Architecture

```text
┌─────────────────────────────┐
│     React Native / Expo     │
│        Mobile App           │
└──────────────┬──────────────┘
               │ REST API
               ▼
┌─────────────────────────────┐
│     Node.js + Express       │
│        Backend API          │
└───────┬─────────────┬───────┘
        │             │
        │             │ HTTP / JSON
        ▼             ▼
┌──────────────┐   ┌──────────────────────┐
│ PostgreSQL   │   │ Python + Flask       │
│   Database   │   │ ML Prediction Service│
└──────────────┘   └──────────┬───────────┘
                              │
                              ▼
                     ┌─────────────────┐
                     │ Random Forest   │
                     │ Classification  │
                     └─────────────────┘
```

### Architecture Flow

**Mobile App → REST API → Backend → PostgreSQL**

The backend retrieves recent activity data and communicates with the ML service:

**Backend → ML Service → Feature Extraction → Random Forest → Prediction**

The prediction is returned to the backend, stored in PostgreSQL, and displayed in the mobile application.

---

## ✨ Key Features

### 📱 Mobile Application

* User registration and login
* JWT-based authentication
* Activity data upload
* Sample activity data generation
* Sleep-disorder prediction
* Prediction history
* Activity history
* Risk visualization
* Sleep timeline information
* Personalized recommendations
* User profile management

### 🌐 Backend

* RESTful API architecture
* Authentication and authorization
* Activity data management
* Prediction management
* Recommendation management
* PostgreSQL integration
* ML-service communication
* Request validation and middleware

### 🧠 Machine Learning

* Behavioral feature extraction
* 24 smartphone-usage features
* Random Forest classification
* Multi-class prediction:

  * Normal
  * Insomnia
  * DSPS
* Prediction probabilities
* Model persistence using Python serialization

---

## 🛠️ Technology Stack

| Layer             | Technologies         |
| ----------------- | -------------------- |
| Mobile            | React Native, Expo   |
| Frontend          | JavaScript           |
| Backend           | Node.js, Express.js  |
| Database          | PostgreSQL           |
| Machine Learning  | Python, Scikit-learn |
| ML API            | Flask                |
| Authentication    | JWT                  |
| API Communication | REST, HTTP/JSON      |
| Version Control   | Git, GitHub          |

---

## 📊 Dataset

The machine learning component was developed using a dataset containing approximately **142,021 smartphone behavioral records**.

The dataset contains behavioral information that can be transformed into features related to:

* Screen activity
* Screen on/off events
* Late-night smartphone usage
* App-category usage
* Session duration
* Charging behavior
* Activity timing
* Sleep-related behavioral patterns

The raw dataset is **not included in this repository**.

Instead, the repository includes a synthetic-data generation workflow for development and testing.

### Dataset Generation

The project can generate a synthetic dataset using:

```bash
cd ml-service
python src/synthetic_dataset.py
```

The generated development dataset contains:

* 300 simulated users
* 14 days of activity per user
* Sleep-pattern labels:

  * Normal
  * Insomnia
  * DSPS

This allows the complete ML pipeline to be tested without exposing the original dataset.

---

## 🧠 Machine Learning Model

The project uses a **Random Forest Classifier** to classify sleep-related behavioral patterns.

### Feature Engineering

The model uses **24 behavioral features**, including:

#### Temporal Features

* Sleep start time
* Sleep end time
* Sleep duration
* Sleep consistency
* Activity distribution

#### Late-Night Activity

* Activity between 11 PM and 4 AM
* Number of late-night events
* Late-night screen usage

#### Screen Usage

* Screen session duration
* Screen/unlock frequency
* Number of active sessions

#### Application Usage

* Social media usage
* Entertainment usage
* Productivity usage
* Other application categories

#### Charging Behavior

* Charging frequency
* Charging timing
* Nighttime charging behavior

#### Circadian Indicators

* Daily activity distribution
* Night/day activity ratio
* Irregular activity patterns

---

## 🔄 End-to-End Workflow

```text
1. User opens mobile application
                ↓
2. User authenticates
                ↓
3. Smartphone activity data is collected/uploaded
                ↓
4. Backend validates and stores activity data
                ↓
5. User requests a prediction
                ↓
6. Backend retrieves recent activity
                ↓
7. Backend sends data to ML service
                ↓
8. ML service extracts behavioral features
                ↓
9. Random Forest model generates prediction
                ↓
10. Prediction probabilities returned
                ↓
11. Backend stores prediction in PostgreSQL
                ↓
12. Recommendations are generated
                ↓
13. Mobile application displays the result
```

---

## 📁 Project Structure

```text
CSE_C_14/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── models/
│   │   ├── middlewares/
│   │   └── utils/
│   │
│   ├── database/
│   │   └── schema.sql
│   │
│   └── package.json
│
├── ml-service/
│   ├── src/
│   │   ├── synthetic_dataset.py
│   │   ├── train_model.py
│   │   ├── inference.py
│   │   └── features.py
│   │
│   ├── data/
│   ├── models/
│   └── requirements.txt
│
├── mobile-app/
│   ├── src/
│   │   ├── screens/
│   │   ├── components/
│   │   ├── services/
│   │   ├── navigation/
│   │   └── utils/
│   │
│   └── package.json
│
├── ARCHITECTURE.md
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

Install the following before running the project:

* **Node.js 18+**
* **npm**
* **Python 3.9+**
* **PostgreSQL 14+**
* **Expo**
* **Git**

---

## 1. Clone the Repository

```bash
git clone https://github.com/sowmika03/sleep-disorder-pattern-detection.git
cd sleep-disorder-pattern-detection
```

---

## 2. Database Setup

Create the PostgreSQL database:

```bash
createdb sleep_disorder_db
```

Run the database schema:

```bash
psql -d sleep_disorder_db -f backend/database/schema.sql
```

Alternatively, create the database using **pgAdmin** and execute:

```text
backend/database/schema.sql
```

---

## 3. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file using `.env.example`:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=sleep_disorder_db
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

ML_SERVICE_URL=http://localhost:5000
CORS_ORIGIN=http://localhost:19006
```

Start the backend:

```bash
npm start
```

For development:

```bash
npm run dev
```

Backend:

```text
http://localhost:3000
```

---

## 4. ML Service Setup

Open another terminal:

```bash
cd ml-service
```

Create a virtual environment:

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

### macOS/Linux

```bash
python -m venv venv
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Generate the development dataset:

```bash
python src/synthetic_dataset.py
```

Train the model:

```bash
python src/train_model.py
```

Start the ML inference service:

```bash
python src/inference.py
```

ML service:

```text
http://localhost:5000
```

---

## 5. Mobile Application Setup

Open another terminal:

```bash
cd mobile-app
npm install
```

Configure the backend API URL in:

```text
src/utils/constants.js
```

or use the appropriate Expo environment variable:

```text
EXPO_PUBLIC_API_URL
```

Start Expo:

```bash
npx expo start
```

You can then:

* Scan the QR code using **Expo Go**
* Press `a` to launch Android
* Press `i` to launch the iOS simulator

---

# 🔐 Environment Variables

### Backend

```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sleep_disorder_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
ML_SERVICE_URL=http://localhost:5000
CORS_ORIGIN=http://localhost:19006
```

### Mobile Application

Configure:

```text
EXPO_PUBLIC_API_URL
```

with the URL of the running backend.

> **Security:** Never commit real passwords, JWT secrets, API keys, or other credentials to GitHub.

---

# 📡 API Endpoints

## Authentication

| Method | Endpoint             | Description         |
| ------ | -------------------- | ------------------- |
| POST   | `/api/auth/register` | Register a new user |
| POST   | `/api/auth/login`    | Authenticate user   |

## Activity

| Method | Endpoint                | Description               |
| ------ | ----------------------- | ------------------------- |
| POST   | `/api/activity/upload`  | Upload activity logs      |
| GET    | `/api/activity/history` | Retrieve activity history |

## Predictions

| Method | Endpoint                 | Description                |
| ------ | ------------------------ | -------------------------- |
| POST   | `/api/prediction/run`    | Generate a prediction      |
| GET    | `/api/prediction/latest` | Retrieve latest prediction |

## Recommendations

| Method | Endpoint                        | Description                 |
| ------ | ------------------------------- | --------------------------- |
| GET    | `/api/recommendations`          | Retrieve recommendations    |
| PATCH  | `/api/recommendations/:id/read` | Mark recommendation as read |

---

# 🧪 Testing the API

### Register

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

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Use the returned JWT token for authenticated requests.

### Upload Activity

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

### Run Prediction

```bash
curl -X POST http://localhost:3000/api/prediction/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"days": 7}'
```

### Get Latest Prediction

```bash
curl -X GET http://localhost:3000/api/prediction/latest \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

# 📱 Application Screenshots

Screenshots will be added here to demonstrate the major application workflows.

### Authentication

*Add login and registration screenshots here.*

### Dashboard

*Add dashboard screenshot here.*

### Activity Upload

*Add activity upload screenshot here.*

### Prediction

*Add prediction result screenshot here.*

### Recommendations

*Add recommendation screenshot here.*

Example:

```markdown
![Login Screen](screenshots/login.png)
![Dashboard](screenshots/dashboard.png)
![Prediction Result](screenshots/prediction.png)
```

---

# 📈 Results

The machine learning pipeline evaluates the classification model using metrics such as:

* Classification Accuracy
* Confusion Matrix
* F1-Score
* Class-wise prediction performance

The current dataset/model configuration achieved approximately **80.4% classification accuracy**.

The confusion matrix is used to analyze how effectively the model distinguishes between:

* Normal
* Insomnia
* DSPS

> Model performance depends on the dataset, feature engineering, training configuration, and data quality.

---

# 🗄️ Database

The application uses PostgreSQL to store application and activity data.

### Main Tables

* `users` — User accounts and authentication information
* `activity_logs` — Smartphone behavioral activity
* `sleep_sessions` — Sleep-related session information
* `predictions` — Machine learning predictions
* `recommendations` — Generated recommendations

Database schema:

```text
backend/database/schema.sql
```

---

# 🔧 Troubleshooting

### Backend does not start

Check:

* PostgreSQL is running
* Database exists
* `.env` credentials are correct
* Port `3000` is available

### ML Service fails

Check:

* Python virtual environment is activated
* Dependencies are installed
* Model has been trained
* Model file exists in `ml-service/models/`

### Mobile application cannot connect

Check:

* Backend is running
* Correct API URL is configured
* Mobile device and computer can communicate over the network
* Firewall/network settings are not blocking the backend

### Prediction fails

Check:

* Activity data has been uploaded
* ML service is running
* Required features are available
* The model has been trained successfully

---

# 🔮 Future Enhancements

* Automatic smartphone usage-data collection
* Real-time screen-time integration
* Improved feature engineering
* Larger and more diverse datasets
* Model comparison with LSTM/deep-learning approaches
* Personalized sleep analytics
* Cloud deployment
* Automated model monitoring
* Improved prediction explainability

---

# ⚠️ Limitations

* Smartphone behavioral data cannot replace clinical sleep studies.
* The system is designed for screening and awareness, not medical diagnosis.
* Model performance depends on the quality and representativeness of the training data.
* Automatic smartphone data collection may vary across operating systems and device permissions.
* Clinical validation would be required before considering real-world medical use.

---

# 📚 Documentation

Additional project documentation:

* [`ARCHITECTURE.md`](ARCHITECTURE.md)
* [`ml-service/README.md`](ml-service/README.md)
* [`backend/database/schema.sql`](backend/database/schema.sql)

---

# 🚀 Production Considerations

For a production deployment, the system could be enhanced with:

### Backend

* PM2 or another process manager
* HTTPS
* Secure secret management
* Production CORS configuration
* Database connection pooling
* Logging and monitoring

### ML Service

* Gunicorn
* Reverse proxy
* Request timeouts
* Model versioning
* Performance monitoring

### Mobile Application

* Production API configuration
* Application signing
* Production builds
* Device testing
* Secure storage for authentication tokens

---

# 🎯 Project Highlights

* Built a complete **end-to-end ML application**
* Implemented **REST API communication** between application layers
* Developed a **Python/Flask machine learning service**
* Integrated a **Random Forest classification model**
* Designed a **PostgreSQL-backed backend**
* Implemented **JWT authentication**
* Developed a **React Native mobile interface**
* Engineered **24 smartphone behavioral features**
* Created an architecture connecting mobile, backend, database, and ML services

---

# 👩‍💻 Author

**Sai Jahnavi**

Computer Science and Engineering Graduate

---

## 📄 License

This project was developed for **educational and research purposes**.

---

⭐ If you find this project useful, consider giving the repository a star.

**Built with ❤️ for sleep health awareness and machine learning research.**
