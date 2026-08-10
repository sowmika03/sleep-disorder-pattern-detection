# Troubleshooting Guide

## Registration "Failed to create account" Error

### Common Causes:

1. **Backend Server Not Running**
   - Make sure backend is running: `cd backend && npm start`
   - Check if server is on port 3000: http://localhost:3000/health

2. **Database Connection Issue**
   - Verify PostgreSQL is running
   - Check database credentials in `backend/.env`
   - Ensure database exists: `psql -l | grep sleep_disorder_db`

3. **API URL Configuration**
   - **Physical Device**: Cannot use `localhost`
   - Use your computer's IP address instead
   - Find IP: 
     - Windows: `ipconfig` (look for IPv4 Address)
     - Mac/Linux: `ifconfig` or `ip addr`
   - Update `mobile-app/src/utils/constants.js`:
     ```javascript
     export const API_BASE_URL = 'http://YOUR_IP_ADDRESS:3000'
     ```
   - Example: `http://192.168.1.100:3000`

4. **Network/Firewall**
   - Ensure mobile device and computer are on same network
   - Check firewall allows port 3000
   - Try disabling firewall temporarily to test

5. **CORS Issues**
   - Check `backend/.env` has correct `CORS_ORIGIN`
   - For Expo: `CORS_ORIGIN=http://localhost:19006`

### Debugging Steps:

1. **Check Backend Logs**
   - Look at backend console for error messages
   - Check for database connection errors

2. **Check Mobile App Console**
   - Open Expo DevTools
   - Look for network errors in console
   - Check error.response.data for details

3. **Test API Directly**
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "password123"
     }'
   ```

4. **Verify Database Schema**
   ```bash
   psql -d sleep_disorder_db -c "\d users"
   ```

### Quick Fix Checklist:

- [ ] Backend server running on port 3000
- [ ] PostgreSQL running and database exists
- [ ] Database credentials correct in `.env`
- [ ] API URL uses IP address (not localhost) for physical device
- [ ] Mobile device and computer on same network
- [ ] Firewall allows port 3000
- [ ] Check backend console for errors
- [ ] Check mobile app console for network errors

